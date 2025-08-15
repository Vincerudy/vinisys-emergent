import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';

const ModaleFactureVisualization = ({ 
  visible, 
  onClose, 
  facture, 
  parametrage,
  tvas 
}) => {
  if (!facture) return null;

  return (
    <Modal
      title={`${facture.type === 'DEVI' ? 'Devis' : 'Facture'} N°${facture.invoiceNumber || facture.numero}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="facture-modal"
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Descriptions title="Informations de la facture" bordered>
          <Descriptions.Item label="Numéro">
            {facture.invoiceNumber || facture.numero}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            {facture.type === 'DEVI' ? 'Devis' : 'Facture'}
          </Descriptions.Item>
          <Descriptions.Item label="Date">
            {facture.date}
          </Descriptions.Item>
          <Descriptions.Item label="Client">
            {facture.client}
          </Descriptions.Item>
          <Descriptions.Item label="Montant">
            {facture.totalAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Statut">
            <Tag color={
              facture.statut === 'accepté' ? 'green' :
              facture.statut === 'en attente' ? 'orange' :
              facture.statut === 'payée' ? 'blue' : 'default'
            }>
              {facture.statut}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
        
        {/* Note pour l'utilisation complète de ModeleFacture */}
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <p><strong>Note :</strong> Pour une visualisation complète de la facture avec tous les détails, 
          veuillez vous rendre dans la section Facturation.</p>
        </div>
      </div>
    </Modal>
  );
};

export default ModaleFactureVisualization;