import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tabs, Row, Col, Statistic, Card, Dropdown, Menu, ConfigProvider , Radio } from 'antd';
import { DownloadOutlined, DownOutlined, MailOutlined, PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import './css/FacturationPage.css'; // Import du fichier CSS
import axios from 'axios';
import ModeleFacture from '../components/composantsFacture/ModeleFacture';
import dayjs from 'dayjs';
import moment from 'moment';
import { useAuth } from '../contexte/AuthContext';
import 'dayjs/locale/fr';
import locale from 'antd/es/locale/fr_FR';
import CahierRecettesPage from '../components/composantsFacture/CahierRecettesPage';
 
    const { TabPane } = Tabs; 
 
 
    const fetchAlerts = async (vale1, vale2) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/alertesprogrammee`, {
          params: { vale1, vale2 }
        });
      
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
        console.error("Erreur lors de la récupération des alertes :", error);
        return [];
      }
    };

    const fetchParamétrages = async (vale) => {
    
      try {
      
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/parametrage-facturation/${vale}`);
        console.log('Test Para', response)
           return response.data.data
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres :', error);
      } 
    };



const CahierRecettePage = ( ) => {
  const { id, societe_id, token, logout  } = useAuth();
 const factureRef = useRef();
 
  const formRef = useRef(null);
  const [parametrage, setParametrage] = useState([])
  const [alertes, setAlertes] = useState([]);
  
    fetchParamétrages(id)


 


  const recuperationAlerte = async () => {
    const alert = await fetchAlerts(id, societe_id)
    setAlertes(alert)
    console.log('Mes alertes', alertes);
  }

  useEffect(() => {
    const recuperePara = async () =>{
      const para = await fetchParamétrages(id)
      console.log('paramétrage ', para)
      setParametrage(para)
    
    }
    recuperePara()
    // Appel de la fonction fetchDataFactures définie en dehors du composant
    recuperationAlerte()
 
 
  }, []);

 
 
 
  return (
 
      <div className="facturation-container">
        <Tabs defaultActiveKey="dashboard"   className="tabs">
     
          {parametrage.enableRecette == 1 && (parametrage.enableInvoices == 1 || parametrage.enableQuotes == 1) ? 
            <TabPane 
                tab={<span style={{ fontWeight: 'bold', fontSize: '18px', color: '#3454d1' }}>Cahier de recette</span>} 
                 key="recette">
              <CahierRecettesPage/>
            
            </TabPane>
          : ""}
         
        </Tabs>

      </div>
 
  );
};

export default CahierRecettePage;
