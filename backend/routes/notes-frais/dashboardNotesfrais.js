const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/notes-frais/dashboard/:societeId - Tableau de bord notes de frais
router.get('/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const { periode_debut, periode_fin, utilisateur_id } = req.query;
        
        // Définir les périodes par défaut (mois en cours)
        const currentDate = new Date();
        const defaultPeriodeDebut = periode_debut || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
        const defaultPeriodeFin = periode_fin || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}`;

        console.log('📊 Dashboard notes de frais:', {
            societeId,
            periode_debut: defaultPeriodeDebut,
            periode_fin: defaultPeriodeFin,
            utilisateur_id
        });

        let userFilter = '';
        const params = [societeId, defaultPeriodeDebut, defaultPeriodeFin];
        
        if (utilisateur_id) {
            userFilter = ' AND nf.user_id = ?';
            params.push(utilisateur_id);
        }

        // Indicateurs clés de la période (uniquement notes validées)
        const [indicateurs] = await db.execute(`
            SELECT 
                COUNT(*) as nb_notes,
                ROUND(SUM(montant_total), 2) as montant_total_soumis,
                ROUND(SUM(CASE WHEN statut = 'validee' THEN montant_total ELSE 0 END), 2) as montant_valide,
                ROUND(SUM(CASE WHEN statut = 'payee' THEN montant_total ELSE 0 END), 2) as montant_rembourse,
                ROUND(SUM(CASE WHEN statut = 'refusee' THEN montant_total ELSE 0 END), 2) as montant_refuse,
                COUNT(CASE WHEN statut = 'soumise' THEN 1 END) as nb_notes_en_attente,
                COUNT(CASE WHEN statut = 'validee' THEN 1 END) as nb_notes_validees,
                COUNT(CASE WHEN statut = 'payee' THEN 1 END) as nb_notes_payees,
                COUNT(CASE WHEN statut = 'refusee' THEN 1 END) as nb_notes_refusees,
                ROUND((COUNT(CASE WHEN statut = 'refusee' THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 1) as taux_refus
            FROM notes_frais nf
            WHERE nf.societe_id = ? 
                AND DATE(nf.created_at) >= ?
                AND DATE(nf.created_at) <= ?
                ${userFilter}
        `, params);

        // Montant total des dépenses validées seulement
        const [depensesValidees] = await db.execute(`
            SELECT 
                ROUND(SUM(lf.montant), 2) as montant_depenses_validees,
                ROUND(SUM(lf.montant_tva), 2) as montant_tva_validees,
                COUNT(lf.id) as nb_lignes_validees
            FROM lignes_frais lf
            INNER JOIN notes_frais nf ON lf.note_frais_id = nf.id
            WHERE nf.societe_id = ? 
                AND nf.statut = 'validee'
                AND DATE(nf.created_at) >= ?
                AND DATE(nf.created_at) <= ?
                ${userFilter}
        `, params);

        // Répartition par utilisateur (si admin/manager)
        let utilisateursData = [];
        if (!utilisateur_id) {
            const [userData] = await db.execute(`
                SELECT 
                    u.firstName,
                    u.lastName,
                    u.id as utilisateur_id,
                    COUNT(nf.id) as nb_notes,
                    ROUND(SUM(nf.total_ttc), 2) as montant_total,
                    COUNT(CASE WHEN nf.statut = 'soumise' THEN 1 END) as nb_en_attente
                FROM users u
                LEFT JOIN notes_frais nf ON u.id = nf.user_id 
                    AND nf.societe_id = ? 
                    AND MONTH(nf.periode_debut) <= ? 
                    AND MONTH(nf.periode_fin) >= ?
                    AND YEAR(nf.periode_debut) <= ?
                    AND YEAR(nf.periode_fin) >= ?
                WHERE u.societe_id = ?
                GROUP BY u.id, u.firstName, u.lastName
                ORDER BY montant_total DESC
                LIMIT 10
            `, [societeId, currentMonth, currentMonth, currentYear, currentYear, societeId]);
            utilisateursData = userData;
        }

        // Répartition par type de frais (uniquement dépenses validées)
        const [typesData] = await db.execute(`
            SELECT 
                tf.nom as type_frais,
                COUNT(lf.id) as nb_lignes,
                ROUND(SUM(lf.montant), 2) as montant_total
            FROM lignes_frais lf
            INNER JOIN notes_frais nf ON lf.note_frais_id = nf.id
            INNER JOIN types_frais tf ON lf.type_frais_id = tf.id
            WHERE nf.societe_id = ? 
                AND nf.statut = 'validee'
                AND MONTH(nf.periode_debut) <= ? 
                AND MONTH(nf.periode_fin) >= ?
                AND YEAR(nf.periode_debut) <= ?
                AND YEAR(nf.periode_fin) >= ?
                ${userFilter}
            GROUP BY tf.id, tf.nom
            ORDER BY montant_total DESC
        `, [societeId, currentMonth, currentMonth, currentYear, currentYear, ...(utilisateur_id ? [utilisateur_id] : [])]);

        // Évolution mensuelle (12 derniers mois)
        const [evolutionData] = await db.execute(`
            SELECT 
                YEAR(periode_debut) as annee,
                MONTH(periode_debut) as mois,
                COUNT(*) as nb_notes,
                ROUND(SUM(total_ttc), 2) as montant_total
            FROM notes_frais nf
            WHERE nf.societe_id = ? 
                AND periode_debut >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                ${userFilter}
            GROUP BY YEAR(periode_debut), MONTH(periode_debut)
            ORDER BY annee DESC, mois DESC
        `, [societeId, ...(utilisateur_id ? [utilisateur_id] : [])]);

        // Répartition par statut
        const [statutsData] = await db.execute(`
            SELECT 
                statut,
                COUNT(*) as nb_notes,
                ROUND(SUM(total_ttc), 2) as montant_total
            FROM notes_frais nf
            WHERE nf.societe_id = ? 
                AND MONTH(periode_debut) <= ? 
                AND MONTH(periode_fin) >= ?
                AND YEAR(periode_debut) <= ?
                AND YEAR(periode_fin) >= ?
                ${userFilter}
            GROUP BY statut
            ORDER BY 
                CASE statut 
                    WHEN 'brouillon' THEN 1
                    WHEN 'soumise' THEN 2
                    WHEN 'validee' THEN 3
                    WHEN 'payee' THEN 4
                    WHEN 'refusee' THEN 5
                END
        `, [societeId, currentMonth, currentMonth, currentYear, currentYear, ...(utilisateur_id ? [utilisateur_id] : [])]);

        // Top frais kilométriques (uniquement dépenses validées)
        const [kmData] = await db.execute(`
            SELECT 
                SUM(lf.distance_km) as total_km,
                ROUND(SUM(lf.montant), 2) as montant_km,
                COUNT(*) as nb_trajets
            FROM lignes_frais lf
            INNER JOIN notes_frais nf ON lf.note_frais_id = nf.id
            INNER JOIN types_frais tf ON lf.type_frais_id = tf.id
            WHERE nf.societe_id = ? 
                AND nf.statut = 'validee'
                AND tf.code = 'KM'
                AND MONTH(nf.periode_debut) <= ? 
                AND MONTH(nf.periode_fin) >= ?
                AND YEAR(nf.periode_debut) <= ?
                AND YEAR(nf.periode_fin) >= ?
                ${userFilter}
        `, [societeId, currentMonth, currentMonth, currentYear, currentYear, ...(utilisateur_id ? [utilisateur_id] : [])]);

        res.json({
            periode: {
                mois: currentMonth,
                annee: currentYear
            },
            indicateurs: indicateurs[0] || {
                nb_notes: 0,
                montant_total_soumis: 0,
                montant_valide: 0,
                montant_rembourse: 0,
                montant_refuse: 0,
                nb_notes_en_attente: 0,
                taux_refus: 0
            },
            utilisateurs: utilisateursData,
            types_frais: typesData,
            evolution: evolutionData,
            statuts: statutsData,
            kilometriques: kmData[0] || {
                total_km: 0,
                montant_km: 0,
                nb_trajets: 0
            }
        });

    } catch (error) {
        console.error('Erreur dashboard notes de frais:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du dashboard' });
    }
});

module.exports = router;