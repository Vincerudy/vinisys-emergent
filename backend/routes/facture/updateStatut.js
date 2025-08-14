const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/factures/statut/:id/:societe_id/:user_id', async (req, res) => {
    const { statut } = req.body;
    const { id, societe_id, user_id } = req.params;

    const validStatuts = ['payée', 'impayée', 'en retard', 'accepté', 'en attente', 'FACT', 'DEVI'];
    if (!statut || !validStatuts.includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Mise à jour du statut ou type_fact
        const [result] = await connection.query(
            `UPDATE factures
             ${statut === 'FACT' || statut === 'DEVI' ? 'SET type_fact = ?' : 'SET statut = ?'}
             ${statut === 'FACT' ? ", statut = 'impayée'" : ''}
             WHERE id = ? AND societe_id = ?`,
            [statut, id, societe_id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Aucune facture trouvée ou mise à jour.');
        }

        // 2. Vérifier la politique de déduction du stock
        const [[stockSetting]] = await connection.query(
            `SELECT stockDeductionTrigger FROM societe_parametrage_facturation WHERE societe_id = ?`,
            [societe_id]
        );

        let stockProcessed = false;
        let stockInsuffisant = false;
        let produitsInsuffisants = [];
        let produitsAssocies = [];

        if (stockSetting && ['invoice_created', 'quote_accepted'].includes(stockSetting.stockDeductionTrigger)) {
            stockProcessed = true;

            // 3. Produits à traiter (stock non encore mis à jour)
            [produitsAssocies] = await connection.query(
                `SELECT id, id_prod_serv, quantite FROM produits 
                 WHERE facture_id = ? AND id_prod_serv IS NOT NULL AND stat_stock IS NULL`,
                [id]
            );

            for (const produit of produitsAssocies) {
                const [[stockRow]] = await connection.query(
                    `SELECT quantite_en_stock, nom FROM produits_services WHERE id = ?`,
                    [produit.id_prod_serv]
                );

                if (!stockRow) {
                    throw new Error(`Produit/service avec l'ID ${produit.id_prod_serv} introuvable.`);
                }

                const stockActuel = stockRow.quantite_en_stock;

                if (stockActuel < produit.quantite) {
                    stockInsuffisant = true;
                    produitsInsuffisants.push({
                        id_prod_serv: produit.id_prod_serv,
                        nom: stockRow.nom,
                        stock_actuel: stockActuel,
                        quantite_demandee: produit.quantite
                    });
                    continue; // Ne traite pas ce produit
                }

                // 4. Décrémenter le stock
                await connection.query(
                    `UPDATE produits_services
                     SET quantite_en_stock = quantite_en_stock - ?
                     WHERE id = ?`,
                    [produit.quantite, produit.id_prod_serv]
                );

                // 5. Insérer mouvement de stock
                await connection.query(
                    `INSERT INTO mouvements_stock 
                     (produit_id, societe_id, type, quantite, motif, created_at, user_id, date_mouvement)
                     VALUES (?, ?, 'sortie', ?, 'Vente', NOW(), ? , NOW())`,
                    [produit.id_prod_serv, societe_id, produit.quantite, user_id]
                );

                // 6. Marquer le produit comme "stock mis à jour"
                await connection.query(
                    `UPDATE produits SET stat_stock = 'UPDATED' WHERE id = ?`,
                    [produit.id]
                );
            }
        }

        await connection.commit();

        let message = '';
        if (statut === 'accepté') {
            message = 'Statut du devis mis à jour avec succès.';
        } else if (statut === 'FACT') {
            message = 'Le devis a été transformé en facture avec succès.';
        } else {
            message = 'Statut mis à jour avec succès.';
        }

        if (stockProcessed) {
            if (stockInsuffisant) {
                const nomsProduits = produitsInsuffisants.map(p => p.nom).join(', ');
                message += ` Cependant, le stock est insuffisant pour le(s) produit(s) suivant(s) : ${nomsProduits}. Aucun mouvement de stock n'a été créé pour ces produits.`;
            }
        } else {
            message += ' La déduction du stock n’a pas été effectuée car la politique de déduction ne le permet pas.';
        }

        res.status(200).json({
            message,
            produits_associes: produitsAssocies,
            produits_stock_insuffisant: produitsInsuffisants
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur lors de la mise à jour du statut:', error.sqlMessage || error.message);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
