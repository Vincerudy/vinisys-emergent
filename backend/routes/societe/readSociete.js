const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour récupérer les données d'une société, y compris le logo
router.get('/societes/affichage/:id', async (req, res) => {
    const userId = req.params.id; 

    // Obtenir une connexion depuis le pool
    const connection = await db.getConnection(); 

    try {
        const [societeRows] = await connection.query('SELECT societe_id FROM users WHERE id = ?', [userId]);

        if (societeRows.length === 0) {
            return res.status(400).json({ message: 'Cette société inexistante' });
        }

        const societeId = societeRows[0].societe_id;

        // Récupérer les informations de la société
        const [societeData] = await connection.query(
            `SELECT 
                companyName AS raisonSociale, 
                siret, 
                companyAddress AS adresse, 
                ville, 
                code_postal AS codePostal, 
                email, 
                workPhone AS telephone, 
                pays, 
                NUME_TVA AS tva, 
                DEVISE AS monnaie, 
                langue 
             FROM societes 
             WHERE id = ?`, 
            [societeId]
        );

        if (societeData.length === 0) {
            return res.status(404).json({ message: 'Société non trouvée' });
        }

        // Récupérer les informations du logo (s'il existe)
        const [logoData] = await connection.query(
            `SELECT path AS logoPath 
             FROM upload_fichier 
             WHERE societe_id = ?`,
            [societeId]
        );

        const logoPath = logoData.length > 0 ? logoData[0].logoPath : null;

        const societeInfo = {
            ...societeData[0],
            logo: logoPath
        };

        res.status(200).json(societeInfo);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de la société:', error.sqlMessage || error.message);
        res.status(500).json({ message: 'Erreur lors de la récupération des données de la société', error: error.message });
    } finally {
        // Libérer la connexion
        connection.release();
    }
});

module.exports = router;
