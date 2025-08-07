import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/DashboardLayout.css';
import TopBar from './TopBar'; // Assure-toi d'importer correctement le chemin vers TopBar
import NavBarLeft from './NavBarLeft';
import { useAuth } from '../../contexte/AuthContext';

const DashboardLayout = ({ children }) => {
  const { email, id } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  
console.log('MOUKO MMML ', userData)
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/globalhome?id=${id}`);
        console.log('DATA D ', response.data[0])
        setUserData(response.data[0])
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="ContainerLayout">
      <TopBar companyName={userData.companyName}  nom={userData.firstName} imgPath={userData.path} prenom={userData.lastName}/>
      <div className='subContainerLayout'>
        <div className='containerNavBarLayout'>
          <NavBarLeft/>
        </div>
        <div className="main-content">
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default DashboardLayout;
