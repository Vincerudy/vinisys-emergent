import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import './css/MailFacturation.css';

const { Title } = Typography;

const EmailCustomizationPage = () => {
  const [form] = Form.useForm();
  
  const defaultInvoiceEmail = {
    subject: 'Votre Facture est Disponible',
    body: `Bonjour {{client_name}},\n\nVeuillez trouver ci-joint la facture n°{{invoice_number}} d'un montant de {{amount}}€.\n\nVous pouvez la régler via {{payment_link}}.\n\nMerci pour votre confiance.\n\nCordialement,\n{{company_name}}`,
  };

  const defaultReminderEmail = {
    subject: 'Rappel : Facture Impayée',
    body: `Bonjour {{client_name}},\n\nNous vous rappelons que la facture n°{{invoice_number}}, d’un montant de {{amount}}€, reste impayée malgré un délai dépassé de {{days_late}} jours.\n\nMerci de procéder au règlement dès que possible pour éviter toute pénalité.\n\nPour payer, cliquez ici : {{payment_link}}.\n\nCordialement,\n{{company_name}}`,
  };

  const [invoiceEmail, setInvoiceEmail] = useState(defaultInvoiceEmail);
  const [reminderEmail, setReminderEmail] = useState(defaultReminderEmail);

  const handleSave = () => {
    console.log('Email de Facture:', invoiceEmail);
    console.log('Email de Relance:', reminderEmail);
  };

  return (
    <div className="email-customization-page">
      <Button type="primary" onClick={handleSave}>Sauvegarder</Button>
      <Card 
        title="Personnalisation des mails "
        bordered={false} 
        className="ant-card-mail"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            invoiceSubject: defaultInvoiceEmail.subject,
            invoiceBody: defaultInvoiceEmail.body,
            reminderSubject: defaultReminderEmail.subject,
            reminderBody: defaultReminderEmail.body,
          }}
        >
          {/* Section Email Envoi Facture */}
          <div className="email-section">
            <Title level={4}>Mail d'envoi de factures</Title>
            <Form.Item label="Libellé" name="invoiceSubject">
              <Input
                value={invoiceEmail.subject}
                onChange={(e) => setInvoiceEmail({ ...invoiceEmail, subject: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Corps du Mail" name="invoiceBody">
              <Input.TextArea
                value={invoiceEmail.body}
                onChange={(e) => setInvoiceEmail({ ...invoiceEmail, body: e.target.value })}
                rows={6}
              />
            </Form.Item>
          </div>

          {/* Section Email Relance Facture */}
          <div className="email-section">
            <Title level={4}>Mail de relance pour facture impayée</Title>
            <Form.Item label="Libellé" name="reminderSubject">
              <Input
                value={reminderEmail.subject}
                onChange={(e) => setReminderEmail({ ...reminderEmail, subject: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Corps du Mail" name="reminderBody">
              <Input.TextArea
                value={reminderEmail.body}
                onChange={(e) => setReminderEmail({ ...reminderEmail, body: e.target.value })}
                rows={6}
              />
            </Form.Item>
          </div>

          {/* Bouton de Sauvegarde */}
 
        </Form>
      </Card>
    </div>
  );
};

export default EmailCustomizationPage;
