import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiUpload, FiCalculator } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const NouvelleDepensePage = () => {
  const { id: userId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, [userId]);

  useEffect(() => {
    loadCategories();
  }, [formData.type]);

  const loadInitialData = async () => {
    try {
      // Charger les barèmes kilométriques
      const baremesResponse = await api.get(`/baremes/${userId}`);
      setBaremes(baremesResponse.data);

      // Charger les clients
      const clientsResponse = await api.get(`/listeClient/${userId}`);
      setClients(clientsResponse.data);
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
        puissanceFiscale: 5, // Valeur par défaut, pourrait être configurée
        annee: new Date().getFullYear()
      });

      const montant = response.data.montantCalcule;
      setMontantCalcule(response.data);
      setFormData(prev => ({
        ...prev,
        montantTTC: montant.toString(),
        montantHT: montant.toString(), // Pas de TVA sur les frais kilométriques
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Erreur', 'Le fichier ne doit pas dépasser 5MB', 'error');
        return;
      }
      
      // Vérifier le type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Erreur', 'Seuls les fichiers JPG, PNG et PDF sont acceptés', 'error');
        return;
      }
      
      setJustificatif(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.dateDepense || !formData.montantTTC) {
      Swal.fire('Erreur', 'La date et le montant sont obligatoires', 'error');
      return;
    }

    if (formData.type === 'kilometrique' && (!formData.lieuDepart || !formData.lieuArrivee || !formData.distanceKm)) {
      Swal.fire('Erreur', 'Pour une dépense kilométrique, les lieux de départ, d\'arrivée et la distance sont obligatoires', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs du formulaire
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append('userId', userId);
      
      // Ajouter le fichier si présent
      if (justificatif) {
        formDataToSend.append('justificatif', justificatif);
      }

      await api.post('/depense', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Swal.fire('Succès', 'Dépense créée avec succès', 'success').then(() => {
        navigate('/depenses');
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
          <Link to="/depenses" className="btn btn-outline-primary me-3">
            <FiArrowLeft />
          </Link>
          <div className="page-header-title">
            <h5 className="m-b-10">Nouvelle Dépense</h5>
          </div>
        </div>
      </div>

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
                    <label className="form-label">Client (optionnel)</label>
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

            {/* Détails spécifiques au type */}
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
                      <label className="form-label">Barème</label>
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
                      <input
                        type="text"
                        className="form-control"
                        value={formData.typeVehicule}
                        onChange={(e) => handleInputChange('typeVehicule', e.target.value)}
                        placeholder="ex: Véhicule personnel"
                      />
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
                      <label className="form-label">Nombre de personnes</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.nombrePersonnes}
                        onChange={(e) => handleInputChange('nombrePersonnes', e.target.value)}
                        min="1"
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
                <h6 className="card-title mb-0">💰 Montants</h6>
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
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Montant HT (€)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.montantHT}
                    step="0.01"
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Montant TVA (€)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.montantTVA}
                    step="0.01"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">📎 Justificatif</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Fichier justificatif</label>
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
                    Fichier sélectionné: {justificatif.name}
                  </div>
                )}
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Création...
                  </>
                ) : (
                  'Créer la dépense'
                )}
              </button>
              <Link to="/depenses" className="btn btn-outline-secondary">
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NouvelleDepensePage;