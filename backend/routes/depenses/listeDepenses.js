const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Lister TOUS les achats pour validation (route manager)
router.get('/depenses/all', async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    statut, 
    dateDebut, 
    dateFin,
    search,
    categorie_id 
  } = req.query;

  try {
    // Construction de la requête dynamique pour les achats
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    
    // Filtres
    if (statut) {
      whereClause += ' AND a.statut = ?';
      queryParams.push(statut === 'en_attente' ? 'brouillon' : statut === 'validee' ? 'valide' : statut === 'refusee' ? 'refuse' : statut);
    }
    
    if (dateDebut) {
      whereClause += ' AND a.date_achat >= ?';
      queryParams.push(dateDebut);
    }
    
    if (dateFin) {
      whereClause += ' AND a.date_achat <= ?';
      queryParams.push(dateFin);
    }
    
    if (search) {
      whereClause += ' AND (a.description LIKE ? OR a.fournisseur_nom LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (categorie_id) {
      whereClause += ' AND a.categorie_achat_id = ?';
      queryParams.push(categorie_id);
    }

    // Requête principale avec JOIN pour les informations utilisateur et catégorie
    const query = `
      SELECT 
        a.id,
        'achat' as type,
        a.date_achat as date_depense,
        a.description,
        a.montant_ttc,
        a.montant_ht,
        a.montant_tva,
        a.taux_tva,
        CASE 
          WHEN a.statut = 'brouillon' THEN 'en_attente'
          WHEN a.statut = 'valide' THEN 'validee'
          WHEN a.statut = 'refuse' THEN 'refusee'
          ELSE a.statut
        END as statut,
        a.justificatif_path as justificatif_url,
        a.created_at,
        'Système' as firstName,
        'Vinisys' as lastName,
        'system@vinisys.com' as email,
        ca.nom as categorie_nom,
        a.fournisseur_nom as lieu
      FROM achats a
      LEFT JOIN categories_achats ca ON a.categorie_achat_id = ca.id
      ${whereClause}
      ORDER BY a.date_achat DESC, a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.query(query, queryParams);
    
    // Requête pour le total des enregistrements
    const countQuery = `
      SELECT COUNT(*) as total
      FROM achats a
      LEFT JOIN categories_achats ca ON a.categorie_achat_id = ca.id
      ${whereClause}
    `;
    
    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2));
    const totalRecords = countResult[0].total;
    
    // Calcul des totaux par statut avec conversion des statuts
    const statsQuery = `
      SELECT 
        CASE 
          WHEN statut = 'brouillon' THEN 'en_attente'
          WHEN statut = 'valide' THEN 'validee'
          WHEN statut = 'refuse' THEN 'refusee'
          ELSE statut
        END as statut_convertit,
        COUNT(*) as count,
        SUM(montant_ttc) as total_montant
      FROM achats a
      ${whereClause}
      GROUP BY statut_convertit
    `;
    
    const [statsRows] = await db.query(statsQuery, queryParams.slice(0, -2));
    
    const stats = {
      en_attente: { count: 0, montant: 0 },
      validee: { count: 0, montant: 0 },
      refusee: { count: 0, montant: 0 }
    };
    
    statsRows.forEach(row => {
      if (stats[row.statut_convertit]) {
        stats[row.statut_convertit] = {
          count: row.count,
          montant: parseFloat(row.total_montant || 0)
        };
      }
    });

    res.json({
      depenses: rows.map(row => ({
        ...row,
        montant_ttc: parseFloat(row.montant_ttc),
        montant_ht: parseFloat(row.montant_ht),
        montant_tva: parseFloat(row.montant_tva),
        taux_tva: parseFloat(row.taux_tva)
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
    console.error('Erreur lors de la récupération des achats pour validation:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
});

// Lister les dépenses (achats) avec filtres et pagination - Tableau de bord
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
    
    // Construction de la requête dynamique pour les achats
    let whereClause = 'WHERE a.societe_id = ?';
    let queryParams = [societeId];
    
    // Filtres - conversion des statuts
    if (statut) {
      if (statut === 'en_attente') {
        whereClause += ' AND a.statut = ?';
        queryParams.push('brouillon');
      } else if (statut === 'validee') {
        whereClause += ' AND a.statut = ?';
        queryParams.push('valide');
      } else if (statut === 'refusee') {
        whereClause += ' AND a.statut = ?';
        queryParams.push('refuse');
      } else {
        whereClause += ' AND a.statut = ?';
        queryParams.push(statut);
      }
    }
    
    if (dateDebut) {
      whereClause += ' AND a.date_achat >= ?';
      queryParams.push(dateDebut);
    }
    
    if (dateFin) {
      whereClause += ' AND a.date_achat <= ?';
      queryParams.push(dateFin);
    }

    if (search) {
      whereClause += ' AND (a.description LIKE ? OR a.fournisseur_nom LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Requête principale avec JOIN pour les informations de catégorie
    const query = `
      SELECT 
        a.id,
        'achat' as type,
        a.date_achat as date_depense,
        a.description,
        a.montant_ttc,
        a.montant_ht,
        a.montant_tva,
        a.taux_tva,
        a.tva_deductible,
        CASE 
          WHEN a.statut = 'brouillon' THEN 'en_attente'
          WHEN a.statut = 'valide' THEN 'validee'
          WHEN a.statut = 'refuse' THEN 'refusee'
          ELSE a.statut
        END as statut,
        a.justificatif_path,
        a.created_at,
        'Système' as firstName,
        'Vinisys' as lastName,
        ca.nom as categorie_nom,
        a.fournisseur_nom as lieu
      FROM achats a
      LEFT JOIN categories_achats ca ON a.categorie_achat_id = ca.id
      ${whereClause}
      ORDER BY a.date_achat DESC, a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.query(query, queryParams);
    
    // Requête pour le total des enregistrements
    const countQuery = `
      SELECT COUNT(*) as total
      FROM achats a
      LEFT JOIN categories_achats ca ON a.categorie_achat_id = ca.id
      ${whereClause}
    `;
    
    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2));
    const totalRecords = countResult[0].total;
    
    // Calcul des totaux par statut avec conversion des statuts
    const statsQuery = `
      SELECT 
        CASE 
          WHEN statut = 'brouillon' THEN 'en_attente'
          WHEN statut = 'valide' THEN 'validee'
          WHEN statut = 'refuse' THEN 'refusee'
          ELSE statut
        END as statut_convertit,
        COUNT(*) as count,
        SUM(montant_ttc) as total_montant
      FROM achats a
      ${whereClause}
      GROUP BY statut_convertit
    `;
    
    const [statsRows] = await db.query(statsQuery, queryParams.slice(0, -2));
    
    // Calculer les statistiques TVA pour toutes les dépenses validées de la société
    const tvaStatsQuery = `
      SELECT 
        SUM(CASE WHEN a.tva_deductible = 1 AND a.statut = 'valide' THEN a.montant_tva ELSE 0 END) as tva_deductible,
        SUM(CASE WHEN a.tva_deductible = 0 AND a.statut = 'valide' THEN a.montant_tva ELSE 0 END) as tva_non_deductible
      FROM achats a
      WHERE a.societe_id = ?
    `;
    
    const [tvaStats] = await db.query(tvaStatsQuery, [societeId]);
    
    const stats = {
      en_attente: { count: 0, montant: 0 },
      validee: { count: 0, montant: 0 },
      refusee: { count: 0, montant: 0 },
      tva_deductible: parseFloat(tvaStats[0]?.tva_deductible || 0),
      tva_non_deductible: parseFloat(tvaStats[0]?.tva_non_deductible || 0)
    };
    
    statsRows.forEach(row => {
      if (stats[row.statut_convertit]) {
        stats[row.statut_convertit] = {
          count: row.count,
          montant: parseFloat(row.total_montant || 0)
        };
      }
    });

    res.json({
      depenses: rows.map(row => ({
        ...row,
        montant_ttc: parseFloat(row.montant_ttc),
        montant_ht: parseFloat(row.montant_ht),
        montant_tva: parseFloat(row.montant_tva),
        taux_tva: parseFloat(row.taux_tva)
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