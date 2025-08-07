const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Assure-toi que ce fichier gère bien la connexion MySQL.

router.get('/alertesprogrammee/:id/:societe_id', async (req, res) => {
    const { id, societe_id } = req.params;

    if (!societe_id || !id) {
        return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    let connection;
    try {
        connection = await db.getConnection(); // Obtenir une connexion

        // Récupérer les alertes pour la société donnée, pour la date du jour
        const [paramData] = await connection.query(
            `SELECT * 
             FROM alertes_facturation 
             WHERE societe_id = ? 
               AND user_id = ?
               AND STR_TO_DATE(date_alerte, '%d/%m/%Y') = CURDATE()`,
            [societe_id, id]
        );

        if (paramData.length > 0) {
            return res.status(200).json({ message: 'Alertes récupérées avec succès.', data: paramData });
        } else {
            return res.status(200).json({ message: 'Aucune alerte pour aujourd\'hui.', data: [] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des alertes:', error.message);
        return res.status(500).json({ message: 'Erreur interne du serveur.', error: error.message });
    } finally {
        if (connection) connection.release(); // Libérer la connexion dans tous les cas
    }
});

module.exports = router;
