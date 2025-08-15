const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/rapport/financier/:societeId - Générer rapport financier complet
router.get('/:societeId', async (req, res) => {
    const { societeId } = req.params;
    let { date_debut, date_fin, periode } = req.query;
    
    // Si aucune date n'est fournie, utiliser le mois courant
    if (!date_debut || !date_fin) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        date_debut = firstDay.toISOString().split('T')[0];
        date_fin = lastDay.toISOString().split('T')[0];
    }
    
    const connection = await db.getConnection();
    
    try {
        console.log(`📊 Génération du rapport financier pour la société ${societeId}`);
        console.log(`📅 Période: ${date_debut} à ${date_fin}`);

        // =====================================================
        // SECTION 1: CHIFFRE D'AFFAIRES ET FACTURES
        // =====================================================
        
        // Chiffre d'affaires total sur la période
        const [caTotal] = await connection.execute(`
            SELECT 
                SUM(CAST(total AS DECIMAL(10,2))) as total_ca,
                COUNT(*) as nombre_factures
            FROM factures 
            WHERE societe_id = ? 
                AND date_facture BETWEEN ? AND ?
                AND statut != 'annulée'
                AND total IS NOT NULL
        `, [societeId, date_debut, date_fin]);

        // Montant encaissé vs en attente
        const [paiements] = await connection.execute(`
            SELECT 
                SUM(CASE WHEN statut = 'payée' THEN CAST(total AS DECIMAL(10,2)) ELSE 0 END) as encaisse,
                SUM(CASE WHEN statut IN ('en attente', 'accepté') THEN CAST(total AS DECIMAL(10,2)) ELSE 0 END) as en_attente
            FROM factures 
            WHERE societe_id = ? 
                AND date_facture BETWEEN ? AND ?
                AND statut != 'annulée'
                AND total IS NOT NULL
        `, [societeId, date_debut, date_fin]);

        // Total des avoirs émis (crédits/remboursements)
        const [avoirs] = await connection.execute(`
            SELECT 
                COALESCE(SUM(CAST(total AS DECIMAL(10,2))), 0) as total_avoirs
            FROM factures 
            WHERE societe_id = ? 
                AND date_facture BETWEEN ? AND ?
                AND type_fact = 'avoir'
                AND total IS NOT NULL
        `, [societeId, date_debut, date_fin]);

        // Répartition par TVA sur les factures  
        const [tvaRepartition] = await connection.execute(`
            SELECT 
                ROUND((total_tva / CAST(ht AS DECIMAL(10,2))) * 100, 2) as taux,
                SUM(total_tva) as montant_tva,
                SUM(CAST(ht AS DECIMAL(10,2))) as montant_ht
            FROM factures
            WHERE societe_id = ? 
                AND date_facture BETWEEN ? AND ?
                AND statut != 'annulée'
                AND type_fact != 'avoir'
                AND total IS NOT NULL
                AND ht IS NOT NULL
                AND total_tva > 0
            GROUP BY ROUND((total_tva / CAST(ht AS DECIMAL(10,2))) * 100, 2)
            ORDER BY taux
        `, [societeId, date_debut, date_fin]);

        // =====================================================
        // SECTION 2: DÉPENSES ET ACHATS
        // =====================================================

        // Montant total des dépenses sur la période
        const [depensesTotal] = await connection.execute(`
            SELECT 
                COALESCE(SUM(montant_ht), 0) as total_ht,
                COALESCE(SUM(montant_tva), 0) as total_tva,
                COALESCE(SUM(montant_ttc), 0) as total_ttc
            FROM achats 
            WHERE societe_id = ? 
                AND date_achat BETWEEN ? AND ?
                AND statut = 'valide'
        `, [societeId, date_debut, date_fin]);

        // Répartition des dépenses par catégorie
        const [categoriesDepenses] = await connection.execute(`
            SELECT 
                ca.nom as nom_categorie,
                COALESCE(SUM(a.montant_ttc), 0) as montant,
                COUNT(a.id) as nombre
            FROM categories_achats ca
            LEFT JOIN achats a ON ca.id = a.categorie_id 
                AND a.societe_id = ? 
                AND a.date_achat BETWEEN ? AND ?
                AND a.statut = 'valide'
            WHERE ca.actif = 1
            GROUP BY ca.id, ca.nom
            HAVING montant > 0
            ORDER BY montant DESC
        `, [societeId, date_debut, date_fin]);

        // Calculer les pourcentages pour les catégories
        const totalDepensesCategories = categoriesDepenses.reduce((sum, cat) => sum + parseFloat(cat.montant), 0);
        const categoriesAvecPourcentage = categoriesDepenses.map(cat => ({
            ...cat,
            montant: parseFloat(cat.montant),
            pourcentage: totalDepensesCategories > 0 ? (parseFloat(cat.montant) / totalDepensesCategories * 100) : 0
        }));

        // =====================================================
        // SECTION 3: NOTES DE FRAIS EMPLOYÉS
        // =====================================================

        // Montant total des notes de frais remboursées
        const [notesFraisTotal] = await connection.execute(`
            SELECT 
                COALESCE(SUM(total_ttc), 0) as total_rembourse,
                COUNT(*) as nombre_notes
            FROM notes_frais 
            WHERE societe_id = ? 
                AND date_validation BETWEEN ? AND ?
                AND statut = 'validee'
        `, [societeId, date_debut, date_fin]);

        // Répartition des notes de frais par type
        const [notesFraisCategories] = await connection.execute(`
            SELECT 
                tf.nom as nom_type,
                COALESCE(SUM(lf.montant), 0) as montant,
                COUNT(lf.id) as nombre
            FROM types_frais tf
            LEFT JOIN lignes_frais lf ON tf.id = lf.type_frais_id
            LEFT JOIN notes_frais nf ON lf.note_frais_id = nf.id
            WHERE nf.societe_id = ? 
                AND nf.date_validation BETWEEN ? AND ?
                AND nf.statut = 'validee'
                AND tf.actif = 1
            GROUP BY tf.id, tf.nom
            HAVING montant > 0
            ORDER BY montant DESC
        `, [societeId, date_debut, date_fin]);

        // =====================================================
        // SECTION 4: CALCUL DU BÉNÉFICE NET COMPTABLE
        // =====================================================

        const ca_encaisse = parseFloat(paiements[0]?.encaisse || 0);
        const total_avoirs = parseFloat(avoirs[0]?.total_avoirs || 0);
        const depenses_ttc = parseFloat(depensesTotal[0]?.total_ttc || 0);
        const tva_recuperable = parseFloat(depensesTotal[0]?.total_tva || 0);
        const notes_frais_rembourse = parseFloat(notesFraisTotal[0]?.total_rembourse || 0);

        // Formule: Bénéfice net = (CA encaissé - Avoirs) - (Dépenses TTC - TVA récupérable) - Notes de frais
        const benefice_net = (ca_encaisse - total_avoirs) - (depenses_ttc - tva_recuperable) - notes_frais_rembourse;

        // =====================================================
        // STRUCTURE DE LA RÉPONSE
        // =====================================================

        const rapport = {
            periode: {
                debut: date_debut,
                fin: date_fin,
                type: periode
            },
            chiffre_affaires: {
                total: parseFloat(caTotal[0]?.total_ca || 0),
                encaisse: ca_encaisse,
                en_attente: parseFloat(paiements[0]?.en_attente || 0),
                avoirs: total_avoirs,
                tva_repartition: tvaRepartition.map(tva => ({
                    taux: parseFloat(tva.taux),
                    montant: parseFloat(tva.montant_tva),
                    montant_ht: parseFloat(tva.montant_ht)
                }))
            },
            factures: {
                nombre: parseInt(caTotal[0]?.nombre_factures || 0),
                montant_moyen: parseInt(caTotal[0]?.nombre_factures || 0) > 0 ? 
                    parseFloat(caTotal[0]?.total_ca || 0) / parseInt(caTotal[0]?.nombre_factures || 0) : 0
            },
            depenses: {
                total_ht: parseFloat(depensesTotal[0]?.total_ht || 0),
                total_tva: parseFloat(depensesTotal[0]?.total_tva || 0),
                total_ttc: depenses_ttc,
                tva_recuperable: tva_recuperable,
                categories: categoriesAvecPourcentage
            },
            notes_frais: {
                total_rembourse: notes_frais_rembourse,
                nombre_notes: parseInt(notesFraisTotal[0]?.nombre_notes || 0),
                categories: notesFraisCategories.map(cat => ({
                    nom: cat.nom_type,
                    montant: parseFloat(cat.montant),
                    nombre: parseInt(cat.nombre)
                }))
            },
            benefice_net: benefice_net,
            resume_calcul: {
                ca_encaisse: ca_encaisse,
                moins_avoirs: total_avoirs,
                moins_depenses_ttc: depenses_ttc,
                plus_tva_recuperable: tva_recuperable,
                moins_notes_frais: notes_frais_rembourse,
                resultat: benefice_net
            }
        };

        console.log(`✅ Rapport généré avec succès`);
        console.log(`💰 CA encaissé: ${ca_encaisse}€`);
        console.log(`📉 Dépenses TTC: ${depenses_ttc}€`);
        console.log(`🏆 Bénéfice net: ${benefice_net}€`);

        res.json(rapport);

    } catch (error) {
        console.error('❌ Erreur génération rapport financier:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la génération du rapport financier',
            details: error.message 
        });
    } finally {
        connection.release();
    }
});

// GET /api/rapport/evolutionDepenses/:societeId - Évolution des dépenses par période
router.get('/evolution-depenses/:societeId', async (req, res) => {
    const { societeId } = req.params;
    const { annee = new Date().getFullYear(), type_periode = 'mois' } = req.query;
    
    const connection = await db.getConnection();
    
    try {
        let groupBy, dateFormat;
        
        switch (type_periode) {
            case 'jour':
                groupBy = 'DATE(date_achat)';
                dateFormat = '%Y-%m-%d';
                break;
            case 'semaine':
                groupBy = 'YEARWEEK(date_achat, 1)';
                dateFormat = '%Y-S%u';
                break;
            case 'mois':
            default:
                groupBy = 'DATE_FORMAT(date_achat, "%Y-%m")';
                dateFormat = '%Y-%m';
                break;
        }

        const [evolution] = await connection.execute(`
            SELECT 
                ${groupBy} as periode,
                DATE_FORMAT(date_achat, '${dateFormat}') as periode_libelle,
                SUM(montant_ttc) as montant_total,
                COUNT(*) as nombre_achats
            FROM achats 
            WHERE societe_id = ? 
                AND YEAR(date_achat) = ?
                AND statut = 'valide'
            GROUP BY ${groupBy}
            ORDER BY periode
        `, [societeId, annee]);

        res.json({
            evolution: evolution.map(item => ({
                periode: item.periode_libelle,
                montant: parseFloat(item.montant_total),
                nombre: parseInt(item.nombre_achats)
            })),
            type_periode,
            annee: parseInt(annee)
        });

    } catch (error) {
        console.error('❌ Erreur évolution dépenses:', error);
        res.status(500).json({ 
            error: 'Erreur lors du calcul de l\'évolution des dépenses',
            details: error.message 
        });
    } finally {
        connection.release();
    }
});

module.exports = router;