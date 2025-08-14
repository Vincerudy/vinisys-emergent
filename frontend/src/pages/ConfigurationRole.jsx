import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
 
import DashboardLayout from '../components/composantsFacture/DashboardLayout';
import SocieteConfiguration from '../components/composantsFacture/SocieteConfiguration';
import UserManagement from '../components/composantsFacture/UserManagement';
import MailSettingsForm from '../components/composantsFacture/MailSettingsForm';
import TaxConfiguration from '../components/composantsFacture/TaxConfiguration';
import UsersListe from './UsersListe';
 

const { Option } = Select;
const { TabPane } = Tabs;

 
const ConfigurationRole = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      setModalVisible(false);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
 
    <div className="gestion-administrative-container">
 
      <Tabs defaultActiveKey="documents">

        <TabPane 
            tab={<span style={{ fontWeight: 'bold', fontSize: '18px', color: '#3454d1' }}>Gestion des utilisateurs</span>} 
 
          key="resources">
          {/* Vous pouvez ajouter des fonctionnalités pour gérer les ressources ici */}
          <UsersListe/>
        </TabPane>

 
      </Tabs>

 
    </div>
 
  );
};

export default ConfigurationRole;
