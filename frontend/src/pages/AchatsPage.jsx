// src/pages/AchatsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';
import { 
  FiCalendar,
  FiPlus, 
  FiFilter, 
  FiDownload, 
  FiTrendingUp, 
  FiDollarSign,
  FiCheckCircle,
  FiFileText,
  FiPieChart,
  FiMap
} from 'react-icons/fi';
import './css/AchatsPage.css';

const AchatsPage = () => {
  const { societe_id, id: user_id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Premier jour du mois en cours
    fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0] // Dernier jour du mois en cours
  });
  const [filters, setFilters] = useState({
    fournisseur: '',
    categorie: '',
    statut: '',
    type_depense: ''
  });

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
      <div className="achats-spinner">
        <div className="spin"></div>
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
            Nouvelle dépense 
          </button>
 
        </div>
 
        <h3 className="filters-title">
          <FiFilter />
          Filtres & Options
        </h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Période</label>
            <div className="period-row">
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
        <div>
        <h3 className="quick-links-title">
          <FiMap />
          Accès rapide
        </h3>
        <div className="quick-links-grid">
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/achats/liste'}
          >
            <div className="quick-link-icon">
              <FiFileText />
            </div>
            <div className="quick-link-text">Liste des dépenses</div>
          </div>
          
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/achats/validation'}
          >
            <div className="quick-link-icon">
              <FiCheckCircle />
            </div>
            <div className="quick-link-text">Dépenses à valider</div>
          </div>
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/achats/fournisseurs'}
          >
            <div className="quick-link-icon">
              <FiPlus />
            </div>
            <div className="quick-link-text">Fournisseur</div>
          </div>
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/achats/parametrage'}
          >
            <div className="quick-link-icon">
              <FiCalendar />
            </div>
            <div className="quick-link-text">Paramétrage</div>
          </div>
        </div>
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
              {dashboardData.validation.nb_achats_brouillon}
              </div>
              <div className="indicator-label">dépense à valider</div>
              <div className="indicator-change positive">Automatisation</div>
            </div>
            <div className="indicator-icon">
              <FiFileText />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="cards-grid">
        {/* Top fournisseurs */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">
              Dépenses par fournisseur
            </h3>
            <span className="card-sub">Top 5</span>
          </div>
          {dashboardData?.fournisseurs?.length > 0 ? (
            <div className="list-v">
              {dashboardData.fournisseurs.slice(0, 5).map((fournisseur, index) => (
                <div key={index} className="row-between">
                  <div className="row gap-8">
                    <div className={`dot dot-${index}`}></div>
                    <span className="muted-900">{fournisseur.fournisseur || 'Fournisseur inconnu'}</span>
                  </div>
                  <div className="text-right">
                    <span className="strong primary-600">
                      {formatCurrency(fournisseur.montant_total)}
                    </span>
                    <p className="caption">{fournisseur.nb_achats} achat(s)</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="placeholder">Aucun achat ce mois</p>
          )}
        </div>

        {/* Répartition par catégorie */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">
              Dépenses par catégorie
            </h3>
            <span className="card-sub">Répartition</span>
          </div>
          {dashboardData?.categories?.length > 0 ? (
            <div className="list-v">
              {dashboardData.categories.slice(0, 5).map((categorie, index) => {
                const total = dashboardData.categories.reduce((sum, cat) => sum + parseFloat(cat.montant_total), 0);
                const percentage = total > 0 ? ((parseFloat(categorie.montant_total) / total) * 100).toFixed(1) : 0;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="row-between sm">
                      <span className="muted-900">{categorie.categorie || 'Non catégorisé'}</span>
                      <span className="strong success-600">
                        {formatCurrency(categorie.montant_total)} ({percentage}%)
                      </span>
                    </div>
                    <div className="bar">
                      <div 
                        className="bar-fill"
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="placeholder">Aucune catégorie</p>
          )}
        </div>

        {/* Évolution temporelle */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">
              Évolution mensuelle
            </h3>
            <span className="card-sub">12 derniers mois</span>
          </div>
          {dashboardData?.evolution?.length > 0 ? (
            <div className="list-v">
              {dashboardData.evolution.slice(0, 6).map((month, index) => (
                <div key={index} className="row-between sm">
                  <span className="muted-700">
                    {month.mois.toString().padStart(2, '0')}/{month.annee}
                  </span>
                  <div className="text-right">
                    <span className="strong">{formatCurrency(month.montant_total)}</span>
                    <span className="muted-600 ml-8">({month.nb_achats})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="placeholder">Pas de données historiques</p>
          )}
        </div>

        {/* Répartition par statut */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">
              Statuts des dépenses
            </h3>
            <span className="card-sub">Workflow</span>
          </div>
          {dashboardData?.statuts?.length > 0 ? (
            <div className="list-v">
              {dashboardData.statuts.map((statut, index) => (
                <div key={index} className="row-between">
                  <div className="row gap-8">
                    <div className={`dot ${
                      statut.statut === 'brouillon' ? 'bg-orange' :
                      statut.statut === 'valide' ? 'bg-blue' :
                      statut.statut === 'paye' ? 'bg-green' : 'bg-red'
                    }`}></div>
                    <span className="muted-900 capitalize">{statut.statut}</span>
                  </div>
                  <span className="strong">
                    {statut.nb_achats} ({formatCurrency(statut.montant_total)})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="placeholder">Aucun statut</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchatsPage;
