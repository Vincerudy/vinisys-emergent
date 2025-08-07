const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const TOKEN_EXPIRATION = '3h';

const activeTokens = new Set();
activeTokens.clear();
console.log('Tous les tokens en mémoire ont été supprimés après le redémarrage.');

const validateInput = (email, password) => {
  if (!validator.isEmail(email)) {
    return 'Adresse mail ou mot de passe incorrect.';
  }
  if (!validator.isLength(password, { min: 6 })) {
    return 'Le mot de passe doit comporter au moins 6 caractères.';
  }
  return null;
};

router.post('/pilotage/login', async (req, res) => {
    const { email, password } = req.body;
 
  
    const validationError = validateInput(email, password);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
  
    try {
      // Récupérer l'utilisateur ET la clé société via jointure (adapté selon ta structure DB)
      const [rows] = await db.execute(`
        SELECT u.*, s.societe_cle 
        FROM users u
        JOIN societes s ON u.societe_id = s.id
        WHERE u.email = ?
      `, [email]);
  
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  
      const user = rows[0];
  
      // Vérification de la clé société
      if (user.societe_cle !== process.env.SECRET_KEY_MAINTENANCE_SOCI) {
        return res.status(403).json({ message: 'Accès refusé.' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  
      // Suite du code identique...
  
      // Récupérer les permissions
      const [permissionRows] = await db.execute('SELECT permission FROM user_permissions WHERE user_id = ?', [user.id]);
      const permissions = permissionRows.map(row => row.permission);
  
      // Photo profil
      const [rowsPhoto] = await db.execute(
        'SELECT path FROM upload_fichier WHERE fk = ? AND file_type = ?',
        [user.id, 'USER_PHOTO_PROFIL']
      );
      const urlPhoto = rowsPhoto.length > 0 ? rowsPhoto[0].path : null;
  
      // Création token JWT
      const tokenPayload = {  
        id: user.id, 
        societe_id: user.societe_id,
        email: user.email, 
        permissions
      };
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
  
      activeTokens.add(token);
  
      // Stocker dans session
      req.session.regenerate((err) => {
        if (err) {
          console.error('Erreur de régénération de session:', err);
          return res.status(500).json({ message: 'Erreur de session' });
        }
  
        req.session.user = {
          id: user.id,
          email: user.email,
          societe_id: user.societe_id,
          permissions,
          token,
        };
  
        req.session.save((err) => {
          if (err) {
            console.error('Erreur lors de la sauvegarde de session:', err);
            return res.status(500).json({ message: 'Erreur de session' });
          }
  
          res.json({
            token,
            id: user.id,
            email: user.email,
            nom: user.firstName,
            prenom: user.lastName,
            societe_id: user.societe_id,
            permissions,
            urlPhoto,
          });
        });
      });
    } catch (err) {
      console.error('Erreur base de données:', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  
  

module.exports = router;
