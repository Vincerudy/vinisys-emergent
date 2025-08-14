const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Route pour récupérer et mettre à jour les paramètres de facturation.
router.post('/parametragecreation', async (req, res) => {
    const { 
        enableQuotes, 
        enableInvoices, 
        vatRate, 
        vatLabel, 
        enableTTC,
        enableRecette,
        enableApprovalMention,
        enableMultipleTVA,
        paymentDelay, 
        salesConditions, 
        stockDeductionTrigger,
        showHeaderNotes, 
        enableAutoReminders,
        headerNotes, 
        showSalesConditions,
        societe_id, 
        id,
    } = req.body;

    console.log('Données reçues :', req.body);

    // Validation des données
    if (
        enableMultipleTVA === undefined ||
        enableQuotes === undefined ||
        enableInvoices === undefined ||
        vatRate === undefined ||
        vatLabel === undefined ||
        paymentDelay === undefined ||
        salesConditions === undefined ||
        showHeaderNotes === undefined ||
        headerNotes === undefined ||
        showSalesConditions === undefined
    ) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const connection = await db.getConnection(); // Obtenir une connexion


    try {
        // Commencer une transaction
        await connection.beginTransaction();

        // Vérifier si le paramétrage existe déjà pour cette société et utilisateur
        const [existingParam] = await connection.query(
            `SELECT  * FROM societe_parametrage_facturation WHERE societe_id = ?`,
            [societe_id]
        );

        if (existingParam.length > 0) {
            // Mise à jour des paramètres existants
            const [updateResult] = await connection.query(
                `UPDATE societe_parametrage_facturation 
                 SET enableQuotes = ?, enableInvoices = ?, vatRate = ?, vatLabel = ?, enableTTC = ?, enableMultipleTVA = ?, enableRecette = ?, enableApprovalMention = ?,
                     paymentDelay = ?, salesConditions = ?, showHeaderNotes = ?, enableAutoReminders = ?, headerNotes = ?, 
                     showSalesConditions = ?, stockDeductionTrigger = ?, date_mis_ajou = CURRENT_TIMESTAMP 
                 WHERE societe_id = ?`,
                [enableQuotes, enableInvoices, vatRate, vatLabel, enableTTC, enableMultipleTVA,  enableRecette, enableApprovalMention, paymentDelay, salesConditions, 
                 showHeaderNotes, enableAutoReminders, headerNotes, showSalesConditions, stockDeductionTrigger, societe_id]
            );

            if (updateResult.affectedRows > 0) {
                await connection.commit();
                console.log("Mise à jour réussie");

                // Vérification des données après mise à jour
                const [updatedData] = await connection.query(
                    `SELECT * FROM societe_parametrage_facturation WHERE societe_id = ? AND user_id = ?`,
                    [societe_id, id]
                );

                return res.status(200).json({ message: 'Paramètres mis à jour avec succès.', data: updatedData });
            } else {
                await connection.rollback();
                return res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres.' });
            }
        } else {
            // Insertion des nouveaux paramètres
            const [insertResult] = await connection.query(
                `INSERT INTO societe_parametrage_facturation 
                  (
                    societe_id, 
                    user_id, 
                    enableQuotes, 
                    enableInvoices, 
                    vatRate, 
                    vatLabel, 
                    enableTTC, 
                    enableMultipleTVA,
                    stockDeductionTrigger,
                    enableRecette,
                    enableApprovalMention, 
                    paymentDelay, 
                    salesConditions, 
                    showHeaderNotes, 
                    enableAutoReminders, 
                    headerNotes, 
                    showSalesConditions,
                    date_crea, 
                    date_mis_ajou
                  )
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                  societe_id, 
                  id, 
                  enableQuotes, 
                  enableInvoices, 
                  vatRate, 
                  vatLabel, 
                  enableTTC, 
                  enableMultipleTVA,
                  stockDeductionTrigger,
                  enableRecette,
                  enableApprovalMention,
                  paymentDelay, 
                  salesConditions, 
                  showHeaderNotes, 
                  enableAutoReminders, 
                  headerNotes, 
                  showSalesConditions
                ]
              );
              

            if (insertResult.insertId) {
                await connection.commit();
                console.log("Insertion réussie");

                // Vérification des données après insertion
                const [newData] = await connection.query(
                    `SELECT * FROM societe_parametrage_facturation WHERE societe_id = ? AND user_id = ?`,
                    [societe_id, id]
                );

                return res.status(201).json({ message: 'Paramètres de facturation créés avec succès.', data: newData });
            } else {
                await connection.rollback();
                return res.status(500).json({ message: 'Erreur lors de la création des paramètres.' });
            }
        }

    } catch (error) {
        // Si une erreur survient, annuler la transaction
        await connection.rollback();
        console.error('Erreur lors de la mise à jour des paramètres de facturation:', error.sqlMessage || error.message);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres de facturation', error: error.message });
    } finally {
        // Toujours libérer la connexion 
        connection.release();
    }
});

module.exports = router;
