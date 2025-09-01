import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';
import './css/CategoriesStockPage.css';

const CategoriesStockPage = () => {
  const navigate = useNavigate();
  const { societe_id } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Charger les catégories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories-stock/${societe_id}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      message.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [societe_id]);

  // Ouvrir le modal d'ajout
  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Ouvrir le modal d'édition
  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      nom: category.nom,
      description: category.description
    });
    setModalVisible(true);
  };

  // Sauvegarder une catégorie
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        societe_id
      };

      if (editingCategory) {
        // Modification
        await axios.put(`${import.meta.env.VITE_API_URL}/categories-stock/${editingCategory.id}`, payload);
        message.success('Catégorie modifiée avec succès');
      } else {
        // Création
        await axios.post(`${import.meta.env.VITE_API_URL}/categories-stock`, payload);
        message.success('Catégorie créée avec succès');
      }

      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer une catégorie
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categories-stock/${id}`);
      message.success('Catégorie supprimée avec succès');
      fetchCategories();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  // Voir le détail d'une catégorie
  const handleView = (category) => {
    navigate(`/categorie-stock/${category.id}`);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (id) => (
        <span className="category-id">{id}</span>
      ),
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      render: (nom, record) => (
        <span>
          <strong className="category-id-inline">[{record.id}]</strong> {nom}
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
      title: 'Sous-catégories',
      dataIndex: 'nb_sous_categories',
      key: 'nb_sous_categories',
      render: (count) => `${count || 0} sous-catégorie(s)`,
      sorter: (a, b) => (a.nb_sous_categories || 0) - (b.nb_sous_categories || 0),
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
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
            title="Voir détails"
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            title="Modifier"
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette catégorie ?"
            description="Cette action supprimera également toutes les sous-catégories associées."
            onConfirm={() => handleDelete(record.id)}
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

  return (
    <div className="categories-stock-page">
      <div className="page-header">
        <h1>Gestion des Catégories</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Nouvelle Catégorie
        </Button>
      </div>

      <div className="categories-content">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} sur ${total} catégories`,
          }}
          locale={{
            emptyText: 'Aucune catégorie trouvée'
          }}
        />
      </div>

      {/* Modal d'ajout/édition */}
      <Modal
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="Sauvegarder"
        cancelText="Annuler"
      >
        <Form
          form={form}
          layout="vertical"
          name="category-form"
        >
          <Form.Item
            name="nom"
            label="Nom de la catégorie"
            rules={[
              { required: true, message: 'Le nom est obligatoire' },
              { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
              { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
            ]}
          >
            <Input placeholder="Ex: Électronique, Mobilier, Fournitures..." />
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
              placeholder="Description de la catégorie (optionnel)..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesStockPage;