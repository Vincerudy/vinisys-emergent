const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour récupérer les modes de règlement d'une facture
router.get('/lectureModeReglement/:id_facture', async (req, res) => {
    const id_facture = req.params.id_facture;

    console.log("Facture ID :", id_facture);

    const [societeRows] = await db.query(
        'SELECT societe_id, numero FROM factures WHERE id = ?',
        [id_facture]
    );

    if (societeRows.length === 0) {
        return res.status(404).json({ message: 'Facture non trouvée ou sans société associée' });
    }
  
    const societeId = societeRows[0].societe_id;
    const numeroFacture = societeRows[0].numero;

    try {
        const connection = await db.getConnection(); // Obtenir une connexion
        
        // Récupérer les modes de règlement pour cette facture
        const [paramData] = await connection.query(
            `SELECT 
                regl.numero_facture,
                regl.mode_reglement as mode,
                regl.Montant_total,
                regl.Total_Paye as montant,
                regl.Reste_A_Payer,
                regl.montant_paye,
                regl.dat,
                CASE 
                    WHEN regl.id = (SELECT MAX(id) FROM Reglement_mode WHERE numero_facture = regl.numero_facture) 
                    THEN 1 ELSE 0 
                END AS is_last_payment
            FROM Reglement_mode regl
            WHERE regl.numero_facture = ? 
                AND regl.societe_id = ? 
            ORDER BY is_last_payment DESC, regl.id DESC
        `,
            [numeroFacture, societeId]
        );
        
        connection.release(); // Libérer la connexion

        if (paramData.length > 0) {
            return res.status(200).json({ message: 'Paramètres récupérés avec succès.', data: paramData });
        } else {
            return res.status(404).json({ message: 'Aucun paiement trouvé pour cette facture.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des modes de règlement:', error.message);
        res.status(500).json({ message: 'Erreur interne du serveur.', error: error.message });
    }
});

module.exports = router;
