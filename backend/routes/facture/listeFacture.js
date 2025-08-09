const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /listeFacture/:id - Liste des factures d'une société
router.get('/listeFacture/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // 1. Récupérer l'ID de la société associée à l'utilisateur
        const [[societeRow]] = await db.query(
            'SELECT societe_id FROM users WHERE id = ?', [userId]
        );

        if (!societeRow) {
            return res.status(404).json({ message: 'Utilisateur non trouvé ou sans société associée' });
        }

        const societeId = societeRow.societe_id;

        // 2. Récupérer les factures et les infos liées (client, société, statut, etc.)
        const [factureRows] = await db.query(
            `SELECT
            fac.id AS factureId,
            fac.numero AS invoiceNumber,
            DATE_FORMAT(fac.date_facture, '%d/%m/%Y') AS date,
            fac.total AS totalAmount,
            fac.type_saisie,
            fac.type_fact AS type,
            fac.taxe_secondaire,
            fac.total_taxe_secondaire,
            soci.companyName AS vendeur_nom,
            soci.companyAddress AS vendeur_adresse,
            soci.code_postal AS vendeur_code_postal,
            soci.ville AS vendeur_ville,
            soci.email AS vendeur_email,
            soci.devise,
            soci.SIRET AS siret,
            soci.workPhone AS vendeur_phone,
            MAX(fich.path) AS logo_soci,
            clien.id AS client_id,
            clien.nom AS client,
            clien.email AS client_email,
            clien.adresse AS client_adresse,
            clien.ville AS client_ville,
            clien.code_postal AS client_code_postal,
            clien.phone AS client_phone,
            MAX(spf.paymentDelay) AS paymentDelay,
            (
                SELECT 
                    CASE 
                        WHEN COUNT(*) > 0 THEN 'payée'
                        WHEN fac.type_fact = 'DEVI' THEN fac.statut
                        WHEN DATEDIFF(CURDATE(), fac.date_facture) > (MAX(spf.paymentDelay) - 1) THEN 'En retard'
                        ELSE 'en attente'
                    END
                FROM Reglement_mode reg
                WHERE reg.numero_facture = fac.numero
                AND reg.Reste_A_Payer = 0
                AND reg.societe_id = fac.societe_id
            ) AS statut,
            CASE
                WHEN DATEDIFF(CURDATE(), fac.date_facture) > (MAX(spf.paymentDelay) - 1)
                THEN DATEDIFF(CURDATE(), fac.date_facture) - (MAX(spf.paymentDelay) - 1)
                ELSE 0
            END AS retard
        FROM factures fac
        JOIN societes soci ON soci.id = fac.societe_id
        JOIN clients clien ON clien.id = fac.client_id
        LEFT JOIN upload_fichier fich ON fich.societe_id = soci.id
        LEFT JOIN societe_parametrage_facturation spf ON spf.societe_id = soci.id
        WHERE fac.societe_id = ?
        GROUP BY fac.id
        ORDER BY fac.date_facture DESC;
        `,
            [societeId]
        );

        if (factureRows.length === 0) {
            return res.json([]);
        }

        const factureIds = factureRows.map(f => f.factureId);

        // 3. Récupérer tous les produits des factures
        const [produitRows] = await db.query(
            `SELECT facture_id, nom, prix_unitaire, quantite, taux_tva as tva
             FROM produits 
             WHERE facture_id IN (?)`,
            [factureIds]
        );

        // 4. Regrouper les produits par factureId
        const produitsParFacture = {};
        produitRows.forEach(prod => {
            if (!produitsParFacture[prod.facture_id]) {
                produitsParFacture[prod.facture_id] = [];
            }
            produitsParFacture[prod.facture_id].push({
                nom: prod.nom,
                prix: prod.prix_unitaire,
                prixUnitaireHT : prod.prixUnitaireHT,
                quantite: prod.quantite, 
                tva: prod.tva ?  prod.tva : ''
            });
        });

        // 5. Fusionner les factures et leurs produits
        const factures = factureRows.map(fac => ({
            id: fac.factureId,
            invoiceNumber: fac.invoiceNumber,
            date: fac.date,
            totalAmount: fac.totalAmount,
            type_saisie: fac.type_saisie,
            type: fac.type,
            statut: fac.statut,
            retard: fac.retard,
            logo_soci: fac.logo_soci,
            devise: fac.devise,
            siret: fac.siret,
            total_tps: fac.total_tps,
            taxe_secondaire: fac.taxe_secondaire,
            total_taxe_secondaire: fac.total_taxe_secondaire,
            vendeur_nom: fac.vendeur_nom,
            vendeur_adresse: fac.vendeur_adresse,
            vendeur_code_postal: fac.vendeur_code_postal,
            vendeur_ville: fac.vendeur_ville,
            vendeur_email: fac.vendeur_email,
            vendeur_phone: fac.vendeur_phone,
            client_id: fac.client_id,
            client: fac.client,
            client_email: fac.client_email,
            client_adresse: fac.client_adresse,
            client_ville: fac.client_ville,
            client_code_postal: fac.client_code_postal,
            client_phone: fac.client_phone,
            produits: produitsParFacture[fac.factureId] || []
        }));

        res.json(factures);
    } catch (error) {
        console.error('Erreur lors de la récupération des factures :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des factures' });
    }
});

module.exports = router;
