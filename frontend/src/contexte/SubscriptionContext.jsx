import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Modal, Button, Typography } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { societe_id, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifier le statut d'abonnement
  const checkSubscriptionStatus = async () => {
    if (!societe_id || !isAuthenticated) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/subscription-status/${societe_id}`
      );
      
      if (response.data.success) {
        setSubscriptionStatus(response.data);
        
        // Si l'essai a expiré et qu'aucune fonctionnalité n'est activée, montrer la modale
        if (response.data.trial_expired && !hasActiveSubscription(response.data.subscription)) {
          setShowUpgradeModal(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si la société a un abonnement actif (au moins une fonctionnalité payante activée)
  const hasActiveSubscription = (subscription) => {
    if (!subscription) return false;
    
    return (
      subscription.enable_recette ||
      subscription.enable_mailing ||
      subscription.enable_relances_auto ||
      subscription.enable_stock ||
      subscription.enable_import_produits_services ||
      subscription.enable_mouvements_stock ||
      subscription.enable_inventaire_manuel ||
      subscription.enable_inventaire_auto ||
      (subscription.user_limit && subscription.user_limit > 2)
    );
  };

  // Vérifier si une fonctionnalité est accessible
  const hasFeatureAccess = (featureName) => {
    if (!subscriptionStatus || loading) return true; // Permettre l'accès pendant le chargement
    
    const { trial_expired, subscription } = subscriptionStatus;
    
    // Si l'essai n'a pas expiré, toutes les fonctionnalités sont accessibles
    if (!trial_expired) return true;
    
    // Si l'essai a expiré, vérifier les permissions spécifiques
    if (!subscription) return false;
    
    switch (featureName) {
      case 'facturation':
        return subscription.enable_facturation;
      case 'recette':
        return subscription.enable_recette;
      case 'mailing':
        return subscription.enable_mailing;
      case 'relances_auto':
        return subscription.enable_relances_auto;
      case 'stock':
        return subscription.enable_stock;
      case 'import_produits':
        return subscription.enable_import_produits_services;
      case 'mouvements_stock':
        return subscription.enable_mouvements_stock;
      case 'inventaire_manuel':
        return subscription.enable_inventaire_manuel;
      case 'inventaire_auto':
        return subscription.enable_inventaire_auto;
      default:
        return true;
    }
  };

  // Bloquer l'action et montrer la modale de mise à niveau
  const blockAction = () => {
    setShowUpgradeModal(true);
  };

  // Gérer la fermeture de la modale (ne pas permettre de fermer si l'essai a expiré)
  const handleModalClose = () => {
    if (subscriptionStatus?.trial_expired && !hasActiveSubscription(subscriptionStatus.subscription)) {
      // Ne pas fermer la modale si l'essai a expiré et aucun abonnement actif
      return;
    }
    setShowUpgradeModal(false);
  };

  useEffect(() => {
    if (isAuthenticated && societe_id) {
      checkSubscriptionStatus();
    }
  }, [societe_id, isAuthenticated]);

  // Intercepter les clics pour bloquer les actions si nécessaire
  useEffect(() => {
    const handleClick = (event) => {
      // Si l'essai a expiré et pas d'abonnement actif
      if (subscriptionStatus?.trial_expired && !hasActiveSubscription(subscriptionStatus.subscription)) {
        // Permettre seulement les clics sur les liens de mise à niveau
        const target = event.target.closest('a, button');
        if (target) {
          const href = target.getAttribute('href');
          const onClick = target.getAttribute('onclick');
          
          // Permettre navigation vers les pages d'abonnement
          if (href && (href.includes('/abonnement/') || href.includes('/assistance/'))) {
            return;
          }
          
          // Bloquer tous les autres clics
          event.preventDefault();
          event.stopPropagation();
          setShowUpgradeModal(true);
        }
      }
    };

    if (subscriptionStatus?.trial_expired && !hasActiveSubscription(subscriptionStatus.subscription)) {
      document.addEventListener('click', handleClick, true);
      return () => document.removeEventListener('click', handleClick, true);
    }
  }, [subscriptionStatus]);

  const value = {
    subscriptionStatus,
    loading,
    hasFeatureAccess,
    blockAction,
    checkSubscriptionStatus,
    hasActiveSubscription: hasActiveSubscription(subscriptionStatus?.subscription)
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      
      {/* Modale de mise à niveau */}
      <Modal
        open={showUpgradeModal}
        onCancel={handleModalClose}
        footer={null}
        closable={!subscriptionStatus?.trial_expired || hasActiveSubscription(subscriptionStatus?.subscription)}
        maskClosable={false}
        centered
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CrownOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: 20 }} />
          
          <Title level={3} style={{ marginBottom: 10 }}>
            Période d'essai expirée
          </Title>
          
          <Text style={{ fontSize: '16px', marginBottom: 20, display: 'block' }}>
            Votre période d'essai de 30 jours est terminée. 
            <br />
            Choisissez un plan pour continuer à utiliser toutes les fonctionnalités.
          </Text>
          
          {subscriptionStatus && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: 15, 
              borderRadius: 8, 
              marginBottom: 20,
              border: '1px solid #dee2e6'
            }}>
              <Text strong>Jours écoulés : </Text>
              <Text>{subscriptionStatus.days_since_creation} jours</Text>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<CrownOutlined />}
              onClick={() => {
                setShowUpgradeModal(false);
                navigate('/abonnement/plans');
              }}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Choisir un plan
            </Button>
            
            {hasActiveSubscription(subscriptionStatus?.subscription) && (
              <Button
                size="large"
                onClick={handleModalClose}
              >
                Fermer
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;