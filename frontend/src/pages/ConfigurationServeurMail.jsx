import React from 'react';
import {Select, Tabs } from 'antd';
import './css/GestionAdministrativePage.css'; // Import du fichier CSS
import MailSettingsForm from '../components/composantsFacture/MailSettingsForm';

 

 
const { TabPane } = Tabs;

 
const ConfigurationServeurMail = () => { 
 
  return (
 
    <div className="gestion-administrative-container">
 
      <Tabs defaultActiveKey="documents" style={window.innerWidth <= 768 ? { width:'95%'}: ""}>

        <TabPane 
          tab={<span style={{ fontWeight: 'bold', fontSize: '18px', color: '#3454d1' }}>Paramètres de messagerie</span>} 
          key="communication">
        <MailSettingsForm/>
        </TabPane>
      </Tabs>
    </div>
 
  );
};

export default ConfigurationServeurMail;
