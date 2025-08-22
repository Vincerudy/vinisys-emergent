import React, { useContext } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { AppContext } from '../../../contexte/AppContext'
import MenuResponsible from './MenuResponsible'

const NavigationMenu = () => {
    const { navigationOpen } = useContext(AppContext)

    return (
        <nav className={`nxl-navigation ${navigationOpen ? "nxl-navigation-toggle" : ""}`}>
            <MenuResponsible />
        </nav>
    )
}

export default NavigationMenu