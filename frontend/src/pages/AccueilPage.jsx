import React from "react";
import { Link } from "react-router-dom"; // ✅ Import pour les redirections internes
import "./css/AccueilPage.css";
import facturation from "../assets/facturation.png";
import depense from "../assets/depense.png";
import note from "../assets/note.png";
import stock from "../assets/stock.png";
import hr from "../assets/hr.png";

const AccueilPage = () => {
  return (
    <div className="dashboard">
      {/* Colonne gauche */}
      <div className="sidebar">
        <div className="card communications">
          <h3 className="TitreModule titreModuleMarginLeft">Communications</h3>
          <ul className="ulCommeAlerte">
            <li>
              <span className="icon orange">⚠️</span> Opération de Maintenance
              le 20 août 2025 de 20h30 …
            </li>
            <li>
              <span className="icon blue">ℹ️</span> Désactivation nouvelle
              ergonomie : module…
            </li>
            <li>
              <span className="icon orange">⚠️</span> RGPD - Sécurisation des
              données par mail
            </li>
          </ul>
          <a href="/" titreModuleMarginLeft>Voir plus</a>
        </div>

        <div className="card alerts">
          <h3 className="TitreModule titreModuleMarginLeft">Alertes</h3>
          <ul className="ulCommeAlerte">
            <li>
              <strong>Visite médicale</strong>
              <br />
              AUBERTIN Christopher
            </li>
            <li>
              <strong>Fin de contrat</strong>
              <br />
              Valois Julie
            </li>
            <li>
              <strong>Visite médicale</strong>
              <br />
              ARNAULT Shaheen
            </li>
            <li>
              <strong>Visite médicale</strong>
              <br />
              ARNAULT Shaheen
            </li>
            <li>
              <strong>Visite médicale</strong>
              <br />
              ARNAULT V2 Shaheen
            </li>
          </ul>
          <a href="/" titreModuleMarginLeft>Voir plus</a>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="main">
        <div className="top-grid">
          <div className="card core-rh">
            <h3 className="TitreModule">RH</h3>
            <ul className="submenu">
              <h3>Le module RH sera bientôt disponible. </h3>
            </ul>
            <div className="illustration">
              <img className="imgRh" src={hr} alt="Core RH" />
              <p>Retrouvez l'ensemble de votre gestion administrative</p>
            </div>
          </div>

          <div className="card gta">
            <h3 className="TitreModule">Facturation</h3>
            <ul className="submenu">
              <li>
                <Link to="/facturation/factures">Gestion des factures</Link>
              </li>
              <li>
                <Link to="/facturation/devis">Gestion des devis</Link>
              </li>
              <li>
                <Link to="/facturation/clients">Gestion des clients</Link>
              </li>
              <li>
                <Link to="/facturation/recette">Cahier de recette</Link>
              </li>
              <li>
                <Link to="/facturation/parametrage">
                  Paramétrage facturation
                </Link>
              </li>
            </ul>
            <div className="illustration">
              <img src={facturation} alt="Facturation" />
              <p>Gérez vos devis et factures</p>
            </div>
          </div>

          <div className="card pilotage">
            <h3 className="TitreModule">Dépenses</h3>
            <ul className="submenu">
              <li>
                <Link to="/achats">Tableau de bord</Link>
              </li>
              <li>
                <Link to="/achats/liste">Liste des dépenses</Link>
              </li>

              <li>
                <Link to="/achats/validation">Dépenses à Valider</Link>
              </li>
              <li>
                <Link to="/achats/fournisseurs">Liste des fournisseurs</Link>
              </li>
              <li>
                <Link to="/achats/parametrage">Paramétrage</Link>
              </li>
            </ul>
            <div className="illustration">
              <img src={depense} alt="Dépense" />
              <p>Enrégistrez et catégorisez vos dépenses facilement</p>
            </div>
          </div>

          <div className="card selfservice">
            <h3 className="TitreModule">Note de frais</h3>
            <ul className="submenu">
              <li>
                <Link to="/notes-frais">Tableau de bord</Link>
              </li>
              <li>
                <Link to="/notes-frais/liste">Liste des notes</Link>
              </li>
              <li>
                <Link to="/notes-frais/note">Créer une note</Link>
              </li>
              <li>
                <Link to="/notes-frais/validation">Validation notes</Link>
              </li>
              <li>
                <Link to="/depenses/parametres">Paramétrage</Link>
              </li>
            </ul>
            <div className="illustration">
              <img src={note} alt="Selfservice" />
              <p>Gérez et contrôlez vos notes de frais</p>
            </div>
          </div>

          <div className="card talents">
            <h3 className="TitreModule">Gestion de stock</h3>
            <ul className="submenu">
              <li>
                <Link to="/liste-produits">Liste des produits</Link>
              </li>
              <li>
                <Link to="/produit">Ajout de produit</Link>
              </li>
              <li>
                <Link to="/import-produit">Import de produit</Link>
              </li>
              <li>
                <Link to="/mouvements">Mouvement de stock</Link>
              </li>
              <li>
                <Link to="/Inventaire-auto">Inventaire automatisé</Link>
              </li>
              <li>
                <Link to="/inventaire-manuel">Inventaire manuel</Link>
              </li>
            </ul>
            <div className="illustration">
              <img src={stock} alt="Gestion de stock" />
              <p>Suivez votre stock en temps réel</p>
            </div>
          </div>
        </div>

        <div className="bottom-grid">
        <div className="card imports">
      <h3 className="TitreModule titreModuleMarginLeft">Mes imports</h3>
      <div className="icons" style={{ display: "flex", gap: "30px", justifyContent: "space-around" }}>
        
        {/* Bloc 1 - Gestion de stock */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" stroke="#18538e" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 9.5L12 4l9 5.5v9L12 22l-9-5.5v-9z"/>
            <path d="M12 22V12"/>
          </svg>
          <span style={{color: "#18538e", fontWeight: "bold"}}>Clients</span>
        </div>
      
        {/* Bloc 2 - Gestion de fichiers */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" stroke="#18538e" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 2h7l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
            <path d="M13 2v6h6"/>
          </svg>
          <span style={{color: "#18538e", fontWeight: "bold"}}>Produits</span>
        </div>
      
        {/* Bloc 3 - Gestion du personnel */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" stroke="#18538e" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="9" cy="7" r="4"/>
            <path d="M2 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2"/>
            <circle cx="17" cy="7" r="3"/>
            <path d="M17 14a4 4 0 0 1 4 4v3"/>
          </svg>
          <span style={{color: "#18538e", fontWeight: "bold"}}>Fichiers</span>
        </div>
 
      
      </div>
    </div>


          <div className="card params">
            <h3 className="TitreModule titreModuleMarginLeft">Mes paramètres</h3>
            <div className="icons" style={{ display: "flex", gap: "30px", justifyContent: "space-around" }}>
  
              {/* Paramétrage général */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" stroke="#18538e" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09c.7 0 1.31-.39 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.46.46 1.12.61 1.82.33h.09c.7 0 1.31-.39 1.51-1V2a2 2 0 1 1 4 0v.09c0 .7.39 1.31 1 1.51.7.28 1.36.13 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .7.39 1.31 1 1.51h.09a2 2 0 1 1 0 4h-.09c-.7 0-1.31.39-1.51 1z"/>
                </svg>
                <span style={{color: "#18538e", fontWeight: "bold"}}>Général</span>
              </div>
              
              {/* Paramétrage des notes de frais */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" stroke="#18538e" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 2h6l2 4h4v16H3V6h4l2-4z"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
                <span style={{color: "#18538e", fontWeight: "bold"}}>Notes de frais</span>
              </div>
              
              {/* Paramétrage de facturation */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" stroke="#18538e" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2h7l5 5v15H6z"/>
                  <path d="M13 2v6h6"/>
                  <path d="M9 13h6M9 17h4"/>
                </svg>
                <span style={{color: "#18538e", fontWeight: "bold"}}>Facturation</span>
              </div>
              
              {/* Paramétrage des dépenses */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" stroke="#18538e" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                  <path d="M16 12h.01M2 10h20"/>
                </svg>
                <span style={{color: "#18538e", fontWeight: "bold"}}>Dépenses</span>
              </div>
              
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccueilPage;
