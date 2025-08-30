import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const DetailTypeFraisPage = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const { societe_id } = useAuth();
  
  const [typeFrais, setTypeFrais] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [comptesComptables, setComptesComptables] = useState([]);
  
  // États pour les modifications
  const [formData, setFormData] = useState({
    libelle: '',
    actif: true,
    tva_deductible: 'oui', // 'oui', 'non', 'partielle'
    taux_deduction_tva: 100,
    compte_comptable_id: null,
    description: ''
  });

  useEffect(() => {
    loadTypeFrais();
    loadComptesComptables();
  }, [typeId]);

  const loadTypeFrais = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les types pour trouver celui qui nous intéresse
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/types-frais/manage/${societe_id}`);
      
      if (response.data.success) {
        const type = response.data.types_frais.find(t => t.id == typeId);
        
        if (type) {
          setTypeFrais(type);
          setFormData({
            libelle: type.libelle,
            actif: type.actif,
            tva_deductible: type.tva_deductible || 'oui',
            taux_deduction_tva: type.taux_deduction_tva || 100,
            compte_comptable_id: type.compte_comptable_id || null,
            description: type.description || ''
          });
        } else {
          throw new Error('Type de frais non trouvé');
        }
      }
    } catch (error) {
      console.error('Erreur chargement type de frais:', error);
      Swal.fire('Erreur', 'Erreur lors du chargement du type de frais', 'error');
      navigate('/depenses/parametres');
    } finally {
      setLoading(false);
    }
  };

  const loadComptesComptables = async () => {
    try {
      // Charger les comptes disponibles pour cette société (système + personnalisés)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/comptes-comptables/societe/${societe_id}`);
      if (response.data.success) {
        // Filtrer uniquement les comptes actifs et trier par personnalisés en premier
        const comptesActifs = response.data.comptes_comptables.filter(compte => compte.actif);
        
        // Trier pour mettre les comptes personnalisés en premier
        const comptesTries = comptesActifs.sort((a, b) => {
          if (a.is_personalized && !b.is_personalized) return -1;
          if (!a.is_personalized && b.is_personalized) return 1;
          return a.numero_compte.localeCompare(b.numero_compte);
        });
        
        setComptesComptables(comptesTries);
      }
    } catch (error) {
      console.error('Erreur chargement comptes comptables:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (!formData.libelle.trim()) {
        Swal.fire('Erreur', 'Le libellé est requis', 'error');
        return;
      }

      if (formData.tva_deductible === 'partielle' && (formData.taux_deduction_tva < 0 || formData.taux_deduction_tva > 100)) {
        Swal.fire('Erreur', 'Le taux de déduction TVA doit être entre 0 et 100%', 'error');
        return;
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/types-frais/${typeId}`, {
        ...formData,
        societeId: societe_id
      });

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Type de frais mis à jour avec succès',
        timer: 2000,
        showConfirmButton: false
      });

      // Recharger les données
      await loadTypeFrais();

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement du type de frais...</p>
        </div>
      </div>
    );
  }

  if (!typeFrais) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">
          <h4>Type de frais non trouvé</h4>
          <p>Le type de frais demandé n'existe pas ou vous n'avez pas les permissions pour y accéder.</p>
          <Link to="/depenses/parametres" className="btn btn-primary">
            Retour aux paramètres
          </Link>
        </div>
      </div>
    );
  }

  // Tous les types peuvent maintenant être personnalisés
  const canPersonalize = true;

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Link 
                to="/depenses/parametres" 
                className="btn btn-outline-secondary me-3"
              >
                <FiArrowLeft className="me-1" />
                Retour
              </Link>
              <div>
                <h2 className="mb-1">
                  Configuration - {typeFrais.libelle}
                  {typeFrais.is_system && (
                    <span className="badge bg-info-subtle text-info ms-2">
                      <i className="fas fa-cog me-1"></i>
                      {typeFrais.is_personalized ? 'Système personnalisé' : 'Système'}
                    </span>
                  )}
                  {!typeFrais.is_system && (
                    <span className="badge bg-success-subtle text-success ms-2">
                      <i className="fas fa-plus me-1"></i>
                      Personnalisé
                    </span>
                  )}
                </h2>
                <p className="text-muted mb-0">
                  Paramétrage détaillé du type de frais
                </p>
              </div>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              <FiSave className="me-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Configuration principale */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Configuration générale</h5>
            </div>
            <div className="card-body">
              {/* Libellé */}
              <div className="mb-4">
                <label className="form-label">
                  Libellé du type de frais <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.libelle}
                  onChange={(e) => handleInputChange('libelle', e.target.value)}
                  placeholder="Ex: Transport en commun"
                />
                <div className="form-text">
                  <i className="fas fa-info-circle me-1"></i>
                  Tous les types peuvent être personnalisés selon vos besoins
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description optionnelle de ce type de frais"
                />
              </div>

              {/* Statut actif */}
              <div className="mb-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="actif-switch"
                    checked={formData.actif}
                    onChange={(e) => handleInputChange('actif', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="actif-switch">
                    <strong>Type de frais actif</strong>
                  </label>
                </div>
                <div className="form-text">
                  Les types inactifs ne sont plus proposés lors de la création de frais
                </div>
              </div>
            </div>
          </div>

          {/* Configuration TVA */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Configuration TVA</h5>
            </div>
            <div className="card-body">
              {/* TVA déductible */}
              <div className="mb-4">
                <label className="form-label">TVA déductible</label>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tva_deductible"
                        id="tva_oui"
                        value="oui"
                        checked={formData.tva_deductible === 'oui'}
                        onChange={(e) => handleInputChange('tva_deductible', e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="tva_oui">
                        <span className="text-success">Oui (100%)</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tva_deductible"
                        id="tva_non"
                        value="non"
                        checked={formData.tva_deductible === 'non'}
                        onChange={(e) => handleInputChange('tva_deductible', e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="tva_non">
                        <span className="text-danger">Non (0%)</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tva_deductible"
                        id="tva_partielle"
                        value="partielle"
                        checked={formData.tva_deductible === 'partielle'}
                        onChange={(e) => handleInputChange('tva_deductible', e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="tva_partielle">
                        <span className="text-warning">Partielle</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taux de déduction partielle */}
              {formData.tva_deductible === 'partielle' && (
                <div className="mb-4">
                  <label className="form-label">Taux de déduction TVA (%)</label>
                  <div className="row">
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        value={formData.taux_deduction_tva}
                        onChange={(e) => handleInputChange('taux_deduction_tva', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="form-text">
                        Pourcentage de TVA déductible pour ce type de frais (entre 0 et 100%)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration comptable */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Configuration comptable</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label">Compte comptable</label>
                <select
                  className="form-select"
                  value={formData.compte_comptable_id || ''}
                  onChange={(e) => handleInputChange('compte_comptable_id', e.target.value || null)}
                >
                  <option value="">-- Sélectionner un compte --</option>
                  {comptesComptables.map(compte => (
                    <option key={compte.id} value={compte.id}>
                      {compte.numero_compte} - {compte.libelle}
                      {compte.is_personalized && ' (Personnalisé)'}
                      {!compte.is_system && !compte.is_personalized && ' (Ajouté)'}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  Compte comptable utilisé pour l'imputation de ce type de frais.
                  <Link to="/societe/configuration" className="ms-2" target="_blank">
                    Gérer les comptes comptables
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau d'informations */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Informations</h6>
            </div>
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-5">Type :</dt>
                <dd className="col-7">
                  {isSystemType ? (
                    <span className="badge bg-info">Système</span>
                  ) : (
                    <span className="badge bg-primary">Personnalisé</span>
                  )}
                </dd>

                <dt className="col-5">Code :</dt>
                <dd className="col-7">
                  <code>{typeFrais.nom}</code>
                </dd>

                <dt className="col-5">Statut :</dt>
                <dd className="col-7">
                  <span className={`badge ${formData.actif ? 'bg-success' : 'bg-secondary'}`}>
                    {formData.actif ? 'Actif' : 'Inactif'}
                  </span>
                </dd>

                <dt className="col-5">TVA :</dt>
                <dd className="col-7">
                  {formData.tva_deductible === 'oui' && (
                    <span className="badge bg-success">100% déductible</span>
                  )}
                  {formData.tva_deductible === 'non' && (
                    <span className="badge bg-danger">Non déductible</span>
                  )}
                  {formData.tva_deductible === 'partielle' && (
                    <span className="badge bg-warning">
                      {formData.taux_deduction_tva}% déductible
                    </span>
                  )}
                </dd>
              </dl>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h6 className="card-title mb-0">Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  Sauvegarder
                </button>
                <Link 
                  to="/depenses/parametres"
                  className="btn btn-outline-secondary"
                >
                  <FiArrowLeft className="me-2" />
                  Retour à la liste
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTypeFraisPage;