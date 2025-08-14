const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Récupérer les détails d'une dépense
router.get('/depense/:depenseId', async (req, res) => {
  const depenseId = req.params.depenseId;
  
  try {
    // Requête principale pour récupérer la dépense avec tous les détails
    const query = `
      SELECT 
        d.id,
        d.user_id,
        d.type,
        d.date_depense,
        d.description,
        d.montant_ttc,
        d.montant_ht,
        d.montant_tva,
        d.taux_tva,
        d.statut,
        d.motif_refus,
        d.validee_le,
        d.client_id,
        d.projet_id,
        d.justificatif_url,
        d.justificatif_filename,
        d.created_at,
        d.updated_at,
        u.firstName,
        u.lastName,
        u.email,
        uv.firstName as valideur_firstName,
        uv.lastName as valideur_lastName,
        c.nom as categorie_nom,
        c.description as categorie_description,
        cl.nom as client_nom,
        dk.lieu_depart,
        dk.lieu_arrivee,
        dk.distance_km,
        dk.type_vehicule,
        bk.nom as bareme_nom,
        bk.tarif_par_km,
        dr.lieu as lieu_repas,
        dr.nombre_personnes,
        dr.type_repas
      FROM depenses d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN users uv ON d.validee_par = uv.id
      LEFT JOIN categories_depenses c ON d.categorie_id = c.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      LEFT JOIN depenses_kilometriques dk ON d.id = dk.depense_id
      LEFT JOIN baremes_kilometriques bk ON dk.bareme_id = bk.id
      LEFT JOIN depenses_repas dr ON d.id = dr.depense_id
      WHERE d.id = ?
    `;
    
    const [rows] = await db.query(query, [depenseId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }
    
    const depense = rows[0];
    
    // Récupérer l'historique des actions
    const historiqueQuery = `
      SELECT 
        h.id,
        h.action,
        h.statut_ancien,
        h.statut_nouveau,
        h.commentaire,
        h.created_at,
        u.firstName,
        u.lastName
      FROM historique_depenses h
      LEFT JOIN users u ON h.user_id = u.id
      WHERE h.depense_id = ?
      ORDER BY h.created_at DESC
    `;
    
    const [historiqueRows] = await db.query(historiqueQuery, [depenseId]);
    
    // Formater la réponse
    const response = {
      ...depense,
      montant_ttc: parseFloat(depense.montant_ttc),
      montant_ht: parseFloat(depense.montant_ht),
      montant_tva: parseFloat(depense.montant_tva),
      taux_tva: parseFloat(depense.taux_tva),
      distance_km: depense.distance_km ? parseInt(depense.distance_km) : null,
      tarif_par_km: depense.tarif_par_km ? parseFloat(depense.tarif_par_km) : null,
      nombre_personnes: depense.nombre_personnes ? parseInt(depense.nombre_personnes) : null,
      historique: historiqueRows.map(h => ({
        ...h,
        created_at: h.created_at
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la dépense:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
});

module.exports = router;