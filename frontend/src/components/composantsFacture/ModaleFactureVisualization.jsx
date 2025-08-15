import React from 'react';
import { Modal } from 'antd';
import ModeleFacture from './ModeleFacture';

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
      width={800}
      centered
      className="facture-modal"
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <ModeleFacture 
          factures={facture}
          type={facture.type}
          parametrage={parametrage}
          tvas={tvas}
        />
      </div>
    </Modal>
  );
};

export default ModaleFactureVisualization;