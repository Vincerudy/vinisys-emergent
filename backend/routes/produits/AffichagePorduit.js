const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Adapté à ta config MySQL

// Route GET pour récupérer un seul produit avec son image
router.get('/produit/:id/:societe_id', async (req, res) => {
  const { id, societe_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        prod.id,
        prod.nom, 
        prod.description, 
        prod.quantite_en_stock,
        prod.prix_unitaire as prixUnitaire,
        prod.prixUnitaireHT,
        prod.tva,
        prod.categorie_id,
        prod.sous_categorie_id,
        prod.categorie,
        prod.sous_categorie,
        prod.seuil_minimum as seuil,
        fich.path AS image_path,
        cat.nom as categorie_nom,
        sous_cat.nom as sous_categorie_nom
      FROM produits_services prod
      LEFT JOIN upload_fichier fich
        ON fich.fk = prod.id AND fich.societe_id = prod.societe_id AND fich.file_type = 'PROD_IMG_DESC'
      LEFT JOIN categories_stock cat
        ON cat.id = prod.categorie_id
      LEFT JOIN sous_categories_stock sous_cat
        ON sous_cat.id = prod.sous_categorie_id
      WHERE prod.id = ? AND prod.societe_id = ?
      LIMIT 1
    `, [id, societe_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur récupération produit:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du produit' });
  }
});

module.exports = router;
