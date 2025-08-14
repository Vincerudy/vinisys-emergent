const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route POST pour enregistrer un mouvement de stock
router.post('/mouvement-stock', async (req, res) => {
  let { produit_id, societe_id, type, quantite, motif, user_id, date_mouvement } = req.body;

  // Convertir en types corrects
  produit_id = parseInt(produit_id);
  societe_id = parseInt(societe_id);
  quantite = parseInt(quantite);
  user_id = parseInt(user_id);

  if (!['ENTREE', 'SORTIE'].includes(type)) {
    return res.status(400).json({ error: 'Type de mouvement invalide. Doit être ENTREE ou SORTIE.' });
  }

  try {
    // 1. Récupérer la quantité actuelle en stock
    const [produitRows] = await db.query(
      'SELECT quantite_en_stock FROM produits_services WHERE id = ? AND societe_id = ?',
      [produit_id, societe_id]
    );

    if (produitRows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé pour cette société.' });
    }

    const quantiteActuelle = produitRows[0].quantite_en_stock;

    let nouvelleQuantite;

    if (type === 'ENTREE') {
      nouvelleQuantite = quantiteActuelle + quantite;
    } else {
      if (quantite > quantiteActuelle) {
        return res.status(400).json({
          error: `Il reste seulement ${quantiteActuelle} exemplaire(s) en stock. Vous ne pouvez pas sortir ${quantite}.`
        });
      }
      nouvelleQuantite = quantiteActuelle - quantite;
    }

    // 2. Mettre à jour la quantité
    await db.query(
      'UPDATE produits_services SET quantite_en_stock = ? WHERE id = ? AND societe_id = ?',
      [nouvelleQuantite, produit_id, societe_id]
    );

    // 3. Insérer le mouvement
    await db.query(
      `INSERT INTO mouvements_stock 
        (produit_id, societe_id, type, quantite, motif, user_id, date_mouvement)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [produit_id, societe_id, type, quantite, motif, user_id, date_mouvement]
    );

    res.status(201).json({ message: 'Mouvement enregistré avec succès.', nouvelle_quantite: nouvelleQuantite });
  } catch (error) {
    console.error('Erreur enregistrement mouvement stock :', error);
    res.status(500).json({ error: 'Erreur serveur lors de l’enregistrement du mouvement de stock.' });
  }
});


module.exports = router;
