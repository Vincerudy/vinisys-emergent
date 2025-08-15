import React, { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';
import ModeleFacture from './ModeleFacture';
import axios from 'axios';

const ModaleFactureVisualization = ({ 
  visible, 
  onClose, 
  facture, 
  parametrage,
  tvas 
}) => {
  const [factureCompleteData, setFactureCompleteData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour récupérer les données complètes de la facture
  const fetchFactureComplete = async (factureId, societeId) => {
    if (!factureId || !societeId) return;
    
    setLoading(true);
    try {
      // Récupérer toutes les factures pour trouver celle avec les détails complets
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/listeFacture/${societeId}`);
      const factures = response.data;
      
      // Trouver la facture spécifique
      const factureComplete = factures.find(f => f.id === factureId);
      
      if (factureComplete) {
        console.log('Facture complète trouvée:', factureComplete);
        setFactureCompleteData(factureComplete);
      } else {
        console.error('Facture non trouvée dans la liste');
        setFactureCompleteData(facture); // Fallback sur les données de base
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la facture complète:', error);
      setFactureCompleteData(facture); // Fallback sur les données de base
    } finally {
      setLoading(false);
    }
  };

  // Charger les données complètes quand la modal s'ouvre
  useEffect(() => {
    if (visible && facture && facture.id) {
      // Extraire societe_id du contexte ou des données de facture
      const societeId = facture.societe_id || 2; // Fallback sur 2
      fetchFactureComplete(facture.id, societeId);
    }
  }, [visible, facture]);

  if (!facture) return null;

  return (
    <Modal
      title={`${facture.type === 'DEVI' ? 'Devis' : 'Facture'} N°${facture.invoiceNumber || facture.numero}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      className="facture-modal"
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p>Chargement des détails de la facture...</p>
          </div>
        ) : factureCompleteData ? (
          <ModeleFacture 
            factures={factureCompleteData}
            type={factureCompleteData.type_fact || facture.type}
            parametrage={parametrage}
            tvas={tvas || []}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Impossible de charger les détails de la facture.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ModaleFactureVisualization;