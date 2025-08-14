const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

router.get('/affichage/tickets', isAuthenticated, async (req, res) => {
  const societe_id = req.user.societe_id;
console.log('TEST TICKET')
  const connection = await db.getConnection();

  try {
    // Récupération des tickets liés à la société connectée
    const [tickets] = await connection.query(
        `SELECT id, title AS titre, status, reason AS raison, created_at AS date_creation 
         FROM tickets 
         WHERE societe_id = 2
         ORDER BY date_creation DESC`
      );

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur récupération des tickets :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
