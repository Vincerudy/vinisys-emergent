const mysql = require('mysql2');

//const pool = mysql.createPool({
//  host: 'localhost',
//  port: 3306,  // Port MySQL standard
//  user: 'root',
//  password: '',
//  database: 'vinisys',
//  multipleStatements: true, // 👉 autorise plusieurs requêtes
//  waitForConnections: true,
//  connectionLimit: 10,
//  queueLimit: 0
//});

//module.exports = pool.promise(); // 👈 n'oublie de renvoyer une version promise

 

const pool = mysql.createPool({
  host: 'mjupgupviniprod.mysql.db',
  port: 3306,   
  user: 'mjupgupviniprod',
  password: 'viniCinema12selfie2025',
  database: 'mjupgupviniprod',  
  multipleStatements: true, // 👉 autorise plusieurs requêtes  
  waitForConnections: true,  
  connectionLimit: 10,  
  queueLimit: 0
});

module.exports = pool.promise();
  

 
  