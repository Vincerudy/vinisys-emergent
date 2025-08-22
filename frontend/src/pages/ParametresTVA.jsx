import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../contexte/Api';
import { useAuth } from '../contexte/AuthContext';
import Swal from 'sweetalert2';

const ParametresTVA = () => {
  const { id: userId, societe_id } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories-achats/${societe_id}`);
      setCategories(response.data.categories || []);
      console.log('✅ Catégories d\'achats chargées:', response.data.categories);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des catégories:', error);
      Swal.fire('Erreur', 'Impossible de charger les catégories d\'achats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTVAToggle = async (categorieId, currentValue) => {
    try {
      setSaving(true);
      
      const newValue = !currentValue;
      
      await api.put(`/categories-achats/${categorieId}`, {
        tva_deductible: newValue
      });

      // Mettre à jour l'état local
      setCategories(prev => prev.map(cat => 
        cat.id === categorieId 
          ? { ...cat, tva_deductible: newValue ? 1 : 0 }
          : cat
      ));

      console.log(`✅ TVA ${newValue ? 'déductible' : 'non déductible'} mise à jour pour la catégorie ${categorieId}`);
      
      // Notification discrète
      Swal.fire({
        icon: 'success',
        title: 'Paramètre mis à jour',
        text: `TVA ${newValue ? 'déductible' : 'non déductible'} pour cette catégorie`,
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

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">
              <FiSettings className="me-2" />
              Paramètres TVA par catégorie
            </h5>
            <p className="fs-13 text-muted m-b-0">
              Configurez la déductibilité de la TVA par catégorie d'achat
            </p>
          </div>
        </div>
        <div className="page-header-right ms-auto">
          <div className="page-header-right-items">
            <Link to="/depenses/tableau-bord" className="btn btn-outline-primary me-3">
              <FiArrowLeft className="me-2" />
              Retour
            </Link>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">
                  Configuration de la déductibilité TVA
                </h6>
                <p className="text-muted mb-0">
                  Définissez si la TVA de chaque catégorie d'achat est déductible ou non.
                  Cette configuration affecte le calcul du rapport financier.
                </p>
              </div>

              <div className="card-body">
                {categories.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">Aucune catégorie d'achat trouvée</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Catégorie</th>
                          <th>Code</th>
                          <th>Description</th>
                          <th className="text-center">Statut</th>
                          <th className="text-center">TVA Déductible</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(categorie => (
                          <tr key={categorie.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className={`avtar avtar-xs ${categorie.actif ? 'bg-success' : 'bg-secondary'}`}>
                                  <i className="fas fa-folder"></i>
                                </div>
                                <div className="ms-2">
                                  <h6 className="mb-0">{categorie.nom}</h6>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">{categorie.code}</span>
                            </td>
                            <td>
                              <span className="text-muted">
                                {categorie.description || 'Aucune description'}
                              </span>
                            </td>
                            <td className="text-center">
                              {categorie.actif ? (
                                <span className="badge bg-success">Actif</span>
                              ) : (
                                <span className="badge bg-secondary">Inactif</span>
                              )}
                            </td>
                            <td className="text-center">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={Boolean(categorie.tva_deductible)}
                                  onChange={() => handleTVAToggle(categorie.id, Boolean(categorie.tva_deductible))}
                                  disabled={saving || !categorie.actif}
                                  id={`tva-switch-${categorie.id}`}
                                />
                                <label 
                                  className="form-check-label" 
                                  htmlFor={`tva-switch-${categorie.id}`}
                                >
                                  {Boolean(categorie.tva_deductible) ? (
                                    <span className="text-success">
                                      <FiCheck className="me-1" />
                                      Déductible
                                    </span>
                                  ) : (
                                    <span className="text-danger">
                                      <FiX className="me-1" />
                                      Non déductible
                                    </span>
                                  )}
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card-footer bg-light">
                <div className="row">
                  <div className="col-md-8">
                    <h6 className="mb-2">Impact sur le rapport financier :</h6>
                    <ul className="text-muted mb-0" style={{ fontSize: '13px' }}>
                      <li>Les catégories avec TVA <strong>déductible</strong> réduisent le montant des dépenses dans le calcul du bénéfice</li>
                      <li>Les catégories avec TVA <strong>non déductible</strong> sont comptabilisées intégralement en dépenses</li>
                      <li>Ces paramètres affectent le tableau de bord des dépenses et le rapport financier</li>
                    </ul>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <span className="badge bg-success-subtle text-success">
                        {categories.filter(c => c.tva_deductible).length} déductibles
                      </span>
                      <span className="badge bg-danger-subtle text-danger">
                        {categories.filter(c => !c.tva_deductible).length} non déductibles
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametresTVA;