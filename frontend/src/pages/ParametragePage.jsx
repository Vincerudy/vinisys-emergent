import React from 'react';
import { Link } from 'react-router-dom';
import '../components/css/QuickLinks.css';

const ParametragePage = () => {
  return (
    <div className="page-wrapper">
 

      <div className="main-content">
        {/* Liens rapides paramétrage */}
        <div className="quick-links-section">
            <h5 className="m-b-10" style={{fontSize: 25, color: '#144675'}}>
              <i className="fas fa-cog me-2"></i>
              Paramétrages société
            </h5>
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
                  <strong>Facturation</strong>
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
                  <strong>Dépenses</strong>
                  <small className="d-block text-muted">Configuration des dépenses</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-4 col-md-6 col-12 mb-4">
              <Link to="/depenses/parametres" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-danger">
                  <i className="fas fa-credit-card"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Note de frais</strong>
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