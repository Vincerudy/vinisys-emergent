import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import ModeSelectionModal from '../components/ModeSelectionModal';
import './css/ListeAchatsPage.css';

const ListeAchatsPage = () => {
  const { societe_id } = useAuth();
  const location = useLocation();
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
  const [modeModalOpen, setModeModalOpen] = useState(false);
  const [sidebarPrefilledData, setSidebarPrefilledData] = useState(null);
  const [sidebarAttachedFile, setSidebarAttachedFile] = useState(null);
  const [sidebarMode, setSidebarMode] = useState('manuel');
  const itemsPerPage = 10;

  // Détection du paramètre sidebar=open pour ouvrir automatiquement le sidebar
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('sidebar') === 'open') {
      handleNewExpenseClick(); // Ouvre la modale au lieu du sidebar directement
      // Nettoyer l'URL après ouverture
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  useEffect(() => {
    fetchAchats();
  }, [societe_id, filters]);

  const fetchAchats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching achats for societe_id:', societe_id);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/achats/${societe_id}`,
        { params: filters }
      );
      console.log('✅ API Response:', response.data);
      console.log('📊 Achats data:', response.data.achats);
      setAchats(response.data.achats || []);
    } catch (error) {
      console.error('❌ Erreur chargement achats:', error);
      console.error('❌ Error details:', error.response?.data);
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
    achat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achat.fournisseur_nom_table?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achat.numero?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedAchats = filteredAchats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAchats.length / itemsPerPage);

  const getStatusBadge = (statut) => {
    const badges = {
      'brouillon': { class: 'status-draft', text: 'Brouillon' },
      'en_attente': { class: 'status-pending', text: 'En attente' },
      'valide': { class: 'status-validated', text: 'Validé' },
      'refuse': { class: 'status-rejected', text: 'Refusé' },
      'exporte': { class: 'status-exported', text: 'Exporté' }
    };
    
    // Si le statut est null, undefined, ou autre, considérer comme "en attente"
    const finalStatut = statut || 'en_attente';
    const badge = badges[finalStatut] || { class: 'status-pending', text: 'En attente' };
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

  const handleModeSelection = (mode, ocrData = null, file = null) => {
    if (mode === 'manuel') {
      // Mode manuel : ouvre le sidebar vide
      setSidebarPrefilledData(null);
      setSidebarAttachedFile(null);
      setSidebarMode('manuel');
      setSidebarOpen(true);
    } else if (mode === 'ocr') {
      // Mode OCR : ouvre le sidebar avec données pré-remplies
      setSidebarPrefilledData(ocrData);
      setSidebarAttachedFile(file);
      setSidebarMode('ocr');
      setSidebarOpen(true);
    }
  };

  const handleNewExpenseClick = () => {
    setModeModalOpen(true);
  };

  const handleViewAchat = (achat) => {
    // Ouvrir la sidebar en mode lecture seule avec les données de l'achat
    setSidebarPrefilledData(achat);
    setSidebarAttachedFile(null);
    setSidebarMode('view');
    setSidebarOpen(true);
  };

  const handleEditAchat = (achat) => {
    // Ouvrir la sidebar en mode édition avec les données de l'achat
    setSidebarPrefilledData(achat);
    setSidebarAttachedFile(null);
    setSidebarMode('edit');
    setSidebarOpen(true);
  };

  const handleDeleteAchat = async (achatId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/achat/${achatId}`);
        fetchAchats(); // Rafraîchir la liste
        alert('Dépense supprimée avec succès');
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression de la dépense');
      }
    }
  };

  // Handlers pour la validation en masse
  const handleBulkValidate = async () => {
    if (selectedAchats.length === 0) {
      alert('Veuillez sélectionner au moins une dépense à valider.');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir valider ${selectedAchats.length} dépense(s) ?`)) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/achats/validate-bulk`, {
          achat_ids: selectedAchats,
          societe_id: societe_id
        });
        
        alert('Dépenses validées avec succès');
        fetchAchats(); // Rafraîchir la liste
        setSelectedAchats([]); // Vider la sélection
      } catch (error) {
        console.error('Erreur validation en masse:', error);
        alert('Erreur lors de la validation des dépenses');
      }
    }
  };

  const handleBulkReject = async () => {
    if (selectedAchats.length === 0) {
      alert('Veuillez sélectionner au moins une dépense à refuser.');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir refuser ${selectedAchats.length} dépense(s) ?`)) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/achats/reject-bulk`, {
          achat_ids: selectedAchats,
          societe_id: societe_id
        });
        
        alert('Dépenses refusées avec succès');
        fetchAchats(); // Rafraîchir la liste
        setSelectedAchats([]); // Vider la sélection
      } catch (error) {
        console.error('Erreur refus en masse:', error);
        alert('Erreur lors du refus des dépenses');
      }
    }
  };

  const handleBulkExport = async () => {
    if (selectedAchats.length === 0) {
      alert('Veuillez sélectionner au moins une dépense à exporter.');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/achats/export-bulk`, {
        achat_ids: selectedAchats,
        societe_id: societe_id
      }, { responseType: 'blob' });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `achats_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Export terminé avec succès');
    } catch (error) {
      console.error('Erreur export en masse:', error);
      alert('Erreur lors de l\'export des dépenses');
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
            onClick={handleNewExpenseClick}
            className="btn-primary"
          >
            <FiPlus size={18} />
            Nouvelle dépense
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
          <div className="filter-group width33">
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

          <div className="filter-group width33">
            <label>Période</label>
            <select 
              style={{flex: 1, color: '#3e3e3e'}}
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

          <div className="filter-group width33" >
            <label>Statut</label>
            <select 
              style={{flex: 1, color: '#3e3e3e'}}
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

          <div className="filter-group width33">
            <label>Montant (€)</label>
            <div className="range-inputs">
              <input
                style={{height: '70px', backgroundColor: '#e5e5e5', color: '#3e3e3e' }}
                type="number"
                placeholder="Min"
                value={filters.montant_min}
                onChange={(e) => setFilters({...filters, montant_min: e.target.value})}
              />
              <span>à</span>
              <input
               style={{height: '70px', backgroundColor: '#e5e5e5', color: '#3e3e3e' }}
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
            <button 
              className="btn-success"
              onClick={handleBulkValidate}
              disabled={selectedAchats.length === 0}
            >
              <FiCheck size={16} />
              Valider la sélection
            </button>
            <button 
              className="btn-danger"
              onClick={handleBulkReject}
              disabled={selectedAchats.length === 0}
            >
              <FiX size={16} />
              Refuser la sélection
            </button>
            <button 
              className="btn-secondary"
              onClick={handleBulkExport}
              disabled={selectedAchats.length === 0}
            >
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
                    {achat.numero || '-'}
                  </td>
                  <td className="supplier-cell">
                    <div className="supplier-info">
                      <strong>{achat.fournisseur_nom_table || 'Non spécifié'}</strong>
                    </div>
                  </td>
                  <td className="description-cell">
                    <div className="description-content">
                      <strong>{achat.description || 'Sans description'}</strong>
                      {achat.categorie_nom && (
                        <span className="category-tag">{achat.categorie_nom}</span>
                      )}
                    </div>
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(parseFloat(achat.montant_ht) || 0)}
                  </td>
                  <td className="tax-cell">
                    {formatCurrency(parseFloat(achat.montant_tva) || 0)}
                    <span className="tax-rate">({achat.taux_tva}%)</span>
                  </td>
                  <td className="total-cell">
                    <strong>{formatCurrency(parseFloat(achat.montant_ttc) || 0)}</strong>
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(achat.statut)}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {/* Bouton Voir - toujours visible */}
                      <button 
                        className="btn-action view" 
                        title="Voir"
                        onClick={() => handleViewAchat(achat)}
                      >
                        <FiEye size={14} />
                      </button>
                      
                      {/* Boutons Modifier et Supprimer - seulement pour les dépenses non validées */}
                      {achat.statut !== 'valide' && (
                        <>
                          <button 
                            className="btn-action edit" 
                            title="Modifier"
                            onClick={() => handleEditAchat(achat)}
                          >
                            <FiEdit size={14} />
                          </button>
                          <button 
                            className="btn-action delete" 
                            title="Supprimer"
                            onClick={() => handleDeleteAchat(achat.id)}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </>
                      )}
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
                {formatCurrency(filteredAchats.reduce((sum, a) => sum + (parseFloat(a.montant_ttc) || 0), 0))}
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

      {/* Modale de sélection du mode */}
      <ModeSelectionModal 
        isOpen={modeModalOpen}
        onClose={() => setModeModalOpen(false)}
        onModeSelected={handleModeSelection}
      />

      {/* Sidebar de création d'achat */}
      <AchatSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSaved={fetchAchats}
        prefilledData={sidebarPrefilledData}
        attachedFile={sidebarAttachedFile}
        mode={sidebarMode}
      />
    </div>
  );
};

export default ListeAchatsPage;
