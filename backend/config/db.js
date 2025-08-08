const mysql = require('mysql2');

// CONFIGURATION TEMPORAIRE - Mock pour les tests
// Créer un pool de connexion factice qui simule MySQL
const pool = {
  promise: () => ({
    execute: async (query, params) => {
      console.log('Mock DB Query:', query, params);
      
      // Mock de la requête de connexion
      if (query.includes('SELECT * FROM utilisateurs WHERE email')) {
        const email = params[0];
        if (email === 'idnovation2014@gmail.com') {
          return [[{
            id: 1,
            nom: 'Admin',
            prenom: 'User',
            email: 'idnovation2014@gmail.com',
            mot_de_passe: '$2b$10$XCMHjHWYwYQBjktOYCJmYePzf8DwBhJG5QVhT.1jWQiJBGBxWYgqO', // hash de "123456"
            societe_id: 2,
            statut: 'actif',
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
  

 
  