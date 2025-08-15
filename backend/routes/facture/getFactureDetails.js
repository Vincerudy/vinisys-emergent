const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Endpoint pour récupérer les détails complets d'une facture
router.get('/facture-details/:facture_id/:societe_id', async (req, res) => {
    const { facture_id, societe_id } = req.params;
    
    console.log(`📋 Récupération des détails pour facture ID: ${facture_id}, société: ${societe_id}`);

    try {
        const connection = await db.getConnection();

        // Récupérer les informations de la facture
        const [factureResults] = await connection.execute(`
            SELECT 
                f.*,
                c.nom as client_nom,
                c.email as client_email,
                c.telephone as client_telephone,
                c.adresse as client_adresse,
                c.ville as client_ville,
                c.code_postal as client_code_postal
            FROM factures f
            LEFT JOIN clients c ON f.client_id = c.id
            WHERE f.id = ? AND f.societe_id = ?
        `, [facture_id, societe_id]);

        if (factureResults.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Facture non trouvée'
            });
        }

        const facture = factureResults[0];

        // Récupérer les produits/services de la facture
        const [produitsResults] = await connection.execute(`
            SELECT 
                p.*,
                ps.nom as produit_nom,
                ps.description as produit_description,
                ps.prix as produit_prix_original
            FROM produits p
            LEFT JOIN produits_services ps ON p.id_prod_serv = ps.id
            WHERE p.facture_id = ?
            ORDER BY p.id
        `, [facture_id]);

        connection.release();

        // Formatter les données pour le composant ModeleFacture
        const factureFormatted = {
            id: facture.id,
            numero: facture.numero,
            type: facture.type_fact,
            type_saisie: facture.type_saisie,
            date_facture: facture.date_facture,
            total: facture.total,
            ht: facture.ht,
            total_tva: facture.total_tva,
            taxe_secondaire: facture.taxe_secondaire,
            total_taxe_secondaire: facture.total_taxe_secondaire,
            statut: facture.statut,
            client: {
                nom: facture.client_nom,
                email: facture.client_email,
                telephone: facture.client_telephone,
                adresse: facture.client_adresse,
                ville: facture.client_ville,
                code_postal: facture.client_code_postal
            },
            produits: produitsResults.map(produit => ({
                id: produit.id,
                nom: produit.nom || produit.produit_nom,
                description: produit.produit_description,
                quantite: produit.quantite,
                prix: produit.prix_unitaire,
                tva: produit.taux_tva,
                total_tva: produit.total_tva,
                id_prod_serv: produit.id_prod_serv
            }))
        };

        console.log(`✅ Détails récupérés pour facture ${facture.numero} avec ${produitsResults.length} produits`);

        res.json({
            success: true,
            data: factureFormatted
        });

    } catch (error) {
        console.error('❌ Erreur lors de la récupération des détails de facture:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des détails de facture'
        });
    }
});

module.exports = router;