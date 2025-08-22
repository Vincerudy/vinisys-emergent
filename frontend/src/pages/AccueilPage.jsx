import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import '../components/css/QuickLinks.css';

const AccueilPage = () => {
  const { firstName, lastName, societe_nom } = useAuth();

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">
              <i className="fas fa-home me-2"></i>
              Bienvenue sur Vinisys
            </h5>
            <p className="fs-13 text-muted m-b-0">
              Votre plateforme de gestion financière et administrative
            </p>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Section de bienvenue */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-gradient-primary text-white">
              <div className="card-body py-5">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <h2 className="text-white mb-3">
                      Bonjour {firstName} {lastName} ! 👋
                    </h2>
                    <p className="text-white-50 mb-4 fs-5">
                      Bienvenue dans votre espace de gestion {societe_nom}. 
                      Accédez rapidement à tous vos outils de gestion financière.
                    </p>
                    <div className="d-flex gap-3">
                      <Link to="/facturation/dashboard" className="btn btn-light btn-lg">
                        <i className="fas fa-chart-line me-2"></i>
                        Voir le tableau de bord
                      </Link>
                      <Link to="/notes-frais/note" className="btn btn-outline-light btn-lg">
                        <i className="fas fa-plus me-2"></i>
                        Nouvelle note de frais
                      </Link>
                    </div>
                  </div>
                  <div className="col-lg-4 text-center">
                    <div className="welcome-illustration">
                      <i className="fas fa-chart-pie fa-8x text-white-25"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accès rapide aux modules */}
        <div className="quick-links-section">
          <h6 className="mb-4">
            <i className="fas fa-rocket me-2"></i>
            Accès rapide aux modules
          </h6>
          <div className="row">
            <div className="col-lg-3 col-md-6 col-12 mb-4">
              <Link to="/facturation/dashboard" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-primary">
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Facturation</strong>
                  <small className="d-block text-muted">Devis, factures, clients</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-3 col-md-6 col-12 mb-4">
              <Link to="/achats" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-success">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Dépenses</strong>
                  <small className="d-block text-muted">Achats et fournisseurs</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-3 col-md-6 col-12 mb-4">
              <Link to="/notes-frais" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-warning">
                  <i className="fas fa-credit-card"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Notes de frais</strong>
                  <small className="d-block text-muted">Frais professionnels</small>
                </div>
              </Link>
            </div>
            
            <div className="col-lg-3 col-md-6 col-12 mb-4">
              <Link to="/rapport" className="quick-link-card text-decoration-none">
                <div className="quick-link-icon bg-info">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <div className="quick-link-text">
                  <strong>Rapports</strong>
                  <small className="d-block text-muted">Analyses financières</small>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Actions recommandées
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="flex-shrink-0">
                        <i className="fas fa-plus-circle fa-2x text-primary"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1">Créer une facture</h6>
                        <p className="text-muted mb-0 fs-sm">Nouveau document de facturation</p>
                      </div>
                      <Link to="/facturation/factures/nouveau" className="btn btn-sm btn-primary">
                        Créer
                      </Link>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="flex-shrink-0">
                        <i className="fas fa-receipt fa-2x text-success"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1">Ajouter une dépense</h6>
                        <p className="text-muted mb-0 fs-sm">Enregistrer un achat</p>
                      </div>
                      <Link to="/achats/nouveau" className="btn btn-sm btn-success">
                        Ajouter
                      </Link>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="flex-shrink-0">
                        <i className="fas fa-file-alt fa-2x text-warning"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1">Note de frais</h6>
                        <p className="text-muted mb-0 fs-sm">Déclarer vos frais</p>
                      </div>
                      <Link to="/notes-frais/note" className="btn btn-sm btn-warning">
                        Créer
                      </Link>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="flex-shrink-0">
                        <i className="fas fa-cog fa-2x text-secondary"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1">Configuration</h6>
                        <p className="text-muted mb-0 fs-sm">Paramètres système</p>
                      </div>
                      <Link to="/parametrage" className="btn btn-sm btn-secondary">
                        Accéder
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">
                  <i className="fas fa-lightbulb me-2"></i>
                  Aide rapide
                </h6>
              </div>
              <div className="card-body">
                <div className="help-item mb-3">
                  <h6 className="text-primary">🎯 Premiers pas</h6>
                  <p className="text-muted fs-sm mb-2">
                    Configurez votre société et commencez à facturer.
                  </p>
                  <Link to="/parametrage" className="text-primary fs-sm">
                    Configurer →
                  </Link>
                </div>
                
                <hr />
                
                <div className="help-item mb-3">
                  <h6 className="text-success">📊 Suivi financier</h6>
                  <p className="text-muted fs-sm mb-2">
                    Consultez vos rapports et analyses.
                  </p>
                  <Link to="/rapport" className="text-success fs-sm">
                    Voir les rapports →
                  </Link>
                </div>
                
                <hr />
                
                <div className="help-item">
                  <h6 className="text-info">🎫 Support</h6>
                  <p className="text-muted fs-sm mb-2">
                    Besoin d'aide ? Contactez notre support.
                  </p>
                  <Link to="/listes/tickets" className="text-info fs-sm">
                    Créer un ticket →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccueilPage;