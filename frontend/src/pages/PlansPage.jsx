import React from 'react';
import { Link } from 'react-router-dom';

const PlansPage = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">
              <i className="fas fa-package me-2"></i>
              Plans d'abonnement
            </h5>
            <p className="fs-13 text-muted m-b-0">
              Gérez votre abonnement Vinisys
            </p>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-rocket fa-4x text-primary mb-3"></i>
                  <h4>Mise à niveau disponible</h4>
                  <p className="text-muted">
                    Découvrez nos plans d'abonnement pour accéder à plus de fonctionnalités
                  </p>
                </div>
                
                <Link 
                  to="/abonnement/plans" 
                  className="btn btn-primary btn-lg me-3"
                >
                  <i className="fas fa-arrow-up me-2"></i>
                  Voir les plans
                </Link>
                
                <Link 
                  to="/" 
                  className="btn btn-outline-secondary btn-lg"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;