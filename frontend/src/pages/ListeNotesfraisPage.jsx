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
  FiX,
  FiClock,
  FiUser,
  FiMessageSquare
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/ListeNotesfraisPage.css';

const ListeNotesfraisPage = () => {
  const { societe_id, id: user_id } = useAuth();
  const [notesfrais, setNotesfrais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    periode: 'all',
    utilisateur: 'all',
    statut: 'all',
    type_frais: 'all',
    montant_min: '',
    montant_max: ''
  });
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationComment, setValidationComment] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotesfrais();
  }, [societe_id, filters]);

  const fetchNotesfrais = async () => {
    try {
      setLoading(true);
      console.log('🔍 fetchNotesfrais: Début de l\'appel API');
      console.log('🔍 fetchNotesfrais: societe_id =', societe_id);
      console.log('🔍 fetchNotesfrais: filters =', filters);
      
      // Utiliser l'endpoint existant avec un paramètre spécial pour récupérer toutes les notes
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/notes-frais/0`,
        { 
          params: { 
            societe_id: societe_id,
            ...filters 
          } 
        }
      );
      
      console.log('📡 fetchNotesfrais: Response complète =', response);
      console.log('📡 fetchNotesfrais: response.data =', response.data);
      console.log('📡 fetchNotesfrais: response.data.notes =', response.data.notes);
      console.log('📡 fetchNotesfrais: Nombre de notes reçues =', response.data.notes?.length || 0);
      
      if (response.data.notes && response.data.notes.length > 0) {
        console.log('✅ fetchNotesfrais: Première note =', response.data.notes[0]);
      } else {
        console.log('❌ fetchNotesfrais: Aucune note reçue ou structure incorrecte');
      }
      
      setNotesfrais(response.data.notes || []);
      console.log('✅ fetchNotesfrais: setState effectué avec', response.data.notes?.length || 0, 'notes');
      
    } catch (error) {
      console.error('❌ fetchNotesfrais: Erreur chargement notes:', error);
      console.error('❌ fetchNotesfrais: error.response =', error.response);
      console.error('❌ fetchNotesfrais: error.message =', error.message);
      setNotesfrais([]);
    } finally {
      setLoading(false);
      console.log('🔍 fetchNotesfrais: Fin de l\'appel (loading = false)');
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

  const filteredNotes = notesfrais.filter(note =>
    note.numero_note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.utilisateur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.motif?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);

  const getStatusBadge = (statut) => {
    const badges = {
      'brouillon': { class: 'status-draft', text: 'Brouillon', icon: FiEdit },
      'soumise': { class: 'status-submitted', text: 'Soumise', icon: FiFileText },
      'validee': { class: 'status-validated', text: 'Validée', icon: FiCheck },
      'refusee': { class: 'status-rejected', text: 'Refusée', icon: FiX },
      'remboursee': { class: 'status-paid', text: 'Remboursée', icon: FiDollarSign }
    };
    
    const badge = badges[statut] || { class: 'status-draft', text: 'Inconnu', icon: FiClock };
    const IconComponent = badge.icon;
    
    return (
      <span className={`status-badge ${badge.class}`}>
        <IconComponent size={12} />
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priorite) => {
    const priorities = {
      'haute': { class: 'priority-high', text: 'Haute' },
      'moyenne': { class: 'priority-medium', text: 'Moyenne' },
      'basse': { class: 'priority-low', text: 'Basse' }
    };
    
    const priority = priorities[priorite] || { class: 'priority-medium', text: 'Normale' };
    return <span className={`priority-badge ${priority.class}`}>{priority.text}</span>;
  };

  const handleBulkValidation = async (action) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/notes-frais/bulk-action/${societe_id}`, {
        notes_ids: selectedNotes,
        action: action,
        comment: validationComment
      });
      
      fetchNotesfrais();
      setSelectedNotes([]);
      setShowValidationModal(false);
      setValidationComment('');
    } catch (error) {
      console.error('Erreur action groupée:', error);
    }
  };

  return (
    <div className="liste-notesfrais-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiFileText />
            Notes de frais
          </h1>
          <p className="page-subtitle">
            Gestion des notes de frais et demandes de remboursement
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => window.location.href = '/#/notes-frais/nouvelle'}
            className="btn-primary"
          >
            <FiPlus size={18} />
            Nouvelle note
          </button>
          <button className="btn-secondary">
            <FiDownload size={18} />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="quick-stats">
        <div className="stat-card draft">
          <div className="stat-icon">
            <FiEdit />
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredNotes.filter(n => n.statut === 'brouillon').length}</div>
            <div className="stat-label">Brouillons</div>
          </div>
        </div>

        <div className="stat-card submitted">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredNotes.filter(n => n.statut === 'soumise').length}</div>
            <div className="stat-label">En attente</div>
          </div>
        </div>

        <div className="stat-card validated">
          <div className="stat-icon">
            <FiCheck />
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredNotes.filter(n => n.statut === 'validee').length}</div>
            <div className="stat-label">Validées</div>
          </div>
        </div>

        <div className="stat-card total">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(filteredNotes.reduce((sum, n) => sum + (n.montant_total || 0), 0))}</div>
            <div className="stat-label">Total</div>
          </div>
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
                placeholder="Rechercher par n° note, utilisateur, motif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Statut</label>
            <select 
              value={filters.statut}
              onChange={(e) => setFilters({...filters, statut: e.target.value})}
            >
              <option value="all">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="soumise">Soumise</option>
              <option value="validee">Validée</option>
              <option value="refusee">Refusée</option>
              <option value="remboursee">Remboursée</option>
            </select>
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
            <label>Type de frais</label>
            <select 
              value={filters.type_frais}
              onChange={(e) => setFilters({...filters, type_frais: e.target.value})}
            >
              <option value="all">Tous les types</option>
              <option value="kilometrique">Kilométriques</option>
              <option value="repas">Repas</option>
              <option value="hebergement">Hébergement</option>
              <option value="transport">Transport</option>
              <option value="fourniture">Fournitures</option>
              <option value="autre">Autres</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions groupées */}
      {selectedNotes.length > 0 && (
        <div className="bulk-actions">
          <div className="selection-info">
            <FiFileText className="selection-icon" />
            {selectedNotes.length} note(s) sélectionnée(s)
          </div>
          <div className="bulk-buttons">
            <button 
              className="btn-success"
              onClick={() => setShowValidationModal(true)}
            >
              <FiCheck size={16} />
              Valider la sélection
            </button>
            <button 
              className="btn-danger"
              onClick={() => handleBulkValidation('refuse')}
            >
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

      {/* Tableau des notes */}
      <div className="table-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement des notes de frais...</p>
          </div>
        ) : (
          <table className="notes-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotes(paginatedNotes.map(n => n.id));
                      } else {
                        setSelectedNotes([]);
                      }
                    }}
                    checked={selectedNotes.length === paginatedNotes.length && paginatedNotes.length > 0}
                  />
                </th>
                <th>N° Note</th>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Motif/Déplacement</th>
                <th>Type principal</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNotes.map((note) => (
                <tr key={note.id} className="table-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedNotes.includes(note.id)}
                      onChange={() => {
                        if (selectedNotes.includes(note.id)) {
                          setSelectedNotes(selectedNotes.filter(n => n !== note.id));
                        } else {
                          setSelectedNotes([...selectedNotes, note.id]);
                        }
                      }}
                    />
                  </td>
                  <td className="note-number-cell">
                    <div className="note-number">
                      <strong>{note.numero_note}</strong>
                      {note.nb_lignes && (
                        <span className="lines-count">{note.nb_lignes} ligne(s)</span>
                      )}
                    </div>
                  </td>
                  <td className="date-cell">
                    <FiCalendar className="cell-icon" />
                    {formatDate(note.date_creation)}
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      <FiUser className="user-icon" />
                      <div className="user-details">
                        <strong>{note.utilisateur_nom}</strong>
                        <span className="user-role">{note.utilisateur_role || 'Employé'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="motif-cell">
                    <div className="motif-content">
                      <strong>{note.motif || 'Non spécifié'}</strong>
                      {note.destination && (
                        <span className="destination">→ {note.destination}</span>
                      )}
                    </div>
                  </td>
                  <td className="type-cell">
                    <span className="type-badge">
                      {note.type_principal || 'Mixte'}
                    </span>
                  </td>
                  <td className="amount-cell">
                    <div className="amount-info">
                      <strong>{formatCurrency(note.montant_total)}</strong>
                      {note.montant_rembourse > 0 && (
                        <span className="reimbursed">
                          Remb: {formatCurrency(note.montant_rembourse)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(note.statut)}
                  </td>
                  <td className="priority-cell">
                    {getPriorityBadge(note.priorite)}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="btn-action view" title="Voir détails">
                        <FiEye size={14} />
                      </button>
                      <button className="btn-action edit" title="Modifier">
                        <FiEdit size={14} />
                      </button>
                      {note.statut === 'soumise' && (
                        <button className="btn-action validate" title="Valider">
                          <FiCheck size={14} />
                        </button>
                      )}
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
            Page {currentPage} sur {totalPages} ({filteredNotes.length} résultats)
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

      {/* Modal de validation */}
      {showValidationModal && (
        <div className="modal-overlay">
          <div className="validation-modal">
            <div className="modal-header">
              <h3>Validation des notes sélectionnées</h3>
              <button 
                className="modal-close"
                onClick={() => setShowValidationModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-content">
              <p>Vous êtes sur le point de valider {selectedNotes.length} note(s) de frais.</p>
              <div className="comment-group">
                <label>Commentaire de validation (optionnel)</label>
                <textarea
                  placeholder="Ajouter un commentaire..."
                  value={validationComment}
                  onChange={(e) => setValidationComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowValidationModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-success"
                onClick={() => handleBulkValidation('valide')}
              >
                <FiCheck size={16} />
                Valider les notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeNotesfraisPage;