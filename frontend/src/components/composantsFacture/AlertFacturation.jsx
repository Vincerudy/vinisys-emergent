import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, InputNumber, message, Select, Tabs } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useAuth } from '../../contexte/AuthContext';
import trash from '../../assets/trash.png';
import edit from '../../assets/edit.png';
import './css/AlertFacturation.css';

const API_URL = `${import.meta.env.VITE_API_URL}/alertes`;
const { TabPane } = Tabs;
dayjs.locale('fr');

const AlertFacturation = () => {
  const { id, societe_id } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/affichageAlertes`, {
        params: { id, societe_id }
      });

      if (response.data && Array.isArray(response.data.data)) {
        const sortedAlerts = response.data.data.sort(
          (a, b) => new Date(b.date_alerte) - new Date(a.date_alerte)
        );
        setAlerts(sortedAlerts);
        setFilteredAlerts(sortedAlerts);
      } else if (response.data.data && typeof response.data.data === 'object') {
        setAlerts([response.data.data]);
        setFilteredAlerts([response.data.data]);
      } else {
        message.error("Les données récupérées ne sont pas dans un format valide.");
      }
    } catch (error) {
      console.log("Vous n'avez pas encore d'alerte.");
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAddOrEditAlert = async () => {
    try {
      const values = await form.validateFields();
      const newAlert = {
        societe_id,
        date_alerte: dayjs(values.date).format('DD/MM/YYYY'),
        jours_avant: 1,
        titre: values.title,
        description: values.description,
        user_id: id,
      };

      if (editingAlert) {
        await axios.post(`${API_URL}/update/${editingAlert.id}`, newAlert);
        message.success("Alerte mise à jour avec succès !");
      } else {
        await axios.post(`${API_URL}`, newAlert);
        message.success("Alerte ajoutée avec succès !");
      }

      fetchAlerts();
      setModalVisible(false);
      form.resetFields();
      setEditingAlert(null);
    } catch (error) {
      message.error("Erreur lors de l'enregistrement de l'alerte.");
    }
  };

  const handleEditAlert = (record) => {
    setEditingAlert(record);
    setModalVisible(true);
    form.setFieldsValue({
      date: dayjs(record.date_alerte, 'DD/MM/YYYY'),
      daysBefore: record.jours_avant,
      title: record.titre,
      description: record.description,
    });
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await axios.post(`${API_URL}/delete/${alertId}`);
      message.success("Alerte supprimée avec succès !");
      fetchAlerts();
    } catch (error) {
      message.error("Erreur lors de la suppression de l'alerte.");
    }
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);

    if (!value) {
      setFilteredAlerts(alerts);
      return;
    }

    const filtered = alerts.filter(alert => {
      const alertDate = dayjs(alert.date_alerte, 'DD/MM/YYYY');
      const today = dayjs();

      if (value === 'A venir') return alertDate.isAfter(today, 'day');
      if (value === "Aujourd'hui") return alertDate.isSame(today, 'day');
      if (value === 'Expiré') return alertDate.isBefore(today, 'day');

      return true;
    });

    setFilteredAlerts(filtered);
  };

  const columns = [
    {
      title: 'Statut',
      render: (_, record) => {
        const currentDate = dayjs();
        const alertDate = dayjs(record.date_alerte, 'DD/MM/YYYY');
        let statut = '';
        let backgroundColor = '';

        if (alertDate.isAfter(currentDate, 'day')) {
          statut = 'A venir';
          backgroundColor = '#d4edda'; // vert clair
        } else if (alertDate.isSame(currentDate, 'day')) {
          statut = "Aujourd'hui";
          backgroundColor = '#fff3cd'; // jaune clair
        } else {
          statut = 'Expiré';
          backgroundColor = '#f8d7da'; // rouge clair
        }

        return (
          <span style={{ backgroundColor, padding: '5px 10px', borderRadius: '5px' }}>
            {statut}
          </span>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'date_alerte',
      render: (text) => dayjs(text, 'DD/MM/YYYY').format('DD/MM/YYYY'),
    },
    { title: 'Jours avant', dataIndex: 'jours_avant' },
    {
      title: 'Titre',
      dataIndex: 'titre',
      render: (text) => (text.length > 50 ? text.substring(0, 50) + '...' : text),
    },
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button type="link" icon={<img src={edit} alt="Edit" className='iconListe' />} onClick={() => handleEditAlert(record)} />
          <Button type="link" icon={<img src={trash} alt="Delete" className='iconListe' />} onClick={() => handleDeleteAlert(record.id)} />
        </>
      ),
    },
  ];

  return (
    <div className="alertes-container  " >
      <Tabs
        defaultActiveKey="alertes"
        items={[
          {
            label: (
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#18538e' }}>
                Configuration des alertes
              </span>
            ),
            key: 'alertes',
            children: (
              <>
                <div className="alertes-filters-column">
                  <Button
                    type="primary"
                    onClick={() => { setModalVisible(true); setEditingAlert(null); }}
                    style={{ marginBottom: '15px', width: '100%' }}
                  >
                    Ajouter une alerte
                  </Button>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Filtrer par statut"
                    onChange={handleStatusFilterChange}
                    value={statusFilter}
                    allowClear
                  >
                    <Select.Option value="">Tous</Select.Option>
                    <Select.Option value="A venir">A venir</Select.Option>
                    <Select.Option value="Aujourd'hui">Aujourd'hui</Select.Option>
                    <Select.Option value="Expiré">Expiré</Select.Option>
                  </Select>
                </div>

                <div className="alertes-table-wrapper">
                  <Table
                    columns={columns}
                    dataSource={filteredAlerts.sort((a, b) => b.id - a.id)}
                    rowKey="id"
                    className="alertes-table"
                    locale={{ emptyText: "Aucune alerte" }}
                    pagination={{ pageSize: 8 }}
                  />
                </div>


                <Modal
  title={editingAlert ? "Modifier une alerte" : "Ajouter une alerte"}
  open={modalVisible}
  onCancel={() => {
    setModalVisible(false);
    setEditingAlert(null);
    form.resetFields();
  }}
  onOk={handleAddOrEditAlert}
  afterClose={() => form.resetFields()}
  width={window.innerWidth <= 768 ? '100vw' : '55vw'}
  className={editingAlert ? 'modal-slide-in' : ''}
  style={{
    position: 'fixed',
    top: window.innerWidth <= 768 ? '13%' : '9%',
    right: 0,
    margin: 0,
    padding: 0,
  }}
  styles={{
    content: {
      maxWidth: '100vw',
      boxSizing: 'border-box',
    },
    body: {
      height: window.innerWidth <= 768 ? '60vh' : '80vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: window.innerWidth <= 768 ? '1rem' : '2rem',
    },
  }}
>
  <Form
    form={form}
    layout="vertical"
    style={{
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
    }}
  >
    <Form.Item
      label="Date"
      name="date"
      rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
    >
      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
    </Form.Item>

 

    <Form.Item
      label="Titre"
      name="title"
      rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
    >
      <Input style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item
      label="Description"
      name="description"
      rules={[{ required: true, message: 'Veuillez entrer une description' }]}
    >
      <Input.TextArea rows={4} style={{ width: '100%' }} />
    </Form.Item>
  </Form>
</Modal>
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AlertFacturation;
