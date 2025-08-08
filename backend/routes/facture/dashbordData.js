const express = require('express');
const router = express.Router();
const db = require('../../config/db');


// Route directe pour correspondre aux appels frontend
router.get('/', async (req, res) => {
  const { id } = req.query;
  const userId = id // Récupérer l'ID depuis le frontend via la query string

  
 
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
    u.firstName,
    u.lastName,
    s.companyName,
    f.path,
    SUM(fact_data.tva_due) AS tva_due,
    SUM(fact_data.chiffre_affaire) AS chiffre_affaire,
    SUM(fact_data.total_attente) AS total_attente,
    SUM(fact_data.total_retard) AS total_retard
FROM users u
INNER JOIN societes s ON s.id = u.societe_id
LEFT JOIN (
    SELECT societe_id, MAX(path) AS path
    FROM upload_fichier
    GROUP BY societe_id
) f ON f.societe_id = s.id
LEFT JOIN (
    SELECT 
        fact.societe_id,
        -- fact.numero retiré car pas dans GROUP BY ni agrégé
        SUM(
            CASE WHEN MONTH(STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) = MONTH(CURDATE())
                      AND YEAR(STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) = YEAR(CURDATE())
                      AND regl.count_regl = 1 THEN fact.total_tva ELSE 0 END
        ) AS tva_due,
        SUM(
            CASE WHEN MONTH(STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) = MONTH(CURDATE())
                      AND YEAR(STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) = YEAR(CURDATE())
                      AND regl.count_regl = 1 THEN fact.total ELSE 0 END
        ) AS chiffre_affaire,
        SUM(
            CASE WHEN MONTH(STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) = MONTH(CURDATE())
                      AND YEAR(STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) = YEAR(CURDATE())
                      AND (regl.count_regl = 0 OR regl.count_regl IS NULL) THEN fact.total ELSE 0 END
        ) AS total_attente,
        SUM(
            CASE WHEN MONTH(STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) = MONTH(CURDATE())
                      AND YEAR(STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) = YEAR(CURDATE())
                      AND (regl.count_regl = 0 OR regl.count_regl IS NULL)
                      AND DATEDIFF(CURDATE(), STR_TO_DATE(SUBSTRING(fact.date_facture, 1, 19), '%Y-%m-%dT%H:%i:%s')) > 30
                 THEN fact.total ELSE 0 END
        ) AS total_retard
    FROM factures fact
    LEFT JOIN (
        SELECT societe_id, numero_facture, COUNT(0) AS count_regl
        FROM Reglement_mode
        WHERE Reste_A_Payer = 0
        GROUP BY societe_id, numero_facture
    ) regl ON regl.societe_id = fact.societe_id AND regl.numero_facture = fact.numero
    WHERE fact.type_fact = 'FACT'
    GROUP BY fact.societe_id
) fact_data ON fact_data.societe_id = u.societe_id
WHERE u.id = ?
GROUP BY u.id, s.id, f.path;

      `,
      [userId]  // Passe l'userId comme paramètre
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

module.exports = router;
