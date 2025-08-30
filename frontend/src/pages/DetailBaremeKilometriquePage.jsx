import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const DetailBaremeKilometriquePage = () => {
  const { baremeId } = useParams();
  const navigate = useNavigate();
  const { societe_id } = useAuth();
  
  const [bareme, setBareme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    puissance_fiscale_min: '',
    puissance_fiscale_max: '',
    tarif_par_km: '',
    actif: true
  });

  useEffect(() => {
    loadBareme();
  }, [baremeId]);

  const loadBareme = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les barèmes pour trouver celui qui nous intéresse
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/baremes-kilometriques/societe/${societe_id}`);
      
      if (response.data.success) {
        const bareme = response.data.baremes_kilometriques.find(b => b.id == baremeId);
        
        if (bareme) {
          setBareme(bareme);
          setFormData({
            nom: bareme.nom,
            description: bareme.description || '',
            puissance_fiscale_min: bareme.puissance_fiscale_min || 0,
            puissance_fiscale_max: bareme.puissance_fiscale_max || 0,
            tarif_par_km: bareme.tarif_km,
            actif: bareme.actif
          });
        } else {
          throw new Error('Barème kilométrique non trouvé');
        }
      }
    } catch (error) {
      console.error('Erreur chargement barème:', error);
      Swal.fire('Erreur', 'Erreur lors du chargement du barème kilométrique', 'error');
      navigate('/depenses/parametres');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (!formData.nom.trim()) {
        Swal.fire('Erreur', 'Le nom est requis', 'error');
        return;
      }

      if (!formData.tarif_par_km || formData.tarif_par_km <= 0) {
        Swal.fire('Erreur', 'Le tarif par kilomètre doit être supérieur à 0', 'error');
        return;
      }

      // Préparer les données avec les conversions nécessaires
      const saveData = {
        nom: formData.nom.trim(),
        description: formData.description?.trim() || null,
        puissance_fiscale_min: parseInt(formData.puissance_fiscale_min) || 0,
        puissance_fiscale_max: parseInt(formData.puissance_fiscale_max) || 0,
        tarif_par_km: parseFloat(formData.tarif_par_km),
        actif: formData.actif ? 1 : 0,
        societeId: societe_id
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/baremes-kilometriques/${baremeId}`, saveData);

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Barème kilométrique mis à jour avec succès',
        timer: 2000,
        showConfirmButton: false
      });

      // Recharger les données
      await loadBareme();

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement du barème kilométrique...</p>
        </div>
      </div>
    );
  }

  if (!bareme) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">
          <h4>Barème kilométrique non trouvé</h4>
          <p>Le barème demandé n'existe pas ou vous n'avez pas les permissions pour y accéder.</p>
          <Link to="/depenses/parametres" className="btn btn-primary">
            Retour aux paramètres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nxl-content">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <Link to="/depenses/parametres" className="btn btn-outline-primary me-3">
            <FiArrowLeft />
          </Link>
          <div className="page-header-title">
            <div className="d-flex align-items-center">
              <div>
                <h2 className="mb-1">
                  Configuration - {bareme.nom}
                  {bareme.is_system && (
                    <span className="badge bg-info-subtle text-info ms-2">
                      <i className="fas fa-cog me-1"></i>
                      {bareme.is_personalized ? 'Système personnalisé' : 'Système'}
                    </span>
                  )}
                  {!bareme.is_system && (
                    <span className="badge bg-success-subtle text-success ms-2">
                      <i className="fas fa-plus me-1"></i>
                      Personnalisé
                    </span>
                  )}
                </h2>
                <p className="fs-13 text-muted m-b-0">
                  Modifier les paramètres de ce barème kilométrique
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="page-header-right ms-auto">
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Sauvegarde...</span>
                </div>
                Sauvegarde...
              </>
            ) : (
              <>
                <FiSave className="me-2" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="row">
          <div className="col-lg-8">
            {/* Configuration principale */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Informations générales</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label">Nom du barème <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        placeholder="Ex: Véhicule économique"
                      />
                      <div className="form-text">
                        <i className="fas fa-info-circle me-1"></i>
                        Tous les barèmes peuvent être personnalisés selon vos besoins
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label">Tarif par kilomètre (€) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        step="0.001"
                        className="form-control"
                        value={formData.tarif_par_km}
                        onChange={(e) => handleInputChange('tarif_par_km', e.target.value)}
                        placeholder="0.529"
                      />
                      <div className="form-text">
                        Montant remboursé par kilomètre parcouru
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description détaillée de ce barème..."
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label">Puissance fiscale min (CV)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.puissance_fiscale_min}
                        onChange={(e) => handleInputChange('puissance_fiscale_min', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label">Puissance fiscale max (CV)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.puissance_fiscale_max}
                        onChange={(e) => handleInputChange('puissance_fiscale_max', e.target.value)}
                        placeholder="3"
                      />
                    </div>
                  </div>
                </div>

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
                      <strong>Barème actif</strong>
                    </label>
                  </div>
                  <div className="form-text">
                    Les barèmes inactifs ne sont plus proposés lors du calcul kilométrique
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Informations du barème */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Informations</h5>
              </div>
              <div className="card-body">
                <dl className="row mb-0">
                  <dt className="col-5">Type :</dt>
                  <dd className="col-7">
                    {bareme.is_system ? (
                      bareme.is_personalized ? (
                        <span className="badge bg-warning">Système personnalisé</span>
                      ) : (
                        <span className="badge bg-info">Système</span>
                      )
                    ) : (
                      <span className="badge bg-primary">Entièrement personnalisé</span>
                    )}
                  </dd>
                  
                  <dt className="col-5">Puissance :</dt>
                  <dd className="col-7">
                    <code>{bareme.puissance_fiscale}</code>
                  </dd>
                  
                  <dt className="col-5">Tarif actuel :</dt>
                  <dd className="col-7">
                    <strong className="text-primary">
                      {parseFloat(bareme.tarif_km).toFixed(3)}€/km
                    </strong>
                  </dd>
                  
                  <dt className="col-5">Statut :</dt>
                  <dd className="col-7">
                    <span className={`badge ${bareme.actif ? 'bg-success' : 'bg-secondary'}`}>
                      {bareme.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBaremeKilometriquePage;