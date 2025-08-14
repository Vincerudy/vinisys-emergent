const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const validator = require('validator');
const db = require('../config/db');

// Constantes de configuration
const SALT_ROUNDS = 10;

// Fonction de validation des entrées
const validateInput = (email, password) => {
  if (!validator.isEmail(email)) {
    return 'Adresse mail ou mot de passe incorrect.';
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.';
  }
  return null;
};

router.post('/signup/:pack', async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    birthDate,
    companyName,
    companyAddress,
    workPhone,
    personalPhone
  } = req.body;

  const { pack } = req.params;
  const packLower = pack.toLowerCase(); // pour simplifier la comparaison

  // Validation des données d'entrée
  const validationError = validateInput(email, password);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cette adresse.' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insertion de la société
    const [societeResult] = await db.execute(
      `INSERT INTO societes 
        (companyName, companyAddress, workPhone, facturation, comptabilite, administrative, personnel, email) 
       VALUES (?, ?, ?, 'N', 'N', 'N', 'N', ?)`,
      [companyName, companyAddress, workPhone, email]
    );

    const societeId = societeResult.insertId;

    // Insertion de l'utilisateur lié à la société
    const [userResult] = await db.execute(
      `INSERT INTO users 
        (email, password, firstName, lastName, birthDate, personalPhone, societe_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, birthDate, personalPhone, societeId]
    );

    const userId = userResult.insertId;

    // Attribution des permissions
    await db.execute(
      `INSERT INTO user_permissions (user_id, permission, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [userId, 'user_admin_full_acces_control']
    );

    // Définir les options selon le pack
    let options = {
      enable_facturation: 0,
      enable_recette: 0,
      enable_mailing: 0,
      enable_relances_auto: 0,
      enable_stock: 0,
      enable_import_produits_services: 0,
      enable_mouvements_stock: 0,
      enable_inventaire_manuel: 0,
      enable_inventaire_auto: 0,
      enable_user_input: 0,
      enable_user_limit: 0,
      user_limit: 0
    };

    if (packLower === 'starter') {
      options.enable_facturation = 1;
    } else if (packLower === 'sylver') {
      options.enable_facturation = 1;
      options.enable_recette = 1;
      options.enable_mailing = 1;
      options.enable_relances_auto = 1;
      options.user_limit = 5;
    } else if (packLower === 'gold') {
      Object.keys(options).forEach(key => {
        if (key !== 'user_limit') options[key] = 1;
      });
      options.user_limit = 1000;
    }

    // Insertion dans la table options_societe
    await db.execute(
      `INSERT INTO options_societe (
        societe_id,
        enable_facturation,
        enable_recette,
        enable_mailing,
        enable_relances_auto,
        enable_stock,
        enable_import_produits_services,
        enable_mouvements_stock,
        enable_inventaire_manuel,
        enable_inventaire_auto,
        enable_user_input,
        enable_user_limit,
        user_limit,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        societeId,
        options.enable_facturation,
        options.enable_recette,
        options.enable_mailing,
        options.enable_relances_auto,
        options.enable_stock,
        options.enable_import_produits_services,
        options.enable_mouvements_stock,
        options.enable_inventaire_manuel,
        options.enable_inventaire_auto,
        options.enable_user_input,
        options.enable_user_limit,
        options.user_limit
      ]
    );

    return res.status(201).json({
      message: 'Félicitations, votre inscription est terminée. Vous pouvez à présent vous connecter et configurer votre société.'
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({
      message: "Une erreur est survenue pendant l'inscription, veuillez réessayer ultérieurement."
    });
  }
});

module.exports = router;
