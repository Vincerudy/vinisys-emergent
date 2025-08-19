const express = require('express');
const path = require('path');
const router = express.Router();

// Route pour accéder aux images
router.get('/image/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // D'abord essayer dans notes-frais (pour les justificatifs)
    const justificatifPath = path.join(__dirname, '../../uploads/notes-frais', filename);
    
    res.sendFile(justificatifPath, (err) => {
        if (err) {
            // Si pas trouvé dans notes-frais, essayer dans uploads racine (compatibilité)
            const oldPath = path.join(__dirname, '../../uploads', filename);
            res.sendFile(oldPath, (err2) => {
                if (err2) {
                    res.status(404).json({ message: 'Image non trouvée' });
                }
            });
        }
    });
});

module.exports = router;
