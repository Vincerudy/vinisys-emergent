const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/categories-achats/:societeId - Liste des catégories d'achats
router.get('/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const { actif } = req.query;

        let whereClause = 'WHERE societe_id = ?';
        let params = [societeId];

        if (actif !== undefined) {
            whereClause += ' AND actif = ?';
            params.push(actif === 'true' ? 1 : 0);
        }

        const query = `
            SELECT * FROM categories_achats 
            ${whereClause}
            ORDER BY actif DESC, nom ASC
        `;

        const [categories] = await db.execute(query, params);

        res.json({
            categories: categories
        });

    } catch (error) {
        console.error('Erreur liste catégories achats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
});

// POST /api/categories-achats - Créer une catégorie
router.post('/', async (req, res) => {
    try {
        const {
            nom, code, description, actif = 1, tva_deductible = 0, societe_id
        } = req.body;

        if (!nom || !code || !societe_id) {
            return res.status(400).json({ error: 'Nom, code et société requis' });
        }

        // Vérifier l'unicité du code pour cette société
        const [existing] = await db.execute(
            'SELECT id FROM categories_achats WHERE code = ? AND societe_id = ?',
            [code, societe_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Une catégorie avec ce code existe déjà' });
        }

        const [result] = await db.execute(`
            INSERT INTO categories_achats (
                nom, code, description, actif, tva_deductible, societe_id
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            nom, code, description || null, actif, tva_deductible ? 1 : 0, societe_id
        ]);

        res.status(201).json({
            message: 'Catégorie créée avec succès',
            categorieId: result.insertId
        });

    } catch (error) {
        console.error('Erreur création catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
    }
});

// PUT /api/categories-achats/:id - Modifier une catégorie
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nom, code, description, actif, tva_deductible
        } = req.body;

        // Vérifier si la catégorie existe
        const [existing] = await db.execute('SELECT * FROM categories_achats WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Catégorie non trouvée' });
        }

        // Si le code change, vérifier l'unicité
        if (code && code !== existing[0].code) {
            const [codeCheck] = await db.execute(
                'SELECT id FROM categories_achats WHERE code = ? AND societe_id = ? AND id != ?',
                [code, existing[0].societe_id, id]
            );

            if (codeCheck.length > 0) {
                return res.status(409).json({ error: 'Une catégorie avec ce code existe déjà' });
            }
        }

        // Mettre à jour la catégorie
        await db.execute(`
            UPDATE categories_achats SET 
                nom = ?, code = ?, description = ?, actif = ?, tva_deductible = ?
            WHERE id = ?
        `, [
            nom || existing[0].nom,
            code || existing[0].code,
            description !== undefined ? description : existing[0].description,
            actif !== undefined ? actif : existing[0].actif,
            tva_deductible !== undefined ? (tva_deductible ? 1 : 0) : existing[0].tva_deductible,
            id
        ]);

        res.json({ message: 'Catégorie modifiée avec succès' });

    } catch (error) {
        console.error('Erreur modification catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la modification de la catégorie' });
    }
});

// DELETE /api/categories-achats/:id - Supprimer une catégorie
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier si la catégorie existe
        const [existing] = await db.execute('SELECT id FROM categories_achats WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Catégorie non trouvée' });
        }

        // Vérifier s'il y a des achats liés à cette catégorie
        const [achats] = await db.execute('SELECT COUNT(*) as count FROM achats WHERE categorie_achat_id = ?', [id]);
        if (achats[0].count > 0) {
            return res.status(400).json({ 
                error: 'Impossible de supprimer cette catégorie car elle est utilisée dans des achats existants' 
            });
        }

        // Supprimer la catégorie
        await db.execute('DELETE FROM categories_achats WHERE id = ?', [id]);

        res.json({ message: 'Catégorie supprimée avec succès' });

    } catch (error) {
        console.error('Erreur suppression catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' });
    }
});

module.exports = router;