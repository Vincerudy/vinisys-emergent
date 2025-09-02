const express = require('express');
const db = require('../../config/db');
const router = express.Router();

// POST /api/achats/validate-bulk - Valider plusieurs achats
router.post('/validate-bulk', async (req, res) => {
    try {
        const { achat_ids, societe_id } = req.body;

        if (!achat_ids || !Array.isArray(achat_ids) || achat_ids.length === 0) {
            return res.status(400).json({ error: 'Liste d\'IDs d\'achats requise' });
        }

        // Construire la requête avec des placeholders
        const placeholders = achat_ids.map(() => '?').join(',');
        const query = `
            UPDATE achats 
            SET statut = 'valide', date_validation = NOW()
            WHERE id IN (${placeholders}) AND societe_id = ?
        `;

        const [result] = await db.execute(query, [...achat_ids, societe_id]);

        res.json({ 
            message: `${result.affectedRows} achat(s) validé(s) avec succès`,
            validated_count: result.affectedRows
        });
    } catch (error) {
        console.error('Erreur validation en masse:', error);
        res.status(500).json({ error: 'Erreur lors de la validation en masse' });
    }
});

// POST /api/achats/reject-bulk - Refuser plusieurs achats
router.post('/reject-bulk', async (req, res) => {
    try {
        const { achat_ids, societe_id } = req.body;

        if (!achat_ids || !Array.isArray(achat_ids) || achat_ids.length === 0) {
            return res.status(400).json({ error: 'Liste d\'IDs d\'achats requise' });
        }

        // Construire la requête avec des placeholders
        const placeholders = achat_ids.map(() => '?').join(',');
        const query = `
            UPDATE achats 
            SET statut = 'refuse', date_refus = NOW()
            WHERE id IN (${placeholders}) AND societe_id = ?
        `;

        const [result] = await db.execute(query, [...achat_ids, societe_id]);

        res.json({ 
            message: `${result.affectedRows} achat(s) refusé(s) avec succès`,
            rejected_count: result.affectedRows
        });
    } catch (error) {
        console.error('Erreur refus en masse:', error);
        res.status(500).json({ error: 'Erreur lors du refus en masse' });
    }
});

// POST /api/achats/export-bulk - Exporter plusieurs achats
router.post('/export-bulk', async (req, res) => {
    try {
        const { achat_ids, societe_id } = req.body;

        if (!achat_ids || !Array.isArray(achat_ids) || achat_ids.length === 0) {
            return res.status(400).json({ error: 'Liste d\'IDs d\'achats requise' });
        }

        // Construire la requête avec des placeholders
        const placeholders = achat_ids.map(() => '?').join(',');
        const query = `
            SELECT 
                a.id,
                a.numero,
                a.date_achat,
                a.montant_ht,
                a.montant_tva,
                a.montant_ttc,
                a.description,
                a.statut,
                f.nom as fournisseur_nom,
                c.nom as categorie_nom
            FROM achats a
            LEFT JOIN fournisseurs f ON a.fournisseur_id = f.id
            LEFT JOIN categories_achat c ON a.categorie_achat_id = c.id
            WHERE a.id IN (${placeholders}) AND a.societe_id = ?
            ORDER BY a.date_achat DESC
        `;

        const [rows] = await db.execute(query, [...achat_ids, societe_id]);

        // Pour cette implémentation simple, on retourne les données en JSON
        // En production, vous pourriez utiliser une bibliothèque comme xlsx pour créer un vrai fichier Excel
        res.json({
            data: rows,
            count: rows.length,
            export_date: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erreur export en masse:', error);
        res.status(500).json({ error: 'Erreur lors de l\'export en masse' });
    }
});

module.exports = router;