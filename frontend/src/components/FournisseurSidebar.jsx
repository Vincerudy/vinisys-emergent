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
          `${import.meta.env.VITE_API_URL}/achats/fournisseurs/fournisseur/${fournisseur.id}`,
          payload
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/achats/fournisseurs/fournisseur`,
          payload
        );
      }

      if (response.status === 201 || response.status === 200) {
        alert(isEditMode ? 'Fournisseur modifié avec succès' : 'Fournisseur créé avec succès');
        onSaved();
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
      <div className="fournisseur-sidebar-backdrop" onClick={onClose}></div>

      <div className={`fournisseur-sidebar-panel ${isOpen ? 'open' : ''}`}>
        <div className="fournisseur-sidebar-content">
          {/* Header */}
          <div className="fournisseur-sidebar-header">
            <h2>{isEditMode ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h2>
            <button onClick={onClose} className="close-btn">
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="fournisseur-sidebar-body">
            <form onSubmit={handleSubmit}>
              {/* Nom */}
              <div className="form-group">
                <label>
                  <FiUser className="icon" /> Nom du fournisseur *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label><FiMail className="icon" /> Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Téléphone */}
              <div className="form-group">
                <label><FiPhone className="icon" /> Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                />
              </div>

              {/* Adresse */}
              <div className="form-group">
                <label><FiMapPin className="icon" /> Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                />
              </div>

              {/* Ville + CP */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Ville</label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Code postal</label>
                  <input
                    type="text"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Pays */}
              <div className="form-group">
                <label>Pays</label>
                <select
                  name="pays"
                  value={formData.pays}
                  onChange={handleInputChange}
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Canada">Canada</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* SIRET */}
              <div className="form-group">
                <label>SIRET</label>
                <input
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleInputChange}
                />
              </div>

              {/* TVA */}
              <div className="form-group">
                <label>N° TVA Intracommunautaire</label>
                <input
                  type="text"
                  name="numero_tva"
                  value={formData.numero_tva}
                  onChange={handleInputChange}
                />
              </div>

              {/* Conditions paiement */}
              <div className="form-group">
                <label><FiDollarSign className="icon" /> Conditions de paiement (jours)</label>
                <select
                  name="conditions_paiement"
                  value={formData.conditions_paiement}
                  onChange={handleInputChange}
                >
                  <option value="0">Comptant</option>
                  <option value="15">15 jours</option>
                  <option value="30">30 jours</option>
                  <option value="45">45 jours</option>
                  <option value="60">60 jours</option>
                </select>
              </div>

              {/* Compte comptable */}
              <div className="form-group">
                <label>Compte comptable</label>
                <input
                  type="text"
                  name="compte_comptable"
                  value={formData.compte_comptable}
                  onChange={handleInputChange}
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="fournisseur-sidebar-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-save"
            >
              {saving ? "Enregistrement..." : isEditMode ? "Modifier" : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FournisseurSidebar;
