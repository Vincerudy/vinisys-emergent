const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Lister les dépenses avec filtres et pagination
router.get('/depenses/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { 
    page = 1, 
    limit = 20, 
    type, 
    statut, 
    dateDebut, 
    dateFin,
    search 
  } = req.query;

  try {
    // Récupérer la société de l'utilisateur
    const [societeRows] = await db.query(
      'SELECT societe_id FROM users WHERE id = ?', 
      [userId]
    );
    
    if (societeRows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const societeId = societeRows[0].societe_id;
    
    // Construction de la requête dynamique
    let whereClause = 'WHERE d.societe_id = ?';
    let queryParams = [societeId];
    
    // Filtres
    if (type) {
      whereClause += ' AND d.type = ?';
      queryParams.push(type);
    }
    
    if (statut) {
      whereClause += ' AND d.statut = ?';
      queryParams.push(statut);
    }
    
    if (dateDebut) {
      whereClause += ' AND d.date_depense >= ?';
      queryParams.push(dateDebut);
    }
    
    if (dateFin) {
      whereClause += ' AND d.date_depense <= ?';
      queryParams.push(dateFin);
    }
    
    if (search) {
      whereClause += ' AND (d.description LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Requête principale avec JOIN pour les informations utilisateur et catégorie
    const query = `
      SELECT 
        d.id,
        d.type,
        d.date_depense,
        d.description,
        d.montant_ttc,
        d.montant_ht,
        d.montant_tva,
        d.taux_tva,
        d.statut,
        d.justificatif_url,
        d.justificatif_filename,
        d.created_at,
        u.firstName,
        u.lastName,
        u.email,
        c.nom as categorie_nom,
        CASE 
          WHEN d.type = 'kilometrique' THEN dk.lieu_depart
          WHEN d.type = 'repas' THEN dr.lieu
          ELSE NULL
        END as lieu,
        CASE 
          WHEN d.type = 'kilometrique' THEN dk.lieu_arrivee
          ELSE NULL
        END as lieu_arrivee,
        CASE 
          WHEN d.type = 'kilometrique' THEN dk.distance_km
          ELSE NULL
        END as distance_km
      FROM depenses d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN categories_depenses c ON d.categorie_id = c.id
      LEFT JOIN depenses_kilometriques dk ON d.id = dk.depense_id
      LEFT JOIN depenses_repas dr ON d.id = dr.depense_id
      ${whereClause}
      ORDER BY d.date_depense DESC, d.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.query(query, queryParams);
    
    // Requête pour le total des enregistrements
    const countQuery = `
      SELECT COUNT(DISTINCT d.id) as total
      FROM depenses d
      LEFT JOIN users u ON d.user_id = u.id
      ${whereClause}
    `;
    
    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2));
    const totalRecords = countResult[0].total;
    
    // Calcul des totaux par statut
    const statsQuery = `
      SELECT 
        statut,
        COUNT(*) as count,
        SUM(montant_ttc) as total_montant
      FROM depenses d
      ${whereClause}
      GROUP BY statut
    `;
    
    const [statsRows] = await db.query(statsQuery, queryParams.slice(0, -2));
    
    const stats = {
      en_attente: { count: 0, montant: 0 },
      validee: { count: 0, montant: 0 },
      refusee: { count: 0, montant: 0 },
      remboursee: { count: 0, montant: 0 }
    };
    
    statsRows.forEach(row => {
      stats[row.statut] = {
        count: row.count,
        montant: parseFloat(row.total_montant || 0)
      };
    });

    res.json({
      depenses: rows.map(row => ({
        ...row,
        montant_ttc: parseFloat(row.montant_ttc),
        montant_ht: parseFloat(row.montant_ht),
        montant_tva: parseFloat(row.montant_tva),
        taux_tva: parseFloat(row.taux_tva),
        distance_km: row.distance_km ? parseInt(row.distance_km) : null
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
        limit: parseInt(limit)
      },
      stats
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
});

module.exports = router;