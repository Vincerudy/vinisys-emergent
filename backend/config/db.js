const mysql = require('mysql2');

// Configuration locale pour les tests
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,  // Port MySQL standard
  user: 'root',
  password: '',
  database: 'mjupgupviniprod',
  multipleStatements: true, // 👉 autorise plusieurs requêtes
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
  

 
  