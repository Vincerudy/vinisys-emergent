import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCheck, FiX, FiEye, FiClock, FiDollarSign, FiFileText, FiFilter, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const ValidationDepenses = () => {
  const { id: userId } = useAuth();
  const [depenses, setDepenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepenses, setSelectedDepenses] = useState([]);
  const [filters, setFilters] = useState({
    statut: 'en_attente',
    search: '',
    dateDebut: '',
    dateFin: '',
    type: ''
  });
  const [stats, setStats] = useState({
    en_attente: { count: 0, montant: 0 },
    validee: { count: 0, montant: 0 },
    refusee: { count: 0, montant: 0 }
  });

  useEffect(() => {
    loadDepensesForValidation();
  }, [filters]);

  const loadDepensesForValidation = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les dépenses (pas seulement celles de l'utilisateur connecté)
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value)),
        limit: '50' // Plus de résultats pour la validation
      });
      
      const response = await api.get(`/depenses/all?${params}`); // Route spéciale pour managers
      setDepenses(response.data.depenses || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
      // Fallback - utiliser la route normale si la route spéciale n'existe pas
      try {
        const response = await api.get(`/depenses/${userId}?${Object.keys(filters).map(k => filters[k] ? `${k}=${filters[k]}` : '').filter(x => x).join('&')}`);
        setDepenses(response.data.depenses || []);
        setStats(response.data.stats || {});
      } catch (fallbackError) {
        Swal.fire('Erreur', 'Impossible de charger les dépenses', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (depenseId, action, motif = '') => {
    try {
      const endpoint = action === 'valider' ? 'valider' : 'refuser';
      const data = { userId };
      
      if (action === 'refuser') {
        if (!motif.trim()) {
          Swal.fire('Erreur', 'Le motif de refus est obligatoire', 'error');
          return;
        }
        data.motifRefus = motif;
      }
      
      await api.post(`/depense/${depenseId}/${endpoint}`, data);
      
      const actionText = action === 'valider' ? 'validée' : 'refusée';
      Swal.fire('Succès', `Dépense ${actionText} avec succès`, 'success');
      
      loadDepensesForValidation();
      setSelectedDepenses(prev => prev.filter(id => id !== depenseId));
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      Swal.fire('Erreur', 'Impossible de traiter la demande', 'error');
    }
  };

  const handleBulkValidation = async (action) => {
    if (selectedDepenses.length === 0) {
      Swal.fire('Erreur', 'Aucune dépense sélectionnée', 'error');
      return;
    }

    let motifCommun = '';
    if (action === 'refuser') {
      const result = await Swal.fire({
        title: 'Motif de refus commun',
        input: 'textarea',
        inputPlaceholder: 'Motif appliqué à toutes les dépenses sélectionnées...',
        showCancelButton: true,
        confirmButtonText: 'Refuser toutes',
        cancelButtonText: 'Annuler',
        inputValidator: (value) => {
          if (!value) return 'Le motif de refus est obligatoire';
        }
      });
      
      if (!result.isConfirmed) return;
      motifCommun = result.value;
    } else {
      const result = await Swal.fire({
        title: 'Validation en lot',
        text: `Valider ${selectedDepenses.length} dépense(s) sélectionnée(s) ?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Valider toutes',
        cancelButtonText: 'Annuler'
      });
      
      if (!result.isConfirmed) return;
    }

    try {
      const promises = selectedDepenses.map(depenseId => 
        handleValidation(depenseId, action, motifCommun)
      );
      
      await Promise.all(promises);
      setSelectedDepenses([]);
      
      const actionText = action === 'valider' ? 'validées' : 'refusées';
      Swal.fire('Succès', `${selectedDepenses.length} dépense(s) ${actionText}`, 'success');
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors du traitement en lot', 'error');
    }
  };

  const handleQuickRefusal = async (depenseId) => {
    const { value: motif } = await Swal.fire({
      title: 'Refuser cette dépense',
      input: 'textarea',
      inputPlaceholder: 'Motif de refus...',
      showCancelButton: true,
      confirmButtonText: 'Refuser',
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value) return 'Le motif de refus est obligatoire';
      }
    });

    if (motif) {
      await handleValidation(depenseId, 'refuser', motif);
    }
  };

  const handleSelectDepense = (depenseId) => {
    setSelectedDepenses(prev => 
      prev.includes(depenseId)
        ? prev.filter(id => id !== depenseId)
        : [...prev, depenseId]
    );
  };

  const handleSelectAll = () => {
    const pendingDepenses = depenses.filter(d => d.statut === 'en_attente');
    setSelectedDepenses(
      selectedDepenses.length === pendingDepenses.length 
        ? [] 
        : pendingDepenses.map(d => d.id)
    );
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
      <span className={`badge ${statusConfig.class}`}>
        <Icon className="me-1" size={12} />
        {statusConfig.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  const getTypeIcon = (type) => {
    const icons = {
      kilometrique: '🚗',
      repas: '🍽️',
      autres: '📋'
    };
    return icons[type] || '📋';
  };

  const getPriorityClass = (montant, daysOld) => {
    if (montant > 100 || daysOld > 7) return 'border-warning';
    if (montant > 200 || daysOld > 14) return 'border-danger';
    return '';
  };

  const getDaysOld = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now - date) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="nxl-content">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <Link to="/depenses/tableau-bord" className="btn btn-outline-primary me-3">
            <FiArrowLeft />
          </Link>
          <div className="page-header-title">
            <h5 className="m-b-10">Validation des dépenses</h5>
            <p className="fs-13 text-muted m-b-0">
              Interface manager - Valider ou refuser les demandes de remboursement
            </p>
          </div>
        </div>
        <div className="page-header-right ms-auto">
          {selectedDepenses.length > 0 && (
            <div className="btn-group me-2">
              <button 
                className="btn btn-success"
                onClick={() => handleBulkValidation('valider')}
              >
                <FiCheck className="me-2" />
                Valider ({selectedDepenses.length})
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleBulkValidation('refuser')}
              >
                <FiX className="me-2" />
                Refuser ({selectedDepenses.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques de validation */}
      <div className="row mb-4">
        <div className="col-lg-4">
          <div className="card border-0 bg-warning bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-warning mb-1">À valider</h6>
                  <h4 className="mb-0">{stats.en_attente.count}</h4>
                  <small className="text-muted">{formatMontant(stats.en_attente.montant)}</small>
                </div>
                <div className="flex-shrink-0">
                  <div className="avtar avtar-s bg-warning-subtle">
                    <FiClock className="text-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 bg-success bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-success mb-1">Validées</h6>
                  <h4 className="mb-0">{stats.validee.count}</h4>
                  <small className="text-muted">{formatMontant(stats.validee.montant)}</small>
                </div>
                <div className="flex-shrink-0">
                  <div className="avtar avtar-s bg-success-subtle">
                    <FiCheck className="text-success" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 bg-danger bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-danger mb-1">Refusées</h6>
                  <h4 className="mb-0">{stats.refusee.count}</h4>
                  <small className="text-muted">{formatMontant(stats.refusee.montant)}</small>
                </div>
                <div className="flex-shrink-0">
                  <div className="avtar avtar-s bg-danger-subtle">
                    <FiX className="text-danger" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex gap-2 flex-wrap">
                <select
                  className="form-select form-select-sm"
                  value={filters.statut}
                  onChange={(e) => setFilters(prev => ({...prev, statut: e.target.value}))}
                  style={{width: 'auto'}}
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="validee">Validée</option>
                  <option value="refusee">Refusée</option>
                </select>
                
                <select
                  className="form-select form-select-sm"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                  style={{width: 'auto'}}
                >
                  <option value="">Tous les types</option>
                  <option value="kilometrique">Kilométrique</option>
                  <option value="repas">Repas</option>
                  <option value="autres">Autres</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Rechercher par employé, description..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des dépenses */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <>
              {depenses.filter(d => d.statut === 'en_attente').length > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAll"
                      checked={selectedDepenses.length === depenses.filter(d => d.statut === 'en_attente').length && depenses.filter(d => d.statut === 'en_attente').length > 0}
                      onChange={handleSelectAll}
                    />
                    <label className="form-check-label" htmlFor="selectAll">
                      Sélectionner tout
                    </label>
                  </div>
                  <small className="text-muted">
                    {selectedDepenses.length} dépense(s) sélectionnée(s)
                  </small>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th width="30">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={handleSelectAll}
                          checked={selectedDepenses.length > 0 && selectedDepenses.length === depenses.filter(d => d.statut === 'en_attente').length}
                        />
                      </th>
                      <th>Employé</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Ancienneté</th>
                      <th>Justificatif</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depenses.map((depense) => {
                      const daysOld = getDaysOld(depense.created_at);
                      const priorityClass = getPriorityClass(depense.montant_ttc, daysOld);
                      
                      return (
                        <tr key={depense.id} className={priorityClass}>
                          <td>
                            {depense.statut === 'en_attente' && (
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedDepenses.includes(depense.id)}
                                onChange={() => handleSelectDepense(depense.id)}
                              />
                            )}
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{depense.firstName} {depense.lastName}</div>
                              <small className="text-muted">{depense.email}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{getTypeIcon(depense.type)}</span>
                              <small className="text-capitalize">{depense.type}</small>
                            </div>
                          </td>
                          <td>
                            <small>{formatDate(depense.date_depense)}</small>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{depense.description || '-'}</div>
                              {depense.lieu && (
                                <small className="text-muted">{depense.lieu}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong className="text-primary">{formatMontant(depense.montant_ttc)}</strong>
                          </td>
                          <td>{getStatusBadge(depense.statut)}</td>
                          <td>
                            <span className={`badge ${daysOld > 7 ? 'bg-warning' : daysOld > 14 ? 'bg-danger' : 'bg-light text-dark'}`}>
                              {daysOld}j
                            </span>
                          </td>
                          <td>
                            {depense.justificatif_url ? (
                              <a 
                                href={`/api${depense.justificatif_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-secondary"
                                title="Voir justificatif"
                              >
                                <FiFileText />
                              </a>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <Link 
                                to={`/depenses/${depense.id}/details`}
                                className="btn btn-outline-info"
                                title="Voir détails"
                              >
                                <FiEye />
                              </Link>
                              {depense.statut === 'en_attente' && (
                                <>
                                  <button 
                                    className="btn btn-outline-success"
                                    title="Valider rapidement"
                                    onClick={() => handleValidation(depense.id, 'valider')}
                                  >
                                    <FiCheck />
                                  </button>
                                  <button 
                                    className="btn btn-outline-danger"
                                    title="Refuser avec motif"
                                    onClick={() => handleQuickRefusal(depense.id)}
                                  >
                                    <FiX />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {depenses.length === 0 && (
                      <tr>
                        <td colSpan="10" className="text-center py-5">
                          <div className="text-muted">
                            <i className="fas fa-clipboard-check fa-3x mb-3 opacity-25"></i>
                            <h6>Aucune dépense à valider</h6>
                            <p className="small">Toutes les dépenses ont été traitées</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationDepenses;