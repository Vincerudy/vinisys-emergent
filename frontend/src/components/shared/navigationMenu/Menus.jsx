import React, { Fragment, useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { menuList } from "@/utils/fackData/menuList";
import getIcon from "@/utils/getIcon";
import { hasPermission } from '../../../contexte/permissions';
import { useSubscription } from '../../../hooks/useSubscription';
import { filterMenuBySubscription } from '../../../utils/subscriptionFilter';

const Menus = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openSubDropdown, setOpenSubDropdown] = useState(null);
    const [activeParent, setActiveParent] = useState("");
    const [activeChild, setActiveChild] = useState("");
    const pathName = useLocation().pathname;
    const { hasFeature, loading } = useSubscription();

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

    // Si les données d'abonnement sont en cours de chargement, afficher le menu de base
    if (loading) {
        return (
            <li>
                <Link to="/" className="nxl-link text-capitalize">
                    <span className="nxl-micon"> {getIcon('feather-cast')} </span>
                    <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
                        Chargement...
                    </span>
                </Link>
            </li>
        );
    }

    // Filtrer le menu selon l'abonnement
    const filteredMenuList = filterMenuBySubscription(menuList, hasFeature);

    return (
        <>   
                <li

                >
                                    <Link to="/" className="nxl-link text-capitalize">
                                        <span className="nxl-micon"> {getIcon('feather-cast')} </span>
                                        <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
                                            Accueil
                                        </span>
                                        <span className="nxl-arrow fs-16">
                                            <FiChevronRight />
                                        </span>
                                    </Link>
                </li>
                <li

>
                    <Link to="/alertes" className="nxl-link text-capitalize">
                        <span className="nxl-micon"> {getIcon('feather-alert-circle')} </span>
                        <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
                            Alertes
                        </span>
                        <span className="nxl-arrow fs-16">
                            <FiChevronRight />
                        </span>
                    </Link>
                </li>
                {menuList.map(({ dropdownMenu, id, name, path, icon }) => {
  // Filtrer dropdownMenu selon permission si elle existe
  const filteredDropdown = Array.isArray(dropdownMenu) ? dropdownMenu.filter(item => {
    if (!item.permission) return true; // pas de permission => afficher
    return hasPermission(item.permission); // sinon filtrer avec la fonction
  }) : [];


  // Si c'est un menu avec des sous-menus mais que tous sont filtrés, ne pas afficher
  // Si c'est un menu direct (dropdownMenu vide initialement), l'afficher
  if (Array.isArray(dropdownMenu) && dropdownMenu.length > 0 && filteredDropdown.length === 0) {
    return null;
  }

  // Menu direct sans sous-menu (dropdownMenu vide)
  if (!dropdownMenu || (Array.isArray(dropdownMenu) && dropdownMenu.length === 0)) {
    return (
      <li key={id} className={`nxl-item ${pathName === path ? "active" : ""}`}>
        <Link to={path} className="nxl-link text-capitalize">
          <span className="nxl-micon"> {getIcon(icon)} </span>
          <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
            {name}
          </span>
        </Link>
      </li>
    );
  }

  return (
    <li
      key={id}
      onClick={(e) => handleMainMenu(e, name)}
      className={`nxl-item nxl-hasmenu ${activeParent === name ? "active nxl-trigger" : ""}`}
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
      <ul
        className={`nxl-submenu ${openDropdown === name ? "nxl-menu-visible" : "nxl-menu-hidden"}`}
      >
        {filteredDropdown.map(({ id, name, path, subdropdownMenu }) => {
          const x = name;

          // Filtrer subdropdownMenu avec même règle permission
          const filteredSubdropdown = Array.isArray(subdropdownMenu)
            ? subdropdownMenu.filter(sub => {
                if (!sub.permission) return true;
                return hasPermission(sub.permission);
              })
            : [];

          return (
            <Fragment key={id}>
              {filteredSubdropdown.length ? (
                <li
                  className={`nxl-item nxl-hasmenu ${activeChild === name ? "active" : ""}`}
                  onClick={(e) => handleDropdownMenu(e, x)}
                >
                  <Link to={path} className={`nxl-link text-capitalize`}>
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
                      className={`nxl-submenu ${openSubDropdown === x ? "nxl-menu-visible" : "nxl-menu-hidden"}`}
                    >
                      <li className={`nxl-item ${pathName === path ? "active" : ""}`}>
                        <Link className="nxl-link text-capitalize" to={path}>
                          {name}
                        </Link>
                      </li>
                    </ul>
                  ))}
                </li>
              ) : (
                <li className={`nxl-item ${pathName === path ? "active" : ""}`}>
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
