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
        f.id,
        f.numero,
        f.date_facture,
        f.total as montant_ttc,
        f.ht as montant_ht,
        f.total_tva as montant_tva,
        c.nom as client_nom,
        COALESCE(rm.mode_reglement, 'Non spécifié') as mode_paiement,
        rm.dat as date_paiement,
        COALESCE(rm.montant_paye, 0) as montant_paye,
        CASE 
          WHEN f.ht > 0 THEN ROUND((f.total_tva / f.ht) * 100, 2)
          ELSE 0
        END as taux_tva,
        '' as observation
      FROM factures f
      JOIN clients c ON c.id = f.client_id
      LEFT JOIN Reglement_mode rm ON rm.numero_facture = f.numero
      WHERE f.societe_id = ?
        AND f.statut IN ('payée', 'accepté')
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

    query += ` ORDER BY f.date_facture DESC, f.numero ASC`;

    console.log('Requête SQL:', query);
    console.log('Paramètres:', params);

    const [rows] = await db.query(query, params);

    // Traitement des données pour correspondre au format attendu par le frontend
    const recettes = rows.map(row => ({
      id: row.id,
      date: row.date_facture,
      numero: row.numero,
      client: row.client_nom,
      description: `Facture ${row.numero}`, // On peut enrichir avec les lignes de facture plus tard
      montantTTC: parseFloat(row.montant_ttc) || 0,
      montantHT: parseFloat(row.montant_ht) || 0,
      montantTVA: parseFloat(row.montant_tva) || 0,
      TVA: parseFloat(row.taux_tva) || 20,
      modePaiement: row.mode_paiement,
      observation: row.observation || '',
      datePaiement: row.date_paiement,
      montantPaye: parseFloat(row.montant_paye) || 0
    }));

    // Calculs de statistiques
    const totalRecettes = recettes.reduce((sum, r) => sum + r.montantTTC, 0);
    const totalHT = recettes.reduce((sum, r) => sum + r.montantHT, 0);
    const totalTVA = recettes.reduce((sum, r) => sum + r.montantTVA, 0);
    const nombreFactures = recettes.length;

    const stats = {
      totalRecettes: totalRecettes,
      totalHT: totalHT,
      totalTVA: totalTVA,
      nombreFactures: nombreFactures,
      moyenneParFacture: nombreFactures > 0 ? totalRecettes / nombreFactures : 0
    };

    console.log(`Recettes trouvées: ${recettes.length} factures pour un total de ${totalRecettes}€`);

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

// GET /cahier-recettes/details/:factureId - Récupérer le détail d'une facture (lignes de produits)
router.get('/cahier-recettes/details/:factureId', async (req, res) => {
  try {
    const { factureId } = req.params;

    const query = `
      SELECT 
        lf.produit_nom,
        lf.description,
        lf.quantite,
        lf.prix_unitaire_ht,
        lf.montant as montant_ligne,
        lf.taux_tva,
        lf.montant_tva as tva_ligne
      FROM lignes_facture lf
      WHERE lf.facture_id = ?
      ORDER BY lf.id
    `;

    const [rows] = await db.query(query, [factureId]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la facture:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails de la facture',
      error: error.message
    });
  }
});

module.exports = router;