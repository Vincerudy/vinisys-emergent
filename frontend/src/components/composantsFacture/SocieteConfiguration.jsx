import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Upload, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import './css/SocieteConfiguration.css';
import { useAuth } from '../../contexte/AuthContext';

const { Option } = Select;

const fetchDataSociete = async (id) => {
  try {
    const sociData = await axios.get(`${import.meta.env.VITE_API_URL}/societes/affichage/${id}`);
    return sociData.data;
  } catch (error) {
    console.error('Erreur lors du fetch des données société :', error);
  }
};

const SocieteConfiguration = () => {
  const { id } = useAuth();
  const [form] = Form.useForm();
  const [sociData, setSociData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const recupereData = async () => {
    const data = await fetchDataSociete(id);
    setSociData(data);
  };

  useEffect(() => {
    recupereData();
  }, []);

  useEffect(() => {
    if (sociData) {
      form.setFieldsValue({
        raisonSociale: sociData.raisonSociale,
        adresse: sociData.adresse,
        ville: sociData.ville,
        codePostal: sociData.codePostal,
        pays: sociData.pays,
        telephone: sociData.telephone,
        email: sociData.email,
        siret: sociData.siret,
        tva: sociData.tva,
        monnaie: sociData.monnaie,
        langue: sociData.langue,
      });

      // Affiche le logo s'il est déjà enregistré
      if (sociData.logo) {
        setLogoPreview(`${import.meta.env.VITE_API_URL}${sociData.logo}`);
      }
    }
  }, [sociData]);

  const handleLogoChange = (info) => {
    const file = info.file;

    const isValidImage = file.type === 'image/jpeg' || file.type === 'image/png';
    const isBelowSizeLimit = file.size / 1024 / 1024 < 2;

    if (!isValidImage) {
      message.error('Vous ne pouvez télécharger que des fichiers JPG/PNG!');
      return;
    }

    if (!isBelowSizeLimit) {
      message.error('Le fichier doit être inférieur à 2MB!');
      return;
    }

    // Lire le fichier en base64 pour l'afficher immédiatement
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result); // Affiche l’image en base64
    };
    reader.readAsDataURL(file);

    setLogoFile(file); // Conserve le fichier pour l’envoi backend
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      formData.append(key, values[key]);
    });

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/societes/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success('Informations de la société mises à jour avec succès !');
    } catch (error) {
      message.error('Une erreur est survenue lors de la mise à jour des données.');
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="societe-configuration">
      <h2>Configuration de la Société </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="blocConfiguration"
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Logo de la Société" name="logo"   valuePropName="fileList" getValueFromEvent={({ fileList }) => fileList}>
              <Upload
                beforeUpload={() => false}
                onChange={handleLogoChange}
                showUploadList={false}
                accept=".png,.jpg,.jpeg"
              >
                <Button icon={<PlusOutlined />}>Télécharger le logo</Button>
              </Upload>
            </Form.Item>

            {logoPreview && (
              <div className="logo-preview">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '10px' }}
                />
              </div>
            )}
          </Col>

          <Col span={18}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Raison Sociale" name="raisonSociale" rules={[{ required: true }]}>
                  <Input placeholder="Raison Sociale" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Numéro NIF / SIRET" name="siret" rules={[{ required: true }]}>
                  <Input placeholder="Numéro NIF / SIRET" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Adresse" name="adresse" rules={[{ required: true }]}>
                  <Input placeholder="Adresse" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Code Postal" name="codePostal" rules={[{ required: true }]}>
                  <Input placeholder="Code Postal" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Ville" name="ville" rules={[{ required: true }]}>
                  <Input placeholder="Ville" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Téléphone" name="telephone" rules={[{ required: true }]}>
                  <Input placeholder="Téléphone" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true }, { type: 'email', message: 'Email invalide' }]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Pays" name="pays" rules={[{ required: true }]}>
                  <Input placeholder="Pays" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Numéro de TVA / TPS" name="tva" rules={[{ required: true }]}>
                  <Input placeholder="Numéro de TVA" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Monnaie" name="monnaie" rules={[{ required: true }]}>
                  <Select placeholder="Sélectionner la monnaie">
                    <Option value="€">EUR (€)</Option>
                    <Option value="$">USD ($)</Option>
                    <Option value="£">GBP (£)</Option>
                    <Option value="CFA">FCFA (CFA)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Langue" name="langue" rules={[{ required: true }]}>
                  <Select placeholder="Sélectionner la langue">
                    <Option value="fr">Français</Option>
                    <Option value="en">Anglais</Option>
                    <Option value="es">Espagnol</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit">Enregistrer</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SocieteConfiguration;
