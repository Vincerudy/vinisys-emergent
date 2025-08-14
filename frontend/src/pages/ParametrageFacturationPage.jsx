import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tabs, Row, Col, Statistic, Card, Dropdown, Menu, ConfigProvider , Radio } from 'antd';
import { DownloadOutlined, DownOutlined, MailOutlined, PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
 



 
import './css/FacturationPage.css'; // Import du fichier CSS
 
import axios from 'axios';
import ModeleFacture from '../components/composantsFacture/ModeleFacture';
 
import html2pdf from 'html2pdf.js';
import ReactDOM from 'react-dom';
import dayjs from 'dayjs';
import moment from 'moment';
import { useAuth } from '../contexte/AuthContext';
import 'dayjs/locale/fr';
import locale from 'antd/es/locale/fr_FR';
import CahierRecettesPage from '../components/composantsFacture/CahierRecettesPage';
import iconEnveloppe from '../assets/email.png'; 
import facture from '../assets/facture.png';
import client from '../assets/client.png';
import trash from '../assets/trash.png'
import eye from '../assets/eye.png'
import edit from '../assets/edit.png'
import ModaleMarqueCom from '../components/composantsFacture/ModaleMarqueCom';
import ParametrageFacturationGeneral from '../components/composantsFacture/ParametrageFacturationGeneral';
import AlertFacturation from '../components/composantsFacture/AlertFacturation';
import MailFacturation from '../components/composantsFacture/MailFacturation';


    const { Option } = Select;
    const { RangePicker } = DatePicker;
    const { TabPane } = Tabs; 
    const fetchMonthlySales = (id) => {
    
    } 
    // Données factices

    const fetchDataFactures = async (id) => {
    
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/listeFacture/${id}`);
      
        return response.data; // Retourne les données directement
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return null; // Retourne null en cas d'erreur
      }
    };

    const fetchAlerts = async (id, societe_id) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/alertesprogrammee`, {
          params: { id, societe_id }
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

    const fetchNumeroFacture = async (id) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/numerofacture/${id}`);
        return response.data.nume_fact;
      } catch (error) {
        console.error("Erreur lors de la récupération du numéro de facture :", error);
        return null;
      }
    };



    const fetchDataClient = async (id) => {
      try {
        const listeClient = await axios.get(`${import.meta.env.VITE_API_URL}/listeClient/${id}`);
        return listeClient.data;
      
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };


 

 

const ParametrageFacturationPage = ( ) => {
  const { id, societe_id, token, logout  } = useAuth();

  const [clientList, setClientList] = useState([]);
 
  const factureRef = useRef();
   
  const [filters, setFilters] = useState({ name: '', city: '' });
  const [numeroFacture, setNumeroFacture] = useState(null);
   
  const formRef = useRef(null);
  const [parametrage, setParametrage] = useState([])
  const [devise, setDevise] = useState('');
  const [alertes, setAlertes] = useState([]);
   
  
    fetchParamétrages(id)

 
  // Filtrer les clients en fonction des filtres
  const filteredClients = clientList.filter(
    (client) =>
      client.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      client.city.toLowerCase().includes(filters.city.toLowerCase())
  );

 
 
  function getCustomCode() {
    // Récupère le mois en cours (indice 0 pour janvier, 11 pour décembre)
    const months = ['JA', 'FE', 'MA', 'AV', 'MA', 'JL', 'JU', 'AU', 'SE', 'OC', 'NO', 'DE'];
    const currentMonth = months[new Date().getMonth()];
  
    // Récupère les 4 derniers chiffres du timestamp
    const timestamp = Date.now();
    const lastFourDigits = timestamp.toString().slice(-3); // Prend les 4 derniers chiffres du timestamp
  
    // Retourne le code sous le format désiré
    return `${currentMonth}${lastFourDigits}`;
  }


 

  const recuperationAlerte = async () => {
    const alert = await fetchAlerts(id, societe_id)
    setAlertes(alert)
    console.log('Mes alertes', alertes);
  }


  const obtenirFactures = async () => {
    
    const numefac = await fetchNumeroFacture(id);
 
    const timestamp = getCustomCode();
    setNumeroFacture(timestamp + '-' + numefac )
 
 
 
 
    setDevise(data?.[0]?.devise || 'EUR');
    const client = await fetchDataClient(id);
    if (client) {
      setClientList(client); // On met à jour l'état avec les factures reçues
    }
  };


  useEffect(() => {
    const recuperePara = async () =>{
      const para = await fetchParamétrages(id)
      console.log('paramétrage ', para)
      setParametrage(para)
    
    }
    recuperePara()
    // Appel de la fonction fetchDataFactures définie en dehors du composant
    recuperationAlerte()
 
    obtenirFactures();
  }, []);

  

 
 
 
  
 
  return (
 
      <div className="facturation-container">
        <Tabs defaultActiveKey="dashboard"  className="tabs">
      
          <TabPane 
                           tab={<span style={{ fontWeight: 'bold', fontSize: '18px', color: '#3454d1' }}>Paramétrage général</span>} 
          key="Parametrage">
            <div className='containerAbsence'>
               
            <ParametrageFacturationGeneral/>
              
                
            </div>
          </TabPane>
 
        </Tabs>

      
       
        
      </div>
 
  );
};

export default ParametrageFacturationPage;
