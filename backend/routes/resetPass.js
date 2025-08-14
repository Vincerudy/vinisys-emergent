const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../config/db'); // Connexion à ta base de données
const bcrypt = require('bcrypt');

const router = express.Router();

// Route pour demander une réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const [user] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expirationTime = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 heure

        await db.query("UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE email = ?", 
            [token, expirationTime, email]
        );

        const resetLink = `http://client.vinisys.com/#/reset-password/${token}`;

        // Configuration du transporteur Nodemailer
        const transporter = nodemailer.createTransport({
            host: "smtp.ionos.fr", // Remplace par ton SMTP
            port: 465,
            secure: true,
            auth: {
                user: "contact@minutescoop.fr",
                pass: "Cinema12@selfie",
            },
        });

        const mailOptions = {
            from: "contact@minutescoop.fr",
            to: email,
            subject: "Réinitialisation de mot de passe",
            text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Un email de réinitialisation a été envoyé." });

    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation :", error);
        res.status(500).json({ message: "Une erreur est survenue." });
    }
});

 

module.exports = router;
