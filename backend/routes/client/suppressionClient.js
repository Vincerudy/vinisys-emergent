const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

// Lire un client
router.get('/deleteclient/:id', isAuthenticated, async (req, res) => {
  const societe_id = req.user.societe_id;
    const { id } = req.params;
  
    try {
        await db.query('DELETE FROM clients WHERE id = ? and societe_id = ?', [id, societe_id]);
        res.json({ message: 'Client supprimé avec succès' });
      } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur' });
      }
  });

  module.exports = router;