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

// Routes stock - catégories
app.use('/api/categories-stock', require('./routes/stock/categoriesStock'));
app.use('/api/sous-categories-stock', require('./routes/stock/sousCategoriesStock'));

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

// API pour les comptes fournisseur
app.get('/api/comptes-fournisseur', async (req, res) => {
    try {
        const [comptes] = await db.execute(`
            SELECT id, numero, libelle, description, actif, is_system
            FROM comptes_fournisseur 
            WHERE actif = TRUE 
            ORDER BY numero ASC
        `);

        res.json({
            success: true,
            comptes: comptes
        });
    } catch (error) {
        console.error('Erreur chargement comptes fournisseur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des comptes fournisseur'
        });
    }
});

// API pour les comptes fournisseur d'une société (système + personnalisés)
app.get('/api/comptes-fournisseur/societe/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;

        // 1. Récupérer les comptes système avec leurs personnalisations
        const [comptesSysteme] = await db.execute(`
            SELECT cf.id, cf.numero, cf.libelle, cf.description, cf.actif, cf.is_system,
                   cfs.id as personalized_id, cfs.numero as pers_numero, 
                   cfs.libelle as pers_libelle, cfs.description as pers_description,
                   cfs.actif as pers_actif,
                   CASE 
                     WHEN cfs.id IS NOT NULL THEN TRUE 
                     ELSE FALSE 
                   END as is_personalized
            FROM comptes_fournisseur cf
            LEFT JOIN comptes_fournisseur_societe cfs ON cf.id = cfs.compte_fournisseur_id AND cfs.societe_id = ?
            WHERE cf.is_system = TRUE
            ORDER BY cf.numero ASC
        `, [societeId]);

        // 2. Récupérer les comptes entièrement nouveaux de la société
        const [comptesNouveaux] = await db.execute(`
            SELECT id, numero, libelle, description, actif, 
                   FALSE as is_system, FALSE as is_personalized
            FROM comptes_fournisseur_societe
            WHERE societe_id = ? AND compte_fournisseur_id IS NULL
            ORDER BY numero ASC
        `, [societeId]);

        // 3. Formater les résultats
        const comptes = [];

        // Ajouter les comptes système (personnalisés ou non)
        comptesSysteme.forEach(compte => {
            if (compte.is_personalized) {
                // Compte personnalisé
                comptes.push({
                    id: compte.personalized_id,
                    numero: compte.pers_numero,
                    libelle: compte.pers_libelle,
                    description: compte.pers_description,
                    actif: compte.pers_actif,
                    is_system: false,
                    is_personalized: true,
                    original_id: compte.id
                });
            } else {
                // Compte système non personnalisé
                comptes.push({
                    id: compte.id,
                    numero: compte.numero,
                    libelle: compte.libelle,
                    description: compte.description,
                    actif: compte.actif,
                    is_system: true,
                    is_personalized: false
                });
            }
        });

        // Ajouter les comptes entièrement nouveaux
        comptesNouveaux.forEach(compte => {
            comptes.push({
                ...compte,
                is_system: false,
                is_personalized: false
            });
        });

        res.json({
            success: true,
            comptes: comptes
        });

    } catch (error) {
        console.error('Erreur chargement comptes société:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des comptes'
        });
    }
});

// POST - Créer/Personnaliser un compte pour une société
app.post('/api/comptes-fournisseur/societe', async (req, res) => {
    try {
        const { societe_id, compte_fournisseur_id, numero, libelle, description, actif } = req.body;

        if (!societe_id || !numero || !libelle) {
            return res.status(400).json({
                success: false,
                message: 'Société ID, numéro et libellé sont requis'
            });
        }

        const [result] = await db.execute(`
            INSERT INTO comptes_fournisseur_societe 
            (societe_id, compte_fournisseur_id, numero, libelle, description, actif, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [societe_id, compte_fournisseur_id || null, numero, libelle, description || null, actif !== false]);

        res.status(201).json({
            success: true,
            message: compte_fournisseur_id ? 'Compte personnalisé avec succès' : 'Compte créé avec succès',
            data: { compteId: result.insertId }
        });

    } catch (error) {
        console.error('Erreur création compte société:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du compte'
        });
    }
});

// PUT - Modifier un compte personnalisé
app.put('/api/comptes-fournisseur/societe/:compteId', async (req, res) => {
    try {
        const { compteId } = req.params;
        const { numero, libelle, description, actif } = req.body;

        const updates = [];
        const values = [];

        if (numero) {
            updates.push('numero = ?');
            values.push(numero);
        }
        if (libelle) {
            updates.push('libelle = ?');
            values.push(libelle);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (typeof actif !== 'undefined') {
            updates.push('actif = ?');
            values.push(actif);
        }

        if (updates.length > 0) {
            updates.push('updated_at = NOW()');
            values.push(compteId);

            await db.execute(`
                UPDATE comptes_fournisseur_societe 
                SET ${updates.join(', ')} 
                WHERE id = ?
            `, values);
        }

        res.json({
            success: true,
            message: 'Compte modifié avec succès'
        });

    } catch (error) {
        console.error('Erreur modification compte:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification'
        });
    }
});

// DELETE - Supprimer un compte personnalisé
app.delete('/api/comptes-fournisseur/societe/:compteId', async (req, res) => {
    try {
        const { compteId } = req.params;

        await db.execute(`
            DELETE FROM comptes_fournisseur_societe 
            WHERE id = ?
        `, [compteId]);

        res.json({
            success: true,
            message: 'Compte supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur suppression compte:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression'
        });
    }
});

// ENDPOINTS POUR LA GESTION DES TYPES DE FRAIS
// GET /api/types-frais/manage/:societeId - Tous les types (système + personnalisés)
app.get('/api/types-frais/manage/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;

        // 1. Récupérer tous les types système avec leurs personnalisations
        const [typesSysteme] = await db.execute(`
            SELECT tf.id, tf.nom, tf.libelle, tf.description, tf.actif, tf.is_system,
                   tf.tva_deductible, tf.taux_deduction_tva, tf.compte_comptable_id,
                   tfs.actif as societe_actif,
                   tfsp.id as pers_id, tfsp.libelle_personnalise as pers_libelle,
                   tfsp.description_personnalisee as pers_description,
                   tfsp.tva_deductible as pers_tva_deductible, 
                   tfsp.taux_deduction_tva as pers_taux_deduction_tva,
                   tfsp.compte_comptable_id as pers_compte_comptable_id,
                   CASE 
                     WHEN tfsp.id IS NOT NULL THEN TRUE 
                     ELSE FALSE 
                   END as is_personalized
            FROM types_frais tf 
            LEFT JOIN types_frais_societe tfs ON tf.id = tfs.type_frais_id AND tfs.societe_id = ?
            LEFT JOIN types_frais_societe_personnalisation tfsp ON tf.id = tfsp.type_frais_id AND tfsp.societe_id = ?
            WHERE tf.is_system = 1 
            ORDER BY tf.libelle ASC
        `, [societeId, societeId]);

        // 2. Récupérer les types personnalisés de la société (non-système créés par la société)
        const [typesCustom] = await db.execute(`
            SELECT id, nom, libelle, description, actif, 
                   tva_deductible, taux_deduction_tva, compte_comptable_id,
                   0 as is_system, 0 as is_personalized, 'custom' as source_type
            FROM types_frais
            WHERE societe_id = ? AND is_system = 0
            ORDER BY libelle ASC
        `, [societeId]);

        // 3. Formater les résultats
        const allTypes = [];

        // Ajouter les types système (personnalisés ou non)
        typesSysteme.forEach(type => {
            if (type.is_personalized) {
                // Type système personnalisé
                allTypes.push({
                    id: type.id,
                    nom: type.nom,
                    libelle: type.pers_libelle || type.libelle,
                    description: type.pers_description || type.description,
                    actif: type.societe_actif !== null ? type.societe_actif : type.actif,
                    tva_deductible: type.pers_tva_deductible !== null ? type.pers_tva_deductible : type.tva_deductible,
                    taux_deduction_tva: type.pers_taux_deduction_tva !== null ? type.pers_taux_deduction_tva : type.taux_deduction_tva,
                    compte_comptable_id: type.pers_compte_comptable_id !== null ? type.pers_compte_comptable_id : type.compte_comptable_id,
                    source_type: 'personalized',
                    original_id: type.id,
                    is_system: true,
                    is_personalized: true,
                    personnalisation_id: type.pers_id
                });
            } else {
                // Type système non personnalisé
                const actifStatus = type.societe_actif !== null ? type.societe_actif : type.actif;
                allTypes.push({
                    id: type.id,
                    nom: type.nom,
                    libelle: type.libelle,
                    description: type.description,
                    actif: actifStatus,
                    tva_deductible: type.tva_deductible,
                    taux_deduction_tva: type.taux_deduction_tva,
                    compte_comptable_id: type.compte_comptable_id,
                    source_type: 'system',
                    is_system: true,
                    is_personalized: false
                });
            }
        });

        // Ajouter les types entièrement nouveaux créés par la société
        typesCustom.forEach(type => {
            allTypes.push({
                ...type,
                source_type: 'custom',
                is_system: false,
                is_personalized: false
            });
        });

        res.json({ 
            success: true,
            types_frais: allTypes,
            summary: {
                system_types: typesSysteme.filter(t => !t.is_personalized).length,
                personalized_types: typesSysteme.filter(t => t.is_personalized).length,
                custom_types: typesCustom.length,
                total: allTypes.length
            }
        });
    } catch (error) {
        console.error('Erreur gestion types de frais:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la récupération des types de frais' 
        });
    }
});


app.put('/api/types-frais/:typeId', async (req, res) => {
    try {
        const { typeId } = req.params;
        const { libelle, actif, societeId, tva_deductible, taux_deduction_tva, compte_comptable_id, description } = req.body;

        console.log('PUT /api/types-frais/:typeId - Données reçues:', { typeId, libelle, actif, societeId, tva_deductible, taux_deduction_tva, compte_comptable_id, description });

        // Gérer les valeurs undefined en les convertissant en null
        const safeDescription = description || null;
        const safeTvaDeductible = tva_deductible || null;
        const safeTauxDeductionTva = taux_deduction_tva || null;
        const safeCompteComptableId = compte_comptable_id || null;

        // Vérifier si le type existe et s'il est système
        const [typeInfo] = await db.execute(`
            SELECT id, nom, libelle, is_system FROM types_frais WHERE id = ?
        `, [typeId]);

        if (typeInfo.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Type de frais non trouvé' 
            });
        }

        const type = typeInfo[0];

        if (type.is_system === 1) {
            // C'est un type système, on doit créer ou mettre à jour une personnalisation
            
            // Vérifier si une personnalisation existe déjà
            const [existingPersonalization] = await db.execute(`
                SELECT id FROM types_frais_societe_personnalisation 
                WHERE type_frais_id = ? AND societe_id = ?
            `, [typeId, societeId]);

            if (existingPersonalization.length > 0) {
                // Mettre à jour la personnalisation existante
                await db.execute(`
                    UPDATE types_frais_societe_personnalisation 
                    SET libelle_personnalise = ?, 
                        description_personnalisee = ?, 
                        tva_deductible = ?, 
                        taux_deduction_tva = ?, 
                        compte_comptable_id = ?,
                        date_modification = CURRENT_TIMESTAMP
                    WHERE type_frais_id = ? AND societe_id = ?
                `, [libelle, safeDescription, safeTvaDeductible, safeTauxDeductionTva, safeCompteComptableId, typeId, societeId]);

                console.log('Personnalisation mise à jour pour le type système', typeId);
            } else {
                // Créer une nouvelle personnalisation
                await db.execute(`
                    INSERT INTO types_frais_societe_personnalisation 
                    (type_frais_id, societe_id, libelle_personnalise, description_personnalisee, tva_deductible, taux_deduction_tva, compte_comptable_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [typeId, societeId, libelle, safeDescription, safeTvaDeductible, safeTauxDeductionTva, safeCompteComptableId]);

                console.log('Nouvelle personnalisation créée pour le type système', typeId);
            }

            // Gérer l'activation/désactivation dans types_frais_societe
            const [existingSocieteType] = await db.execute(`
                SELECT id FROM types_frais_societe 
                WHERE type_frais_id = ? AND societe_id = ?
            `, [typeId, societeId]);

            if (existingSocieteType.length > 0) {
                // Mettre à jour l'état actif
                await db.execute(`
                    UPDATE types_frais_societe 
                    SET actif = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE type_frais_id = ? AND societe_id = ?
                `, [actif ? 1 : 0, typeId, societeId]);
            } else {
                // Créer l'entrée dans types_frais_societe
                await db.execute(`
                    INSERT INTO types_frais_societe (type_frais_id, societe_id, actif)
                    VALUES (?, ?, ?)
                `, [typeId, societeId, actif ? 1 : 0]);
            }

            return res.json({
                success: true,
                message: 'Type de frais système personnalisé avec succès',
                data: { 
                    typeId: typeId,
                    libelle: libelle,
                    is_personalized: true
                }
            });

        } else {
            // C'est un type personnalisé de la société, modification directe
            await db.execute(`
                UPDATE types_frais 
                SET libelle = ?, description = ?, actif = ?, 
                    tva_deductible = ?, taux_deduction_tva = ?, compte_comptable_id = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND societe_id = ?
            `, [libelle, description, actif ? 1 : 0, tva_deductible, taux_deduction_tva, compte_comptable_id, typeId, societeId]);

            return res.json({
                success: true,
                message: 'Type de frais personnalisé modifié avec succès',
                data: { 
                    typeId: typeId,
                    libelle: libelle,
                    is_personalized: false
                }
            });
        }

    } catch (error) {
        console.error('Erreur modification type de frais:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la modification du type de frais',
            details: error.message 
        });
    }
});

// POST /api/types-frais - Créer un nouveau type de frais personnalisé
app.post('/api/types-frais', async (req, res) => {
    try {
        const { nom, libelle, societe_id, description, tva_deductible, taux_deduction_tva, compte_comptable_id } = req.body;

        if (!nom || !libelle || !societe_id) {
            return res.status(400).json({
                success: false,
                message: 'Nom, libellé et société ID sont requis'
            });
        }

        // Générer un code unique à partir du nom (limité à 20 caractères)
        const code = nom.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .substring(0, 20);

        // Créer un nouveau type entièrement personnalisé directement dans types_frais
        const [result] = await db.execute(`
            INSERT INTO types_frais 
            (nom, code, libelle, description, societe_id, actif, is_system, tva_deductible, taux_deduction_tva, compte_comptable_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
            nom.trim(),
            code,
            libelle.trim(),
            description || null,
            societe_id,
            tva_deductible || 1,
            taux_deduction_tva || 20.00,
            compte_comptable_id || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Type de frais personnalisé créé avec succès',
            data: { 
                typeId: result.insertId,
                nom: nom.trim(),
                libelle: libelle.trim(),
                code: code
            }
        });
    } catch (error) {
        console.error('Erreur création type de frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du type de frais',
            details: error.message
        });
    }
});

// ========== COMPTES COMPTABLES APIs ==========

// GET /api/comptes-comptables - Récupérer tous les comptes comptables système
app.get('/api/comptes-comptables', async (req, res) => {
    try {
        const [comptes] = await db.execute(`
            SELECT id, numero_compte, libelle, is_system, actif
            FROM comptes_comptables 
            WHERE actif = 1 
            ORDER BY numero_compte ASC
        `);

        res.json({ 
            success: true,
            comptes_comptables: comptes
        });
    } catch (error) {
        console.error('Erreur récupération comptes comptables:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la récupération des comptes comptables' 
        });
    }
});

// GET /api/comptes-comptables/societe/:societeId - Comptes comptables pour une société (système + personnalisés)
app.get('/api/comptes-comptables/societe/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;

        // 1. Récupérer les comptes système et leurs personnalisations
        const [comptesSysteme] = await db.execute(`
            SELECT cc.id, cc.numero_compte, cc.libelle, cc.is_system, cc.actif,
                   ccs.id as societe_id, ccs.numero_compte as societe_numero, 
                   ccs.libelle as societe_libelle, ccs.is_personnalise, ccs.actif as societe_actif,
                   CASE 
                     WHEN ccs.id IS NOT NULL AND ccs.is_personnalise = 1 THEN TRUE 
                     ELSE FALSE 
                   END as is_personalized
            FROM comptes_comptables cc
            LEFT JOIN comptes_comptables_societe ccs ON cc.id = ccs.compte_comptable_id AND ccs.societe_id = ?
            WHERE cc.is_system = 1 AND cc.actif = 1
            ORDER BY cc.numero_compte ASC
        `, [societeId]);

        // 2. Récupérer les comptes entièrement nouveaux de la société
        const [comptesCustom] = await db.execute(`
            SELECT id, numero_compte, libelle, 0 as is_system, actif, 1 as is_custom
            FROM comptes_comptables_societe
            WHERE societe_id = ? AND compte_comptable_id IS NULL AND actif = 1
            ORDER BY numero_compte ASC
        `, [societeId]);

        // 3. Formater les résultats
        const allComptes = [];

        // Ajouter les comptes système (personnalisés ou non)
        comptesSysteme.forEach(compte => {
            if (compte.is_personalized) {
                // Compte système personnalisé
                allComptes.push({
                    id: compte.id,
                    numero_compte: compte.societe_numero || compte.numero_compte,
                    libelle: compte.societe_libelle || compte.libelle,
                    actif: compte.societe_actif !== null ? compte.societe_actif : compte.actif,
                    source_type: 'personalized',
                    original_id: compte.id,
                    is_system: true,
                    is_personalized: true,
                    societe_compte_id: compte.societe_id
                });
            } else {
                // Compte système non personnalisé
                allComptes.push({
                    id: compte.id,
                    numero_compte: compte.numero_compte,
                    libelle: compte.libelle,
                    actif: compte.actif,
                    source_type: 'system',
                    is_system: true,
                    is_personalized: false
                });
            }
        });

        // Ajouter les comptes entièrement nouveaux créés par la société
        comptesCustom.forEach(compte => {
            allComptes.push({
                ...compte,
                source_type: 'custom',
                is_system: false,
                is_personalized: false
            });
        });

        res.json({ 
            success: true,
            comptes_comptables: allComptes,
            summary: {
                system_comptes: comptesSysteme.filter(c => !c.is_personalized).length,
                personalized_comptes: comptesSysteme.filter(c => c.is_personalized).length,
                custom_comptes: comptesCustom.length,
                total: allComptes.length
            }
        });
    } catch (error) {
        console.error('Erreur gestion comptes comptables société:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la récupération des comptes comptables de la société' 
        });
    }
});

// POST /api/comptes-comptables - Créer un nouveau compte comptable personnalisé
app.post('/api/comptes-comptables', async (req, res) => {
    try {
        const { numero_compte, libelle, societe_id } = req.body;

        if (!numero_compte || !libelle || !societe_id) {
            return res.status(400).json({
                success: false,
                message: 'Numéro de compte, libellé et société ID sont requis'
            });
        }

        // Créer un nouveau compte personnalisé pour la société
        const [result] = await db.execute(`
            INSERT INTO comptes_comptables_societe 
            (societe_id, numero_compte, libelle, is_custom, actif)
            VALUES (?, ?, ?, 1, 1)
        `, [societe_id, numero_compte.trim(), libelle.trim()]);

        res.status(201).json({
            success: true,
            message: 'Compte comptable personnalisé créé avec succès',
            data: { 
                compteId: result.insertId,
                numero_compte: numero_compte.trim(),
                libelle: libelle.trim()
            }
        });
    } catch (error) {
        console.error('Erreur création compte comptable:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du compte comptable',
            details: error.message
        });
    }
});

// PUT /api/comptes-comptables/:compteId - Personnaliser un compte comptable système
app.put('/api/comptes-comptables/:compteId', async (req, res) => {
    try {
        const { compteId } = req.params;
        const { numero_compte, libelle, societeId } = req.body;

        // Vérifier si le compte existe et s'il est système
        const [compteInfo] = await db.execute(`
            SELECT id, numero_compte, libelle, is_system FROM comptes_comptables WHERE id = ?
        `, [compteId]);

        if (compteInfo.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Compte comptable non trouvé' 
            });
        }

        const compte = compteInfo[0];

        if (compte.is_system === 1) {
            // C'est un compte système, créer ou mettre à jour une personnalisation
            
            const [existingPersonalization] = await db.execute(`
                SELECT id FROM comptes_comptables_societe 
                WHERE compte_comptable_id = ? AND societe_id = ?
            `, [compteId, societeId]);

            if (existingPersonalization.length > 0) {
                // Mettre à jour la personnalisation existante
                await db.execute(`
                    UPDATE comptes_comptables_societe 
                    SET numero_compte = ?, libelle = ?, is_personnalise = 1,
                        date_modification = CURRENT_TIMESTAMP
                    WHERE compte_comptable_id = ? AND societe_id = ?
                `, [numero_compte, libelle, compteId, societeId]);
            } else {
                // Créer une nouvelle personnalisation
                await db.execute(`
                    INSERT INTO comptes_comptables_societe 
                    (compte_comptable_id, societe_id, numero_compte, libelle, is_personnalise, actif)
                    VALUES (?, ?, ?, ?, 1, 1)
                `, [compteId, societeId, numero_compte, libelle]);
            }

            return res.json({
                success: true,
                message: 'Compte comptable système personnalisé avec succès',
                data: { 
                    compteId: compteId,
                    numero_compte: numero_compte,
                    libelle: libelle,
                    is_personalized: true
                }
            });

        } else {
            // C'est un compte personnalisé, modification directe dans comptes_comptables_societe
            await db.execute(`
                UPDATE comptes_comptables_societe 
                SET numero_compte = ?, libelle = ?, 
                    date_modification = CURRENT_TIMESTAMP
                WHERE id = ? AND societe_id = ?
            `, [numero_compte, libelle, compteId, societeId]);

            return res.json({
                success: true,
                message: 'Compte comptable personnalisé modifié avec succès',
                data: { 
                    compteId: compteId,
                    numero_compte: numero_compte,
                    libelle: libelle
                }
            });
        }

    } catch (error) {
        console.error('Erreur modification compte comptable:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la modification du compte comptable',
            details: error.message 
        });
    }
});

// ========== BAREMES KILOMETRIQUES APIs ==========

// GET /api/baremes-kilometriques - Récupérer tous les barèmes système
app.get('/api/baremes-kilometriques', async (req, res) => {
    try {
        const [baremes] = await db.execute(`
            SELECT id, nom, description, puissance_fiscale, tarif_km, is_system, actif
            FROM baremes_kilometriques 
            WHERE actif = 1 
            ORDER BY id ASC
        `);

        res.json({ 
            success: true,
            baremes_kilometriques: baremes
        });
    } catch (error) {
        console.error('Erreur récupération barèmes kilométriques:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la récupération des barèmes kilométriques' 
        });
    }
});

// GET /api/baremes-kilometriques/societe/:societeId - Barèmes pour une société (système + personnalisés)
app.get('/api/baremes-kilometriques/societe/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;

        // 1. Récupérer les barèmes système et leurs personnalisations
        const [baremesSysteme] = await db.execute(`
            SELECT bk.id, bk.nom, bk.description, bk.puissance_fiscale, bk.tarif_km, bk.is_system, bk.actif,
                   bks.id as societe_id, bks.nom as societe_nom, bks.description as societe_description,
                   bks.puissance_fiscale_min as societe_pf_min, bks.puissance_fiscale_max as societe_pf_max,
                   bks.tarif_par_km as societe_tarif, bks.is_personnalise, bks.actif as societe_actif,
                   CASE 
                     WHEN bks.id IS NOT NULL AND bks.is_personnalise = 1 THEN TRUE 
                     ELSE FALSE 
                   END as is_personalized
            FROM baremes_kilometriques bk
            LEFT JOIN baremes_kilometriques_societe bks ON bk.id = bks.bareme_kilometrique_id AND bks.societe_id = ?
            WHERE bk.is_system = 1 AND bk.actif = 1
            ORDER BY bk.id ASC
        `, [societeId]);

        // 2. Récupérer les barèmes entièrement nouveaux de la société
        const [baremesCustom] = await db.execute(`
            SELECT id, nom, description, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, 0 as is_system, actif, 1 as is_custom
            FROM baremes_kilometriques_societe
            WHERE societe_id = ? AND bareme_kilometrique_id IS NULL AND actif = 1
            ORDER BY id ASC
        `, [societeId]);

        // 3. Formater les résultats
        const allBaremes = [];

        // Ajouter les barèmes système (personnalisés ou non)
        baremesSysteme.forEach(bareme => {
            if (bareme.is_personalized) {
                // Barème système personnalisé
                allBaremes.push({
                    id: bareme.id,
                    nom: bareme.societe_nom || bareme.nom,
                    description: bareme.societe_description || bareme.description,
                    puissance_fiscale: `${bareme.societe_pf_min}-${bareme.societe_pf_max} CV`,
                    tarif_km: bareme.societe_tarif,
                    actif: bareme.societe_actif !== null ? bareme.societe_actif : bareme.actif,
                    source_type: 'personalized',
                    original_id: bareme.id,
                    is_system: true,
                    is_personalized: true,
                    societe_bareme_id: bareme.societe_id
                });
            } else {
                // Barème système non personnalisé
                allBaremes.push({
                    id: bareme.id,
                    nom: bareme.nom,
                    description: bareme.description,
                    puissance_fiscale: bareme.puissance_fiscale,
                    tarif_km: bareme.tarif_km,
                    actif: bareme.actif,
                    source_type: 'system',
                    is_system: true,
                    is_personalized: false
                });
            }
        });

        // Ajouter les barèmes entièrement nouveaux créés par la société
        baremesCustom.forEach(bareme => {
            allBaremes.push({
                ...bareme,
                puissance_fiscale: `${bareme.puissance_fiscale_min}-${bareme.puissance_fiscale_max} CV`,
                tarif_km: bareme.tarif_par_km,
                source_type: 'custom',
                is_system: false,
                is_personalized: false
            });
        });

        res.json({ 
            success: true,
            baremes_kilometriques: allBaremes,
            summary: {
                system_baremes: baremesSysteme.filter(b => !b.is_personalized).length,
                personalized_baremes: baremesSysteme.filter(b => b.is_personalized).length,
                custom_baremes: baremesCustom.length,
                total: allBaremes.length
            }
        });
    } catch (error) {
        console.error('Erreur gestion barèmes kilométriques société:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la récupération des barèmes kilométriques de la société' 
        });
    }
});

// POST /api/baremes-kilometriques - Créer un nouveau barème personnalisé
app.post('/api/baremes-kilometriques', async (req, res) => {
    try {
        const { nom, description, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, societe_id } = req.body;

        if (!nom || !puissance_fiscale_min || !puissance_fiscale_max || !tarif_par_km || !societe_id) {
            return res.status(400).json({
                success: false,
                message: 'Nom, puissance fiscale et tarif sont requis'
            });
        }

        // Créer un nouveau barème personnalisé pour la société
        const [result] = await db.execute(`
            INSERT INTO baremes_kilometriques_societe 
            (societe_id, nom, description, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, is_custom, actif)
            VALUES (?, ?, ?, ?, ?, ?, 1, 1)
        `, [societe_id, nom.trim(), description || null, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km]);

        res.status(201).json({
            success: true,
            message: 'Barème kilométrique personnalisé créé avec succès',
            data: { 
                baremeId: result.insertId,
                nom: nom.trim(),
                tarif_par_km: tarif_par_km
            }
        });
    } catch (error) {
        console.error('Erreur création barème kilométrique:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du barème kilométrique',
            details: error.message
        });
    }
});

// PUT /api/baremes-kilometriques/:baremeId - Personnaliser un barème système
app.put('/api/baremes-kilometriques/:baremeId', async (req, res) => {
    try {
        const { baremeId } = req.params;
        const { nom, description, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, actif, societeId } = req.body;

        // Vérifier si le barème existe et s'il est système
        const [baremeInfo] = await db.execute(`
            SELECT id, nom, is_system FROM baremes_kilometriques WHERE id = ?
        `, [baremeId]);

        if (baremeInfo.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Barème kilométrique non trouvé' 
            });
        }

        const bareme = baremeInfo[0];

        if (bareme.is_system === 1) {
            // C'est un barème système, créer ou mettre à jour une personnalisation
            
            const [existingPersonalization] = await db.execute(`
                SELECT id FROM baremes_kilometriques_societe 
                WHERE bareme_kilometrique_id = ? AND societe_id = ?
            `, [baremeId, societeId]);

            if (existingPersonalization.length > 0) {
                // Mettre à jour la personnalisation existante
                await db.execute(`
                    UPDATE baremes_kilometriques_societe 
                    SET nom = ?, description = ?, puissance_fiscale_min = ?, puissance_fiscale_max = ?, 
                        tarif_par_km = ?, actif = ?, is_personnalise = 1, date_modification = CURRENT_TIMESTAMP
                    WHERE bareme_kilometrique_id = ? AND societe_id = ?
                `, [nom, description, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, actif ? 1 : 0, baremeId, societeId]);
            } else {
                // Créer une nouvelle personnalisation
                await db.execute(`
                    INSERT INTO baremes_kilometriques_societe 
                    (bareme_kilometrique_id, societe_id, nom, description, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, is_personnalise, actif)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                `, [baremeId, societeId, nom, description, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, actif ? 1 : 0]);
            }

            return res.json({
                success: true,
                message: 'Barème kilométrique système personnalisé avec succès',
                data: { 
                    baremeId: baremeId,
                    nom: nom,
                    tarif_par_km: tarif_par_km,
                    is_personalized: true
                }
            });

        } else {
            // C'est un barème personnalisé, modification directe dans baremes_kilometriques_societe
            await db.execute(`
                UPDATE baremes_kilometriques_societe 
                SET nom = ?, description = ?, puissance_fiscale_min = ?, puissance_fiscale_max = ?, 
                    tarif_par_km = ?, actif = ?, date_modification = CURRENT_TIMESTAMP
                WHERE id = ? AND societe_id = ?
            `, [nom, description, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, actif ? 1 : 0, baremeId, societeId]);

            return res.json({
                success: true,
                message: 'Barème kilométrique personnalisé modifié avec succès',
                data: { 
                    baremeId: baremeId,
                    nom: nom,
                    tarif_par_km: tarif_par_km
                }
            });
        }

    } catch (error) {
        console.error('Erreur modification barème kilométrique:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la modification du barème kilométrique',
            details: error.message 
        });
    }
});

// ========== CONFIGURATION CHAMPS TYPES DE FRAIS APIs ==========

// GET /api/types-frais/:typeId/champs-config/:societeId - Configuration des champs pour un type de frais
app.get('/api/types-frais/:typeId/champs-config/:societeId', async (req, res) => {
    try {
        const { typeId, societeId } = req.params;

        const [champs] = await db.execute(`
            SELECT nom_champ, visibilite, ordre_affichage
            FROM types_frais_champs_config 
            WHERE type_frais_id = ? AND societe_id = ?
            ORDER BY ordre_affichage ASC
        `, [typeId, societeId]);

        // Si aucune configuration, créer la configuration par défaut
        if (champs.length === 0) {
            const champsDefaut = [
                { nom_champ: 'type_repas', visibilite: 'facultatif', ordre: 1 },
                { nom_champ: 'lieu', visibilite: 'facultatif', ordre: 2 },
                { nom_champ: 'nom_restaurant', visibilite: 'facultatif', ordre: 3 },
                { nom_champ: 'date', visibilite: 'obligatoire', ordre: 4 },
                { nom_champ: 'refacturable', visibilite: 'facultatif', ordre: 5 },
                { nom_champ: 'client', visibilite: 'facultatif', ordre: 6 },
                { nom_champ: 'dossier', visibilite: 'facultatif', ordre: 7 },
                { nom_champ: 'fournisseurs', visibilite: 'facultatif', ordre: 8 },
                { nom_champ: 'motif', visibilite: 'obligatoire', ordre: 9 },
                { nom_champ: 'commentaire', visibilite: 'facultatif', ordre: 10 },
                { nom_champ: 'justificatif', visibilite: 'obligatoire', ordre: 11 },
                { nom_champ: 'numero_justificatif', visibilite: 'facultatif', ordre: 12 },
                { nom_champ: 'piece_jointe', visibilite: 'facultatif', ordre: 13 },
                { nom_champ: 'nom', visibilite: 'facultatif', ordre: 14 },
                { nom_champ: 'prenom', visibilite: 'facultatif', ordre: 15 },
                { nom_champ: 'tva_20', visibilite: 'facultatif', ordre: 16 },
                { nom_champ: 'tva_10', visibilite: 'facultatif', ordre: 17 },
                { nom_champ: 'tva_5_5', visibilite: 'facultatif', ordre: 18 },
                { nom_champ: 'tva_libre_1', visibilite: 'non_visible', ordre: 19 },
                { nom_champ: 'tva_libre_2', visibilite: 'non_visible', ordre: 20 },
                { nom_champ: 'tva_libre_3', visibilite: 'non_visible', ordre: 21 },
                { nom_champ: 'total_tva', visibilite: 'obligatoire', ordre: 22 },
                { nom_champ: 'contact_1', visibilite: 'facultatif', ordre: 23 }
            ];

            // Insérer la configuration par défaut
            for (const champ of champsDefaut) {
                await db.execute(`
                    INSERT IGNORE INTO types_frais_champs_config 
                    (type_frais_id, societe_id, nom_champ, visibilite, ordre_affichage)
                    VALUES (?, ?, ?, ?, ?)
                `, [typeId, societeId, champ.nom_champ, champ.visibilite, champ.ordre]);
            }

            // Récupérer la configuration créée
            const [nouvelleConfig] = await db.execute(`
                SELECT nom_champ, visibilite, ordre_affichage
                FROM types_frais_champs_config 
                WHERE type_frais_id = ? AND societe_id = ?
                ORDER BY ordre_affichage ASC
            `, [typeId, societeId]);

            return res.json({ 
                success: true,
                champs_config: nouvelleConfig
            });
        }

        res.json({ 
            success: true,
            champs_config: champs
        });
    } catch (error) {
        console.error('Erreur récupération configuration champs:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la récupération de la configuration des champs' 
        });
    }
});

// PUT /api/types-frais/:typeId/champs-config/:societeId - Mise à jour de la configuration des champs
app.put('/api/types-frais/:typeId/champs-config/:societeId', async (req, res) => {
    try {
        const { typeId, societeId } = req.params;
        const { champs_config } = req.body;

        if (!champs_config || !Array.isArray(champs_config)) {
            return res.status(400).json({
                success: false,
                message: 'Configuration des champs invalide'
            });
        }

        // Supprimer l'ancienne configuration
        await db.execute(`
            DELETE FROM types_frais_champs_config 
            WHERE type_frais_id = ? AND societe_id = ?
        `, [typeId, societeId]);

        // Insérer la nouvelle configuration
        for (let i = 0; i < champs_config.length; i++) {
            const champ = champs_config[i];
            await db.execute(`
                INSERT INTO types_frais_champs_config 
                (type_frais_id, societe_id, nom_champ, visibilite, ordre_affichage)
                VALUES (?, ?, ?, ?, ?)
            `, [typeId, societeId, champ.nom_champ, champ.visibilite, i + 1]);
        }

        res.json({
            success: true,
            message: 'Configuration des champs mise à jour avec succès',
            champs_updated: champs_config.length
        });
    } catch (error) {
        console.error('Erreur mise à jour configuration champs:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la mise à jour de la configuration des champs',
            details: error.message 
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

// GET /api/types-frais - Récupérer tous les types de frais
app.get('/api/types-frais', async (req, res) => {
    try {
        const [types] = await db.execute(`
            SELECT id, nom, description
            FROM types_frais 
            WHERE actif = 1
            ORDER BY nom
        `);

        res.json({
            success: true,
            types: types
        });

    } catch (error) {
        console.error('Erreur récupération types de frais:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des types de frais',
            error: error.message
        });
    }
});

// GET /api/baremes-kilometriques - Récupérer les barèmes kilométriques actifs
app.get('/api/baremes-kilometriques', async (req, res) => {
    try {
        const annee = req.query.annee || new Date().getFullYear();
        
        const [baremes] = await db.execute(`
            SELECT id, puissance_fiscale, tarif_km, annee
            FROM baremes_kilometriques 
            WHERE annee = ? AND actif = 1
            ORDER BY 
                CASE puissance_fiscale
                    WHEN '3 CV et moins' THEN 1
                    WHEN '4 CV' THEN 2
                    WHEN '5 CV' THEN 3
                    WHEN '6 CV' THEN 4
                    WHEN '7 CV et plus' THEN 5
                    ELSE 6
                END
        `, [annee]);

        res.json({
            success: true,
            baremes: baremes,
            annee: parseInt(annee)
        });

    } catch (error) {
        console.error('Erreur récupération barèmes kilométriques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des barèmes kilométriques',
            error: error.message
        });
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

// POST /api/frais/upload-justificatif - Upload et association d'un justificatif à un frais en une seule étape
app.post('/api/frais/upload-justificatif', upload.single('file'), async (req, res) => {
    try {
        const { frais_id, nom_fichier } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }
        
        if (!frais_id) {
            return res.status(400).json({
                success: false,
                message: 'ID du frais manquant'
            });
        }

        // Vérifier que le frais existe
        const [fraisExists] = await db.execute(
            'SELECT id FROM lignes_frais WHERE id = ?',
            [frais_id]
        );

        if (fraisExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Frais non trouvé'
            });
        }

        // Informations du fichier uploadé
        const fileInfo = {
            nom_fichier: nom_fichier || req.file.originalname,
            chemin_fichier: req.file.filename,
            type_mime: req.file.mimetype,
            taille_fichier: req.file.size,
            url: `/api/image/${req.file.filename}`
        };

        // Insérer le justificatif dans la base de données
        const [result] = await db.execute(`
            INSERT INTO justificatifs_frais (
                ligne_frais_id, nom_fichier, chemin_fichier, type_mime, taille_fichier, created_at
            ) VALUES (?, ?, ?, ?, ?, NOW())
        `, [frais_id, fileInfo.nom_fichier, fileInfo.chemin_fichier, fileInfo.type_mime, fileInfo.taille_fichier]);

        console.log('✅ Justificatif OCR uploadé et associé:', {
            frais_id,
            justificatif_id: result.insertId,
            filename: fileInfo.chemin_fichier
        });

        res.json({
            success: true,
            message: 'Justificatif uploadé et associé avec succès',
            justificatif: {
                id: result.insertId,
                nom_fichier: fileInfo.nom_fichier,
                url: fileInfo.url,
                type_mime: fileInfo.type_mime,
                taille_fichier: fileInfo.taille_fichier
            }
        });

    } catch (error) {
        console.error('❌ Erreur upload justificatif:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload et association du justificatif',
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
