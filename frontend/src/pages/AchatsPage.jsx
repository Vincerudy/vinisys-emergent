import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';
import { 
  FiPlus, 
  FiFilter, 
  FiDownload, 
  FiShoppingCart, 
  FiTrendingUp, 
  FiDollarSign,
  FiFileText,
  FiPercent,
  FiCheckCircle,
  FiBarChart2,
  FiPieChart,
  FiCalendar,
  FiUser,
  FiSettings,
  FiX
} from 'react-icons/fi';
import './css/AchatsPage.css';

const AchatsPage = () => {
  const { societe_id, id: user_id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear()
  });
  const [filters, setFilters] = useState({
    fournisseur: '',
    categorie: '',
    statut: '',
    type_depense: ''
  });
  const [selectedExportType, setSelectedExportType] = useState('sage');

  // Chargement des données du dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/achats/dashboard/${societe_id}`,
          {
            params: {
              mois: selectedPeriod.mois,
              annee: selectedPeriod.annee,
              ...filters
            }
          }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error('Erreur dashboard achats:', error);
        // Données par défaut pour éviter les erreurs d'affichage
        setDashboardData({
          indicateurs: {
            nb_achats: 0,
            montant_ttc_total: 0,
            montant_ht_total: 0,
            tva_deductible: 0,
            tva_non_deductible: 0,
            montant_ocr: 0,
            pourcentage_ocr: 0
          },
          fournisseurs: [],
          categories: [],
          evolution: [],
          validation: { nb_achats_brouillon: 0, montant_brouillon: 0 },
          statuts: [],
          paiements: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (societe_id) {
      fetchDashboard();
    }
  }, [societe_id, selectedPeriod, filters]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const exportComptable = async (format) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/achats/export/${format}/${societe_id}`,
        {
          params: { ...selectedPeriod, ...filters },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `achats-${format}-${selectedPeriod.mois}-${selectedPeriod.annee}.${format === 'sage' ? 'txt' : 'csv'}`;
      link.click();
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const indicateurs = dashboardData?.indicateurs || {};

  return (
    <div className="achats-page">
      {/* Header avec actions */}
      <div className="achats-header">
        <div>
          <h1>
            <FiDollarSign />
            Achats & Dépenses Entreprise
          </h1>
          <p>
            Gestion des achats, fournisseurs et dépenses professionnelles avec suivi TVA
          </p>
        </div>
        <div className="filter-actions">
          <button 
            onClick={() => window.location.href = '/#/achats/liste?sidebar=open'}
            className="action-btn"
          >
            <FiPlus className="action-icon" />
            Nouvel achat
          </button>
          <div className="export-dropdown">
            <button className="action-btn success">
              <FiDownload className="action-icon" />
              Export
            </button>
            <div className="export-menu">
              <button onClick={() => exportComptable('sage')}>
                Export Sage (.txt)
              </button>
              <button onClick={() => exportComptable('ciel')}>
                Export Ciel (.csv)
              </button>
              <button onClick={() => exportComptable('cegid')}>
                Export Cégid (.csv)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters-container">
        <h3 className="filters-title">
          <FiFilter />
          Filtres & Options
        </h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Période</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <select 
                value={selectedPeriod.mois}
                onChange={(e) => setSelectedPeriod({...selectedPeriod, mois: parseInt(e.target.value)})}
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>
                    {new Date(0, i).toLocaleString('fr-FR', {month: 'short'})}
                  </option>
                ))}
              </select>
              <select 
                value={selectedPeriod.annee}
                onChange={(e) => setSelectedPeriod({...selectedPeriod, annee: parseInt(e.target.value)})}
              >
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter-group">
            <label>Fournisseur</label>
            <select 
              value={filters.fournisseur}
              onChange={(e) => setFilters({...filters, fournisseur: e.target.value})}
            >
              <option value="">Tous</option>
              {dashboardData?.fournisseurs?.map(f => (
                <option key={f.fournisseur} value={f.fournisseur}>{f.fournisseur}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Catégorie</label>
            <select 
              value={filters.categorie}
              onChange={(e) => setFilters({...filters, categorie: e.target.value})}
            >
              <option value="">Toutes</option>
              {dashboardData?.categories?.map(c => (
                <option key={c.categorie} value={c.categorie}>{c.categorie}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Statut</label>
            <select 
              value={filters.statut}
              onChange={(e) => setFilters({...filters, statut: e.target.value})}
            >
              <option value="">Tous</option>
              <option value="brouillon">Brouillon</option>
              <option value="valide">Validé</option>
              <option value="paye">Payé</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select 
              value={filters.type_depense}
              onChange={(e) => setFilters({...filters, type_depense: e.target.value})}
            >
              <option value="">Tous</option>
              <option value="manuel">Manuel</option>
              <option value="ocr">OCR</option>
            </select>
          </div>

          <button 
            onClick={() => setFilters({ fournisseur: '', categorie: '', statut: '', type_depense: '' })}
            className="reset-btn"
          >
            <FiFilter size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Indicateurs financiers */}
      <div className="financial-indicators">
        <div className="indicator-card primary">
          <div className="indicator-header">
            <div>
              <div className="indicator-value">
                {formatCurrency(indicateurs.montant_ttc_total)}
              </div>
              <div className="indicator-label">Dépenses du mois</div>
              <div className="indicator-change positive">{indicateurs.nb_achats} achat(s)</div>
            </div>
            <div className="indicator-icon">
              <FiDollarSign />
            </div>
          </div>
        </div>

        <div className="indicator-card success">
          <div className="indicator-header">
            <div>
              <div className="indicator-value">
                {formatCurrency(indicateurs.tva_deductible)}
              </div>
              <div className="indicator-label">TVA récupérable</div>
              <div className="indicator-change positive">Déductible</div>
            </div>
            <div className="indicator-icon">
              <FiTrendingUp />
            </div>
          </div>
        </div>

        <div className="indicator-card warning">
          <div className="indicator-header">
            <div>
              <div className="indicator-value">
                {formatCurrency(indicateurs.tva_non_deductible)}
              </div>
              <div className="indicator-label">TVA non déductible</div>
              <div className="indicator-change negative">Non récupérable</div>
            </div>
            <div className="indicator-icon">
              <FiPieChart />
            </div>
          </div>
        </div>

        <div className="indicator-card info">
          <div className="indicator-header">
            <div>
              <div className="indicator-value">
                {Math.round(indicateurs.pourcentage_ocr || 0)}%
              </div>
              <div className="indicator-label">Utilisation OCR</div>
              <div className="indicator-change positive">Automatisation</div>
            </div>
            <div className="indicator-icon">
              <FiFileText />
            </div>
          </div>
        </div>
      </div>

      {/* Alertes - Dépenses à valider */}
      {dashboardData?.validation?.nb_achats_brouillon > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-orange-600" size={20} />
            <div>
              <p className="font-medium text-orange-800">
                🔍 {dashboardData.validation.nb_achats_brouillon} dépense(s) à valider pour export
              </p>
              <p className="text-orange-600 text-sm">
                Montant total : {formatCurrency(dashboardData.validation.montant_brouillon)} - Justificatifs requis
              </p>
            </div>
            <button className="ml-auto bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">
              Valider maintenant
            </button>
          </div>
        </div>
      )}

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top fournisseurs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiBarChart2 size={20} />
              Dépenses par fournisseur
            </h3>
            <span className="text-sm text-gray-500">Top 5</span>
          </div>
          {dashboardData?.fournisseurs?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.fournisseurs.slice(0, 5).map((fournisseur, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-purple-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-700">{fournisseur.fournisseur || 'Fournisseur inconnu'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-blue-600">
                      {formatCurrency(fournisseur.montant_total)}
                    </span>
                    <p className="text-xs text-gray-500">{fournisseur.nb_achats} achat(s)</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun achat ce mois</p>
          )}
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiPieChart size={20} />
              Dépenses par catégorie
            </h3>
            <span className="text-sm text-gray-500">Répartition</span>
          </div>
          {dashboardData?.categories?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.categories.slice(0, 5).map((categorie, index) => {
                const total = dashboardData.categories.reduce((sum, cat) => sum + parseFloat(cat.montant_total), 0);
                const percentage = total > 0 ? ((parseFloat(categorie.montant_total) / total) * 100).toFixed(1) : 0;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{categorie.categorie || 'Non catégorisé'}</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(categorie.montant_total)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune catégorie</p>
          )}
        </div>

        {/* Évolution temporelle */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiTrendingUp size={20} />
              Évolution mensuelle
            </h3>
            <span className="text-sm text-gray-500">12 derniers mois</span>
          </div>
          {dashboardData?.evolution?.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.evolution.slice(0, 6).map((month, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {month.mois.toString().padStart(2, '0')}/{month.annee}
                  </span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(month.montant_total)}</span>
                    <span className="text-gray-500 ml-2">({month.nb_achats})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Pas de données historiques</p>
          )}
        </div>

        {/* Répartition par statut */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiCheckCircle size={20} />
              Statuts des dépenses
            </h3>
            <span className="text-sm text-gray-500">Workflow</span>
          </div>
          {dashboardData?.statuts?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.statuts.map((statut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      statut.statut === 'brouillon' ? 'bg-orange-400' :
                      statut.statut === 'valide' ? 'bg-blue-400' :
                      statut.statut === 'paye' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-gray-700 capitalize">{statut.statut}</span>
                  </div>
                  <span className="font-medium">
                    {statut.nb_achats} ({formatCurrency(statut.montant_total)})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun statut</p>
          )}
        </div>
      </div>

      {/* Actions rapides étendues */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/#/achats/nouveau'}
            className="border border-gray-300 hover:border-blue-500 rounded-lg p-4 text-center transition-colors group"
          >
            <FiPlus className="mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-medium">Nouvel achat</p>
            <p className="text-sm text-gray-600">Saisir une dépense</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/#/achats/ocr'}
            className="border border-gray-300 hover:border-purple-500 rounded-lg p-4 text-center transition-colors group"
          >
            <FiFileText className="mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-medium">OCR Justificatif</p>
            <p className="text-sm text-gray-600">Scanner un document</p>
          </button>
          
          <button 
            onClick={() => exportComptable('sage')}
            className="border border-gray-300 hover:border-green-500 rounded-lg p-4 text-center transition-colors group"
          >
            <FiDownload className="mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-medium">Export comptable</p>
            <p className="text-sm text-gray-600">Sage/Ciel/Cegid</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/#/achats/liste'}
            className="border border-gray-300 hover:border-indigo-500 rounded-lg p-4 text-center transition-colors group"
          >
            <FiFilter className="mx-auto mb-2 text-indigo-600 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-medium">Liste détaillée</p>
            <p className="text-sm text-gray-600">Voir tous les achats</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchatsPage;