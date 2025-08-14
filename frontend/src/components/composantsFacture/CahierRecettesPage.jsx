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
  const { societe_id } = useAuth();
  
  // États
  const [recettes, setRecettes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({ 
    client: '', 
    dateRange: [], 
    description: '' 
  });
  const [groupedData, setGroupedData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(17);
  const [stats, setStats] = useState({
    totalRecettes: 0,
    totalHT: 0,
    totalTVA: 0,
    nombreFactures: 0,
    nombreLignes: 0
  });

  // Fonction pour récupérer les données depuis l'API
  const fetchRecettes = async (customFilters = null) => {
    setLoading(true);
    try {
      const filterParams = customFilters || filters;
      const params = {};

      // Filtre par client
      if (filterParams.client) {
        params.client = filterParams.client;
      }

      // Filtre par produit
      if (filterParams.description) {
        params.produit = filterParams.description;
      }

      // Filtre par dates
      if (filterParams.dateRange && filterParams.dateRange.length === 2) {
        params.date_debut = filterParams.dateRange[0].format('YYYY-MM-DD');
        params.date_fin = filterParams.dateRange[1].format('YYYY-MM-DD');
      } else {
        // Par défaut, récupérer le mois en cours
        const now = dayjs();
        params.mois = now.month() + 1;
        params.annee = now.year();
      }

      console.log('Récupération recettes avec filtres:', params);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cahier-recettes/${societe_id}`,
        { params }
      );

      if (response.data.success) {
        setRecettes(response.data.data);
        setFilteredData(response.data.data);
        setStats(response.data.stats);
        console.log(`Données récupérées: ${response.data.data.length} lignes`);
      } else {
        message.error('Erreur lors de la récupération des données');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes:', error);
      message.error('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant (mois en cours par défaut)
  useEffect(() => {
    if (societe_id) {
      fetchRecettes();
    }
  }, [societe_id]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    // Relancer la requête API avec les nouveaux filtres
    fetchRecettes(filters);
    setGroupedData(null); // Réinitialiser le classement
    setCurrentPage(1); // Revenir à la première page
  };

  const handleExport = () => {
    const exportData = filteredData.map(recette => ({
      'Date': recette.date,
      'Numéro': recette.numero,
      'Client': recette.client,
      'Produit': recette.description,
      'Mode de Paiement': recette.modePaiement,
      'Observation': recette.observation,
      'TVA (%)': recette.TVA,
      'Montant HT (€)': recette.montantHT.toFixed(2),
      'Montant TTC (€)': recette.montantTTC.toFixed(2)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cahier de Recettes');
    XLSX.writeFile(wb, `Cahier_de_Recettes_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    message.success('Export Excel réussi !');
  };

  const groupByCA = () => {
    if (filters.dateRange.length === 0 && !filteredData.length) {
      message.error('Veuillez sélectionner une plage de dates ou avoir des données à grouper.');
      return;
    }
  
    const grouped = filteredData.reduce((acc, curr) => {
      if (!acc[curr.client]) {
        acc[curr.client] = { ...curr, montantTTC: 0 };
      }
      acc[curr.client].montantTTC += curr.montantTTC;
      return acc;
    }, {});
  
    // Convertir l'objet en tableau et trier par CA décroissant
    const groupedArray = Object.values(grouped).sort((a, b) => b.montantTTC - a.montantTTC);
    setGroupedData(groupedArray);
    message.success(`Données groupées par client : ${groupedArray.length} clients`);
  };

  const groupByDescription = () => {
    if (filters.dateRange.length === 0 && !filteredData.length) {
      message.error('Veuillez sélectionner une plage de dates ou avoir des données à grouper.');
      return;
    }
  
    const groupedByDesc = filteredData.reduce((acc, curr) => {
      if (!acc[curr.description]) {
        acc[curr.description] = { description: curr.description, montantTTC: 0 };
      }
      acc[curr.description].montantTTC += curr.montantTTC;
      return acc;
    }, {});
  
    // Convertir l'objet en tableau et trier par montantTTC décroissant
    const groupedDescArray = Object.values(groupedByDesc).sort((a, b) => b.montantTTC - a.montantTTC);
    setGroupedData(groupedDescArray);
    message.success(`Données groupées par produit : ${groupedDescArray.length} produits`);
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gérer le changement de nombre de lignes par page
  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const displayedData = (groupedData || filteredData).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="cahier-recettes">
      {/* Statistiques */}
      <div style={{ 
        marginBottom: 20, 
        padding: 16, 
        background: '#f5f5f5', 
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
            {stats.totalRecettes?.toFixed(2) || '0.00'}€
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>CA Total TTC</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
            {stats.totalHT?.toFixed(2) || '0.00'}€
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>CA Total HT</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
            {stats.totalTVA?.toFixed(2) || '0.00'}€
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>TVA Totale</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
            {stats.nombreFactures || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Factures</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#eb2f96' }}>
            {stats.nombreLignes || filteredData.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Lignes</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters">
        <Input
          placeholder="Filtrer par client"
          value={filters.client}
          onChange={(e) => handleFilterChange('client', e.target.value)}
          style={{ marginRight: 20, width: 200 }}
        />
        <ConfigProvider locale={locale}> 
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => handleFilterChange('dateRange', dates)}
            style={{ marginRight: 20 }}
            placeholder={['Date début', 'Date fin']}
          />
        </ConfigProvider>
        <Input
          placeholder="Filtrer par produit"
          value={filters.description}
          onChange={(e) => handleFilterChange('description', e.target.value)}
          style={{ marginRight: 20, width: 200 }}
        />
        <Button 
          className='backGroundColorBlue' 
          type="primary" 
          onClick={applyFilters} 
          loading={loading}
          style={{ marginRight: 20 }}
        >
          Appliquer les filtres
        </Button>
        <Button 
          className='backGroundColorBlue' 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleExport} 
          style={{ marginRight: 20, backgroundColor: '#3454d1' }}
        >
          Exporter en Excel
        </Button>
        <Button 
          className='backGroundColorBlue' 
          type="default" 
          onClick={groupByCA} 
          style={{ marginRight: 20 }}
        >
          Classer par CA
        </Button>
        <Button 
          className='backGroundColorBlue' 
          type="default" 
          onClick={groupByDescription}
        >
          Classer par Produit
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

      <Spin spinning={loading}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {groupedData ? (
                  <>
                    <th>{groupedData[0]?.client ? 'Client' : 'Produit'}</th>
                    <th>Chiffre d'Affaires (€)</th>
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
              {displayedData.length > 0 ? (
                displayedData.map((recette, index) => (
                  <tr key={recette.id || index}>
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
                        <td>{recette.TVA}%</td>
                        <td>{recette.montantHT.toFixed(2)}</td>
                        <td>{recette.montantTTC.toFixed(2)}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={groupedData ? 2 : 9} style={{ textAlign: 'center', padding: '20px' }}>
                    {loading ? 'Chargement...' : 'Aucune donnée trouvée'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Spin>

      {/* Pagination */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={(groupedData || filteredData).length}
        onChange={handlePageChange}
        style={{ marginTop: 20 }}
        showSizeChanger={false}
        showTotal={(total, range) => 
          `${range[0]}-${range[1]} sur ${total} éléments`
        }
      />
    </div>
  );
};

export default CahierRecettesPage;