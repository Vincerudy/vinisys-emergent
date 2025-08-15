const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  port: 8889,  // Port MySQL de MAMP
  user: 'root',
  password: 'root',
  database: 'vinidb',
  multipleStatements: true, // 👉 autorise plusieurs requêtes
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de connexion au démarrage
const testConnection = async () => {
  try {
    await pool.promise().execute('SELECT 1');
    console.log(`✅ Connexion MySQL réussie à ${process.env.MYSQL_DATABASE || 'mjupgupviniprod'}`);
  } catch (error) {
    console.error('❌ Erreur connexion MySQL:', error);
  }
};

testConnection();

module.exports = pool.promise();