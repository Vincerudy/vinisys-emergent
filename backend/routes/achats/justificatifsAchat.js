const express = require('express');
const db = require('../../config/db');
const path = require('path');
const router = express.Router();

// GET /api/achat/:id/justificatifs - Récupérer les justificatifs d'un achat
router.get('/:id/justificatifs', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(`
            SELECT 
                id,
                justificatif_path,
                numero,
                date_achat
            FROM achats 
            WHERE id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Achat non trouvé' });
        }

        const achat = rows[0];
        const justificatifs = [];

        // Si un justificatif existe, l'ajouter à la liste
        if (achat.justificatif_path) {
            const filename = path.basename(achat.justificatif_path);
            const fileExtension = path.extname(filename).toLowerCase();
            
            let typefichier = 'application/pdf';
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
                typefichier = 'image/jpeg';
            }

            justificatifs.push({
                id: `${achat.id}_1`, // ID unique pour le fichier
                justificatif_path: achat.justificatif_path,
                nom_fichier: filename,
                type_fichier: typefichier,
                date_creation: achat.date_achat
            });
        }

        res.json(justificatifs);
    } catch (error) {
        console.error('Erreur récupération justificatifs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des justificatifs' });
    }
});

module.exports = router;