import React, { useState, useEffect } from 'react';
import { Switch, Input, InputNumber, Card, Button, Form, message, Select, Divider } from 'antd';
import axios from 'axios';
import './css/ParametrageFacturationGeneral.css';
import { useAuth } from '../../contexte/AuthContext';

const { TextArea } = Input;
const { Option } = Select;

const ParametrageFacturationGeneral = () => {
  const { id, societe_id } = useAuth();
  const [settings, setSettings] = useState({
    enableQuotes: true,
    enableInvoices: true,
    enableTTC: true,
    enableMultipleTVA: false,
    enableRecette: true,
    enableAutoReminders: false,
    enableApprovalMention: false,
    vatRate: 20,
    vatLabel: 'TVA',
    paymentDelay: 30,
    salesConditions: '',
    showHeaderNotes: false,
    headerNotes: '',
    showSalesConditions: false,
    stockDeductionTrigger: 'quote_accepted',
    societe_id,
    id,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/parametrage-facturation/${id}`);
        if (response.status === 200) {
          const data = response.data.data;
          const normalizeBool = (val) => val === 1 || val === '1' || val === true;

          setSettings((prev) => ({
            ...prev,
            ...data,
            enableQuotes: normalizeBool(data.enableQuotes),
            enableInvoices: normalizeBool(data.enableInvoices),
            enableTTC: normalizeBool(data.enableTTC),
            enableMultipleTVA: normalizeBool(data.enableMultipleTVA),
            enableRecette: normalizeBool(data.enableRecette),
            enableAutoReminders: normalizeBool(data.enableAutoReminders),
            enableApprovalMention: normalizeBool(data.enableApprovalMention),
            showHeaderNotes: normalizeBool(data.showHeaderNotes),
            showSalesConditions: normalizeBool(data.showSalesConditions),
          }));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres :', error);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [id]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const toSend = {
      ...settings,
      enableQuotes: settings.enableQuotes ? 1 : 0,
      enableInvoices: settings.enableInvoices ? 1 : 0,
      enableTTC: settings.enableTTC ? 1 : 0,
      enableMultipleTVA: settings.enableMultipleTVA ? 1 : 0,
      enableRecette: settings.enableRecette ? 1 : 0,
      enableAutoReminders: settings.enableAutoReminders ? 1 : 0,
      enableApprovalMention: settings.enableApprovalMention ? 1 : 0,
      showHeaderNotes: settings.showHeaderNotes ? 1 : 0,
      showSalesConditions: settings.showSalesConditions ? 1 : 0,
    };

    console.log('toSend ', toSend)

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/parametragecreation`, toSend);
      message.success('Informations mises à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde :', error);
      message.error('Erreur lors de la sauvegarde.');
    }
  };

  return (
    <div className="card-containerParametrage">
      <Button type="primary" style={{ backgroundColor: '#3454d1', padding: '10px' }} onClick={handleSave}>
        Sauvegarder
      </Button>

      <Card title="Paramétrage général du module" className="ant-card-para">
        <Form layout="horizontal" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>

          <Divider className="full-width-divider" orientation="center">  <span className='textDivider'>Documents</span></Divider>

          <Form.Item label="Activer la saisie des devis">
            <Switch checked={settings.enableQuotes} onChange={(checked) => handleChange('enableQuotes', checked)} />
          </Form.Item>

          <Form.Item label="Activer la saisie des factures">
            <Switch checked={settings.enableInvoices} onChange={(checked) => handleChange('enableInvoices', checked)} />
          </Form.Item>

          <Form.Item label="Saisir les prix en TTC">
            <Switch checked={settings.enableTTC} onChange={(checked) => handleChange('enableTTC', checked)} />
          </Form.Item>

          <Form.Item label="Activer le détail des TVA">
            <Switch checked={settings.enableMultipleTVA} onChange={(checked) => handleChange('enableMultipleTVA', checked)} />
          </Form.Item>

          <Form.Item label="Activer le cahier de recette">
            <Switch checked={settings.enableRecette} onChange={(checked) => handleChange('enableRecette', checked)} />
          </Form.Item>

          <Divider className="full-width-divider" orientation="center">  <span className='textDivider'>Paiement & Relances</span></Divider>

          <Form.Item label="Délai de paiement (en jours)">
            <InputNumber min={1} value={settings.paymentDelay} onChange={(value) => handleChange('paymentDelay', value)} />
          </Form.Item>

          <Form.Item label="Activer les relances automatiques">
            <Switch checked={settings.enableAutoReminders} onChange={(checked) => handleChange('enableAutoReminders', checked)} />
          </Form.Item>

          <Divider className="full-width-divider" orientation="center">  <span className='textDivider'>Mentions & Conditions</span></Divider>

          <Form.Item label="'Bon pour accord' sur les devis">
            <Switch checked={settings.enableApprovalMention} onChange={(checked) => handleChange('enableApprovalMention', checked)} />
          </Form.Item>

          <Form.Item label="Afficher les mentions légales">
            <Switch checked={settings.showHeaderNotes} onChange={(checked) => handleChange('showHeaderNotes', checked)} />
          </Form.Item>

          {settings.showHeaderNotes && (
            <Form.Item label="Mentions légales">
              <TextArea rows={4} value={settings.headerNotes} onChange={(e) => handleChange('headerNotes', e.target.value)} />
            </Form.Item>
          )}

          <Form.Item label="Afficher les conditions de vente">
            <Switch checked={settings.showSalesConditions} onChange={(checked) => handleChange('showSalesConditions', checked)} />
          </Form.Item>

          {settings.showSalesConditions && (
            <Form.Item label="Conditions de vente">
              <TextArea rows={4} value={settings.salesConditions} onChange={(e) => handleChange('salesConditions', e.target.value)} />
            </Form.Item>
          )}

          <Divider className="full-width-divider" orientation="center"><span className='textDivider'>Stock</span> </Divider>

          <Form.Item label="Décompte les produits du stock :">
            <Select
              value={settings.stockDeductionTrigger}
              onChange={(value) => handleChange('stockDeductionTrigger', value)}
            >
              <Option value="quote_accepted">Lors de l’acceptation du devis</Option>
              <Option value="invoice_created">Lors de la transformation du devis en facture</Option>
              <Option value="invoice_paid">Lors du paiement de la facture</Option>
            </Select>
          </Form.Item>

        </Form>
      </Card>
      <Button type="primary" style={{ backgroundColor: '#3454d1', padding: '10px' }} onClick={handleSave}>
        Sauvegarder
      </Button>

    </div>
  );
};

export default ParametrageFacturationGeneral;
