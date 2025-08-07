const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Connexion MySQL

// Route DELETE pour supprimer un produit
router.post('/produit/delete/:id/:societe_id', async (req, res) => {
  const { id, societe_id } = req.params;

  try {
    await db.query(`
      DELETE FROM upload_fichier 
      WHERE fk = ? AND societe_id = ? AND file_type = 'PROD_IMG_DESC'
    `, [id, societe_id]);

    const [result] = await db.query(`
      DELETE FROM produits_services 
      WHERE id = ? AND societe_id = ?
    `, [id, societe_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé ou déjà supprimé' });
    }

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        error: 'Impossible de supprimer ce produit car il est utilisé dans des mouvements de stock.'
      });
    }
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du produit' });
  }
});


module.exports = router;
