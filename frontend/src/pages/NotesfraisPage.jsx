import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';
import { 
  FiPlus, 
  FiFilter, 
  FiDownload, 
  FiCreditCard, 
  FiTrendingUp, 
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUsers,
  FiMap,
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiCheck,
  FiX,
  FiPieChart
} from 'react-icons/fi';
// import './css/NotesfraisPage.css';

const NotesfraisPage = () => {
  const { societe_id, id: user_id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'validation', 'historique'
  const [selectedPeriod, setSelectedPeriod] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear()
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState('sage');

  // Chargement des données du dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const params = {
          mois: selectedPeriod.mois,
          annee: selectedPeriod.annee
        };
        
        if (viewMode === 'validation') {
          params.utilisateur_id = user_id;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/notes-frais/dashboard/${societe_id}`,
          { params }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error('Erreur dashboard notes de frais:', error);
        setDashboardData({
          indicateurs: {
            nb_notes: 0,
            montant_total_soumis: 0,
            montant_valide: 0,
            montant_rembourse: 0,
            montant_refuse: 0,
            nb_notes_en_attente: 0,
            taux_refus: 0
          },
          utilisateurs: [],
          types_frais: [],
          evolution: [],
          statuts: [],
          kilometriques: {
            total_km: 0,
            montant_km: 0,
            nb_trajets: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (societe_id) {
      fetchDashboard();
    }
  }, [societe_id, selectedPeriod, viewMode, user_id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const exportNotesComptable = async (type) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/notes-frais/export/${type}/${societe_id}`,
        { 
          params: {
            mois: selectedPeriod.mois,
            annee: selectedPeriod.annee
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notes-frais-${type}-${selectedPeriod.mois}-${selectedPeriod.annee}.${type === 'sage' ? 'txt' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const indicateurs = dashboardData?.indicateurs || {};

  return (
    <div className="notes-frais-page">
      {/* Header */}
      <div className="notes-frais-header">
        <div>
          <h1>
            <FiFileText />
            Notes de frais Employés
          </h1>
          <p>
            Gestion des notes de frais employés avec validation et remboursements
          </p>
        </div>
        <div className="filter-actions">
          <button className="action-btn">
            <FiPlus className="action-icon" />
            Nouvelle note
          </button>
          <button className="action-btn info">
            <FiDownload className="action-icon" />
            Export
          </button>
        </div>
      </div>

      {/* Contrôles */}
      <div className="view-modes">
        <div className="view-modes-title">
          <FiCalendar />
          Période & Mode d'affichage
        </div>
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
                    {new Date(0, i).toLocaleString('fr-FR', {month: 'long'})}
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
        </div>
        
        <div className="mode-tabs">
          <button 
            className={`mode-tab ${viewMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => setViewMode('dashboard')}
          >
            Tableau de bord
          </button>
          <button 
            className={`mode-tab ${viewMode === 'validation' ? 'active' : ''}`}
            onClick={() => setViewMode('validation')}
          >
            Validation
          </button>
          <button 
            className={`mode-tab ${viewMode === 'historique' ? 'active' : ''}`}
            onClick={() => setViewMode('historique')}
          >
            Historique
          </button>
        </div>
      </div>

      {/* Indicateurs KPI */}
      <div className="notes-kpis">
        <div className="kpi-card submitted">
          <div className="kpi-header">
            <div className="kpi-icon">
              <FiDollarSign />
            </div>
            <div>
              <div className="kpi-value">
                {formatCurrency(indicateurs.montant_total_soumis)}
              </div>
              <div className="kpi-label">Notes soumises</div>
            </div>
          </div>
          <div className="kpi-trend">
            <div className="trend-indicator positive">
              <FiTrendingUp size={12} />
              {indicateurs.nb_notes} note(s)
            </div>
            <div className="trend-period">Ce mois</div>
          </div>
        </div>

        <div className="kpi-card validated">
          <div className="kpi-header">
            <div className="kpi-icon">
              <FiCheck />
            </div>
            <div>
              <div className="kpi-value">
                {formatCurrency(indicateurs.montant_valide)}
              </div>
              <div className="kpi-label">Validées</div>
            </div>
          </div>
          <div className="kpi-trend">
            <div className="trend-indicator positive">
              <FiCheck size={12} />
              Approuvées
            </div>
            <div className="trend-period">Ce mois</div>
          </div>
        </div>

        <div className="kpi-card rejected">
          <div className="kpi-header">
            <div className="kpi-icon">
              <FiX />
            </div>
            <div>
              <div className="kpi-value">
                {formatCurrency(indicateurs.montant_rembourse)}
              </div>
              <div className="kpi-label">Remboursées</div>
            </div>
          </div>
          <div className="kpi-trend">
            <div className="trend-indicator positive">
              <FiDollarSign size={12} />
              Payées
            </div>
            <div className="trend-period">Ce mois</div>
          </div>
        </div>

        <div className="kpi-card pending">
          <div className="kpi-header">
            <div className="kpi-icon">
              <FiClock />
            </div>
            <div>
              <div className="kpi-value">
                {indicateurs.nb_notes_en_attente || 0}
              </div>
              <div className="kpi-label">En attente</div>
            </div>
          </div>
          <div className="kpi-trend">
            <div className="trend-indicator negative">
              <FiClock size={12} />
              Pending
            </div>
            <div className="trend-period">À traiter</div>
          </div>
        </div>
      </div>

      {/* Alertes et statut avancé */}
      {indicateurs.nb_notes_en_attente > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiClock className="text-orange-600" size={20} />
            <div className="flex-1">
              <p className="font-medium text-orange-800">
                🔍 {indicateurs.nb_notes_en_attente} note(s) en attente de validation managériale
              </p>
              <p className="text-orange-600 text-sm">Action requise par les managers pour déblocage remboursement</p>
            </div>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">
              Voir les notes
            </button>
          </div>
        </div>
      )}

      {/* Taux de refus élevé - Alerte critique */}
      {indicateurs.taux_refus > 15 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiXCircle className="text-red-600" size={20} />
            <div className="flex-1">
              <p className="font-medium text-red-800">
                ⚠️ Taux de refus critique : {indicateurs.taux_refus}% 
              </p>
              <p className="text-red-600 text-sm">
                Montant refusé : {formatCurrency(indicateurs.montant_refuse)} - Vérifier la conformité des justificatifs
              </p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
              Analyser
            </button>
          </div>
        </div>
      )}

      {/* Rappel remboursements en attente */}
      {indicateurs.montant_valide > indicateurs.montant_rembourse && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="text-blue-600" size={20} />
            <div className="flex-1">
              <p className="font-medium text-blue-800">
                💰 Remboursements en attente : {formatCurrency(indicateurs.montant_valide - indicateurs.montant_rembourse)}
              </p>
              <p className="text-blue-600 text-sm">Notes validées en attente de virement aux employés</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Traitement RH
            </button>
          </div>
        </div>
      )}

      {/* Graphiques et données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
      {/* Graphiques suggérés */}
      <div className="notes-charts">
        {/* Histogramme des notes par utilisateur */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">
                <FiUsers />
                Notes par utilisateur
              </h3>
              <p className="chart-subtitle">Histogramme des soumissions mensuelles</p>
            </div>
          </div>
          <div className="chart-visualization">
            📊 Histogramme - Nombre de notes par employé
            <br />
            <small>Classement des utilisateurs les plus actifs</small>
          </div>
        </div>

        {/* Camembert des types de frais */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">
                <FiPieChart />
                Types de frais courants
              </h3>
              <p className="chart-subtitle">Répartition : repas, km, hébergement, etc.</p>
            </div>
          </div>
          <div className="chart-visualization">
            🥧 Camembert - Types de frais
            <br />
            <small>Repas, Kilométrage, Hébergement, Péages</small>
          </div>
        </div>

        {/* Courbe des frais mensuels */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">
                <FiTrendingUp />
                Évolution mensuelle
              </h3>
              <p className="chart-subtitle">Courbe des frais sur 12 mois</p>
            </div>
          </div>
          <div className="chart-visualization">
            📈 Courbe temporelle - Frais mensuels
            <br />
            <small>Tendance et saisonnalité des dépenses</small>
          </div>
        </div>

        {/* Barres des statuts des notes */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">
                <FiCheck />
                Statuts des notes
              </h3>
              <p className="chart-subtitle">Brouillon, soumise, validée, refusée</p>
            </div>
          </div>
          <div className="chart-visualization">
            📊 Barres de statut
            <br />
            <small>Workflow de validation des notes</small>
          </div>
        </div>
      </div>

      {/* Barres de statut avec progression */}
      <div className="status-bars">
        <div className="status-bar">
          <div className="status-info">
            <span className="status-label">Brouillon</span>
            <span className="status-count">{indicateurs.nb_brouillon || 0}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill draft" style={{width: `${(indicateurs.nb_brouillon / indicateurs.nb_notes * 100) || 0}%`}}></div>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-info">
            <span className="status-label">Soumise</span>
            <span className="status-count">{indicateurs.nb_soumise || 0}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill submitted" style={{width: `${(indicateurs.nb_soumise / indicateurs.nb_notes * 100) || 0}%`}}></div>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-info">
            <span className="status-label">Validée</span>
            <span className="status-count">{indicateurs.nb_validee || 0}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill validated" style={{width: `${(indicateurs.nb_validee / indicateurs.nb_notes * 100) || 0}%`}}></div>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-info">
            <span className="status-label">Refusée</span>
            <span className="status-count">{indicateurs.nb_refusee || 0}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill rejected" style={{width: `${(indicateurs.nb_refusee / indicateurs.nb_notes * 100) || 0}%`}}></div>
          </div>
        </div>
      </div>

      {/* Actions de validation */}
      <div className="validation-actions">
        <h3 className="validation-title">
          <FiCheck />
          Actions de validation
        </h3>
        <div className="validation-buttons">
          <button className="validation-btn approve">
            <FiCheck size={16} />
            Valider en lot ({indicateurs.nb_soumise || 0})
          </button>
          <button className="validation-btn reject">
            <FiX size={16} />
            Refuser avec commentaire
          </button>
          <button className="validation-btn pending">
            <FiClock size={16} />
            Mettre en attente
          </button>
        </div>
      </div>

      {/* Historique des actions */}
      <div className="action-history">
        <h3 className="history-title">
          <FiFileText />
          Historique des actions
        </h3>
        <div className="timeline">
          <div className="timeline-item created">
            <div className="timeline-header">
              <span className="timeline-action">Note créée</span>
              <span className="timeline-date">Il y a 2h</span>
            </div>
            <div className="timeline-details">
              Note de frais #NF2025-001 créée par Jean Dupont (Repas client - 45.50€)
            </div>
          </div>

          <div className="timeline-item submitted">
            <div className="timeline-header">
              <span className="timeline-action">Note soumise</span>
              <span className="timeline-date">Il y a 1h</span>
            </div>
            <div className="timeline-details">
              Soumission pour validation avec justificatifs (2 fichiers)
            </div>
          </div>

          <div className="timeline-item validated">
            <div className="timeline-header">
              <span className="timeline-action">Note validée</span>
              <span className="timeline-date">Il y a 30min</span>
            </div>
            <div className="timeline-details">
              Validée par Marie Martin - Remboursement autorisé
            </div>
          </div>
        </div>
      </div>

        {/* Types de frais */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Types de frais</h3>
          {dashboardData?.types_frais?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.types_frais.slice(0, 5).map((type, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{type.type_frais}</span>
                  <div className="text-right">
                    <span className="font-medium text-blue-600">
                      {formatCurrency(type.montant_total)}
                    </span>
                    <p className="text-xs text-gray-500">{type.nb_lignes} ligne(s)</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun frais ce mois</p>
          )}
        </div>

        {/* Répartition par utilisateur (si vue globale) */}
        {viewMode === 'dashboard' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiUsers size={20} />
              Top utilisateurs
            </h3>
            {dashboardData?.utilisateurs?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.utilisateurs.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-700">
                        {user.firstName} {user.lastName}
                      </span>
                      {user.nb_en_attente > 0 && (
                        <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                          {user.nb_en_attente} en attente
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-green-600">
                        {formatCurrency(user.montant_total)}
                      </span>
                      <p className="text-xs text-gray-500">{user.nb_notes} note(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucun utilisateur</p>
            )}
          </div>
        )}

        {/* Répartition par statut */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Statuts des notes</h3>
          {dashboardData?.statuts?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.statuts.map((statut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      statut.statut === 'brouillon' ? 'bg-gray-400' :
                      statut.statut === 'soumise' ? 'bg-orange-400' :
                      statut.statut === 'validee' ? 'bg-blue-400' :
                      statut.statut === 'remboursee' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-gray-700 capitalize">{statut.statut}</span>
                  </div>
                  <span className="font-medium">
                    {statut.nb_notes} ({formatCurrency(statut.montant_total)})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun statut</p>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="border border-gray-300 hover:border-green-500 rounded-lg p-4 text-center transition-colors">
            <FiPlus className="mx-auto mb-2 text-green-600" size={24} />
            <p className="font-medium">Nouvelle note</p>
            <p className="text-sm text-gray-600">Créer une note de frais</p>
          </button>

          <button className="border border-gray-300 hover:border-blue-500 rounded-lg p-4 text-center transition-colors">
            <FiCheck className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="font-medium">Validation en lot</p>
            <p className="text-sm text-gray-600">Valider plusieurs notes</p>
          </button>

          <button 
            onClick={() => setShowExportModal(true)}
            className="border border-gray-300 hover:border-purple-500 rounded-lg p-4 text-center transition-colors"
          >
            <FiDownload className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="font-medium">Export comptable</p>
            <p className="text-sm text-gray-600">Sage/Ciel/Cegid</p>
          </button>
        </div>
      </div>

      {/* Export comptable - Section dédiée */}
      <div className="export-section">
        <h3 className="export-title">
          <FiDownload />
          Export comptable - Notes de frais
        </h3>
        <div className="export-options">
          <div 
            className={`export-option ${selectedExportType === 'sage' ? 'active' : ''}`}
            onClick={() => setSelectedExportType('sage')}
          >
            <div className="export-option-icon">📊</div>
            <div className="export-option-label">Sage</div>
            <div className="export-option-desc">Format .txt compatible</div>
          </div>

          <div 
            className={`export-option ${selectedExportType === 'ciel' ? 'active' : ''}`}
            onClick={() => setSelectedExportType('ciel')}
          >
            <div className="export-option-icon">📈</div>
            <div className="export-option-label">Ciel</div>
            <div className="export-option-desc">Format .csv standard</div>
          </div>

          <div 
            className={`export-option ${selectedExportType === 'cegid' ? 'active' : ''}`}
            onClick={() => setSelectedExportType('cegid')}
          >
            <div className="export-option-icon">💼</div>
            <div className="export-option-label">Cégid</div>
            <div className="export-option-desc">Format .csv avancé</div>
          </div>
        </div>

        <div style={{marginTop: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
          <div className="filter-group" style={{flex: 1, minWidth: '200px'}}>
            <label>Période d'export</label>
            <select defaultValue="current-month">
              <option value="current-month">Mois en cours</option>
              <option value="last-month">Mois dernier</option>
              <option value="current-quarter">Trimestre en cours</option>
              <option value="custom">Période personnalisée</option>
            </select>
          </div>

          <div className="filter-group" style={{flex: 1, minWidth: '200px'}}>
            <label>Statut des notes</label>
            <select defaultValue="validated">
              <option value="all">Toutes les notes</option>
              <option value="validated">Validées uniquement</option>
              <option value="paid">Remboursées uniquement</option>
            </select>
          </div>

          <div className="filter-group" style={{flex: 1, minWidth: '200px'}}>
            <label>Utilisateur</label>
            <select defaultValue="all">
              <option value="all">Tous les utilisateurs</option>
              <option value="current">Utilisateur actuel</option>
            </select>
          </div>

          <div className="filter-actions" style={{alignSelf: 'end'}}>
            <button 
              className="btn-filter btn-primary"
              onClick={() => exportNotesComptable(selectedExportType)}
            >
              <FiDownload size={16} />
              Exporter ({selectedExportType?.toUpperCase()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesfraisPage;