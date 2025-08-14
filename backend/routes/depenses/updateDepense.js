const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer (même que dans insertDepense.js)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/depenses');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `depense-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Mettre à jour une dépense
router.put('/depense/:depenseId', upload.single('justificatif'), async (req, res) => {
  const depenseId = req.params.depenseId;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Récupérer la dépense actuelle
    const [currentRows] = await connection.query(
      'SELECT * FROM depenses WHERE id = ?', 
      [depenseId]
    );
    
    if (currentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }
    
    const currentDepense = currentRows[0];
    
    // Vérifier que la dépense peut être modifiée (seulement si en attente)
    if (currentDepense.statut !== 'en_attente') {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'Seules les dépenses en attente peuvent être modifiées' 
      });
    }
    
    const {
      userId,
      type,
      categorieId,
      dateDepense,
      description,
      montantTTC,
      montantHT,
      montantTVA,
      tauxTVA,
      clientId,
      projetId,
      // Données kilométriques
      lieuDepart,
      lieuArrivee,
      distanceKm,
      baremeId,
      typeVehicule,
      // Données repas
      lieuRepas,
      nombrePersonnes,
      typeRepas
    } = req.body;

    // Calculs automatiques si nécessaire (même logique que dans insertDepense)
    let finalMontantTTC = parseFloat(montantTTC || currentDepense.montant_ttc);
    let finalMontantHT = parseFloat(montantHT || currentDepense.montant_ht);
    let finalMontantTVA = parseFloat(montantTVA || currentDepense.montant_tva);
    let finalTauxTVA = parseFloat(tauxTVA || currentDepense.taux_tva);

    // Si dépense kilométrique et qu'on a un barème, recalculer le montant
    if (type === 'kilometrique' && baremeId && distanceKm) {
      const [baremeRows] = await connection.query(
        'SELECT tarif_par_km FROM baremes_kilometriques WHERE id = ? AND societe_id = ?',
        [baremeId, currentDepense.societe_id]
      );
      
      if (baremeRows.length > 0) {
        finalMontantTTC = parseFloat(distanceKm) * parseFloat(baremeRows[0].tarif_par_km);
        finalMontantHT = finalMontantTTC;
        finalMontantTVA = 0;
        finalTauxTVA = 0;
      }
    }

    // Gestion du nouveau fichier
    let justificatifUrl = currentDepense.justificatif_url;
    let justificatifFilename = currentDepense.justificatif_filename;
    
    if (req.file) {
      // Supprimer l'ancien fichier si il existe
      if (currentDepense.justificatif_url) {
        const oldFilePath = path.join(__dirname, '../../', currentDepense.justificatif_url);
        fs.unlink(oldFilePath, () => {});
      }
      
      justificatifUrl = `/uploads/depenses/${req.file.filename}`;
      justificatifFilename = req.file.originalname;
    }

    // Mettre à jour la dépense principale
    await connection.query(`
      UPDATE depenses SET 
        type = ?, categorie_id = ?, date_depense = ?, description = ?,
        montant_ht = ?, montant_ttc = ?, taux_tva = ?, montant_tva = ?,
        client_id = ?, projet_id = ?, justificatif_url = ?, justificatif_filename = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      type || currentDepense.type,
      categorieId || currentDepense.categorie_id,
      dateDepense || currentDepense.date_depense,
      description || currentDepense.description,
      finalMontantHT,
      finalMontantTTC,
      finalTauxTVA,
      finalMontantTVA,
      clientId || currentDepense.client_id,
      projetId || currentDepense.projet_id,
      justificatifUrl,
      justificatifFilename,
      depenseId
    ]);

    // Mettre à jour les détails selon le type
    if (type === 'kilometrique') {
      // Supprimer les anciens détails repas si on change de type
      await connection.query('DELETE FROM depenses_repas WHERE depense_id = ?', [depenseId]);
      
      // Mettre à jour ou insérer les détails kilométriques
      const [kmRows] = await connection.query(
        'SELECT id FROM depenses_kilometriques WHERE depense_id = ?', 
        [depenseId]
      );
      
      if (kmRows.length > 0) {
        await connection.query(`
          UPDATE depenses_kilometriques SET 
            lieu_depart = ?, lieu_arrivee = ?, distance_km = ?, 
            bareme_id = ?, type_vehicule = ?
          WHERE depense_id = ?
        `, [lieuDepart, lieuArrivee, distanceKm, baremeId, typeVehicule, depenseId]);
      } else {
        await connection.query(`
          INSERT INTO depenses_kilometriques (
            depense_id, lieu_depart, lieu_arrivee, distance_km, bareme_id, type_vehicule
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [depenseId, lieuDepart, lieuArrivee, distanceKm, baremeId, typeVehicule]);
      }
    } else if (type === 'repas') {
      // Supprimer les anciens détails kilométriques si on change de type
      await connection.query('DELETE FROM depenses_kilometriques WHERE depense_id = ?', [depenseId]);
      
      // Mettre à jour ou insérer les détails repas
      const [repasRows] = await connection.query(
        'SELECT id FROM depenses_repas WHERE depense_id = ?', 
        [depenseId]
      );
      
      if (repasRows.length > 0) {
        await connection.query(`
          UPDATE depenses_repas SET 
            lieu = ?, nombre_personnes = ?, type_repas = ?
          WHERE depense_id = ?
        `, [lieuRepas, nombrePersonnes, typeRepas, depenseId]);
      } else {
        await connection.query(`
          INSERT INTO depenses_repas (
            depense_id, lieu, nombre_personnes, type_repas
          ) VALUES (?, ?, ?, ?)
        `, [depenseId, lieuRepas, nombrePersonnes, typeRepas]);
      }
    } else if (type === 'autres') {
      // Supprimer les détails spécifiques si on passe en "autres"
      await connection.query('DELETE FROM depenses_kilometriques WHERE depense_id = ?', [depenseId]);
      await connection.query('DELETE FROM depenses_repas WHERE depense_id = ?', [depenseId]);
    }

    // Insérer l'historique
    await connection.query(`
      INSERT INTO historique_depenses (
        depense_id, user_id, action, statut_ancien, statut_nouveau, commentaire
      ) VALUES (?, ?, 'modification', 'en_attente', 'en_attente', ?)
    `, [depenseId, userId, 'Modification de la dépense']);

    await connection.commit();

    res.json({
      message: 'Dépense mise à jour avec succès',
      montant_ttc: finalMontantTTC,
      montant_ht: finalMontantHT,
      montant_tva: finalMontantTVA
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de la mise à jour de la dépense:', error);
    
    // Supprimer le nouveau fichier en cas d'erreur
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de la dépense', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;