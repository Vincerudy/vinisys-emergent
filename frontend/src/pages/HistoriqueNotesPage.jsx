import React, { useState, useEffect } from 'react';
import {
  FiClock,
  FiCheck,
  FiX,
  FiEye,
  FiFilter,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiFileText
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';

const HistoriqueNotesPage = () => {
  const { societe_id } = useAuth();
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtres, setFiltres] = useState({
    periode: 'all',
    statut: 'all',
    utilisateur: 'all'
  });

  useEffect(() => {
    fetchHistorique();
  }, [societe_id, filtres]);

  const fetchHistorique = async () => {
    try {
      setLoading(true);
      // Utiliser l'endpoint existant avec un filtre pour les notes validées/refusées
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notes-frais/0`, {
        params: { 
          societe_id: societe_id,
          statut_historique: 'true', // Filtre pour notes validées/refusées
          ...filtres 
        }
      });
      
      // Filtrer seulement les notes avec un historique de validation
      const notesAvecHistorique = (response.data.notes || []).filter(note => 
        note.statut === 'validee' || note.statut === 'refusee' || note.date_validation
      );
      
      setHistorique(notesAvecHistorique);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setHistorique([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'validee': { class: 'bg-green-100 text-green-800', text: 'Validée', icon: FiCheck },
      'refusee': { class: 'bg-red-100 text-red-800', text: 'Refusée', icon: FiX },
      'remboursee': { class: 'bg-blue-100 text-blue-800', text: 'Remboursée', icon: FiDollarSign }
    };
    
    const badge = badges[statut] || { class: 'bg-gray-100 text-gray-800', text: 'Inconnu', icon: FiClock };
    const IconComponent = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        <IconComponent size={12} className="mr-1" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'historique...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FiClock className="text-blue-600" />
              Historique des Notes de frais
            </h1>
            <p className="text-gray-600 mt-2">
              Consultez l'historique complet des notes traitées
            </p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={filtres.periode}
              onChange={(e) => setFiltres({...filtres, periode: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les périodes</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filtres.statut}
              onChange={(e) => setFiltres({...filtres, statut: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="validee">Validées</option>
              <option value="refusee">Refusées</option>
              <option value="remboursee">Remboursées</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
            <select
              value={filtres.utilisateur}
              onChange={(e) => setFiltres({...filtres, utilisateur: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="current">Mes notes uniquement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiCheck className="text-2xl text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Validées</p>
              <p className="text-2xl font-bold text-gray-900">
                {historique.filter(n => n.statut === 'validee').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiX className="text-2xl text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Refusées</p>
              <p className="text-2xl font-bold text-gray-900">
                {historique.filter(n => n.statut === 'refusee').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiDollarSign className="text-2xl text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remboursées</p>
              <p className="text-2xl font-bold text-gray-900">
                {historique.filter(n => n.statut === 'remboursee').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiDollarSign className="text-2xl text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(historique.reduce((sum, n) => sum + (n.montant_total || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste de l'historique */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {historique.length === 0 ? (
          <div className="p-12 text-center">
            <FiFileText className="mx-auto text-gray-400 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun historique
            </h3>
            <p className="text-gray-600">
              Aucune note de frais traitée pour les filtres sélectionnés
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date traitement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historique.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiFileText className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {note.numero}
                          </div>
                          <div className="text-sm text-gray-500">
                            {note.titre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiUser className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {note.utilisateur_prenom} {note.utilisateur_nom}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(note.montant_total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiCalendar className="text-gray-400 mr-2" />
                        {formatDate(note.date_validation || note.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(note.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => window.location.hash = `#/notes-frais/note/${note.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriqueNotesPage;