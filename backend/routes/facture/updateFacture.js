const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour modifier une facture et ses produits associés
router.post('/factures/modifier/:id', async (req, res) => {
    const { societe_id, invoiceNumber, client, date, totalAmount, products, totalTTC, totalTVA, totalHT, totalTPS, taxe_secondaire, total_taxe_secondaire, entryMode} = req.body;
    const { id } = req.params; // ID de la facture à modifier

    // Validation des données
    if (!invoiceNumber || !client || !date || !totalAmount || products === undefined) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const connection = await db.getConnection(); // Obtenir une connexion
    //let userSession = req.session.user;

    try {
        // Commencer une transaction
        await connection.beginTransaction();

        // Mettre à jour la facture
        await connection.query(
            `UPDATE factures
             SET numero = ?, client_id = ?, date_facture = ?, total = ?, total_tva = ?, ht = ?, type_saisie = ?, total_tps = ?, taxe_secondaire = ?, total_taxe_secondaire = ?
             WHERE id = ? AND societe_id = ?`,
            [invoiceNumber, client, date, totalTTC, totalTVA, totalHT, entryMode, totalTPS || '0', taxe_secondaire || null, total_taxe_secondaire || '0', id, societe_id]
        );

        // Supprimer les produits existants liés à cette facture
        await connection.query(
            `DELETE FROM produits WHERE facture_id = ?`,
            [id]
        );

            // Récupérer les taux de TVA valides
        const [rows] = await connection.query(
            `SELECT taux FROM tva WHERE societe_id = ? AND active = 'O'`,
            [societe_id]
          );
          const validTVAValues = rows.map(row => parseFloat(row.taux));
        
          // Vérifier si la saisie est TTC
          const [paramData] = await connection.query(
            `SELECT enableTTC FROM societe_parametrage_facturation WHERE societe_id = ?
             UNION 
             SELECT 1 AS enableTTC FROM DUAL
             LIMIT 1`,
            [societe_id]
          );
          const TTC = paramData[0].enableTTC;

        // Insérer les nouveaux produits
// Insérer les produits liés à la facture
for (let produit of products) {
    const { productName, quantity, price, tva } = produit;
    let total_tva = 0;
    let montant_total = quantity * price

    if (tva !== undefined && tva !== null) {
      const tauxTVA = parseFloat(tva);
      if (!validTVAValues.includes(tauxTVA)) {
        return res.status(400).json({
          message: `La valeur de la TVA ${tva}% n'est pas valide pour la société.`
        });
      }

      if (TTC === 1) {
        total_tva = (montant_total * tauxTVA) / (100 + tauxTVA); // calcul si saisie TTC
      } else {
        total_tva = (montant_total * tauxTVA) / 100; // calcul si saisie HT
      }
    }

    await connection.query(
      `INSERT INTO produits (societe_id, facture_id, nom, quantite, prix_unitaire, taux_tva, total_tva)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [societe_id, id, productName, quantity, price, tva, total_tva]
    );
  }

        // Valider la transaction
        await connection.commit();
        
        res.status(200).json({ message: 'Facture et produits modifiés avec succès' });
    } catch (error) {
        // Si une erreur survient, annuler la transaction
        await connection.rollback();
        console.error('Erreur lors de la modification de la facture:', error.sqlMessage || error.message);
        res.status(500).json({ message: 'Erreur lors de la modification de la facture', error: error.message });
    } finally {
        // Toujours libérer la connexion
        connection.release();
    }
});

module.exports = router;
