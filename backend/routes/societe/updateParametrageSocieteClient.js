const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Assure-toi que ce fichier exporte bien un objet `db` compatible avec db.query()

// POST ou PUT : Création ou mise à jour des options de société
router.post('/options-societe/:societeId', async (req, res) => {
  const societeId = parseInt(req.params.societeId, 10);

  if (isNaN(societeId)) {
    return res.status(400).json({ error: 'ID société invalide' });
  }

  const {
    enable_facturation,
    enable_recette,
    enable_mailing,
    enable_relances_auto,
    enable_stock,
    enable_import_produits_services,
    enable_mouvements_stock,
    enable_inventaire_manuel,
    enable_inventaire_auto,
    enable_user_input,
    enable_user_limit,
    user_limit
  } = req.body;

  try {
    const [existingRows] = await db.query(
      'SELECT id FROM options_societe WHERE societe_id = ?',
      [societeId]
    );

    if (existingRows.length > 0) {
      // Préparer les champs à mettre à jour
      const updateFields = [
        'enable_facturation = ?',
        'enable_recette = ?',
        'enable_mailing = ?',
        'enable_relances_auto = ?',
        'enable_stock = ?',
        'enable_import_produits_services = ?',
        'enable_mouvements_stock = ?',
        'enable_inventaire_manuel = ?',
        'enable_inventaire_auto = ?',
        'enable_user_input = ?',
        'enable_user_limit = ?',
        'updated_at = NOW()'
      ];

      const updateValues = [
        enable_facturation,
        enable_recette,
        enable_mailing,
        enable_relances_auto,
        enable_stock,
        enable_import_produits_services,
        enable_mouvements_stock,
        enable_inventaire_manuel,
        enable_inventaire_auto,
        enable_user_input,
        enable_user_limit
      ];

      if (parseInt(user_limit, 10) !== 0) {
        updateFields.push('user_limit = ?');
        updateValues.push(user_limit);
      }

      updateValues.push(societeId);

      await db.query(
        `UPDATE options_societe SET ${updateFields.join(', ')} WHERE societe_id = ?`,
        updateValues
      );

      res.status(200).json({ message: 'Options mises à jour avec succès' });

    } else {
      // Insertion
      await db.query(`
        INSERT INTO options_societe (
          societe_id,
          enable_facturation,
          enable_recette,
          enable_mailing,
          enable_relances_auto,
          enable_stock,
          enable_import_produits_services,
          enable_mouvements_stock,
          enable_inventaire_manuel,
          enable_inventaire_auto,
          enable_user_input,
          enable_user_limit,
          user_limit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        societeId,
        enable_facturation,
        enable_recette,
        enable_mailing,
        enable_relances_auto,
        enable_stock,
        enable_import_produits_services,
        enable_mouvements_stock,
        enable_inventaire_manuel,
        enable_inventaire_auto,
        enable_user_input,
        enable_user_limit,
        user_limit
      ]);

      res.status(201).json({ message: 'Options créées avec succès' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des options société :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET : Récupération des options de société
router.get('/options-societe/:societeId', async (req, res) => {
    const societeId = parseInt(req.params.societeId, 10);
  
    if (isNaN(societeId)) {
      return res.status(400).json({ error: 'ID société invalide' });
    }
  
    try {

        const [rows] = await db.query(
            `SELECT 
            options_societe.*, 
            societes.companyName,
            (
              SELECT uf.path 
              FROM upload_fichier uf 
              WHERE uf.societe_id = societes.id 
                AND uf.file_type = 'SOCI_IMG_LOGO' 
              LIMIT 1
            ) AS logoPath
          FROM societes
          LEFT JOIN options_societe ON options_societe.societe_id = societes.id
          WHERE societes.id = ?`,
            [societeId]
          );
          
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Aucune option trouvée pour cette société.' });
      }
  
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération des options société :', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  

module.exports = router;
