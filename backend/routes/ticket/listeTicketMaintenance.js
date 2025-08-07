const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

router.get('/liste/tickets/maintenance', isAuthenticated, async (req, res) => {
    const societe_id = req.user.societe_id;

  const connection = await db.getConnection();

  if (societe_id != process.env.SOCIETE_ID_MAINTENANCE) {
    return res.status(403).json({ message: "Accès interdit : société non autorisée" });
  }

  try {
    // Récupération des tickets liés à la société connectée
    const [tickets] = await connection.query(
      `SELECT id, title as titre, status, reason as raison, created_at as date_creation 
       FROM tickets 
   
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
