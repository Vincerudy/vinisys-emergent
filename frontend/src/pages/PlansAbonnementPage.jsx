import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Radio, Typography, message, Spin } from 'antd';
import { CheckOutlined, CrownOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PlansAbonnementPage = () => {
  const { societe_id } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [planPeriods, setPlanPeriods] = useState({
    starter: 'monthly',
    pro: 'monthly',
    ultra: 'monthly',
    mega: 'monthly'
  });

  // Récupérer les plans d'abonnement
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('Récupération des plans...');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/plans`);
        console.log('Réponse API:', response.data);
        
        if (response.data.success) {
          setPlans(response.data.data);
        } else {
          message.error('Erreur lors du chargement des plans');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des plans:', error);
        message.error('Erreur lors du chargement des plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Toutes les fonctionnalités disponibles avec leurs descriptions
  const allFeatures = {
    enable_facturation: {
      name: 'Gestion des factures',
      description: 'Créer, modifier et gérer vos factures'
    },
    enable_recette: {
      name: 'Cahier de recettes',
      description: 'Suivi détaillé de vos recettes et ventes'
    },
    enable_mailing: {
      name: 'Envoi d\'emails automatiques',
      description: 'Notifications et emails automatisés'
    },
    enable_relances_auto: {
      name: 'Relances automatiques',
      description: 'Relances automatiques pour factures impayées'
    },
    enable_stock: {
      name: 'Gestion du stock',
      description: 'Suivi et gestion de vos stocks'
    },
    enable_import_produits_services: {
      name: 'Import de produits/services',
      description: 'Importation en masse de vos produits'
    },
    enable_mouvements_stock: {
      name: 'Mouvements de stock',
      description: 'Historique des mouvements de stock'
    },
    enable_inventaire_manuel: {
      name: 'Inventaire manuel',
      description: 'Gestion manuelle des inventaires'
    },
    enable_inventaire_auto: {
      name: 'Inventaire automatisé',
      description: 'Inventaires automatiques et programmés'
    },
    enable_user_input: {
      name: 'Saisie utilisateur',
      description: 'Interface de saisie avancée'
    },
    user_limit: {
      name: 'Nombre d\'utilisateurs',
      description: 'Limite d\'utilisateurs simultanés'
    }
  };

  // Obtenir la liste des fonctionnalités pour un plan
  const getFeaturesList = (planFeatures) => {
    return Object.entries(allFeatures).map(([featureKey, featureInfo]) => {
      const isIncluded = planFeatures[featureKey] > 0;
      const value = planFeatures[featureKey];
      
      let displayText = featureInfo.name;
      if (featureKey === 'user_limit') {
        displayText = `${featureInfo.name} (${value})`;
      }

      return {
        key: featureKey,
        name: displayText,
        description: featureInfo.description,
        included: isIncluded,
        value: value
      };
    });
  };

  // Calculer le prix selon la période
  const getPrice = (plan, period) => {
    switch (period) {
      case 'monthly':
        return plan.price_monthly;
      case 'quarterly':
        return plan.price_quarterly;
      case 'yearly':
        return plan.price_yearly;
      default:
        return plan.price_monthly;
    }
  };

  // Calculer l'économie
  const getSavings = (plan, period) => {
    const monthlyPrice = plan.price_monthly;
    const periodPrice = getPrice(plan, period);
    
    if (period === 'quarterly' && monthlyPrice > 0) {
      const savings = ((monthlyPrice * 3 - periodPrice) / (monthlyPrice * 3)) * 100;
      return savings > 0 ? Math.round(savings) : 0;
    } else if (period === 'yearly' && monthlyPrice > 0) {
      const savings = ((monthlyPrice * 12 - periodPrice) / (monthlyPrice * 12)) * 100;
      return savings > 0 ? Math.round(savings) : 0;
    }
    return 0;
  };

  // Changer la période d'un plan
  const handlePeriodChange = (planKey, period) => {
    setPlanPeriods(prev => ({
      ...prev,
      [planKey]: period
    }));
  };

  // Gérer la sélection d'un plan
  const handlePlanSelection = async (planKey) => {
    const selectedPeriod = planPeriods[planKey];
    
    // Si c'est le plan gratuit, l'activer directement
    if (planKey === 'starter') {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/activate-subscription`, {
          societe_id,
          planType: 'starter',
          billingPeriod: 'monthly'
        });
        
        if (response.data.success) {
          message.success('Plan Starter activé avec succès !');
          navigate('/');
        } else {
          message.error('Erreur lors de l\'activation du plan gratuit');
        }
      } catch (error) {
        console.error('Erreur lors de l\'activation:', error);
        message.error('Erreur lors de l\'activation du plan gratuit');
      }
    } else {
      // Pour les plans payants, rediriger vers la page de paiement
      navigate(`/abonnement/paiement?plan=${planKey}&period=${selectedPeriod}`);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Chargement des plans d'abonnement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 10 }}>
        Choisissez votre plan d'abonnement
      </Title>
      <Text style={{ display: 'block', textAlign: 'center', fontSize: '16px', color: '#666', marginBottom: 40 }}>
        Sélectionnez le plan qui correspond le mieux à vos besoins
      </Text>

      <Row gutter={[24, 24]} justify="center">
        {Object.entries(plans).map(([planKey, plan]) => {
          const selectedPeriod = planPeriods[planKey];
          const price = getPrice(plan, selectedPeriod);
          const savings = getSavings(plan, selectedPeriod);
          const features = getFeaturesList(plan.features);
          const isPopular = planKey === 'pro';
          const isFree = planKey === 'starter';

          return (
            <Col xs={24} sm={12} lg={6} key={planKey}>
              <Card
                style={{
                  height: '100%',
                  position: 'relative',
                  border: isPopular ? '2px solid #fa8c16' : '1px solid #d9d9d9',
                  borderRadius: '12px'
                }}
              >
                {isPopular && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #fa8c16, #faad14)',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 1
                  }}>
                    <CrownOutlined style={{ marginRight: 5 }} /> Populaire
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <Title level={3} style={{ margin: 0, color: isPopular ? '#fa8c16' : '#1890ff' }}>
                    {plan.name}
                  </Title>
                  <Text style={{ color: '#666', display: 'block', marginBottom: 15 }}>
                    {plan.description}
                  </Text>

                  {/* Prix */}
                  <div style={{ margin: '15px 0' }}>
                    <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                      {price === 0 ? 'Gratuit' : `${price}€`}
                    </span>
                    {price > 0 && (
                      <span style={{ fontSize: '14px', color: '#666', marginLeft: 5 }}>
                        /{selectedPeriod === 'monthly' ? 'mois' : selectedPeriod === 'quarterly' ? 'trimestre' : 'an'}
                      </span>
                    )}
                  </div>

                  {/* Badge d'économie */}
                  {savings > 0 && (
                    <div style={{
                      display: 'inline-block',
                      background: '#52c41a',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: 15
                    }}>
                      Économisez {savings}%
                    </div>
                  )}

                  {/* Sélecteur de période pour les plans payants */}
                  {!isFree && (
                    <div style={{ marginBottom: 20 }}>
                      <Radio.Group
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(planKey, e.target.value)}
                        size="small"
                        style={{ display: 'flex', justifyContent: 'center' }}
                      >
                        <Radio.Button value="monthly" style={{ fontSize: '12px' }}>
                          Mensuel
                        </Radio.Button>
                        <Radio.Button value="quarterly" style={{ fontSize: '12px' }}>
                          Trimestre
                        </Radio.Button>
                        <Radio.Button value="yearly" style={{ fontSize: '12px' }}>
                          Annuel
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                  )}
                </div>

                {/* Liste des fonctionnalités */}
                <div style={{ marginBottom: 20, minHeight: '300px' }}>
                  <Title level={5} style={{ marginBottom: 15 }}>Fonctionnalités incluses :</Title>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {features.map((feature, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          padding: '8px 0',
                          borderBottom: index < features.length - 1 ? '1px solid #f0f0f0' : 'none',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}
                      >
                        {feature.included ? (
                          <CheckOutlined style={{ color: '#52c41a', marginRight: 8, marginTop: 2, fontSize: '14px' }} />
                        ) : (
                          <CloseOutlined style={{ color: '#ff4d4f', marginRight: 8, marginTop: 2, fontSize: '12px' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: feature.included ? 'normal' : '300',
                            color: feature.included ? '#333' : '#999',
                            fontSize: '13px',
                            lineHeight: 1.4
                          }}>
                            {feature.name}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#999',
                            marginTop: 2,
                            lineHeight: 1.3
                          }}>
                            {feature.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton de sélection */}
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => handlePlanSelection(planKey)}
                  style={{
                    marginTop: 'auto',
                    backgroundColor: isFree ? '#52c41a' : isPopular ? '#fa8c16' : '#1890ff',
                    borderColor: isFree ? '#52c41a' : isPopular ? '#fa8c16' : '#1890ff',
                    height: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {isFree 
                    ? 'Commencer gratuitement' 
                    : `Choisir ${plan.name} - ${price}€`
                  }
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Section d'information */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: 50, 
        padding: '30px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <Title level={4} style={{ color: '#1890ff', marginBottom: 15 }}>
          🎁 Période d'essai gratuite de 30 jours
        </Title>
        <Text style={{ fontSize: '16px', lineHeight: 1.6 }}>
          Tous les plans bénéficient d'une période d'essai complète de 30 jours avec accès à toutes les fonctionnalités.<br />
          Aucun engagement, vous pouvez annuler à tout moment pendant la période d'essai.
        </Text>
        <div style={{ marginTop: 20 }}>
          <Text strong style={{ color: '#52c41a' }}>
            ✓ Accès complet pendant 30 jours  ·  ✓ Aucune carte bancaire requise  ·  ✓ Annulation en 1 clic
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PlansAbonnementPage;