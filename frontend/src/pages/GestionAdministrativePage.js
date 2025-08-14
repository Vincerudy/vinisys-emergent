import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './css/GestionAdministrativePage.css'; // Import du fichier CSS
import DashboardLayout from './composants/DashboardLayout';

const { Option } = Select;
const { TabPane } = Tabs;

// Données fictives
const fakeDocuments = [
  { id: '1', title: 'Contrat de Travail', date: '2024-09-01', status: 'Validé' },
  { id: '2', title: 'Rapport Annuel', date: '2024-09-05', status: 'En Révision' },
];

const fakeUsers = [
  { id: '1', name: 'Jean Dupont', role: 'Administrateur' },
  { id: '2', name: 'Marie Curie', role: 'Employé' },
];

const GestionAdministrativePage = () => {
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
    <DashboardLayout> 
    <div className="gestion-administrative-container">
      <h1 className="page-title">Gestion Administrative</h1>
      <Tabs defaultActiveKey="documents">
        <TabPane tab="Documents" key="documents">
          <Button type="primary" onClick={handleAdd} className="create-button" icon={<PlusOutlined />}>Ajouter un Document</Button>
          <Table columns={[
            { title: 'Titre', dataIndex: 'title', key: 'title' },
            { title: 'Date', dataIndex: 'date', key: 'date' },
            { title: 'Statut', dataIndex: 'status', key: 'status' },
          ]} dataSource={fakeDocuments} rowKey="id" className="document-table" />
        </TabPane>

        <TabPane tab="Utilisateurs" key="users">
          <Button type="primary" onClick={handleAdd} className="create-button" icon={<PlusOutlined />}>Ajouter un Utilisateur</Button>
          <Table columns={[
            { title: 'Nom', dataIndex: 'name', key: 'name' },
            { title: 'Rôle', dataIndex: 'role', key: 'role' },
          ]} dataSource={fakeUsers} rowKey="id" className="user-table" />
        </TabPane>

        <TabPane tab="Réunions" key="meetings">
          {/* Vous pouvez ajouter des fonctionnalités pour gérer les réunions ici */}
        </TabPane>

        <TabPane tab="Ressources" key="resources">
          {/* Vous pouvez ajouter des fonctionnalités pour gérer les ressources ici */}
        </TabPane>

        <TabPane tab="Projets" key="projects">
          {/* Vous pouvez ajouter des fonctionnalités pour gérer les projets ici */}
        </TabPane>

        <TabPane tab="Communication" key="communication">
          {/* Vous pouvez ajouter des fonctionnalités pour la communication interne ici */}
        </TabPane>

        <TabPane tab="Événements" key="events">
          {/* Vous pouvez ajouter des fonctionnalités pour organiser des événements ici */}
        </TabPane>
      </Tabs>

      <Modal title="Ajouter une Nouvelle Entrée" visible={modalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Titre" rules={[{ required: true, message: 'Veuillez entrer un titre!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Veuillez sélectionner une date!' }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="status" label="Statut" rules={[{ required: true, message: 'Veuillez sélectionner un statut!' }]}>
            <Select>
              <Option value="validé">Validé</Option>
              <Option value="en révision">En Révision</Option>
              <Option value="à valider">À Valider</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </DashboardLayout>
  );
};

export default GestionAdministrativePage;
