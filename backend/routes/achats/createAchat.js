const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');

// Configuration multer pour les justificatifs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/achats/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'achat-' + uniqueSuffix + path.extname(file.originalname));
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

// POST /api/achat - Créer un achat
router.post('/', upload.array('justificatifs', 5), async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const {
            numero_facture,
            fournisseur_id,
            date_achat,
            date_facture,
            date_echeance,
            montant_ht,
            taux_tva = 20,
            tva_deductible = true,
            categorie_achat_id,
            projet_id,
            description,
            mode_paiement = 'virement',
            utilisateur_id,
            societe_id,
            compte_comptable_achat,
            compte_comptable_tva,
            saisie_ocr = false
        } = req.body;

        // Calculs
        const montantHT = parseFloat(montant_ht);
        const tauxTVA = parseFloat(taux_tva);
        const montantTVA = montantHT * (tauxTVA / 100);
        const montantTTC = montantHT + montantTVA;

        // Validation
        if (!fournisseur_id || !date_achat || !montant_ht || !societe_id) {
            throw new Error('Champs obligatoires manquants');
        }

        // Insertion de l'achat
        const [result] = await connection.execute(`
            INSERT INTO achats (
                numero_facture, fournisseur_id, date_achat, date_facture, date_echeance,
                montant_ht, montant_tva, montant_ttc, taux_tva, tva_deductible,
                categorie_achat_id, projet_id, description, mode_paiement,
                utilisateur_id, societe_id, compte_comptable_achat, compte_comptable_tva,
                saisie_ocr, statut
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'brouillon')
        `, [
            numero_facture || null, 
            fournisseur_id, 
            date_achat, 
            date_facture || null, 
            date_echeance || null,
            montantHT, 
            montantTVA, 
            montantTTC, 
            tauxTVA, 
            tva_deductible ? 1 : 0,
            categorie_achat_id || null, 
            projet_id || null, 
            description || null, 
            mode_paiement || 'virement',
            utilisateur_id, 
            societe_id, 
            compte_comptable_achat || null, 
            compte_comptable_tva || '44566',
            saisie_ocr ? 1 : 0
        ]);

        const achatId = result.insertId;

        // Gestion des justificatifs
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await connection.execute(`
                    INSERT INTO justificatifs_achats (
                        achat_id, nom_fichier, chemin_fichier, type_mime, taille_fichier
                    ) VALUES (?, ?, ?, ?, ?)
                `, [
                    achatId,
                    file.originalname,
                    file.path,
                    file.mimetype,
                    file.size
                ]);
            }
        }

        await connection.commit();

        res.status(201).json({
            message: 'Achat créé avec succès',
            achatId: achatId,
            montant_ht: montantHT,
            montant_tva: montantTVA,
            montant_ttc: montantTTC
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur création achat:', error);
        res.status(400).json({ error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;