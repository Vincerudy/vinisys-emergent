const express = require('express');
require('dotenv').config();
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const morgan = require('morgan');
const db = require('./config/db');
const path = require('path');
const http = require('http');
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
  require('./routes/facture/cahierRecette'),
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
//  require('./routes/ticket/testSentTicket'),
];

routes.forEach((route) => app.use('/api', route));

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

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://0.0.0.0:${port}`);
});
