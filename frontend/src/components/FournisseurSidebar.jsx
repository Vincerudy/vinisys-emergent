import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiDollarSign } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/FournisseurSidebar.css';

const FournisseurSidebar = ({ isOpen, onClose, fournisseur, onSaved }) => {
  const { societe_id } = useAuth();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'France',
    siret: '',
    numero_tva: '',
    conditions_paiement: '30',
    compte_comptable: ''
  });
  const [saving, setSaving] = useState(false);

  const isEditMode = !!fournisseur;

  useEffect(() => {
    if (fournisseur) {
      setFormData(fournisseur);
    } else {
      // Reset form for new supplier
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        code_postal: '',
        pays: 'France',
        siret: '',
        numero_tva: '',
        conditions_paiement: '30',
        compte_comptable: ''
      });
    }
  }, [fournisseur, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      alert('Le nom du fournisseur est obligatoire');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        societe_id: societe_id
      };

      let response;
      if (isEditMode) {
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/achats/fournisseur/${fournisseur.id}`,
          payload
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/achats/fournisseur`,
          payload
        );
      }

      if (response.status === 201 || response.status === 200) {
        alert(isEditMode ? 'Fournisseur modifié avec succès' : 'Fournisseur créé avec succès');
        onSaved(); // Callback to refresh the list
        onClose();
      }
    } catch (error) {
      console.error('Erreur sauvegarde fournisseur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fournisseur-sidebar-overlay">
      {/* Backdrop */}
      <div 
        className="fournisseur-sidebar-backdrop" 
        onClick={onClose}
      ></div>
      
      {/* Sidebar Panel */}
      <div className={`fournisseur-sidebar-panel ${isOpen ? 'open' : ''}`}>
        <div className="fournisseur-sidebar-content">
          {/* Header */}
          <div className="fournisseur-sidebar-header">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Form Body */}
          <div className="fournisseur-sidebar-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" />
                  Nom du fournisseur *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du fournisseur"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@fournisseur.com"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="01 23 45 67 89"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline mr-2" />
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Rue de la République"
                />
              </div>

              {/* Ville et Code postal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="75001"
                  />
                </div>
              </div>

              {/* Pays */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  name="pays"
                  value={formData.pays}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Canada">Canada</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* SIRET */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET
                </label>
                <input
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12345678901234"
                />
              </div>

              {/* TVA Intracom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° TVA Intracommunautaire
                </label>
                <input
                  type="text"
                  name="tva_intracom"
                  value={formData.tva_intracom}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="FR12345678901"
                />
              </div>

              {/* Conditions de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="inline mr-2" />
                  Conditions de paiement (jours)
                </label>
                <select
                  name="conditions_paiement"
                  value={formData.conditions_paiement}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Comptant</option>
                  <option value="15">15 jours</option>
                  <option value="30">30 jours</option>
                  <option value="45">45 jours</option>
                  <option value="60">60 jours</option>
                </select>
              </div>

              {/* Compte comptable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compte comptable
                </label>
                <input
                  type="text"
                  name="compte_comptable"
                  value={formData.compte_comptable}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="401000"
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="fournisseur-sidebar-footer">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </span>
              ) : (
                isEditMode ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FournisseurSidebar;