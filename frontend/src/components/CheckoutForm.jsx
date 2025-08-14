import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js';
import { Button, message } from 'antd';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({ planType, billingPeriod, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { societe_id } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentMessage('');

    try {
      // Confirmer le paiement
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setPaymentMessage(error.message);
        } else {
          setPaymentMessage('Une erreur inattendue s\'est produite.');
        }
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ Paiement réussi:', paymentIntent.id);
        
        // Activer l'abonnement après paiement réussi
        try {
          const activationResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/activate-subscription`,
            {
              societe_id,
              planType,
              billingPeriod,
              payment_intent_id: paymentIntent.id
            }
          );

          if (activationResponse.data.success) {
            message.success('Abonnement activé avec succès !');
            navigate('/'); // Retourner au tableau de bord
          } else {
            message.error('Erreur lors de l\'activation de l\'abonnement');
            setPaymentMessage('Le paiement a réussi mais l\'activation a échoué. Contactez le support.');
          }
        } catch (activationError) {
          console.error('Erreur lors de l\'activation:', activationError);
          message.error('Erreur lors de l\'activation de l\'abonnement');
          setPaymentMessage('Le paiement a réussi mais l\'activation a échoué. Contactez le support.');
        }
      }
    } catch (submitError) {
      console.error('Erreur lors de la soumission:', submitError);
      setPaymentMessage('Une erreur s\'est produite lors du traitement du paiement.');
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs'
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <PaymentElement 
        id="payment-element" 
        options={paymentElementOptions}
      />
      
      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={isLoading || !stripe || !elements}
        style={{
          marginTop: 24,
          height: 50,
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        <span id="button-text">
          {isLoading ? 'Traitement...' : `Payer ${amount}€`}
        </span>
      </Button>
      
      {paymentMessage && (
        <div 
          id="payment-message" 
          style={{ 
            color: '#e74c3c', 
            marginTop: 16, 
            textAlign: 'center',
            fontSize: '14px'
          }}
        >
          {paymentMessage}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;