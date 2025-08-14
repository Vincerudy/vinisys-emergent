import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { publicRoute } from './route/publicRoute';
import 'react-quill/dist/quill.snow.css';
import 'react-circular-progressbar/dist/styles.css';
import "react-perfect-scrollbar/dist/css/styles.css";
import { AuthProvider, useAuth } from './contexte/AuthContext';  
import { SubscriptionProvider } from './contexte/SubscriptionContext';  
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import NavigationProvider from './contentApi/navigationProvider';
import SideBarToggleProvider from './contentApi/sideBarToggleProvider';
import testToken from './contexte/testToken'; 
import ActivityListener from './contexte/ActivityListener';

const AppWithAuth = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      testToken(token, logout);
    }
  }, [logout]);

  return (
    <>
      <ActivityListener /> {/* Écoute des événements utilisateur */}
      <RouterProvider router={publicRoute} />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <SideBarToggleProvider>
          <AppWithAuth /> {/* Utilisation dans un contexte valide */}
        </SideBarToggleProvider>
      </NavigationProvider>
    </AuthProvider>
  );
};

export default App;
