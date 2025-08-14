import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
  FiPlus,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiCheck,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import AchatSidebar from '../components/AchatSidebar';
import './css/ListeAchatsPage.css';

const ListeAchatsPage = () => {
  const { societe_id } = useAuth();
  const [achats, setAchats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    periode: 'all',
    fournisseur: '',
    categorie: '',
    statut: 'all',
    montant_min: '',
    montant_max: ''
  });
  const [selectedAchats, setSelectedAchats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAchats();
  }, [societe_id, filters]);

  const fetchAchats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/achats/list/${societe_id}`,
        { params: filters }
      );
      setAchats(response.data.achats || []);
    } catch (error) {
      console.error('Erreur chargement achats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const filteredAchats = achats.filter(achat =>
    achat.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achat.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achat.numero_facture?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedAchats = filteredAchats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAchats.length / itemsPerPage);

  const getStatusBadge = (statut) => {
    const badges = {
      'brouillon': { class: 'status-draft', text: 'Brouillon' },
      'valide': { class: 'status-validated', text: 'Validé' },
      'refuse': { class: 'status-rejected', text: 'Refusé' },
      'exporte': { class: 'status-exported', text: 'Exporté' }
    };
    
    const badge = badges[statut] || { class: 'status-draft', text: 'Inconnu' };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAchats(paginatedAchats.map(a => a.id));
    } else {
      setSelectedAchats([]);
    }
  };

  const handleSelectAchat = (id) => {
    if (selectedAchats.includes(id)) {
      setSelectedAchats(selectedAchats.filter(a => a !== id));
    } else {
      setSelectedAchats([...selectedAchats, id]);
    }
  };

  return (
    <div className="liste-achats-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiFileText />
            Liste des Dépenses
          </h1>
          <p className="page-subtitle">
            Gérez et consultez tous vos achats et dépenses d'entreprise
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="btn-primary"
          >
            <FiPlus size={18} />
            Nouvelle dépense
          </button>
          <button className="btn-secondary">
            <FiDownload size={18} />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>
            <FiFilter />
            Filtres avancés
          </h3>
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Recherche</label>
            <div className="search-input">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher par désignation, fournisseur, n° facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Période</label>
            <select 
              value={filters.periode}
              onChange={(e) => setFilters({...filters, periode: e.target.value})}
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Statut</label>
            <select 
              value={filters.statut}
              onChange={(e) => setFilters({...filters, statut: e.target.value})}
            >
              <option value="all">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="valide">Validé</option>
              <option value="refuse">Refusé</option>
              <option value="exporte">Exporté</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Montant (€)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.montant_min}
                onChange={(e) => setFilters({...filters, montant_min: e.target.value})}
              />
              <span>à</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.montant_max}
                onChange={(e) => setFilters({...filters, montant_max: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions groupées */}
      {selectedAchats.length > 0 && (
        <div className="bulk-actions">
          <div className="selection-info">
            {selectedAchats.length} élément(s) sélectionné(s)
          </div>
          <div className="bulk-buttons">
            <button className="btn-success">
              <FiCheck size={16} />
              Valider la sélection
            </button>
            <button className="btn-danger">
              <FiX size={16} />
              Refuser la sélection
            </button>
            <button className="btn-secondary">
              <FiDownload size={16} />
              Exporter la sélection
            </button>
          </div>
        </div>
      )}

      {/* Tableau des achats */}
      <div className="table-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement des achats...</p>
          </div>
        ) : (
          <table className="achats-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedAchats.length === paginatedAchats.length && paginatedAchats.length > 0}
                  />
                </th>
                <th>Date</th>
                <th>N° Facture</th>
                <th>Fournisseur</th>
                <th>Désignation</th>
                <th>Montant HT</th>
                <th>TVA</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAchats.map((achat) => (
                <tr key={achat.id} className="table-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedAchats.includes(achat.id)}
                      onChange={() => handleSelectAchat(achat.id)}
                    />
                  </td>
                  <td className="date-cell">
                    <FiCalendar className="cell-icon" />
                    {formatDate(achat.date_achat)}
                  </td>
                  <td className="invoice-cell">
                    {achat.numero_facture || '-'}
                  </td>
                  <td className="supplier-cell">
                    <div className="supplier-info">
                      <strong>{achat.fournisseur || 'Non spécifié'}</strong>
                    </div>
                  </td>
                  <td className="description-cell">
                    <div className="description-content">
                      <strong>{achat.designation}</strong>
                      {achat.categorie && (
                        <span className="category-tag">{achat.categorie}</span>
                      )}
                    </div>
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(achat.montant_ht)}
                  </td>
                  <td className="tax-cell">
                    {formatCurrency(achat.montant_tva)}
                    <span className="tax-rate">({achat.taux_tva}%)</span>
                  </td>
                  <td className="total-cell">
                    <strong>{formatCurrency(achat.montant_ttc)}</strong>
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(achat.statut)}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="btn-action view" title="Voir">
                        <FiEye size={14} />
                      </button>
                      <button className="btn-action edit" title="Modifier">
                        <FiEdit size={14} />
                      </button>
                      <button className="btn-action delete" title="Supprimer">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="pagination-btn"
          >
            Précédent
          </button>
          
          <div className="pagination-info">
            Page {currentPage} sur {totalPages} ({filteredAchats.length} résultats)
          </div>
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="pagination-btn"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Résumé */}
      <div className="summary-section">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon total">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <div className="summary-value">
                {formatCurrency(filteredAchats.reduce((sum, a) => sum + (a.montant_ttc || 0), 0))}
              </div>
              <div className="summary-label">Total TTC</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon count">
              <FiFileText />
            </div>
            <div className="summary-content">
              <div className="summary-value">{filteredAchats.length}</div>
              <div className="summary-label">Achats</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon pending">
              <FiFileText />
            </div>
            <div className="summary-content">
              <div className="summary-value">
                {filteredAchats.filter(a => a.statut === 'brouillon').length}
              </div>
              <div className="summary-label">À valider</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar de création d'achat */}
      <AchatSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSaved={fetchAchats}
      />
    </div>
  );
};

export default ListeAchatsPage;