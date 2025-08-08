const mysql = require('mysql2');

// Configuration locale pour les tests
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,  // Port MySQL standard
  user: 'root',
  password: '',
  database: 'mjupgupviniprod',
  multipleStatements: true, // autorise plusieurs requêtes
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de connexion au démarrage
const testConnection = async () => {
  try {
    await pool.promise().execute('SELECT 1');
    console.log('✅ Connexion MySQL réussie à mjupgupviniprod');
  } catch (error) {
    console.error('❌ Erreur connexion MySQL:', error);
  }
};

testConnection();

module.exports = pool.promise();
  

 
  