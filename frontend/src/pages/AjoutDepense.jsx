import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiUpload, FiCalculator, FiCamera, FiFile, FiCheck, FiEdit3, FiSave } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const AjoutDepense = () => {
  const { id: userId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('manuel'); // 'manuel' ou 'ocr'
  
  // Données pour les dropdowns
  const [categories, setCategories] = useState([]);
  const [baremes, setBaremes] = useState([]);
  const [clients, setClients] = useState([]);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    type: 'autres',
    categorieId: '',
    dateDepense: new Date().toISOString().split('T')[0],
    description: '',
    montantTTC: '',
    montantHT: '',
    montantTVA: '',
    tauxTVA: '20',
    clientId: '',
    projetId: '',
    // Kilométrique
    lieuDepart: '',
    lieuArrivee: '',
    distanceKm: '',
    baremeId: '',
    typeVehicule: '',
    // Repas
    lieuRepas: '',
    nombrePersonnes: '1',
    typeRepas: 'dejeuner'
  });

  const [justificatif, setJustificatif] = useState(null);
  const [montantCalcule, setMontantCalcule] = useState(null);
  
  // États pour l'OCR
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [showOcrPreview, setShowOcrPreview] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, [userId]);

  useEffect(() => {
    loadCategories();
  }, [formData.type]);

  const loadInitialData = async () => {
    try {
      const [baremesRes, clientsRes] = await Promise.all([
        api.get(`/baremes/${userId}`),
        api.get(`/listeClient/${userId}`)
      ]);
      
      setBaremes(baremesRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get(`/categories/${userId}?type=${formData.type}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Recalculer automatiquement pour les dépenses kilométriques
    if ((field === 'distanceKm' || field === 'baremeId') && formData.type === 'kilometrique') {
      calculateKilometricAmount();
    }

    // Recalculer la TVA
    if (field === 'montantTTC' || field === 'tauxTVA') {
      calculateTVA(field === 'montantTTC' ? value : formData.montantTTC, field === 'tauxTVA' ? value : formData.tauxTVA);
    }
  };

  const calculateKilometricAmount = async () => {
    if (!formData.distanceKm || !formData.baremeId || formData.type !== 'kilometrique') return;

    try {
      const response = await api.post('/calculer-montant', {
        userId,
        distanceKm: formData.distanceKm,
        puissanceFiscale: 5,
        annee: new Date().getFullYear()
      });

      const montant = response.data.montantCalcule;
      setMontantCalcule(response.data);
      setFormData(prev => ({
        ...prev,
        montantTTC: montant.toString(),
        montantHT: montant.toString(),
        montantTVA: '0',
        tauxTVA: '0'
      }));
    } catch (error) {
      console.error('Erreur lors du calcul du montant:', error);
    }
  };

  const calculateTVA = (montantTTC, tauxTVA) => {
    const ttc = parseFloat(montantTTC) || 0;
    const taux = parseFloat(tauxTVA) || 0;
    
    if (taux > 0) {
      const ht = ttc / (1 + taux / 100);
      const tva = ttc - ht;
      
      setFormData(prev => ({
        ...prev,
        montantHT: ht.toFixed(2),
        montantTVA: tva.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        montantHT: ttc.toFixed(2),
        montantTVA: '0'
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Vérifications de base
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Erreur', 'Le fichier ne doit pas dépasser 5MB', 'error');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire('Erreur', 'Seuls les fichiers JPG, PNG et PDF sont acceptés', 'error');
      return;
    }
    
    setJustificatif(file);

    // Si on est en mode OCR, traiter le fichier
    if (mode === 'ocr') {
      await processOCR(file);
    }
  };

  const processOCR = async (file) => {
    if (!file) return;
    
    setOcrProcessing(true);
    
    try {
      // Simulation d'OCR pour la démo (remplacer par vraie API OCR)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Résultat simulé d'OCR
      const mockOcrResult = {
        date: new Date().toISOString().split('T')[0],
        montantTTC: (Math.random() * 100 + 10).toFixed(2),
        fournisseur: 'Restaurant Le Gourmet',
        description: 'Déjeuner d\'affaires',
        tva: '20',
        confidence: 0.85
      };
      
      setOcrResult(mockOcrResult);
      setShowOcrPreview(true);
      
      // Pré-remplir le formulaire
      setFormData(prev => ({
        ...prev,
        dateDepense: mockOcrResult.date,
        montantTTC: mockOcrResult.montantTTC,
        description: mockOcrResult.description,
        tauxTVA: mockOcrResult.tva,
        type: 'repas' // Suggérer le type selon le contenu
      }));
      
      // Recalculer la TVA
      calculateTVA(mockOcrResult.montantTTC, mockOcrResult.tva);
      
      Swal.fire({
        title: 'OCR terminé !',
        text: `Données extraites avec ${(mockOcrResult.confidence * 100).toFixed(0)}% de confiance`,
        icon: 'success',
        timer: 2000
      });
      
    } catch (error) {
      console.error('Erreur OCR:', error);
      Swal.fire('Erreur', 'Impossible de traiter le document avec l\'OCR', 'error');
    } finally {
      setOcrProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'autres',
      categorieId: '',
      dateDepense: new Date().toISOString().split('T')[0],
      description: '',
      montantTTC: '',
      montantHT: '',
      montantTVA: '',
      tauxTVA: '20',
      clientId: '',
      projetId: '',
      lieuDepart: '',
      lieuArrivee: '',
      distanceKm: '',
      baremeId: '',
      typeVehicule: '',
      lieuRepas: '',
      nombrePersonnes: '1',
      typeRepas: 'dejeuner'
    });
    setJustificatif(null);
    setOcrResult(null);
    setShowOcrPreview(false);
    setMontantCalcule(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.dateDepense || !formData.montantTTC) {
      Swal.fire('Erreur', 'La date et le montant sont obligatoires', 'error');
      return;
    }

    if (formData.type === 'kilometrique' && (!formData.lieuDepart || !formData.lieuArrivee || !formData.distanceKm)) {
      Swal.fire('Erreur', 'Pour une dépense kilométrique, les lieux et la distance sont obligatoires', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append('userId', userId);
      
      if (justificatif) {
        formDataToSend.append('justificatif', justificatif);
      }

      await api.post('/depense', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Swal.fire('Succès', 'Dépense créée avec succès', 'success').then(() => {
        navigate('/depenses/tableau-bord');
      });

    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Swal.fire('Erreur', 'Impossible de créer la dépense', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nxl-content">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <Link to="/depenses/tableau-bord" className="btn btn-outline-primary me-3">
            <FiArrowLeft />
          </Link>
          <div className="page-header-title">
            <h5 className="m-b-10">Nouvelle Dépense</h5>
            <p className="fs-13 text-muted m-b-0">
              Saisie manuelle ou automatique via OCR
            </p>
          </div>
        </div>
        <div className="page-header-right ms-auto">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${mode === 'manuel' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMode('manuel')}
            >
              <FiEdit3 className="me-2" />
              Manuel
            </button>
            <button
              type="button"
              className={`btn ${mode === 'ocr' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMode('ocr')}
            >
              <FiCamera className="me-2" />
              OCR
            </button>
          </div>
        </div>
      </div>

      {/* Mode OCR - Upload et traitement */}
      {mode === 'ocr' && (
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="card-title mb-0">
              📸 Reconnaissance automatique (OCR)
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="border-2 border-dashed border-primary rounded p-4 text-center">
                  <FiCamera className="text-primary mb-3" size={48} />
                  <h6>Déposez votre justificatif ici</h6>
                  <p className="text-muted small">
                    Photo ou PDF de votre reçu/facture
                  </p>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    disabled={ocrProcessing}
                  />
                  {ocrProcessing && (
                    <div className="mt-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Traitement OCR...</span>
                      </div>
                      <p className="mt-2 text-muted">Analyse du document en cours...</p>
                    </div>
                  )}
                </div>
              </div>
              
              {showOcrPreview && ocrResult && (
                <div className="col-md-6">
                  <div className="card bg-success bg-opacity-10 border-success">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        <FiCheck className="me-2" />
                        Données extraites
                      </h6>
                      <div className="row">
                        <div className="col-6">
                          <strong>Date:</strong> {ocrResult.date}
                        </div>
                        <div className="col-6">
                          <strong>Montant:</strong> {ocrResult.montantTTC}€
                        </div>
                        <div className="col-6">
                          <strong>Fournisseur:</strong> {ocrResult.fournisseur}
                        </div>
                        <div className="col-6">
                          <strong>TVA:</strong> {ocrResult.tva}%
                        </div>
                        <div className="col-12 mt-2">
                          <strong>Description:</strong> {ocrResult.description}
                        </div>
                        <div className="col-12 mt-2">
                          <small className="text-muted">
                            Confiance: {(ocrResult.confidence * 100).toFixed(0)}%
                          </small>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button 
                          className="btn btn-success btn-sm me-2"
                          onClick={() => setShowOcrPreview(false)}
                        >
                          <FiCheck className="me-1" />
                          Valider les données
                        </button>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={resetForm}
                        >
                          Recommencer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Informations générales</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Type de dépense *</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      required
                    >
                      <option value="kilometrique">🚗 Kilométrique</option>
                      <option value="repas">🍽️ Repas</option>
                      <option value="autres">📋 Autres frais</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Catégorie</label>
                    <select
                      className="form-select"
                      value={formData.categorieId}
                      onChange={(e) => handleInputChange('categorieId', e.target.value)}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date de la dépense *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dateDepense}
                      onChange={(e) => handleInputChange('dateDepense', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Client / Projet</label>
                    <select
                      className="form-select"
                      value={formData.clientId}
                      onChange={(e) => handleInputChange('clientId', e.target.value)}
                    >
                      <option value="">Aucun client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Décrivez la dépense..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Détails selon le type */}
            {formData.type === 'kilometrique' && (
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">🚗 Détails kilométriques</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Lieu de départ *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lieuDepart}
                        onChange={(e) => handleInputChange('lieuDepart', e.target.value)}
                        placeholder="Adresse de départ"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Lieu d'arrivée *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lieuArrivee}
                        onChange={(e) => handleInputChange('lieuArrivee', e.target.value)}
                        placeholder="Adresse d'arrivée"
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Distance (km) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.distanceKm}
                        onChange={(e) => handleInputChange('distanceKm', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Barème URSSAF</label>
                      <select
                        className="form-select"
                        value={formData.baremeId}
                        onChange={(e) => handleInputChange('baremeId', e.target.value)}
                      >
                        <option value="">Sélectionner un barème</option>
                        {baremes.map(bareme => (
                          <option key={bareme.id} value={bareme.id}>
                            {bareme.nom} ({bareme.tarif_par_km}€/km)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Type de véhicule</label>
                      <select
                        className="form-select"
                        value={formData.typeVehicule}
                        onChange={(e) => handleInputChange('typeVehicule', e.target.value)}
                      >
                        <option value="">Sélectionner</option>
                        <option value="personnel">Véhicule personnel</option>
                        <option value="societe">Véhicule de société</option>
                        <option value="location">Véhicule de location</option>
                      </select>
                    </div>
                  </div>
                  
                  {montantCalcule && (
                    <div className="alert alert-info">
                      <FiCalculator className="me-2" />
                      <strong>Calcul automatique:</strong> {formData.distanceKm} km × {montantCalcule.tarifParKm}€ = {montantCalcule.montantCalcule}€
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.type === 'repas' && (
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">🍽️ Détails repas</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Lieu du repas</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lieuRepas}
                        onChange={(e) => handleInputChange('lieuRepas', e.target.value)}
                        placeholder="Restaurant, ville..."
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Type de repas</label>
                      <select
                        className="form-select"
                        value={formData.typeRepas}
                        onChange={(e) => handleInputChange('typeRepas', e.target.value)}
                      >
                        <option value="petit_dejeuner">Petit déjeuner</option>
                        <option value="dejeuner">Déjeuner</option>
                        <option value="diner">Dîner</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Nb personnes</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.nombrePersonnes}
                        onChange={(e) => handleInputChange('nombrePersonnes', e.target.value)}
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">💰 Montants et TVA</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Montant TTC (€) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.montantTTC}
                    onChange={(e) => handleInputChange('montantTTC', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    readOnly={formData.type === 'kilometrique' && montantCalcule}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Taux TVA (%)</label>
                  <select
                    className="form-select"
                    value={formData.tauxTVA}
                    onChange={(e) => handleInputChange('tauxTVA', e.target.value)}
                    disabled={formData.type === 'kilometrique'}
                  >
                    <option value="0">0% (Exonéré)</option>
                    <option value="5.5">5,5%</option>
                    <option value="10">10% (Restauration)</option>
                    <option value="20">20% (Taux normal)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Montant HT (€)</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={formData.montantHT}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Montant TVA (€)</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={formData.montantTVA}
                    readOnly
                  />
                </div>

                <hr />
                
                <div className="d-flex justify-content-between align-items-center">
                  <strong>Total TTC</strong>
                  <strong className="text-primary h5">
                    {formData.montantTTC ? parseFloat(formData.montantTTC).toFixed(2) : '0.00'}€
                  </strong>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">📎 Justificatif</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">
                    Fichier justificatif {mode === 'manuel' && '(optionnel)'}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                  <small className="text-muted">
                    JPG, PNG ou PDF - Max 5MB
                  </small>
                </div>

                {justificatif && (
                  <div className="alert alert-success">
                    <FiUpload className="me-2" />
                    Fichier: <strong>{justificatif.name}</strong>
                    <br />
                    <small>Taille: {(justificatif.size / 1024).toFixed(1)} KB</small>
                  </div>
                )}
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <FiSave className="me-2" />
                    Créer la dépense
                  </>
                )}
              </button>
              <Link to="/depenses/tableau-bord" className="btn btn-outline-secondary">
                Annuler
              </Link>
              <button 
                type="button" 
                className="btn btn-outline-warning btn-sm"
                onClick={resetForm}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AjoutDepense;