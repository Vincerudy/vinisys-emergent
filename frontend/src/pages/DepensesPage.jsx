import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiDownload, FiEye, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const DepensesPage = () => {
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
  
  // Filtres
  const [filters, setFilters] = useState({
    type: '',
    statut: '',
    dateDebut: '',
    dateFin: '',
    search: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Charger les dépenses
  const loadDepenses = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });
      
      const response = await api.get(`/depenses/${userId}?${params}`);
      setDepenses(response.data.depenses);
      setPagination(response.data.pagination);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
      Swal.fire('Erreur', 'Impossible de charger les dépenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepenses();
  }, [userId, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      statut: '',
      dateDebut: '',
      dateFin: '',
      search: ''
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

  const getStatusBadge = (statut) => {
    const statusConfig = {
      en_attente: { class: 'badge-warning', text: 'En attente' },
      validee: { class: 'badge-success', text: 'Validée' },
      refusee: { class: 'badge-danger', text: 'Refusée' },
      remboursee: { class: 'badge-info', text: 'Remboursée' }
    };
    
    const config = statusConfig[statut] || { class: 'badge-secondary', text: statut };
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
            <h5 className="m-b-10">Gestion des Dépenses</h5>
          </div>
        </div>
        <div className="page-header-right ms-auto">
          <div className="page-header-right-items">
            <Link to="/depenses/nouveau" className="btn btn-primary">
              <FiPlus className="me-2" />
              Ajouter une dépense
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">En attente</h6>
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
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Validées</h6>
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
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Refusées</h6>
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
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Remboursées</h6>
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

      {/* Filtres et actions */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter className="me-1" />
                  Filtrer
                </button>
                <button 
                  className="btn btn-outline-success btn-sm"
                  onClick={handleExportCSV}
                >
                  <FiDownload className="me-1" />
                  Export CSV
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="row mt-3">
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="kilometrique">Kilométrique</option>
                  <option value="repas">Repas</option>
                  <option value="autres">Autres</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
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
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  placeholder="Date début"
                  value={filters.dateDebut}
                  onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  placeholder="Date fin"
                  value={filters.dateFin}
                  onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                />
              </div>
              <div className="col-12 mt-2">
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearFilters}
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau des dépenses */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Lieu</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Employé</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depenses.length > 0 ? (
                      depenses.map((depense) => (
                        <tr key={depense.id}>
                          <td>
                            <span className="me-2">{getTypeIcon(depense.type)}</span>
                            {depense.type === 'kilometrique' ? 'Kilométrique' :
                             depense.type === 'repas' ? 'Repas' : 'Autres'}
                          </td>
                          <td>{formatDate(depense.date_depense)}</td>
                          <td>{depense.description || '-'}</td>
                          <td>
                            {depense.type === 'kilometrique' && depense.lieu_arrivee 
                              ? `${depense.lieu} → ${depense.lieu_arrivee}` 
                              : depense.lieu || '-'}
                          </td>
                          <td>
                            <strong>{formatMontant(depense.montant_ttc)}</strong>
                            {depense.distance_km && (
                              <small className="d-block text-muted">
                                {depense.distance_km} km
                              </small>
                            )}
                          </td>
                          <td>{getStatusBadge(depense.statut)}</td>
                          <td>
                            <small>
                              {depense.firstName} {depense.lastName}
                            </small>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <Link 
                                to={`/depenses/${depense.id}`}
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
                              {depense.justificatif_url && (
                                <a 
                                  href={`/api${depense.justificatif_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-secondary"
                                  title="Voir justificatif"
                                >
                                  <FiFileText />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-muted">
                            <i className="fas fa-receipt fa-3x mb-3"></i>
                            <p>Aucune dépense trouvée</p>
                            <Link to="/depenses/nouveau" className="btn btn-primary">
                              Ajouter une première dépense
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
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => loadDepenses(page)}
                          disabled={loading}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepensesPage;