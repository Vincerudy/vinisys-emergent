import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiTag,
  FiPercent,
  FiFileText,
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';
import './css/DetailCategorieAchatPage.css';

const DetailCategorieAchatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { societe_id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
    actif: true,
    tva_deductible: 'Oui'
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchCategory();
    } else {
      // Mode création
      setLoading(false);
      setFormData({
        nom: '',
        code: '',
        description: '',
        actif: true,
        tva_deductible: 'Oui'
      });
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      // Récupérer toutes les catégories et trouver celle qui correspond
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/categories-achats/${societe_id}`
      );
      
      const foundCategory = response.data.categories.find(cat => cat.id === parseInt(id));
      
      if (foundCategory) {
        setCategory(foundCategory);
        setFormData({
          nom: foundCategory.nom || '',
          code: foundCategory.code || '',
          description: foundCategory.description || '',
          actif: foundCategory.actif === 1,
          tva_deductible: foundCategory.tva_deductible || 'Oui'
        });
      } else {
        navigate('/achats/parametrage');
      }
    } catch (error) {
      console.error('Erreur chargement catégorie:', error);
      navigate('/achats/parametrage');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.nom || !formData.code) {
        alert('Le nom et le code sont obligatoires');
        return;
      }

      setSaving(true);

      const payload = {
        ...formData,
        actif: formData.actif ? 1 : 0,
        societe_id: societe_id
      };

      if (id === 'new') {
        // Création
        await axios.post(
          `${import.meta.env.VITE_API_URL}/categories-achats`,
          payload
        );
        alert('Catégorie créée avec succès');
      } else {
        // Modification
        await axios.put(
          `${import.meta.env.VITE_API_URL}/categories-achats/${id}`,
          payload
        );
        alert('Catégorie modifiée avec succès');
      }

      navigate('/achats/parametrage');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      if (error.response?.status === 409) {
        alert('Une catégorie avec ce code existe déjà');
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category?.nom}" ?`)) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/categories-achats/${id}`
      );
      alert('Catégorie supprimée avec succès');
      navigate('/achats/parametrage');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression. Cette catégorie est peut-être utilisée dans des achats.');
    }
  };

  if (loading) {
    return (
      <div className="detail-category-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement de la catégorie...</p>
        </div>
      </div>
    );
  }

  const isNew = id === 'new';

  return (
    <div className="detail-category-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/achats/parametrage')}
            className="back-button"
          >
            <FiArrowLeft size={20} />
            Retour
          </button>
          <div className="header-info">
            <h1 className="page-title">
              <FiTag />
              {isNew ? 'Nouvelle Catégorie' : `Catégorie: ${category?.nom}`}
            </h1>
            <p className="page-subtitle">
              {isNew ? 'Créer une nouvelle catégorie analytique' : 'Modifier les paramètres de la catégorie'}
            </p>
          </div>
        </div>
        
        <div className="header-actions">
          {!isNew && (
            <button 
              onClick={handleDelete}
              className="btn-danger"
            >
              <FiTrash2 size={18} />
              Supprimer
            </button>
          )}
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <FiSave size={18} />
                {isNew ? 'Créer' : 'Sauvegarder'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        <div className="content-grid">
          {/* Formulaire principal */}
          <div className="main-form">
            <div className="form-section">
              <h3 className="section-title">
                <FiInfo />
                Informations générales
              </h3>
              
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
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
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
                    placeholder="Description détaillée de la catégorie..."
                    className="form-textarea"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <FiPercent />
                Paramètres TVA
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="tva_deductible">TVA déductible</label>
                  <select
                    id="tva_deductible"
                    value={formData.tva_deductible}
                    onChange={(e) => setFormData({...formData, tva_deductible: e.target.value})}
                    className="form-select"
                  >
                    <option value="Oui">Oui - TVA déductible</option>
                    <option value="Non">Non - TVA non déductible</option>
                  </select>
                  <small className="form-help">
                    Détermine si la TVA des achats de cette catégorie peut être déduite
                  </small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.actif}
                      onChange={(e) => setFormData({...formData, actif: e.target.checked})}
                      className="form-checkbox"
                    />
                    <span className="checkbox-text">
                      {formData.actif ? <FiToggleRight className="toggle-icon active" /> : <FiToggleLeft className="toggle-icon" />}
                      Catégorie active
                    </span>
                  </label>
                  <small className="form-help">
                    Les catégories inactives n'apparaissent pas dans les formulaires de saisie
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar avec infos */}
          <div className="info-sidebar">
            {!isNew && category && (
              <>
                <div className="info-card">
                  <h4>Informations</h4>
                  <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">{category.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Créée le:</span>
                    <span className="info-value">
                      {new Date(category.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Modifiée le:</span>
                    <span className="info-value">
                      {new Date(category.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="info-card">
                  <h4>Statut actuel</h4>
                  <div className="status-display">
                    <span className={`status-badge ${category.actif ? 'active' : 'inactive'}`}>
                      {category.actif ? 'Actif' : 'Inactif'}
                    </span>
                    <span className={`tva-badge ${category.tva_deductible === 'Oui' ? 'deductible' : 'non-deductible'}`}>
                      TVA {category.tva_deductible === 'Oui' ? 'déductible' : 'non déductible'}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="info-card help-card">
              <h4>
                <FiFileText />
                Aide
              </h4>
              <div className="help-content">
                <p><strong>Nom:</strong> Nom complet de la catégorie affiché dans les listes</p>
                <p><strong>Code:</strong> Code court unique pour identifier la catégorie</p>
                <p><strong>TVA déductible:</strong> Indique si les achats de cette catégorie permettent de déduire la TVA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailCategorieAchatPage;