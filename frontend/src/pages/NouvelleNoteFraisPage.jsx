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
import FraisKilometriques from '../components/FraisKilometriques';
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
    type_frais_id: '',
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
  const [typesFrais, setTypesFrais] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  
  // États pour les frais kilométriques
  const [isKilometriqueType, setIsKilometriqueType] = useState(false);
  const [kilometriqueData, setKilometriqueData] = useState({
    distance: 0,
    tarif_km: 0,
    puissance_fiscale: '',
    point_depart: '',
    point_arrivee: ''
  });

  useEffect(() => {
    if (!isEditMode) {
      // Mode création : juste charger les données initiales
      fetchInitialData();
    } else {
      // Mode édition : charger les données existantes
      fetchInitialData();
      if (noteId) {
        fetchNoteData(noteId);
      }
    }
  }, [societe_id, noteId, isEditMode]);

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

  const fetchInitialData = async () => {
    try {
      const [projetsRes, typesFraisRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/projets/${societe_id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/types-frais`)
      ]);
      
      setProjets(projetsRes.data.projets || []);
      setTypesFrais(typesFraisRes.data.types || []);
      
      // Définir un type par défaut si disponible
      if (typesFraisRes.data.types && typesFraisRes.data.types.length > 0) {
        const defaultType = typesFraisRes.data.types.find(t => t.nom.includes('divers')) || 
                           typesFraisRes.data.types[0];
        setFormData(prev => ({ ...prev, type_frais_id: defaultType.id.toString() }));
      }
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
        
        console.log('📝 Note complète chargée:', note);
        console.log('📄 Ligne de frais:', ligneFrais);
        console.log('📎 Justificatifs disponibles:', ligneFrais?.justificatifs);
        
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

        // Charger les justificatifs de la première ligne de frais
        if (ligneFrais?.id && ligneFrais?.justificatifs && ligneFrais.justificatifs.length > 0) {
          const premierJustificatif = ligneFrais.justificatifs[0];
          
          console.log('🔗 Chargement du justificatif:', premierJustificatif);
          
          // Reconstituer l'objet justificatif pour l'affichage
          setJustificatif({
            url: `${import.meta.env.VITE_API_URL.replace('/api', '')}${premierJustificatif.url}`,
            nom: premierJustificatif.nom_fichier,
            type: premierJustificatif.type_mime,
            file: null, // Pas de fichier local pour un justificatif existant
            existing: true, // Marquer comme existant
            id: premierJustificatif.id
          });

          console.log('✅ Justificatif chargé depuis l\'API note:', premierJustificatif);
        } else {
          console.log('❌ Aucun justificatif trouvé pour cette ligne de frais');
        }
      }
    } catch (error) {
      console.error('Erreur chargement note:', error);
      alert('Erreur lors du chargement de la note de frais');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`🔄 note: Changement ${field} =`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Recalcul automatique TVA si montant change
    if (field === 'montant_ttc' && value) {
      const ttc = parseFloat(value.replace(',', '.')) || 0;
      const tva = ttc * 0.20;
      const ht = ttc - tva;
      setFormData(prev => ({
        ...prev,
        montant_ht: ht.toFixed(2).replace('.', ','),
        montant_tva: tva.toFixed(2).replace('.', ',')
      }));
    }
  };

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
      motif: `Trajet ${calculationData.point_depart} → ${calculationData.point_arrivee} (${calculationData.distance.toFixed(2)} km)`
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

      const montantTTC = parseFloat(formData.montant_ttc.replace(',', '.')) || 0;
      
      // Vérifier que le montant est > 0
      if (montantTTC <= 0) {
        alert('Le montant doit être supérieur à 0');
        setSaving(false);
        return;
      }

      let finalNoteId = noteId; // Pour le mode édition
      let uploadedFile = null; // Pour stocker les infos du fichier uploadé
      
      // En mode création, créer d'abord la note si le montant > 0
      if (!isEditMode) {
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Lundi
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
        
        const noteData = {
          user_id,
          societe_id,
          periode_debut: startOfWeek.toISOString().split('T')[0],
          periode_fin: endOfWeek.toISOString().split('T')[0],
          titre: `Note de frais - ${startOfWeek.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
          description: 'Nouvelle note de frais',
          statut: 'brouillon'
        };

        const noteResponse = await axios.post(`${import.meta.env.VITE_API_URL}/note-frais`, noteData);
        
        if (noteResponse.data.success && noteResponse.data.note_id) {
          finalNoteId = noteResponse.data.note_id;
        } else {
          throw new Error('Erreur lors de la création de la note');
        }
      }

      // Upload du justificatif si il existe
      if (justificatif && justificatif.file) {
        try {
          const formDataUpload = new FormData();
          formDataUpload.append('justificatif', justificatif.file);

          console.log('Upload du justificatif en cours...');
          const uploadResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/upload-justificatif`, 
            formDataUpload,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          if (uploadResponse.data.success) {
            uploadedFile = uploadResponse.data.fichier;
            console.log('Justificatif uploadé:', uploadedFile);
          }
        } catch (uploadError) {
          console.error('Erreur upload justificatif:', uploadError);
          // Continuer même si l'upload échoue, mais informer l'utilisateur
          alert('Attention: L\'upload du justificatif a échoué, mais le frais sera sauvegardé sans justificatif.');
        }
      }

      // Préparer les données du frais
      const fraisData = {
        note_id: finalNoteId,
        type_frais_id: 1, // Frais divers par défaut
        vendeur: formData.vendeur.trim(),
        date_frais: formData.date_frais || new Date().toISOString().split('T')[0],
        pays: formData.pays,
        devise: formData.devise,
        montant: montantTTC,
        montant_ht: parseFloat(formData.montant_ht.replace(',', '.')) || 0,
        montant_tva: parseFloat(formData.montant_tva.replace(',', '.')) || 0,
        moyen_paiement: formData.moyen_paiement,
        description: formData.motif.trim() || 'Frais professionnel',
        projet_id: formData.projet_id || null,
        commentaire: formData.commentaire.trim()
      };

      console.log('Envoi des données frais:', fraisData);

      // Créer le frais
      const fraisResponse = await axios.post(`${import.meta.env.VITE_API_URL}/frais`, fraisData);

      if ((fraisResponse.status === 201 || fraisResponse.status === 200) && fraisResponse.data.success) {
        const fraisId = fraisResponse.data.data.fraisId;

        // Associer le justificatif au frais si l'upload a réussi
        if (uploadedFile && fraisId) {
          try {
            console.log('Association du justificatif au frais:', fraisId);
            await axios.post(`${import.meta.env.VITE_API_URL}/frais/${fraisId}/justificatif`, {
              nom_fichier: uploadedFile.nom_fichier,
              chemin_fichier: uploadedFile.chemin_fichier,
              type_mime: uploadedFile.type_mime,
              taille_fichier: uploadedFile.taille_fichier
            });
            console.log('Justificatif associé avec succès');
          } catch (associationError) {
            console.error('Erreur association justificatif:', associationError);
            // Le frais est créé, mais l'association du justificatif a échoué
            alert('Le frais a été créé mais l\'association du justificatif a échoué.');
          }
        }

        const message = isEditMode 
          ? `Frais modifié avec succès`
          : statut === 'brouillon' 
            ? `Frais sauvegardé en brouillon - Note #${finalNoteId}`
            : `Frais soumis pour validation - Note #${finalNoteId}`;
        
        alert(message + (uploadedFile ? ' (avec justificatif)' : ''));
        
        // Rediriger vers la page de détail de la note
        window.location.hash = `#/notes-frais/note/${finalNoteId}`;
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
            {isEditMode ? `Mode édition - Note #${noteId}` : 'Nouvelle note'}
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
        {/* Left Panel - Justificatif Preview OU Carte kilométrique */}
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
                  className="form-input"
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