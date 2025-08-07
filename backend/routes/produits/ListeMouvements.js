const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // adapte selon ton arborescence

// Route GET pour récupérer les mouvements de stock pour une société donnée
router.get('/mouvements-stock/:societeId', async (req, res) => {
  const societeId = parseInt(req.params.societeId);

  if (isNaN(societeId)) {
    return res.status(400).json({ error: 'ID de société invalide.' });
  }

  try {
    const [rows] = await db.query(`
    SELECT 
    mouv.id,
    mouv.date_mouvement,
    mouv.type, 
    prod.nom as produit, 
    mouv.quantite, 
    mouv.motif, 
    CONCAT(u.firstName, ' ', u.lastName) AS utilisateur
  FROM mouvements_stock AS mouv
  JOIN users AS u ON u.id = mouv.user_id AND u.societe_id = mouv.societe_id
  join produits_services prod on prod.id = mouv.produit_id and prod.societe_id = mouv.societe_id
  WHERE mouv.societe_id = ?
  ORDER BY mouv.date_mouvement DESC
    `, [societeId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur récupération mouvements :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des mouvements de stock.' });
  }
});

module.exports = router;
