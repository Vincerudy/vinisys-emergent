import React, { Fragment, useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { menuList } from "@/utils/fackData/menuList";
import getIcon from "@/utils/getIcon";
import { hasPermission } from "../../../contexte/permissions";

const Menus = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);
  const [activeParent, setActiveParent] = useState("");
  const [activeChild, setActiveChild] = useState("");
  const pathName = useLocation().pathname;

  const handleMainMenu = (e, name) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
    }
  };

  const handleDropdownMenu = (e, name) => {
    e.stopPropagation();
    if (openSubDropdown === name) {
      setOpenSubDropdown(null);
    } else {
      setOpenSubDropdown(name);
    }
  };

  useEffect(() => {
    if (pathName !== "/") {
      const x = pathName.split("/");
      setActiveParent(x[1]);
      setActiveChild(x[2]);
      setOpenDropdown(x[1]);
      setOpenSubDropdown(x[2]);
    } else {
      setActiveParent("dashboards");
      setOpenDropdown("dashboards");
    }
  }, [pathName]);

  return (
    <>
      {/* Accueil */}
      <li>
        <Link to="/" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-cast")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Accueil
          </span>
 
        </Link>
      </li>

      {/* Alertes */}
      <li>
        <Link to="/alertes" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-alert-circle")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Alertes
          </span>
 
        </Link>
      </li>
      <li>
        <Link to="/facturation/dashboard" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-file-text")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Facturation
          </span>
 
        </Link>
      </li>
      <li>
        <Link to="/achats" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-shopping-cart")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Dépenses
          </span>
 
        </Link>
      </li>
      <li>
        <Link to="/notes-frais" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-briefcase")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Notes de frais
          </span>
 
        </Link>
      </li>
      <li>
        <Link to="/liste-produits" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-archive")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Gestion de stocks
          </span>
 
        </Link>
      </li>
      <li>
        <Link to="/rapport" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-bar-chart-2")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Rapport financier
          </span>
 
        </Link>
      </li>
      <li>
        <Link to="/parametrage" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-settings")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Paramétrage
          </span>
 
        </Link>
      </li>
      <li>
        <Link to="/abonnement/plans" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-tag")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Abonnements
          </span>
 
        </Link>
      </li>
      <li>
        <Link to="/listes/tickets" className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon("feather-help-circle")} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            Assistance
          </span>
 
        </Link>
      </li>

      {/* Menus dynamiques */}
      {menuList.map(({ dropdownMenu, id, name, path, icon }) => {
        // ✅ Sécurisation : si pas de tableau, on met []
        const filteredDropdown = Array.isArray(dropdownMenu)
          ? dropdownMenu.filter((item) => {
              if (!item.permission) return true;
              return hasPermission(item.permission);
            })
          : [];

        if (filteredDropdown.length === 0) return null;

        return (
          <li
            key={id}
            onClick={(e) => handleMainMenu(e, name)}
            className={`nxl-item nxl-hasmenu ${
              activeParent === name ? "active nxl-trigger" : ""
            }`}
          >
            <Link to={path} className="nxl-link text-capitalize">
              <span className="nxl-micon"> {getIcon(icon)} </span>
              <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
                {name}
              </span>
              <span className="nxl-arrow fs-16">
                <FiChevronRight />
              </span>
            </Link>

            {/* Sous-menu */}
            <ul
              className={`nxl-submenu ${
                openDropdown === name ? "nxl-menu-visible" : "nxl-menu-hidden"
              }`}
            >
              {filteredDropdown.map(({ id, name, path, subdropdownMenu }) => {
                const x = name;

                // ✅ Sécurisation des sous-dropdown
                const filteredSubdropdown = Array.isArray(subdropdownMenu)
                  ? subdropdownMenu.filter((sub) => {
                      if (!sub.permission) return true;
                      return hasPermission(sub.permission);
                    })
                  : [];

                return (
                  <Fragment key={id}>
                    {filteredSubdropdown.length ? (
                      <li
                        className={`nxl-item nxl-hasmenu ${
                          activeChild === name ? "active" : ""
                        }`}
                        onClick={(e) => handleDropdownMenu(e, x)}
                      >
                        <Link to={path} className="nxl-link text-capitalize">
                          <span className="nxl-mtext">{name}</span>
                          <span className="nxl-arrow">
                            <i>
                              <FiChevronRight />
                            </i>
                          </span>
                        </Link>

                        {filteredSubdropdown.map(({ id, name, path }) => (
                          <ul
                            key={id}
                            className={`nxl-submenu ${
                              openSubDropdown === x
                                ? "nxl-menu-visible"
                                : "nxl-menu-hidden"
                            }`}
                          >
                            <li
                              className={`nxl-item ${
                                pathName === path ? "active" : ""
                              }`}
                            >
                              <Link
                                className="nxl-link text-capitalize"
                                to={path}
                              >
                                {name}
                              </Link>
                            </li>
                          </ul>
                        ))}
                      </li>
                    ) : (
                      <li
                        className={`nxl-item ${
                          pathName === path ? "active" : ""
                        }`}
                      >
                        <Link className="nxl-link" to={path}>
                          {name}
                        </Link>
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ul>
          </li>
        );
      })}
    </>
  );
};

export default Menus;
