const express = require('express');
const db = require('../../config/db');
const router = express.Router();

// GET /cahier-recettes/:societe_id - Récupérer les recettes (factures payées) d'une société
router.get('/cahier-recettes/:societe_id', async (req, res) => {
  try {
    const { societe_id } = req.params;
    const { mois, annee, date_debut, date_fin, client, produit } = req.query;

    console.log('Récupération cahier recettes pour société:', societe_id);
    console.log('Filtres:', { mois, annee, date_debut, date_fin, client, produit });

    let query = `
      SELECT 
        f.id as facture_id,
        f.numero,
        f.date_facture,
        c.nom as client_nom,
        p.id as produit_id,
        p.nom as produit_nom,
        p.prix_unitaire,
        p.quantite,
        p.taux_tva,
        p.total_tva as montant_tva_produit,
        (p.prix_unitaire * p.quantite) as montant_ht_produit,
        (p.prix_unitaire * p.quantite + p.total_tva) as montant_ttc_produit,
        COALESCE(rm.mode_reglement, 'Non spécifié') as mode_paiement,
        rm.dat as date_paiement,
        COALESCE(rm.montant_paye, 0) as montant_paye,
        '' as observation
      FROM produits p
      JOIN factures f ON f.id = p.facture_id
      JOIN clients c ON c.id = f.client_id
      LEFT JOIN Reglement_mode rm ON rm.numero_facture = f.numero
      WHERE f.societe_id = ?
        AND (
          f.statut IN ('payée', 'accepté') 
          OR rm.numero_facture IS NOT NULL
        )
    `;

    let params = [societe_id];

    // Filtre par période (mois/année ou plage de dates)
    if (date_debut && date_fin) {
      query += ` AND f.date_facture BETWEEN ? AND ?`;
      params.push(date_debut, date_fin);
    } else if (mois && annee) {
      query += ` AND MONTH(STR_TO_DATE(f.date_facture, '%Y-%m-%d')) = ? AND YEAR(STR_TO_DATE(f.date_facture, '%Y-%m-%d')) = ?`;
      params.push(parseInt(mois), parseInt(annee));
    } else {
      // Par défaut : mois en cours
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      query += ` AND MONTH(STR_TO_DATE(f.date_facture, '%Y-%m-%d')) = ? AND YEAR(STR_TO_DATE(f.date_facture, '%Y-%m-%d')) = ?`;
      params.push(currentMonth, currentYear);
    }

    // Filtre par client
    if (client) {
      query += ` AND c.nom LIKE ?`;
      params.push(`%${client}%`);
    }

    // Filtre par produit
    if (produit) {
      query += ` AND p.nom LIKE ?`;
      params.push(`%${produit}%`);
    }

    query += ` ORDER BY f.date_facture DESC, f.numero ASC, p.nom ASC`;

    console.log('Requête SQL:', query);
    console.log('Paramètres:', params);

    const [rows] = await db.query(query, params);

    // Traitement des données pour correspondre au format attendu par le frontend
    const recettes = rows.map(row => ({
      id: `${row.facture_id}_${row.produit_id}`, // ID unique pour chaque ligne produit
      date: row.date_facture,
      numero: row.numero,
      client: row.client_nom,
      description: row.produit_nom,
      montantTTC: parseFloat(row.montant_ttc_produit) || 0,
      montantHT: parseFloat(row.montant_ht_produit) || 0,
      montantTVA: parseFloat(row.montant_tva_produit) || 0,
      TVA: parseFloat(row.taux_tva?.replace('%', '')) || 0,
      quantite: parseInt(row.quantite) || 1,
      prixUnitaire: parseFloat(row.prix_unitaire) || 0,
      modePaiement: row.mode_paiement,
      observation: row.observation || '',
      datePaiement: row.date_paiement,
      montantPaye: parseFloat(row.montant_paye) || 0
    }));

    // Calculs de statistiques
    const totalRecettes = recettes.reduce((sum, r) => sum + r.montantTTC, 0);
    const totalHT = recettes.reduce((sum, r) => sum + r.montantHT, 0);
    const totalTVA = recettes.reduce((sum, r) => sum + r.montantTVA, 0);
    const nombreLignes = recettes.length;
    const nombreFactures = [...new Set(recettes.map(r => r.numero))].length;

    const stats = {
      totalRecettes: totalRecettes,
      totalHT: totalHT,
      totalTVA: totalTVA,
      nombreFactures: nombreFactures,
      nombreLignes: nombreLignes,
      moyenneParFacture: nombreFactures > 0 ? totalRecettes / nombreFactures : 0
    };

    console.log(`Recettes trouvées: ${nombreLignes} lignes de produits dans ${nombreFactures} factures pour un total de ${totalRecettes}€`);

    res.json({
      success: true,
      data: recettes,
      stats: stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du cahier de recettes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cahier de recettes',
      error: error.message
    });
  }
});

// GET /cahier-recettes/stats/:societe_id - Récupérer les statistiques de recettes par produit
router.get('/cahier-recettes/stats/:societe_id', async (req, res) => {
  try {
    const { societe_id } = req.params;
    const { mois, annee, date_debut, date_fin } = req.query;

    let query = `
      SELECT 
        p.nom as produit_nom,
        SUM(p.quantite) as quantite_totale,
        SUM(p.prix_unitaire * p.quantite) as ca_ht,
        SUM(p.prix_unitaire * p.quantite + p.total_tva) as ca_ttc,
        COUNT(DISTINCT f.id) as nombre_factures
      FROM produits p
      JOIN factures f ON f.id = p.facture_id
      WHERE f.societe_id = ?
        AND f.statut IN ('payée', 'accepté')
    `;

    let params = [societe_id];

    // Même logique de filtrage que pour la requête principale
    if (date_debut && date_fin) {
      query += ` AND f.date_facture BETWEEN ? AND ?`;
      params.push(date_debut, date_fin);
    } else if (mois && annee) {
      query += ` AND MONTH(STR_TO_DATE(f.date_facture, '%Y-%m-%d')) = ? AND YEAR(STR_TO_DATE(f.date_facture, '%Y-%m-%d')) = ?`;
      params.push(parseInt(mois), parseInt(annee));
    } else {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      query += ` AND MONTH(STR_TO_DATE(f.date_facture, '%Y-%m-%d')) = ? AND YEAR(STR_TO_DATE(f.date_facture, '%Y-%m-%d')) = ?`;
      params.push(currentMonth, currentYear);
    }

    query += ` GROUP BY p.nom ORDER BY ca_ttc DESC`;

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

module.exports = router;