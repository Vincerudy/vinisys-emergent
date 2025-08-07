import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import './css/ComptabilitePage.css'; // Import du fichier CSS
import DashboardLayout from './composants/DashboardLayout';

const { Option } = Select;
const { TabPane } = Tabs;

// Données fictives
const fakeTransactions = [
  { id: '1', date: '2024-09-01', description: 'Vente Produit A', amount: 150.00, type: 'Income' },
  { id: '2', date: '2024-09-05', description: 'Achat Fourniture B', amount: -200.00, type: 'Expense' },
  { id: '3', date: '2024-09-10', description: 'Vente Produit C', amount: 300.00, type: 'Income' },
  { id: '4', date: '2024-09-15', description: 'Achat Fourniture D', amount: -100.00, type: 'Expense' },
];

const fakeInvoices = [
  { id: '1', date: '2024-09-01', amount: 150.00 },
  { id: '2', date: '2024-09-05', amount: 200.00 },
  { id: '3', date: '2024-09-10', amount: 300.00 },
  { id: '4', date: '2024-09-15', amount: 420.00 },
];

const fakeBudgets = [
  { category: 'Marketing', amount: 5000.00, spent: 2000.00 },
  { category: 'Salaries', amount: 10000.00, spent: 7000.00 },
  { category: 'Supplies', amount: 2000.00, spent: 1500.00 },
  { category: 'Miscellaneous', amount: 1500.00, spent: 1000.00 },
];

const fakeReports = [
  { name: 'Revenus', value: 2000.00 },
  { name: 'Dépenses', value: 1500.00 },
  { name: 'Bénéfice', value: 500.00 },
];

const fakeVAT = [
  { month: 'Jan', amount: 120.00 },
  { month: 'Feb', amount: 150.00 },
  { month: 'Mar', amount: 180.00 },
  { month: 'Apr', amount: 200.00 },
];

const fakeExpenses = [
  { month: 'Jan', amount: 500.00 },
  { month: 'Feb', amount: 600.00 },
  { month: 'Mar', amount: 550.00 },
  { month: 'Apr', amount: 650.00 },
];

const ComptabilitePage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      setModalVisible(false);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <DashboardLayout> 
    <div className="comptabilite-container">
      <h1 className="page-title">Comptabilité</h1>
      <Tabs defaultActiveKey="transactions">
        <TabPane tab="Transactions" key="transactions">
          <Button type="primary" onClick={handleAdd} className="create-button" icon={<PlusOutlined />}>Ajouter une Transaction</Button>
          <Table columns={[
            { title: 'Date', dataIndex: 'date', key: 'date' },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            { title: 'Montant', dataIndex: 'amount', key: 'amount' },
            { title: 'Type', dataIndex: 'type', key: 'type' },
          ]} dataSource={fakeTransactions} rowKey="id" className="transaction-table" />
          <LineChart width={600} height={300} data={fakeTransactions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </TabPane>

        <TabPane tab="Factures et Paiements" key="invoices">
          <Button type="primary" onClick={handleAdd} className="create-button" icon={<PlusOutlined />}>Ajouter une Facture</Button>
          <Table columns={[
            { title: 'Date', dataIndex: 'date', key: 'date' },
            { title: 'Montant', dataIndex: 'amount', key: 'amount' },
          ]} dataSource={fakeInvoices} rowKey="id" className="invoice-table" />
          <BarChart width={600} height={300} data={fakeInvoices}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#82ca9d" />
          </BarChart>
        </TabPane>

        <TabPane tab="Budgets" key="budgets">
          <Table columns={[
            { title: 'Catégorie', dataIndex: 'category', key: 'category' },
            { title: 'Montant Prévu', dataIndex: 'amount', key: 'amount' },
            { title: 'Dépenses Réelles', dataIndex: 'spent', key: 'spent' },
          ]} dataSource={fakeBudgets} rowKey="category" className="budget-table" />
          <LineChart width={600} height={300} data={fakeBudgets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Montant Prévu" />
            <Line type="monotone" dataKey="spent" stroke="#82ca9d" name="Dépenses Réelles" />
          </LineChart>
        </TabPane>

        <TabPane tab="Rapports Financiers" key="reports">
          <Table columns={[
            { title: 'Nom', dataIndex: 'name', key: 'name' },
            { title: 'Valeur', dataIndex: 'value', key: 'value' },
          ]} dataSource={fakeReports} rowKey="name" className="report-table" />
          <BarChart width={600} height={300} data={fakeReports}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </TabPane>

        <TabPane tab="TVA" key="vat">
          <Table columns={[
            { title: 'Mois', dataIndex: 'month', key: 'month' },
            { title: 'Montant TVA', dataIndex: 'amount', key: 'amount' },
          ]} dataSource={fakeVAT} rowKey="month" className="vat-table" />
          <LineChart width={600} height={300} data={fakeVAT}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </TabPane>

        <TabPane tab="Dépenses" key="expenses">
          <Table columns={[
            { title: 'Mois', dataIndex: 'month', key: 'month' },
            { title: 'Montant', dataIndex: 'amount', key: 'amount' },
          ]} dataSource={fakeExpenses} rowKey="month" className="expenses-table" />
          <BarChart width={600} height={300} data={fakeExpenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#82ca9d" />
          </BarChart>
        </TabPane>
      </Tabs>

      <Modal title="Ajouter une Nouvelle Entrée" visible={modalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Veuillez entrer une description!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Montant" rules={[{ required: true, message: 'Veuillez entrer le montant!' }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Veuillez sélectionner une date!' }]}>
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </DashboardLayout>
  );
};

export default ComptabilitePage;
