import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import './css/AccueilPage.css';

const AccueilPage = () => {
  const { firstName, lastName, societe_nom } = useAuth();

  return (
    <div className="accueil-page">
      <div className="page-wrapper">
        {/* Header avec titre */}
        <div className="page-header">
          <div className="page-header-left d-flex align-items-center">
            <div className="page-header-title">
              <h5 className="page-title">
                Tableau de bord - Accueil
              </h5>
              <p className="page-subtitle">
                Bienvenue {firstName} {lastName}
              </p>
            </div>
          </div>
        </div>

        {/* Grille principale comme dans l'image */}
        <div className="main-dashboard-grid">
          
          {/* Section Communications - Gauche */}
          <div className="communications-section">
            <h3 className="section-title">Communications</h3>
            
            {/* Alertes de maintenance */}
            <div className="alert-item maintenance">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>Opération de Maintenance</h4>
                <p>le 20 août 2025 de 20h30...</p>
              </div>
            </div>

            <div className="alert-item new-feature">
              <div className="alert-icon">🔵</div>
              <div className="alert-content">
                <h4>Désactivation nouvelle</h4>
                <p>ergonomie module...</p>
              </div>
            </div>

            <div className="alert-item security">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>RGPD - Sécurisation des</h4>
                <p>données par mail</p>
              </div>
            </div>

            <div className="voir-plus">
              <Link to="/communications">→ Voir plus</Link>
            </div>
          </div>

          {/* Section Core RH - Centre haut */}
          <div className="core-rh-section">
            <h2 className="module-title">Core RH</h2>
            <div className="module-illustration">
              <img src="https://images.unsplash.com/photo-1755541516453-201559bec161?w=400&h=200&fit=crop" alt="Core RH" />
            </div>
          </div>

          {/* Section GTA - Droite haut */}
          <div className="gta-section">
            <h2 className="module-title">GTA</h2>
            <div className="module-illustration">
              <img src="https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=400&h=200&fit=crop" alt="GTA" />
            </div>
            <p className="module-subtitle">Piloter les absences, présence et activités</p>
          </div>

          {/* Section Pilotage - Extrême droite */}
          <div className="pilotage-section">
            <h2 className="module-title">Pilotage</h2>
            <div className="module-illustration">
              <img src="https://images.unsplash.com/photo-1462556791646-c201b8241a94?w=400&h=200&fit=crop" alt="Pilotage" />
            </div>
            <p className="module-subtitle">Générer vos tableaux de bord</p>
          </div>

          {/* Section centrale - Retrouvez l'ensemble */}
          <div className="central-message">
            <h3>Retrouvez l'ensemble de votre gestion administrative</h3>
          </div>

          {/* Section Alertes - Bas gauche */}
          <div className="alertes-section">
            <h3 className="section-title">Alertes</h3>
            
            <div className="alert-medical">
              <h4>Visite médicale</h4>
              <p>AUBERTIN Christopher</p>
            </div>

            <div className="alert-medical">
              <h4>Fin de contrat</h4>
              <p>Valois Julie</p>
            </div>

            <div className="alert-medical">
              <h4>Visite médicale</h4>
              <p>ARNAULT Shaheen</p>
            </div>

            <div className="alert-medical">
              <h4>Visite médicale</h4>
              <p>ARNAULT Shaheen</p>
            </div>

            <div className="alert-medical">
              <h4>Visite médicale</h4>
              <p>ARNAULT T2 Shaheen</p>
            </div>

            <div className="voir-plus">
              <Link to="/alertes">→ Voir plus</Link>
            </div>
          </div>

          {/* Section Talents - Centre bas */}
          <div className="talents-section">
            <h2 className="module-title">Talents</h2>
            <div className="module-illustration">
              <img src="https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg?w=400&h=200&fit=crop" alt="Talents" />
            </div>
            <p className="module-subtitle">Attirer, fidéliser et développer</p>
          </div>

          {/* Section Self-service - Droite bas */}
          <div className="self-service-section">
            <h2 className="module-title">Self-service RH & Démat'</h2>
            <div className="module-illustration">
              <img src="https://images.unsplash.com/photo-1469002372271-3406b43e1f27?w=400&h=200&fit=crop" alt="Self-service" />
            </div>
            <p className="module-subtitle">Décentraliser les saisies</p>
          </div>

          {/* Section Mes imports - Bas gauche */}
          <div className="imports-section">
            <h3 className="section-title">Mes imports</h3>
            <div className="imports-icons">
              <div className="import-icon">📊</div>
              <div className="import-icon">👥</div>
              <div className="import-icon">📋</div>
              <div className="import-icon">🔒</div>
              <div className="import-icon">🏢</div>
              <div className="import-icon">⭐</div>
              <div className="import-icon">🏢</div>
            </div>
          </div>

          {/* Section Mes paramètres - Bas droite */}
          <div className="parametres-section">
            <h3 className="section-title">Mes paramètres</h3>
            <div className="parametres-icons">
              <div className="param-icon">🏢</div>
              <div className="param-icon">🏢</div>
              <div className="param-icon">📊</div>
              <div className="param-icon">⚙️</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccueilPage;