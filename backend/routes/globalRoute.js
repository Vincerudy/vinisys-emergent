const express = require('express');
const router = express.Router();
const db = require('../config/db');


// Lister les sociétés
router.get('/globalhome', async (req, res) => {
  const { id } = req.query;
  const userId = id // Récupérer l'ID depuis le frontend via la query string

  
 
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.firstName, 
            u.lastName, 
            s.companyName, 
            f.path 
      FROM users u
      INNER JOIN societes s ON s.id = u.societe_id 
      LEFT JOIN upload_fichier f ON f.societe_id = s.id
      WHERE u.id = ?`,
      [userId]  // Passe l'userId comme paramètre
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

module.exports = router;
