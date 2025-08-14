const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload de fichiers
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

const fileFilter = (req, file, cb) => {
  // Accepter les images et PDFs
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls JPG, PNG et PDF sont acceptés.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Créer une nouvelle dépense
router.post('/depense', upload.single('justificatif'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
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

    // Récupérer la société de l'utilisateur
    const [societeRows] = await connection.query(
      'SELECT societe_id FROM users WHERE id = ?', 
      [userId]
    );
    
    if (societeRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const societeId = societeRows[0].societe_id;
    
    // Validation des champs obligatoires
    if (!type || !dateDepense || !montantTTC) {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'Les champs type, date de dépense et montant TTC sont obligatoires' 
      });
    }

    // Calculs automatiques si nécessaire
    let finalMontantTTC = parseFloat(montantTTC);
    let finalMontantHT = parseFloat(montantHT || 0);
    let finalMontantTVA = parseFloat(montantTVA || 0);
    let finalTauxTVA = parseFloat(tauxTVA || 0);

    // Si dépense kilométrique et qu'on a un barème, calculer le montant
    if (type === 'kilometrique' && baremeId && distanceKm) {
      const [baremeRows] = await connection.query(
        'SELECT tarif_par_km FROM baremes_kilometriques WHERE id = ? AND societe_id = ?',
        [baremeId, societeId]
      );
      
      if (baremeRows.length > 0) {
        finalMontantTTC = parseFloat(distanceKm) * parseFloat(baremeRows[0].tarif_par_km);
        finalMontantHT = finalMontantTTC; // Les frais kilométriques ne sont généralement pas soumis à TVA
        finalMontantTVA = 0;
        finalTauxTVA = 0;
      }
    }

    // Si montant HT non fourni, calculer à partir du TTC et de la TVA
    if (!montantHT && finalTauxTVA > 0) {
      finalMontantHT = finalMontantTTC / (1 + finalTauxTVA / 100);
      finalMontantTVA = finalMontantTTC - finalMontantHT;
    } else if (!montantHT) {
      finalMontantHT = finalMontantTTC;
    }

    // Gestion du fichier uploadé
    let justificatifUrl = null;
    let justificatifFilename = null;
    
    if (req.file) {
      justificatifUrl = `/uploads/depenses/${req.file.filename}`;
      justificatifFilename = req.file.originalname;
    }

    // Insérer la dépense principale
    const [result] = await connection.query(`
      INSERT INTO depenses (
        user_id, societe_id, type, categorie_id, date_depense, description,
        montant_ht, montant_ttc, taux_tva, montant_tva,
        client_id, projet_id, justificatif_url, justificatif_filename
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, societeId, type, categorieId, dateDepense, description,
      finalMontantHT, finalMontantTTC, finalTauxTVA, finalMontantTVA,
      clientId || null, projetId || null, justificatifUrl, justificatifFilename
    ]);

    const depenseId = result.insertId;

    // Insérer les détails selon le type
    if (type === 'kilometrique' && lieuDepart && lieuArrivee && distanceKm) {
      await connection.query(`
        INSERT INTO depenses_kilometriques (
          depense_id, lieu_depart, lieu_arrivee, distance_km, bareme_id, type_vehicule
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [depenseId, lieuDepart, lieuArrivee, distanceKm, baremeId || null, typeVehicule]);
    } else if (type === 'repas') {
      await connection.query(`
        INSERT INTO depenses_repas (
          depense_id, lieu, nombre_personnes, type_repas
        ) VALUES (?, ?, ?, ?)
      `, [depenseId, lieuRepas, nombrePersonnes || 1, typeRepas || 'dejeuner']);
    }

    // Insérer l'historique
    await connection.query(`
      INSERT INTO historique_depenses (
        depense_id, user_id, action, statut_nouveau, commentaire
      ) VALUES (?, ?, 'creation', 'en_attente', ?)
    `, [depenseId, userId, `Création de la dépense ${type}`]);

    await connection.commit();

    res.status(201).json({
      message: 'Dépense créée avec succès',
      depenseId,
      montant_ttc: finalMontantTTC,
      montant_ht: finalMontantHT,
      montant_tva: finalMontantTVA
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de la création de la dépense:', error);
    
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de la création de la dépense', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;