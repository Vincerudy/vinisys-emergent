const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

router.get('/societes/inscription', isAuthenticated, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const [societes] = await connection.query(`
    SELECT DISTINCT s.id, s.companyName AS nom,
        CASE
          WHEN 
            o.enable_facturation = 1 OR
            o.enable_recette = 1 OR
            o.enable_mailing = 1 OR
            o.enable_relances_auto = 1 OR
            o.enable_stock = 1 OR
            o.enable_import_produits_services = 1 OR
            o.enable_mouvements_stock = 1 OR
            o.enable_inventaire_manuel = 1 OR
            o.enable_inventaire_auto = 1
          THEN 'active'
          ELSE 'inactive'
        END AS statut,
        DATE_FORMAT(s.created_at, '%d/%m/%Y') AS date_inscription
      FROM societes s
      LEFT JOIN options_societe o ON s.id = o.societe_id
      ORDER BY s.created_at DESC
    `);

    if (societes.length === 0) {
      return res.status(404).json({ message: 'Aucune société trouvée' });
    }

    res.status(200).json(societes);

  } catch (error) {
    console.error('Erreur lors de la récupération des sociétés:', error.sqlMessage || error.message);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des sociétés', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
