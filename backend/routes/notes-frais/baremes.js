const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/notes-frais/baremes/:societeId - Liste des barèmes kilométriques
router.get('/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const { annee } = req.query;

        let query = `
            SELECT * FROM baremes_kilometriques 
            WHERE societe_id = ?
        `;
        let params = [societeId];

        if (annee) {
            query += ' AND annee = ?';
            params.push(annee);
        }

        query += ' ORDER BY annee DESC, type_vehicule ASC';

        const [baremes] = await db.execute(query, params);

        res.json({ baremes });

    } catch (error) {
        console.error('Erreur barèmes:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des barèmes' });
    }
});

// POST /api/notes-frais/calcul-km - Calculer les frais kilométriques
router.post('/calcul-km', async (req, res) => {
    try {
        const { 
            distance_km, 
            type_vehicule, 
            annee = new Date().getFullYear(),
            societe_id 
        } = req.body;

        if (!distance_km || !type_vehicule || !societe_id) {
            return res.status(400).json({ error: 'Distance, type de véhicule et société requis' });
        }

        // Récupérer le barème
        const [bareme] = await db.execute(`
            SELECT * FROM baremes_kilometriques 
            WHERE annee = ? AND type_vehicule = ? AND societe_id = ?
        `, [annee, type_vehicule, societe_id]);

        if (bareme.length === 0) {
            return res.status(404).json({ error: 'Barème non trouvé pour ce véhicule et cette année' });
        }

        const b = bareme[0];
        const distance = parseFloat(distance_km);
        let montant = 0;

        // Calcul par tranches
        if (distance <= b.tranche_1_limite) {
            // Tranche 1 uniquement
            montant = distance * b.tranche_1_taux;
        } else if (distance <= b.tranche_2_limite) {
            // Tranche 1 + Tranche 2
            montant = (b.tranche_1_limite * b.tranche_1_taux) + 
                     ((distance - b.tranche_1_limite) * b.tranche_2_taux);
        } else {
            // Tranche 1 + Tranche 2 + Tranche 3  
            montant = (b.tranche_1_limite * b.tranche_1_taux) + 
                     ((b.tranche_2_limite - b.tranche_1_limite) * b.tranche_2_taux) +
                     ((distance - b.tranche_2_limite) * b.tranche_3_taux);
        }

        res.json({
            distance_km: distance,
            type_vehicule,
            montant: Math.round(montant * 100) / 100, // Arrondi à 2 décimales
            bareme_id: b.id,
            detail_calcul: {
                tranche_1: Math.min(distance, b.tranche_1_limite) * b.tranche_1_taux,
                tranche_2: distance > b.tranche_1_limite ? 
                    Math.min(distance - b.tranche_1_limite, b.tranche_2_limite - b.tranche_1_limite) * b.tranche_2_taux : 0,
                tranche_3: distance > b.tranche_2_limite ? 
                    (distance - b.tranche_2_limite) * b.tranche_3_taux : 0
            }
        });

    } catch (error) {
        console.error('Erreur calcul kilométrique:', error);
        res.status(500).json({ error: 'Erreur lors du calcul' });
    }
});

module.exports = router;