const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Export CSV des dépenses
router.get('/export/csv/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { dateDebut, dateFin, type, statut } = req.query;
  
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
    
    // Construction de la requête avec filtres
    let whereClause = 'WHERE d.societe_id = ?';
    let queryParams = [societeId];
    
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

    const query = `
      SELECT 
        d.id,
        d.type,
        d.date_depense,
        d.description,
        d.montant_ttc,
        d.montant_ht,
        d.montant_tva,
        d.statut,
        CONCAT(u.firstName, ' ', u.lastName) as employe,
        c.nom as categorie,
        CASE 
          WHEN d.type = 'kilometrique' THEN CONCAT(dk.lieu_depart, ' → ', dk.lieu_arrivee)
          WHEN d.type = 'repas' THEN dr.lieu
          ELSE ''
        END as lieu,
        CASE 
          WHEN d.type = 'kilometrique' THEN dk.distance_km
          ELSE NULL
        END as distance_km,
        d.created_at
      FROM depenses d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN categories_depenses c ON d.categorie_id = c.id
      LEFT JOIN depenses_kilometriques dk ON d.id = dk.depense_id
      LEFT JOIN depenses_repas dr ON d.id = dr.depense_id
      ${whereClause}
      ORDER BY d.date_depense DESC
    `;
    
    const [rows] = await db.query(query, queryParams);
    
    // Générer le CSV
    const csvHeader = 'ID,Type,Date,Description,Montant TTC,Montant HT,TVA,Statut,Employé,Catégorie,Lieu,Distance (km),Date création\n';
    
    const csvRows = rows.map(row => {
      const fields = [
        row.id,
        row.type,
        row.date_depense,
        `"${(row.description || '').replace(/"/g, '""')}"`,
        row.montant_ttc,
        row.montant_ht,
        row.montant_tva,
        row.statut,
        `"${row.employe || ''}"`,
        `"${row.categorie || ''}"`,
        `"${row.lieu || ''}"`,
        row.distance_km || '',
        row.created_at
      ];
      return fields.join(',');
    }).join('\n');
    
    const csv = csvHeader + csvRows;
    
    // Définir les headers pour le téléchargement
    const filename = `depenses_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    
    // Ajouter BOM UTF-8 pour Excel
    res.write('\ufeff');
    res.end(csv);
    
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'export CSV', 
      error: error.message 
    });
  }
});

// Statistiques des dépenses
router.get('/stats/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { periode = '12', annee } = req.query; // période en mois, par défaut 12 derniers mois
  
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
    
    // Calculer la date de début selon la période
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    
    if (annee) {
      startDate.setFullYear(parseInt(annee), 0, 1);
      currentDate.setFullYear(parseInt(annee), 11, 31);
    } else {
      startDate.setMonth(currentDate.getMonth() - parseInt(periode));
    }
    
    // Stats générales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_depenses,
        SUM(montant_ttc) as montant_total,
        AVG(montant_ttc) as montant_moyen,
        statut,
        COUNT(*) as count_by_status
      FROM depenses 
      WHERE societe_id = ? AND date_depense BETWEEN ? AND ?
      GROUP BY statut
    `;
    
    const [statsRows] = await db.query(statsQuery, [
      societeId, 
      startDate.toISOString().split('T')[0], 
      currentDate.toISOString().split('T')[0]
    ]);
    
    // Stats par type
    const typeStatsQuery = `
      SELECT 
        type,
        COUNT(*) as nombre,
        SUM(montant_ttc) as montant_total,
        AVG(montant_ttc) as montant_moyen
      FROM depenses 
      WHERE societe_id = ? AND date_depense BETWEEN ? AND ?
      GROUP BY type
    `;
    
    const [typeStatsRows] = await db.query(typeStatsQuery, [
      societeId, 
      startDate.toISOString().split('T')[0], 
      currentDate.toISOString().split('T')[0]
    ]);
    
    // Stats mensuelles
    const monthlyStatsQuery = `
      SELECT 
        YEAR(date_depense) as annee,
        MONTH(date_depense) as mois,
        COUNT(*) as nombre_depenses,
        SUM(montant_ttc) as montant_total
      FROM depenses 
      WHERE societe_id = ? AND date_depense BETWEEN ? AND ?
      GROUP BY YEAR(date_depense), MONTH(date_depense)
      ORDER BY annee, mois
    `;
    
    const [monthlyStatsRows] = await db.query(monthlyStatsQuery, [
      societeId, 
      startDate.toISOString().split('T')[0], 
      currentDate.toISOString().split('T')[0]
    ]);
    
    // Top utilisateurs
    const topUsersQuery = `
      SELECT 
        CONCAT(u.firstName, ' ', u.lastName) as nom_complet,
        u.email,
        COUNT(*) as nombre_depenses,
        SUM(d.montant_ttc) as montant_total
      FROM depenses d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.societe_id = ? AND d.date_depense BETWEEN ? AND ?
      GROUP BY d.user_id, u.firstName, u.lastName, u.email
      ORDER BY montant_total DESC
      LIMIT 10
    `;
    
    const [topUsersRows] = await db.query(topUsersQuery, [
      societeId, 
      startDate.toISOString().split('T')[0], 
      currentDate.toISOString().split('T')[0]
    ]);
    
    // Formater les statistiques
    const stats = {
      en_attente: { count: 0, montant: 0 },
      validee: { count: 0, montant: 0 },
      refusee: { count: 0, montant: 0 },
      remboursee: { count: 0, montant: 0 }
    };
    
    let totalGeneral = 0;
    let nombreTotal = 0;
    
    statsRows.forEach(row => {
      stats[row.statut] = {
        count: row.count_by_status,
        montant: parseFloat(row.montant_total || 0)
      };
      totalGeneral += parseFloat(row.montant_total || 0);
      nombreTotal += row.count_by_status;
    });
    
    const typeStats = typeStatsRows.map(row => ({
      type: row.type,
      nombre: row.nombre,
      montant_total: parseFloat(row.montant_total),
      montant_moyen: parseFloat(row.montant_moyen)
    }));
    
    const monthlyStats = monthlyStatsRows.map(row => ({
      annee: row.annee,
      mois: row.mois,
      nombre_depenses: row.nombre_depenses,
      montant_total: parseFloat(row.montant_total)
    }));
    
    const topUsers = topUsersRows.map(row => ({
      nom_complet: row.nom_complet,
      email: row.email,
      nombre_depenses: row.nombre_depenses,
      montant_total: parseFloat(row.montant_total)
    }));
    
    res.json({
      periode: {
        debut: startDate.toISOString().split('T')[0],
        fin: currentDate.toISOString().split('T')[0],
        duree_mois: parseInt(periode)
      },
      resume: {
        nombre_total: nombreTotal,
        montant_total: totalGeneral,
        montant_moyen: nombreTotal > 0 ? totalGeneral / nombreTotal : 0
      },
      par_statut: stats,
      par_type: typeStats,
      evolution_mensuelle: monthlyStats,
      top_utilisateurs: topUsers
    });
    
  } catch (error) {
    console.error('Erreur lors de la génération des stats:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération des statistiques', 
      error: error.message 
    });
  }
});

module.exports = router;