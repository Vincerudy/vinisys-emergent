const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path'); 
const fs = require('fs');
const router = express.Router();
const upload = multer({ 
    dest: 'uploads/', // Dossier temporaire pour stocker les fichiers
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de taille de fichier à 10MB (ajuste selon tes besoins)
});
const db = require('../config/db');

// Route pour envoyer un e-mail
router.post('/senderMail', upload.single('attachment'), async (req, res) => {
    const { id, societe_id, emailSubject, emailBody } = req.body;
    const attachment = req.file;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.query(
            "SELECT host, port, security, username, password FROM mail_settings WHERE societe_id = ? AND user_id = ?",
            [societe_id, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Vous n'avez pas encore paramétré votre serveur de messagerie" });
        }

        const { host, port, security, username, password } = rows[0];

        console.log('Server settings:', rows[0]);

        // Configuration du transporteur Nodemailer
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: port === 465, // true pour port 465, sinon false
            auth: {
              user: username,
              pass: password,
            },
          });
          
          const htmlBody = `
            <div style="font-family: Arial, sans-serif; background-color: #f2f4f8; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="background-color: #18538e; color: white; padding: 16px 24px; font-size: 18px; font-weight: bold;">
                  📧 ${emailSubject}
                </div>
                <div style="padding: 24px; color: #333333; font-size: 15px;">
                  <p>Bonjour,</p>
                  <div style="margin: 20px 0; padding: 16px; background-color: #f0f4ff; border-left: 4px solid #18538e; font-style: italic;">
                    ${emailBody}
                  </div>
                  <p>Merci pour votre attention.</p>
                </div>
                <div style="background-color: #f9fafc; text-align: center; padding: 16px; font-size: 13px; color: #888;">
                  © ${new Date().getFullYear()} Vinisys. Tous droits réservés.
                </div>
              </div>
            </div>
          `;
          
          const mailOptions = {
            from: username,
            to: 'idnovation2014@gmail.com',
            subject: emailSubject,
            text: emailBody, // version texte (fallback)
            html: htmlBody,  // version HTML stylée
            attachments: attachment ? [
              {
                filename: attachment.originalname,
                path: path.join(__dirname, '../', attachment.path),
              }
            ] : [],
          };
          
          // Envoi de l'e-mail
          await transporter.sendMail(mailOptions);
          
        res.status(200).json({ message: 'Email envoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email', error: error.message });
    } finally {
        // Supprimer le fichier temporaire après l'envoi de l'email
        if (attachment) {
            fs.unlink(path.join(__dirname, '../', attachment.path), (err) => {
                if (err) {
                    console.error('Erreur lors de la suppression du fichier :', err);
                }
            });
        }
    }
});

module.exports = router;
