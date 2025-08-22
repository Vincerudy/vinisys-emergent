import React from "react";
import { Link, useLocation } from "react-router-dom";
import getIcon from "@/utils/getIcon";
import './MenuResponsible.css';

const MenuResponsible = () => {
  const pathName = useLocation().pathname;

  const menuItems = [
    {
      id: 1,
      name: "Compétences et Évaluation",
      path: "/competences",
      icon: "feather-star"
    },
    {
      id: 2,
      name: "Menu de frais",
      path: "/notes-frais",
      icon: "feather-credit-card"
    },
    {
      id: 3,
      name: "Note de frais",
      path: "/nouvelle-note-frais",
      icon: "feather-file-text"
    },
    {
      id: 4,
      name: "Paramètre CSE",
      path: "/parametrage",
      icon: "feather-settings"
    },
    {
      id: 5,
      name: "Simulation Budgétaire",
      path: "/simulation-budget",
      icon: "feather-trending-up"
    },
    {
      id: 6,
      name: "Import/Export",
      path: "/import-export",
      icon: "feather-upload"
    },
    {
      id: 7,
      name: "Lecture",
      path: "/lecture",
      icon: "feather-book-open"
    }
  ];

  return (
    <>
      {/* Menu Desktop - Sidebar */}
      <div className="menu-responsible-desktop">
        <div className="menu-container">
          <div className="menu-header">
            <h3 className="menu-title">Modules</h3>
          </div>
          <div className="menu-items">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`menu-item ${pathName === item.path ? 'active' : ''}`}
              >
                <div className="menu-item-icon">
                  {getIcon(item.icon)}
                </div>
                <div className="menu-item-content">
                  <span className="menu-item-text">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Mobile - Bottom Tab */}
      <div className="menu-responsible-mobile">
        <div className="bottom-tab-container">
          {menuItems.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`bottom-tab-item ${pathName === item.path ? 'active' : ''}`}
            >
              <div className="bottom-tab-icon">
                {getIcon(item.icon)}
              </div>
              <span className="bottom-tab-text">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default MenuResponsible;