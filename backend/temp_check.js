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
            types: typesFrais 
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
// GET /api/types-frais/manage/:societeId - Tous les types (système + personnalisés)
app.get('/api/types-frais/manage/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;

        // 1. Récupérer tous les types système
        const [typesSysteme] = await db.execute(`
            SELECT tf.*, 
                   COALESCE(tfs.actif, TRUE) as actif,
                   tfs.id as societe_config_id,
                   'system' as source_type
            FROM types_frais tf 
            LEFT JOIN types_frais_societe tfs ON tf.id = tfs.type_frais_id AND tfs.societe_id = ?
            WHERE tf.is_system = TRUE 
            ORDER BY tf.libelle ASC
        `, [societeId]);

        // 2. Récupérer les types personnalisés de la société
        const [typesPersonnalises] = await db.execute(`
            SELECT *, 'custom' as source_type, NULL as societe_config_id
            FROM types_frais 
            WHERE societe_id = ? AND is_system = FALSE 
            ORDER BY libelle ASC
        `, [societeId]);

        // 3. Combiner les deux listes
        const allTypes = [...typesSysteme, ...typesPersonnalises];

        res.json({ 
            success: true,
            types_frais: allTypes,
            summary: {
                system_types: typesSysteme.length,
                custom_types: typesPersonnalises.length,
                total: allTypes.length
            }
        });


            // Exécuter l’insertion avec societeId pour chaque ligne





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
// PUT /api/types-frais/:typeId - Modifier un type de frais
app.put('/api/types-frais/:typeId', async (req, res) => {
    try {
        const { typeId } = req.params;
        const { libelle, actif, societeId } = req.body;

        // Vérifier si c'est un type système ou personnalisé
        const [typeInfo] = await db.execute(`
            SELECT is_system, societe_id FROM types_frais WHERE id = ?
        `, [typeId]);

        if (typeInfo.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Type de frais non trouvé' 
            });
        }

        const isSystemType = typeInfo[0].is_system;

        if (isSystemType) {
            // Pour les types système : gérer via la table types_frais_societe
            if (typeof actif !== 'undefined') {
                // Vérifier s'il existe déjà une configuration pour cette société
                const [existingConfig] = await db.execute(`
                    SELECT id FROM types_frais_societe 
                    WHERE societe_id = ? AND type_frais_id = ?
                `, [societeId, typeId]);

                if (existingConfig.length > 0) {
                    // Mettre à jour la configuration existante
                    await db.execute(`
                        UPDATE types_frais_societe 
                        SET actif = ?, updated_at = NOW()
                        WHERE societe_id = ? AND type_frais_id = ?
                    `, [actif, societeId, typeId]);
