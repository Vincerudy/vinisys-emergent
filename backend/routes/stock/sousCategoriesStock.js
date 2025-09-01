const express = require('express');
const db = require('../../config/db');
const router = express.Router();

// GET /api/sous-categories-stock/:categorie_id/:societe_id - Récupérer les sous-catégories d'une catégorie
router.get('/:categorie_id/:societe_id', async (req, res) => {
    try {
        const { categorie_id, societe_id } = req.params;

        const [sousCategories] = await db.execute(`
            SELECT 
                id,
                nom,
                description,
                categorie_parent_id,
                created_at,
                updated_at
            FROM sous_categories_stock 
            WHERE categorie_parent_id = ? AND societe_id = ?
            ORDER BY nom ASC
        `, [categorie_id, societe_id]);

        res.json(sousCategories);
    } catch (error) {
        console.error('Erreur récupération sous-catégories:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des sous-catégories' });
    }
});

// POST /api/sous-categories-stock - Créer une nouvelle sous-catégorie
router.post('/', async (req, res) => {
    try {
        const { nom, description, categorie_parent_id, societe_id } = req.body;

        if (!nom || !categorie_parent_id || !societe_id) {
            return res.status(400).json({ 
                error: 'Le nom, l\'ID de catégorie parent et l\'ID de société sont requis' 
            });
        }

        // Vérifier que la catégorie parent existe
        const [parentExists] = await db.execute(`
            SELECT id FROM categories_stock 
            WHERE id = ? AND societe_id = ?
        `, [categorie_parent_id, societe_id]);

        if (parentExists.length === 0) {
            return res.status(404).json({ error: 'Catégorie parent non trouvée' });
        }

        // Vérifier que la sous-catégorie n'existe pas déjà dans cette catégorie
        const [existing] = await db.execute(`
            SELECT id FROM sous_categories_stock 
            WHERE nom = ? AND categorie_parent_id = ?
        `, [nom, categorie_parent_id]);

        if (existing.length > 0) {
            return res.status(400).json({ 
                error: 'Une sous-catégorie avec ce nom existe déjà dans cette catégorie' 
            });
        }

        // Créer la sous-catégorie
        const [result] = await db.execute(`
            INSERT INTO sous_categories_stock (nom, description, categorie_parent_id, societe_id, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [nom, description || null, categorie_parent_id, societe_id]);

        res.status(201).json({
            message: 'Sous-catégorie créée avec succès',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erreur création sous-catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la sous-catégorie' });
    }
});

// PUT /api/sous-categories-stock/:id - Modifier une sous-catégorie
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description } = req.body;

        if (!nom) {
            return res.status(400).json({ error: 'Le nom est requis' });
        }

        // Vérifier que la sous-catégorie existe
        const [existing] = await db.execute(`
            SELECT id FROM sous_categories_stock WHERE id = ?
        `, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Sous-catégorie non trouvée' });
        }

        // Modifier la sous-catégorie
        await db.execute(`
            UPDATE sous_categories_stock 
            SET nom = ?, description = ?, updated_at = NOW()
            WHERE id = ?
        `, [nom, description || null, id]);

        res.json({ message: 'Sous-catégorie modifiée avec succès' });
    } catch (error) {
        console.error('Erreur modification sous-catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la modification de la sous-catégorie' });
    }
});

// DELETE /api/sous-categories-stock/:id - Supprimer une sous-catégorie
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que la sous-catégorie existe
        const [existing] = await db.execute(`
            SELECT id FROM sous_categories_stock WHERE id = ?
        `, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Sous-catégorie non trouvée' });
        }

        // Vérifier s'il y a des produits liés (pour l'instant, toujours 0 car pas encore lié)
        const produitCount = 0; // Temporaire, en attendant la liaison avec les produits

        if (produitCount > 0) {
            return res.status(400).json({ 
                error: 'Impossible de supprimer cette sous-catégorie car elle contient des produits' 
            });
        }

        // Supprimer la sous-catégorie
        await db.execute(`
            DELETE FROM sous_categories_stock WHERE id = ?
        `, [id]);

        res.json({ message: 'Sous-catégorie supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression sous-catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la sous-catégorie' });
    }
});

module.exports = router;