const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

router.get('/maintenance/tickets/:id', isAuthenticated, async (req, res) => {

  const ticketId = req.params.id;

  const connection = await db.getConnection();

  try {
    // Requête pour récupérer le ticket selon son id et la société
    const [tickets] = await connection.query(
      `SELECT id, title, description, reason, status, created_at 
       FROM tickets 
       WHERE id = ?`,
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé ou accès refusé' });
    }

    const ticket = tickets[0];

    // Ici, si tu veux récupérer aussi la conversation liée au ticket,
    // il faudrait une autre table, par exemple "conversations" ou "messages".
    // Exemple simple d'ajout :
    /*
    const [conversation] = await connection.query(
      `SELECT id, from_user, message, created_at FROM conversations WHERE ticket_id = ? ORDER BY created_at ASC`,
      [ticketId]
    );
    ticket.conversation = conversation;
    */

    res.status(200).json(ticket);

  } catch (error) {
    console.error('Erreur lors de la récupération du ticket :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
