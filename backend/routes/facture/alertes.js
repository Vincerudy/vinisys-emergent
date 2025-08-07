const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Assure-toi que ce fichier gère bien la connexion MySQL



// 📌 Ajouter une nouvelle alerte avec transaction
router.post('/alertes', async (req, res) => {
    const { societe_id, user_id, date_alerte, jours_avant, titre, description } = req.body;

    if (!societe_id || !user_id || !date_alerte || !jours_avant || !titre || !description) {
        return res.status(400).json({ error: "Tous les champs sont requis." }); 
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const sql = "INSERT INTO alertes_facturation (societe_id, user_id, date_alerte, jours_avant, titre, description) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await connection.query(sql, [societe_id, user_id, date_alerte, jours_avant, titre, description]);

        await connection.commit(); // Valider l'opération
        res.status(201).json({ message: "Alerte ajoutée avec succès", id: result.insertId });

    } catch (err) {
        if (connection) await connection.rollback(); // Annuler en cas d'erreur
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release(); // Libérer la connexion
    }
});

router.get('/affichageAlertes', async (req, res) => {
    const { id, societe_id } = req.query;

    if (!societe_id || !id) {
        return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    try {
        const connection = await db.getConnection(); // Obtenir une connexion
        
        // Récupérer les alertes pour la société donnée
        const [paramData] = await connection.query(
            `SELECT * FROM alertes_facturation WHERE societe_id = ? and user_id = ?`,
            [societe_id, id]
        );
        
        connection.release(); // Libérer la connexion

        if (paramData.length > 0) {
            // Renvoyer toutes les alertes sous forme de tableau
            return res.status(200).json({ message: 'Alertes récupérées avec succès.', data: paramData });
        } else {
            return res.status(404).json({ message: 'Aucune alerte trouvée pour cette société.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des alertes:', error.message);
        res.status(500).json({ message: 'Erreur interne du serveur.', error: error.message });
    }
});

// 📌 Mettre à jour une alerte existante avec transaction
router.post('/alertes/update/:id', async (req, res) => {
    const { id } = req.params;
    const { date_alerte, jours_avant, titre, description } = req.body;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const sql = "UPDATE alertes_facturation SET date_alerte = ?, jours_avant = ?, titre = ?, description = ? WHERE id = ?";
        const [result] = await connection.query(sql, [date_alerte, jours_avant, titre, description, id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Alerte non trouvée" });
        }

        await connection.commit();
        res.json({ message: "Alerte mise à jour avec succès" });

    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// 📌 Supprimer une alerte avec transaction
router.post('/alertes/delete/:id', async (req, res) => {
    const { id } = req.params;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const sql = "DELETE FROM alertes_facturation WHERE id = ?";
        const [result] = await connection.query(sql, [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Alerte non trouvée" });
        }

        await connection.commit();
        res.json({ message: "Alerte supprimée avec succès" });

    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
