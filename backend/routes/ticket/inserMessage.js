const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');
const nodemailer = require('nodemailer'); // 📧 Ajout de nodemailer

module.exports = function(io) {
  router.post('/message/insert', isAuthenticated, async (req, res) => {
    const societe_id = req.user.societe_id;
    const {
      ticket_id,
      from,
      message,
      parent_id
    } = req.body;

    if (!ticket_id || !from || !message) {
      return res.status(400).json({ message: 'Les champs ticket_id, from et message sont obligatoires.' });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 📥 Récupération du ticket + user_id
      const [tickets] = await connection.query(
        `SELECT id, user_id FROM tickets WHERE id = ?`,
        [ticket_id]
      );

      if (tickets.length === 0) {
        await connection.rollback();
        return res.status(403).json({ message: 'Ticket introuvable ou accès non autorisé.' });
      }

      const ticketOwnerId = tickets[0].user_id;

      // ✅ Insertion du message
      const [insertResult] = await connection.query(
        `INSERT INTO messages 
         (ticket_id, societe_id, parent_id, \`from\`, message, \`date\`)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [ticket_id, societe_id, parent_id || null, from, message]
      );

      const [insertedMessages] = await connection.query(
        `SELECT id, ticket_id, societe_id, parent_id, \`from\`, message, \`date\`
         FROM messages
         WHERE id = ?`,
        [insertResult.insertId]
      );

      const insertedMessage = insertedMessages[0];

      // 📧 Récupération de l'email de l'utilisateur lié au ticket
      const [userRows] = await connection.query(
        `SELECT email FROM users WHERE id = ?`,
        [ticketOwnerId]
      );

      const userEmail = userRows[0]?.email;

      await connection.commit();

      // 📡 Émission socket.io
      //io.to(`ticket_${ticket_id}`).emit('new_message', message);

      // 📧 Envoi de l'e-mail si l'adresse est trouvée
      if (userEmail && from === 'support') {
        const transporter = nodemailer.createTransport({
          host: 'ssl0.ovh.net', // 🔧 à adapter
          port: 465,
          secure: true,
          auth: {
            user: 'support-vinisys@vinisys.com',
            pass: 'viniCinema12selfie2025Mail'
          }
        });

        await transporter.sendMail({
          from: 'support-vinisys@vinisys.com',
          to: userEmail,
          subject: `Nouveau message sur votre ticket #${ticket_id}`,
          text: `Bonjour,\n\nVous avez reçu un nouveau message du support Vinisys :\n\n"${message}"\n\nMerci.`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f2f4f8; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="background-color: #18538e; color: white; padding: 16px 24px; font-size: 18px; font-weight: bold;">
                  📬 Nouveau message - Ticket #${ticket_id}
                </div>
                <div style="padding: 24px; color: #333333; font-size: 15px;">
                  <p>Bonjour,</p>
                  <p>Vous avez reçu un nouveau message du support <strong>Vinisys</strong> :</p>
                  <div style="margin: 20px 0; padding: 16px; background-color: #f0f4ff; border-left: 4px solid #18538e; font-style: italic;">
                    ${message}
                  </div>
                  <p>🔒 Veuillez ne pas répondre à ce mail.</p>
                  <p>👉 Connectez-vous à votre espace client <a href="https://app.vinisys.fr" style="color: #18538e; text-decoration: none;">Vinisys</a> pour consulter l'échange complet.</p>
                </div>
                <div style="background-color: #f9fafc; text-align: center; padding: 16px; font-size: 13px; color: #888;">
                  © ${new Date().getFullYear()} Vinisys. Tous droits réservés.
                </div>
              </div>
            </div>
          `
        });
        
      }

      res.status(201).json({
        message: 'Message envoyé avec succès.',
        data: insertedMessage
      });

    } catch (error) {
      await connection.rollback();
      console.error("Erreur lors de l'envoi du message :", error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
      connection.release();
    }
  });

  return router;
};
