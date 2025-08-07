const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Récupérer les produits associés à une société via l'utilisateur
router.get('/recette/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Vérifier si l'utilisateur est associé à une société
    const [societeRows] = await db.query(
      'SELECT societe_id FROM users WHERE id = ?',
      [userId]
    );

    if (societeRows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé ou sans société associée' });
    }

    const societeId = societeRows[0].societe_id;

    // Récupérer les produits liés à cette société
    const [rows] = await db.query(
        `SELECT 
            p.id, 
            p.created_at, 
            f.numero, 
            c.nom AS client, 
            p.nom as description, 
            p.prix_unitaire as montantTTC, 
            '' as modePaiement, 
            '20%' as TVA, 
            '20€' as montantTVA, 
            'p.' as montantHT, 
            'p.' as observation
        FROM produits p
        LEFT JOIN factures f ON p.facture_id = f.id -- Jointure avec la table 'factures' sur 'facture_id'
        LEFT JOIN clients c ON f.client_id = c.id  -- Jointure avec la table 'clients' sur 'client_id'
        WHERE p.societe_id = ?
        ORDER BY p.created_at DESC`,
      [societeId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

module.exports = router;
