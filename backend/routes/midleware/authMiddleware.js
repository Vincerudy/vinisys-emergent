const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const isAuthenticated = (req, res, next) => {
  // ✅ Priorité à la session (utilisateur web)
  if (req.session && req.session.user) {
    req.user = req.session.user; // on rend les données disponibles de façon uniforme
    return next();
  }

  // ✅ Ensuite : vérifier le JWT (client API, mobile, etc.)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log(' cookies: ', authHeader && authHeader.split(' ')[1])

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé : aucun token ou session valide' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};

module.exports = isAuthenticated;



//export const authMiddleware = (req, res, next) => {
//  try {
//    const token = req.headers.authorization.split(' ')[1]; // Récupérer le token de l'en-tête Authorization
//    const decodedToken = jwt.verify(token, 'votre_secret_key_secrete'); // Vérifier le token avec la clé secrète
//
//    req.userData = { userId: decodedToken.userId }; // Ajouter les données de l'utilisateur à la requête
//    next(); // Passer au middleware suivant
//  } catch (error) {
//    return res.status(401).json({ error: 'Vous devez vous connecter pour pouvoir publier.' });
//  }
//};
//