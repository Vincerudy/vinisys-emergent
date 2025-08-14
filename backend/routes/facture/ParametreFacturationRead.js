const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour récupérer les paramètres de facturation
router.get('/parametrage-facturation/:id', async (req, res) => {
    const id = req.params.id;

    console.log("societe_id ", id)

    const [societeRows] = await db.query(
        'SELECT societe_id FROM users WHERE id = ?',
        [id]
    );

    if (societeRows.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé ou sans société associée' });
    }
  
      const societeId = societeRows[0].societe_id;

 

 

    try {
        const connection = await db.getConnection(); // Obtenir une connexion
        
        // Récupérer les paramètres de facturation pour la société et l'utilisateur connecté
        const [paramData] = await connection.query(
            `SELECT 
            enableQuotes,
            enableInvoices,
            vatRate,
            vatLabel,
            enableTTC,
            enableMultipleTVA,
            enableRecette, 
            enableAutoReminders,
            enableApprovalMention,
            stockDeductionTrigger,
            paymentDelay,
            salesConditions,
            showHeaderNotes,
            headerNotes,
            showSalesConditions,
            date_crea,
            date_mis_ajou
        FROM societe_parametrage_facturation 
        WHERE societe_id = ? 
        
        UNION 
        
        SELECT 
            0 AS enableQuotes,
            0 AS enableInvoices,
            20 AS vatRate,
            'TVA' AS vatLabel,
            0 AS enableTTC,
            1 as enableMultipleTVA,
            0 as enableRecette,
            0 AS enableAutoReminders,
            0 AS enableApprovalMention,
            'quote_accepted' as stockDeductionTrigger,
            1 AS paymentDelay,
            '' AS salesConditions,
            0 AS showHeaderNotes,
            '' AS headerNotes,
            0 AS showSalesConditions,
            NOW() AS date_crea,
            NOW() AS date_mis_ajou
        FROM DUAL
        LIMIT 1;
        `,
            [societeId]
        );
        
        connection.release(); // Libérer la connexion

        if (paramData.length > 0) {
            return res.status(200).json({ message: 'Paramètres récupérés avec succès.', data: paramData[0] });
        } else {
            return res.status(404).json({ message: 'Aucun paramètre de facturation trouvé.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des paramètres de facturation:', error.message);
        res.status(500).json({ message: 'Erreur interne du serveur.', error: error.message });
    }
});

module.exports = router;
