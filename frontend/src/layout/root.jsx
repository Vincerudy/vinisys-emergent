import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavigationManu from '../components/shared/navigationMenu/NavigationMenu'
import Header from '../components/shared/header/Header'
import useBootstrapUtils from '@/hooks/useBootstrapUtils'
import SupportDetails from '@/components/supportDetails'
import { useAuth } from '../contexte/AuthContext';

const RootLayout = () => {
    const { id, societe_id, token, logout  } = useAuth();
    const pathName = useLocation().pathname
    useBootstrapUtils(pathName)

    return (
        <>
            {token ? 
            <div>
                <Header />
                <NavigationManu />
                <main className="nxl-container">
                    <div className="nxl-content">
                        <Outlet />
                    </div>
                </main>
                <SupportDetails />
            </div>
            : 
               <Outlet />
            }
 
        </>
    )
}

export default RootLayout