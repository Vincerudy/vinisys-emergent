const mysql = require('mysql2');

// CONFIGURATION TEMPORAIRE - Mock pour les tests
// Créer un pool de connexion factice qui simule MySQL
const pool = {
  promise: () => ({
    execute: async (query, params) => {
      console.log('Mock DB Query:', query, params);
      
      // Mock de la requête de connexion
      if (query.includes('SELECT u.*, s.companyName as societe_nom FROM users u LEFT JOIN societes s')) {
        const email = params[0];
        if (email === 'idnovation2014@gmail.com') {
          return [[{
            id: 1,
            nom: 'Admin',
            prenom: 'User',
            email: 'idnovation2014@gmail.com',
            password: '$2b$10$lzwNIeCMVVu.W0tXB7p2bOwoopadWKKsG5bCo9diXStnj.LzIbyXG', // hash de "123456"
            societe_id: 2,
            statut: 'actif',
            societe_nom: 'Vinisys Test',
            date_creation: new Date()
          }]];
        }
      }
      
      // Retourner un résultat vide par défaut
      return [[]];
    }
  })
};

module.exports = pool.promise();
  

 
  