const mongoose = require('mongoose');

// Configuration MongoDB avec options recommandées
const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/vinisys';
    
    await mongoose.connect(mongoUrl, {
      // Options recommandées pour mongoose
    });
    
    console.log(`✅ Connexion MongoDB réussie à ${mongoUrl}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('📡 MongoDB connecté');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB déconnecté');
});

// Connexion au démarrage
connectDB();

module.exports = mongoose;