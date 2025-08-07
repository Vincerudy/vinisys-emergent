const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

// Créer un client
router.post('/insertClient', isAuthenticated, async (req, res) => {
  const societe_id = req.user.societe_id;
  const { phone, name, email, address, city, postalCode, country } = req.body;

  try {
    // Vérifier si le client existe déjà pour cette société (via email)
    const [existingClient] = await db.query(
      'SELECT * FROM clients WHERE email = ? AND societe_id = ?',
      [email, societe_id]
    );

    if (existingClient.length > 0) {
      return res.status(400).json({ message: 'Ce client existe déjà dans votre liste client.' });
    }

    // Insertion du client
    await db.query(
      'INSERT INTO clients (phone, nom, email, adresse, ville, code_postal, pays, societe_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [phone, name, email, address, city, postalCode, country, societe_id]
    );

    res.status(201).json({ message: 'Client créé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création du client :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

module.exports = router;
