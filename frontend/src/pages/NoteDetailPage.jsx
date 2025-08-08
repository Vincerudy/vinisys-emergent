import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUpload,
  FiSend,
  FiSave,
  FiX,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiFolder,
  FiArrowLeft
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import FraisSidebar from '../components/FraisSidebar';
import './css/NoteDetailPage.css';

const NoteDetailPage = () => {
  const { societe_id, id: user_id } = useAuth();
  
  // Récupérer l'ID de la note depuis l'URL
  const noteId = window.location.hash.includes('/note/') 
    ? window.location.hash.split('/note/')[1] 
    : null;
  
  const [note, setNote] = useState(null);
  const [frais, setFrais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingFrais, setEditingFrais] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    if (noteId) {
      fetchNoteDetails();
    }
  }, [noteId]);

  const fetchNoteDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/note-frais/${noteId}`);
      
      if (response.data.success) {
        setNote(response.data.note);
        setFrais(response.data.note.lignes_frais || []);
        setNoteTitle(response.data.note.titre || `Note de frais ${response.data.note.numero}`);
      }
    } catch (error) {
      console.error('Erreur chargement note:', error);
      alert('Erreur lors du chargement de la note de frais');
    } finally {
      setLoading(false);
    }
  };

  const handleNewFrais = () => {
    setEditingFrais(null);
    setSidebarOpen(true);
  };

  const handleEditFrais = (fraisItem) => {
    setEditingFrais(fraisItem);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditingFrais(null);
  };

  const handleFraisSaved = () => {
    fetchNoteDetails(); // Recharger les données
    handleCloseSidebar();
  };

  const handleFileUpload = async (file) => {
    // Créer automatiquement un frais avec l'image uploadée
    const formData = new FormData();
    formData.append('file', file);
    formData.append('note_frais_id', noteId);
    formData.append('auto_create', 'true');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/frais/upload-auto`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        alert('Frais créé automatiquement à partir de l\'image');
        fetchNoteDetails();
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    }
  };

  const formatMontant = (montant) => {
    return parseFloat(montant || 0).toFixed(2).replace('.', ',');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getTotalMontant = () => {
    return frais.reduce((total, fraisItem) => total + parseFloat(fraisItem.montant || 0), 0);
  };

  const handleTitleUpdate = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/note-frais/${noteId}`, {
        titre: noteTitle
      });
      setIsEditingTitle(false);
      fetchNoteDetails();
    } catch (error) {
      console.error('Erreur mise à jour titre:', error);
      alert('Erreur lors de la mise à jour du titre');
    }
  };

  const handleSubmitNote = async () => {
    if (frais.length === 0) {
      alert('Ajoutez au moins un frais avant de soumettre la note');
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/note-frais/${noteId}`, {
        statut: 'soumise'
      });
      alert('Note de frais soumise pour validation');
      window.location.href = '/#/notes-frais/liste';
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('Erreur lors de la soumission');
    }
  };

  if (loading) {
    return (
      <div className="note-detail-page">
        <div className="loading-container">
          <p>Chargement de la note de frais...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="note-detail-page">
        <div className="error-container">
          <p>Note de frais non trouvée</p>
          <button onClick={() => window.location.href = '/#/notes-frais/liste'}>
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-detail-page">
      {/* Header */}
      <div className="note-header">
        <div className="header-left">
          <button 
            className="btn-back"
            onClick={() => window.location.href = '/#/notes-frais/liste'}
          >
            <FiArrowLeft />
            Retour
          </button>
          
          <div className="note-info">
            {isEditingTitle ? (
              <div className="title-edit">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="title-input"
                  onBlur={handleTitleUpdate}
                  onKeyPress={(e) => e.key === 'Enter' && handleTitleUpdate()}
                  autoFocus
                />
              </div>
            ) : (
              <h1 onClick={() => setIsEditingTitle(true)} className="note-title">
                {noteTitle}
                <FiEdit className="edit-icon" />
              </h1>
            )}
            
            <div className="note-meta">
              <span className="note-number">{note.numero}</span>
              <span className="note-date">
                <FiCalendar />
                {formatDate(note.created_at)}
              </span>
              <span className="note-user">
                <FiUser />
                {note.firstName} {note.lastName}
              </span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="total-amount">
            <FiDollarSign className="amount-icon" />
            <span className="amount-value">{formatMontant(getTotalMontant())}</span>
            <span className="amount-currency">EUR</span>
          </div>
          
          <div className="header-actions">
            <input
              type="file"
              id="file-upload-auto"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload-auto" className="btn-upload">
              <FiUpload />
              Charger image
            </label>
            
            <button className="btn-new-frais" onClick={handleNewFrais}>
              <FiPlus />
              Nouveau frais
            </button>
            
            <button className="btn-submit" onClick={handleSubmitNote}>
              <FiSend />
              Soumettre note
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="note-content">
        <div className="frais-section">
          <div className="section-header">
            <h2>
              <FiFolder />
              Liste des frais ({frais.length})
            </h2>
          </div>

          {frais.length === 0 ? (
            <div className="empty-frais">
              <FiFileText size={64} />
              <h3>Aucun frais ajouté</h3>
              <p>Commencez par ajouter un frais à cette note</p>
              <button className="btn-primary" onClick={handleNewFrais}>
                <FiPlus />
                Ajouter le premier frais
              </button>
            </div>
          ) : (
            <div className="frais-table-container">
              <table className="frais-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vendeur</th>
                    <th>Description</th>
                    <th>Montant TTC</th>
                    <th>Pays</th>
                    <th>Moyen paiement</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {frais.map((fraisItem) => (
                    <tr key={fraisItem.id} className="frais-row">
                      <td className="frais-date">
                        {formatDate(fraisItem.date_frais)}
                      </td>
                      <td className="frais-vendeur">
                        <strong>{fraisItem.vendeur}</strong>
                      </td>
                      <td className="frais-description">
                        {fraisItem.description}
                      </td>
                      <td className="frais-montant">
                        <div className="montant-cell">
                          <span className="montant-value">{formatMontant(fraisItem.montant)}</span>
                          <span className="montant-currency">EUR</span>
                        </div>
                      </td>
                      <td className="frais-pays">
                        {fraisItem.pays}
                      </td>
                      <td className="frais-paiement">
                        {fraisItem.moyen_paiement}
                      </td>
                      <td className="frais-actions">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditFrais(fraisItem)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar pour créer/modifier un frais */}
      {sidebarOpen && (
        <FraisSidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          noteId={noteId}
          fraisData={editingFrais}
          onSaved={handleFraisSaved}
        />
      )}
    </div>
  );
};

export default NoteDetailPage;