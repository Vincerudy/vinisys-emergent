const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/notes-frais/:userId - Liste des notes de frais
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            page = 1, 
            limit = 20, 
            statut, 
            dateDebut, 
            dateFin,
            societe_id
        } = req.query;

        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE nf.user_id = ?';
        let params = [userId];

        if (societe_id) {
            whereClause += ' AND nf.societe_id = ?';
            params.push(societe_id);
        }

        if (statut) {
            whereClause += ' AND nf.statut = ?';
            params.push(statut);
        }

        if (dateDebut) {
            whereClause += ' AND nf.periode_debut >= ?';
            params.push(dateDebut);
        }

        if (dateFin) {
            whereClause += ' AND nf.periode_fin <= ?';
            params.push(dateFin);
        }

        // Requête principale
        const query = `
            SELECT 
                nf.*,
                u.firstName as utilisateur_prenom,
                u.lastName as utilisateur_nom,
                v.firstName as validateur_prenom,
                v.lastName as validateur_nom,
                COUNT(lf.id) as nb_lignes_frais,
                COUNT(jf.id) as nb_justificatifs
            FROM notes_frais nf
            LEFT JOIN users u ON nf.user_id = u.id
            LEFT JOIN users v ON nf.validee_par = v.id
            LEFT JOIN lignes_frais lf ON nf.id = lf.note_frais_id
            LEFT JOIN justificatifs_frais jf ON lf.id = jf.ligne_frais_id
            ${whereClause}
            GROUP BY nf.id
            ORDER BY nf.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);

        const [notes] = await db.execute(query, params);

        // Comptage total
        const countQuery = `SELECT COUNT(*) as total FROM notes_frais nf ${whereClause}`;
        const [countResult] = await db.execute(countQuery, params.slice(0, -2));

        // Statistiques utilisateur
        const statsQuery = `
            SELECT 
                COUNT(*) as total_notes,
                SUM(nf.total_ttc) as montant_total,
                SUM(CASE WHEN nf.statut = 'brouillon' THEN nf.total_ttc ELSE 0 END) as montant_brouillon,
                SUM(CASE WHEN nf.statut = 'soumise' THEN nf.total_ttc ELSE 0 END) as montant_soumis,
                SUM(CASE WHEN nf.statut = 'validee' THEN nf.total_ttc ELSE 0 END) as montant_valide,
                SUM(CASE WHEN nf.statut = 'payee' THEN nf.total_ttc ELSE 0 END) as montant_rembourse
            FROM notes_frais nf
            ${whereClause}
        `;

        const [stats] = await db.execute(statsQuery, params.slice(0, -2));

        res.json({
            notes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            },
            stats: stats[0]
        });

    } catch (error) {
        console.error('Erreur liste notes de frais:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des notes de frais' });
    }
});

module.exports = router;