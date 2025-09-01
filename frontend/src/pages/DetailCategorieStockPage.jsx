import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, message, Popconfirm, Space, Card, Statistic, Row, Col, Breadcrumb } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, HomeOutlined, FolderOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';
import './css/DetailCategorieStockPage.css';

const DetailCategorieStockPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { societe_id } = useAuth();
  const [category, setCategory] = useState(null);
  const [sousCategories, setSousCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSousCategorie, setEditingSousCategorie] = useState(null);
  const [form] = Form.useForm();

  // Charger les détails de la catégorie
  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories-stock/${id}/details`);
      setCategory(response.data.category);
      setSousCategories(response.data.sous_categories || []);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      message.error('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategoryDetails();
    }
  }, [id]);

  // Ouvrir le modal d'ajout de sous-catégorie
  const handleAddSousCategorie = () => {
    setEditingSousCategorie(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Ouvrir le modal d'édition de sous-catégorie
  const handleEditSousCategorie = (sousCategorie) => {
    setEditingSousCategorie(sousCategorie);
    form.setFieldsValue({
      nom: sousCategorie.nom,
      description: sousCategorie.description
    });
    setModalVisible(true);
  };

  // Sauvegarder une sous-catégorie
  const handleSaveSousCategorie = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        categorie_parent_id: id,
        societe_id
      };

      if (editingSousCategorie) {
        // Modification
        await axios.put(`${import.meta.env.VITE_API_URL}/sous-categories-stock/${editingSousCategorie.id}`, payload);
        message.success('Sous-catégorie modifiée avec succès');
      } else {
        // Création
        await axios.post(`${import.meta.env.VITE_API_URL}/sous-categories-stock`, payload);
        message.success('Sous-catégorie créée avec succès');
      }

      setModalVisible(false);
      fetchCategoryDetails();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer une sous-catégorie
  const handleDeleteSousCategorie = async (sousId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/sous-categories-stock/${sousId}`);
      message.success('Sous-catégorie supprimée avec succès');
      fetchCategoryDetails();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (id) => (
        <span className="sous-category-id">{id}</span>
      ),
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      render: (nom, record) => (
        <span>
          <strong className="sous-category-id-inline">[{record.id}]</strong> {nom}
        </span>
      ),
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Produits',
      dataIndex: 'nb_produits',
      key: 'nb_produits',
      render: (count) => `${count || 0} produit(s)`,
      sorter: (a, b) => (a.nb_produits || 0) - (b.nb_produits || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditSousCategorie(record)}
            title="Modifier"
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?"
            description="Cette action supprimera également tous les produits associés de cette sous-catégorie."
            onConfirm={() => handleDeleteSousCategorie(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Supprimer"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!category) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="detail-categorie-stock-page">
      {/* En-tête avec navigation */}
      <div className="page-header">
        <div className="header-top">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/categories-stock')}
            style={{ marginRight: 16 }}
          >
            Retour
          </Button>
          
          <Breadcrumb>
            <Breadcrumb.Item>
              <HomeOutlined />
              <span>Accueil</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <FolderOutlined />
              <span>Catégories</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{category.nom}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <h1>{category.nom}</h1>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
      </div>

      {/* Statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Sous-catégories"
              value={sousCategories.length}
              suffix="total"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Produits directs"
              value={category.nb_produits || 0}
              suffix="produits"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Produits totaux"
              value={category.nb_produits_total || 0}
              suffix="avec sous-catégories"
            />
          </Card>
        </Col>
      </Row>

      {/* Section sous-catégories */}
      <Card title="Sous-catégories" className="sous-categories-section">
        <div className="section-header">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSousCategorie}
          >
            Nouvelle Sous-catégorie
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={sousCategories}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} sur ${total} sous-catégories`,
          }}
          locale={{
            emptyText: 'Aucune sous-catégorie trouvée'
          }}
        />
      </Card>

      {/* Modal d'ajout/édition de sous-catégorie */}
      <Modal
        title={editingSousCategorie ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}
        open={modalVisible}
        onOk={handleSaveSousCategorie}
        onCancel={() => setModalVisible(false)}
        okText="Sauvegarder"
        cancelText="Annuler"
      >
        <Form
          form={form}
          layout="vertical"
          name="sous-category-form"
        >
          <Form.Item
            name="nom"
            label="Nom de la sous-catégorie"
            rules={[
              { required: true, message: 'Le nom est obligatoire' },
              { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
              { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
            ]}
          >
            <Input placeholder="Ex: Smartphones, Tablettes, Ordinateurs portables..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: 'La description ne peut pas dépasser 500 caractères' }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Description de la sous-catégorie (optionnel)..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DetailCategorieStockPage;