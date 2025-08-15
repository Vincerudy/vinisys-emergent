import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Composant fournisseur de contexte
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [id, setId] = useState(localStorage.getItem('id') || '');  // Changer userId en id
  const [email, setEmail] = useState(localStorage.getItem('email') || '');   
  const [societe_id, setSociete_id] = useState(localStorage.getItem('societe_id') || ''); 
  const [permissions, setPermissions] = useState(localStorage.getItem('permissions') || ''); 
  const [urlPhoto, setUrlPhoto] = useState(localStorage.getItem('urlPhoto') || '');     

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('id', id);  // Stocker id
      localStorage.setItem('email', email);  
      localStorage.setItem('societe_id', societe_id);
      localStorage.setItem('permissions', permissions);
      localStorage.setItem('urlPhoto', urlPhoto);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('id');  // Supprimer id
      localStorage.removeItem('email');  // 
      localStorage.removeItem('societe_id');
      localStorage.removeItem('permissions'); 
      localStorage.removeItem('urlPhoto'); 
    }
  }, [token, id, email, permissions, urlPhoto, societe_id]);  

  const login = (data) => {
    setToken(data.token);
    setId(data.id);  // Mettre à jour id
    setEmail(data.email);  // 
    setPermissions(data.permissions); 
    setUrlPhoto(data.urlPhoto); 
    setSociete_id(data.societe_id)
  };

  const logout = () => {
    setToken('');
    setId('');  // Réinitialiser id
    setEmail('');  
    setSociete_id('');
    setPermissions('');
    setUrlPhoto('');
  };

  const isAuthenticated = !!token; // Dérivé du token

  return (
    <AuthContext.Provider value={{ token, id, email, permissions, urlPhoto, societe_id, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  return useContext(AuthContext);
};
