import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiSettings, FiEdit, FiX, FiCheck, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const ParametresDepenses = () => {
  const { id: userId, societe_id } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(false);
  
  // États pour les catégories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ nom: '', description: '', type: 'autres' });
  const [editingCategory, setEditingCategory] = useState(null);
  
  // États pour les barèmes
  const [baremes, setBaremes] = useState([]);
  const [newBareme, setNewBareme] = useState({
    nom: '',
    puissanceFiscaleMin: '',
    puissanceFiscaleMax: '',
    tarifParKm: '',
    annee: new Date().getFullYear()
  });
  const [editingBareme, setEditingBareme] = useState(null);

  // États pour les types de frais
  const [typesFrais, setTypesFrais] = useState([]);
  const [editingType, setEditingType] = useState(null);
  const [newType, setNewType] = useState({ nom: '', libelle: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === 'categories') {
      await loadCategories();
    } else if (activeTab === 'baremes') {
      await loadBaremes();
    } else if (activeTab === 'types-frais') {
      await loadTypesFrais();
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${userId}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBaremes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/baremes/${userId}`);
      setBaremes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des barèmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTypesFrais = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/types-frais/manage/${societe_id}`);
      
      if (response.data.success) {
        setTypesFrais(response.data.types_frais);
      }
    } catch (error) {
      console.error('Erreur chargement types de frais:', error);
      Swal.fire('Erreur', 'Erreur lors du chargement des types de frais', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des catégories
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.nom.trim()) {
      Swal.fire('Erreur', 'Le nom de la catégorie est obligatoire', 'error');
      return;
    }

    try {
      await api.post('/categorie', { ...newCategory, userId });
      setNewCategory({ nom: '', description: '', type: 'autres' });
      loadCategories();
      Swal.fire('Succès', 'Catégorie créée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Swal.fire('Erreur', 'Impossible de créer la catégorie', 'error');
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    if (!editingCategory.nom.trim()) {
      Swal.fire('Erreur', 'Le nom de la catégorie est obligatoire', 'error');
      return;
    }

    try {
      await api.put(`/categorie/${categoryId}`, { ...editingCategory, userId });
      setEditingCategory(null);
      loadCategories();
      Swal.fire('Succès', 'Catégorie mise à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Swal.fire('Erreur', 'Impossible de mettre à jour la catégorie', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer la catégorie "${categoryName}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/categorie/${categoryId}`, { userId, actif: false });
        loadCategories();
        Swal.fire('Supprimé !', 'La catégorie a été désactivée.', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer la catégorie', 'error');
      }
    }
  };

  // Gestion des barèmes
  const handleCreateBareme = async (e) => {
    e.preventDefault();
    const { nom, puissanceFiscaleMin, puissanceFiscaleMax, tarifParKm, annee } = newBareme;
    
    if (!nom.trim() || !puissanceFiscaleMin || !puissanceFiscaleMax || !tarifParKm) {
      Swal.fire('Erreur', 'Tous les champs sont obligatoires', 'error');
      return;
    }

    if (parseInt(puissanceFiscaleMin) >= parseInt(puissanceFiscaleMax)) {
      Swal.fire('Erreur', 'La puissance minimum doit être inférieure à la maximum', 'error');
      return;
    }

    try {
      await api.post('/bareme', { ...newBareme, userId });
      setNewBareme({
        nom: '',
        puissanceFiscaleMin: '',
        puissanceFiscaleMax: '',
        tarifParKm: '',
        annee: new Date().getFullYear()
      });
      loadBaremes();
      Swal.fire('Succès', 'Barème créé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      const message = error.response?.data?.message || 'Impossible de créer le barème';
      Swal.fire('Erreur', message, 'error');
    }
  };

  // Gestion des types de frais
  const handleToggleActif = async (typeId, currentActif, isSystemType = false) => {
    try {
      setSaving(true);
      
      await axios.put(`${import.meta.env.VITE_API_URL}/types-frais/${typeId}`, {
        actif: !currentActif,
        societeId: societe_id // Ajouter societeId pour les types système
      });

      // Mettre à jour l'état local
      setTypesFrais(prev => prev.map(type => 
        type.id === typeId ? { ...type, actif: !currentActif } : type
      ));

      Swal.fire({
        icon: 'success',
        title: `Type ${!currentActif ? 'activé' : 'désactivé'}`,
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } catch (error) {
      console.error('Erreur toggle actif:', error);
      Swal.fire('Erreur', 'Erreur lors de la modification', 'error');
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
        Swal.fire('Erreur', 'Veuillez remplir le libellé', 'error');
        return;
      }

      // Vérifier si c'est un type système
      if (editingType.source_type === 'system') {
        Swal.fire('Erreur', 'Impossible de modifier le libellé d\'un type système', 'error');
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
      Swal.fire('Succès', 'Type de frais modifié avec succès', 'success');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Swal.fire('Erreur', 'Erreur lors de la sauvegarde', 'error');
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
        Swal.fire('Erreur', 'Veuillez remplir le nom et le libellé', 'error');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/types-frais`, {
        nom: newType.nom.trim().toLowerCase().replace(/\s+/g, '_'),
        libelle: newType.libelle.trim(),
        societe_id: societe_id
      });

      if (response.data.success) {
        await loadTypesFrais(); // Recharger la liste
        setNewType({ nom: '', libelle: '' });
        setShowAddForm(false);
        Swal.fire('Succès', 'Type de frais ajouté avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur ajout type:', error);
      Swal.fire('Erreur', 'Erreur lors de l\'ajout du type de frais', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      kilometrique: '🚗',
      repas: '🍽️',
      autres: '📋'
    };
    return icons[type] || '📋';
  };

  const getTypeColor = (type) => {
    const colors = {
      kilometrique: 'primary',
      repas: 'success',
      autres: 'warning'
    };
    return colors[type] || 'secondary';
  };

  return (
    <div className="nxl-content">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <Link to="/depenses/tableau-bord" className="btn btn-outline-primary me-3">
            <FiArrowLeft />
          </Link>
          <div className="page-header-title">
            <h5 className="m-b-10">Paramètres du module Dépenses</h5>
            <p className="fs-13 text-muted m-b-0">
              Configuration des catégories, barèmes et taux TVA
            </p>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                ⚙️ Général
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                <FiSettings className="me-2" />
                Catégories
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'baremes' ? 'active' : ''}`}
                onClick={() => setActiveTab('baremes')}
              >
                🚗 Barèmes kilométriques
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'types-frais' ? 'active' : ''}`}
                onClick={() => setActiveTab('types-frais')}
              >
                💼 Types de frais
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* Onglet Catégories */}
          {activeTab === 'categories' && (
            <div>
              <div className="row mb-4">
                <div className="col-md-8">
                  <h6>Gestion des catégories de dépenses</h6>
                  <p className="text-muted small">
                    Personnalisez les catégories selon vos besoins métier
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <button 
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#newCategoryModal"
                  >
                    <FiPlus className="me-2" />
                    Nouvelle catégorie
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Statut</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(category => (
                        <tr key={category.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{getTypeIcon(category.type)}</span>
                              <strong>{category.nom}</strong>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${getTypeColor(category.type)}-subtle text-${getTypeColor(category.type)}`}>
                              {category.type === 'kilometrique' ? 'Kilométrique' :
                               category.type === 'repas' ? 'Repas' : 'Autres'}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {category.description || '-'}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${category.actif ? 'bg-success' : 'bg-secondary'}`}>
                              {category.actif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => setEditingCategory(category)}
                                data-bs-toggle="modal"
                                data-bs-target="#editCategoryModal"
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteCategory(category.id, category.nom)}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            <div className="text-muted">
                              <i className="fas fa-tags fa-2x mb-3 opacity-25"></i>
                              <p>Aucune catégorie personnalisée créée</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Onglet Barèmes kilométriques */}
          {activeTab === 'baremes' && (
            <div>
              <div className="row mb-4">
                <div className="col-md-8">
                  <h6>Barèmes kilométriques URSSAF</h6>
                  <p className="text-muted small">
                    Configurez les tarifs de remboursement selon la puissance fiscale des véhicules
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <button 
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#newBaremeModal"
                  >
                    <FiPlus className="me-2" />
                    Nouveau barème
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Nom</th>
                        <th>Puissance fiscale</th>
                        <th>Tarif/km</th>
                        <th>Année</th>
                        <th>Statut</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {baremes.map(bareme => (
                        <tr key={bareme.id}>
                          <td><strong>{bareme.nom}</strong></td>
                          <td>
                            <span className="badge bg-info-subtle text-info">
                              {bareme.puissance_fiscale_min} - {bareme.puissance_fiscale_max} CV
                            </span>
                          </td>
                          <td>
                            <strong className="text-primary">
                              {parseFloat(bareme.tarif_par_km).toFixed(3)}€
                            </strong>
                          </td>
                          <td>{bareme.annee}</td>
                          <td>
                            <span className={`badge ${bareme.actif ? 'bg-success' : 'bg-secondary'}`}>
                              {bareme.actif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => setEditingBareme(bareme)}
                              >
                                <FiEdit2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {baremes.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <div className="text-muted">
                              <i className="fas fa-car fa-2x mb-3 opacity-25"></i>
                              <p>Aucun barème configuré</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Onglet Types de frais */}
          {activeTab === 'types-frais' && (
            <div>
              <div className="row mb-4">
                <div className="col-md-8">
                  <h6>Gestion des types de frais</h6>
                  <p className="text-muted small">
                    Gérez les types de frais disponibles pour la saisie des notes de frais
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <FiPlus className="me-2" />
                    Ajouter un type
                  </button>
                </div>
              </div>

              {/* Formulaire d'ajout */}
              {showAddForm && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="card-title mb-0">Ajouter un nouveau type de frais</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nom technique (sans espaces)</label>
                        <input
                          type="text"
                          value={newType.nom}
                          onChange={(e) => setNewType({ ...newType, nom: e.target.value })}
                          className="form-control"
                          placeholder="Ex: transport_commun"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Libellé affiché</label>
                        <input
                          type="text"
                          value={newType.libelle}
                          onChange={(e) => setNewType({ ...newType, libelle: e.target.value })}
                          className="form-control"
                          placeholder="Ex: Transport en commun"
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewType({ nom: '', libelle: '' });
                        }}
                      >
                        <FiX className="me-2" />
                        Annuler
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleAddNewType}
                        disabled={saving}
                      >
                        <FiSave className="me-2" />
                        {saving ? 'Ajout...' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Type</th>
                        <th>Libellé</th>
                        <th>Nom technique</th>
                        <th>Statut</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {typesFrais.map((type) => (
                        <tr key={`${type.source_type}-${type.id}`} className={!type.actif ? 'table-secondary' : ''}>
                          <td>
                            {type.source_type === 'system' ? (
                              <span className="badge bg-info-subtle text-info">
                                <i className="fas fa-cog me-1"></i>
                                Système
                              </span>
                            ) : (
                              <span className="badge bg-primary-subtle text-primary">
                                <i className="fas fa-user me-1"></i>
                                Personnalisé
                              </span>
                            )}
                          </td>
                          <td>
                            {editingType && editingType.id === type.id ? (
                              type.source_type === 'system' ? (
                                <span className="text-muted">{type.libelle} <small>(non modifiable)</small></span>
                              ) : (
                                <input
                                  type="text"
                                  value={editingType.libelle}
                                  onChange={(e) => setEditingType({ ...editingType, libelle: e.target.value })}
                                  className="form-control form-control-sm"
                                />
                              )
                            ) : (
                              <strong>{type.libelle}</strong>
                            )}
                          </td>
                          <td>
                            <code className="text-muted">{type.nom}</code>
                          </td>
                      {typesFrais.map((type) => (
                        <tr 
                          key={`${type.source_type}-${type.id}`} 
                          className={`${!type.actif ? 'table-secondary' : ''} cursor-pointer`}
                          onClick={(e) => {
                            // Éviter le clic si on clique sur le switch
                            if (e.target.type !== 'checkbox') {
                              window.location.href = `/#/depenses/types-frais/detail/${type.id}`;
                            }
                          }}
                          style={{cursor: 'pointer'}}
                        >
                          <td>
                            {type.source_type === 'system' ? (
                              <span className="badge bg-info-subtle text-info">
                                <i className="fas fa-cog me-1"></i>
                                Système
                              </span>
                            ) : (
                              <span className="badge bg-primary-subtle text-primary">
                                <i className="fas fa-user me-1"></i>
                                Personnalisé
                              </span>
                            )}
                          </td>
                          <td>
                            <strong>{type.libelle}</strong>
                            {type.source_type === 'system' && (
                              <small className="text-muted d-block">Non modifiable</small>
                            )}
                          </td>
                          <td>
                            <code className="text-muted">{type.nom}</code>
                          </td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`switch-${type.id}-${type.source_type}`}
                                checked={type.actif}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleActif(type.id, type.actif, type.source_type === 'system');
                                }}
                                disabled={saving}
                              />
                              <label className="form-check-label" htmlFor={`switch-${type.id}-${type.source_type}`}>
                                <span className={`badge ${type.actif ? 'bg-success' : 'bg-secondary'} ms-2`}>
                                  {type.actif ? 'Actif' : 'Inactif'}
                                </span>
                              </label>
                            </div>
                          </td>
                          <td className="text-end">
                            <Link 
                              to={`/depenses/types-frais/detail/${type.id}`}
                              className="btn btn-outline-primary btn-sm"
                              title="Configurer ce type de frais"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiSettings className="me-1" />
                              Configurer
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {typesFrais.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            <div className="text-muted">
                              <i className="fas fa-list fa-2x mb-3 opacity-25"></i>
                              <p>Aucun type de frais configuré</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="alert alert-info mt-4">
                <h6 className="alert-heading">Information</h6>
                <ul className="mb-0">
                  <li>Les types <strong>actifs</strong> sont disponibles lors de la création de frais</li>
                  <li>Les types <strong>inactifs</strong> ne sont plus proposés mais conservent les données existantes</li>
                  <li>Vous pouvez modifier le libellé affiché à tout moment</li>
                  <li>Le nom technique ne peut pas être modifié une fois créé</li>
                </ul>
              </div>
            </div>
          )}

          {/* Onglet Paramètres généraux */}
          {activeTab === 'general' && (
            <div>
              <h6>Paramètres généraux</h6>
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">OCR (Reconnaissance optique)</h6>
                      <p className="card-text small text-muted">
                        Activation/désactivation de la reconnaissance automatique de documents
                      </p>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="ocrSwitch" defaultChecked />
                        <label className="form-check-label" htmlFor="ocrSwitch">
                          Activer l'OCR
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Validation automatique</h6>
                      <p className="card-text small text-muted">
                        Règles de validation automatique des dépenses
                      </p>
                      <div className="mb-3">
                        <label className="form-label">Montant maximum sans validation</label>
                        <div className="input-group">
                          <input type="number" className="form-control" defaultValue="50" />
                          <span className="input-group-text">€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouvelle catégorie */}
      <div className="modal fade" id="newCategoryModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleCreateCategory}>
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle catégorie</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCategory.nom}
                    onChange={(e) => setNewCategory(prev => ({...prev, nom: e.target.value}))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-select"
                    value={newCategory.type}
                    onChange={(e) => setNewCategory(prev => ({...prev, type: e.target.value}))}
                    required
                  >
                    <option value="kilometrique">🚗 Kilométrique</option>
                    <option value="repas">🍽️ Repas</option>
                    <option value="autres">📋 Autres</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({...prev, description: e.target.value}))}
                    placeholder="Description optionnelle de la catégorie"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiSave className="me-2" />
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Nouveau barème */}
      <div className="modal fade" id="newBaremeModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleCreateBareme}>
              <div className="modal-header">
                <h5 className="modal-title">Nouveau barème kilométrique</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newBareme.nom}
                    onChange={(e) => setNewBareme(prev => ({...prev, nom: e.target.value}))}
                    placeholder="ex: Véhicule jusqu'à 3 CV"
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Puissance min (CV) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newBareme.puissanceFiscaleMin}
                      onChange={(e) => setNewBareme(prev => ({...prev, puissanceFiscaleMin: e.target.value}))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Puissance max (CV) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newBareme.puissanceFiscaleMax}
                      onChange={(e) => setNewBareme(prev => ({...prev, puissanceFiscaleMax: e.target.value}))}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tarif par km (€) *</label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-control"
                      value={newBareme.tarifParKm}
                      onChange={(e) => setNewBareme(prev => ({...prev, tarifParKm: e.target.value}))}
                      placeholder="0.502"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Année *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newBareme.annee}
                      onChange={(e) => setNewBareme(prev => ({...prev, annee: e.target.value}))}
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiSave className="me-2" />
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametresDepenses;