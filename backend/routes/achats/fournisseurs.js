const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/achats/fournisseurs/:societeId - Liste des fournisseurs
router.get('/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const { search } = req.query;

        let query = `
            SELECT 
                f.*,
                COUNT(a.id) as nb_achats,
                ROUND(SUM(a.montant_ttc), 2) as montant_total_achats
            FROM fournisseurs f
            LEFT JOIN achats a ON f.id = a.fournisseur_id AND a.statut != 'annule'
            WHERE f.societe_id = ?
        `;
        
        let params = [societeId];

        if (search) {
            query += ` AND (f.nom LIKE ? OR f.email LIKE ? OR f.siret LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` GROUP BY f.id ORDER BY f.nom ASC`;

        const [fournisseurs] = await db.execute(query, params);

        res.json({ fournisseurs });

    } catch (error) {
        console.error('Erreur liste fournisseurs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des fournisseurs' });
    }
});

// POST /api/achats/fournisseur - Créer un fournisseur
router.post('/fournisseur', async (req, res) => {
    try {
        const {
            nom, adresse, ville, code_postal, pays = 'France',
            telephone, email, siret, numero_tva, conditions_paiement,
            compte_comptable, societe_id
        } = req.body;

        if (!nom || !societe_id) {
            return res.status(400).json({ error: 'Nom et société requis' });
        }

        const [result] = await db.execute(`
            INSERT INTO fournisseurs (
                nom, adresse, ville, code_postal, pays, telephone, email,
                siret, numero_tva, conditions_paiement, compte_comptable, societe_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nom, adresse, ville, code_postal, pays, telephone, email,
            siret, numero_tva, conditions_paiement, compte_comptable, societe_id
        ]);

        res.status(201).json({
            message: 'Fournisseur créé avec succès',
            fournisseurId: result.insertId
        });

    } catch (error) {
        console.error('Erreur création fournisseur:', error);
        res.status(500).json({ error: 'Erreur lors de la création du fournisseur' });
    }
});

module.exports = router;