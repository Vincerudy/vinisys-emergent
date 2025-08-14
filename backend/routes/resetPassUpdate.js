const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();

// Route pour réinitialiser le mot de passe
router.post('/reset-new-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token et nouveau mot de passe requis" });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Vérifier si le token est valide
        const [rows] = await connection.query(
            "SELECT id, reset_token_expiration FROM users WHERE reset_token = ?",
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Ce lien lien de réinitialisation du mot de passe a expiré" });
        }

        const { id, reset_token_expiration } = rows[0];

        // Vérifier si le token a expiré
        if (new Date(reset_token_expiration) < new Date()) {
            return res.status(400).json({ message: "Token expiré" });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe et supprimer le token
        await connection.query(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?",
            [hashedPassword, id]
        );

        await connection.commit();
        res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erreur lors de la réinitialisation :", error);
        res.status(500).json({ message: "Erreur serveur" });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
