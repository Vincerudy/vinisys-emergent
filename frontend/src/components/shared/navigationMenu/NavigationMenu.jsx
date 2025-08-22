import React, { useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiSunrise } from "react-icons/fi";
import PerfectScrollbar from "react-perfect-scrollbar";
import logo from '../../../assets/Logos.png'
import LogoIcone from '../../../assets/LogoIcone.png'
import Menus from './Menus';
import { NavigationContext } from '../../../contentApi/navigationProvider';

const NavigationManu = () => {
    const { navigationOpen, setNavigationOpen } = useContext(NavigationContext)
    const pathName = useLocation().pathname
    useEffect(() => {
        setNavigationOpen(false)
    }, [pathName])
    return (
        <nav className={`nxl-navigation ${navigationOpen ? "mob-navigation-active" : ""}`}>
            <div className="navbar-wrapper">
                <div className="m-header">
                    <Link to="/" className="b-brand">
                        {/* <!-- ========   change your logo hear   ============ --> */}
                        <img src={logo} alt="logo" className="logo logo-lg" />
                        <img src={LogoIcone} alt="logo" className="logo logo-sm" />
                    </Link>
                </div>

                <div className={`navbar-content`}>
                    <PerfectScrollbar>
                        <ul className="nxl-navbar">
                     
                            <Menus />
                        </ul>



                                <h6 className="mt-4 text-dark fw-bolder">Assistance</h6>
                                <Link to="/listes/tickets" className="btn btn-primary text-dark w-100">Centre d'Assistance</Link>
                            </div>
                        </div>
                        <div style={{ height: "18px" }}></div>
                    </PerfectScrollbar>
                </div>
            </div>
            <div onClick={() => setNavigationOpen(false)} className={`${navigationOpen ? "nxl-menu-overlay" : ""}`}></div>
        </nav>
    )
}

export default NavigationManu