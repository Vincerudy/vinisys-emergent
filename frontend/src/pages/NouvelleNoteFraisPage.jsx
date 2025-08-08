import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiUpload,
  FiSave,
  FiSend,
  FiPercent,
  FiMapPin,
  FiClock,
  FiFileText,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiCamera,
  FiPaperclip
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/NouvelleNoteFraisPage.css';

const NouvelleNoteFraisPage = () => {
  const { societe_id, user_id } = useAuth();
  
  const [noteData, setNoteData] = useState({
    motif: '',
    destination: '',
    date_debut: '',
    date_fin: '',
    projet_id: '',
    commentaire: '',
    statut: 'brouillon'
  });

  const [lignesfrais, setLignesfrais] = useState([]);
  const [typesFrais, setTypesFrais] = useState([]);
  const [projets, setProjets] = useState([]);
  const [baremes, setBaremes] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [societe_id]);

  const fetchInitialData = async () => {
    try {
      const [typesRes, projetsRes, baremesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/types-frais/${societe_id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/projets/${societe_id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/notes-frais/baremes/${societe_id}`)
      ]);
      
      setTypesFrais(typesRes.data || []);
      setProjets(projetsRes.data || []);
      setBaremes(baremesRes.data || {});
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const ajouterLigne = (type = '') => {
    const nouvelleLigne = {
      id: Date.now() + Math.random(),
      type_frais: type,
      date_frais: new Date().toISOString().split('T')[0],
      description: '',
      montant: 0,
      justificatif: null,
      kilometrage: {
        km_aller_retour: 0,
        bareme_km: 0.518, // Barème URSSAF 2025
        vehicule_type: 'voiture'
      }
    };
    
    setLignesfrais([...lignesfrais, nouvelleLigne]);
  };

  const modifierLigne = (id, champ, valeur) => {
    setLignesfrais(lignesfrais.map(ligne => {
      if (ligne.id === id) {
        if (champ.includes('kilometrage.')) {
          const kmChamp = champ.split('.')[1];
          const nouveauKm = { ...ligne.kilometrage, [kmChamp]: valeur };
          
          // Recalcul automatique du montant kilométrique
          if (kmChamp === 'km_aller_retour' || kmChamp === 'bareme_km') {
            nouveauKm.montant_calcule = nouveauKm.km_aller_retour * nouveauKm.bareme_km;
            return { 
              ...ligne, 
              kilometrage: nouveauKm,
              montant: nouveauKm.montant_calcule
            };
          }
          
          return { ...ligne, kilometrage: nouveauKm };
        }
        return { ...ligne, [champ]: valeur };
      }
      return ligne;
    }));
  };

  const supprimerLigne = (id) => {
    setLignesfrais(lignesfrais.filter(ligne => ligne.id !== id));
  };

  const handleFileUpload = (ligneId, file) => {
    // Simulation d'upload avec OCR
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ligne_id', ligneId);
    
    // Ici on simulerait l'OCR et l'extraction automatique
    // Pour la démo, on met juste le nom du fichier
    modifierLigne(ligneId, 'justificatif', {
      nom: file.name,
      taille: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    });
    
    // Simulation extraction OCR
    if (file.type.includes('image')) {
      setTimeout(() => {
        // Simulation de données extraites par OCR
        const montantExtrait = Math.random() * 100;
        modifierLigne(ligneId, 'montant', montantExtrait.toFixed(2));
        modifierLigne(ligneId, 'description', `Frais extrait automatiquement - ${file.name}`);
      }, 2000);
    }
  };

  const calculerTotal = () => {
    return lignesfrais.reduce((total, ligne) => total + parseFloat(ligne.montant || 0), 0);
  };

  const sauvegarder = async (statut = 'brouillon') => {
    try {
      setSaving(true);
      
      const noteComplete = {
        ...noteData,
        statut,
        montant_total: calculerTotal(),
        lignes_frais: lignesfrais.map(ligne => ({
          ...ligne,
          montant: parseFloat(ligne.montant || 0)
        }))
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

  const getTypeFraisIcon = (type) => {
    const icons = {
      'kilometrique': FiMapPin,
      'repas': FiDollarSign,
      'hebergement': FiUser,
      'transport': FiMapPin,
      'fourniture': FiFileText,
      'autre': FiPlus
    };
    return icons[type] || FiFileText;
  };

  return (
    <div className="nouvelle-note-frais-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiFileText />
            Nouvelle note de frais
          </h1>
          <p className="page-subtitle">
            Créez votre demande de remboursement avec justificatifs
          </p>
        </div>
        <div className="header-actions">
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
            <FiSave size={18} />
            Sauvegarder
          </button>
          <button 
            className="btn-primary"
            onClick={() => sauvegarder('soumise')}
            disabled={saving || lignesfrais.length === 0}
          >
            <FiSend size={18} />
            Soumettre
          </button>
        </div>
      </div>

      <div className="form-container">
        {/* Informations générales */}
        <div className="form-section">
          <div className="section-header">
            <h2>
              <FiFileText />
              Informations générales
            </h2>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Motif du déplacement/frais *</label>
              <input
                type="text"
                placeholder="Ex: Visite client, Formation, Déplacement professionnel..."
                value={noteData.motif}
                onChange={(e) => setNoteData({...noteData, motif: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Destination</label>
              <input
                type="text"
                placeholder="Ville ou lieu de destination"
                value={noteData.destination}
                onChange={(e) => setNoteData({...noteData, destination: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Date début</label>
              <input
                type="date"
                value={noteData.date_debut}
                onChange={(e) => setNoteData({...noteData, date_debut: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Date fin</label>
              <input
                type="date"
                value={noteData.date_fin}
                onChange={(e) => setNoteData({...noteData, date_fin: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Projet/Centre de coût</label>
              <select 
                value={noteData.projet_id}
                onChange={(e) => setNoteData({...noteData, projet_id: e.target.value})}
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
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Types de frais rapides */}
        <div className="quick-add-section">
          <h3>
            <FiPlus />
            Ajouter rapidement
          </h3>
          <div className="quick-add-buttons">
            <button 
              className="quick-add-btn kilometrique"
              onClick={() => ajouterLigne('kilometrique')}
            >
              <FiMapPin />
              Frais kilométriques
            </button>
            <button 
              className="quick-add-btn repas"
              onClick={() => ajouterLigne('repas')}
            >
              <FiDollarSign />
              Repas
            </button>
            <button 
              className="quick-add-btn hebergement"
              onClick={() => ajouterLigne('hebergement')}
            >
              <FiUser />
              Hébergement
            </button>
            <button 
              className="quick-add-btn transport"
              onClick={() => ajouterLigne('transport')}
            >
              <FiMapPin />
              Transport
            </button>
            <button 
              className="quick-add-btn autre"
              onClick={() => ajouterLigne('autre')}
            >
              <FiPlus />
              Autres frais
            </button>
          </div>
        </div>

        {/* Lignes de frais */}
        <div className="lignes-frais-section">
          <div className="section-header">
            <h2>
              <FiCalculator />
              Détail des frais ({lignesfrais.length})
            </h2>
            {calculerTotal() > 0 && (
              <div className="total-badge">
                Total: {calculerTotal().toFixed(2)} €
              </div>
            )}
          </div>

          {lignesfrais.length === 0 ? (
            <div className="empty-state">
              <FiFileText className="empty-icon" />
              <h3>Aucun frais ajouté</h3>
              <p>Utilisez les boutons ci-dessus pour ajouter vos frais</p>
            </div>
          ) : (
            <div className="lignes-container">
              {lignesfrais.map((ligne) => {
                const IconComponent = getTypeFraisIcon(ligne.type_frais);
                
                return (
                  <div key={ligne.id} className="ligne-frais-card">
                    <div className="ligne-header">
                      <div className="ligne-type">
                        <IconComponent className="type-icon" />
                        <select 
                          value={ligne.type_frais}
                          onChange={(e) => modifierLigne(ligne.id, 'type_frais', e.target.value)}
                          className="type-select"
                        >
                          <option value="">Type de frais</option>
                          {typesFrais.map(type => (
                            <option key={type.id} value={type.nom}>
                              {type.libelle}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button 
                        className="delete-ligne"
                        onClick={() => supprimerLigne(ligne.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="ligne-content">
                      <div className="ligne-form-grid">
                        <div className="form-group">
                          <label>Date</label>
                          <input
                            type="date"
                            value={ligne.date_frais}
                            onChange={(e) => modifierLigne(ligne.id, 'date_frais', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Description</label>
                          <input
                            type="text"
                            placeholder="Description du frais"
                            value={ligne.description}
                            onChange={(e) => modifierLigne(ligne.id, 'description', e.target.value)}
                          />
                        </div>

                        {ligne.type_frais === 'kilometrique' ? (
                          <>
                            <div className="form-group">
                              <label>Distance A/R (km)</label>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={ligne.kilometrage.km_aller_retour}
                                onChange={(e) => modifierLigne(ligne.id, 'kilometrage.km_aller_retour', parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            <div className="form-group">
                              <label>Barème (€/km)</label>
                              <select
                                value={ligne.kilometrage.bareme_km}
                                onChange={(e) => modifierLigne(ligne.id, 'kilometrage.bareme_km', parseFloat(e.target.value))}
                              >
                                <option value={0.518}>Voiture (0,518 €/km)</option>
                                <option value={0.315}>Moto (0,315 €/km)</option>
                                <option value={0.25}>Vélo (0,25 €/km)</option>
                              </select>
                            </div>

                            <div className="form-group montant-calcule">
                              <label>Montant calculé</label>
                              <div className="montant-display">
                                {(ligne.kilometrage.km_aller_retour * ligne.kilometrage.bareme_km).toFixed(2)} €
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="form-group">
                            <label>Montant (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={ligne.montant}
                              onChange={(e) => modifierLigne(ligne.id, 'montant', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        )}

                        {/* Upload justificatif */}
                        <div className="form-group justificatif-group">
                          <label>Justificatif</label>
                          {ligne.justificatif ? (
                            <div className="justificatif-uploaded">
                              <div className="file-info">
                                <FiPaperclip />
                                <span>{ligne.justificatif.nom}</span>
                              </div>
                              <button 
                                className="remove-file"
                                onClick={() => modifierLigne(ligne.id, 'justificatif', null)}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="upload-zone">
                              <input
                                type="file"
                                id={`file-${ligne.id}`}
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    handleFileUpload(ligne.id, e.target.files[0]);
                                  }
                                }}
                                style={{ display: 'none' }}
                              />
                              <label htmlFor={`file-${ligne.id}`} className="upload-label">
                                <FiUpload />
                                <span>Cliquer ou glisser</span>
                                <small>Image ou PDF</small>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Résumé */}
        {lignesfrais.length > 0 && (
          <div className="resume-section">
            <h3>Résumé de la note</h3>
            <div className="resume-cards">
              <div className="resume-card">
                <div className="resume-icon">
                  <FiFileText />
                </div>
                <div className="resume-content">
                  <div className="resume-value">{lignesfrais.length}</div>
                  <div className="resume-label">Ligne(s) de frais</div>
                </div>
              </div>

              <div className="resume-card">
                <div className="resume-icon total">
                  <FiDollarSign />
                </div>
                <div className="resume-content">
                  <div className="resume-value">{calculerTotal().toFixed(2)} €</div>
                  <div className="resume-label">Montant total</div>
                </div>
              </div>

              <div className="resume-card">
                <div className="resume-icon">
                  <FiPaperclip />
                </div>
                <div className="resume-content">
                  <div className="resume-value">
                    {lignesfrais.filter(l => l.justificatif).length}
                  </div>
                  <div className="resume-label">Justificatif(s)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NouvelleNoteFraisPage;