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
import FraisKilometriques from './FraisKilometriques';
import './css/FraisSidebar.css';

const FraisSidebar = ({ isOpen, onClose, noteId, fraisData, onSaved, ocrData = null }) => {
  const { societe_id, id: user_id } = useAuth();

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

  const [ocrText, setOcrText] = useState(''); // Garder seulement le texte OCR pour référence

  const [projets, setProjets] = useState([]);
  const [typesFrais, setTypesFrais] = useState([]);
  const [saving, setSaving] = useState(false);
  const [justificatif, setJustificatif] = useState(null);
  
  // États pour les frais kilométriques
  const [isKilometriqueType, setIsKilometriqueType] = useState(false);
  const [kilometriqueData, setKilometriqueData] = useState({
    distance: 0,
    tarif_km: 0,
    puissance_fiscale: '',
    point_depart: '',
    point_arrivee: ''
  });

  const isEditMode = !!fraisData;
  const isReadOnlyMode = !!(fraisData && fraisData.readOnly);

  // Charger les données existantes pour l'édition (AVANT les données OCR)
  useEffect(() => {
    fetchInitialData();
    if (fraisData) {
      loadFraisData(fraisData);
    } else {
      resetForm();
    }
  }, [fraisData, isOpen]);

  // Gérer les données OCR (APRÈS le reset/load initial pour éviter l'écrasement)
  useEffect(() => {
    if (ocrData && isOpen) {
      console.log('📷 Données OCR reçues pour pré-remplissage:', ocrData);
      
      // Attendre un tick pour que le formulaire soit initialisé
      setTimeout(() => {
        // Préremplir le formulaire avec les données OCR
        setFormData(prevData => {
          // Déterminer le type de frais à utiliser
          let selectedTypeId = '';
          
          // Si l'OCR a détecté un type spécifique, l'utiliser
          if (ocrData.type_frais) {
            // Chercher le type correspondant dans la liste
            const detectedType = typesFrais.find(type => 
              type.nom && (
                type.nom.toLowerCase().includes(ocrData.type_frais) ||
                type.libelle.toLowerCase().includes(ocrData.type_frais)
              )
            );
            
            if (detectedType) {
              selectedTypeId = detectedType.id.toString();
              console.log(`🎯 Type frais détecté par OCR: "${ocrData.type_frais}" (ID: ${selectedTypeId})`);
            }
          }
          
          // Si aucun type détecté ou non trouvé, utiliser "Repas" par défaut
          if (!selectedTypeId) {
            const repasType = typesFrais.find(type => 
              type.nom && (
                type.nom.toLowerCase().includes('repas') || 
                type.libelle.toLowerCase().includes('repas')
              )
            );
            
            if (repasType) {
              selectedTypeId = repasType.id.toString();
              console.log('🍽️ Type frais "Repas" par défaut, ID:', selectedTypeId);
            } else {
              // Fallback ultime : utiliser l'ID 1
              selectedTypeId = '1';
              console.log('⚠️ Type frais par défaut, utilisation de l\'ID:', selectedTypeId);
            }
          }
          
          const newFormData = {
            ...prevData,
            type_frais_id: selectedTypeId,
            vendeur: ocrData.vendeur || prevData.vendeur,
            montant_ttc: ocrData.montant_ttc || prevData.montant_ttc,
            date_frais: ocrData.date_frais || prevData.date_frais,
            description: ocrData.description || prevData.description,
            moyen_paiement: ocrData.moyen_paiement || prevData.moyen_paiement
          };
          
          console.log('✅ Formulaire pré-rempli avec OCR:', newFormData);
          return newFormData;
        });

        // Calculer automatiquement HT et TVA si TTC est fourni
        if (ocrData.montant_ttc) {
          const ttc = parseFloat(ocrData.montant_ttc.replace(',', '.')) || 0;
          const tva = ttc * 0.2; // TVA à 20%
          const ht = ttc - tva;
          
          setFormData(prevData => ({
            ...prevData,
            montant_ht: ht.toFixed(2).replace('.', ','),
            montant_tva: tva.toFixed(2).replace('.', ',')
          }));
        }

        // Ajouter l'image OCR comme justificatif principal
        if (ocrData.ocrImage) {
          console.log('📸 Traitement image OCR:', typeof ocrData.ocrImage, ocrData.ocrImage);
          
          let imageFile = null;
          let imageUrl = null;
          
          // Si c'est déjà un File, l'utiliser directement
          if (ocrData.ocrImage instanceof File) {
            imageFile = ocrData.ocrImage;
            imageUrl = URL.createObjectURL(ocrData.ocrImage);
          }
          // Si c'est un Blob, le convertir en File
          else if (ocrData.ocrImage instanceof Blob) {
            imageFile = new File([ocrData.ocrImage], 'recu_ocr.jpg', { type: 'image/jpeg' });
            imageUrl = URL.createObjectURL(imageFile);
          }
          // Si c'est une URL data: ou une URL string
          else if (typeof ocrData.ocrImage === 'string') {
            if (ocrData.ocrImage.startsWith('data:')) {
              // Convertir data URL en File
              const response = await fetch(ocrData.ocrImage);
              const blob = await response.blob();
              imageFile = new File([blob], 'recu_ocr.jpg', { type: 'image/jpeg' });
              imageUrl = ocrData.ocrImage; // Utiliser la data URL directement
            } else {
              imageUrl = ocrData.ocrImage;
              // Pour une URL existante, on ne peut pas créer un File
            }
          }
          
          if (imageFile) {
            setJustificatif({
              url: imageUrl,
              nom: 'Reçu scanné (OCR)',
              type: 'image/jpeg',
              file: imageFile,
              isOCR: true
            });
            console.log('📸 Image OCR ajoutée comme justificatif avec File:', imageFile.name, imageFile.size, 'bytes');
          } else if (imageUrl) {
            setJustificatif({
              url: imageUrl,
              nom: 'Reçu scanné (OCR)',
              type: 'image/jpeg',
              file: null,
              isOCR: true
            });
            console.log('📸 Image OCR ajoutée comme justificatif URL seulement');
          }
        }

        // Stocker le texte OCR pour référence
        if (ocrData.ocrText) {
          setOcrText(ocrData.ocrText);
          console.log('📝 Texte OCR stocké:', ocrData.ocrText.substring(0, 100) + '...');
        }
      }, 100); // Délai de 100ms pour permettre l'initialisation
    }
  }, [ocrData, isOpen]);

  const fetchInitialData = async () => {
    try {
      const [projetsRes, typesFraisRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/projets/${societe_id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/types-frais`)
      ]);
      
      setProjets(projetsRes.data.projets || []);
      setTypesFrais(typesFraisRes.data.types || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadFraisData = (data) => {
    setFormData({
      type_frais_id: data.type_frais_id?.toString() || '',
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
      type_frais_id: '',
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
    setOcrText(''); // Reset OCR text
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

  // Surveiller le changement de type de frais pour détecter les frais kilométriques
  useEffect(() => {
    const typeKilometrique = parseInt(formData.type_frais_id) === 14; // ID du type "Transport - Kilomètres"
    setIsKilometriqueType(typeKilometrique);
    
    // Réinitialiser les données si on change de type
    if (!typeKilometrique) {
      setKilometriqueData({
        distance: 0,
        tarif_km: 0,
        puissance_fiscale: '',
        point_depart: '',
        point_arrivee: ''
      });
    }
  }, [formData.type_frais_id]);

  // Gestionnaire pour les données kilométriques
  const handleKilometriqueCalculation = (calculationData) => {
    console.log('📍 Calcul kilométrique reçu:', calculationData);
    
    setKilometriqueData(calculationData);
    
    // Mettre à jour automatiquement les montants
    setFormData(prev => ({
      ...prev,
      montant_ttc: calculationData.montant_ttc.toFixed(2).replace('.', ','),
      montant_ht: calculationData.montant_ttc.toFixed(2).replace('.', ','), // Pas de TVA sur frais kilométriques
      montant_tva: '0,00',
      description: `Trajet ${calculationData.point_depart} → ${calculationData.point_arrivee} (${calculationData.distance.toFixed(2)} km)`
    }));
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
        setSaving(false);
        return;
      }

      if (!formData.montant_ttc) {
        alert('Veuillez remplir le montant TTC');
        setSaving(false);
        return;
      }

      let finalNoteId = noteId;

      // Si noteId est null, créer d'abord la note
      if (!noteId) {
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Lundi
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
        
        const noteData = {
          user_id: user_id,
          societe_id: societe_id,
          periode_debut: startOfWeek.toISOString().split('T')[0],
          periode_fin: endOfWeek.toISOString().split('T')[0],
          titre: `Note de frais - ${startOfWeek.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
          description: 'Nouvelle note de frais',
          statut: 'brouillon'
        };

        const noteResponse = await axios.post(`${import.meta.env.VITE_API_URL}/note-frais`, noteData);
        
        if (noteResponse.data.success && noteResponse.data.note_id) {
          finalNoteId = noteResponse.data.note_id;
          // Rediriger vers la page avec l'ID de la nouvelle note
          window.location.hash = `#/notes-frais/note/${finalNoteId}`;
        } else {
          throw new Error('Erreur lors de la création de la note');
        }
      }

      const fraisPayload = {
        note_frais_id: finalNoteId,
        type_frais_id: formData.type_frais_id || 1, // Par défaut repas
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
        // Récupérer l'ID du frais créé - l'endpoint retourne data.fraisId
        const fraisId = response.data.data?.fraisId || response.data.fraisId || response.data.id || fraisData?.id;
        
        console.log('🆔 ID du frais récupéré:', fraisId, 'depuis response:', response.data);
        
        // Si on a un justificatif (notamment venant d'OCR), l'uploader
        if (justificatif && justificatif.file && fraisId) {
          console.log('📎 Upload du justificatif OCR pour frais ID:', fraisId);
          
          try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', justificatif.file);
            formDataUpload.append('frais_id', fraisId);
            formDataUpload.append('nom_fichier', justificatif.nom || 'justificatif_ocr');
            
            const uploadResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/frais/upload-justificatif`,
              formDataUpload,
              { 
                headers: { 
                  'Content-Type': 'multipart/form-data' 
                } 
              }
            );
            
            if (uploadResponse.data.success) {
              console.log('✅ Justificatif OCR sauvegardé avec succès');
            } else {
              console.warn('⚠️ Échec sauvegarde justificatif:', uploadResponse.data.message);
            }
          } catch (uploadError) {
            console.error('❌ Erreur upload justificatif:', uploadError);
            // Ne pas bloquer la sauvegarde du frais pour autant
          }
        } else if (justificatif && justificatif.file && !fraisId) {
          console.error('❌ Impossible d\'uploader le justificatif - ID frais manquant');
        }
        
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
            {isReadOnlyMode ? 'Consulter le frais' : isEditMode ? 'Modifier le frais' : 'Nouveau frais'}
          </h2>
          <button className="btn-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="sidebar-content">
          {/* Left Panel - Justificatif OU Carte kilométrique */}
          <div className="justificatif-panel">
            {isKilometriqueType ? (
              // Affichage de la carte Google Maps pour les frais kilométriques
              <FraisKilometriques onCalculationChange={handleKilometriqueCalculation} />
            ) : (
              // Affichage classique du justificatif
              <>
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
              </>
            )}
          </div>

          {/* Right Panel - Form */}
          <div className="form-panel">
            <div className="form-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Type de frais *</label>
                  <select 
                    value={formData.type_frais_id}
                    onChange={(e) => handleInputChange('type_frais_id', e.target.value)}
                    className="form-select"
                    disabled={isReadOnlyMode}
                  >
                    <option value="">Sélectionner un type</option>
                    {typesFrais.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.nom}
                      </option>
                    ))}
                  </select>
                </div>

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
              {isReadOnlyMode ? 'Fermer' : 'Annuler'}
            </button>
            {!isReadOnlyMode && (
              <button 
                className="btn-save-frais" 
                onClick={handleSave}
                disabled={saving}
              >
                <FiSave />
                {saving ? 'Sauvegarde...' : isEditMode ? 'Modifier' : 'Ajouter frais'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraisSidebar;