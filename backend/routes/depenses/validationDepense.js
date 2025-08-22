const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Valider un achat (dépense)
router.post('/depense/:depenseId/valider', async (req, res) => {
  const depenseId = req.params.depenseId;
  const { userId, commentaire } = req.body;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier que l'achat existe et est en brouillon (équivalent à "en attente")
    const [achatRows] = await connection.query(
      'SELECT * FROM achats WHERE id = ? AND statut = ?', 
      [depenseId, 'brouillon']
    );
    
    if (achatRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        message: 'Dépense non trouvée ou déjà traitée' 
      });
    }
    
    // Mettre à jour le statut de l'achat
    await connection.query(`
      UPDATE achats SET 
        statut = 'valide', 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [depenseId]);
    
    await connection.commit();
    
    res.json({ message: 'Dépense validée avec succès' });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de la validation:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la validation', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// Refuser un achat (dépense)
router.post('/depense/:depenseId/refuser', async (req, res) => {
  const depenseId = req.params.depenseId;
  const { userId, motifRefus } = req.body;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier que l'achat existe et est en brouillon
    const [achatRows] = await connection.query(
      'SELECT * FROM achats WHERE id = ? AND statut = ?', 
      [depenseId, 'brouillon']
    );
    
    if (achatRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        message: 'Dépense non trouvée ou déjà traitée' 
      });
    }
    
    if (!motifRefus || motifRefus.trim() === '') {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'Le motif de refus est obligatoire' 
      });
    }
    
    // Mettre à jour le statut de l'achat
    await connection.query(`
      UPDATE achats SET 
        statut = 'refuse',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [depenseId]);
    
    await connection.commit();
    
    res.json({ message: 'Dépense refusée avec succès' });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors du refus:', error);
    res.status(500).json({ 
      message: 'Erreur lors du refus', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// Marquer une dépense comme remboursée
router.post('/depense/:depenseId/rembourser', async (req, res) => {
  const depenseId = req.params.depenseId;
  const { userId, commentaire } = req.body;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier que la dépense existe et est validée
    const [depenseRows] = await connection.query(
      'SELECT * FROM depenses WHERE id = ? AND statut = ?', 
      [depenseId, 'validee']
    );
    
    if (depenseRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        message: 'Dépense non trouvée ou non validée' 
      });
    }
    
    // Mettre à jour le statut de la dépense
    await connection.query(`
      UPDATE depenses SET 
        statut = 'remboursee',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [depenseId]);
    
    // Insérer l'historique
    await connection.query(`
      INSERT INTO historique_depenses (
        depense_id, user_id, action, statut_ancien, statut_nouveau, commentaire
      ) VALUES (?, ?, 'remboursement', 'validee', 'remboursee', ?)
    `, [depenseId, userId, commentaire || 'Dépense remboursée']);
    
    await connection.commit();
    
    res.json({ message: 'Dépense marquée comme remboursée' });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors du remboursement:', error);
    res.status(500).json({ 
      message: 'Erreur lors du remboursement', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;