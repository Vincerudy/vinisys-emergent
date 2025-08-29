import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Tag,
  message,
  Select,
  Space,
  Row,
  Col,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/ListeTicketClient.css'; // Optionnel : CSS externe

const { Option } = Select;

const ListeTicketClient = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statutFilter, setStatutFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/liste/tickets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data.tickets || [];

      const mappedTickets = rawData.map((ticket) => ({
        id: ticket.id?.toString() || 'N/A',
        title: ticket.titre || 'Sans titre',
        motif: ticket.raison || 'Non précisé',
        statut: ticket.status || 'Inconnu',
      }));

      setTickets(mappedTickets);
      setFilteredTickets(mappedTickets);
    } catch (error) {
      message.error('Erreur lors de la récupération des tickets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    applyFilters(value, statutFilter);
  };

  const handleStatutFilterChange = (value) => {
    setStatutFilter(value);
    applyFilters(searchText, value);
  };

  const applyFilters = (search, statut) => {
    const lowerSearch = search.toLowerCase();

    const filtered = tickets.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(lowerSearch) ||
        t.title.toLowerCase().includes(lowerSearch);
      const matchesStatut = !statut || statut === 'Tous' || t.statut === statut;
      return matchesSearch && matchesStatut;
    });

    setFilteredTickets(filtered);
  };

  const handleCreateClick = () => {
    navigate('/listes/ticket');
  };

  const renderTitle = (title) => {
    if (typeof title !== 'string') return <span style={{ color: '#999' }}>Titre non défini</span>;

    const maxLength = 80;
    let displayTitle = title.toUpperCase();
    if (displayTitle.length > maxLength) {
      displayTitle = displayTitle.slice(0, maxLength) + '...';
    }
    return (
      <span style={{ color: '#18538e', fontWeight: 'bold' }}>
        {displayTitle}
      </span>
    );
  };

  const columns = [
    {
      title: 'N° Ticket',
      dataIndex: 'id',
      key: 'id',
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      render: renderTitle,
    },
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
      filters: [
        { text: 'Assistance', value: 'Assistance' },
        { text: 'Anomalie', value: 'Anomalie' },
      ],
      onFilter: (value, record) => record.motif === value,
      render: (motif) => {
        const color = motif === 'Anomalie' ? '#ff4d4f' : '#1890ff';
        return (
          <Tag color={color} style={{ color: 'white', fontWeight: 'bold' }}>
            {motif}
          </Tag>
        );
      },
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      filters: [
        { text: 'Tous', value: 'Tous' },
        { text: 'En attente', value: 'En attente' },
        { text: 'En cours', value: 'En cours' },
        { text: 'Terminé', value: 'Terminé' },
      ],
      onFilter: (value, record) => value === 'Tous' || record.statut === value,
      render: (statut) => (
        <Tag color={statut === 'En attente' ? 'blue' : statut === 'En cours' ? 'green' : 'red'}>
          {statut}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Gestion des tickets</h1>

      <Row gutter={[16, 16]} justify="space-between">
        <Col xs={24} sm={24} md={8}>
          <Input.Search
            placeholder="Rechercher par numéro ou titre"
            allowClear
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filtrer par statut"
            allowClear
            onChange={handleStatutFilterChange}
            value={statutFilter}
            style={{ width: '100%' }}
          >
            <Option value="Tous">Tous</Option>
            <Option value="En attente">En attente</Option>
            <Option value="En cours">En cours</Option>
            <Option value="Terminé">Terminé</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button
            type="primary"
            onClick={handleCreateClick}
            block
            style={{ width: '100%' }}
          >
            Créer un ticket
          </Button>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={filteredTickets}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          loading={loading}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            onClick: () => navigate(`/listes/ticket/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </div>
    </div>
  );
};

export default ListeTicketClient;
