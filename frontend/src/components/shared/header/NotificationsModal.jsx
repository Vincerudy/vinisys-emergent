import React, {useEffect, useState} from 'react'
import { FiBell, FiCheck, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexte/AuthContext';
import axios from 'axios';

const fetchAlerts = async (vale, vale2) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/alertesprogrammee/${vale}/${vale2}`);
  
      console.log('Réponse reçue :', response.data);
  
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data
          .filter(alert => alert.date_alerte) // Filtrer les alertes sans date
          .sort((a, b) => new Date(a.date_alerte) - new Date(b.date_alerte)); // Trier du plus ancien au plus récent
      } else {
        console.warn("Les données reçues ne sont pas valides :", response.data);
        return [];
      }
    } catch (error) {
 
      return [];
    }
  };

 
const NotificationsModal = () => {
    const [alertes, setAlertes] = useState([]);
    
    const { id, societe_id  } = useAuth();

    const recuperationAlerte = async () => {
        const alert = await fetchAlerts(id, societe_id)
        setAlertes(alert)

        console.log('Mes alertes',alertes);
    }

    useEffect(() => {
        // Appel de la fonction fetchDataFactures définie en dehors du composant
        recuperationAlerte()
      
      }, []);
    return (
        <div className="dropdown nxl-h-item">
            <div className="nxl-head-link me-3" data-bs-toggle="dropdown" role="button" data-bs-auto-close="outside">
                <FiBell size={20} />
                {alertes.length > 0     ?  <span style={{height: 20, width: 20, display: 'flex', alignItems:'center', justifyContent:'center', color: 'white', fontWeight: 'bold', fontSize:12}} className="bg-danger nxl-h-badge">{alertes.length}</span> : ""}
 
            </div>
            <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-notifications-menu">
                <div className="d-flex justify-content-between align-items-center notifications-head">
                    <h6 className="fw-bold text-dark mb-0">Notifications</h6>
                    <Link to="#" className="fs-11 text-success text-end ms-auto" data-bs-toggle="tooltip" >
                        <FiCheck size={16} />
                   
                    </Link>
                </div>
                {
                    alertes.map(({ id,   titre }) => <Card key={id}   titleFirst={titre}  />)
                }

                <div className="text-center notifications-footer">
                    {/**
                     <Link to="#" className="fs-13 fw-semibold text-dark">V</Link>
                     */}
                </div>
            </div>
        </div>
    )
}

export default NotificationsModal


const Card = ({ src, time, titleFirst }) => {
    return (
        <div className="notifications-item">
            <div className="notifications-desc">
                <Link to="#" className="font-body text-truncate-2-line"> <span className="fw-semibold text-dark">{titleFirst}</span>  </Link>
                <div className="d-flex justify-content-between align-items-center">
                </div>
            </div>
        </div>
    )
}