import React, { useState, useEffect } from 'react';
import { Table, Button, message, Typography, Input, InputNumber, Row, Col } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './css/InventaireAutomatise.css';
import { useAuth } from '../contexte/AuthContext';

const { Title, Paragraph } = Typography;

const InventaireAutomatise = () => {
  const { societe_id } = useAuth();
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNom, setSearchNom] = useState('');
  const [searchQuantite, setSearchQuantite] = useState(null);

  // Récupération initiale des produits via l'API
  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/produits/${societe_id}`);
        if (!response.ok) throw new Error('Erreur serveur');
        const data = await response.json();

        const mapped = data.map(prod => ({
          id: prod.id,
          nom: prod.nom,
          quantiteReelle: parseInt(prod.quantite_en_stock) || 0,
        }));

        setProduits(mapped);
        setFilteredProduits(mapped);
      } catch (error) {
        console.error('Erreur de chargement des produits:', error);
        message.error('Impossible de charger les produits.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, [societe_id]);

  // Filtrage personnalisé
  useEffect(() => {
    const filtered = produits.filter(prod => {
      const matchNom = prod.nom.toLowerCase().includes(searchNom.toLowerCase());
      const matchQuantite = searchQuantite !== null ? prod.quantiteReelle === searchQuantite : true;
      return matchNom && matchQuantite;
    });
    setFilteredProduits(filtered);
  }, [searchNom, searchQuantite, produits]);

  // Export Excel
  const exportExcel = () => {
    try {
      const worksheetData = filteredProduits.map(({ id, nom, quantiteReelle }) => ({
        ID: id,
        Produit: nom,
        'Quantité réelle': quantiteReelle,
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'InventaireAutomatise');
      XLSX.writeFile(workbook, 'InventaireAutomatise.xlsx');
      message.success('Export Excel réussi !');
    } catch (error) {
      message.error('Erreur lors de l’export Excel');
    }
  };

  const columns = [
    { title: 'Produit', dataIndex: 'nom', key: 'nom' },
    {
      title: 'Quantité réelle',
      dataIndex: 'quantiteReelle',
      key: 'quantiteReelle',
      sorter: (a, b) => a.quantiteReelle - b.quantiteReelle,
    },
  ];

  // Localisation en français
  const frenchLocale = {
    triggerDesc: 'Cliquer pour trier par ordre décroissant',
    triggerAsc: 'Cliquer pour trier par ordre croissant',
    cancelSort: 'Annuler le tri',
    emptyText: 'Aucune donnée à afficher',
  };

  return (
    <div className="inventaire-container">
      <Title level={2}>Inventaire Automatisé</Title>
      <Paragraph>
        Cet inventaire est basé sur les données récupérées à l’ouverture de la page. Aucune
        mise à jour automatique n’est effectuée par la suite.
      </Paragraph>
      <Paragraph className="info-paragraph">
        Le <strong>stock réel</strong> correspond à la quantité détectée ou saisie à un instant donné.
      </Paragraph>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
      <Col xs={24} sm={12} md={8}>
  <Input
    placeholder="Rechercher un produit"
    value={searchNom}
    onChange={e => setSearchNom(e.target.value)}
    allowClear
  />
</Col>
<Col xs={24} sm={12} md={8}>
  <InputNumber
    placeholder="Quantité exacte"
    value={searchQuantite}
    onChange={setSearchQuantite}
    style={{ width: '100%' }}
    min={0}
  />
</Col>

        <Col xs={24} sm={24} md={8}>
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportExcel} disabled={loading}>
            Exporter en Excel
          </Button>
        </Col>
      </Row>

      <div className="table-wrapper">
        <Table
          loading={loading}
          dataSource={filteredProduits}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          scroll={{ x: '100%' }}
          locale={frenchLocale}
        />
      </div>
    </div>
  );
};

export default InventaireAutomatise;
