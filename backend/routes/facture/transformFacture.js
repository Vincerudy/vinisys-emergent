const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour ajouter plusieurs paiements et mettre à jour le stock si nécessaire
router.post('/reglement/:id/:user_id', async (req, res) => {
    const societe_id = req.params.id;
    const user_id = req.params.user_id
    const {
        factureNumber,
        client,
        encaissementDate,
        modesPaiement,
        Montant_total,
        totalPaye,
        resteAPayer
    } = req.body;

    if (!factureNumber || !client || !encaissementDate || !modesPaiement || modesPaiement.length === 0 || !Montant_total || !totalPaye) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Enregistrer les règlements
        for (const modePaiement of modesPaiement) {
            const { mode, montant } = modePaiement;

            await connection.query(
                `INSERT INTO Reglement_mode (
                    numero_facture, mode_reglement, Montant_total, montant_paye,
                    Total_Paye, Reste_A_Payer, dat, societe_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    factureNumber,
                    mode,
                    Montant_total,
                    montant,
                    totalPaye,
                    resteAPayer,
                    encaissementDate,
                    societe_id
                ]
            );
        }

        // 2. Vérifier la politique de déduction du stock
        const [[stockSetting]] = await connection.query(
            `SELECT stockDeductionTrigger FROM societe_parametrage_facturation WHERE societe_id = ?`,
            [societe_id]
        );

        let produitsAssocies = [];
        let produitsInsuffisants = [];
        let stockInsuffisant = false;

        if (stockSetting?.stockDeductionTrigger === 'invoice_paid') {
            // 3. Récupérer la facture
            const [[facture]] = await connection.query(
                `SELECT id FROM factures WHERE numero = ? AND societe_id = ?`,
                [factureNumber, societe_id]
            );

            if (!facture) {
                throw new Error(`Facture avec le numéro ${factureNumber} introuvable.`);
            }

            const factureId = facture.id;

            // 4. Produits associés à la facture
            [produitsAssocies] = await connection.query(
                `SELECT id, id_prod_serv, quantite 
                 FROM produits 
                 WHERE facture_id = ? AND id_prod_serv IS NOT NULL AND stat_stock IS NULL`,
                [factureId]
            );

            // 5. Traitement du stock
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
                    continue;
                }

                // Décrémenter le stock
                await connection.query(
                    `UPDATE produits_services
                     SET quantite_en_stock = quantite_en_stock - ?
                     WHERE id = ?`,
                    [produit.quantite, produit.id_prod_serv]
                );

                // Enregistrer le mouvement
                await connection.query(
                    `INSERT INTO mouvements_stock (
                        produit_id, societe_id, type, quantite,
                        motif, created_at, user_id, date_mouvement
                    ) VALUES (?, ?, 'sortie', ?, 'Vente', NOW(), ?, NOW())`,
                    [produit.id_prod_serv, societe_id, produit.quantite, user_id]
                );

                // Marquer produit comme mis à jour
                await connection.query(
                    `UPDATE produits SET stat_stock = 'UPDATED' WHERE id = ?`,
                    [produit.id]
                );
            }
        }

        await connection.commit();

        let message = 'Règlement(s) ajouté(s) avec succès.';
        if (stockInsuffisant) {
            const noms = produitsInsuffisants.map(p => p.nom).join(', ');
            message += ` Cependant, stock insuffisant pour : ${noms}. Aucun mouvement effectué pour ceux-ci.`;
        }

        res.status(201).json({
            message,
            produits_associes: produitsAssocies,
            produits_stock_insuffisant: produitsInsuffisants
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur lors du traitement du règlement :', error);
        res.status(500).json({
            message: 'Erreur lors du traitement du règlement.',
            error: error.sqlMessage || error.message
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
