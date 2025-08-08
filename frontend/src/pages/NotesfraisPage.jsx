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
  FiMap
} from 'react-icons/fi';

const NotesfraisPage = () => {
  const { societe_id, id: user_id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' ou 'personal'
  const [selectedPeriod, setSelectedPeriod] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear()
  });

  // Chargement des données du dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const params = {
          mois: selectedPeriod.mois,
          annee: selectedPeriod.annee
        };
        
        if (viewMode === 'personal') {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const indicateurs = dashboardData?.indicateurs || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            💳 Notes de Frais
          </h1>
          <p className="text-gray-600 mt-1">
            Gestion des frais professionnels des employés
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FiPlus size={16} />
            Nouvelle note
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FiDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Contrôles */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-medium">Période :</span>
            <select 
              value={selectedPeriod.mois}
              onChange={(e) => setSelectedPeriod({...selectedPeriod, mois: parseInt(e.target.value)})}
              className="border rounded px-3 py-1"
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
              className="border rounded px-3 py-1"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Vue :</span>
            <button 
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button 
              onClick={() => setViewMode('personal')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'personal' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Mes notes
            </button>
          </div>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Notes soumises</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(indicateurs.montant_total_soumis)}
              </p>
              <p className="text-xs text-gray-500">{indicateurs.nb_notes} note(s)</p>
            </div>
            <FiCreditCard className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Validées</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(indicateurs.montant_valide)}
              </p>
            </div>
            <FiCheckCircle className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Remboursées</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(indicateurs.montant_rembourse)}
              </p>
            </div>
            <FiTrendingUp className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En attente</p>
              <p className="text-2xl font-bold text-orange-600">
                {indicateurs.nb_notes_en_attente || 0}
              </p>
            </div>
            <FiClock className="text-orange-600" size={24} />
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
        
        {/* Frais kilométriques */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiMap size={20} />
            Frais kilométriques
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Distance totale</span>
              <span className="font-medium">{dashboardData?.kilometriques?.total_km || 0} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Montant</span>
              <span className="font-medium text-green-600">
                {formatCurrency(dashboardData?.kilometriques?.montant_km)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trajets</span>
              <span className="font-medium">{dashboardData?.kilometriques?.nb_trajets || 0}</span>
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
        {viewMode === 'all' && (
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
            <FiCheckCircle className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="font-medium">Validation</p>
            <p className="text-sm text-gray-600">Valider les notes en attente</p>
          </button>
          
          <button className="border border-gray-300 hover:border-purple-500 rounded-lg p-4 text-center transition-colors">
            <FiFilter className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="font-medium">Historique</p>
            <p className="text-sm text-gray-600">Voir toutes les notes</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesfraisPage;