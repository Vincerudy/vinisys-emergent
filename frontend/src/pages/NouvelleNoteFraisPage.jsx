import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiUpload,
  FiSave,
  FiSend,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiCamera,
  FiEdit,
  FiCheck
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/NouvelleNoteFraisPage.css';

const NouvelleNoteFraisPage = () => {
  const { societe_id, id: user_id } = useAuth();
  
  // Récupérer l'ID de la note depuis l'URL si on est en mode édition
  const noteId = window.location.hash.includes('/edit/') 
    ? window.location.hash.split('/edit/')[1] 
    : null;
  const isEditMode = !!noteId;
  
  const [justificatif, setJustificatif] = useState(null);
  const [formData, setFormData] = useState({
    vendeur: '',
    date_frais: '',
    pays: 'France',
    devise: 'EUR',
    montant_ttc: '',
    montant_ht: '',
    montant_tva: '',
    moyen_paiement: 'Carte de Crédit Société',
    motif: '',
    projet_id: '',
    commentaire: ''
  });

  const [projets, setProjets] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    fetchInitialData();
    if (isEditMode && noteId) {
      fetchNoteData(noteId);
    }
  }, [societe_id, noteId]);

  const fetchInitialData = async () => {
    try {
      const projetsRes = await axios.get(`${import.meta.env.VITE_API_URL}/projets/${societe_id}`);
      setProjets(projetsRes.data.projets || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const fetchNoteData = async (noteId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/note-frais/${noteId}`);
      
      if (response.data.success && response.data.note) {
        const note = response.data.note;
        const ligneFrais = note.lignes_frais[0]; // Prendre la première ligne
        
        setFormData({
          vendeur: ligneFrais?.vendeur || '',
          date_frais: ligneFrais?.date_frais || '',
          pays: ligneFrais?.pays || 'France',
          devise: ligneFrais?.devise || 'EUR',
          montant_ttc: ligneFrais?.montant?.toString().replace('.', ',') || '',
          montant_ht: ligneFrais?.montant_ht?.toString().replace('.', ',') || '',
          montant_tva: ligneFrais?.montant_tva?.toString().replace('.', ',') || '',
          moyen_paiement: ligneFrais?.moyen_paiement || 'Carte de Crédit Société',
          motif: note.description?.replace(`Note de frais - ${ligneFrais?.vendeur}`, '').replace(` - ${ligneFrais?.vendeur}`, '') || '',
          projet_id: ligneFrais?.projet_id?.toString() || '',
          commentaire: ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement note:', error);
      alert('Erreur lors du chargement de la note de frais');
    } finally {
      setLoading(false);
    }
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

  const sauvegarder = async (statut = 'brouillon') => {
    try {
      setSaving(true);
      
      // Validation basique
      if (!formData.vendeur.trim()) {
        alert('Veuillez remplir le champ vendeur');
        setSaving(false);
        return;
      }

      if (!formData.montant_ttc) {
        alert('Veuillez remplir le montant TTC');
        setSaving(false);
        return;
      }

      // Préparer les données pour l'envoi
      const noteData = {
        user_id: user_id,
        societe_id: societe_id,
        vendeur: formData.vendeur.trim(),
        date_frais: formData.date_frais || new Date().toISOString().split('T')[0],
        pays: formData.pays,
        devise: formData.devise,
        montant_ttc: parseFloat(formData.montant_ttc.replace(',', '.')) || 0,
        montant_ht: parseFloat(formData.montant_ht.replace(',', '.')) || 0,
        montant_tva: parseFloat(formData.montant_tva.replace(',', '.')) || 0,
        moyen_paiement: formData.moyen_paiement,
        motif: formData.motif.trim(),
        projet_id: formData.projet_id || null,
        commentaire: formData.commentaire.trim(),
        statut
      };

      console.log('Envoi des données:', noteData);

      let response;
      if (isEditMode) {
        // Mode édition - PUT
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/note-frais/${noteId}`,
          noteData
        );
      } else {
        // Mode création - POST
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/note-frais/simple`,
          noteData
        );
      }

      if ((response.status === 201 || response.status === 200) && response.data.success) {
        const message = isEditMode 
          ? `Note de frais modifiée avec succès`
          : statut === 'brouillon' 
            ? `Note de frais sauvegardée en brouillon (${response.data.data.numero || ''})`
            : `Note de frais soumise pour validation (${response.data.data.numero || ''})`;
        
        alert(message);
        
        if (statut === 'soumise' || isEditMode) {
          window.location.href = '/#/notes-frais/liste';
        } else {
          // Réinitialiser le formulaire après sauvegarde en brouillon (création seulement)
          setFormData({
            vendeur: '',
            date_frais: '',
            pays: 'France',
            devise: 'EUR',
            montant_ttc: '',
            montant_ht: '',
            montant_tva: '',
            moyen_paiement: 'Carte de Crédit Société',
            motif: '',
            projet_id: '',
            commentaire: ''
          });
          setJustificatif(null);
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la sauvegarde';
      alert('Erreur: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="nouvelle-note-frais-page">
        <div className="loading-container">
          <p>Chargement de la note de frais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nouvelle-note-frais-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="montant-info">
            <FiDollarSign className="montant-icon" />
            <div className="montant-text">
              <span className="montant-value">{formData.montant_ttc || '0,00'}</span>
              <span className="montant-currency">EUR</span>
            </div>
            <div className="date-info">{formData.date_frais || 'Aucune date'}</div>
          </div>
          <div className="statut-badge">
            <FiCheck />
            {isEditMode ? 'Modification' : 'Brouillon'}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-modifier" disabled>
            <FiEdit />
            {isEditMode ? 'Mode modification' : 'Mode saisie'}
          </button>
        </div>
      </div>

      <div className="content-container">
        {/* Left Panel - Justificatif Preview */}
        <div className="justificatif-panel">
          <div className="justificatif-header">
            <h3>Justificatif</h3>
            <div className="upload-actions">
              <input
                type="file"
                id="file-upload"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="upload-btn">
                <FiUpload />
                Charger fichier
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
                <label>Motif du déplacement/frais</label>
                <input
                  type="text"
                  placeholder="Ex: Déjeuner d'affaires client, Repas équipe..."
                  value={formData.motif}
                  onChange={(e) => handleInputChange('motif', e.target.value)}
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

              <div className="form-group full-width">
                <label>Commentaire</label>
                <textarea
                  placeholder="Commentaires additionnels..."
                  value={formData.commentaire}
                  onChange={(e) => handleInputChange('commentaire', e.target.value)}
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="btn-secondary"
                onClick={() => window.location.href = '/#/notes-frais/liste'}
              >
                Annuler
              </button>
              <button 
                className="btn-save"
                onClick={() => sauvegarder('brouillon')}
                disabled={saving}
              >
                <FiSave />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button 
                className="btn-primary"
                onClick={() => sauvegarder('soumise')}
                disabled={saving}
              >
                <FiSend />
                {isEditMode ? 'Modifier & Soumettre' : 'Soumettre'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NouvelleNoteFraisPage;