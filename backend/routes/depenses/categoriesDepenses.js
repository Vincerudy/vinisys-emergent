const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Lister les catégories de dépenses
router.get('/categories/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { type } = req.query;
  
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
    
    let query = 'SELECT * FROM categories_depenses WHERE societe_id = ? AND actif = 1';
    let params = [societeId];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY type, nom';
    
    const [rows] = await db.query(query, params);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
});

// Créer une nouvelle catégorie
router.post('/categorie', async (req, res) => {
  const { userId, nom, description, type } = req.body;
  
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
    if (!nom || !type) {
      return res.status(400).json({ 
        message: 'Le nom et le type sont obligatoires' 
      });
    }
    
    if (!['kilometrique', 'repas', 'autres'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type invalide. Doit être: kilometrique, repas ou autres' 
      });
    }
    
    // Vérifier l'unicité du nom pour cette société et ce type
    const [existingRows] = await db.query(
      'SELECT id FROM categories_depenses WHERE societe_id = ? AND nom = ? AND type = ?',
      [societeId, nom, type]
    );
    
    if (existingRows.length > 0) {
      return res.status(409).json({ 
        message: 'Une catégorie avec ce nom existe déjà pour ce type' 
      });
    }
    
    // Insérer la nouvelle catégorie
    const [result] = await db.query(`
      INSERT INTO categories_depenses (nom, description, type, societe_id) 
      VALUES (?, ?, ?, ?)
    `, [nom, description, type, societeId]);
    
    res.status(201).json({
      message: 'Catégorie créée avec succès',
      categorieId: result.insertId
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la catégorie', 
      error: error.message 
    });
  }
});

// Mettre à jour une catégorie
router.put('/categorie/:categorieId', async (req, res) => {
  const categorieId = req.params.categorieId;
  const { userId, nom, description, actif } = req.body;
  
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
    
    // Vérifier que la catégorie appartient à la société
    const [categorieRows] = await db.query(
      'SELECT * FROM categories_depenses WHERE id = ? AND societe_id = ?',
      [categorieId, societeId]
    );
    
    if (categorieRows.length === 0) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Mettre à jour
    await db.query(`
      UPDATE categories_depenses SET 
        nom = ?, description = ?, actif = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND societe_id = ?
    `, [
      nom || categorieRows[0].nom,
      description !== undefined ? description : categorieRows[0].description,
      actif !== undefined ? actif : categorieRows[0].actif,
      categorieId,
      societeId
    ]);
    
    res.json({ message: 'Catégorie mise à jour avec succès' });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de la catégorie', 
      error: error.message 
    });
  }
});

module.exports = router;