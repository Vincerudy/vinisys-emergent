import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiSave,
  FiUpload,
  FiCamera,
  FiFileText,
  FiDollarSign,
  FiCalendar
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/FraisSidebar.css';

const FraisSidebar = ({ isOpen, onClose, noteId, fraisData, onSaved }) => {
  const { societe_id } = useAuth();

  const [formData, setFormData] = useState({
    type_frais_id: '',
    vendeur: '',
    date_frais: '',
    pays: 'France',
    devise: 'EUR',
    montant_ttc: '',
    montant_ht: '',
    montant_tva: '',
    moyen_paiement: 'Carte de Crédit Société',
    description: '',
    projet_id: ''
  });

  const [projets, setProjets] = useState([]);
  const [typesFrais, setTypesFrais] = useState([]);
  const [saving, setSaving] = useState(false);
  const [justificatif, setJustificatif] = useState(null);

  const isEditMode = !!fraisData;

  useEffect(() => {
    fetchInitialData();
    if (fraisData) {
      loadFraisData(fraisData);
    } else {
      resetForm();
    }
  }, [fraisData, isOpen]);

  const fetchInitialData = async () => {
    try {
      const [projetsRes, typesFraisRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/projets/${societe_id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/types-frais/${societe_id}`)
      ]);
      
      setProjets(projetsRes.data.projets || []);
      setTypesFrais(typesFraisRes.data.types_frais || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadFraisData = (data) => {
    setFormData({
      vendeur: data.vendeur || '',
      date_frais: data.date_frais ? data.date_frais.split('T')[0] : '',
      pays: data.pays || 'France',
      devise: data.devise || 'EUR',
      montant_ttc: data.montant?.toString().replace('.', ',') || '',
      montant_ht: data.montant_ht?.toString().replace('.', ',') || '',
      montant_tva: data.montant_tva?.toString().replace('.', ',') || '',
      moyen_paiement: data.moyen_paiement || 'Carte de Crédit Société',
      description: data.description || '',
      projet_id: data.projet_id?.toString() || ''
    });
  };

  const resetForm = () => {
    setFormData({
      vendeur: '',
      date_frais: new Date().toISOString().split('T')[0],
      pays: 'France',
      devise: 'EUR',
      montant_ttc: '',
      montant_ht: '',
      montant_tva: '',
      moyen_paiement: 'Carte de Crédit Société',
      description: '',
      projet_id: ''
    });
    setJustificatif(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Calcul automatique de la TVA et HT si TTC est modifié
    if (field === 'montant_ttc' && value) {
      const ttc = parseFloat(value.replace(',', '.')) || 0;
      const tva = ttc * 0.2; // TVA à 20%
      const ht = ttc - tva;
      
      setFormData(prev => ({
        ...prev,
        montant_ht: ht.toFixed(2).replace('.', ','),
        montant_tva: tva.toFixed(2).replace('.', ',')
      }));
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setJustificatif({
        url: url,
        nom: file.name,
        type: file.type,
        file: file
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (!formData.vendeur.trim()) {
        alert('Veuillez remplir le champ vendeur');
        return;
      }

      if (!formData.montant_ttc) {
        alert('Veuillez remplir le montant TTC');
        return;
      }

      const fraisPayload = {
        note_frais_id: noteId,
        vendeur: formData.vendeur.trim(),
        date_frais: formData.date_frais,
        pays: formData.pays,
        devise: formData.devise,
        montant: parseFloat(formData.montant_ttc.replace(',', '.')) || 0,
        montant_ht: parseFloat(formData.montant_ht.replace(',', '.')) || 0,
        montant_tva: parseFloat(formData.montant_tva.replace(',', '.')) || 0,
        moyen_paiement: formData.moyen_paiement,
        description: formData.description.trim(),
        projet_id: formData.projet_id || null
      };

      let response;
      if (isEditMode) {
        // Mode édition
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/frais/${fraisData.id}`,
          fraisPayload
        );
      } else {
        // Mode création
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/frais`,
          fraisPayload
        );
      }

      if (response.data.success) {
        alert(isEditMode ? 'Frais modifié avec succès' : 'Frais ajouté avec succès');
        onSaved();
      }

    } catch (error) {
      console.error('Erreur sauvegarde frais:', error);
      alert('Erreur lors de la sauvegarde du frais');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="frais-sidebar-overlay">
      <div className="frais-sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <h2>
            <FiFileText />
            {isEditMode ? 'Modifier le frais' : 'Nouveau frais'}
          </h2>
          <button className="btn-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="sidebar-content">
          {/* Left Panel - Justificatif */}
          <div className="justificatif-panel">
            <div className="justificatif-header">
              <h3>Justificatif</h3>
              <div className="upload-actions">
                <input
                  type="file"
                  id="frais-file-upload"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <label htmlFor="frais-file-upload" className="upload-btn">
                  <FiUpload />
                  Charger
                </label>
                <button className="camera-btn" disabled>
                  <FiCamera />
                  Scanner
                </button>
              </div>
            </div>
            
            <div className="justificatif-preview">
              {justificatif ? (
                <img 
                  src={justificatif.url} 
                  alt="Justificatif" 
                  className="receipt-image"
                />
              ) : (
                <div className="receipt-placeholder">
                  <FiFileText size={64} color="#cbd5e1" />
                  <p>Aucun justificatif</p>
                  <small>Chargez une image ou un PDF</small>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="form-panel">
            <div className="form-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Vendeur *</label>
                  <input
                    type="text"
                    value={formData.vendeur}
                    onChange={(e) => handleInputChange('vendeur', e.target.value)}
                    className="form-input"
                    placeholder="Nom du vendeur/commerce"
                  />
                </div>

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date_frais}
                    onChange={(e) => handleInputChange('date_frais', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Pays *</label>
                  <select 
                    value={formData.pays}
                    onChange={(e) => handleInputChange('pays', e.target.value)}
                    className="form-select"
                  >
                    <option value="France">France</option>
                    <option value="Espagne">Espagne</option>
                    <option value="Italie">Italie</option>
                    <option value="Allemagne">Allemagne</option>
                    <option value="Belgique">Belgique</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Devise *</label>
                  <select 
                    value={formData.devise}
                    onChange={(e) => handleInputChange('devise', e.target.value)}
                    className="form-select"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                <div className="form-group amount-group">
                  <label>Total TTC *</label>
                  <div className="amount-input">
                    <input
                      type="text"
                      value={formData.montant_ttc}
                      onChange={(e) => handleInputChange('montant_ttc', e.target.value)}
                      className="form-input amount-field"
                      placeholder="0,00"
                    />
                    <span className="currency-label">EUR</span>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Total HT</label>
                    <div className="amount-input">
                      <input
                        type="text"
                        value={formData.montant_ht}
                        onChange={(e) => handleInputChange('montant_ht', e.target.value)}
                        className="form-input amount-field"
                        placeholder="0,00"
                      />
                      <span className="currency-label">EUR</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>TVA</label>
                    <div className="amount-input">
                      <input
                        type="text"
                        value={formData.montant_tva}
                        onChange={(e) => handleInputChange('montant_tva', e.target.value)}
                        className="form-input amount-field"
                        placeholder="0,00"
                      />
                      <span className="currency-label">EUR</span>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Moyen de paiement *</label>
                  <select 
                    value={formData.moyen_paiement}
                    onChange={(e) => handleInputChange('moyen_paiement', e.target.value)}
                    className="form-select"
                  >
                    <option value="Carte de Crédit Société">Carte de Crédit Société</option>
                    <option value="Carte de Crédit Personnelle">Carte de Crédit Personnelle</option>
                    <option value="Espèces">Espèces</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Virement">Virement</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Ex: Déjeuner d'affaires client..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Projet/Centre de coût</label>
                  <select 
                    value={formData.projet_id}
                    onChange={(e) => handleInputChange('projet_id', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Sélectionner un projet</option>
                    {projets.map(projet => (
                      <option key={projet.id} value={projet.id}>
                        {projet.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="montant-preview">
              <FiDollarSign />
              <span>{formData.montant_ttc || '0,00'} EUR</span>
            </div>
          </div>
          
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button 
              className="btn-save-frais" 
              onClick={handleSave}
              disabled={saving}
            >
              <FiSave />
              {saving ? 'Sauvegarde...' : isEditMode ? 'Modifier' : 'Ajouter frais'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraisSidebar;