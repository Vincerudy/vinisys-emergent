const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Connexion mysql2/promise

// 1. Mise à jour du stock_reel avec requêtes SQL explicites
router.post('/update_stock_reel/:societe_id', async (req, res) => {
  const {societe_id} = req.params;
  const { produits } = req.body;

  if (!Array.isArray(produits)) {
    return res.status(400).json({ error: 'Le champ produits doit être un tableau.' });
  }

  try {
    await db.query('START TRANSACTION');

    for (const produit of produits) {
      const { id, stock_reel } = produit;

      if (typeof id === 'number' && typeof stock_reel === 'number') {
        await db.query(
          'UPDATE produits_services SET stock_reel = ? WHERE id = ? and societe_id = ?',
          [stock_reel, id, societe_id]
        );
      }
    }

    await db.query('COMMIT');
    return res.status(200).json({ message: 'Stock réel mis à jour avec succès.' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Erreur lors de la mise à jour du stock réel :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du stock réel.' });
  }
});

// 2. Mise en conformité (stock théorique = stock réel)
router.post('/mise_en_conformite/:societe_id', async (req, res) => {
    const {societe_id} = req.params;
  try {
    const [result] = await db.query(
      'UPDATE produits_services SET quantite_en_stock = stock_reel where societe_id = ?',
      [societe_id]
    );

    return res.status(200).json({
      message: 'Mise en conformité réussie : quantités en stock mises à jour.',
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Erreur lors de la mise en conformité :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la mise en conformité.' });
  }
});

module.exports = router;
