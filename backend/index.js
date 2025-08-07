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
            'SELECT u.*, s.nom as societe_nom FROM users u LEFT JOIN societes s ON u.societe_id = s.id WHERE u.email = ? AND u.statut = "actif"',
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

// Types de frais et catégories
app.get('/api/types-frais/:societeId', async (req, res) => {
    try {
        const { societeId } = req.params;
        const [types] = await db.execute(
            'SELECT * FROM types_frais WHERE societe_id = ? ORDER BY nom ASC',
            [societeId]
        );
        res.json({ types });
    } catch (error) {
        console.error('Erreur types de frais:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des types de frais' });
    }
});

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
        available_endpoints: {
            auth: ['/api/login', '/api/token'],
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