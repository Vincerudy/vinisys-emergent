import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Select, DatePicker, Switch, Tabs } from 'antd';
import moment from 'moment'; // Importation de moment.js
import './css/EmployeeForm.css'; // Fichier CSS externe pour le style personnalisé
import axios from 'axios';


const { Option } = Select;

const EmployeeForm = () => {
    const [form] = Form.useForm();
    const [newPhoto, setNewPhoto] = useState(null);
 

      // Fonction pour enregistrer les données de l'employé
      const handleSubmit = async (values) => {
        console.log('values ', values)
        try {
            const employeeData = {
                ...values,
            };
            const response = await axios.post('/employees', employeeData);
            console.log('Employé enregistré avec succès:', response.data);
            // Réinitialiser le formulaire ou afficher un message de succès ici
            form.resetFields();
            setNewPhoto(null);
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'employé:', error);
            // Gérer l'erreur (par exemple, afficher un message d'erreur)
        }
    };

  return (
              <Form form={form} layout="vertical"  onFinish={handleSubmit}>
                <h2 className='TitleNewEmployee'>Création de personnel</h2>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Genre" name="genre">
                      <Select>
                        <Option value="male">Masculin</Option>
                        <Option value="female">Féminin</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Prénom" name="firstName" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nom" name="lastName" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Date de naissance" name="birthDate">
                      <DatePicker value={form.getFieldValue('birthDate')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Adresse" name="address">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Code postal" name="zipCode">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Ville" name="city">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Téléphone" name="phone">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Email" name="email">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="N° sécurité sociale" name="socialSecurityNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nationalité" name="nationality">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Poste" name="poste">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Position" name="position">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Niveau" name="niveau">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Coefficient" name="coefficient">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Manager du salarié" name="manager">
                      <Select>
                        <Option value="manager1">Manager 1</Option>
                        <Option value="manager2">Manager 2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nombre d'heures/mois" name="hoursPerMonth">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nombre d'heures à tracker/jour" name="hoursPerDay">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Coût moyen horaire" name="hourlyRate">
                      <Input prefix="€" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Montant brut mensuel" name="monthlySalary">
                      <Input prefix="€" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Type de contrat" name="contractType">
                      <Select>
                        <Option value="CDI">CDI</Option>
                        <Option value="CDD">CDD</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Date d'entrée" name="entryDate">
                      <DatePicker value={form.getFieldValue('entryDate')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Date de sortie" name="exitDate">
                      <DatePicker value={form.getFieldValue('exitDate')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="IBAN" name="iban">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Salarié cadre" name="isExecutive" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Salarié associé" name="isPartner" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Temps partiel" name="isPartTime" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
 
              </Form>
 
  );
};

export default EmployeeForm;
