const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Lister les clients pour une société
router.get('/listeClient/:id', async (req, res) => {
   const userId = req.params.id;

   const [societeRows] = await db.query(
    'select societe_id from users where id = ?', [userId]
    )
    
    if(societeRows.length === 0){
      return res.status(404).json({ message: 'Utilisateur non trouvé ou sans société associée' });
    }
    const societeId = societeRows[0].societe_id;
  
    try {
      const [rows] = await db.query('SELECT nom as name, email, phone as phone,  adresse as address, id, ville as city, code_postal as postalCode, pays as country  FROM clients WHERE societe_id = ?', [societeId]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: 'Erreur du serveur' });
    }
  });

  module.exports = router;
  