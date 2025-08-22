import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiDownload, FiEye, FiEdit2, FiTrash2, FiFileText, FiSearch, FiX, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const TableauBordDepenses = () => {
  const { id: userId } = useAuth();
  const [depenses, setDepenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    en_attente: { count: 0, montant: 0 },
    validee: { count: 0, montant: 0 },
    refusee: { count: 0, montant: 0 },
    remboursee: { count: 0, montant: 0 }
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  });
  
  // Filtres avancés - Exclut les dépenses en attente par défaut
  const [filters, setFilters] = useState({
    type: '',
    statut: 'valide', // Par défaut, afficher seulement les dépenses validées
    dateDebut: '',
    dateFin: '',
    search: '',
    userId: '', // Pour filtrer par utilisateur
    clientId: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [totalVisible, setTotalVisible] = useState(0);

  // Charger les données initiales
  useEffect(() => {
    loadUsers();
    loadClients();
  }, []);

  useEffect(() => {
    loadDepenses();
  }, [userId, filters, pagination.currentPage]);

  const loadUsers = async () => {
    try {
      // Supposons qu'il y ait une route pour lister les utilisateurs
      const response = await api.get(`/users/${userId}`);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const loadClients = async () => {
    try {
      const response = await api.get(`/listeClient/${userId}`);
      setClients(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const loadDepenses = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });
      
      const response = await api.get(`/depenses/${userId}?${params}`);
      setDepenses(response.data.depenses || []);
      setPagination(response.data.pagination || {});
      setStats(response.data.stats || {});
      
      // Calculer le total des dépenses visibles
      const total = (response.data.depenses || []).reduce((sum, dep) => sum + dep.montant_ttc, 0);
      setTotalVisible(total);
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
      Swal.fire('Erreur', 'Impossible de charger les dépenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset à la première page
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      statut: '',
      dateDebut: '',
      dateFin: '',
      search: '',
      userId: '',
      clientId: ''
    });
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });
      
      const response = await api.get(`/export/csv/${userId}?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `depenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      Swal.fire('Succès', 'Export CSV téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      Swal.fire('Erreur', 'Impossible d\'exporter les données', 'error');
    }
  };

  const handleDelete = async (depenseId) => {
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/depense/${depenseId}`);
        Swal.fire('Supprimé !', 'La dépense a été supprimée.', 'success');
        loadDepenses();
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer la dépense', 'error');
      }
    }
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      en_attente: { class: 'bg-warning text-dark', text: 'En attente' },
      validee: { class: 'bg-success', text: 'Validée' },
      refusee: { class: 'bg-danger', text: 'Refusée' },
      remboursee: { class: 'bg-info', text: 'Remboursée' }
    };
    
    const config = statusConfig[statut] || { class: 'bg-secondary', text: statut };
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      kilometrique: '🚗',
      repas: '🍽️',
      autres: '📋'
    };
    return icons[type] || '📋';
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

  return (
    <div className="nxl-content">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">Tableau de Bord - Dépenses</h5>
            <p className="fs-13 text-muted m-b-0">
              Gestion complète des dépenses professionnelles
            </p>
          </div>
        </div>
        <div className="page-header-right ms-auto">
          <div className="page-header-right-items">
            <Link to="/depenses/parametres-tva" className="btn btn-outline-secondary me-2">
              <FiSettings className="me-2" />
              Paramètres TVA
            </Link>
            <Link to="/depenses/nouveau" className="btn btn-primary">
              <FiPlus className="me-2" />
              Ajouter une dépense
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 bg-warning bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-warning mb-1">En attente</h6>
                  <h4 className="mb-0">{stats.en_attente.count}</h4>
                  <small className="text-muted">{formatMontant(stats.en_attente.montant)}</small>
                </div>
                <div className="flex-shrink-0">
                  <div className="avtar avtar-s bg-warning-subtle">
                    <i className="fas fa-clock text-warning"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
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
                    <i className="fas fa-check text-success"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
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
                    <i className="fas fa-times text-danger"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 bg-info bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-info mb-1">Remboursées</h6>
                  <h4 className="mb-0">{stats.remboursee.count}</h4>
                  <small className="text-muted">{formatMontant(stats.remboursee.montant)}</small>
                </div>
                <div className="flex-shrink-0">
                  <div className="avtar avtar-s bg-info-subtle">
                    <i className="fas fa-money-check text-info"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vue regroupée par catégorie */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Répartition par type de dépense</h6>
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="me-2">🚗</span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <span>Kilométrique</span>
                        <span className="fw-bold">
                          {formatMontant(
                            depenses
                              .filter(d => d.type === 'kilometrique')
                              .reduce((sum, d) => sum + d.montant_ttc, 0)
                          )}
                        </span>
                      </div>
                      <div className="progress" style={{height: '4px'}}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{
                            width: `${totalVisible > 0 ? 
                              (depenses.filter(d => d.type === 'kilometrique').reduce((sum, d) => sum + d.montant_ttc, 0) / totalVisible) * 100 
                              : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="me-2">🍽️</span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <span>Repas</span>
                        <span className="fw-bold">
                          {formatMontant(
                            depenses
                              .filter(d => d.type === 'repas')
                              .reduce((sum, d) => sum + d.montant_ttc, 0)
                          )}
                        </span>
                      </div>
                      <div className="progress" style={{height: '4px'}}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{
                            width: `${totalVisible > 0 ? 
                              (depenses.filter(d => d.type === 'repas').reduce((sum, d) => sum + d.montant_ttc, 0) / totalVisible) * 100 
                              : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="me-2">📋</span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <span>Autres frais</span>
                        <span className="fw-bold">
                          {formatMontant(
                            depenses
                              .filter(d => d.type === 'autres')
                              .reduce((sum, d) => sum + d.montant_ttc, 0)
                          )}
                        </span>
                      </div>
                      <div className="progress" style={{height: '4px'}}>
                        <div 
                          className="progress-bar bg-warning" 
                          style={{
                            width: `${totalVisible > 0 ? 
                              (depenses.filter(d => d.type === 'autres').reduce((sum, d) => sum + d.montant_ttc, 0) / totalVisible) * 100 
                              : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Total des dépenses visibles :</span>
                  <span className="h5 mb-0 text-primary">{formatMontant(totalVisible)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex gap-2 flex-wrap">
                <button 
                  className="btn btn-outline-primary btn-sm d-flex align-items-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter className="me-1" />
                  Filtres avancés
                  {Object.values(filters).some(v => v) && (
                    <span className="badge bg-primary ms-2">
                      {Object.values(filters).filter(v => v).length}
                    </span>
                  )}
                </button>
                <button 
                  className="btn btn-outline-success btn-sm d-flex align-items-center"
                  onClick={handleExportCSV}
                >
                  <FiDownload className="me-1" />
                  Export CSV
                </button>
                <Link 
                  to="/depenses/rapport"
                  className="btn btn-outline-info btn-sm d-flex align-items-center"
                >
                  <FiFileText className="me-1" />
                  Rapport PDF
                </Link>
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
                  placeholder="Rechercher par description, lieu, employé..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                {filters.search && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleFilterChange('search', '')}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="row mt-4 pt-3 border-top">
              <div className="col-md-2">
                <label className="form-label">Type</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="kilometrique">Kilométrique</option>
                  <option value="repas">Repas</option>
                  <option value="autres">Autres</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Statut</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.statut}
                  onChange={(e) => handleFilterChange('statut', e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="validee">Validée</option>
                  <option value="refusee">Refusée</option>
                  <option value="remboursee">Remboursée</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Date début</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filters.dateDebut}
                  onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Date fin</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filters.dateFin}
                  onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Employé</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                >
                  <option value="">Tous les employés</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Client</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.clientId}
                  onChange={(e) => handleFilterChange('clientId', e.target.value)}
                >
                  <option value="">Tous les clients</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 mt-3">
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={clearFilters}
                  >
                    <FiX className="me-1" />
                    Effacer tous les filtres
                  </button>
                  <span className="text-muted small align-self-center">
                    {pagination.totalRecords} résultat(s) trouvé(s)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau des dépenses */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des dépenses...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Lieu / Trajet</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Employé</th>
                      <th>Client</th>
                      <th>Justificatif</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depenses.length > 0 ? (
                      depenses.map((depense) => (
                        <tr key={depense.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2 fs-4">{getTypeIcon(depense.type)}</span>
                              <small className="text-capitalize">
                                {depense.type === 'kilometrique' ? 'Kilométrique' :
                                 depense.type === 'repas' ? 'Repas' : 'Autres'}
                              </small>
                            </div>
                          </td>
                          <td>
                            <small>{formatDate(depense.date_depense)}</small>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{depense.description || '-'}</div>
                              {depense.categorie_nom && (
                                <small className="text-muted">{depense.categorie_nom}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            {depense.type === 'kilometrique' && depense.lieu_arrivee ? (
                              <div>
                                <small className="d-block">{depense.lieu}</small>
                                <small className="text-muted">→ {depense.lieu_arrivee}</small>
                              </div>
                            ) : (
                              <small>{depense.lieu || '-'}</small>
                            )}
                          </td>
                          <td>
                            <div>
                              <strong className="text-primary">{formatMontant(depense.montant_ttc)}</strong>
                              {depense.distance_km && (
                                <small className="d-block text-muted">
                                  {depense.distance_km} km
                                </small>
                              )}
                            </div>
                          </td>
                          <td>{getStatusBadge(depense.statut)}</td>
                          <td>
                            <small>
                              <div>{depense.firstName} {depense.lastName}</div>
                              <div className="text-muted">{depense.email}</div>
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {depense.client_nom || '-'}
                            </small>
                          </td>
                          <td>
                            {depense.justificatif_url ? (
                              <a 
                                href={`/api${depense.justificatif_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-secondary"
                                title="Voir le justificatif"
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
                                <Link 
                                  to={`/depenses/${depense.id}/modifier`}
                                  className="btn btn-outline-primary"
                                  title="Modifier"
                                >
                                  <FiEdit2 />
                                </Link>
                              )}
                              {depense.statut === 'en_attente' && (
                                <button 
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => handleDelete(depense.id)}
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-5">
                          <div className="text-muted">
                            <i className="fas fa-receipt fa-3x mb-3 opacity-25"></i>
                            <h6>Aucune dépense trouvée</h6>
                            <p className="small">
                              {Object.values(filters).some(v => v) ? 
                                'Aucun résultat ne correspond aux critères de recherche' :
                                'Commencez par ajouter votre première dépense'
                              }
                            </p>
                            <Link to="/depenses/nouveau" className="btn btn-primary">
                              <FiPlus className="me-2" />
                              Ajouter une dépense
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <span className="text-muted small">
                    Page {pagination.currentPage} sur {pagination.totalPages} 
                    ({pagination.totalRecords} résultats)
                  </span>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => loadDepenses(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1 || loading}
                        >
                          Précédent
                        </button>
                      </li>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(
                          pagination.totalPages - 4,
                          pagination.currentPage - 2
                        )) + i;
                        
                        return pageNum <= pagination.totalPages && (
                          <li 
                            key={pageNum} 
                            className={`page-item ${pagination.currentPage === pageNum ? 'active' : ''}`}
                          >
                            <button 
                              className="page-link"
                              onClick={() => loadDepenses(pageNum)}
                              disabled={loading}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => loadDepenses(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages || loading}
                        >
                          Suivant
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableauBordDepenses;