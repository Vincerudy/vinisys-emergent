const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 8001;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_ici';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Créer les dossiers d'upload si ils n'existent pas
const createUploadDirs = async () => {
    const dirs = [
        path.join(__dirname, 'uploads'),
        path.join(__dirname, 'uploads/achats'),
        path.join(__dirname, 'uploads/notes-frais'),
        path.join(__dirname, 'uploads/depenses') // Ancien dossier pour compatibilité
    ];
    
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            console.log(`Dossier ${dir} existe déjà ou erreur:`, error.message);
        }
    }
};

createUploadDirs();

// Route de base
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Vinisys - Modules Dépenses/Achats et Notes de frais',
        version: '2.0.0',
        modules: ['achats', 'notes-frais', 'legacy-depenses']
    });
});

// Test de connexion à la base de données
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT 1 as test');
        res.json({ 
            message: 'Connexion réussie à la base de données',
            timestamp: new Date().toISOString(),
            modules: {
                achats: 'Dépenses/Achats entreprise',
                notes_frais: 'Notes de frais employés'
            }
        });
    } catch (error) {
        console.error('Erreur de connexion à la base de données:', error);
        res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }
});

// Authentification
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const [users] = await db.execute(
            'SELECT u.*, s.companyName as societe_nom FROM users u LEFT JOIN societes s ON u.societe_id = s.id WHERE u.email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Utilisateur non trouvé ou inactif' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }

        // Récupérer les permissions
        const [permissions] = await db.execute(
            'SELECT permission FROM user_permissions WHERE user_id = ?',
            [user.id]
        );

        const userPermissions = permissions.map(p => p.permission);

        const token = jwt.sign(
            {
                id: user.id,
                societe_id: user.societe_id,
                email: user.email,
                permissions: userPermissions
            },
            JWT_SECRET,
            { expiresIn: '3h' }
        );

        res.json({
            token,
            id: user.id,
            email: user.email,
            nom: user.lastName,
            prenom: user.firstName,
            societe_id: user.societe_id,
            permissions: userPermissions,
            urlPhoto: user.urlPhoto || null
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Vérification du token
app.get('/api/token', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: 'Token valide', user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
    }
});

// =====================================
// ROUTES EXISTANTES (Facturation, etc.)
// =====================================

// Routes facturation originales - Routes directes (pas de double préfixe)
app.use('/api/listeFacture', require('./routes/facture/listeFacture'));
app.use('/api/dashbordData', require('./routes/facture/dashbordData'));
app.use('/api/insertFacture', require('./routes/facture/insertFacture'));
app.use('/api/updateFacture', require('./routes/facture/updateFacture'));
app.use('/api/deleteFacture', require('./routes/facture/deleteFacture'));
app.use('/api/transformFacture', require('./routes/facture/transformFacture'));
app.use('/api/dataGraphiqueFacture', require('./routes/facture/dataGraphiqueFacture'));
app.use('/api/dataGraphCircle', require('./routes/facture/dataGraphCircle'));
app.use('/api/numeroFacture', require('./routes/facture/numeroFacture'));
app.use('/api/modeReglementFacture', require('./routes/facture/modeReglementFacture'));
app.use('/api/updateStatut', require('./routes/facture/updateStatut'));
app.use('/api/alertes', require('./routes/facture/alertes'));
app.use('/api/ParametreFacturationRead', require('./routes/facture/ParametreFacturationRead'));
app.use('/api/insertParametrageFacturation', require('./routes/facture/insertParametrageFacturation'));
app.use('/api/cahierRecette', require('./routes/facture/cahierRecette'));

// Routes clients
app.use('/api/insertClient', require('./routes/client/insertClient'));
app.use('/api/listeClient', require('./routes/client/listeClient'));
app.use('/api/suppressionClient', require('./routes/client/suppressionClient'));
app.use('/api/updateClient', require('./routes/client/updateClient'));

// Routes manquantes appelées par le frontend
app.get('/api/parametrage-facturation/:id', (req, res) => {
    res.json({
        vatLabel: 'TVA',
        devise: '€',
        company_name: 'Votre entreprise'
    });
});

app.get('/api/alertesprogrammee/:userId/:societeId', (req, res) => {
    res.json([]);
});

// =====================================
// ROUTES MODULES SÉPARES
// =====================================

// Module Achats/Dépenses (Entreprise)
app.use('/api/achats', require('./routes/achats/listAchats'));
app.use('/api/achat', require('./routes/achats/createAchat'));
app.use('/api/achats/dashboard', require('./routes/achats/dashboardAchats'));
app.use('/api/achats/fournisseurs', require('./routes/achats/fournisseurs'));

// Module Notes de frais (Employés)
app.use('/api/notes-frais', require('./routes/notes-frais/listNotesfrais'));
app.use('/api/note-frais', require('./routes/notes-frais/createNoteFrais'));
app.use('/api/notes-frais/dashboard', require('./routes/notes-frais/dashboardNotesfrais'));
app.use('/api/notes-frais/validation', require('./routes/notes-frais/validationNotes'));
app.use('/api/notes-frais/baremes', require('./routes/notes-frais/baremes'));

// Catégories achats
app.get('/api/categories-achats/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const [categories] = await db.execute(
            'SELECT * FROM categories_achats WHERE societe_id = ? ORDER BY nom ASC',
            [societeId]
        );
        res.json({ categories });
    } catch (error) {
        console.error('Erreur catégories achats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
});

app.get('/api/projets/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const [projets] = await db.execute(
            'SELECT * FROM projets WHERE societe_id = ? AND statut = "actif" ORDER BY nom ASC',
            [societeId]
        );
        res.json({ projets });
    } catch (error) {
        console.error('Erreur projets:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
    }
});

// GET /api/types-frais/:societeId - Récupérer les types de frais actifs
app.get('/api/types-frais/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const [typesFrais] = await db.execute(
            'SELECT * FROM types_frais WHERE societe_id = ? AND actif = 1 ORDER BY libelle ASC',
            [societeId]
        );
        res.json({ 
            success: true,
            types_frais: typesFrais 
        });
    } catch (error) {
        console.error('Erreur types de frais:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la récupération des types de frais' 
        });
    }
});

// ENDPOINTS POUR LA GESTION DES TYPES DE FRAIS
// GET /api/types-frais/manage/:societeId - Tous les types (pour paramétrage)
app.get('/api/types-frais/manage/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const [typesFrais] = await db.execute(
            'SELECT * FROM types_frais WHERE societe_id = ? ORDER BY libelle ASC',
            [societeId]
        );
        res.json({ 
            success: true,
            types_frais: typesFrais 
        });
    } catch (error) {
        console.error('Erreur gestion types de frais:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la récupération des types de frais' 
        });
    }
});

// PUT /api/types-frais/:typeId - Modifier un type de frais
app.put('/api/types-frais/:typeId', async (req, res) => {
    try {
        const { typeId } = req.params;
        const { libelle, actif } = req.body;

        await db.execute(
            'UPDATE types_frais SET libelle = ?, actif = ? WHERE id = ?',
            [libelle, actif ? 1 : 0, typeId]
        );

        res.json({
            success: true,
            message: 'Type de frais modifié avec succès'
        });
    } catch (error) {
        console.error('Erreur modification type de frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du type de frais'
        });
    }
});

// POST /api/types-frais - Créer un nouveau type de frais
app.post('/api/types-frais', async (req, res) => {
    try {
        const { nom, libelle, societe_id } = req.body;

        if (!nom || !libelle || !societe_id) {
            return res.status(400).json({
                success: false,
                message: 'Nom, libellé et société ID sont requis'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO types_frais (nom, libelle, societe_id, actif) VALUES (?, ?, ?, 1)',
            [nom, libelle, societe_id]
        );

        res.status(201).json({
            success: true,
            message: 'Type de frais créé avec succès',
            data: { typeId: result.insertId }
        });
    } catch (error) {
        console.error('Erreur création type de frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du type de frais'
        });
    }
});

// Notes de frais - Routes simplifiées
app.post('/api/note-frais/simple', async (req, res) => {
    try {
        const {
            user_id,
            societe_id,
            vendeur,
            date_frais,
            pays,
            devise,
            montant_ttc,
            montant_ht,
            montant_tva,
            moyen_paiement,
            motif,
            projet_id,
            commentaire,
            statut = 'brouillon'
        } = req.body;

        console.log('Création note de frais simple:', req.body);

        // Validation des champs requis
        if (!user_id || !societe_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID et Société ID sont requis' 
            });
        }

        if (!vendeur || !montant_ttc) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vendeur et montant TTC sont requis' 
            });
        }

        // Générer un numéro de note de frais
        const [lastNote] = await db.execute(
            'SELECT COUNT(*) as count FROM notes_frais WHERE societe_id = ?',
            [societe_id]
        );
        const numeroNote = `NF${societe_id}-${(lastNote[0].count + 1).toString().padStart(4, '0')}`;

        // Insérer la note de frais
        const [result] = await db.execute(`
            INSERT INTO notes_frais (
                user_id, societe_id, numero, titre, description, 
                montant_total, statut, periode_debut, periode_fin,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            user_id,
            societe_id,
            numeroNote,
            `Note de frais - ${vendeur}`,
            motif || `Frais ${vendeur}`,
            montant_ttc,
            statut,
            date_frais || new Date().toISOString().split('T')[0],
            date_frais || new Date().toISOString().split('T')[0]
        ]);

        const noteId = result.insertId;

        // Insérer le détail de la ligne de frais
        await db.execute(`
            INSERT INTO lignes_frais (
                note_frais_id, type_frais_id, date_frais, description,
                montant, montant_ht, montant_tva, 
                vendeur, pays, devise, moyen_paiement,
                projet_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            noteId,
            1, // Type frais par défaut (repas)
            date_frais || new Date().toISOString().split('T')[0],
            `${motif || 'Frais'} - ${vendeur}`,
            montant_ttc,
            montant_ht || 0,
            montant_tva || 0,
            vendeur,
            pays || 'France',
            devise || 'EUR',
            moyen_paiement || 'Carte de Crédit Société',
            projet_id || null
        ]);

        console.log('Note de frais créée avec succès:', {
            noteId,
            numeroNote,
            montant_ttc
        });

        res.status(201).json({
            success: true,
            message: 'Note de frais créée avec succès',
            data: {
                noteId,
                numero: numeroNote,
                montant_total: montant_ttc,
                statut
            }
        });

    } catch (error) {
        console.error('Erreur création note de frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la note de frais',
            error: error.message
        });
    }
});

// GET /api/notes-frais/list/:societeId - Liste des notes de frais
app.get('/api/notes-frais/list/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        
        const [notes] = await db.execute(`
            SELECT 
                nf.id,
                nf.numero,
                nf.titre,
                nf.description,
                nf.montant_total,
                nf.statut,
                nf.periode_debut,
                nf.periode_fin,
                nf.created_at,
                u.firstName,
                u.lastName,
                (SELECT COUNT(*) FROM lignes_frais lf WHERE lf.note_frais_id = nf.id) as nb_lignes
            FROM notes_frais nf
            LEFT JOIN users u ON nf.user_id = u.id
            WHERE nf.societe_id = ?
            ORDER BY nf.created_at DESC
        `, [societeId]);

        res.json({
            success: true,
            notes: notes
        });

    } catch (error) {
        console.error('Erreur récupération notes de frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des notes de frais',
            error: error.message
        });
    }
});

// GET /api/note-frais/:noteId - Récupérer une note de frais spécifique
app.get('/api/note-frais/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;
        
        // Récupérer la note principale
        const [notes] = await db.execute(`
            SELECT 
                nf.*,
                u.firstName,
                u.lastName
            FROM notes_frais nf
            LEFT JOIN users u ON nf.user_id = u.id
            WHERE nf.id = ?
        `, [noteId]);

        if (notes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note de frais non trouvée'
            });
        }

        // Récupérer les lignes de frais associées
        const [lignes] = await db.execute(`
            SELECT 
                lf.*,
                tf.nom as type_frais_nom,
                p.nom as projet_nom
            FROM lignes_frais lf
            LEFT JOIN types_frais tf ON lf.type_frais_id = tf.id
            LEFT JOIN projets p ON lf.projet_id = p.id
            WHERE lf.note_frais_id = ?
            ORDER BY lf.created_at DESC
        `, [noteId]);

        const noteComplete = {
            ...notes[0],
            lignes_frais: lignes
        };

        res.json({
            success: true,
            note: noteComplete
        });

    } catch (error) {
        console.error('Erreur récupération note de frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la note de frais',
            error: error.message
        });
    }
});

// PUT /api/note-frais/:noteId - Modifier une note de frais (titre, statut)
app.put('/api/note-frais/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;
        const { titre, statut } = req.body;

        console.log('Modification note de frais:', noteId, req.body);

        // Construire la requête de mise à jour
        let updateFields = [];
        let updateValues = [];

        if (titre) {
            updateFields.push('titre = ?');
            updateValues.push(titre);
        }

        if (statut) {
            updateFields.push('statut = ?');
            updateValues.push(statut);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucun champ à mettre à jour'
            });
        }

        // Ajouter updated_at et noteId à la fin
        updateFields.push('updated_at = NOW()');
        updateValues.push(noteId);

        // Mettre à jour la note
        await db.execute(`
            UPDATE notes_frais 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);

        console.log('Note de frais modifiée avec succès:', noteId);

        res.json({
            success: true,
            message: 'Note de frais modifiée avec succès',
            data: {
                noteId: parseInt(noteId),
                statut: statut || 'brouillon'
            }
        });

    } catch (error) {
        console.error('Erreur modification note de frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de la note de frais',
            error: error.message
        });
    }
});

// ENDPOINTS POUR LES FRAIS INDIVIDUELS
// POST /api/frais - Créer un nouveau frais dans une note
app.post('/api/frais', async (req, res) => {
    try {
        const {
            note_frais_id,
            type_frais_id,
            vendeur,
            date_frais,
            pays,
            devise,
            montant,
            montant_ht,
            montant_tva,
            moyen_paiement,
            description,
            projet_id
        } = req.body;

        console.log('Création frais individuel:', req.body);

        // Validation des champs requis
        if (!note_frais_id || !vendeur || !montant || !type_frais_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Note ID, type de frais, vendeur et montant sont requis' 
            });
        }

        // Insérer le frais
        const [result] = await db.execute(`
            INSERT INTO lignes_frais (
                note_frais_id, type_frais_id, date_frais, description,
                montant, montant_ht, montant_tva, 
                vendeur, pays, devise, moyen_paiement,
                projet_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            note_frais_id,
            type_frais_id,
            date_frais || new Date().toISOString().split('T')[0],
            description || `Frais ${vendeur}`,
            montant,
            montant_ht || 0,
            montant_tva || 0,
            vendeur,
            pays || 'France',
            devise || 'EUR',
            moyen_paiement || 'Carte de Crédit Société',
            projet_id || null
        ]);

        // Mettre à jour le montant total de la note
        await db.execute(`
            UPDATE notes_frais 
            SET montant_total = (
                SELECT COALESCE(SUM(montant), 0) 
                FROM lignes_frais 
                WHERE note_frais_id = ?
            ),
            updated_at = NOW()
            WHERE id = ?
        `, [note_frais_id, note_frais_id]);

        console.log('Frais créé avec succès:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Frais créé avec succès',
            data: {
                fraisId: result.insertId
            }
        });

    } catch (error) {
        console.error('Erreur création frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du frais',
            error: error.message
        });
    }
});

// PUT /api/frais/:fraisId - Modifier un frais
app.put('/api/frais/:fraisId', async (req, res) => {
    try {
        const { fraisId } = req.params;
        const {
            vendeur,
            date_frais,
            pays,
            devise,
            montant,
            montant_ht,
            montant_tva,
            moyen_paiement,
            description,
            projet_id
        } = req.body;

        console.log('Modification frais:', fraisId, req.body);

        // Validation des champs requis
        if (!vendeur || !montant) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vendeur et montant sont requis' 
            });
        }

        // Récupérer note_frais_id pour mise à jour du total
        const [fraisInfo] = await db.execute(
            'SELECT note_frais_id FROM lignes_frais WHERE id = ?',
            [fraisId]
        );

        if (fraisInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Frais non trouvé'
            });
        }

        const noteId = fraisInfo[0].note_frais_id;

        // Mettre à jour le frais
        await db.execute(`
            UPDATE lignes_frais 
            SET date_frais = ?, description = ?, montant = ?, montant_ht = ?, 
                montant_tva = ?, vendeur = ?, pays = ?, devise = ?, 
                moyen_paiement = ?, projet_id = ?
            WHERE id = ?
        `, [
            date_frais || new Date().toISOString().split('T')[0],
            description || `Frais ${vendeur}`,
            montant,
            montant_ht || 0,
            montant_tva || 0,
            vendeur,
            pays || 'France',
            devise || 'EUR',
            moyen_paiement || 'Carte de Crédit Société',
            projet_id || null,
            fraisId
        ]);

        // Mettre à jour le montant total de la note
        await db.execute(`
            UPDATE notes_frais 
            SET montant_total = (
                SELECT COALESCE(SUM(montant), 0) 
                FROM lignes_frais 
                WHERE note_frais_id = ?
            ),
            updated_at = NOW()
            WHERE id = ?
        `, [noteId, noteId]);

        console.log('Frais modifié avec succès:', fraisId);

        res.json({
            success: true,
            message: 'Frais modifié avec succès'
        });

    } catch (error) {
        console.error('Erreur modification frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du frais',
            error: error.message
        });
    }
});

// POST /api/frais/upload-auto - Upload automatique avec création de frais
app.post('/api/frais/upload-auto', async (req, res) => {
    try {
        // Pour cette démo, on simule l'extraction OCR et création automatique
        const { note_frais_id } = req.body;

        if (!note_frais_id) {
            return res.status(400).json({
                success: false,
                message: 'ID de la note requis'
            });
        }

        // Simulation : créer un frais avec des données d'exemple
        const fraisData = {
            note_frais_id: note_frais_id,
            vendeur: 'Restaurant (Auto-détecté)',
            date_frais: new Date().toISOString().split('T')[0],
            pays: 'France',
            devise: 'EUR',
            montant: 25.50,
            montant_ht: 21.25,
            montant_tva: 4.25,
            moyen_paiement: 'Carte de Crédit Société',
            description: 'Frais créé automatiquement via OCR'
        };

        // Créer le frais
        const [result] = await db.execute(`
            INSERT INTO lignes_frais (
                note_frais_id, type_frais_id, date_frais, description,
                montant, montant_ht, montant_tva, 
                vendeur, pays, devise, moyen_paiement,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            fraisData.note_frais_id,
            1,
            fraisData.date_frais,
            fraisData.description,
            fraisData.montant,
            fraisData.montant_ht,
            fraisData.montant_tva,
            fraisData.vendeur,
            fraisData.pays,
            fraisData.devise,
            fraisData.moyen_paiement
        ]);

        // Mettre à jour le montant total de la note
        await db.execute(`
            UPDATE notes_frais 
            SET montant_total = (
                SELECT COALESCE(SUM(montant), 0) 
                FROM lignes_frais 
                WHERE note_frais_id = ?
            ),
            updated_at = NOW()
            WHERE id = ?
        `, [note_frais_id, note_frais_id]);

        res.json({
            success: true,
            message: 'Frais créé automatiquement via upload',
            data: {
                fraisId: result.insertId,
                fraisData
            }
        });

    } catch (error) {
        console.error('Erreur upload auto:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création automatique du frais',
            error: error.message
        });
    }
});

// =====================================
// ROUTES LEGACY (Ancien module dépenses)
// Pour compatibilité descendante
// =====================================

// Redirection des anciennes routes vers les nouveaux modules
app.use('/api/depenses', (req, res, next) => {
    console.log('⚠️ Route dépréciée /api/depenses utilisée - Redirection vers /api/notes-frais');
    req.url = req.url.replace('/api/depenses', '/api/notes-frais');
    next();
}, require('./routes/notes-frais/listNotesfrais'));

app.use('/api/depense', (req, res, next) => {
    console.log('⚠️ Route dépréciée /api/depense utilisée - Redirection vers /api/note-frais');
    req.url = req.url.replace('/api/depense', '/api/note-frais');
    next();
}, require('./routes/notes-frais/createNoteFrais'));

// Gestion des erreurs globales
app.use((error, req, res, next) => {
    console.error('Erreur globale:', error);
    res.status(500).json({ 
        error: 'Erreur serveur interne',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
    });
});

// Route 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée',
        requested_route: req.originalUrl,
        available_endpoints: {
            auth: ['/api/login', '/api/token'],
            facturation: ['/api/listeFacture', '/api/dashbordData', '/api/insertFacture', '/api/updateFacture'],
            clients: ['/api/insertClient', '/api/listeClient', '/api/updateClient'],
            achats: ['/api/achats', '/api/achat', '/api/achats/dashboard', '/api/achats/fournisseurs'],
            notes_frais: ['/api/notes-frais', '/api/note-frais', '/api/notes-frais/dashboard', '/api/notes-frais/validation'],
            common: ['/api/types-frais', '/api/categories-achats', '/api/projets']
        }
    });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Vinisys v2.0 démarré sur le port ${PORT}`);
    console.log(`📊 Modules disponibles:`);
    console.log(`   - 🧾 Achats/Dépenses entreprise: /api/achats/*`);
    console.log(`   - 💳 Notes de frais employés: /api/notes-frais/*`);
    console.log(`   - 🔧 Endpoints communs: /api/types-frais, /api/categories-achats, /api/projets`);
    console.log(`   - 🔐 Authentification: /api/login, /api/token`);
});

module.exports = app;