const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Lister les barèmes kilométriques
router.get('/baremes/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { annee } = req.query;
  
  try {
    // Récupérer la société de l'utilisateur
    const [societeRows] = await db.query(
      'SELECT societe_id FROM users WHERE id = ?', 
      [userId]
    );
    
    if (societeRows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const societeId = societeRows[0].societe_id;
    
    let query = 'SELECT * FROM baremes_kilometriques WHERE societe_id = ? AND actif = 1';
    let params = [societeId];
    
    if (annee) {
      query += ' AND annee = ?';
      params.push(annee);
    }
    
    query += ' ORDER BY annee DESC, puissance_fiscale_min ASC';
    
    const [rows] = await db.query(query, params);
    
    const formattedRows = rows.map(row => ({
      ...row,
      tarif_par_km: parseFloat(row.tarif_par_km)
    }));
    
    res.json(formattedRows);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des barèmes:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
});

// Créer un nouveau barème
router.post('/bareme', async (req, res) => {
  const { 
    userId, 
    nom, 
    puissanceFiscaleMin, 
    puissanceFiscaleMax, 
    tarifParKm, 
    annee 
  } = req.body;
  
  try {
    // Récupérer la société de l'utilisateur
    const [societeRows] = await db.query(
      'SELECT societe_id FROM users WHERE id = ?', 
      [userId]
    );
    
    if (societeRows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const societeId = societeRows[0].societe_id;
    
    // Validation
    if (!nom || !puissanceFiscaleMin || !puissanceFiscaleMax || !tarifParKm || !annee) {
      return res.status(400).json({ 
        message: 'Tous les champs sont obligatoires' 
      });
    }
    
    if (puissanceFiscaleMin >= puissanceFiscaleMax) {
      return res.status(400).json({ 
        message: 'La puissance fiscale minimum doit être inférieure à la maximum' 
      });
    }
    
    if (tarifParKm <= 0) {
      return res.status(400).json({ 
        message: 'Le tarif par km doit être positif' 
      });
    }
    
    // Vérifier les chevauchements de puissances fiscales
    const [overlappingRows] = await db.query(`
      SELECT id FROM baremes_kilometriques 
      WHERE societe_id = ? AND annee = ? AND actif = 1
      AND (
        (puissance_fiscale_min <= ? AND puissance_fiscale_max >= ?) OR
        (puissance_fiscale_min <= ? AND puissance_fiscale_max >= ?) OR
        (puissance_fiscale_min >= ? AND puissance_fiscale_max <= ?)
      )
    `, [
      societeId, annee,
      puissanceFiscaleMin, puissanceFiscaleMin,
      puissanceFiscaleMax, puissanceFiscaleMax,
      puissanceFiscaleMin, puissanceFiscaleMax
    ]);
    
    if (overlappingRows.length > 0) {
      return res.status(409).json({ 
        message: 'Ce barème chevauche avec un barème existant pour cette année' 
      });
    }
    
    // Insérer le nouveau barème
    const [result] = await db.query(`
      INSERT INTO baremes_kilometriques (
        nom, puissance_fiscale_min, puissance_fiscale_max, 
        tarif_par_km, annee, societe_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [nom, puissanceFiscaleMin, puissanceFiscaleMax, tarifParKm, annee, societeId]);
    
    res.status(201).json({
      message: 'Barème créé avec succès',
      baremeId: result.insertId
    });
    
  } catch (error) {
    console.error('Erreur lors de la création du barème:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du barème', 
      error: error.message 
    });
  }
});

// Calculer le montant kilométrique
router.post('/calculer-montant', async (req, res) => {
  const { userId, distanceKm, puissanceFiscale, annee } = req.body;
  
  try {
    // Récupérer la société de l'utilisateur
    const [societeRows] = await db.query(
      'SELECT societe_id FROM users WHERE id = ?', 
      [userId]
    );
    
    if (societeRows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const societeId = societeRows[0].societe_id;
    
    // Validation
    if (!distanceKm || !puissanceFiscale) {
      return res.status(400).json({ 
        message: 'Distance et puissance fiscale sont obligatoires' 
      });
    }
    
    // Trouver le barème approprié
    const currentYear = annee || new Date().getFullYear();
    const [baremeRows] = await db.query(`
      SELECT * FROM baremes_kilometriques 
      WHERE societe_id = ? AND annee = ? AND actif = 1
      AND puissance_fiscale_min <= ? AND puissance_fiscale_max >= ?
    `, [societeId, currentYear, puissanceFiscale, puissanceFiscale]);
    
    if (baremeRows.length === 0) {
      return res.status(404).json({ 
        message: 'Aucun barème trouvé pour cette puissance fiscale' 
      });
    }
    
    const bareme = baremeRows[0];
    const montant = parseFloat(distanceKm) * parseFloat(bareme.tarif_par_km);
    
    res.json({
      distanceKm: parseFloat(distanceKm),
      puissanceFiscale: parseInt(puissanceFiscale),
      tarifParKm: parseFloat(bareme.tarif_par_km),
      montantCalcule: Math.round(montant * 100) / 100, // Arrondir à 2 décimales
      bareme: {
        id: bareme.id,
        nom: bareme.nom,
        annee: bareme.annee
      }
    });
    
  } catch (error) {
    console.error('Erreur lors du calcul du montant:', error);
    res.status(500).json({ 
      message: 'Erreur lors du calcul du montant', 
      error: error.message 
    });
  }
});

module.exports = router;