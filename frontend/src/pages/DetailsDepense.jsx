import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiFileText, FiCheck, FiX, FiClock, FiDollarSign } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const DetailsDepense = () => {
  const { id } = useParams();
  const { id: userId } = useAuth();
  const [depense, setDepense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepenseDetails();
  }, [id]);

  const loadDepenseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/depense/${id}`);
      setDepense(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      Swal.fire('Erreur', 'Impossible de charger les détails de la dépense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (action, motif = '') => {
    try {
      const endpoint = action === 'valider' ? 'valider' : action === 'refuser' ? 'refuser' : 'rembourser';
      const data = { userId };
      
      if (action === 'refuser') {
        const result = await Swal.fire({
          title: 'Motif de refus',
          input: 'textarea',
          inputPlaceholder: 'Expliquez pourquoi cette dépense est refusée...',
          showCancelButton: true,
          confirmButtonText: 'Refuser',
          cancelButtonText: 'Annuler',
          inputValidator: (value) => {
            if (!value) return 'Le motif de refus est obligatoire';
          }
        });
        
        if (!result.isConfirmed) return;
        data.motifRefus = result.value;
      }
      
      await api.post(`/depense/${id}/${endpoint}`, data);
      
      Swal.fire('Succès', `Dépense ${action === 'valider' ? 'validée' : action === 'refuser' ? 'refusée' : 'remboursée'} avec succès`, 'success');
      loadDepenseDetails(); // Recharger les données
      
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      Swal.fire('Erreur', 'Impossible de traiter la demande', 'error');
    }
  };

  const getStatusBadge = (statut) => {
    const config = {
      en_attente: { class: 'bg-warning text-dark', text: 'En attente', icon: FiClock },
      validee: { class: 'bg-success', text: 'Validée', icon: FiCheck },
      refusee: { class: 'bg-danger', text: 'Refusée', icon: FiX },
      remboursee: { class: 'bg-info', text: 'Remboursée', icon: FiDollarSign }
    };
    
    const statusConfig = config[statut] || { class: 'bg-secondary', text: statut, icon: FiClock };
    const Icon = statusConfig.icon;
    
    return (
      <span className={`badge ${statusConfig.class} fs-6 px-3 py-2`}>
        <Icon className="me-2" size={14} />
        {statusConfig.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  const getTypeDetails = (type) => {
    const types = {
      kilometrique: { icon: '🚗', name: 'Frais kilométrique', color: 'primary' },
      repas: { icon: '🍽️', name: 'Frais de repas', color: 'success' },
      autres: { icon: '📋', name: 'Autres frais', color: 'warning' }
    };
    return types[type] || types.autres;
  };

  if (loading) {
    return (
      <div className="nxl-content">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!depense) {
    return (
      <div className="nxl-content">
        <div className="text-center py-5">
          <h4>Dépense non trouvée</h4>
          <Link to="/depenses/tableau-bord" className="btn btn-primary">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const typeDetails = getTypeDetails(depense.type);

  return (
    <div className="nxl-content">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <Link to="/depenses/tableau-bord" className="btn btn-outline-primary me-3">
            <FiArrowLeft />
          </Link>
          <div className="page-header-title">
            <h5 className="m-b-10">Détails de la dépense #{depense.id}</h5>
            <p className="fs-13 text-muted m-b-0">
              {formatDate(depense.date_depense)}
            </p>
          </div>
        </div>
        <div className="page-header-right ms-auto">
          <div className="d-flex gap-2">
            {depense.statut === 'en_attente' && (
              <>
                <button 
                  className="btn btn-success"
                  onClick={() => handleValidation('valider')}
                >
                  <FiCheck className="me-2" />
                  Valider
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleValidation('refuser')}
                >
                  <FiX className="me-2" />
                  Refuser
                </button>
              </>
            )}
            {depense.statut === 'validee' && (
              <button 
                className="btn btn-info"
                onClick={() => handleValidation('rembourser')}
              >
                <FiDollarSign className="me-2" />
                Marquer comme remboursée
              </button>
            )}
            {depense.statut === 'en_attente' && (
              <Link 
                to={`/depenses/${depense.id}/modifier`} 
                className="btn btn-outline-primary"
              >
                Modifier
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Informations principales */}
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Informations principales</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <span className="me-3 fs-2">{typeDetails.icon}</span>
                    <div>
                      <h6 className="mb-1">{typeDetails.name}</h6>
                      <span className={`badge bg-${typeDetails.color}-subtle text-${typeDetails.color}`}>
                        {depense.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Statut</label>
                  <div>{getStatusBadge(depense.statut)}</div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Date de la dépense</label>
                  <div>{formatDate(depense.date_depense)}</div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Employé</label>
                  <div>
                    <div>{depense.firstName} {depense.lastName}</div>
                    <small className="text-muted">{depense.email}</small>
                  </div>
                </div>
                {depense.categorie_nom && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Catégorie</label>
                    <div>{depense.categorie_nom}</div>
                    {depense.categorie_description && (
                      <small className="text-muted">{depense.categorie_description}</small>
                    )}
                  </div>
                )}
                {depense.client_nom && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Client / Projet</label>
                    <div>{depense.client_nom}</div>
                  </div>
                )}
                {depense.description && (
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <div className="bg-light p-3 rounded">{depense.description}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Détails spécifiques selon le type */}
          {depense.type === 'kilometrique' && (
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">🚗 Détails du déplacement</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Lieu de départ</label>
                    <div>{depense.lieu_depart}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Lieu d'arrivée</label>
                    <div>{depense.lieu_arrivee}</div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">Distance</label>
                    <div>
                      <span className="h5 text-primary">{depense.distance_km}</span> km
                    </div>
                  </div>
                  {depense.bareme_nom && (
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">Barème utilisé</label>
                      <div>{depense.bareme_nom}</div>
                      <small className="text-muted">{depense.tarif_par_km}€/km</small>
                    </div>
                  )}
                  {depense.type_vehicule && (
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">Type de véhicule</label>
                      <div>{depense.type_vehicule}</div>
                    </div>
                  )}
                </div>
                {depense.tarif_par_km && (
                  <div className="alert alert-info">
                    <strong>Calcul :</strong> {depense.distance_km} km × {depense.tarif_par_km}€ = {formatMontant(depense.montant_ttc)}
                  </div>
                )}
              </div>
            </div>
          )}

          {depense.type === 'repas' && depense.lieu_repas && (
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">🍽️ Détails du repas</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Lieu</label>
                    <div>{depense.lieu_repas}</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">Type de repas</label>
                    <div className="text-capitalize">{depense.type_repas?.replace('_', ' ')}</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">Nombre de personnes</label>
                    <div>{depense.nombre_personnes || 1}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historique des actions */}
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">📋 Historique des actions</h6>
            </div>
            <div className="card-body">
              <div className="timeline">
                {depense.historique && depense.historique.map((action, index) => (
                  <div key={action.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h6 className="timeline-title text-capitalize">
                        {action.action === 'creation' ? 'Création' :
                         action.action === 'modification' ? 'Modification' :
                         action.action === 'validation' ? 'Validation' :
                         action.action === 'refus' ? 'Refus' :
                         action.action === 'remboursement' ? 'Remboursement' : action.action}
                      </h6>
                      <p className="timeline-text mb-1">
                        Par <strong>{action.firstName} {action.lastName}</strong>
                      </p>
                      <small className="text-muted">{formatDateTime(action.created_at)}</small>
                      {action.commentaire && (
                        <div className="mt-2 p-2 bg-light rounded">
                          <small>{action.commentaire}</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Montants */}
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">💰 Montants</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-12 mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Montant HT</span>
                    <strong>{formatMontant(depense.montant_ht)}</strong>
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <div className="d-flex justify-content-between">
                    <span>TVA ({depense.taux_tva}%)</span>
                    <strong>{formatMontant(depense.montant_tva)}</strong>
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong className="h6">Total TTC</strong>
                    <strong className="h5 text-primary">{formatMontant(depense.montant_ttc)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Justificatif */}
          {depense.justificatif_url && (
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">📎 Justificatif</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex align-items-center">
                    <FiFileText className="me-2" />
                    <div>
                      <div className="fw-medium">{depense.justificatif_filename}</div>
                      <small className="text-muted">Fichier joint</small>
                    </div>
                  </div>
                </div>
                <a 
                  href={`/api${depense.justificatif_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary w-100"
                >
                  <FiFileText className="me-2" />
                  Ouvrir le justificatif
                </a>
              </div>
            </div>
          )}

          {/* Informations de validation */}
          {(depense.validee_le || depense.motif_refus) && (
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">ℹ️ Informations de traitement</h6>
              </div>
              <div className="card-body">
                {depense.validee_le && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      {depense.statut === 'validee' ? 'Validée le' : 
                       depense.statut === 'refusee' ? 'Refusée le' : 'Traitée le'}
                    </label>
                    <div>{formatDateTime(depense.validee_le)}</div>
                  </div>
                )}
                {depense.valideur_firstName && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Par</label>
                    <div>{depense.valideur_firstName} {depense.valideur_lastName}</div>
                  </div>
                )}
                {depense.motif_refus && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Motif de refus</label>
                    <div className="alert alert-danger">
                      {depense.motif_refus}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsDepense;