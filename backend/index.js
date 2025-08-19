const express = require('express');
require('dotenv').config();
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const morgan = require('morgan');
const db = require('./config/db');
const path = require('path');
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const RelanceAutomatique = require('./jobs/relanceAutomatique');
const app = express();

const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: [
      'https://client.vinisys.com',
      'http://localhost:5173',
      'https://www.pilotage.vinisys.com',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Ajout explicite pour forcer WebSocket
});

const port = process.env.PORT;

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Autoriser toutes les origines en mode développement
app.use(
  cors({
    origin: true, // Autorise toutes les origines
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  })
);

app.options('*', cors());

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('Requête OPTIONS:', req.path, 'Headers:', req.headers);
  }
  next();
});

app.use(express.json());
app.use(morgan('combined'));

const sessionStore = new MySQLStore({}, db);

app.use(
  session({
    name: 'vinisys_session_id',
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 1,
    },
  })
);

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

const activeTokens = new Set();
app.use((req, res, next) => {
  req.activeTokens = activeTokens;
  next();
});

(() => {
  activeTokens.clear();
  console.log('🧹 Tous les tokens ont été réinitialisés après redémarrage.');
})();

app.get('/', (req, res) => {
  res.send('✅ Express fonctionne !');
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.json({ message: 'Connexion réussie à la base de données', result: rows });
  } catch (err) {
    console.error('Erreur de connexion à la base de données :', err);
    res.status(500).json({ message: 'Erreur de connexion à la base de données', error: err.message });
  }
});

const routes = [
  require('./routes/auth'),
  require('./routes/login'),
  require('./routes/loginPilote'),
  require('./routes/globalRoute'),
  require('./routes/resetPass'),
  require('./routes/senderMail'),
  require('./routes/token/verifyToken'),
  require('./routes/images/imageRoutes'),
  require('./routes/client/insertClient'),
  require('./routes/client/listeClient'),
  require('./routes/client/updateClient'),
  require('./routes/client/suppressionClient'),
  require('./routes/facture/insertFacture'),
  require('./routes/facture/listeFacture'),
  require('./routes/facture/getFactureDetails'),
  require('./routes/facture/updateFacture'),
  require('./routes/facture/deleteFacture'),
  require('./routes/facture/dataGraphiqueFacture'),
  require('./routes/facture/dataGraphCircle'),
  require('./routes/facture/updateStatut'),
  require('./routes/facture/jobAlertes'),
  require('./routes/facture/modeReglementFacture'),
  require('./routes/facture/transformFacture'),
  require('./routes/facture/numeroFacture'),
  require('./routes/facture/alertes'),
  require('./routes/facture/insertParametrageFacturation'),
  require('./routes/facture/ParametreFacturationRead'),
  require('./routes/facture/dashbordData'),
  require('./routes/facture/cahierRecettes'),
  require('./routes/abonnement/subscriptions'),
  require('./routes/societe/updateSociete'),
  require('./routes/societe/readSociete'),
  require('./routes/parametrage_societe/mail_settings'),
  require('./routes/societe/updateParametrageSocieteClient'),
  require('./routes/societe/listeSocieteClient'),
  require('./routes/societe/listeSocieteInscrite'),
  require('./routes/employees/insertUpdateEmployees'),
  require('./routes/produits/insertPorduit'),
  require('./routes/produits/ListeProduits'),
  require('./routes/produits/AffichagePorduit'),
  require('./routes/produits/deleteProduit'),
  require('./routes/produits/mouvementsStock'),
  require('./routes/produits/ListeMouvements'),
  require('./routes/produits/ImportProduit'),
  require('./routes/produits/inventaire'),
  require('./routes/tva/tvaInit'),
  require('./routes/tva/listetva'),
  require('./routes/tva/updatetva'),
  require('./routes/tva/listeTvaActiv'),
  require('./routes/users/createUser'),
  require('./routes/utilisateurs/utilisateur'),
  require('./routes/ticket/insertTicket'),
  require('./routes/ticket/ticketDetail'),
  require('./routes/ticket/inserMessage')(io),
  require('./routes/ticket/messageRead'),
  require('./routes/ticket/listeTicketClient'),
  require('./routes/ticket/listeTicketMaintenance'),
  require('./routes/ticket/TicketDetailMaintenance'),
  require('./routes/ticket/MaintenanceMessageRead'),
  // Routes pour le module Dépenses
  require('./routes/depenses/listeDepenses'),
  require('./routes/depenses/insertDepense'),
  require('./routes/depenses/detailDepense'),
  require('./routes/depenses/updateDepense'),
  require('./routes/depenses/validationDepense'),
  require('./routes/depenses/categoriesDepenses'),
  require('./routes/depenses/baremesKilometriques'),
  require('./routes/depenses/exportStats'),
//  require('./routes/ticket/testSentTicket'),
];

routes.forEach((route) => app.use('/api', route));

// =====================================
// ROUTES MODULES SÉPARES
// =====================================

// Module Achats/Dépenses (Entreprise)
app.use('/api/achats', require('./routes/achats/listAchats'));
app.use('/api/achat', require('./routes/achats/createAchat'));
app.use('/api/achats/dashboard', require('./routes/achats/dashboardAchats'));
app.use('/api/achats/fournisseurs', require('./routes/achats/fournisseurs'));

// Catégories achats
app.use('/api/categories-achats', require('./routes/achats/categoriesAchats'));

// Module Notes de frais (Employés)
app.use('/api/notes-frais', require('./routes/notes-frais/listNotesfrais'));
app.use('/api/note-frais', require('./routes/notes-frais/createNoteFrais'));
app.use('/api/notes-frais/dashboard', require('./routes/notes-frais/dashboardNotesfrais'));
app.use('/api/notes-frais/validation', require('./routes/notes-frais/validationNotes'));
app.use('/api/notes-frais', require('./routes/notes-frais/validationNotes')); // Routes de validation directes
app.use('/api/notes-frais/baremes', require('./routes/notes-frais/baremes'));

// Module Rapport Financier
app.use('/api/rapport/financier', require('./routes/rapport/rapportFinancier'));

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
            'SELECT * FROM projets WHERE societe_id = ? AND actif = 1 ORDER BY nom ASC',
            [societeId]
        );
        res.json({ projets });
    } catch (error) {
        console.error('Erreur projets:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
    }
});

// GET /api/types-frais - Récupérer les types de frais actifs
app.get('/api/types-frais', async (req, res) => {
    try {
        const [typesFrais] = await db.execute(
            'SELECT * FROM types_frais WHERE actif = 1 ORDER BY nom ASC'
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

        // Vérifier si la société a déjà des types de frais
        const [typesFraisExistants] = await db.execute(
            'SELECT * FROM types_frais WHERE societe_id = ? ORDER BY libelle ASC',
            [societeId]
        );

        // Si aucun type trouvé, insérer les valeurs par défaut
        if (typesFraisExistants.length === 0) {
            const insertQuery = `
                INSERT INTO types_frais 
                (nom, code, description, actif, created_at, updated_at, societe_id, libelle) VALUES
                ('Transport - Kilomètres','KM','Frais kilométriques pour véhicule personnel',1,NOW(),NOW(),?, 'Kilomètres'),
                ('Transport - Taxi/VTC','TAXI','Frais de taxi, VTC, ou transport à la demande',1,NOW(),NOW(),?, 'Taxi/VTC'),
                ('Transport - Train/Bus','TRANSPORT_PUBLIC','Transport en commun : train, bus, métro',1,NOW(),NOW(),?, 'Train/Bus'),
                ('Transport - Avion','AVION','Billets d''avion pour déplacements professionnels',1,NOW(),NOW(),?, 'Avion'),
                ('Hébergement - Hôtel','HOTEL','Nuitées d''hôtel lors de déplacements',1,NOW(),NOW(),?, 'Hôtel'),
                ('Hébergement - Autre','HEBERGEMENT_AUTRE','Autres types d''hébergement (AirBnB, etc.)',1,NOW(),NOW(),?, 'Autre hébergement'),
                ('Repas - Client','REPAS_CLIENT','Repas avec clients ou prospects',1,NOW(),NOW(),?, 'Repas client'),
                ('Repas - Déplacement','REPAS_DEPLACEMENT','Repas lors de déplacements professionnels',1,NOW(),NOW(),?, 'Repas déplacement')
            `;

            // Exécuter l’insertion avec societeId pour chaque ligne
            await db.execute(insertQuery, Array(8).fill(societeId));

            // Récupérer à nouveau la liste après insertion
            const [typesFraisInserts] = await db.execute(
                'SELECT * FROM types_frais WHERE societe_id = ? ORDER BY libelle ASC',
                [societeId]
            );

            return res.json({ 
                success: true,
                types_frais: typesFraisInserts,
                message: "Types de frais par défaut insérés"
            });
        }

        // Sinon, renvoyer la liste existante
        res.json({ 
            success: true,
            types_frais: typesFraisExistants
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

        // Pour chaque ligne de frais, récupérer ses justificatifs
        for (let i = 0; i < lignes.length; i++) {
            const [justificatifs] = await db.execute(`
                SELECT 
                    id,
                    nom_fichier,
                    chemin_fichier,
                    type_mime,
                    taille_fichier,
                    CONCAT('/api/image/', chemin_fichier) as url,
                    created_at
                FROM justificatifs_frais 
                WHERE ligne_frais_id = ?
                ORDER BY created_at DESC
            `, [lignes[i].id]);
            
            lignes[i].justificatifs = justificatifs;
        }

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

        const fraisId = result.insertId;

        // Associer le justificatif si fourni
        if (req.body.justificatif_info) {
            try {
                const justificatif = req.body.justificatif_info;
                console.log('Association justificatif au frais:', fraisId, justificatif);
                
                await db.execute(`
                    INSERT INTO justificatifs_frais (
                        ligne_frais_id, nom_fichier, chemin_fichier, type_mime, taille_fichier, created_at
                    ) VALUES (?, ?, ?, ?, ?, NOW())
                `, [fraisId, justificatif.nom_fichier, justificatif.chemin_fichier, justificatif.type_mime, justificatif.taille_fichier]);
                
                console.log('Justificatif associé avec succès au frais:', fraisId);
            } catch (justificatifError) {
                console.error('Erreur association justificatif:', justificatifError);
                // Ne pas faire échouer la création du frais si le justificatif échoue
            }
        }

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

// Configuration multer pour les justificatifs de frais
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads/notes-frais');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
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

// POST /api/frais/upload-auto - Upload automatique pour un frais
app.post('/api/frais/upload-auto', upload.single('justificatif'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }

        const fileInfo = {
            nom_fichier: req.file.originalname,
            chemin_fichier: req.file.filename,
            type_mime: req.file.mimetype,
            taille_fichier: req.file.size,
            url: `/api/image/${req.file.filename}`,
            temp_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // ID temporaire pour associer plus tard
        };

        console.log('Fichier uploadé automatiquement:', fileInfo);

        res.json({
            success: true,
            message: 'Fichier uploadé avec succès',
            fichier: fileInfo
        });

    } catch (error) {
        console.error('Erreur upload automatique:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload du fichier',
            error: error.message
        });
    }
});

// POST /api/upload-justificatif - Upload d'un justificatif
app.post('/api/upload-justificatif', upload.single('justificatif'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }

        const fileInfo = {
            nom_fichier: req.file.originalname,
            chemin_fichier: req.file.filename, // Nom du fichier sur le serveur
            type_mime: req.file.mimetype,
            taille_fichier: req.file.size,
            url: `/api/image/${req.file.filename}` // URL pour accéder au fichier
        };

        console.log('Fichier uploadé:', fileInfo);

        res.json({
            success: true,
            message: 'Fichier uploadé avec succès',
            fichier: fileInfo
        });

    } catch (error) {
        console.error('Erreur upload fichier:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload du fichier',
            error: error.message
        });
    }
});

// POST /api/frais/:fraisId/justificatif - Associer un justificatif à un frais
app.post('/api/frais/:fraisId/justificatif', async (req, res) => {
    try {
        const { fraisId } = req.params;
        const { nom_fichier, chemin_fichier, type_mime, taille_fichier } = req.body;

        if (!nom_fichier || !chemin_fichier || !type_mime || !taille_fichier) {
            return res.status(400).json({
                success: false,
                message: 'Informations de fichier manquantes'
            });
        }

        // Vérifier que le frais existe
        const [fraisExists] = await db.execute(
            'SELECT id FROM lignes_frais WHERE id = ?',
            [fraisId]
        );

        if (fraisExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Frais non trouvé'
            });
        }

        // Insérer le justificatif
        const [result] = await db.execute(`
            INSERT INTO justificatifs_frais (
                ligne_frais_id, nom_fichier, chemin_fichier, type_mime, taille_fichier, created_at
            ) VALUES (?, ?, ?, ?, ?, NOW())
        `, [fraisId, nom_fichier, chemin_fichier, type_mime, taille_fichier]);

        console.log('Justificatif associé au frais:', fraisId, result.insertId);

        res.json({
            success: true,
            message: 'Justificatif associé au frais avec succès',
            justificatif_id: result.insertId
        });

    } catch (error) {
        console.error('Erreur association justificatif:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'association du justificatif',
            error: error.message
        });
    }
});

// GET /api/frais/:fraisId/justificatifs - Récupérer les justificatifs d'un frais
app.get('/api/frais/:fraisId/justificatifs', async (req, res) => {
    try {
        const { fraisId } = req.params;

        const [justificatifs] = await db.execute(`
            SELECT 
                id,
                nom_fichier,
                chemin_fichier,
                type_mime,
                taille_fichier,
                CONCAT('/api/image/', chemin_fichier) as url,
                created_at
            FROM justificatifs_frais 
            WHERE ligne_frais_id = ?
            ORDER BY created_at DESC
        `, [fraisId]);

        res.json({
            success: true,
            justificatifs: justificatifs
        });

    } catch (error) {
        console.error('Erreur récupération justificatifs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des justificatifs',
            error: error.message
        });
    }
});

// ENDPOINTS POUR LA VALIDATION DES NOTES DE FRAIS

// GET /api/notes-frais/validation/:societeId - Notes en attente de validation
app.get('/api/notes-frais/validation/:societeId', async (req, res) => {
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
                nf.updated_at,
                u.firstName,
                u.lastName,
                (SELECT COUNT(*) FROM lignes_frais lf WHERE lf.note_frais_id = nf.id) as nb_lignes
            FROM notes_frais nf
            LEFT JOIN users u ON nf.user_id = u.id
            WHERE nf.societe_id = ? AND nf.statut = 'soumise'
            ORDER BY nf.updated_at ASC
        `, [societeId]);

        res.json({
            success: true,
            notes: notes
        });

    } catch (error) {
        console.error('Erreur récupération notes validation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des notes à valider',
            error: error.message
        });
    }
});

// PUT /api/notes-frais/validate - Valider une ou plusieurs notes
app.put('/api/notes-frais/validate', async (req, res) => {
    try {
        const { noteIds, action } = req.body; // action: 'valider' ou 'refuser'

        if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Liste des IDs de notes requise'
            });
        }

        if (!action || !['valider', 'refuser'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action doit être "valider" ou "refuser"'
            });
        }

        const statut = action === 'valider' ? 'validee' : 'refusee';
        const placeholders = noteIds.map(() => '?').join(',');

        // Mettre à jour toutes les notes sélectionnées
        const [result] = await db.execute(`
            UPDATE notes_frais 
            SET statut = ?, updated_at = NOW()
            WHERE id IN (${placeholders}) AND statut = 'soumise'
        `, [statut, ...noteIds]);

        console.log(`${result.affectedRows} notes ${action === 'valider' ? 'validées' : 'refusées'}`);

        res.json({
            success: true,
            message: `${result.affectedRows} note(s) ${action === 'valider' ? 'validée(s)' : 'refusée(s)'} avec succès`,
            data: {
                count: result.affectedRows,
                action: action,
                statut: statut
            }
        });

    } catch (error) {
        console.error('Erreur validation notes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la validation des notes',
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
app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

io.on('connection', (socket) => {
  console.log("Un utilisateur est connecté avec l'ID : " + socket.id);

  socket.emit('message', 'Bienvenue sur le 5000 !');

  socket.on('join_ticket_room', (ticketId) => {
    console.log(`👥 L'utilisateur ${socket.id} rejoint la room ticket_${ticketId}`);
    socket.join(`ticket_${ticketId}`);
  });

  socket.on('sendMessage', (data) => {
    console.log('Message reçu : ', data);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté au 5000: ' + socket.id);
    io.emit('new_message', 'data test');
  });
});

// =====================================
// INITIALISATION JOB DE RELANCE AUTOMATIQUE
// =====================================
const relanceJob = new RelanceAutomatique();
relanceJob.start();
console.log('✅ Job de relance automatique initialisé');

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://0.0.0.0:${port}`);
});
