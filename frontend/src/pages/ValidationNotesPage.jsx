import React, { useState, useEffect } from 'react';
import {
  FiCheck,
  FiX,
  FiEye,
  FiMessageSquare,
  FiClock,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiFileText
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';

const ValidationNotesPage = () => {
  const { societe_id } = useAuth();
  const [notesAValider, setNotesAValider] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentaire, setCommentaire] = useState('');
  const [noteSelectionnee, setNoteSelectionnee] = useState(null);

  useEffect(() => {
    fetchNotesAValider();
  }, [societe_id]);

  const fetchNotesAValider = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notes-frais/validation/${societe_id}`);
      setNotesAValider(response.data || []);
    } catch (error) {
      console.error('Erreur chargement notes à valider:', error);
    } finally {
      setLoading(false);
    }
  };

  const validerNote = async (noteId, decision, commentaire = '') => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/notes-frais/valider/${societe_id}`, {
        note_id: noteId,
        decision: decision,
        commentaire: commentaire
      });
      
      alert(`Note ${decision === 'validee' ? 'validée' : 'refusée'} avec succès`);
      fetchNotesAValider();
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation');
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des notes à valider...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FiCheck className="text-green-600" />
              Validation des Notes de frais
            </h1>
            <p className="text-gray-600 mt-2">
              {notesAValider.length} note(s) en attente de validation
            </p>
          </div>
        </div>
      </div>

      {/* Liste des notes à valider */}
      <div className="space-y-4">
        {notesAValider.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FiFileText className="mx-auto text-gray-400 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune note à valider
            </h3>
            <p className="text-gray-600">
              Toutes les notes de frais ont été traitées
            </p>
          </div>
        ) : (
          notesAValider.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* En-tête de la note */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FiUser className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {note.utilisateur_nom}
                      </h3>
                      <p className="text-gray-600">Note #{note.numero_note}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(note.montant_total)}
                    </div>
                    <div className="text-gray-500 text-sm flex items-center gap-1">
                      <FiCalendar size={14} />
                      {formatDate(note.date_soumission)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de la note */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Informations</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Motif :</span>
                        <span className="font-medium">{note.motif}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destination :</span>
                        <span className="font-medium">{note.destination || 'Non spécifié'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Période :</span>
                        <span className="font-medium">
                          {formatDate(note.date_debut)} - {formatDate(note.date_fin)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Lignes de frais</h4>
                    <div className="space-y-2">
                      {note.lignes?.slice(0, 3).map((ligne, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{ligne.description}</span>
                          <span className="font-medium">{formatCurrency(ligne.montant)}</span>
                        </div>
                      ))}
                      {note.lignes?.length > 3 && (
                        <div className="text-sm text-gray-500">
                          et {note.lignes.length - 3} autre(s) ligne(s)...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Zone de commentaire */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire de validation
                  </label>
                  <textarea
                    value={noteSelectionnee === note.id ? commentaire : ''}
                    onChange={(e) => {
                      setCommentaire(e.target.value);
                      setNoteSelectionnee(note.id);
                    }}
                    placeholder="Ajoutez un commentaire (optionnel)..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => validerNote(note.id, 'validee', noteSelectionnee === note.id ? commentaire : '')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <FiCheck size={16} />
                      Valider
                    </button>
                    <button
                      onClick={() => validerNote(note.id, 'refusee', noteSelectionnee === note.id ? commentaire : '')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <FiX size={16} />
                      Refuser
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <FiEye size={16} />
                      Détails
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <FiMessageSquare size={16} />
                      Demander info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ValidationNotesPage;