const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const validator = require('validator');
const db = require('../../config/db');

const SALT_ROUNDS = 10;

// Validation simple pour email, password, role (tu peux étendre)
const validateInput = (email, password, role) => {
  if (!validator.isEmail(email)) {
    return 'Adresse mail invalide.';
  }
  if (!validator.isLength(password, { min: 6 })) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  if (!role || !['Admin', 'User', 'Editor'].includes(role)) {
    return 'Rôle invalide.';
  }
  return null;
};

router.post('/utilisateur', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Valider les données
  const validationError = validateInput(email, password, role);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const connection = await db.getConnection(); // suppose que db est un pool et getConnection() existe
  try {
    await connection.beginTransaction();

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const societe_id = 2;

    // Créer l'utilisateur
    const [result] = await connection.execute(
      'INSERT INTO users (firstName, lastName, email, password, role, societe_id) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, role, societe_id]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      user: {
        id: result.insertId,
        firstName,
        lastName,
        email,
        role,
      },
    });

  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Erreur création utilisateur:', err);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
