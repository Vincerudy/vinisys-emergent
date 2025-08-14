import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Input, Tag, message, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../contexte/Api';
import axios from 'axios';
import './css/MouvementsStockPage.css';
import { useAuth } from '../contexte/AuthContext';

const { Option } = Select;
const { RangePicker } = DatePicker;

const motifs = {
  ENTREE: ['Approvisionnement', 'Retour fournisseur'],
  SORTIE: ['Vente', 'Perte', 'Vol', 'Casse', 'Retour client'],
};

const couleursType = {
  ENTREE: 'green',
  SORTIE: 'red',
};

const MouvementsStockPage = () => {
  const { id, societe_id } = useAuth();
  const [form] = Form.useForm();
  const [mouvements, setMouvements] = useState([]);
  const [filteredMouvements, setFilteredMouvements] = useState([]);
  const [produits, setProduits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('ENTREE');

  const [filterProduit, setFilterProduit] = useState(null);
  const [filterMotif, setFilterMotif] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterDates, setFilterDates] = useState(null);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/produits/${societe_id}`);
        const mapped = response.data.map(prod => ({
          id: prod.id,
          nom: prod.nom,
        }));
        setProduits(mapped);
      } catch {
        message.error('Impossible de charger les produits.');
      }
    };

    const fetchMouvements = async () => {
      try {
        const response = await api.get(`${import.meta.env.VITE_API_URL}/mouvements-stock/${societe_id}`);
        setMouvements(response.data);
        setFilteredMouvements(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des mouvements :', error);
      }
    };

    fetchProduits();
    fetchMouvements();
  }, [societe_id]);

  useEffect(() => {
    let filtered = [...mouvements];

    if (filterProduit && filterProduit !== 'TOUS') {
      filtered = filtered.filter(m => m.produit === filterProduit);
    }

    if (filterMotif && filterMotif !== 'TOUS') {
      filtered = filtered.filter(m => m.motif === filterMotif);
    }

    if (filterType && filterType !== 'TOUS') {
      filtered = filtered.filter(m => m.type === filterType);
    }

    if (filterDates) {
      const [start, end] = filterDates;
      filtered = filtered.filter(m => {
        const date = dayjs(m.date_mouvement);
        return date.isAfter(start.subtract(1, 'day')) && date.isBefore(end.add(1, 'day'));
      });
    }

    filtered.sort((a, b) => new Date(b.date_mouvement) - new Date(a.date_mouvement));
    setFilteredMouvements(filtered);
  }, [filterProduit, filterMotif, filterType, filterDates, mouvements]);

  const handleAddMouvement = () => {
    form.resetFields();
    setSelectedType('ENTREE');
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        produit_id: values.produit_id,
        type: values.type,
        quantite: values.quantite,
        motif: values.motif,
        user_id: id,
        date_mouvement: values.date_mouvement.format('YYYY-MM-DD'),
        societe_id,
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/mouvement-stock`, payload);
      const response = await api.get(`/mouvements-stock/${societe_id}`);
      setMouvements(response.data);
      setModalVisible(false);
    } catch (error) {
      const msg = error.response?.data?.erreur || "Échec lors de l'envoi du mouvement de stock.";
      Modal.error({ title: "Erreur", content: msg });
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date_mouvement',
      key: 'date_mouvement',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag color={couleursType[text]}>{text}</Tag>,
    },
    {
      title: 'Produit',
      dataIndex: 'produit',
      key: 'produit',
    },
    {
      title: 'Quantité',
      dataIndex: 'quantite',
      key: 'quantite',
    },
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
    },
    {
      title: 'Utilisateur',
      dataIndex: 'utilisateur',
      key: 'utilisateur',
    },
  ];

  return (
    <div className="mouvements-stock-page">
      <h1>Mouvements de Stock</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Select
            allowClear
            placeholder="Filtrer par produit"
            onChange={(value) => setFilterProduit(value || 'TOUS')}
            style={{ width: '100%' }}
          >
            <Option value="TOUS">Tous</Option>
            {produits.map(prod => (
              <Option key={prod.id} value={prod.nom}>{prod.nom}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            allowClear
            placeholder="Filtrer par type"
            onChange={(value) => setFilterType(value || 'TOUS')}
            style={{ width: '100%' }}
          >
            <Option value="TOUS">Tous</Option>
            <Option value="ENTREE">Entrée</Option>
            <Option value="SORTIE">Sortie</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            allowClear
            placeholder="Filtrer par motif"
            onChange={(value) => setFilterMotif(value || 'TOUS')}
            style={{ width: '100%' }}
          >
            <Option value="TOUS">Tous</Option>
            {Object.values(motifs).flat().map(motif => (
              <Option key={motif} value={motif}>{motif}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            onChange={setFilterDates}
            style={{ width: '100%' }}
            placeholder={['Date de début', 'Date de fin']}
          />
        </Col>
      </Row>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMouvement}>
          Ajouter un mouvement
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMouvements}
        rowKey="id"
        locale={{ emptyText: 'Aucune donnée à afficher' }}
        scroll={{ x: true }}
      />

      <Modal
        title="Ajouter un mouvement de stock"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Type" initialValue="ENTREE" rules={[{ required: true }]}>
            <Select onChange={(val) => setSelectedType(val)}>
              <Option value="ENTREE">Entrée</Option>
              <Option value="SORTIE">Sortie</Option>
            </Select>
          </Form.Item>

          <Form.Item name="produit_id" label="Produit" rules={[{ required: true }]}>
            <Select placeholder="Sélectionner un produit">
              {produits.map(prod => (
                <Option key={prod.id} value={prod.id}>{prod.nom}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="quantite" label="Quantité" rules={[{ required: true, type: 'number', min: 1 }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="motif" label="Motif" rules={[{ required: true }]}>
            <Select placeholder="Sélectionner un motif">
              {motifs[selectedType].map(motif => (
                <Option key={motif} value={motif}>{motif}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date_mouvement" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MouvementsStockPage;
