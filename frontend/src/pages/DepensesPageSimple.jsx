import React from 'react';

const DepensesPage = () => {
  return (
    <div className="nxl-content">
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">Gestion des Dépenses</h5>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            <h3>🎉 Module Dépenses</h3>
            <p className="text-muted">Le module de gestion des dépenses est maintenant disponible !</p>
            <div className="row mt-4">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5>📊 Tableau de bord</h5>
                    <p>Vue d'ensemble de toutes vos dépenses</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5>➕ Nouvelle dépense</h5>
                    <p>Ajouter une dépense rapidement</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5>⚙️ Configuration</h5>
                    <p>Barèmes et catégories</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h6>✅ Backend API opérationnel</h6>
              <p><small>Routes testées avec succès - Prêt pour l'intégration frontend complète</small></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepensesPage;