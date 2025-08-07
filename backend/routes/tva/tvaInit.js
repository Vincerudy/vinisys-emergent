const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Adapté à ta config MySQL

 

// GET /init-tva/:societeId
router.get('/init-tva/:societeId', async (req, res) => {
  const societeId = req.params.societeId;

  // Objet TVA à insérer
const tvaDefaults = [
    { id: '1', libelle: 'TVA ', taux: 20.0, active: 'N', ordre: 1 },
    { id: '2', libelle: 'TVA ', taux: 10.0, active: 'N', ordre: 2 },
    { id: '3', libelle: 'TVA ', taux: 2.1, active: 'N', ordre: 3 },
    { id: '4', libelle: 'TVA ', taux: 5.5, active: 'N', ordre: 4 }
  ];

  try {
    // 1. Vérifie s'il y a déjà des lignes pour cette société
    const [existingRows] = await db.execute(
      'SELECT id FROM tva WHERE societe_id = ? LIMIT 1',
      [societeId]
    );

    if (existingRows.length > 0) {
      return res.status(200).json({ message: 'TVA déjà initialisée pour cette société.' });
    }

    // 2. Insère les valeurs par défaut
    const insertPromises = tvaDefaults.map((tva) =>
      db.execute(
        `INSERT INTO tva (libelle, taux, active, taxe_secondaire, ordre, societe_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [tva.libelle, tva.taux, tva.active, 'NON', tva.ordre, societeId]
      )
    );

    await Promise.all(insertPromises);

    res.status(201).json({ message: 'TVA initialisée avec succès.' });

  } catch (error) {
    console.error('Erreur lors de l’initialisation TVA:', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

module.exports = router;
