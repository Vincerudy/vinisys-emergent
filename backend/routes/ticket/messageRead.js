const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

router.get('/message/:ticket_id', isAuthenticated, async (req, res) => {
  const societe_id = req.user.societe_id;
  const ticket_id = req.params.ticket_id;

  const connection = await db.getConnection();

  try {
    // Vérifie que le ticket appartient bien à la société
    const [tickets] = await connection.query(
      `SELECT id FROM tickets WHERE id = ? AND societe_id = ?`,
      [ticket_id, societe_id]
    );

    if (tickets.length === 0) {
      return res.status(403).json({ message: 'Ticket introuvable ou accès non autorisé.' });
    }

    // Récupération des messages liés au ticket
    const [messages] = await connection.query(
      `SELECT id, ticket_id, parent_id, \`from\`, message, \`date\` 
       FROM messages 
       WHERE ticket_id = ?
       ORDER BY date ASC`,
      [ticket_id]
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error('Erreur récupération des messages :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
