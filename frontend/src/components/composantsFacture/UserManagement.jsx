import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Upload, message, Select, DatePicker, Spin, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './css/UserManagement.css';
import { useAuth } from '../../contexte/AuthContext';
import { hasPermission } from '../../contexte/permissions';

const { Option, OptGroup } = Select;

const groupedPermissionsList = [
  {
    groupName: 'Factures',
    permissions: [
      { value: 'view_invoices', label: 'Voir les factures' },
      { value: 'create_invoices', label: 'Créer des factures' },
      { value: 'manage_invoices', label: 'Gérer les factures (En attente, payée...)' },
      { value: 'manage_invoice_param', label: 'Voir et gérer les paramétrage des devis et facture' },
    ],
  },
  {
    groupName: 'Devis',
    permissions: [
      { value: 'view_quotes', label: 'Voir les devis' },
      { value: 'manage_quotes', label: 'Gérer les devis (création modification)' },
    ],
  },
  {
    groupName: 'Recette',
    permissions: [
      { value: 'view_recette_page', label: 'Voir le cahier de recette' },
    ],
  },
  {
    groupName: 'Clients',
    permissions: [
      { value: 'view_clients', label: 'Voir les clients' },
      { value: 'manage_clients', label: 'Gérer les clients' },
    ],
  },
  {
    groupName: 'Utilisateurs',
    permissions: [
      { value: 'view_users', label: 'Voir les utilisateurs' },
      { value: 'manage_users', label: 'Gérer les utilisateurs' },
    ],
  },
  {
    groupName: 'Rapports',
    permissions: [
      { value: 'access_reports', label: 'Accéder aux rapports' },
    ],
  },
  {
    groupName: 'Paramétrage Société',
    permissions: [
      { value: 'user_admin_full_acces_control', label: 'Attribuer tous les droits (Admin)' },
      { value: 'campany_setting', label: 'Accès aux paramétrage de la société (Paramétrage seul)' },
    ],
  },
  {
    groupName: 'Stock & Inventaire',
    permissions: [
      { value: 'view_stock', label: 'Voir le stock' },
      { value: 'manage_stock', label: 'Gérer le stock' },
      { value: 'create_product', label: 'Créer des produits' },
      { value: 'manage_inventory', label: "Gérer l'inventaire manuel" },
      { value: 'validate_inventory', label: "Valider l'inventaire manuel (conformité)" },
    ],
  },
];

const UserManagement = () => {
  const { user_id } = useParams();
  const { id, societe_id, token } = useAuth();
  const [form] = Form.useForm();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user_id) return;
      setIsEditMode(true);
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${user_id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true,
        });
        const userData = response.data;
        const formValues = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          password: '',
          role_id: 1,
          birthDate: userData.birthDate ? moment(userData.birthDate, 'YYYY-MM-DD') : null,
          companyName: userData.companyName || '',
          companyAddress: userData.companyAddress || '',
          workPhone: userData.workPhone || '',
          personalPhone: userData.personalPhone || '',
          permissions: Array.isArray(userData.permissions) ? userData.permissions : [],
        };
        form.setFieldsValue(formValues);
        if (userData.photoProfil) {
          setPhotoPreview(`${import.meta.env.VITE_API_URL}${userData.photoProfil}`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l’utilisateur:', error);
        message.error('Impossible de charger les données de l’utilisateur');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user_id, form]);

  const handlePhotoChange = ({ file }) => {
    const isValidImage = file.type === 'image/jpeg' || file.type === 'image/png';
    const isBelowSizeLimit = file.size / 1024 / 1024 < 2;
    if (!isValidImage) {
      message.error('Vous ne pouvez télécharger que des fichiers JPG/PNG !');
      return;
    }
    if (!isBelowSizeLimit) {
      message.error('Le fichier doit être inférieur à 2MB !');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('email', values.email);
    if (!isEditMode || values.password) {
      formData.append('password', values.password);
    }
    formData.append('role_id', values.role_id);
    formData.append('birthDate', values.birthDate ? values.birthDate.format('YYYY-MM-DD') : '');
    formData.append('companyName', values.companyName || '');
    formData.append('companyAddress', values.companyAddress || '');
    formData.append('workPhone', values.workPhone || '');
    formData.append('personalPhone', values.personalPhone || '');
    formData.append('societe_id', societe_id);
    formData.append('auto_modi', hasPermission('manage_users') && id != user_id ? 'YES' : 'NO');
    values.permissions?.forEach(permission => {
      formData.append('permissions[]', permission);
    });
    if (photoFile) {
      formData.append('photoProfil', photoFile);
    }

    try {
      if (isEditMode) {
        await axios.post(`${import.meta.env.VITE_API_URL}/users/${user_id}/update`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        Modal.success({
          title: 'Succès',
          content: "Utilisateur mis à jour avec succès !",
          onOk() {
            hasPermission('view_users') ? navigate('/societe/roles') : navigate('/home');
          },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/users/create`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        Modal.success({
          title: 'Succès',
          content: "Utilisateur créé avec succès !",
          onOk() {
            hasPermission('view_users') ? navigate('/societe/roles') : navigate('/home');
          },
        });
        form.resetFields();
        setPhotoFile(null);
        setPhotoPreview(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de la soumission du formulaire.';
      message.error(errorMsg);
    }
  };

  return (
    <div className="societe-configuration">
      <h2>{isEditMode ? 'Modifier l’utilisateur' : 'Créer un utilisateur'}</h2>
      {loading ? (
        <Spin tip="Chargement..." />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="blocConfiguration"
        >
          <Row gutter={24}>
            <Col xs={24} sm={6}>
              <Form.Item label="Photo de profil">
                <Upload
                  beforeUpload={() => false}
                  onChange={handlePhotoChange}
                  showUploadList={false}
                  accept=".png,.jpg,.jpeg"
                >
                  <Button icon={<PlusOutlined />}>Télécharger la photo</Button>
                </Upload>
                {photoPreview && (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Aperçu" />
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={18}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Prénom" name="firstName" rules={[{ required: true, message: 'Veuillez saisir le prénom' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Nom" name="lastName" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Veuillez saisir un email' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Mot de passe" name="password" rules={isEditMode ? [] : [{ required: true, message: 'Veuillez définir un mot de passe' }]}>
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Date de naissance" name="birthDate">
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Téléphone pro" name="workPhone">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Téléphone perso" name="personalPhone">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Adresse de l'établissement" name="companyAddress">
                <Input />
              </Form.Item>
              <Form.Item label="Nom entreprise" name="companyName">
                <Input />
              </Form.Item>
              <Form.Item label="Droits & Permissions" name="permissions">
                <Select mode="multiple" placeholder="Sélectionner des droits">
                  {groupedPermissionsList.map(group => (
                    <OptGroup key={group.groupName} label={group.groupName}>
                      {group.permissions.map(perm => (
                        <Option key={perm.value} value={perm.value}>{perm.label}</Option>
                      ))}
                    </OptGroup>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {isEditMode ? 'Modifier' : 'Créer'}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  );
};

export default UserManagement;
