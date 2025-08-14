import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
  FiSave,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiTag,
  FiPercent
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/ParametrageCategoriesPage.css';

const ParametrageCategoriesPage = () => {
  const { societe_id } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
    actif: true,
    tva_deductible: 'Oui'
  });

  useEffect(() => {
    fetchCategories();
  }, [societe_id]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/categories-achats/${societe_id}`
      );
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      nom: '',
      code: '',
      description: '',
      actif: true,
      tva_deductible: 'Oui'
    });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nom: category.nom || '',
      code: category.code || '',
      description: category.description || '',
      actif: category.actif === 1,
      tva_deductible: category.tva_deductible || 'Oui'
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.nom || !formData.code) {
        alert('Le nom et le code sont obligatoires');
        return;
      }

      const payload = {
        ...formData,
        actif: formData.actif ? 1 : 0,
        societe_id: societe_id
      };

      if (editingCategory) {
        // Modification
        await axios.put(
          `${import.meta.env.VITE_API_URL}/categories-achats/${editingCategory.id}`,
          payload
        );
      } else {
        // Création
        await axios.post(
          `${import.meta.env.VITE_API_URL}/categories-achats`,
          payload
        );
      }

      setShowModal(false);
      fetchCategories();
      alert(editingCategory ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const newStatus = category.actif === 1 ? 0 : 1;
      await axios.put(
        `${import.meta.env.VITE_API_URL}/categories-achats/${category.id}`,
        { ...category, actif: newStatus }
      );
      fetchCategories();
    } catch (error) {
      console.error('Erreur toggle:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.nom}" ?`)) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/categories-achats/${category.id}`
      );
      fetchCategories();
      alert('Catégorie supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression. Cette catégorie est peut-être utilisée dans des achats.');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="parametrage-categories-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiTag />
            Paramétrage des Catégories
          </h1>
          <p className="page-subtitle">
            Gérez les catégories analytiques pour vos achats et dépenses
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleCreate} className="btn-primary">
            <FiPlus size={18} />
            Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="filters-section">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Categories list */}
      <div className="categories-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement des catégories...</p>
          </div>
        ) : (
          <div className="categories-grid">
            {filteredCategories.map((category) => (
              <div key={category.id} className={`category-card ${!category.actif ? 'inactive' : ''}`}>
                <div className="category-header">
                  <div className="category-info">
                    <h3 className="category-name">{category.nom}</h3>
                    <span className="category-code">{category.code}</span>
                  </div>
                  <div className="category-status">
                    {category.actif ? (
                      <span className="status-badge active">Actif</span>
                    ) : (
                      <span className="status-badge inactive">Inactif</span>
                    )}
                  </div>
                </div>

                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}

                <div className="category-details">
                  <div className="detail-item">
                    <FiPercent className="detail-icon" />
                    <span>TVA déductible: </span>
                    <strong className={category.tva_deductible === 'Oui' ? 'text-green' : 'text-red'}>
                      {category.tva_deductible}
                    </strong>
                  </div>
                </div>

                <div className="category-actions">
                  <button
                    onClick={() => handleEdit(category)}
                    className="action-btn edit"
                    title="Modifier"
                  >
                    <FiEdit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleToggleActive(category)}
                    className={`action-btn toggle ${category.actif ? 'active' : 'inactive'}`}
                    title={category.actif ? 'Désactiver' : 'Activer'}
                  >
                    {category.actif ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                  </button>

                  <button
                    onClick={() => handleDelete(category)}
                    className="action-btn delete"
                    title="Supprimer"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && !loading && (
              <div className="empty-state">
                <FiTag size={48} />
                <h3>Aucune catégorie trouvée</h3>
                <p>Commencez par créer votre première catégorie analytique</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nom">Nom de la catégorie *</label>
                  <input
                    id="nom"
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    placeholder="Ex: Fournitures de bureau"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="code">Code *</label>
                  <input
                    id="code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Ex: FOURNI"
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description de la catégorie..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tva_deductible">TVA déductible</label>
                  <select
                    id="tva_deductible"
                    value={formData.tva_deductible}
                    onChange={(e) => setFormData({...formData, tva_deductible: e.target.value})}
                    className="form-select"
                  >
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.actif}
                      onChange={(e) => setFormData({...formData, actif: e.target.checked})}
                      className="form-checkbox"
                    />
                    <span className="checkbox-text">Catégorie active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Annuler
              </button>
              <button onClick={handleSave} className="btn-primary">
                <FiSave className="btn-icon" />
                {editingCategory ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParametrageCategoriesPage;