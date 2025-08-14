const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');
const http = require('http');
const socketIo = require('socket.io');
const router = express.Router();

// Configuration de multer pour gérer l'upload d'audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const audioDir = 'uploads/audio';
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    cb(null, audioDir); // Dossier où l'audio sera stocké
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// Créez un serveur HTTP distinct pour Socket.IO
const server = http.createServer(router);
const io = socketIo(server, {
  cors: {
    origin: '*',  // Permet d'accepter les connexions de n'importe quelle origine
    methods: ['GET', 'POST'],
  },
});

// Écoutez les connexions de Socket.IO
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté avec l\'ID : ' + socket.id);
  // Exemple d'émission de message au client
 

 
  socket.on('sendMessage', (data) => {
    console.log('Message reçu : ', data);
    io.emit('message', data);
  });

  // Lorsque la connexion est fermée
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté : ' + socket.id);
  });
});
 


// Route pour enregistrer un message
router.post('/messagesendmess', upload.single('audio'), (req, res) => {
  const { match_id, user_id, content, language, timestamp } = req.body;
 
  if (!match_id || !user_id || !timestamp) {
    return res.status(400).json({ success: false, message: 'Données manquantes' });
  }

  let audioPath = null;
  if (req.file) {
    audioPath = path.join('uploads/audio', req.file.filename);
  }

  const query = `
    INSERT INTO messages (match_id, user_id, content, audio_path as audio, language, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [match_id, user_id, content, audioPath, language, timestamp];

    // Diffuse le message à tous les clients 
    

    const newMessage = {
        match_id,
        user_id,
        content,
        audio_path: audioPath,
        language,
        timestamp,
      };

      io.emit('newMessage', newMessage);

    db.execute(query, values, (err, result) => {
        if (err) {
          console.error('Erreur lors de l’insertion du message dans la base de données:', err);
          return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }

        res.status(200).json({ success: true, message: 'Message sauvegardé avec succès' });

        // Diffuser le message à tous les clients connectés via WebSocket

    });
 
});

 


 
router.get('/affichageMessage/:match_id', async (req, res) => {
  const match_id = req.params.match_id;

  try {
    const [messages] = await db.execute( 
      `
      SELECT id, match_id, user_id, content, audio_path as audio, language, timestamp
      FROM conversation 
      WHERE match_id = ? 
      ORDER BY timestamp ASC
      `,
      [match_id]
    );

    res.json(messages);

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// Définir le port pour Socket.IO
const PORT = 3611;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO démarré sur le port ${PORT}`);
});

module.exports = router;
