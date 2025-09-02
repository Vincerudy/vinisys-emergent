const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Adapté à ta config MySQL

// Route GET pour récupérer les produits avec leurs images (left join)
router.get('/produits/:id', async (req, res) => {
    const {id} = req.params
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
        prod.categorie,
        prod.reference,
        prod.stock_reel,
        prod.sous_categorie,
        prod.categorie_id,
        prod.sous_categorie_id,
        prod.seuil_minimum as seuil,
        prod.statut_inventaire, 
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
      WHERE prod.societe_id = ?
      ORDER BY prod.id DESC
    `, [id]); // 🔁 Tu peux remplacer 2 par req.query.societe_id ou un token

    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits' });
  }
});

module.exports = router;
