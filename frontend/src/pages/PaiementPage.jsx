import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, Typography, Spin, Alert, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import CheckoutForm from '../components/CheckoutForm';
import './css/PaiementPage.css';

const { Title, Text } = Typography;

// Clé publique Stripe
const stripePromise = loadStripe(import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'your_stripe_publishable_key_here');

const PaiementPage = () => {
  const { societe_id } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [planDetails, setPlanDetails] = useState(null);

  const planType = searchParams.get('plan');
  const billingPeriod = searchParams.get('period');

  useEffect(() => {
    if (!planType || !billingPeriod) {
      navigate('/abonnement/plans');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/create-payment-intent`, {
          planType,
          billingPeriod,
          societe_id
        });

        if (response.data.success) {
          if (response.data.free_plan) {
            // Plan gratuit - rediriger
            navigate('/abonnement/plans');
            return;
          }

          setClientSecret(response.data.client_secret);
          setPlanDetails({
            plan: response.data.plan,
            billingPeriod: response.data.billingPeriod,
            amount: response.data.amount / 100 // Convertir des centimes en euros
          });
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Erreur lors de la création du paiement:', err);
        
        // Gérer les erreurs spécifiques
        if (err.response && err.response.data) {
          if (err.response.data.error && err.response.data.error.includes('Stripe')) {
            setError('Configuration Stripe en cours. Veuillez contacter le support pour activer les paiements.');
          } else {
            setError(err.response.data.message || 'Erreur lors de la création du paiement');
          }
        } else {
          setError('Erreur lors de la création du paiement');
        }
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [planType, billingPeriod, societe_id, navigate]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#1890ff',
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className="paiement-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Préparation du paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paiement-page">
        <Card style={{ maxWidth: 500, margin: '0 auto' }}>
          <Alert 
            message="Erreur"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/abonnement/plans')}
          >
            Retour aux plans
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="paiement-page">
      <div className="paiement-container">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/abonnement/plans')}
          style={{ marginBottom: 20 }}
        >
          Retour aux plans
        </Button>

        <Card className="paiement-card">
          <div className="paiement-header">
            <Title level={2} style={{ textAlign: 'center', marginBottom: 10 }}>
              Finaliser votre abonnement
            </Title>
            
            {planDetails && (
              <div className="plan-summary">
                <div className="summary-item">
                  <Text strong>Plan sélectionné:</Text>
                  <Text style={{ marginLeft: 10, textTransform: 'capitalize' }}>
                    {planDetails.plan}
                  </Text>
                </div>
                <div className="summary-item">
                  <Text strong>Période:</Text>
                  <Text style={{ marginLeft: 10 }}>
                    {billingPeriod === 'monthly' ? 'Mensuel' : 
                     billingPeriod === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                  </Text>
                </div>
                <div className="summary-item">
                  <Text strong>Montant:</Text>
                  <Text style={{ marginLeft: 10, fontSize: '18px', color: '#1890ff' }}>
                    {planDetails.amount}€
                  </Text>
                </div>
              </div>
            )}
          </div>

          <div className="payment-form-container">
            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm 
                  planType={planType}
                  billingPeriod={billingPeriod}
                  amount={planDetails?.amount}
                />
              </Elements>
            )}
          </div>

          <div className="security-info">
            <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
              🔒 Paiement sécurisé par Stripe. Vos données sont protégées.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaiementPage;