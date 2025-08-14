import React, { useState, useEffect } from 'react';
import { Card, Table, Statistic, Row, Col, Tag, DatePicker } from 'antd';
import { DollarOutlined, UsergroupAddOutlined, MessageOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import './css/AdminDashboard.css';
import { useNavigate } from 'react-router-dom'; 

dayjs.locale('fr');

const AdminDashboard = () => {
  const navigate = useNavigate(); 
  const [societes, setSocietes] = useState([]);
  const [caMensuel, setCaMensuel] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [evolutionMensuelle, setEvolutionMensuelle] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRange, setSelectedRange] = useState([
    dayjs().subtract(5, 'month'),
    dayjs()
  ]);

  // Appel de l'API pour récupérer les sociétés
  const fetchSocietes = async () => {
    try {
      const response = await fetch('/api/societes/inscription'); // adapte l'URL si besoin
      const data = await response.json();

      const mappedSocietes = data.map(s => ({
        id: s.id,
        nom: s.nom,
        dateInscription: dayjs(s.date_inscription).format('YYYY-MM-DD'),
        statut: s.statut === 'active' ? 'Active' : 'Inactive'
      }));

      setSocietes(mappedSocietes);
    } catch (error) {
      console.error('Erreur lors de la récupération des sociétés :', error);
    }
  };

  useEffect(() => {
    fetchSocietes();

    // Tu peux aussi remplacer ces valeurs factices par des appels d'API si dispo
    const fakeCA = 76300.25;
    const fakeTickets = 38;
    const fakeEvolution = [
      { mois: 'Jan', chiffreAffaire: 45000, date: dayjs('2025-01-01') },
      { mois: 'Fév', chiffreAffaire: 48000, date: dayjs('2025-02-01') },
      { mois: 'Mar', chiffreAffaire: 52000, date: dayjs('2025-03-01') },
      { mois: 'Avr', chiffreAffaire: 60000, date: dayjs('2025-04-01') },
      { mois: 'Mai', chiffreAffaire: 69000, date: dayjs('2025-05-01') },
      { mois: 'Juin', chiffreAffaire: 76300, date: dayjs('2025-06-01') },
    ];

    setCaMensuel(fakeCA);
    setTickets(fakeTickets);
    setEvolutionMensuelle(fakeEvolution);
  }, []);

  useEffect(() => {
    if (!selectedRange || selectedRange.length !== 2) return;

    const [start, end] = selectedRange;
    const filtered = evolutionMensuelle.filter(entry =>
      dayjs(entry.date).isAfter(start.startOf('month').subtract(1, 'day')) &&
      dayjs(entry.date).isBefore(end.endOf('month').add(1, 'day'))
    );
    setFilteredData(filtered);
  }, [selectedRange, evolutionMensuelle]);

  const handleRangeChange = (range) => {
    if (range) {
      setSelectedRange(range);
    }
  };

  const columns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Date d\'inscription', dataIndex: 'dateInscription', key: 'dateInscription' },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: statut => (
        <Tag color={statut === 'Active' ? 'green' : 'red'}>{statut}</Tag>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tableau de bord administratif</h1>

      <Row gutter={[16, 16]} className="dashboard-cards">
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Chiffre d'affaires mensuel"
              value={caMensuel}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="€"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Sociétés actives"
              value={societes.filter(s => s.statut === 'Active').length}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Tickets reçus"
              value={tickets}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={14}>
          <Card
            title="Évolution du chiffre d’affaires"
            extra={
              <DatePicker.RangePicker
                picker="month"
                value={selectedRange}
                onChange={handleRangeChange}
                allowClear={false}
              />
            }
            style={{ height: '350px' }}
            bodyStyle={{ height: 'calc(100% - 56px)', padding: '16px' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="chiffreAffaire" stroke="#18538e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card
            title="Dernières sociétés inscrites"
            style={{ height: '350px' }}
            bodyStyle={{ height: 'calc(100% - 56px)', padding: '16px', overflowY: 'auto' }}
          >
            <Table
              dataSource={societes}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
              onRow={(record) => ({
                onClick: () => navigate(`/admin/societe/parametrage/${record.id}`),
                style: { cursor: 'pointer' }
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
