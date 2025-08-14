import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexte/AuthContext';

const ListeTicketsMaintenance = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction pour récupérer les tickets via l'API
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/liste/tickets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data.tickets || [];

      // Mapper proprement les données et fournir des valeurs par défaut
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
    const lowerValue = value.toLowerCase();
    const filtered = tickets.filter((t) =>
      (t.id && t.id.toLowerCase().includes(lowerValue)) ||
      (t.title && t.title.toLowerCase().includes(lowerValue))
    );
    setFilteredTickets(filtered);
  };

  const handleCreateClick = () => {
    navigate('/admin/tickets');
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
    { title: 'Numéro du ticket', dataIndex: 'id', key: 'id' },
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
            <Tag
              color={color}
              style={{
                color: 'white',
                fontWeight: 'bold',
              }}
            >
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
        { text: 'En attente', value: 'En attente' },
        { text: 'En cours', value: 'En cours' },
        { text: 'Terminé', value: 'Terminé' },
      ],
      onFilter: (value, record) => record.statut === value,
      render: (statut) => (
        <Tag color={statut === 'En attente' ? 'blue' : statut === 'En cours' ? 'green': 'red'}>{statut}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>Gestion des tickets</h1>

      <Input.Search
        placeholder="Rechercher par numéro ou titre"
        allowClear
        onSearch={handleSearch}
        style={{ width: 300, marginBottom: 16 }}
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <Button
        type="primary"
        onClick={handleCreateClick}
        style={{ float: 'right', marginBottom: 16 }}
      >
        Créer un ticket
      </Button>

      <Table
        columns={columns}
        dataSource={filteredTickets}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={loading}
        onRow={(record) => ({
          onClick: () => navigate(`/admin/tickets/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
};

export default ListeTicketsMaintenance;
