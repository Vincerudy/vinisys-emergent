const express = require('express');
const db = require('../../config/db');
const router = express.Router();

// GET /api/categories-stock/:societeId - Récupérer toutes les catégories d'une société
router.get('/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;

        const [categories] = await db.execute(`
            SELECT 
                c.id,
                c.nom,
                c.description,
                c.created_at,
                COUNT(DISTINCT sc.id) as nb_sous_categories,
                0 as nb_produits
            FROM categories_stock c
            LEFT JOIN sous_categories_stock sc ON c.id = sc.categorie_parent_id
            WHERE c.societe_id = ?
            GROUP BY c.id, c.nom, c.description, c.created_at
            ORDER BY c.nom ASC
        `, [societeId]);

        res.json(categories);
    } catch (error) {
        console.error('Erreur récupération catégories:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
});

// GET /api/categories-stock/:id/details - Récupérer les détails d'une catégorie avec ses sous-catégories
router.get('/:id/details', async (req, res) => {
    try {
        const { id } = req.params;

        // Récupérer les informations de la catégorie
        const [categoryResult] = await db.execute(`
            SELECT 
                c.id,
                c.nom,
                c.description,
                c.societe_id,
                c.created_at,
                0 as nb_produits
            FROM categories_stock c
            WHERE c.id = ?
        `, [id]);

        if (categoryResult.length === 0) {
            return res.status(404).json({ error: 'Catégorie non trouvée' });
        }

        const category = categoryResult[0];

        // Récupérer les sous-catégories
        const [sousCategories] = await db.execute(`
            SELECT 
                sc.id,
                sc.nom,
                sc.description,
                sc.created_at,
                0 as nb_produits
            FROM sous_categories_stock sc
            WHERE sc.categorie_parent_id = ?
            ORDER BY sc.nom ASC
        `, [id]);

        // Calculer le nombre total de produits (directs + dans sous-catégories)
        const totalProduits = parseInt(category.nb_produits) + 
            sousCategories.reduce((sum, sc) => sum + parseInt(sc.nb_produits || 0), 0);
        
        category.nb_produits_total = totalProduits;

        res.json({
            category,
            sous_categories: sousCategories
        });
    } catch (error) {
        console.error('Erreur récupération détails catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des détails' });
    }
});

// POST /api/categories-stock - Créer une nouvelle catégorie
router.post('/', async (req, res) => {
    try {
        const { nom, description, societe_id } = req.body;

        if (!nom || !societe_id) {
            return res.status(400).json({ error: 'Le nom et l\'ID de société sont requis' });
        }

        // Vérifier que la catégorie n'existe pas déjà
        const [existing] = await db.execute(`
            SELECT id FROM categories_stock 
            WHERE nom = ? AND societe_id = ?
        `, [nom, societe_id]);

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Une catégorie avec ce nom existe déjà' });
        }

        // Créer la catégorie
        const [result] = await db.execute(`
            INSERT INTO categories_stock (nom, description, societe_id, created_at)
            VALUES (?, ?, ?, NOW())
        `, [nom, description || null, societe_id]);

        res.status(201).json({
            message: 'Catégorie créée avec succès',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erreur création catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
    }
});

// PUT /api/categories-stock/:id - Modifier une catégorie
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description } = req.body;

        if (!nom) {
            return res.status(400).json({ error: 'Le nom est requis' });
        }

        // Vérifier que la catégorie existe
        const [existing] = await db.execute(`
            SELECT id FROM categories_stock WHERE id = ?
        `, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Catégorie non trouvée' });
        }

        // Modifier la catégorie
        await db.execute(`
            UPDATE categories_stock 
            SET nom = ?, description = ?, updated_at = NOW()
            WHERE id = ?
        `, [nom, description || null, id]);

        res.json({ message: 'Catégorie modifiée avec succès' });
    } catch (error) {
        console.error('Erreur modification catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la modification de la catégorie' });
    }
});

// DELETE /api/categories-stock/:id - Supprimer une catégorie
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que la catégorie existe
        const [existing] = await db.execute(`
            SELECT id FROM categories_stock WHERE id = ?
        `, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Catégorie non trouvée' });
        }

        // Vérifier s'il y a des produits liés
        const [produits] = await db.execute(`
            SELECT COUNT(*) as count FROM produits WHERE categorie_id = ?
        `, [id]);

        if (produits[0].count > 0) {
            return res.status(400).json({ 
                error: 'Impossible de supprimer cette catégorie car elle contient des produits' 
            });
        }

        // Supprimer d'abord les sous-catégories
        await db.execute(`
            DELETE FROM sous_categories_stock WHERE categorie_parent_id = ?
        `, [id]);

        // Supprimer la catégorie
        await db.execute(`
            DELETE FROM categories_stock WHERE id = ?
        `, [id]);

        res.json({ message: 'Catégorie supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' });
    }
});

module.exports = router;