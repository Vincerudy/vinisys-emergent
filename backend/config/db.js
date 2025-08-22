const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'vinisys',
  multipleStatements: true, // 👉 autorise plusieurs requêtes
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de connexion au démarrage
const testConnection = async () => {
  try {
    await pool.promise().execute('SELECT 1');
    console.log(`✅ Connexion MySQL réussie à ${process.env.MYSQL_DATABASE || 'vinisys'}`);
  } catch (error) {
    console.error('❌ Erreur connexion MySQL:', error);
  }
};

testConnection();

module.exports = pool.promise();