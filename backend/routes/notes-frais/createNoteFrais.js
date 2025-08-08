const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');

// Configuration multer pour les justificatifs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/notes-frais/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'frais-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers JPEG, PNG et PDF sont autorisés'));
        }
    }
});

// POST /api/note-frais - Créer une note de frais
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const {
            user_id,
            periode_debut,
            periode_fin,
            titre,
            description,
            societe_id,
            lignes_frais
        } = req.body;

        // Validation
        if (!utilisateur_id || !periode_debut || !periode_fin || !societe_id) {
            throw new Error('Champs obligatoires manquants');
        }

        // Génération du numéro
        const [lastNumber] = await connection.execute(
            'SELECT numero FROM notes_frais WHERE societe_id = ? ORDER BY id DESC LIMIT 1',
            [societe_id]
        );

        let nextNumber = 1;
        if (lastNumber.length > 0 && lastNumber[0].numero) {
            const lastNum = parseInt(lastNumber[0].numero.split('-')[1]) || 0;
            nextNumber = lastNum + 1;
        }

        const numeroNote = `NF-${nextNumber.toString().padStart(4, '0')}`;

        // Calcul du montant total
        let montantTotal = 0;
        if (lignes_frais && Array.isArray(lignes_frais)) {
            montantTotal = lignes_frais.reduce((sum, ligne) => sum + parseFloat(ligne.montant || 0), 0);
        }

        // Insertion de la note
        const [result] = await connection.execute(`
            INSERT INTO notes_frais (
                numero, utilisateur_id, periode_debut, periode_fin, titre, 
                description, montant_total, societe_id, statut
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'brouillon')
        `, [
            numeroNote, utilisateur_id, periode_debut, periode_fin, 
            titre, description, montantTotal, societe_id
        ]);

        const noteId = result.insertId;

        // Insertion des lignes de frais
        if (lignes_frais && Array.isArray(lignes_frais)) {
            for (const ligne of lignes_frais) {
                const [ligneResult] = await connection.execute(`
                    INSERT INTO lignes_frais (
                        note_frais_id, type_frais_id, date_frais, description, montant, montant_tva, taux_tva,
                        distance_km, lieu_depart, lieu_arrivee, type_vehicule, bareme_id,
                        lieu_repas, nombre_personnes, type_repas,
                        lieu_hebergement, nombre_nuits,
                        projet_id, saisie_ocr
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    noteId, ligne.type_frais_id, ligne.date_frais, ligne.description,
                    ligne.montant, ligne.montant_tva || 0, ligne.taux_tva || 0,
                    ligne.distance_km, ligne.lieu_depart, ligne.lieu_arrivee, ligne.type_vehicule, ligne.bareme_id,
                    ligne.lieu_repas, ligne.nombre_personnes || 1, ligne.type_repas,
                    ligne.lieu_hebergement, ligne.nombre_nuits || 1,
                    ligne.projet_id, ligne.saisie_ocr || false
                ]);

                // Gestion des justificatifs pour cette ligne
                if (ligne.justificatifs && Array.isArray(ligne.justificatifs)) {
                    for (const justificatif of ligne.justificatifs) {
                        await connection.execute(`
                            INSERT INTO justificatifs_frais (
                                ligne_frais_id, nom_fichier, chemin_fichier, type_mime, taille_fichier
                            ) VALUES (?, ?, ?, ?, ?)
                        `, [
                            ligneResult.insertId,
                            justificatif.nom_fichier,
                            justificatif.chemin_fichier,
                            justificatif.type_mime,
                            justificatif.taille_fichier
                        ]);
                    }
                }
            }
        }

        await connection.commit();

        res.status(201).json({
            message: 'Note de frais créée avec succès',
            noteId: noteId,
            numero: numeroNote,
            montant_total: montantTotal
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur création note de frais:', error);
        res.status(400).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// POST /api/note-frais/:id/soumettre - Soumettre une note de frais
router.post('/:id/soumettre', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(`
            UPDATE notes_frais 
            SET statut = 'soumise', date_soumission = NOW()
            WHERE id = ? AND statut = 'brouillon'
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Note de frais non trouvée ou déjà soumise' });
        }

        // Historique
        await db.execute(`
            INSERT INTO historique_validations (note_frais_id, ancien_statut, nouveau_statut, utilisateur_id, commentaire)
            VALUES (?, 'brouillon', 'soumise', ?, 'Note soumise pour validation')
        `, [id, req.body.utilisateur_id]);

        res.json({ message: 'Note de frais soumise avec succès' });

    } catch (error) {
        console.error('Erreur soumission note:', error);
        res.status(500).json({ error: 'Erreur lors de la soumission' });
    }
});

module.exports = router;