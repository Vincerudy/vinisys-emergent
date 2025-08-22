import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import './css/AccueilPage.css';

const AccueilPage = () => {
  const { firstName, lastName, societe_nom } = useAuth();

  return (
    <div className="accueil-page">
      <div className="page-wrapper">
        <div className="page-header">
          <div className="page-header-left d-flex align-items-center">
            <div className="page-header-title">
              <h5 className="page-title">
                Tableau de bord
              </h5>
              <p className="page-subtitle">
                Bienvenue {firstName} {lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="modules-container">
            {/* Module RH - Grand module à gauche */}
            <div className="module-card module-rh" title="Bientôt disponible">
              <div className="module-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="module-title">Module RH</div>
              <div className="coming-soon-overlay">
                <span>Bientôt disponible</span>
              </div>
            </div>

            {/* Modules principaux - 4 modules à droite */}
            <div className="modules-grid">
              <Link to="/facturation/dashboard" className="module-card module-facturation">
                <div className="module-icon">
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div className="module-title">Facturation</div>
              </Link>

              <Link to="/achats" className="module-card module-depenses">
                <div className="module-icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="module-title">Dépenses</div>
              </Link>

              <Link to="/notes-frais" className="module-card module-notes-frais">
                <div className="module-icon">
                  <i className="fas fa-credit-card"></i>
                </div>
                <div className="module-title">Notes de frais</div>
              </Link>

              <Link to="/rapport" className="module-card module-rapport">
                <div className="module-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <div className="module-title">Rapport</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccueilPage;