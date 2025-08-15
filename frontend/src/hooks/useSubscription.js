import { useState, useEffect } from 'react';
import api from '../contexte/Api'; // Utiliser l'instance axios configurée
import { useAuth } from '../contexte/AuthContext';

export const useSubscription = () => {
  const { societe_id, isAuthenticated } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Récupérer les données d'abonnement
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!societe_id || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/subscription-status/${societe_id}`);
        
        if (response.data.success) {
          setSubscriptionData(response.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données d\'abonnement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [societe_id, isAuthenticated]);

  // Vérifier si une fonctionnalité est accessible
  const hasFeature = (featureName) => {
    console.log(`🔍 useSubscription: Checking feature '${featureName}'`);
    
    if (!subscriptionData || !subscriptionData.subscription) {
      console.log('❌ useSubscription: No subscription data available');
      return false; // Si pas de données, bloquer par défaut
    }

    const { subscription } = subscriptionData;
    console.log(`📊 useSubscription: Subscription data:`, {
      enable_facturation: subscription.enable_facturation,
      enable_notes_frais: subscription.enable_notes_frais,
      enable_depenses: subscription.enable_depenses,
      enable_rapport_financier: subscription.enable_rapport_financier
    });

    switch (featureName) {
      case 'facturation':
        return subscription.enable_facturation === 1;
      case 'notes_frais':
        return subscription.enable_notes_frais === 1;
      case 'depenses':
        return subscription.enable_depenses === 1;
      case 'rapport_financier':
        return subscription.enable_rapport_financier === 1;
      case 'recette':
        return subscription.enable_recette === 1;
      case 'mailing':
        return subscription.enable_mailing === 1;
      case 'relances_auto':
        return subscription.enable_relances_auto === 1;
      case 'stock':
        return subscription.enable_stock === 1;
      case 'import_produits':
        return subscription.enable_import_produits_services === 1;
      case 'mouvements_stock':
        return subscription.enable_mouvements_stock === 1;
      case 'inventaire_manuel':
        return subscription.enable_inventaire_manuel === 1;
      case 'inventaire_auto':
        return subscription.enable_inventaire_auto === 1;
      case 'user_input':
        return subscription.enable_user_input === 1;
      case 'campany_setting':
        return subscription.enable_user_input === 1;
      case 'view_users':
        return subscription.enable_user_limit === 1;
      default:
        console.log(`✅ useSubscription: '${featureName}' = true (default)`);
        return true; // Fonctionnalités de base (dashboard, paramétrage, etc.) toujours disponibles
    }
  };

  // Vérifier si la période d'essai a expiré
  const isTrialExpired = () => {
    if (!subscriptionData) return false;
    return subscriptionData.trial_expired === true;
  };

  // Obtenir les informations de l'essai
  const getTrialInfo = () => {
    if (!subscriptionData) return null;
    return {
      daysRemaining: subscriptionData.days_remaining || 0,
      daysSinceCreation: subscriptionData.days_since_creation || 0,
      expired: subscriptionData.trial_expired || false
    };
  };

  return {
    hasFeature,
    isTrialExpired,
    getTrialInfo,
    subscriptionData,
    loading,
    userLimit: subscriptionData?.subscription?.user_limit || 1
  };
};