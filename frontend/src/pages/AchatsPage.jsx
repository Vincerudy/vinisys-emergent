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
  FiCheckCircle
} from 'react-icons/fi';

const AchatsPage = () => {
  const { societe_id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear()
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
              annee: selectedPeriod.annee
            }
          }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error('Erreur dashboard achats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (societe_id) {
      fetchDashboard();
    }
  }, [societe_id, selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🧾 Dépenses & Achats
          </h1>
          <p className="text-gray-600 mt-1">
            Gestion des dépenses d'entreprise et fournisseurs
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FiPlus size={16} />
            Nouvel achat
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FiDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="bg-white p-4 rounded-lg shadow">
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
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Achats du mois</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(indicateurs.montant_ttc_total)}
              </p>
            </div>
            <FiShoppingCart className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">TVA récupérable</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(indicateurs.tva_deductible)}
              </p>
            </div>
            <FiPercent className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">TVA non récupérable</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(indicateurs.tva_non_deductible)}
              </p>
            </div>
            <FiDollarSign className="text-red-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Achats via OCR</p>
              <p className="text-2xl font-bold text-purple-600">
                {indicateurs.pourcentage_ocr || 0}%
              </p>
            </div>
            <FiFileText className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Alertes - Achats à valider */}
      {dashboardData?.validation?.nb_achats_brouillon > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-orange-600" size={20} />
            <div>
              <p className="font-medium text-orange-800">
                {dashboardData.validation.nb_achats_brouillon} achat(s) à valider
              </p>
              <p className="text-orange-600 text-sm">
                Montant total : {formatCurrency(dashboardData.validation.montant_brouillon)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Graphiques et données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top fournisseurs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Fournisseurs</h3>
          {dashboardData?.fournisseurs?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.fournisseurs.slice(0, 5).map((fournisseur, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{fournisseur.fournisseur || 'Fournisseur inconnu'}</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(fournisseur.montant_total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun achat ce mois</p>
          )}
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Dépenses par catégorie</h3>
          {dashboardData?.categories?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.categories.slice(0, 5).map((categorie, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{categorie.categorie || 'Non catégorisé'}</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(categorie.montant_total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune catégorie</p>
          )}
        </div>

        {/* Répartition par statut */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Statuts des achats</h3>
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

        {/* Modes de paiement */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Modes de paiement</h3>
          {dashboardData?.paiements?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.paiements.map((paiement, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{paiement.mode_paiement}</span>
                  <span className="font-medium">
                    {paiement.nb_achats} ({formatCurrency(paiement.montant_total)})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun paiement</p>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="border border-gray-300 hover:border-blue-500 rounded-lg p-4 text-center transition-colors">
            <FiPlus className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="font-medium">Nouvel achat</p>
            <p className="text-sm text-gray-600">Saisir une nouvelle dépense</p>
          </button>
          
          <button className="border border-gray-300 hover:border-green-500 rounded-lg p-4 text-center transition-colors">
            <FiDownload className="mx-auto mb-2 text-green-600" size={24} />
            <p className="font-medium">Export comptable</p>
            <p className="text-sm text-gray-600">Exporter pour Sage/Ciel</p>
          </button>
          
          <button className="border border-gray-300 hover:border-purple-500 rounded-lg p-4 text-center transition-colors">
            <FiFilter className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="font-medium">Liste détaillée</p>
            <p className="text-sm text-gray-600">Voir tous les achats</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchatsPage;