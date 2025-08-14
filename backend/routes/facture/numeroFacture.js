const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Récupérer le prochain numéro de facture pour une société
router.get('/numerofacture/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Récupérer l'ID de la société associée à l'utilisateur
        const [societeRows] = await db.query(
            'SELECT societe_id FROM users WHERE id = ?', [userId]
        );

        if (societeRows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé ou sans société associée' });
        }

        const societeId = societeRows[0].societe_id;

        // Récupérer le prochain numéro de facture
        const [rows] = await db.query(
            `SELECT COALESCE(MAX(numero), 0) + 1 AS nume_fact
             FROM factures
             WHERE societe_id = ?
             AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')`,
            [societeId]
        ); 

        res.json(rows[0]); // ✅ Renvoie directement { nume_fact: ... }
    } catch (error) {
        console.error('Erreur lors de la récupération du numéro de facture:', error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

module.exports = router;
