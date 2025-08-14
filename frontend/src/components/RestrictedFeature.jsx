import React from 'react';
import { Result, Button } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const RestrictedFeature = ({ featureName, title, description }) => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      padding: '20px'
    }}>
      <Result
        icon={<CrownOutlined style={{ color: '#fa8c16' }} />}
        title={`${title} - Fonctionnalité Premium`}
        subTitle={
          <div>
            <p>{description}</p>
            <p>Cette fonctionnalité n'est pas incluse dans votre plan actuel.</p>
            <p>Passez à un plan supérieur pour débloquer cette fonctionnalité.</p>
          </div>
        }
        extra={[
          <Button 
            key="upgrade"
            type="primary" 
            size="large"
            icon={<CrownOutlined />}
            onClick={() => navigate('/abonnement/plans')}
            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
          >
            Mettre à niveau maintenant
          </Button>,
          <Button key="back" onClick={() => window.history.back()}>
            Retour
          </Button>
        ]}
      />
    </div>
  );
};

export default RestrictedFeature;