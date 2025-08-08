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
  const { societe_id, user_id } = useAuth();
  
  const [justificatif, setJustificatif] = useState(null);
  const [justificatifData, setJustificatifData] = useState({
    vendeur: '',
    date: '',
    pays: 'France',
    devise: 'EUR',
    totalTTC: '',
    totalHT: '',
    tva: '',
    moyenPaiement: 'Carte de Crédit Société',
    statut: 'Brouillon'
  });

  const [noteData, setNoteData] = useState({
    motif: '',
    destination: '',
    date_debut: '',
    date_fin: '',
    projet_id: '',
    commentaire: '',
    statut: 'brouillon'
  });

  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [societe_id]);

  const fetchInitialData = async () => {
    try {
      const projetsRes = await axios.get(`${import.meta.env.VITE_API_URL}/projets/${societe_id}`);
      setProjets(projetsRes.data.projets || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setJustificatif({
        url: url,
        nom: file.name,
        type: file.type
      });
      
      // Simulation d'extraction OCR
      setTimeout(() => {
        setJustificatifData({
          vendeur: 'LA ROMANA',
          date: '24/10/2024',
          pays: 'France',
          devise: 'EUR',
          totalTTC: '364,00',
          totalHT: '328,22',
          tva: '35,78',
          moyenPaiement: 'Carte de Crédit Société',
          statut: 'Traité'
        });
      }, 1000);
    }
  };

  const updateJustificatifData = (field, value) => {
    setJustificatifData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sauvegarder = async (statut = 'brouillon') => {
    try {
      setSaving(true);
      
      const noteComplete = {
        ...noteData,
        ...justificatifData,
        statut,
        montant_total: parseFloat(justificatifData.totalTTC.replace(',', '.')) || 0
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/notes-frais/create/${societe_id}`,
        noteComplete
      );

      if (response.data.success) {
        if (statut === 'brouillon') {
          alert('Note de frais sauvegardée en brouillon');
        } else {
          alert('Note de frais soumise pour validation');
          window.location.href = '/#/notes-frais';
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Image par défaut du ticket de restaurant
  const defaultReceiptImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjhmOWZhIiBzdHJva2U9IiNlNWU3ZWIiLz4KPHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIj4KPHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMjAgMjBIMTgwVjI4MEgyMFYyMFoiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNkMWQ1ZGIiLz4KPHN2ZyB4PSIyMCIgeT0iMzAiPgo8dGV4dCB4PSI4MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxZjJkM2YiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxBIFJPTUFOQTwvdGV4dD4KPHN2ZyB5PSIxNSI+Cjx0ZXh0IHg9IjgwIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjM3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4yMCBSVUUgR0FCUklFTCBQRVJJPC90ZXh0Pgo8L3N2Zz4KPHN2ZyB5PSIzNSI+Cjx0ZXh0IHg9IjgwIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjM3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj45MjMwMCBMRSBNVUxMT1MgRlJBTkNFPC90ZXh0Pgo8L3N2Zz4KPHN2ZyB5PSI1MCI+Cjx0ZXh0IHg9IjgwIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjM3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5URUwgMDEgNDcgNTggNDIgNzg8L3RleHQ+CjwvdGV4dD4KPC9zdmc+CjxzdmcgeT0iOTAiPgo8dGV4dCB4PSIyMCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxZjJkM2YiPjI0LTEwLTI0PC90ZXh0Pgo8dGV4dCB4PSIxNDAiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMWYyZDNmIj4xMyA0MyA1NzwvdGV4dD4KPC9zdmc+CjxzdmcgeT0iMTIwIj4KPHR5ZXh0IHg9IjIwIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMWYyZDNmIj5UQUJMRSAyPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMxZjJkM2YiPigxKSBWZXJkZXVyICMwMDE8L3RleHQ+CjwvdGV4dD4KPHN2ZyB5PSIxNDAiPgo8dGV4dCB4PSIyMCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzYzNzM4MCI+MTcgQ291dmVydHM8L3RleHQ+Cjx0ZXh0IHg9IjE0MCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzYzNzM4MCI+UG9zdCAjMTwvdGV4dD4KPC9zdmc+CjxzdmcgeT0iMTgwIj4KPHR5ZXh0IHg9IjgwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2RjMjYyNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UkVQQVMgQ09NUExFVDwvdGV4dD4KPC9zdmc+CjxzdmcgeT0iMjEwIj4KPHR5ZXh0IHg9IjE0MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxZjJkM2YiIHRleHQtYW5jaG9yPSJlbmQiPjM2NCwwMDwvdGV4dD4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+CjwvdGV4dD4KPC9zdmc+";

  return (
    <div className="nouvelle-note-frais-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="montant-info">
            <FiDollarSign className="montant-icon" />
            <div className="montant-text">
              <span className="montant-value">{justificatifData.totalTTC}</span>
              <span className="montant-currency">EUR</span>
            </div>
            <div className="date-info">{justificatifData.date}</div>
          </div>
          <div className="statut-badge">
            <FiCheck />
            {justificatifData.statut}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-modifier">
            <FiEdit />
            Modifier
          </button>
        </div>
      </div>

      <div className="content-container">
        {/* Left Panel - Justificatif Preview */}
        <div className="justificatif-panel">
          <div className="justificatif-header">
            <h3>Aperçu du justificatif</h3>
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
                Nouveau scan
              </label>
              <button className="camera-btn">
                <FiCamera />
                Capture d'écran
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
                <img 
                  src={defaultReceiptImage} 
                  alt="Aperçu ticket" 
                  className="receipt-default"
                />
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
                  value={justificatifData.vendeur}
                  onChange={(e) => updateJustificatifData('vendeur', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="text"
                  value={justificatifData.date}
                  onChange={(e) => updateJustificatifData('date', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Pays *</label>
                <select 
                  value={justificatifData.pays}
                  onChange={(e) => updateJustificatifData('pays', e.target.value)}
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
                  value={justificatifData.devise}
                  onChange={(e) => updateJustificatifData('devise', e.target.value)}
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
                    value={justificatifData.totalTTC}
                    onChange={(e) => updateJustificatifData('totalTTC', e.target.value)}
                    className="form-input amount-field"
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
                      value={justificatifData.totalHT}
                      onChange={(e) => updateJustificatifData('totalHT', e.target.value)}
                      className="form-input amount-field"
                    />
                    <span className="currency-label">EUR</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>TVA</label>
                  <div className="amount-input">
                    <input
                      type="text"
                      value={justificatifData.tva}
                      onChange={(e) => updateJustificatifData('tva', e.target.value)}
                      className="form-input amount-field"
                    />
                    <span className="currency-label">EUR</span>
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Moyen de paiement *</label>
                <select 
                  value={justificatifData.moyenPaiement}
                  onChange={(e) => updateJustificatifData('moyenPaiement', e.target.value)}
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
                  value={noteData.motif}
                  onChange={(e) => setNoteData({...noteData, motif: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Projet/Centre de coût</label>
                <select 
                  value={noteData.projet_id}
                  onChange={(e) => setNoteData({...noteData, projet_id: e.target.value})}
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
                  value={noteData.commentaire}
                  onChange={(e) => setNoteData({...noteData, commentaire: e.target.value})}
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="btn-secondary"
                onClick={() => window.location.href = '/#/notes-frais'}
              >
                Annuler
              </button>
              <button 
                className="btn-save"
                onClick={() => sauvegarder('brouillon')}
                disabled={saving}
              >
                <FiSave />
                Sauvegarder
              </button>
              <button 
                className="btn-primary"
                onClick={() => sauvegarder('soumise')}
                disabled={saving}
              >
                <FiSend />
                Soumettre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NouvelleNoteFraisPage;