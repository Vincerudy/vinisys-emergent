const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Assure-toi que db expose bien une méthode query

// Route GET pour récupérer les TVA d'une société donnée
router.get('/tva/liste/:societe_id', async (req, res) => {
  const { societe_id } = req.params;

  if (!societe_id) {
    return res.status(400).json({ error: 'Le paramètre societe_id est requis.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, libelle, taux, active, taxe_secondaire, ordre, societe_id FROM tva WHERE societe_id = ?`,
      [societe_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération TVA:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des TVA' });
  }
});

module.exports = router;
