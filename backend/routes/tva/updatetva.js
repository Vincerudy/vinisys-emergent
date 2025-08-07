const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.post('/tva/update', async (req, res) => {
  const tvas = req.body;

  if (!Array.isArray(tvas)) {
    return res.status(400).json({ message: 'Payload doit être un tableau' });
  }

  try {
    await db.query('START TRANSACTION');

    const tvaSecondaire = tvas.find(tva => tva.taxe_secondaire === 'OUI');
    
    if (tvaSecondaire) {
      const societeId = tvaSecondaire.societe_id || tvas[0]?.societe_id;
      if (societeId) {
        await db.query(
          `UPDATE tva SET taxe_secondaire = 'NON' WHERE societe_id = ?`,
          [societeId]
        );
      }
    }

    for (const tva of tvas) {
      const { id, libelle, taux, active, taxe_secondaire, ordre } = tva;
      if (!id) {
        throw new Error('Chaque TVA doit avoir un id');
      }
      
      await db.query(
        `UPDATE tva SET libelle = ?, taux = ?, active = ?, taxe_secondaire = ?, ordre = ? WHERE id = ?`,
        [libelle, taux, active, taxe_secondaire || 'NON', ordre, id]
      );
    }

    await db.query('COMMIT');

    res.json({ message: 'TVA mise à jour avec succès' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Erreur lors de la mise à jour TVA:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour TVA', error: error.message });
  }
});

module.exports = router;
