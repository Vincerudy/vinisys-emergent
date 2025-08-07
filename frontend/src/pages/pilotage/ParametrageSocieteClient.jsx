import React, { useState, useEffect } from 'react';
import { Card, Form, Switch, InputNumber, Divider, Button, Row, Col, Modal } from 'antd';
import './css/ParametrageSocieteClient.css';
import { useAuth } from '../../contexte/AuthContext';
import logo from '../../assets/logo.png'; // ✅ Vérifiez le chemin
import axios from 'axios'; 
import { useParams } from 'react-router-dom';

const ParametrageSocieteClient = () => {
  const { societe_id } = useParams();
  const { id } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [logoPath, setLogoPath] = useState(null);
  const [settings, setSettings] = useState({
    enableFacturation: false,
    enableRecette: false,
    enableMailing: false,
    enableRelancesAuto: false,

    enableStock: false,
    enableImportProduitsServices: false,
    enableMouvementsStock: false,
    enableInventaireManuel: false,
    enableInventaireAuto: false,

    enableUserInput: false,
    enableUserLimit: false,
    userLimit: 5,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/options-societe/${societe_id}`);

        if (response.status === 200) {
          setCompanyName(response.data.companyName);
          setLogoPath(response.data.logoPath)
          setSettings({
            enableFacturation: response.data.enable_facturation,
            enableRecette: response.data.enable_recette,
            enableMailing: response.data.enable_mailing,
            enableRelancesAuto: response.data.enable_relances_auto,
            enableStock: response.data.enable_stock,
            enableImportProduitsServices: response.data.enable_import_produits_services,
            enableMouvementsStock: response.data.enable_mouvements_stock,
            enableInventaireManuel: response.data.enable_inventaire_manuel,
            enableInventaireAuto: response.data.enable_inventaire_auto,
            enableUserInput: response.data.enable_user_input,
            enableUserLimit: response.data.enable_user_limit,
            userLimit: response.data.user_limit
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options :", error);
      }
    };
  
    fetchOptions();
  }, [societe_id]);

  const handleSave = async () => {
    try {
      const payload = {
        enable_facturation: settings.enableFacturation,
        enable_recette: settings.enableRecette,
        enable_mailing: settings.enableMailing,
        enable_relances_auto: settings.enableRelancesAuto,
        enable_stock: settings.enableStock,
        enable_import_produits_services: settings.enableImportProduitsServices,
        enable_mouvements_stock: settings.enableMouvementsStock,
        enable_inventaire_manuel: settings.enableInventaireManuel,
        enable_inventaire_auto: settings.enableInventaireAuto,
        enable_user_input: settings.enableUserInput,
        enable_user_limit: settings.enableUserLimit,
        user_limit: settings.enableUserLimit ? settings.userLimit : 0,
      };
  
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/options-societe/${societe_id}`, payload);
  
      if (response.status === 200 || response.status === 201) {
        Modal.success({
          title: 'Succès',
          content: 'Les paramètres ont été enregistrés avec succès.',
        });
      }
    } catch (error) {
      console.error('Erreur lors de l’enregistrement des paramètres :', error);
      Modal.error({
        title: 'Erreur',
        content: "Une erreur s'est produite lors de l'enregistrement des paramètres.",
      });
    }
  };

  return (
    <div className="parametrage-societe-container">
      <div className="header-societe">
      <Row align="middle" justify="center" gutter={16} style={{ flexDirection: 'column', marginBottom: 15 }}>
  {logoPath && (
    <Col>
      <img 
        src={import.meta.env.VITE_API_URL + '/' + logoPath} 
        alt="Logo Société" 
        style={{ height: 50, marginBottom: 8 }} 
      />
    </Col>
  )}
  <Col>
    <h1 className="page-title" style={{ margin: 0 }}>{companyName}</h1>
  </Col>
</Row>

      </div>

      <Card className="parametrage-card">
        <Form layout="horizontal" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
          {/* --- Module Facturation --- */}
          <Divider orientation="left"><span className="textDivider">Module Facturation</span></Divider>
          <p className="sub-title">Paramétrez les fonctionnalités liées à la facturation de vos clients.</p>

          <Form.Item label="Activer la facturation">
            <Switch checked={settings.enableFacturation} onChange={(v) => handleChange('enableFacturation', v)} />
          </Form.Item>

          {settings.enableFacturation && (
            <>
              <Form.Item label="Activer le cahier de recette">
                <Switch checked={settings.enableRecette} onChange={(v) => handleChange('enableRecette', v)} />
              </Form.Item>

              <Form.Item label="Activer l’envoi des mails">
                <Switch checked={settings.enableMailing} onChange={(v) => handleChange('enableMailing', v)} />
              </Form.Item>

              <Form.Item label="Activer les relances automatiques">
                <Switch checked={settings.enableRelancesAuto} onChange={(v) => handleChange('enableRelancesAuto', v)} />
              </Form.Item>
            </>
          )}

          {/* --- Gestion de stock --- */}
          <Divider orientation="left"><span className="textDivider">Gestion de stock</span></Divider>
          <p className="sub-title">Options de suivi, d’importation et d’inventaire de vos produits et services.</p>

          <Form.Item label="Activer la gestion de stock">
            <Switch checked={settings.enableStock} onChange={(v) => handleChange('enableStock', v)} />
          </Form.Item>

          {settings.enableStock && (
            <>
              <Form.Item label="Activer les imports produits et services">
                <Switch checked={settings.enableImportProduitsServices} onChange={(v) => handleChange('enableImportProduitsServices', v)} />
              </Form.Item>

              <Form.Item label="Activer les mouvements de stock">
                <Switch checked={settings.enableMouvementsStock} onChange={(v) => handleChange('enableMouvementsStock', v)} />
              </Form.Item>

              <Form.Item label="Activer les inventaires manuels">
                <Switch checked={settings.enableInventaireManuel} onChange={(v) => handleChange('enableInventaireManuel', v)} />
              </Form.Item>

              <Form.Item label="Activer les inventaires automatiques">
                <Switch checked={settings.enableInventaireAuto} onChange={(v) => handleChange('enableInventaireAuto', v)} />
              </Form.Item>
            </>
          )}

          {/* --- Gestion Société (saisie utilisateurs) --- */}
          <Divider orientation="left"><span className="textDivider">Gestion Société</span></Divider>
          <p className="sub-title">Définissez les règles de saisie et le nombre d’utilisateurs autorisés dans la société.</p>

          <Form.Item label="Autoriser la saisie des utilisateurs">
            <Switch checked={settings.enableUserInput} onChange={(v) => handleChange('enableUserInput', v)} />
          </Form.Item>

          {settings.enableUserInput && (
            <>
              <Form.Item label="Activer la limitation du nombre d’utilisateurs">
                <Switch checked={settings.enableUserLimit} onChange={(v) => handleChange('enableUserLimit', v)} />
              </Form.Item>

              {settings.enableUserLimit && (
                <Form.Item label="Nombre d’utilisateurs autorisés">
                  <InputNumber min={1} value={settings.userLimit} onChange={(v) => handleChange('userLimit', v)} />
                </Form.Item>
              )}
            </>
          )}
        </Form>

        <div style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={handleSave} style={{ marginTop: '20px' }}>
            Sauvegarder
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ParametrageSocieteClient;
