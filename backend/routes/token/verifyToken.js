const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router(); // Déclaration du router

router.get('/token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
   // route servant a tester le token.  
   

  if (!token) {
    return res.status(403).send({ message: 'Votre session a expiré' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).send({ message: 'Token valide', user: decoded });
  } catch (err) {
    console.error('Erreur JWT:', err);
    return res.status(401).send({ message: 'Votre session a expiré, vous devez vous reconnecter' });
  }
});

module.exports = router;
