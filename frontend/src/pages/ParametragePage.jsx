import React from 'react';
import { Link } from 'react-router-dom';
import '../components/css/QuickLinks.css';

const ParametragePage = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">
              <i className="fas fa-cog me-2"></i>
              Paramétrage
            </h5>
            <p className="fs-13 text-muted m-b-0">
              Configuration générale de l'application
            </p>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Liens rapides paramétrage */}
        <div className="quick-links-section">
          <h6 className="mb-4">
            <i className="fas fa-tools me-2"></i>
            Configuration système
          </h6>
          <div className="row">
            <div className="col-lg-4 col-md-6 col-12 mb-4">
              <Link to="/societe/configuration" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-primary">
                  <i className="fas fa-building"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Configuration générale</strong>
                  <small className="d-block text-muted">Informations société</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-4 col-md-6 col-12 mb-4">
              <Link to="/societe/serveur-mail" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-info">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Paramètres email</strong>
                  <small className="d-block text-muted">Configuration SMTP</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-4 col-md-6 col-12 mb-4">
              <Link to="/societe/roles" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-success">
                  <i className="fas fa-users"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Utilisateurs & rôles</strong>
                  <small className="d-block text-muted">Gestion des accès</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-4 col-md-6 col-12 mb-4">
              <Link to="/facturation/parametrage" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-warning">
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Paramètres facturation</strong>
                  <small className="d-block text-muted">Configuration factures</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-4 col-md-6 col-12 mb-4">
              <Link to="/achats/parametrage" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-secondary">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Catégories d'achats</strong>
                  <small className="d-block text-muted">Configuration dépenses</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-4 col-md-6 col-12 mb-4">
              <Link to="/notes-frais/parametrage" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-danger">
                  <i className="fas fa-credit-card"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Types de frais</strong>
                  <small className="d-block text-muted">Configuration notes de frais</small>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametragePage;