import axios from 'axios';

const testToken = async (value, logout) => {
  console.log('VOILA LE TOKEN 1', value);
 
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`, {
      
      headers: {
        'Authorization': `Bearer ${value}` // Envoie le token dans les en-têtes. 
      }
    });
    
    console.log('VOILA LE TOKEN 2', response.status );
    if (response.status === 200) {
      console.log('Token valide');
      console.log('MOI MOUKO 3EM', value);
    }
  } catch (error) {
    console.log('VOILA LE TOKEN 3', error.response?.status || 'Connection failed');
   
    // Seulement déconnecter si c'est un 401/403, pas si c'est une erreur de connexion
    if (error.response?.status === 401 || error.response?.status === 403) {
      logout();
      console.log('Token expiré');
      localStorage.clear();
    } else {
      console.log('Erreur de connexion - pas de déconnexion automatique');
    }
 
  }
};

export default testToken;
