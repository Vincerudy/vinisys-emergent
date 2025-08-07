import React, { createContext, useState, useEffect } from 'react';
 
import { useAuth } from '../contexte/AuthContext';

export const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
    const { token, logout  } = useAuth();
 

 
    const [navigationOpen, setNavigationOpen] = useState(false)
    const [navigationExpend, setNavigationExpend] = useState(false)

    const obj = {
        navigationOpen,
        setNavigationOpen,
        navigationExpend,
        setNavigationExpend
    }

    return (
        <NavigationContext.Provider value={obj}>
            {children}
        </NavigationContext.Provider>
    );
};

export default NavigationProvider