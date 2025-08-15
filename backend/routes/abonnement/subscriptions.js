const express = require('express');
const db = require('../../config/db');
const router = express.Router();
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here');

// Plans d'abonnement avec leurs fonctionnalités
const SUBSCRIPTION_PLANS = {
  starter: {
    name: "Starter",
    description: "Plan gratuit pour débuter",
    price_monthly: 0,
    price_quarterly: 0,
    price_yearly: 0,
    functionalities: [
      "Gestion des factures (devis, factures, clients)",
      "Paramétrage société",
      "Gestion utilisateurs (max 2 utilisateurs)"
    ],
    features: {
      enable_facturation: 1,
      enable_notes_frais: 0,
      enable_depenses: 0,
      enable_rapport_financier: 0,
      enable_recette: 0,
      enable_mailing: 0,
      enable_relances_auto: 0,
      enable_stock: 0,
      enable_import_produits_services: 0,
      enable_mouvements_stock: 0,
      enable_inventaire_manuel: 0,
      enable_inventaire_auto: 0,
      enable_user_input: 1,
      enable_user_limit: 1,
      user_limit: 2
    }
  },
  pro: {
    name: "Pro",
    description: "Pour les petites entreprises",
    price_monthly: 29,
    price_quarterly: 79,
    price_yearly: 299,
    functionalities: [
      "Toutes les fonctionnalités Starter",
      "Gestion des notes de frais",
      "Gestion des dépenses et achats",
      "Rapports financiers",
      "Cahier de recettes",
      "Mailing et relances automatiques",
      "Gestion de stock de base",
      "Jusqu'à 5 utilisateurs"
    ],
    features: {
      enable_facturation: 1,
      enable_notes_frais: 1,
      enable_depenses: 1,
      enable_rapport_financier: 1,
      enable_recette: 1,
      enable_mailing: 1,
      enable_relances_auto: 1,
      enable_stock: 1,
      enable_import_produits_services: 0,
      enable_mouvements_stock: 1,
      enable_inventaire_manuel: 1,
      enable_inventaire_auto: 0,
      enable_user_input: 1,
      enable_user_limit: 1,
      user_limit: 5
    }
  },
  ultra: {
    name: "Ultra",
    description: "Pour les moyennes entreprises",
    price_monthly: 59,
    price_quarterly: 159,
    price_yearly: 599,
    functionalities: [
      "Toutes les fonctionnalités Pro",
      "Import/Export produits et services",
      "Gestion complète des stocks",
      "Inventaires automatiques",
      "Mouvements de stock avancés",
      "Jusqu'à 15 utilisateurs"
    ],
    features: {
      enable_facturation: 1,
      enable_notes_frais: 1,
      enable_depenses: 1,
      enable_rapport_financier: 1,
      enable_recette: 1,
      enable_mailing: 1,
      enable_relances_auto: 1,
      enable_stock: 1,
      enable_import_produits_services: 1,
      enable_mouvements_stock: 1,
      enable_inventaire_manuel: 1,
      enable_inventaire_auto: 1,
      enable_user_input: 1,
      enable_user_limit: 1,
      user_limit: 15
    }
  },
  mega: {
    name: "Mega",
    description: "Pour les grandes entreprises",
    price_monthly: 99,
    price_quarterly: 269,
    price_yearly: 999,
    functionalities: [
      "Toutes les fonctionnalités Ultra",
      "Support prioritaire",
      "Personnalisations avancées",
      "Intégrations API",
      "Utilisateurs illimités"
    ],
    features: {
      enable_facturation: 1,
      enable_notes_frais: 1,
      enable_depenses: 1,
      enable_rapport_financier: 1,
      enable_recette: 1,
      enable_mailing: 1,
      enable_relances_auto: 1,
      enable_stock: 1,
      enable_import_produits_services: 1,
      enable_mouvements_stock: 1,
      enable_inventaire_manuel: 1,
      enable_inventaire_auto: 1,
      enable_user_input: 1,
      enable_user_limit: 1,
      user_limit: 50
    }
  }
};

// GET /plans - Récupérer tous les plans d'abonnement
router.get('/plans', async (req, res) => {
  try {
    console.log('📋 Récupération des plans d\'abonnement');
    
    res.json({
      success: true,
      data: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des plans:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plans',
      error: error.message
    });
  }
});

// POST /create-payment-intent - Créer une intention de paiement Stripe
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { planType, billingPeriod, societe_id } = req.body;

    console.log(`💳 Création d'une intention de paiement pour ${planType} - ${billingPeriod}`);

    if (!SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({
        success: false,
        message: 'Plan d\'abonnement invalide'
      });
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    let amount = 0;

    switch (billingPeriod) {
      case 'monthly':
        amount = plan.price_monthly * 100; // Stripe utilise les centimes
        break;
      case 'quarterly':
        amount = plan.price_quarterly * 100;
        break;
      case 'yearly':
        amount = plan.price_yearly * 100;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Période de facturation invalide'
        });
    }

    // Plan gratuit - pas besoin de paiement
    if (amount === 0) {
      return res.json({
        success: true,
        free_plan: true,
        plan: planType,
        billingPeriod: billingPeriod
      });
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      payment_method_types: ['card'], // Spécifier les méthodes de paiement acceptées
      metadata: {
        societe_id: societe_id,
        plan_type: planType,
        billing_period: billingPeriod
      }
    });

    res.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      amount: amount,
      plan: planType,
      billingPeriod: billingPeriod
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'intention de paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      error: error.message
    });
  }
});

// POST /activate-subscription - Activer l'abonnement après paiement ou pour plan gratuit
router.post('/activate-subscription', async (req, res) => {
  try {
    const { societe_id, planType, billingPeriod, payment_intent_id } = req.body;

    console.log(`🎯 Activation de l'abonnement ${planType} pour la société ${societe_id}`);

    if (!SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({
        success: false,
        message: 'Plan d\'abonnement invalide'
      });
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    const features = plan.features;

    // Calculer la date d'expiration selon la période de facturation
    let expiresAt = null;
    if (planType !== 'starter') { // Le plan gratuit n'expire pas
      const now = new Date();
      switch (billingPeriod) {
        case 'monthly':
          expiresAt = new Date(now.setMonth(now.getMonth() + 1));
          break;
        case 'quarterly':
          expiresAt = new Date(now.setMonth(now.getMonth() + 3));
          break;
        case 'yearly':
          expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
          break;
        default:
          expiresAt = new Date(now.setMonth(now.getMonth() + 1));
      }
    }

    // Vérifier si la société existe dans options_societe
    const [existing] = await db.query(
      'SELECT id FROM options_societe WHERE societe_id = ?',
      [societe_id]
    );

    if (existing.length > 0) {
      // Mise à jour de l'abonnement existant
      const updateQuery = `
        UPDATE options_societe SET 
          enable_facturation = ?,
          enable_notes_frais = ?,
          enable_depenses = ?,
          enable_rapport_financier = ?,
          enable_recette = ?,
          enable_mailing = ?,
          enable_relances_auto = ?,
          enable_stock = ?,
          enable_import_produits_services = ?,
          enable_mouvements_stock = ?,
          enable_inventaire_manuel = ?,
          enable_inventaire_auto = ?,
          enable_user_input = ?,
          enable_user_limit = ?,
          user_limit = ?,
          plan_type = ?,
          billing_period = ?,
          plan_expires_at = ?,
          updated_at = NOW()
        WHERE societe_id = ?
      `;

      await db.query(updateQuery, [
        features.enable_facturation,
        features.enable_notes_frais,
        features.enable_depenses,
        features.enable_rapport_financier,
        features.enable_recette,
        features.enable_mailing,
        features.enable_relances_auto,
        features.enable_stock,
        features.enable_import_produits_services,
        features.enable_mouvements_stock,
        features.enable_inventaire_manuel,
        features.enable_inventaire_auto,
        features.enable_user_input,
        features.enable_user_limit,
        features.user_limit,
        planType,
        billingPeriod || 'monthly',
        expiresAt,
        societe_id
      ]);

      console.log(`✅ Abonnement mis à jour pour la société ${societe_id}`);
    } else {
      // Création d'un nouvel enregistrement
      const insertQuery = `
        INSERT INTO options_societe (
          societe_id, enable_facturation, enable_notes_frais, enable_depenses, enable_rapport_financier,
          enable_recette, enable_mailing, enable_relances_auto, enable_stock, enable_import_produits_services,
          enable_mouvements_stock, enable_inventaire_manuel, enable_inventaire_auto,
          enable_user_input, enable_user_limit, user_limit, plan_type, billing_period, plan_expires_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      await db.query(insertQuery, [
        societe_id,
        features.enable_facturation,
        features.enable_notes_frais,
        features.enable_depenses,
        features.enable_rapport_financier,
        features.enable_recette,
        features.enable_mailing,
        features.enable_relances_auto,
        features.enable_stock,
        features.enable_import_produits_services,
        features.enable_mouvements_stock,
        features.enable_inventaire_manuel,
        features.enable_inventaire_auto,
        features.enable_user_input,
        features.enable_user_limit,
        features.user_limit,
        planType,
        billingPeriod || 'monthly',
        expiresAt
      ]);

      console.log(`✅ Nouvel abonnement créé pour la société ${societe_id}`);
    }

    res.json({
      success: true,
      message: `Abonnement ${plan.name} activé avec succès`,
      plan: planType,
      features: features
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'activation de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation de l\'abonnement',
      error: error.message
    });
  }
});

// GET /subscription-status/:societe_id - Vérifier le statut d'abonnement d'une société
router.get('/subscription-status/:societe_id', async (req, res) => {
  try {
    const { societe_id } = req.params;

    console.log(`📊 Vérification du statut d'abonnement pour la société ${societe_id}`);

    const [rows] = await db.query(
      'SELECT * FROM options_societe WHERE societe_id = ?',
      [societe_id]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        subscription_expired: true,
        trial_expired: true,
        message: 'Aucun abonnement trouvé'
      });
    }

    const subscription = rows[0];
    const now = new Date();
    let subscriptionExpired = false;
    let trialExpired = false;

    // Vérifier l'expiration selon le type de plan
    if (subscription.plan_type === 'starter') {
      // Plan gratuit - pas d'expiration, toujours actif
      trialExpired = false;
    } else {
      // Plans payants - vérifier la date d'expiration
      if (subscription.plan_expires_at) {
        const expiresAt = new Date(subscription.plan_expires_at);
        subscriptionExpired = now > expiresAt;
        
        // Si l'abonnement payant est expiré, on bloque tout
        if (subscriptionExpired) {
          trialExpired = true;
        }
      }
    }

    res.json({
      success: true,
      subscription: subscription,
      subscription_expired: subscriptionExpired,
      trial_expired: trialExpired,
      plan_expires_at: subscription.plan_expires_at,
      message: subscriptionExpired ? 'Abonnement expiré' : trialExpired ? 'Période d\'essai expirée' : 'Abonnement actif'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
      error: error.message
    });
  }
});

module.exports = router;