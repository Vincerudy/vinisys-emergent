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
              <p>Le module RH sera bientôt disponible. </p>
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
                <Link to="/facturation/cahier-recette">Cahier de recette</Link>
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
                <Link to="/depenses/dashboard">Tableau de bord</Link>
              </li>
              <li>
                <Link to="/depenses/liste">Liste des dépenses</Link>
              </li>
              <li>
                <Link to="/depenses/creer">Créer une dépense</Link>
              </li>
              <li>
                <Link to="/depenses/validation">Dépenses à Valider</Link>
              </li>
              <li>
                <Link to="/depenses/parametrage">Paramétrage</Link>
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
                <Link to="/notes/dashboard">Tableau de bord</Link>
              </li>
              <li>
                <Link to="/notes/liste">Liste des notes</Link>
              </li>
              <li>
                <Link to="/notes/creer">Créer une note</Link>
              </li>
              <li>
                <Link to="/notes/parametrage">Paramétrage</Link>
              </li>
              <li>
                <Link to="/notes/validation">Validation notes</Link>
              </li>
            </ul>
            <div className="illustration">
              <img src={note} alt="Selfservice" />
              <p>Décentraliser les saisies</p>
            </div>
          </div>

          <div className="card talents">
            <h3 className="TitreModule">Gestion de stock</h3>
            <ul className="submenu">
              <li>
                <Link to="/stock/liste">Liste des produits</Link>
              </li>
              <li>
                <Link to="/stock/ajout">Ajout de produit</Link>
              </li>
              <li>
                <Link to="/stock/import">Import de produit</Link>
              </li>
              <li>
                <Link to="/stock/mouvement">Mouvement de stock</Link>
              </li>
              <li>
                <Link to="/stock/inventaire-auto">Inventaire automatisé</Link>
              </li>
              <li>
                <Link to="/stock/inventaire-manuel">Inventaire manuel</Link>
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
            <div className="icons">
              <img src="/icons/import1.svg" alt="import1" />
              <img src="/icons/import2.svg" alt="import2" />
              <img src="/icons/import3.svg" alt="import3" />
              <img src="/icons/import4.svg" alt="import4" />
            </div>
          </div>

          <div className="card params">
            <h3 className="TitreModule titreModuleMarginLeft">Mes paramètres</h3>
            <div className="icons">
              <img src="/icons/param1.svg" alt="param1" />
              <img src="/icons/param2.svg" alt="param2" />
              <img src="/icons/param3.svg" alt="param3" />
              <img src="/icons/param4.svg" alt="param4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccueilPage;
