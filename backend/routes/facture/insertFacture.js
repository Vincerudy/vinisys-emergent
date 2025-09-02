const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour créer une facture et ajouter des produits associés
router.post('/factures', async (req, res) => {
  const {
    client,
    date,
    totalAmount,
    products,
    type,
    totalTTC,
    totalTVA,
    totalHT,
 
    taxe_secondaire,
    total_taxe_secondaire,
    entryMode,
    numero,
    societe_id,
    // Nouveaux champs pour les avoirs
    facture_origine_id,
    facture_origine_numero
  } = req.body;

  // Validation des données
  if (!client || !date || !totalAmount || !products || products.length === 0) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    console.log('DEBUG: Valeurs reçues:', {
      client, societe_id, date, totalTTC, numero, type, totalHT, entryMode, totalTVA
    });

    // Test avec requête incluant les nouvelles colonnes TPS
    const [factureResult] = await connection.query(
      `INSERT INTO factures (client_id, societe_id, date_facture, total, statut, numero, type_fact, ht, type_saisie, total_tva,   taxe_secondaire, total_taxe_secondaire)
       VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client,
        societe_id,
        date,
        totalTTC,
        'en attente',
        numero,
        type,
        totalHT,
        entryMode,
        totalTVA,
 
        taxe_secondaire || null,
        total_taxe_secondaire || '0'
      ]
    );

    console.log('DEBUG: Insertion réussie, ID:', factureResult.insertId);

    const factureId = factureResult.insertId;

    // Récupérer les taux de TVA valides
    const [rows] = await db.query(
      `SELECT taux FROM tva WHERE societe_id = ? AND active = 'O'`,
      [societe_id]
    );
    const validTVAValues = rows.map(row => parseFloat(row.taux));

    // Vérifier si la saisie est TTC
    const [paramData] = await db.query(
      `SELECT enableTTC FROM societe_parametrage_facturation WHERE societe_id = ?
       UNION 
       SELECT 1 AS enableTTC FROM DUAL
       LIMIT 1`,
      [societe_id]
    );
    const TTC = paramData[0].enableTTC;

    // Insérer les produits liés à la facture
    for (let produit of products) {
      const { productName, quantity, price, tva, id } = produit;
      let total_tva = 0;
      let montant_total = quantity * price

      if (tva !== undefined && tva !== null) {
        const tauxTVA = parseFloat(tva);
        if (!validTVAValues.includes(tauxTVA)) {
          return res.status(400).json({
            message: `La valeur de la TVA ${tva}% n'est pas valide pour la société.`
          });
        }

        if (TTC === 1) {
          total_tva = (montant_total * tauxTVA) / (100 + tauxTVA); // calcul si saisie TTC
        } else {
          total_tva = (montant_total * tauxTVA) / 100; // calcul si saisie HT
        }
        
        // Arrondir à 2 décimales maximum pour éviter dépassement de 10 caractères
        total_tva = parseFloat(total_tva.toFixed(2));
      }

      await connection.query(
        `INSERT INTO produits (societe_id, facture_id, nom, quantite, prix_unitaire, taux_tva, total_tva, id_prod_serv)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [societe_id, factureId, productName, quantity, price, tva, total_tva, id]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Facture et produits ajoutés avec succès',
      factureId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de la création de la facture:', error.sqlMessage || error.message);
    res.status(500).json({
      message: 'Erreur lors de la création de la facture',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
