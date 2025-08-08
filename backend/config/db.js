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
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test de connexion au démarrage
pool.execute('SELECT 1')
  .then(() => {
    console.log('✅ Connexion MySQL réussie à mjupgupviniprod');
  })
  .catch((error) => {
    console.error('❌ Erreur connexion MySQL:', error);
  });

module.exports = pool.promise();
  

 
  