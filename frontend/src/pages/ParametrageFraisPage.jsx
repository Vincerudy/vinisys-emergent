import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiCheck,
  FiSettings,
  FiToggleLeft,
  FiToggleRight,
  FiDollarSign,
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';
import './css/ParametrageFraisPage.css';

const ParametrageFraisPage = () => {
  const { societe_id } = useAuth();
  
  const [typesFrais, setTypesFrais] = useState([]);
  const [categoriesAchats, setCategoriesAchats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState(null);
  const [newType, setNewType] = useState({ nom: '', libelle: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'types-frais' ou 'tva-categories'
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [loadingOcr, setLoadingOcr] = useState(false);

  useEffect(() => {
    fetchTypesFrais();
    fetchCategoriesAchats();
    fetchParametresGeneraux();
  }, [societe_id]);

  const fetchParametresGeneraux = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/parametres-notes-frais/${societe_id}`);
      if (response.data.success) {
        setOcrEnabled(response.data.parametres.ocr_enabled || false);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres généraux:', error);
      // Si l'API n'existe pas encore, utiliser la valeur par défaut
      setOcrEnabled(false);
    }
  };

  const saveParametreOcr = async (enabled) => {
    try {
      setLoadingOcr(true);
      await axios.put(`${import.meta.env.VITE_API_URL}/parametres-notes-frais/${societe_id}`, {
        ocr_enabled: enabled
      });
      setOcrEnabled(enabled);
      Swal.fire('Succès', 'Paramètre OCR mis à jour', 'success');
    } catch (error) {
      console.error('Erreur sauvegarde OCR:', error);
      Swal.fire('Erreur', 'Erreur lors de la sauvegarde du paramètre OCR', 'error');
    } finally {
      setLoadingOcr(false);
    }
  };

  const fetchCategoriesAchats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories-achats/${societe_id}`);
      if (response.data.success) {
        setCategoriesAchats(response.data.categories);
      }
    } catch (error) {
      console.error('Erreur chargement catégories achats:', error);
    }
  };

  const handleToggleTVADeductible = async (categorieId, currentValue) => {
    try {
      setSaving(true);
      
      const newValue = !currentValue;
      
      await axios.put(`${import.meta.env.VITE_API_URL}/categories-achats/${categorieId}`, {
        tva_deductible: newValue
      });

      // Mettre à jour l'état local
      setCategoriesAchats(prev => prev.map(cat => 
        cat.id === categorieId 
          ? { ...cat, tva_deductibile: newValue ? 1 : 0 }
          : cat
      ));

      Swal.fire({
        icon: 'success',
        title: 'Paramètre mis à jour',
        text: `TVA ${newValue ? 'déductible' : 'non déductible'} pour ${categoriesAchats.find(c => c.id === categorieId)?.nom}`,
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });

    } catch (error) {
      console.error('❌ Erreur mise à jour TVA:', error);
      Swal.fire('Erreur', 'Impossible de mettre à jour le paramètre TVA', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fetchTypesFrais = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/types-frais/manage/${societe_id}`);
      
      if (response.data.success) {
        setTypesFrais(response.data.types_frais);
      }
    } catch (error) {
      console.error('Erreur chargement types de frais:', error);
      alert('Erreur lors du chargement des types de frais');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActif = async (typeId, currentActif) => {
    try {
      setSaving(true);
      const typeToUpdate = typesFrais.find(t => t.id === typeId);
      
      await axios.put(`${import.meta.env.VITE_API_URL}/types-frais/${typeId}`, {
        libelle: typeToUpdate.libelle,
        actif: !currentActif
      });

      // Mettre à jour l'état local
      setTypesFrais(prev => prev.map(type => 
        type.id === typeId ? { ...type, actif: !currentActif } : type
      ));

      console.log(`Type ${typeToUpdate.libelle} ${!currentActif ? 'activé' : 'désactivé'}`);
    } catch (error) {
      console.error('Erreur toggle actif:', error);
      alert('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleEditType = (type) => {
    setEditingType({ ...type });
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      
      if (!editingType.libelle.trim()) {
        alert('Veuillez remplir le libellé');
        return;
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/types-frais/${editingType.id}`, {
        libelle: editingType.libelle.trim(),
        actif: editingType.actif
      });

      // Mettre à jour l'état local
      setTypesFrais(prev => prev.map(type => 
        type.id === editingType.id ? editingType : type
      ));

      setEditingType(null);
      alert('Type de frais modifié avec succès');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingType(null);
  };

  const handleAddNewType = async () => {
    try {
      setSaving(true);
      
      if (!newType.nom.trim() || !newType.libelle.trim()) {
        alert('Veuillez remplir le nom et le libellé');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/types-frais`, {
        nom: newType.nom.trim().toLowerCase().replace(/\s+/g, '_'),
        libelle: newType.libelle.trim(),
        societe_id: societe_id
      });

      if (response.data.success) {
        await fetchTypesFrais(); // Recharger la liste
        setNewType({ nom: '', libelle: '' });
        setShowAddForm(false);
        alert('Type de frais ajouté avec succès');
      }
    } catch (error) {
      console.error('Erreur ajout type:', error);
      alert('Erreur lors de l\'ajout du type de frais');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="parametrage-frais-page">
        <div className="loading-container">
          <p>Chargement des types de frais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parametrage-frais-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>
            <FiSettings />
            Paramétrage des types de frais
          </h1>
          <p>Gérez les types de frais disponibles pour la saisie</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <FiPlus />
            Ajouter un type
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="add-form-container">
          <div className="add-form">
            <h3>Ajouter un nouveau type de frais</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nom technique (sans espaces)</label>
                <input
                  type="text"
                  value={newType.nom}
                  onChange={(e) => setNewType({ ...newType, nom: e.target.value })}
                  className="form-input"
                  placeholder="Ex: transport_commun"
                />
              </div>
              <div className="form-group">
                <label>Libellé affiché</label>
                <input
                  type="text"
                  value={newType.libelle}
                  onChange={(e) => setNewType({ ...newType, libelle: e.target.value })}
                  className="form-input"
                  placeholder="Ex: Transport en commun"
                />
              </div>
              <div className="form-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewType({ nom: '', libelle: '' });
                  }}
                >
                  <FiX />
                  Annuler
                </button>
                <button 
                  className="btn-save"
                  onClick={handleAddNewType}
                  disabled={saving}
                >
                  <FiSave />
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Types List */}
      <div className="types-container">
        <div className="types-table-container">
          <table className="types-table">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Nom technique</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {typesFrais.map((type) => (
                <tr key={type.id} className={`type-row ${!type.actif ? 'disabled' : ''}`}>
                  <td className="type-libelle">
                    {editingType && editingType.id === type.id ? (
                      <input
                        type="text"
                        value={editingType.libelle}
                        onChange={(e) => setEditingType({ ...editingType, libelle: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      <span className="libelle-text">{type.libelle}</span>
                    )}
                  </td>
                  <td className="type-nom">
                    <code>{type.nom}</code>
                  </td>
                  <td className="type-statut">
                    <button
                      className={`toggle-btn ${type.actif ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActif(type.id, type.actif)}
                      disabled={saving}
                    >
                      {type.actif ? (
                        <>
                          <FiToggleRight />
                          Actif
                        </>
                      ) : (
                        <>
                          <FiToggleLeft />
                          Inactif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="type-actions">
                    {editingType && editingType.id === type.id ? (
                      <div className="edit-actions">
                        <button
                          className="btn-action btn-validate"
                          onClick={handleSaveEdit}
                          disabled={saving}
                        >
                          <FiCheck />
                        </button>
                        <button
                          className="btn-action btn-cancel-edit"
                          onClick={handleCancelEdit}
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="actions-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditType(type)}
                          title="Modifier"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => alert('Suppression à implémenter avec vérification des dépendances')}
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-panel">
          <h3>Information</h3>
          <ul>
            <li>Les types <strong>actifs</strong> sont disponibles lors de la création de frais</li>
            <li>Les types <strong>inactifs</strong> ne sont plus proposés mais conservent les données existantes</li>
            <li>Vous pouvez modifier le libellé affiché à tout moment</li>
            <li>La suppression n'est possible que si aucun frais n'utilise ce type</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ParametrageFraisPage;