import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch,
  FiFilter,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import FournisseurSidebar from '../components/FournisseurSidebar';

const FournisseursPage = () => {
  const { societe_id } = useAuth();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState(null);

  useEffect(() => {
    fetchFournisseurs();
  }, [societe_id]);

const fetchFournisseurs = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/achats/fournisseurs/${societe_id}`);
    console.log('API response:', response.data); // <-- ajoute ça
    setFournisseurs(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error('Erreur chargement fournisseurs:', error);
  } finally {
    setLoading(false);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFournisseur 
        ? `${import.meta.env.VITE_API_URL}/achats/fournisseurs/${societe_id}/${editingFournisseur.id}`
        : `${import.meta.env.VITE_API_URL}/achats/fournisseurs/${societe_id}`;
        
      const method = editingFournisseur ? 'PUT' : 'POST';
      
      await axios({
        method: method,
        url: url,
        data: formData
      });
      
      alert(editingFournisseur ? 'Fournisseur modifié' : 'Fournisseur créé');
      resetForm();
      fetchFournisseurs();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/achats/fournisseurs/${societe_id}/${id}`);
        alert('Fournisseur supprimé');
        fetchFournisseurs();
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const openCreateSidebar = () => {
    setEditingFournisseur(null);
    setShowSidebar(true);
  };

  const openEditSidebar = (fournisseur) => {
    setEditingFournisseur(fournisseur);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingFournisseur(null);
  };

  const handleSaved = () => {
    fetchFournisseurs(); // Refresh the list
  };

  const filteredFournisseurs = fournisseurs.filter(f =>
    f.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ville?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des fournisseurs...</p>
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
              <FiUser className="text-blue-600" />
              Gestion des Fournisseurs
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredFournisseurs.length} fournisseur(s) dans votre base
            </p>
          </div>
          <button
            onClick={openCreateSidebar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiPlus size={16} />
            Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des fournisseurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFournisseurs.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
            <FiUser className="mx-auto text-gray-400 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun fournisseur trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter votre premier fournisseur
            </p>
            <button
              onClick={openCreateSidebar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Ajouter un fournisseur
            </button>
          </div>
        ) : (
          filteredFournisseurs.map((fournisseur) => (
            <div key={fournisseur.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header de la carte */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {fournisseur.nom}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditSidebar(fournisseur)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(fournisseur.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="p-6">
                <div className="space-y-3">
                  {fournisseur.email && (
                    <div className="flex items-center text-gray-600">
                      <FiMail size={16} className="mr-3 text-gray-400" />
                      <span className="text-sm truncate">{fournisseur.email}</span>
                    </div>
                  )}
                  
                  {fournisseur.telephone && (
                    <div className="flex items-center text-gray-600">
                      <FiPhone size={16} className="mr-3 text-gray-400" />
                      <span className="text-sm">{fournisseur.telephone}</span>
                    </div>
                  )}

                  {(fournisseur.ville || fournisseur.adresse) && (
                    <div className="flex items-start text-gray-600">
                      <FiMapPin size={16} className="mr-3 mt-1 text-gray-400 flex-shrink-0" />
                      <div className="text-sm">
                        {fournisseur.adresse && (
                          <div>{fournisseur.adresse}</div>
                        )}
                        {fournisseur.ville && (
                          <div>
                            {fournisseur.code_postal} {fournisseur.ville}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {fournisseur.siret && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      SIRET: {fournisseur.siret}
                    </div>
                  )}
                </div>

                {/* Stats (si disponibles) */}
                {fournisseur.total_achats && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total achats</span>
                      <span className="font-semibold text-green-600 flex items-center">
                        <FiDollarSign size={14} className="mr-1" />
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(fournisseur.total_achats)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingFournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du fournisseur *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                  <input
                    type="text"
                    value={formData.code_postal}
                    onChange={(e) => setFormData({...formData, code_postal: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => setFormData({...formData, ville: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => setFormData({...formData, siret: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conditions de paiement (jours)
                  </label>
                  <select
                    value={formData.conditions_paiement}
                    onChange={(e) => setFormData({...formData, conditions_paiement: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Comptant</option>
                    <option value="30">30 jours</option>
                    <option value="45">45 jours</option>
                    <option value="60">60 jours</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {editingFournisseur ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FournisseursPage;