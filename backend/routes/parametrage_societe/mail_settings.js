const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Assure-toi que ce fichier gère bien la connexion MySQL

// 📌 Enregistrer ou mettre à jour les paramètres de messagerie
router.post('/mail-settings', async (req, res) => {
    const { host, port, security, username, password, societe_id, user_id } = req.body;

    if (!host || !port || !security || !username || !password || !societe_id || !user_id) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Vérifier si une ligne existe déjà pour cette société et cet utilisateur
        const [existing] = await connection.query(
            "SELECT id FROM mail_settings WHERE societe_id = ? AND user_id = ?",
            [societe_id, user_id]
        );

        if (existing.length > 0) {
            // Mise à jour des paramètres existants
            const sqlUpdate = `UPDATE mail_settings 
                               SET host = ?, port = ?, security = ?, username = ?, password = ?
                               WHERE societe_id = ? AND user_id = ?`;
            await connection.query(sqlUpdate, [host, port, security, username, password, societe_id, user_id]);
        } else {
            // Insérer une nouvelle entrée
            const sqlInsert = `INSERT INTO mail_settings (societe_id, user_id, host, port, security, username, password) 
                               VALUES (?, ?, ?, ?, ?, ?, ?)`;
            await connection.query(sqlInsert, [societe_id, user_id, host, port, security, username, password]);
        }

        await connection.commit(); // Valider l'opération
        res.status(201).json({ message: "Paramètres de messagerie enregistrés ou mis à jour avec succès" });

    } catch (err) {
        if (connection) await connection.rollback(); // Annuler en cas d'erreur
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release(); // Libérer la connexion
    }
});

// 📌 Récupérer les paramètres de messagerie pour une société et un utilisateur
router.get('/mail-settings/:societe_id/:user_id', async (req, res) => {
    const { societe_id, user_id } = req.params;

    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.query(
            "SELECT host, port, security, username, password FROM mail_settings WHERE societe_id = ? AND user_id = ?",
            [societe_id, user_id]
        );
        connection.release();

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "Veuillez saisir vos parametres de messagerie." });
        }
    } catch (err) {
        if (connection) connection.release();
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
