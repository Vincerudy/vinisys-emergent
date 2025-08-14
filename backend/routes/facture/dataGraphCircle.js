const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour récupérer les statistiques générales
router.get('/dataGraphCircle/:id', async (req, res) => {
    const userId = req.params.id;

    // Récupérer l'ID de la société associée à l'utilisateur
    const [societeRows] = await db.query(
        'SELECT societe_id FROM users WHERE id = ?', [userId]
    );

    if (societeRows.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé ou sans société associée' });
    }
    const societeId = societeRows[0].societe_id;

    try {
        // Récupérer le nombre de clients
        const [[clientsCount]] = await db.query(
            'SELECT COUNT(*) AS total FROM clients WHERE societe_id = ?', 
            [societeId]
        );

        // Récupérer le nombre de factures
        const [[facturesCount]] = await db.query(
            "SELECT COUNT(*) AS total FROM factures WHERE societe_id = ? AND type_fact = 'FACT'", 
            [societeId]
        );

        // Récupérer le nombre de devis
        const [[devisCount]] = await db.query(
            "SELECT COUNT(*) AS total FROM factures WHERE societe_id = ? AND type_fact = 'DEVI'", 
            [societeId]
        );

        // Construire la réponse
        const response = [
            {
                id: 1,
                title: "Clients",
                number: clientsCount.total
            },
            {
                id: 2,
                title: "Factures",
                number: facturesCount.total
            },
            {
                id: 3,
                title: "Devis",
                number: devisCount.total
            }
        ];

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

module.exports = router;
