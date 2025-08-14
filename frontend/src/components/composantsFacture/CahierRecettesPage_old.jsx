import React, { useState, useEffect } from 'react';
import './css/CahierRecettesPage.css';
import { Button, Input, DatePicker, message, Pagination, Select, ConfigProvider, Spin } from 'antd'; // Ajout de Spin pour loading
import { SaveOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import locale from 'antd/es/locale/fr_FR';
import axios from 'axios';
import { useAuth } from '../../contexte/AuthContext';

const { RangePicker } = DatePicker;
const { Option } = Select;

const CahierRecettesPage = () => {
  const [recettes] = useState([
    { id: 1, date: '2025-01-01', numero: 'REC-001', client: 'Client A', description: 'Vente de produits X', montantTTC: 120.0, modePaiement: 'Virement bancaire', TVA: 20, montantTVA: 20.0, montantHT: 100.0, observation: '' },
    { id: 2, date: '2025-01-05', numero: 'REC-002', client: 'Client B', description: 'Service de conseil Y', montantTTC: 180.0, modePaiement: 'Espèces', TVA: 10, montantTVA: 16.36, montantHT: 163.64, observation: 'Paiement en espèces' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 5, date: '2025-01-22', numero: 'REC-006', client: 'Client B', description: 'Service additionnel', montantTTC: 120.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 20.0, montantHT: 100.0, observation: 'Paiement par chèque' },
    { id: 1, date: '2025-01-01', numero: 'REC-001', client: 'Client A', description: 'Vente de produits X', montantTTC: 120.0, modePaiement: 'Virement bancaire', TVA: 20, montantTVA: 20.0, montantHT: 100.0, observation: '' },
    { id: 2, date: '2025-01-05', numero: 'REC-002', client: 'Client B', description: 'Service de conseil Y', montantTTC: 180.0, modePaiement: 'Espèces', TVA: 10, montantTVA: 16.36, montantHT: 163.64, observation: 'Paiement en espèces' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 3, date: '2025-01-10', numero: 'REC-003', client: 'Client C', description: 'Vente de produits Z', montantTTC: 250.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 41.67, montantHT: 208.33, observation: 'Chèque reçu le 10/01' },
    { id: 4, date: '2025-01-20', numero: 'REC-005', client: 'Client A', description: 'Vente supplémentaire', montantTTC: 80.0, modePaiement: 'Carte bancaire', TVA: 20, montantTVA: 13.33, montantHT: 66.67, observation: 'Paiement par carte' },
    { id: 5, date: '2025-01-22', numero: 'REC-006', client: 'Client B', description: 'Service additionnel', montantTTC: 120.0, modePaiement: 'Chèque', TVA: 20, montantTVA: 20.0, montantHT: 100.0, observation: 'Paiement par chèque' },
  ]);

  const [filteredData, setFilteredData] = useState(recettes);
  const [filters, setFilters] = useState({ client: '', dateRange: [], description: '' });
  const [groupedData, setGroupedData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(17);  // Le nombre de lignes par page, valeur initiale à 5

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    let data = recettes;

    if (filters.client) {
      data = data.filter((recette) => recette.client.toLowerCase().includes(filters.client.toLowerCase()));
    }

    if (filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      data = data.filter((recette) => new Date(recette.date) >= startDate && new Date(recette.date) <= endDate);
    }

    if (filters.description) {
      data = data.filter((recette) => recette.description.toLowerCase().includes(filters.description.toLowerCase()));
    }

    setGroupedData(null); // Réinitialiser le classement si de nouveaux filtres sont appliqués
    setFilteredData(data);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cahier de Recettes');
    XLSX.writeFile(wb, 'Cahier_de_Recettes.xlsx');
  };

  const groupByCA = () => {
    if (filters.dateRange.length === 0) {
      message.error('Veuillez sélectionner une plage de dates avant de classer par CA.');
      return;
    }
  
    // Filtrer les données avant de grouper par CA
    const filteredDataByDate = filteredData.filter((recette) => {
      const recetteDate = new Date(recette.date);
      return recetteDate >= filters.dateRange[0] && recetteDate <= filters.dateRange[1];
    });
  
    const grouped = filteredDataByDate.reduce((acc, curr) => {
      if (!acc[curr.client]) {
        acc[curr.client] = { ...curr, montantTTC: 0 };
      }
      acc[curr.client].montantTTC += curr.montantTTC;
      return acc;
    }, {});
  
    // Convertir l'objet en tableau et trier par CA décroissant
    const groupedArray = Object.values(grouped).sort((a, b) => b.montantTTC - a.montantTTC);
  
    setGroupedData(groupedArray);
  };

  const groupByDescription = () => {
    if (filters.dateRange.length === 0) {
      message.error('Veuillez sélectionner une plage de dates avant de classer par description.');
      return;
    }
  
    // Filtrer les données avant de grouper par description
    const filteredDataByDate = filteredData.filter((recette) => {
      const recetteDate = new Date(recette.date);
      return recetteDate >= filters.dateRange[0] && recetteDate <= filters.dateRange[1];
    });
  
    const groupedByDesc = filteredDataByDate.reduce((acc, curr) => {
      if (!acc[curr.description]) {
        acc[curr.description] = { description: curr.description, montantTTC: 0 };
      }
      acc[curr.description].montantTTC += curr.montantTTC;
      return acc;
    }, {});
  
    // Convertir l'objet en tableau et trier par montantTTC décroissant
    const groupedDescArray = Object.values(groupedByDesc).sort((a, b) => b.montantTTC - a.montantTTC);
  
    setGroupedData(groupedDescArray);
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gérer le changement de nombre de lignes par page
  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);  // Réinitialiser la page à 1 lorsque le nombre de lignes par page change
  };

  const displayedData = (groupedData || filteredData).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="cahier-recettes">
   
      <div className="filters">
        <Input
          placeholder="Filtrer par client"
          value={filters.client}
          onChange={(e) => handleFilterChange('client', e.target.value)}
          style={{ marginRight: 20, width: 200 }}
        />
                      <ConfigProvider locale={locale}> 
        <RangePicker
          onChange={(dates) => handleFilterChange('dateRange', dates)}
          style={{ marginRight: 20 }}
        />
        </ConfigProvider>
        <Input
          placeholder="Filtrer par produit"
          value={filters.description}
          onChange={(e) => handleFilterChange('description', e.target.value)}
          style={{ marginRight: 20, width: 200 }}
        />
        <Button className='backGroundColorBlue' type="primary" onClick={applyFilters} style={{ marginRight: 20 }}>
          Appliquer les filtres
        </Button>
        <Button className='backGroundColorBlue' type="primary" icon={<SaveOutlined />} onClick={handleExport} style={{ marginRight: 20, backgroundColor: '#3454d1' }}>
          Exporter en Excel
        </Button>
        <Button className='backGroundColorBlue' type="default" onClick={groupByCA} style={{ marginRight: 20 }}>
          Classer par CA
        </Button>
        <Button className='backGroundColorBlue' type="default" onClick={groupByDescription}>
          Classer par Description
        </Button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <span>Nombre de lignes par page: </span>
        <Select
          value={pageSize}
          onChange={handlePageSizeChange}
          style={{ width: 120 }}
        >
          <Option value={10}>10</Option>
          <Option value={50}>50</Option>
          <Option value={100}>100</Option>
          <Option value={500}>500</Option>
        </Select>
      </div>

      <div className="table-container">
  <table className="table">
    <thead>
      <tr>
        {groupedData ? (
          <>
            <th>{groupedData[0].client ? 'Client' : 'Description'}</th>
            <th>{groupedData[0].client ? 'Chiffre d\'Affaires (€)' : 'Chiffre d\'Affaires (€)'}</th>
          </>
        ) : (
          <>
            <th>Date</th>
            <th>Numéro</th>
            <th>Client</th>
            <th>Produit</th>
            <th>Mode de Paiement</th>
            <th>Observation</th>
            <th>TVA (%)</th>
            <th>Montant HT (€)</th>
            <th>Montant TTC (€)</th>
          </>
        )}
      </tr>
    </thead>
    <tbody>
      {displayedData.map((recette, index) => (
        <tr key={index}>
          {groupedData ? (
            <>
              <td>{recette.client || recette.description}</td>
              <td>{recette.montantTTC.toFixed(2)}</td>
            </>
          ) : (
            <>
              <td>{recette.date}</td>
              <td>{recette.numero}</td>
              <td>{recette.client}</td>
              <td>{recette.description}</td>
              <td>{recette.modePaiement}</td>
              <td>{recette.observation}</td>
              <td>{recette.TVA}</td>
              <td>{recette.montantHT.toFixed(2)}</td>
              <td>{recette.montantTTC.toFixed(2)}</td>
            </>
          )}
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {/* Pagination */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={(groupedData || filteredData).length}
        onChange={handlePageChange}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default CahierRecettesPage;
