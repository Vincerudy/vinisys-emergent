const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const isAuthenticated = require('../midleware/authMiddleware');

// Mettre à jour un client
router.post('/updateClient', isAuthenticated, async (req, res) => {
    const societe_id = req.user.societe_id;
    const {id, name, email, address, city, postalCode, country, phone } = req.body; // Récupère uniquement les champs nécessaires
    //const { id } = req.params; // L'ID du client est récupéré depuis les paramètres de l'URL

    try {
        const result = await db.query(
            'UPDATE clients SET nom = ?, email = ?, adresse = ?, ville = ?, code_postal = ?, pays = ?, phone = ? WHERE id = ? and societe_id = ? ',
            [name, email, address, city, postalCode, country, phone, id, societe_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        res.json({ message: 'Client mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});


  module.exports = router;
  
 
 
 