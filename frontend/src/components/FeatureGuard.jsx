import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import RestrictedFeature from './RestrictedFeature';
import { Spin } from 'antd';

const FeatureGuard = ({ 
  children, 
  feature, 
  title = "Fonctionnalité Premium", 
  description = "Cette fonctionnalité nécessite un plan supérieur." 
}) => {
  const { hasFeature, loading } = useSubscription();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hasFeature(feature)) {
    return (
      <RestrictedFeature 
        featureName={feature}
        title={title}
        description={description}
      />
    );
  }

  return children;
};

export default FeatureGuard;