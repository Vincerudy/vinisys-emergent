import React, {useState} from 'react';
import './css/AlertList.css';  // Importation du fichier CSS

const AlertList = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setSelectedItem(null);
  };
  const alerts = [
    { id: 1,  titre: "Serveur en maintenance",  message: "Serveur en maintenance, il est possible que les service soient coupé demain entre 8h et 18h, veuillez sauvegarder vos tache en cours avant de quitter votre poste. Nous sommes désolé du désagrément.",                   type: "urgent"    },
    { id: 2,  titre: "Mise à jour disponible",  message: "Mise à jour disponible",                   type: "important" },
    { id: 3,  titre: "Nouvelle fonctionnalité ajoutée",  message: "Nouvelle fonctionnalité ajoutée",          type: "info"      },
    { id: 4,  titre: "Sécurité renforcée",  message: "Sécurité renforcée",                       type: "important" },
    { id: 5,  titre: "Incident réseau détecté",  message: "Incident réseau détecté",                  type: "urgent"    },
    { id: 6,  titre: "Amélioration des performances",  message: "Amélioration des performances",            type: "info"      },
    { id: 7,  titre: "Dépassement de la limite d'utilisation",  message: "Dépassement de la limite d'utilisation",   type: "urgent"    },
    { id: 8,  titre: "Nouveau guide utilisateur",  message: "Nouveau guide utilisateur",                type: "info"      },
    { id: 9,  titre: "Mise à jour de la politique de sécurité",  message: "Mise à jour de la politique de sécurité",  type: "important" },
    { id: 10, titre: "Problème de connexion résolu", message: "Problème de connexion résolu",             type: "info"      },
    { id: 9,  titre: "Mise à jour de la politique de sécurité",  message: "Mise à jour de la politique de sécurité",  type: "important" },
    { id: 10, titre: "Problème de connexion résolu", message: "Problème de connexion résolu",             type: "info"      },
    { id: 5,  titre: "Incident réseau détecté",  message: "Incident réseau détecté",                  type: "urgent"    },
    
  ];

  const getClassByType = (type) => {
    switch (type) {
      case 'urgent':
        return 'alert urgent';
      case 'important':
        return 'alert important';
      case 'info':
        return 'alert info';
      default:
        return 'alert';
    }
  };

  return (
    <div className="alert-list">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={getClassByType(alert.type)}
           // Applique la fonction de clic ici
           onClick={() => handleItemClick(alert)}
        >
          <span className={`badge ${alert.type}`}>{alert.type.toUpperCase()}</span>
          <p>{alert.titre}</p>
        </div>
      ))}
      {isOpen && (
        <div className="sidebar">
          <button className={`close-btn ${selectedItem.type}`} onClick={closeSidebar}>Fermer</button>
          <div  className={getClassByType(selectedItem.type)}>
            <h2>{selectedItem.titre} </h2>
            <span className={`badge ${selectedItem.type}`}>{selectedItem.type.toUpperCase()}</span>
          </div>
          <div className='BlocMessageInformation'>
             <p>{selectedItem.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertList;
