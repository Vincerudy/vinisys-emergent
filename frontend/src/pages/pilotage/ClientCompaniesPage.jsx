import React, { useState, useEffect, useMemo } from 'react';
import { Input, Select, Tag, Typography, Modal, Row, Col, Empty, Button, Spin, message } from 'antd';
import { SearchOutlined, LockOutlined } from '@ant-design/icons';
import '../css/ClientCompaniesPage.css';
import '../css/RainbowCompanyCard.css';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const ClientCompaniesPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Récupérer les sociétés depuis l'API
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/societes/liste`);  // Ajuste l'URL si besoin
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.statusText}`);
        }
        const data = await response.json();
        // data doit être un tableau [{id, nom, statut}, ...]
        // Adapter les noms pour la page
        const formatted = data.map(({ id, nom, statut }) => ({
          id,
          name: nom,
          status: statut,
        }));
        setCompanies(formatted);
      } catch (error) {
        message.error("Impossible de charger les sociétés : " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Génère un dégradé aléatoire une fois par id
  const cardGradients = useMemo(() => {
    const generateGradient = () => {
      const hue1 = Math.floor(Math.random() * 360);
      const hue2 = (hue1 + Math.floor(Math.random() * 90) + 30) % 360;
      return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 80%, 65%))`;
    };

    const gradients = {};
    companies.forEach(company => {
      gradients[company.id] = generateGradient();
    });
    return gradients;
  }, [companies]);

  const showModal = (company) => {
    setSelectedCompany(company);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCompany(null);
  };

  const filteredCompanies = companies.filter(company => {
    const matchSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? company.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const getStatusTag = (status) => (
    <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
  );

  const handleLoginAs = (company) => {
    console.log("Connexion en tant que :", company.name);
    // TODO: rediriger vers un dashboard ou lancer une session
  };

  const handleShowSettings = (company) => {
    console.log("Paramétrage de :", company.name);
    navigate(`/admin/societe/parametrage/${company.id}`)
    // TODO: afficher les réglages ou une autre page
  };

  return (
    <div className="modern-container">
      <Title level={2} className="modern-title">Sociétés clientes</Title>

      <div className="modern-filters-row">
        <Input
          placeholder="🔍 Rechercher par nom ou ID"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: 250 }}
        />
        <Select
          placeholder="Filtrer par statut"
          value={statusFilter}
          onChange={value => setStatusFilter(value)}
          allowClear
          style={{ width: 200 }}
        >
          <Option value="">Tous</Option>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]} className="modern-cards-row">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => {
              const initials = company.name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase();

              const gradient = cardGradients[company.id];

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={company.id}>
                  <div
                    className="rainbow-company-card"
                    style={{ background: gradient, cursor: 'pointer' }}
                    onClick={() => showModal(company)}
                  >
                    <div className="company-initials">{initials}</div>
                    <div className="company-info">
                      <div className="company-name">{company.name}</div>
                      <div className="company-id">ID : {company.id}</div>
                      <div className="company-status">{getStatusTag(company.status)}</div>
                    </div>
                  </div>
                </Col>
              );
            })
          ) : (
            <Empty description="Aucune société trouvée" style={{ margin: 'auto', marginTop: '2rem' }} />
          )}
        </Row>
      )}

      <Modal
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        title={selectedCompany?.name}
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
          <Button type="primary" icon={<LockOutlined />} onClick={() => handleLoginAs(selectedCompany)}>
            Se connecter en tant que {selectedCompany?.name}
          </Button>
          <Button onClick={() => handleShowSettings(selectedCompany)}>
            Afficher le paramétrage
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClientCompaniesPage;
