const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour supprimer une facture et ses produits associés (via POST)
router.post('/factures/supprimer/:facture_id/:societe_id', async (req, res) => {
    const { facture_id, societe_id } = req.params; // ID de la facture à supprimer
    const connection = await db.getConnection(); // Obtenir une connexion
    // let userSession = req.session.user;

    try {
        // Commencer une transaction
        await connection.beginTransaction();

        // Vérifier si la facture existe pour cette société
        const [facture] = await connection.query(
            `SELECT id FROM factures WHERE id = ? AND societe_id = ?`,
            [facture_id, societe_id]
        );

        if (facture.length === 0) {
            return res.status(404).json({ message: 'Facture non trouvée.' });
        }

        // Supprimer les produits liés à la facture
        await connection.query(
            `DELETE FROM produits WHERE facture_id = ?`,
            [facture_id]
        );

        // Supprimer la facture elle-même
        await connection.query(
            `DELETE FROM factures WHERE id = ? AND societe_id = ?`,
            [facture_id, societe_id]
        );

        // Valider la transaction
        await connection.commit();

        res.status(200).json({ message: 'Facture et ses produits supprimés avec succès' });
    } catch (error) {
        // Si une erreur survient, annuler la transaction
        await connection.rollback();
        console.error('Erreur lors de la suppression de la facture:', error.sqlMessage || error.message);
        res.status(500).json({ message: 'Erreur lors de la suppression de la facture', error: error.message });
    } finally {
        // Toujours libérer la connexion
        connection.release();
    }
});

module.exports = router;
