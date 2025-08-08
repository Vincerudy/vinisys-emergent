import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiEye,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiDownload,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiClock
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/ListeNotesPage.css';

const ListeNotesPage = () => {
  const { societe_id } = useAuth();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [societe_id]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notes-frais/list/${societe_id}`);
      
      if (response.data.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error('Erreur chargement notes:', error);
      alert('Erreur lors du chargement des notes de frais');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant) => {
    return parseFloat(montant).toFixed(2).replace('.', ',');
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      brouillon: { class: 'status-draft', label: 'Brouillon' },
      soumise: { class: 'status-submitted', label: 'Soumise' },
      validee: { class: 'status-validated', label: 'Validée' },
      refusee: { class: 'status-rejected', label: 'Refusée' }
    };
    
    const config = statusConfig[statut] || statusConfig.brouillon;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const handleEditNote = (noteId) => {
    window.location.href = `/#/notes-frais/edit/${noteId}`;
  };

  const handleViewNote = (noteId) => {
    window.location.href = `/#/notes-frais/view/${noteId}`;
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'tous' || note.statut === statusFilter;
    
    const matchesDate = !dateFilter || 
                       (note.created_at && note.created_at.startsWith(dateFilter));

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="liste-notes-page">
        <div className="loading-container">
          <FiClock size={48} />
          <p>Chargement des notes de frais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="liste-notes-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Notes de frais</h1>
          <span className="notes-count">{filteredNotes.length} note{filteredNotes.length > 1 ? 's' : ''}</span>
        </div>
        <div className="header-actions">
          <button 
            className="btn-export"
            onClick={() => alert('Fonction export à implémenter')}
          >
            <FiDownload />
            Exporter
          </button>
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/#/notes-frais/nouvelle'}
          >
            <FiPlus />
            Nouvelle note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par numéro, titre ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="tous">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="soumise">Soumise</option>
            <option value="validee">Validée</option>
            <option value="refusee">Refusée</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-date"
          />
          
          {(searchTerm || statusFilter !== 'tous' || dateFilter) && (
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('tous');
                setDateFilter('');
              }}
            >
              Effacer filtres
            </button>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="notes-container">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={64} />
            <h3>Aucune note de frais</h3>
            <p>
              {notes.length === 0 
                ? "Vous n'avez pas encore créé de note de frais"
                : "Aucune note ne correspond à vos critères de recherche"
              }
            </p>
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/#/notes-frais/nouvelle'}
            >
              <FiPlus />
              Créer ma première note
            </button>
          </div>
        ) : (
          <div className="notes-table-container">
            <table className="notes-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Titre</th>
                  <th>Utilisateur</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Lignes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="note-row">
                    <td className="note-numero">
                      <span className="numero-badge">{note.numero}</span>
                    </td>
                    <td className="note-titre-cell">
                      <div className="titre-container">
                        <h4 className="note-titre">{note.titre}</h4>
                        {note.description && (
                          <p className="note-description">{note.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="note-user">
                      <div className="user-info">
                        <FiUser size={16} />
                        <span>{note.firstName} {note.lastName}</span>
                      </div>
                    </td>
                    <td className="note-date">
                      <div className="date-info">
                        <FiCalendar size={16} />
                        <span>{formatDate(note.created_at)}</span>
                      </div>
                    </td>
                    <td className="note-montant">
                      <div className="montant-container">
                        <FiDollarSign size={16} />
                        <span className="montant-value">{formatMontant(note.montant_total)}</span>
                        <span className="montant-currency">EUR</span>
                      </div>
                    </td>
                    <td className="note-statut">
                      {getStatusBadge(note.statut)}
                    </td>
                    <td className="note-lignes">
                      <div className="lignes-info">
                        <FiFileText size={16} />
                        <span>{note.nb_lignes} ligne{note.nb_lignes > 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    <td className="note-actions">
                      <div className="actions-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewNote(note.id)}
                          title="Voir"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditNote(note.id)}
                          title="Modifier"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => alert('Fonction suppression à implémenter')}
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeNotesPage;