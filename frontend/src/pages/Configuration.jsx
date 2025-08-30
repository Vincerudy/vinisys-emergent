import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Tabs } from 'antd';
import './css/GestionAdministrativePage.css'; // Import du fichier CSS
import SocieteConfiguration from '../components/composantsFacture/SocieteConfiguration';
import ConfigurationTVA from './ConfigurationTVA';
import ComptesComptablesConfiguration from '../components/ComptesComptablesConfiguration';
 
const { Option } = Select;

const Configuration = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields()
      .then(values => {
        console.log('Form values:', values);
        setModalVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const tabItems = [
    {
      key: 'societe',
      label: (
        <span style={{ fontWeight: 'bold', fontSize: 18, color: '#3454d1' }}>
          Configuration de la société
        </span>
      ),
      children: <SocieteConfiguration />,
    },
    {
      key: 'tva',
      label: (
        <span style={{ fontWeight: 'bold', fontSize: 18, color: '#3454d1' }}>
          Taxes
        </span>
      ),
      children: <ConfigurationTVA />,
    },
    {
      key: 'comptes',
      label: (
        <span style={{ fontWeight: 'bold', fontSize: 18, color: '#3454d1' }}>
          Rubrique et compte comptable
        </span>
      ),
      children: <ComptesComptablesConfiguration />,
    },
  ];

  return (
    <div className="gestion-administrative-container">
      <Tabs defaultActiveKey="societe" items={tabItems} />

      <Modal
        title="Ajouter une Nouvelle Entrée"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Veuillez entrer un titre!' }]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Veuillez sélectionner une date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Statut"
            rules={[{ required: true, message: 'Veuillez sélectionner un statut!' }]}
          >
            <Select allowClear placeholder="Sélectionner un statut">
              <Option value="validé">Validé</Option>
              <Option value="en révision">En Révision</Option>
              <Option value="à valider">À Valider</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Configuration;
