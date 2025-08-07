import React, { useState, useEffect } from 'react';
import {
  Table,
  InputNumber,
  Button,
  Typography,
  Space,
  message,
  Alert,
} from 'antd';
import {
  ReloadOutlined,
  SaveOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './css/InventaireManuel.css';
import { useAuth } from '../contexte/AuthContext';

const { Title } = Typography;

const InventaireManuel = () => {
  const { societe_id } = useAuth();
  const [produits, setProduits] = useState([]);
  const [initialProduits, setInitialProduits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduits = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/produits/${societe_id}`);
        if (!response.ok) throw new Error('Erreur serveur');
        const data = await response.json();

        const mapped = data.map(prod => ({
          id: Number(prod.id),
          nom: prod.nom,
          reference: prod.reference || 'N/A',
          stockTheorique: Number(prod.quantite_en_stock) || 0,
          quantiteReelle: prod.stock_reel != null ? Number(prod.stock_reel) : Number(prod.quantite_en_stock) || 0,
        }));

        setProduits(mapped);
        setInitialProduits(mapped);
      } catch (error) {
        console.error('Erreur de chargement des produits:', error);
        message.error('Impossible de charger les produits.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, [societe_id]);

  const handleQuantiteChange = (value, id) => {
    setProduits(prev =>
      prev.map(p => (p.id === id ? { ...p, quantiteReelle: value } : p))
    );
  };

  const handleReset = () => {
    setProduits(initialProduits);
    message.info('Quantités réinitialisées aux stocks théoriques.');
  };

  const handleValider = async () => {
    try {
      const updates = produits.map(p => ({
        id: Number(p.id),
        stock_reel: Number(p.quantiteReelle),
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/update_stock_reel/${societe_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produits: updates }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      message.success('Inventaire validé avec succès.');
    } catch (error) {
      console.error(error);
      message.error("Échec de la validation de l'inventaire.");
    }
  };

  const handleMiseEnConformite = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mise_en_conformite/${societe_id}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erreur lors de la mise en conformité');
      message.success('Mise en conformité réussie.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error(error);
      message.error('Échec de la mise en conformité.');
    }
  };

  const exportExcel = () => {
    try {
      const exportData = produits.map(({ reference, nom, stockTheorique, quantiteReelle }) => ({
        Référence: reference,
        Produit: nom,
        'Stock théorique': stockTheorique,
        'Quantité réelle': quantiteReelle,
        Écart: quantiteReelle - stockTheorique,
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'InventaireManuel');
      XLSX.writeFile(workbook, 'InventaireManuel.xlsx');
      message.success('Export Excel réussi !');
    } catch (error) {
      message.error("Erreur lors de l'export Excel");
    }
  };

  const columns = [
    { title: 'Référence', dataIndex: 'reference', key: 'reference' },
    { title: 'Produit', dataIndex: 'nom', key: 'nom' },
    {
      title: 'Stock théorique',
      dataIndex: 'stockTheorique',
      key: 'stockTheorique',
    },
    {
      title: 'Quantité réelle',
      key: 'quantiteReelle',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.quantiteReelle}
          onChange={value => handleQuantiteChange(value, record.id)}
        />
      ),
    },
    {
      title: 'Écart',
      key: 'ecart',
      render: (_, record) => record.quantiteReelle - record.stockTheorique,
    },
  ];

  return (
    <div className="inventaire-container">
      <Title level={2}>Inventaire Manuel</Title>

      <Alert
        message="Information"
        description="Le stock théorique correspond à la quantité prévue dans le système. Le stock physique (quantité réelle) est celui comptabilisé manuellement lors de l'inventaire."
        type="info"
        showIcon
        className="info-alert"
      />
       <Space wrap className="button-group">
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Réinitialiser
        </Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleValider}>
          Valider l'inventaire
        </Button>
        <Button icon={<CheckCircleOutlined />} onClick={handleMiseEnConformite}>
          Mise en conformité
        </Button>
        <Button icon={<DownloadOutlined />} onClick={exportExcel}>
          Exporter en Excel
        </Button>
      </Space>

      <div className="table-responsive-wrapper">
        <Table
          dataSource={produits}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          locale={{ emptyText: 'Aucune donnée à afficher' }}
          loading={loading}
          scroll={{ x: 'max-content' }}
          className="inventaire-table"
        />
      </div>

 
    </div>
  );
};

export default InventaireManuel;
