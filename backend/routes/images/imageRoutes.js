const express = require('express');
const path = require('path');
const router = express.Router();

// Route pour accéder aux images
router.get('/image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ message: 'Image non trouvée' });
        }
    });
});

module.exports = router;
