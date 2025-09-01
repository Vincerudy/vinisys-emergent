const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/achats/dashboard/:societeId - Tableau de bord achats
router.get('/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const { mois, annee } = req.query;
        
        const currentDate = new Date();
        const currentMonth = mois || (currentDate.getMonth() + 1);
        const currentYear = annee || currentDate.getFullYear();

        // Indicateurs clés du mois
        const [indicateurs] = await db.execute(`
            SELECT 
                COUNT(*) as nb_achats,
                ROUND(SUM(montant_ttc), 2) as montant_ttc_total,
                ROUND(SUM(montant_ht), 2) as montant_ht_total,
                ROUND(SUM(CASE WHEN tva_deductible = 1 THEN montant_tva ELSE 0 END), 2) as tva_deductible,
                ROUND(SUM(CASE WHEN tva_deductible = 0 THEN montant_tva ELSE 0 END), 2) as tva_non_deductible,
                ROUND(SUM(CASE WHEN saisie_ocr = 1 THEN montant_ttc ELSE 0 END), 2) as montant_ocr,
                ROUND((SUM(CASE WHEN saisie_ocr = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 1) as pourcentage_ocr
            FROM achats 
            WHERE societe_id = ? 
                AND MONTH(date_achat) = ? 
                AND YEAR(date_achat) = ?
                AND statut = 'valide'
        `, [societeId, currentMonth, currentYear]);

        // Répartition par catégorie
        const [categoriesData] = await db.execute(`
            SELECT 
                ca.nom as categorie,
                COUNT(a.id) as nb_achats,
                ROUND(SUM(a.montant_ttc), 2) as montant_total
            FROM achats a
            LEFT JOIN categories_achats ca ON a.categorie_achat_id = ca.id
            WHERE a.societe_id = ? 
                AND MONTH(a.date_achat) = ? 
                AND YEAR(a.date_achat) = ?
                AND a.statut = 'valide'
            GROUP BY a.categorie_achat_id, ca.nom
            ORDER BY montant_total DESC
            LIMIT 10
        `, [societeId, currentMonth, currentYear]);

        // Top fournisseurs
        const [fournisseursData] = await db.execute(`
            SELECT 
                f.nom as fournisseur,
                COUNT(a.id) as nb_achats,
                ROUND(SUM(a.montant_ttc), 2) as montant_total
            FROM achats a
            LEFT JOIN fournisseurs f ON a.fournisseur_id = f.id
            WHERE a.societe_id = ? 
                AND MONTH(a.date_achat) = ? 
                AND YEAR(a.date_achat) = ?
                AND a.statut = 'valide'
            GROUP BY a.fournisseur_id, f.nom
            ORDER BY montant_total DESC
            LIMIT 10
        `, [societeId, currentMonth, currentYear]);

        // Évolution mensuelle (12 derniers mois)
        const [evolutionData] = await db.execute(`
            SELECT 
                YEAR(date_achat) as annee,
                MONTH(date_achat) as mois,
                COUNT(*) as nb_achats,
                ROUND(SUM(montant_ttc), 2) as montant_total
            FROM achats 
            WHERE societe_id = ? 
                AND date_achat >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                AND statut = 'valide'
            GROUP BY YEAR(date_achat), MONTH(date_achat)
            ORDER BY annee DESC, mois DESC
        `, [societeId]);

        // Achats à valider
        const [achatsAValider] = await db.execute(`
            SELECT 
                COUNT(*) as nb_achats_brouillon,
                ROUND(SUM(montant_ttc), 2) as montant_brouillon
            FROM achats 
            WHERE societe_id = ? 
                AND statut = 'brouillon'
        `, [societeId]);

        // Répartition par statut
        const [statutsData] = await db.execute(`
            SELECT 
                statut,
                COUNT(*) as nb_achats,
                ROUND(SUM(montant_ttc), 2) as montant_total
            FROM achats 
            WHERE societe_id = ? 
                AND MONTH(date_achat) = ? 
                AND YEAR(date_achat) = ?
            GROUP BY statut
            ORDER BY 
                CASE statut 
                    WHEN 'brouillon' THEN 1
                    WHEN 'valide' THEN 2
                    WHEN 'paye' THEN 3
                    WHEN 'annule' THEN 4
                END
        `, [societeId, currentMonth, currentYear]);

        // Répartition par mode de paiement
        const [paymentsData] = await db.execute(`
            SELECT 
                mode_paiement,
                COUNT(*) as nb_achats,
                ROUND(SUM(montant_ttc), 2) as montant_total
            FROM achats 
            WHERE societe_id = ? 
                AND MONTH(date_achat) = ? 
                AND YEAR(date_achat) = ?
                AND statut != 'annule'
            GROUP BY mode_paiement
            ORDER BY montant_total DESC
        `, [societeId, currentMonth, currentYear]);

        res.json({
            periode: {
                mois: currentMonth,
                annee: currentYear
            },
            indicateurs: indicateurs[0] || {
                nb_achats: 0,
                montant_ttc_total: 0,
                montant_ht_total: 0,
                tva_deductible: 0,
                tva_non_deductible: 0,
                montant_ocr: 0,
                pourcentage_ocr: 0
            },
            categories: categoriesData,
            fournisseurs: fournisseursData,
            evolution: evolutionData,
            validation: achatsAValider[0] || {
                nb_achats_brouillon: 0,
                montant_brouillon: 0
            },
            statuts: statutsData,
            paiements: paymentsData
        });

    } catch (error) {
        console.error('Erreur dashboard achats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du dashboard' });
    }
});

module.exports = router;