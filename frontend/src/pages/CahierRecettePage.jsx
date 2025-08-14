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
import FeatureGuard from '../components/FeatureGuard';
 
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



const CahierRecettePageWrapper = () => {
  return (
    <FeatureGuard 
      feature="recette"
      title="Cahier de Recettes"
      description="Le cahier de recettes est une fonctionnalité premium disponible à partir du plan Pro. Il vous permet de suivre en détail toutes vos ventes et recettes."
    >
      <CahierRecettesPage />
    </FeatureGuard>
  );
};

export default CahierRecettePageWrapper;
