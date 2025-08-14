const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Assure-toi que db expose bien une méthode query

// Route GET pour récupérer les TVA actives d'une société
router.get('/tva/active/:societe_id', async (req, res) => {
  const societe_id = req.params.societe_id?.trim();

  if (!societe_id) {
    return res.status(400).json({ error: 'Le paramètre societe_id est requis.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, libelle as label, taux as value, taxe_secondaire FROM tva WHERE societe_id = ? AND active = 'O' ORDER BY ordre ASC`,
      [societe_id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des TVA actives:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des TVA.' });
  }
});

module.exports = router;
