const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route POST pour importer une liste de produits
router.post('/import-produits', async (req, res) => {
  const { produits, societe_id, user_id } = req.body;

  if (!Array.isArray(produits) || produits.length === 0) {
    return res.status(400).json({ error: 'Aucun produit fourni.' });
  }

  const dateMouvement = new Date();

  try {
    for (const produit of produits) {
      const {
        nom,
        description = '',
        stock_disponible = 0,
        prix_unitaire_ht = 0,
        seuil_minimum = 0,
        categorie = '',
        sous_categorie = '',
        tva = 0
      } = produit;

      // Calcul du prix TTC
      const tauxTVA = parseFloat(tva) > 0 ? parseFloat(tva) / 100 : 0;
      const prixunitaireTTC = parseFloat(prix_unitaire_ht) * (1 + tauxTVA);

      // Vérifier si le produit existe déjà (par nom + société)
      const [rows] = await db.query(
        'SELECT id, quantite_en_stock FROM produits_services WHERE nom = ? AND societe_id = ?',
        [nom, societe_id]
      );

      let produitId;
      const quantiteImportee = parseInt(stock_disponible, 10) || 0;

      if (rows.length > 0) {
        // Produit existe => Mise à jour du stock
        const quantiteExistante = rows[0].quantite_en_stock || 0;
        const nouvelleQuantite = quantiteExistante + quantiteImportee;

        await db.query(
          'UPDATE produits_services SET quantite_en_stock = ?, date_derniere_entree = ? WHERE id = ?',
          [nouvelleQuantite, dateMouvement, rows[0].id]
        );

        produitId = rows[0].id;
      } else {
        // Produit n'existe pas => Insertion
        const [result] = await db.query(
          `INSERT INTO produits_services 
            (nom, description, prix_unitaire, quantite_en_stock, seuil_minimum, categorie, sous_categorie, societe_id, date_derniere_entree) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [nom, description, prixunitaireTTC, quantiteImportee, seuil_minimum, categorie, sous_categorie, societe_id, dateMouvement]
        );

        produitId = result.insertId;
      }

      // Insertion du mouvement de stock
      await db.query(
        `INSERT INTO mouvements_stock 
          (produit_id, societe_id, type, quantite, motif, user_id, date_mouvement, created_at)
         VALUES (?, ?, 'ENTREE', ?, 'Import de stock', ?, ?, NOW())`,
        [produitId, societe_id, quantiteImportee, user_id, dateMouvement]
      );
    }

    res.status(200).json({ message: 'Importation terminée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l’importation :', error);
    res.status(500).json({ error: 'Erreur serveur lors de l’importation des produits.' });
  }
});


module.exports = router;
