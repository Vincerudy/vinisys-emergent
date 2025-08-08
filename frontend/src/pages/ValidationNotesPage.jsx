import React, { useState, useEffect } from 'react';
import {
  FiCheck,
  FiX,
  FiEye,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiFileText,
  FiRefreshCw,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import './css/ValidationNotesPage.css';

const ValidationNotesPage = () => {
  const { societe_id, id: validateur_id } = useAuth();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAction, setValidationAction] = useState(''); // 'valider' ou 'refuser'
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchNotesEnAttente();
  }, [societe_id]);

  const fetchNotesEnAttente = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notes-frais/validation/${societe_id}`);
      
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Erreur chargement notes validation:', error);
      alert('Erreur lors du chargement des notes en attente');
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

  const handleSelectNote = (noteId) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotes.length === notes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes.map(note => note.id));
    }
  };

  const handleValidationAction = (action, noteId = null) => {
    if (noteId) {
      // Validation individuelle
      setSelectedNotes([noteId]);
    }
    
    if (selectedNotes.length === 0 && !noteId) {
      alert('Veuillez sélectionner au moins une note');
      return;
    }

    setValidationAction(action);
    setShowValidationModal(true);
  };

  const confirmValidation = async () => {
    if (selectedNotes.length === 0) {
      alert('Veuillez sélectionner au moins une note');
      return;
    }

    setProcessing(true);
    try {
      
      // Valider chaque note individuellement
      for (const noteId of selectedNotes) {
        const endpoint = validationAction === 'valider' 
          ? `/notes-frais/${noteId}/valider`
          : `/notes-frais/${noteId}/refuser`;
          
        const data = validationAction === 'valider' 
          ? { validateur_id }
          : { validateur_id, motif_refus: 'Refusée en lot' };

        await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, data);
      }

      alert(`${selectedNotes.length} note(s) ${validationAction === 'valider' ? 'validée(s)' : 'refusée(s)'} avec succès`);
      setSelectedNotes([]);
      await fetchNotesEnAttente(); // Recharger la liste
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation: ' + (error.response?.data?.error || error.message));
    } finally {
      setProcessing(false);
      setShowValidationModal(false);
    }
  };

  const handleViewNote = (noteId) => {
    window.location.href = `/#/notes-frais/note/${noteId}`;
  };

  if (loading) {
    return (
      <div className="validation-notes-page">
        <div className="loading-container">
          <FiRefreshCw className="spin" size={32} />
          <p>Chargement des notes en attente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="validation-notes-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Validation des notes de frais</h1>
          <span className="notes-count">
            {notes.length} note{notes.length > 1 ? 's' : ''} en attente
          </span>
        </div>
        <div className="header-actions">
          <button 
            className="btn-refresh"
            onClick={fetchNotesEnAttente}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {notes.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="selection-info">
            <button 
              className="select-all-btn"
              onClick={handleSelectAll}
            >
              {selectedNotes.length === notes.length ? (
                <FiCheckSquare />
              ) : (
                <FiSquare />
              )}
              Tout sélectionner
            </button>
            {selectedNotes.length > 0 && (
              <span className="selected-count">
                {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''} sélectionnée{selectedNotes.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {selectedNotes.length > 0 && (
            <div className="bulk-actions">
              <button 
                className="btn-validate-bulk"
                onClick={() => handleValidationAction('valider')}
                disabled={processing}
              >
                <FiCheck />
                Valider sélection
              </button>
              <button 
                className="btn-refuse-bulk"
                onClick={() => handleValidationAction('refuser')}
                disabled={processing}
              >
                <FiX />
                Refuser sélection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notes List */}
      <div className="notes-container">
        {notes.length === 0 ? (
          <div className="empty-state">
            <FiCheck size={64} />
            <h3>Aucune note en attente</h3>
            <p>Toutes les notes de frais ont été traitées</p>
          </div>
        ) : (
          <div className="notes-table-container">
            <table className="notes-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedNotes.length === notes.length}
                      onChange={handleSelectAll}
                      className="checkbox-input"
                    />
                  </th>
                  <th>Numéro</th>
                  <th>Employé</th>
                  <th>Date soumission</th>
                  <th>Montant</th>
                  <th>Nb lignes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr 
                    key={note.id} 
                    className={`note-row ${selectedNotes.includes(note.id) ? 'selected' : ''}`}
                  >
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedNotes.includes(note.id)}
                        onChange={() => handleSelectNote(note.id)}
                        className="checkbox-input"
                      />
                    </td>
                    <td className="note-numero">
                      <span className="numero-badge">{note.numero}</span>
                    </td>
                    <td className="note-employe">
                      <div className="employe-info">
                        <FiUser size={16} />
                        <span>{note.utilisateur_prenom} {note.utilisateur_nom}</span>
                      </div>
                    </td>
                    <td className="note-date">
                      <div className="date-info">
                        <FiCalendar size={16} />
                        <span>{formatDate(note.date_soumission)}</span>
                      </div>
                    </td>
                    <td className="note-montant">
                      <div className="montant-container">
                        <FiDollarSign size={16} />
                        <span className="montant-value">{formatMontant(note.total_ttc)}</span>
                        <span className="montant-currency">EUR</span>
                      </div>
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
                          title="Voir détails"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="btn-action btn-validate"
                          onClick={() => handleValidationAction('valider', note.id)}
                          title="Valider"
                          disabled={processing}
                        >
                          <FiCheck />
                        </button>
                        <button
                          className="btn-action btn-refuse"
                          onClick={() => handleValidationAction('refuser', note.id)}
                          title="Refuser"
                          disabled={processing}
                        >
                          <FiX />
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

      {/* Modale de confirmation de validation */}
      <ConfirmationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onConfirm={confirmValidation}
        title={validationAction === 'valider' ? 'Valider les notes de frais' : 'Refuser les notes de frais'}
        message={
          validationAction === 'valider'
            ? `Êtes-vous sûr de vouloir valider ${selectedNotes.length} note(s) de frais ? Cette action est définitive.`
            : `Êtes-vous sûr de vouloir refuser ${selectedNotes.length} note(s) de frais ? Cette action est définitive.`
        }
        confirmText={validationAction === 'valider' ? 'Valider' : 'Refuser'}
        cancelText="Annuler"
        type={validationAction === 'valider' ? 'success' : 'danger'}
      />
    </div>
  );
};

export default ValidationNotesPage;