import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
  FiTag,
  FiPercent,
  FiCalendar,
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/ParametrageCategoriesPage.css';

const ParametrageCategoriesPage = () => {
  const { societe_id } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    navigate('/achats/parametrage/new');
  };

  const handleViewCategory = (category) => {
    navigate(`/achats/parametrage/${category.id}`);
  };

  const handleSave = async () => {
    // Cette fonction n'est plus nécessaire - supprimée
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
          <div className="categories-table-container">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>TVA déductible</th>
                  <th>Statut</th>
                  <th>Créée le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr 
                    key={category.id} 
                    className={`category-row ${!category.actif ? 'inactive' : ''} clickable`}
                    onClick={() => handleViewCategory(category)}
                  >
                    <td className="code-cell">
                      <span className="category-code">{category.code}</span>
                    </td>
                    <td className="name-cell">
                      <div className="category-name">
                        <FiTag className="category-icon" />
                        <strong>{category.nom}</strong>
                      </div>
                    </td>
                    <td className="description-cell">
                      <span className="category-description">
                        {category.description || 'Aucune description'}
                      </span>
                    </td>
                    <td className="tva-cell">
                      <span className={`tva-badge ${category.tva_deductible === 'Oui' ? 'deductible' : 'non-deductible'}`}>
                        <FiPercent className="tva-icon" />
                        {category.tva_deductible}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${category.actif ? 'active' : 'inactive'}`}>
                        {category.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="date-cell">
                      <div className="date-info">
                        <FiCalendar className="date-icon" />
                        {new Date(category.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="category-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCategory(category);
                          }}
                          className="action-btn view"
                          title="Voir détails"
                        >
                          <FiEye size={16} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(category);
                          }}
                          className={`action-btn toggle ${category.actif ? 'active' : 'inactive'}`}
                          title={category.actif ? 'Désactiver' : 'Activer'}
                        >
                          {category.actif ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(category);
                          }}
                          className="action-btn delete"
                          title="Supprimer"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCategories.length === 0 && !loading && (
              <div className="empty-state">
                <FiTag size={48} />
                <h3>Aucune catégorie trouvée</h3>
                <p>Commencez par créer votre première catégorie analytique</p>
                <button onClick={handleCreate} className="btn-primary">
                  <FiPlus size={18} />
                  Créer une catégorie
                </button>
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