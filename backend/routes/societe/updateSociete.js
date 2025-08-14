const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db'); // Assurez-vous que ce chemin est correct

// Configurer Multer pour le téléchargement de fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads'); // Chemin du dossier uploads
        fs.mkdirSync(uploadPath, { recursive: true }); // Crée le dossier s'il n'existe pas
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Utilise un nom de fichier unique
    },
});

const upload = multer({ storage });

// Route pour mettre à jour une société
router.post('/societes/update/:id', upload.single('logo'), async (req, res) => {
    const userId = req.params.id;

    const [societeRows] = await db.query(
     'select societe_id from users where id = ?', [userId]
    )
     
     if(societeRows.length === 0){
       return res.status(404).json({ message: 'Utilisateur non trouvé ou sans société associée' });
     }
    const societeId = societeRows[0].societe_id;

    const {
        raisonSociale,
        siret,
        adresse,
        codePostal,
        ville,
        telephone,
        email,
        pays,
        tva,
        monnaie,
        langue,
    } = req.body;

    // Validation des données
    if (!raisonSociale || !siret || !adresse || !codePostal || !ville || !telephone || !email || !pays || !tva || !monnaie || !langue) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const logoPath = req.file ? `/uploads/${req.file.filename}` : null; // Chemin du nouveau logo
    //const userSession = req.session.user; // Récupérer la session utilisateur

    const connection = await db.getConnection(); // Obtenir une connexion

    try {
        // Commencer une transaction
        await connection.beginTransaction();

        // Mettre à jour les données dans la table societes
        await connection.query(
            `UPDATE societes 
             SET companyAddress = ?, 
                 ville = ?, 
                 code_postal = ?, 
                 email = ?, 
                 companyName = ?, 
                 workPhone = ?, 
                 pays = ?, 
                 NUME_TVA = ?, 
                 siret = ?, 
                 DEVISE = ?, 
                 langue = ? 
             WHERE id = ?`,
            [adresse, ville, codePostal, email, raisonSociale, telephone, pays, tva, siret, monnaie, langue, societeId]
        );

        // Vérifier si un enregistrement existe dans upload_fichier pour cette société
        if (logoPath) {
            const [existingFile] = await connection.query(
                `SELECT * FROM upload_fichier WHERE societe_id = ?`,
                [societeId]
            );

            if (existingFile.length > 0) {
                // Si un fichier existe, supprimer l'ancien fichier du système
                const oldFilePath = path.join(__dirname, `../../${existingFile[0].path}`);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath); // Supprimer l'ancien fichier
                }

                // Mettre à jour le chemin du logo dans la base de données
                await connection.query(
                    `UPDATE upload_fichier 
                     SET path = ?, file_type = 'SOCI_IMG_LOGO' 
                     WHERE societe_id = ?`,
                    [logoPath, societeId]
                    //req.file.mimetype 
                );
            } else {
                // Si aucun fichier n'existe pour cette société, insérer un nouveau record
                await connection.query(
                    `INSERT INTO upload_fichier (societe_id, path, file_type) 
                     VALUES (?, ?, 'SOCI_IMG_LOGO')`,
                    [societeId, logoPath]
                );
            }
        }

        // Valider la transaction
        await connection.commit();
        
        res.status(200).json({ message: 'Société mise à jour avec succès et le logo a été géré correctement.' });
    } catch (error) {
        // Si une erreur survient, annuler la transaction
        await connection.rollback();
        console.error('Erreur lors de la mise à jour de la société:', error.sqlMessage || error.message);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la société', error: error.message });
    } finally {
        // Toujours libérer la connexion
        connection.release();
    }
});

module.exports = router;
