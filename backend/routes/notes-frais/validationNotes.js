const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/notes-frais/validation/:societeId - Notes en attente de validation
router.get('/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const { validateur_id } = req.query;

        let userFilter = '';
        const params = [societeId];
        
        if (validateur_id) {
            // Filtrer par équipe/service du validateur (à adapter selon votre logique)
            userFilter = ' AND nf.utilisateur_id IN (SELECT id FROM users WHERE societe_id = ?)';
            params.push(societeId);
        }

        const [notes] = await db.execute(`
            SELECT 
                nf.*,
                u.firstName as utilisateur_prenom,
                u.lastName as utilisateur_nom,
                u.email as utilisateur_email,
                COUNT(lf.id) as nb_lignes_frais,
                SUM(CASE WHEN tf.code = 'KM' THEN lf.distance_km ELSE 0 END) as total_km
            FROM notes_frais nf
            INNER JOIN users u ON nf.user_id = u.id
            LEFT JOIN lignes_frais lf ON nf.id = lf.note_frais_id
            LEFT JOIN types_frais tf ON lf.type_frais_id = tf.id
            WHERE nf.societe_id = ? 
                AND nf.statut = 'soumise'
                ${userFilter}
            GROUP BY nf.id
            ORDER BY nf.date_soumission ASC
        `, params);

        res.json({ notes });

    } catch (error) {
        console.error('Erreur validation notes:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des notes à valider' });
    }
});

// POST /api/notes-frais/:id/valider - Valider une note de frais
router.post('/:id/valider', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { validateur_id, commentaire } = req.body;

        // Vérifier que la note est bien en statut 'soumise'
        const [noteCheck] = await connection.execute(
            'SELECT statut FROM notes_frais WHERE id = ?',
            [id]
        );

        if (noteCheck.length === 0) {
            throw new Error('Note de frais non trouvée');
        }

        if (noteCheck[0].statut !== 'soumise') {
            throw new Error('Cette note ne peut pas être validée (statut incorrect)');
        }

        // Mise à jour de la note
        await connection.execute(`
            UPDATE notes_frais 
            SET statut = 'validee', 
                validateur_id = ?, 
                date_validation = NOW()
            WHERE id = ?
        `, [validateur_id, id]);

        // Historique
        await connection.execute(`
            INSERT INTO historique_validations (
                note_frais_id, ancien_statut, nouveau_statut, utilisateur_id, commentaire
            ) VALUES (?, 'soumise', 'validee', ?, ?)
        `, [id, validateur_id, commentaire || 'Note validée']);

        await connection.commit();

        res.json({ message: 'Note de frais validée avec succès' });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur validation note:', error);
        res.status(400).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// POST /api/notes-frais/:id/refuser - Refuser une note de frais
router.post('/:id/refuser', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { validateur_id, motif_refus } = req.body;

        if (!motif_refus) {
            throw new Error('Le motif de refus est obligatoire');
        }

        // Vérifier que la note est bien en statut 'soumise'
        const [noteCheck] = await connection.execute(
            'SELECT statut FROM notes_frais WHERE id = ?',
            [id]
        );

        if (noteCheck.length === 0) {
            throw new Error('Note de frais non trouvée');
        }

        if (noteCheck[0].statut !== 'soumise') {
            throw new Error('Cette note ne peut pas être refusée (statut incorrect)');
        }

        // Mise à jour de la note
        await connection.execute(`
            UPDATE notes_frais 
            SET statut = 'refusee', 
                validateur_id = ?, 
                date_validation = NOW(),
                motif_refus = ?
            WHERE id = ?
        `, [validateur_id, motif_refus, id]);

        // Historique
        await connection.execute(`
            INSERT INTO historique_validations (
                note_frais_id, ancien_statut, nouveau_statut, utilisateur_id, commentaire
            ) VALUES (?, 'soumise', 'refusee', ?, ?)
        `, [id, validateur_id, motif_refus]);

        await connection.commit();

        res.json({ message: 'Note de frais refusée' });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur refus note:', error);
        res.status(400).json({ error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;