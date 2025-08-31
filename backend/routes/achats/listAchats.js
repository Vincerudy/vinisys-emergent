const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/achats/:societeId - Liste des achats avec filtres
router.get('/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const { 
            page = 1, 
            limit = 20, 
            dateDebut, 
            dateFin, 
            fournisseur, 
            statut, 
            categorie,
            projet,
            search 
        } = req.query;

        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE a.societe_id = ?';
        let params = [societeId];

        // Filtres
        if (dateDebut) {
            whereClause += ' AND a.date_achat >= ?';
            params.push(dateDebut);
        }
        if (dateFin) {
            whereClause += ' AND a.date_achat <= ?';
            params.push(dateFin);
        }
        if (fournisseur) {
            whereClause += ' AND a.fournisseur_id = ?';
            params.push(fournisseur);
        }
        if (statut && statut !== 'all') {
            whereClause += ' AND a.statut = ?';
            params.push(statut);
        }
        if (categorie) {
            whereClause += ' AND a.categorie_achat_id = ?';
            params.push(categorie);
        }
        if (search) {
            whereClause += ' AND (a.description LIKE ? OR a.numero LIKE ? OR f.nom LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Requête principale
        const query = `
            SELECT 
                a.*,
                f.nom as fournisseur_nom_table,
                ca.nom as categorie_nom
            FROM achats a
            LEFT JOIN fournisseurs f ON a.fournisseur_id = f.id
            LEFT JOIN categories_achats ca ON a.categorie_achat_id = ca.id
            ${whereClause}
            ORDER BY a.date_achat DESC, a.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);

        const [achats] = await db.execute(query, params);

        // Comptage total
        const countQuery = `
            SELECT COUNT(DISTINCT a.id) as total
            FROM achats a
            LEFT JOIN fournisseurs f ON a.fournisseur_id = f.id
            ${whereClause}
        `;
        
        const [countResult] = await db.execute(countQuery, params.slice(0, -2));

        // Statistiques
        const statsQuery = `
            SELECT 
                COUNT(*) as total_achats,
                SUM(a.montant_ttc) as montant_total,
                SUM(a.montant_ht) as montant_ht_total,
                SUM(a.montant_tva) as tva_total,
                SUM(CASE WHEN a.tva_deductible = 'Oui' THEN a.montant_tva ELSE 0 END) as tva_deductible,
                SUM(CASE WHEN a.tva_deductible = 'Non' THEN a.montant_tva ELSE 0 END) as tva_non_deductible
            FROM achats a
            ${whereClause}
        `;

        const [stats] = await db.execute(statsQuery, params.slice(0, -2));

        res.json({
            achats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            },
            stats: stats[0]
        });

    } catch (error) {
        console.error('Erreur liste achats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des achats' });
    }
});

module.exports = router;