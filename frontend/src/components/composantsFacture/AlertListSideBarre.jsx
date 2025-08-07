import React, { useState } from 'react';
import './css/AlertListSideBarre.css';
import AlertList from './AlertList'; // Import de la liste des alertes

const AlertListSideBarre = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Fonction de gestion du clic sur une alerte
  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setIsSidebarOpen(true);  // Ouvre la sidebar
  };

  // Fonction pour fermer la sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="alert-container">
      {/* Passe la fonction de clic au composant AlertList */}
      <AlertList onAlertClick={handleAlertClick} />
      
      {/* Side-barre */}
      {isSidebarOpen && (
        <div className="sidebar">
          <button className="close-btn" onClick={closeSidebar}>X</button>
          <h2>Détail de l'alerte</h2>
          {selectedAlert && (
            <>
              <p><strong>{selectedAlert.message}</strong></p>
              <p>Type d'alerte : {selectedAlert.type}</p>
              <p>Détails supplémentaires sur l'alerte.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertListSideBarre;
