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
import './css/NotesfraisPage.css';

const NotesfraisPage = () => {
  const { societe_id, id: user_id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Premier jour du mois en cours
    fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0] // Dernier jour du mois en cours
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState('sage');

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
        <div className="filter-actions btn-notefraismargin">
          <button 
            className="action-btn"
            onClick={() => window.location.hash = '#/notes-frais/note'}
          >
            <FiPlus className="action-icon" />
            Nouvelle note
          </button>
        </div>
 
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
 
        <h3 className="quick-links-title">
          <FiMap />
          Accès rapide
        </h3>
        <div className="quick-links-grid">
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/notes-frais/liste'}
          >
            <div className="quick-link-icon">
              <FiFileText />
            </div>
            <div className="quick-link-text">Liste des notes</div>
          </div>
          
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/notes-frais/note'}
          >
            <div className="quick-link-icon">
              <FiPlus />
            </div>
            <div className="quick-link-text">Créer une note</div>
          </div>
          
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/notes-frais/validation'}
          >
            <div className="quick-link-icon">
              <FiCheckCircle />
            </div>
            <div className="quick-link-text">Validation notes</div>
          </div>
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/depenses/parametres'}
          >
            <div className="quick-link-icon">
              <FiCalendar />
            </div>
            <div className="quick-link-text">Paramétrage</div>
          </div>
        </div>
      </div>

      <div className="notes-kpis">
        <div 
          className="kpi-card submitted clickable" 
          onClick={() => window.location.hash = '#/notes-frais/validation'}
        >
          <div className="kpi-header">
            <div className="kpi-icon">
              <FiClock />
            </div>
            <div>
              <div className="kpi-value">
                {indicateurs.nb_notes_en_attente || 0}
              </div>
              <div className="kpi-label">Notes soumises</div>
            </div>
          </div>
          <div className="kpi-trend">
            <div className="trend-indicator warning">
              <FiTrendingUp size={12} />
              En attente validation
            </div>
            <div className="trend-period">Ce mois</div>
          </div>
        </div>

        <div 
          className="kpi-card validated clickable"
          onClick={() => window.location.hash = '#/notes-frais/historique?statut=validee'}
        >
          <div className="kpi-header">
            <div className="kpi-icon">
              <FiCheck />
            </div>
            <div>
              <div className="kpi-value">
                {indicateurs.nb_notes_validees || 0}
              </div>
              <div className="kpi-label">Notes validées</div>
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

        <div 
          className="kpi-card paid clickable"
          onClick={() => window.location.hash = '#/notes-frais/historique?statut=payee'}
        >
          <div className="kpi-header">
            <div className="kpi-icon">
              <FiDollarSign />
            </div>
            <div>
              <div className="kpi-value">
                {indicateurs.nb_notes_payees || 0}
              </div>
              <div className="kpi-label">Notes remboursées</div>
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

        <div 
          className="kpi-card total clickable"
          onClick={() => window.location.hash = '#/notes-frais/liste'}
        >
          <div className="kpi-header">
            <div className="kpi-icon">
              <FiFileText />
            </div>
            <div>
              <div className="kpi-value">
                {indicateurs.nb_notes || 0}
              </div>
              <div className="kpi-label">Total notes</div>
            </div>
          </div>
          <div className="kpi-trend">
            <div className="trend-indicator neutral">
              <FiFileText size={12} />
              Toutes statuts
            </div>
            <div className="trend-period">Ce mois</div>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
};

export default NotesfraisPage;
