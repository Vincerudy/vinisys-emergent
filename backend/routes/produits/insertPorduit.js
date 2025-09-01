const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crée le dossier uploads s’il n’existe pas
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuration de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'prod-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

router.post('/produit', upload.single('image'), async (req, res) => {
  const {
    id,
    nom,
    description,
    prixUnitaire,
    quantiteEnStock,
    seuil,
    fournisseur,
    prixUnitaireHT,
    tva,
    dateDerniereEntree,
    categorie,
    sousCategorie,
    categorieId,
    sousCategorieId,
    societeId,
  } = req.body;

  // Vérification minimale (sans nom)
  if (!prixUnitaire || !quantiteEnStock || !societeId) {
    return res.status(400).json({ error: 'prixUnitaire, quantiteEnStock et societeId sont obligatoires' });
  }

  try {
    await db.query('START TRANSACTION');

    let produitId = id;

    if (!produitId) {
      const [result] = await db.query(
        `INSERT INTO produits_services 
         (nom, prixUnitaireHT, tva, description, prix_unitaire, quantite_en_stock, seuil_minimum, fournisseur, categorie, sous_categorie, categorie_id, sous_categorie_id, date_derniere_entree, societe_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nom || 'Produit sans nom',
          prixUnitaireHT || '0', 
          tva || '0', 
          description || '',
          prixUnitaire,
          quantiteEnStock,
          seuil || 0,
          fournisseur || null,
          categorie || null,
          sousCategorie || null,
          categorieId || null,
          sousCategorieId || null,
          dateDerniereEntree || null,
          societeId,
        ]
      );
      produitId = result.insertId;
    } else {
      await db.query(
        `UPDATE produits_services SET
          nom = ?, description = ?, prix_unitaire = ?, prixUnitaireHT = ?, tva = ?,  quantite_en_stock = ?, seuil_minimum = ?,
          fournisseur = ?, date_derniere_entree = ?, societe_id = ?, categorie = ?, sous_categorie = ?
          WHERE id = ?`,
        [
          nom || 'Produit sans nom',
          description || '',
          prixUnitaire,
          prixUnitaireHT || '0', 
          tva || '0', 
          quantiteEnStock,
          seuil || 0,
          fournisseur || null,
          dateDerniereEntree || null,
          societeId,
          categorie,
          sousCategorie,
          produitId,
        ]
      );
    }

    if (req.file) {
      const imagePath = path.relative(path.join(__dirname, '../../'), req.file.path).replace(/\\/g, '/');
      const dateAjout = new Date();

      await db.query(
        `INSERT INTO upload_fichier (fk, societe_id, path, date_ajout, file_type)
         VALUES (?, ?, ?, ?, 'PROD_IMG_DESC')`,
        [produitId, societeId, imagePath, dateAjout]
      );
    }

    await db.query('COMMIT');
    return res.json({ message: 'Produit enregistré avec succès', produitId });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Erreur création produit:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la sauvegarde du produit' });
  }
});

module.exports = router;
