import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Tag, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';

const ComptesComptablesConfiguration = () => {
  const { societe_id } = useAuth();
  const [loading, setLoading] = useState(false);
  const [comptes, setComptes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompte, setEditingCompte] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadComptes();
  }, []);

  const loadComptes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/comptes-comptables/societe/${societe_id}`);
      
      if (response.data.success) {
        setComptes(response.data.comptes_comptables);
      }
    } catch (error) {
      console.error('Erreur chargement comptes:', error);
      message.error('Erreur lors du chargement des comptes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCompte(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (compte) => {
    setEditingCompte(compte);
    form.setFieldsValue({
      numero: compte.numero_compte,
      libelle: compte.libelle,
      description: compte.description,
      actif: compte.actif
    });
    setModalVisible(true);
  };

  const handlePersonnaliser = (compte) => {
    // Personnaliser un compte système
    setEditingCompte({ ...compte, is_personalization: true });
    form.setFieldsValue({
      numero: compte.numero_compte,
      libelle: compte.libelle,
      description: compte.description,
      actif: true
    });
    setModalVisible(true);
  };

  const handleDelete = async (compteId) => {
    try {
      // Pour l'instant, nous n'implémentons pas la suppression
      message.warning('Fonctionnalité de suppression non implémentée');
      // await axios.delete(`${import.meta.env.VITE_API_URL}/comptes-comptables/${compteId}`);
      // message.success('Compte supprimé avec succès');
      // await loadComptes();
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCompte && !editingCompte.is_personalization) {
        // Modification d'un compte existant (personnalisé)
        await axios.put(`${import.meta.env.VITE_API_URL}/comptes-comptables/${editingCompte.id}`, {
          numero_compte: values.numero,
          libelle: values.libelle,
          societeId: societe_id
        });
        message.success('Compte modifié avec succès');
      } else if (editingCompte && editingCompte.is_personalization) {
        // Personnalisation d'un compte système
        await axios.put(`${import.meta.env.VITE_API_URL}/comptes-comptables/${editingCompte.id}`, {
          numero_compte: values.numero,
          libelle: values.libelle,
          societeId: societe_id
        });
        message.success('Compte personnalisé avec succès');
      } else {
        // Nouveau compte
        await axios.post(`${import.meta.env.VITE_API_URL}/comptes-comptables`, {
          numero_compte: values.numero,
          libelle: values.libelle,
          societe_id: societe_id
        });
        message.success('Compte créé avec succès');
      }

      setModalVisible(false);
      await loadComptes();
    } catch (error) {
      console.error('Erreur sauvegarde compte:', error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingCompte(null);
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (_, record) => {
        if (record.is_system && !record.is_personalized) {
          return <Tag color="blue">Système</Tag>;
        } else if (record.is_personalized) {
          return <Tag color="orange">Personnalisé</Tag>;
        } else {
          return <Tag color="green">Ajouté</Tag>;
        }
      }
    },
    {
      title: 'Numéro',
      dataIndex: 'numero_compte',
      key: 'numero_compte',
      width: 120,
      render: (text) => <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>{text}</code>
    },
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      ellipsis: true
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#999', fontStyle: 'italic' }}>Aucune description</span>
    },
    {
      title: 'Statut',
      dataIndex: 'actif',
      key: 'actif',
      width: 100,
      render: (actif) => (
        <Tag color={actif ? 'success' : 'default'}>
          {actif ? 'Actif' : 'Inactif'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {record.is_system && !record.is_personalized ? (
            <Tooltip title="Personnaliser ce compte pour votre société">
              <Button
                type="primary"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handlePersonnaliser(record)}
              >
                Personnaliser
              </Button>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Modifier">
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              {!record.is_system && (
                <Popconfirm
                  title="Êtes-vous sûr de vouloir supprimer ce compte ?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Oui"
                  cancelText="Non"
                >
                  <Tooltip title="Supprimer">
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1f2937' }}>Comptes Comptables</h2>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
            Gérez les comptes comptables disponibles pour l'imputation des frais
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Ajouter un compte
        </Button>
      </div>

      <div style={{ backgroundColor: '#e0f2fe', border: '1px solid #b3e5fc', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0277bd' }}>💡 Information</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#01579b' }}>
          <li><strong>Comptes système</strong> : Disponibles par défaut, vous pouvez les personnaliser</li>
          <li><strong>Comptes personnalisés</strong> : Versions modifiées des comptes système pour votre société</li>
          <li><strong>Comptes ajoutés</strong> : Nouveaux comptes créés spécifiquement pour votre société</li>
          <li>Seuls les comptes <strong>actifs</strong> sont disponibles lors de la configuration des types de frais</li>
        </ul>
      </div>

      <Table
        columns={columns}
        dataSource={comptes}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} sur ${total} comptes`
        }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={
          editingCompte 
            ? editingCompte.is_personalization 
              ? "Personnaliser le compte système" 
              : "Modifier le compte comptable"
            : "Ajouter un nouveau compte comptable"
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="Sauvegarder"
        cancelText="Annuler"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            name="numero"
            label="Numéro de compte"
            rules={[
              { required: true, message: 'Le numéro de compte est requis' },
              { pattern: /^\d+$/, message: 'Le numéro doit contenir uniquement des chiffres' },
              { min: 3, message: 'Le numéro doit contenir au moins 3 chiffres' }
            ]}
          >
            <Input
              placeholder="Ex: 625100"
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            name="libelle"
            label="Libellé"
            rules={[
              { required: true, message: 'Le libellé est requis' },
              { min: 3, message: 'Le libellé doit contenir au moins 3 caractères' }
            ]}
          >
            <Input
              placeholder="Ex: Frais de déplacement"
              maxLength={255}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description (optionnelle)"
          >
            <Input.TextArea
              placeholder="Description détaillée du compte..."
              rows={3}
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="actif"
            label="Statut"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Actif"
              unCheckedChildren="Inactif"
            />
          </Form.Item>

          {editingCompte && editingCompte.is_personalization && (
            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px', padding: '12px', marginTop: '16px' }}>
              <p style={{ margin: 0, color: '#856404' }}>
                <strong>⚠️ Personnalisation :</strong> Vous créez une version personnalisée du compte système "{editingCompte.libelle}". 
                Cette version sera spécifique à votre société et remplacera le compte système dans vos sélections.
              </p>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ComptesComptablesConfiguration;