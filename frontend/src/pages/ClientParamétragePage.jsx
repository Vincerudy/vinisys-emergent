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
import { hasPermission } from '../contexte/permissions';


    const { Option } = Select;
    const { RangePicker } = DatePicker;
    const { TabPane } = Tabs; 
    const fetchMonthlySales = (id) => {
    
    } 
    // Données facticesol

    const fetchDataFactures = async (id) => {
    
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/listeFacture/${id}`);
      
        return response.data; // Retourne les données directement
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return null; // Retourne null en cas d'erreur
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


 

 

const ClientParamétragePage = ( ) => {
  const { id, societe_id, token, logout  } = useAuth();

  const [clientList, setClientList] = useState([]);
  const [suppression, setSuppression] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const factureRef = useRef();
  const [searchTerm, setSearchTerm] = useState(''); // État pour la barre de recherche
  const [dateRange, setDateRange] = useState(null); // État pour la plage de dates
  const [statusFilter, setStatusFilter] = useState('all'); // État pour le statut
  const [filters, setFilters] = useState({ name: '', city: '' });
  const [numeroFacture, setNumeroFacture] = useState(null);
  const [entryMode, setEntryMode] = useState('TTC'); // Mode de saisie : 'TTC' ou 'HT'
  const formRef = useRef(null);
  const [parametrage, setParametrage] = useState([])
  const [devise, setDevise] = useState('');
  const [alertes, setAlertes] = useState([]);
    const [loading, setLoading] = useState(true); // État pour suivre le chargement
  
 


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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


 
 

  const obtenirFactures = async () => {
    
    const numefac = await fetchNumeroFacture(id);
 
    const timestamp = getCustomCode();
    setNumeroFacture(timestamp + '-' + numefac )
 
    const data = await fetchDataFactures(id);
 
    if (data) {
      setInvoices(data); // On met à jour l'état avec les factures reçues
    }
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
 
 
    obtenirFactures();
  }, []);

  console.log('KKKKK ', alertes[0]  )

  const filteredInvoices = invoices?.filter((invoice) => {
    // Filtrer par recherche
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase());
    // Filtrer par statut
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'payée' && invoice.statut === 'payée') ||
      (statusFilter === 'en attente' && invoice.statut === 'en attente') ||
      (statusFilter === 'En retard' && invoice.statut === 'En retard') 
      
  
    // Convertir la chaîne de date en objet dayjs
    const invoiceDate = dayjs(invoice.date, 'DD/MM/YYYY');
    const matchesDate =
      !dateRange ||
      (invoiceDate.isAfter(dayjs(dateRange[0])) || invoiceDate.isSame(dayjs(dateRange[0]))) &&
      (invoiceDate.isBefore(dayjs(dateRange[1])) || invoiceDate.isSame(dayjs(dateRange[1])));
  
    return matchesSearch && matchesStatus && matchesDate;
  });

  console.log('filteredInvoices ', filteredInvoices)
  
  
  useEffect(() => {
    fetchDataClient(id);
  }, []);

  const handleDeleteClient = async (record) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/deleteclient/${record.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
 
 
    } catch (error) {
      Modal.info({
        title: 'Informations',
        content: (
          <div>
            <p>Pour des questions d'historisation, vous ne pouvez pas supprimer ce client car celui-ci dispose déjà d'une facture. </p>
            {/* Ajoute ici d'autres informations que tu souhaites afficher */}
          </div>
        ),
        okText: 'OK', // Bouton unique pour fermer la modal
        onOk: () => {
          console.log('Modal fermée'); // Logique à exécuter lors de la fermeture
        },
      });
       
    }
    obtenirFactures();
  };
  
  const [modalVisible, setModalVisible] = useState(false);
  const [clientModalVisibleRead, setClientModalVisibleRead] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [modalFactureVisible, setModalFactureVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [form] = Form.useForm();
  const [clientForm] = Form.useForm(); // Formulaire pour le client
  const [products, setProducts] = useState([{ productName: '', quantity: 1, price: 0 }]);
  const [editingClient, setEditingClient] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isEditingClient, setIsEditingClient] = useState(false); 
  const [isEditingFacture, setIsEditingFacture] = useState(false); 
  const [factures, setFactures] = useState(null);
  const [modalMailVisible, setModalMailVisible] = useState(false);
  const [isInvoice, setIsInvoicee] = useState(false);
  const [facturePaye, setFacturePaye] = useState(null)
  const [modaleFacturePayeVisible, setModaleFacturePayeVisible] = useState(false)
  const [activeTabAgenda, setActiveTabAgenda] = useState('tab1')

  const [emailData, setEmailData] = useState({
    clientName: '',
    subject: 'Votre Facture',
    body: 'Veuillez trouver ci-joint votre facture.',
  });
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfAttachment, setPdfAttachment] = useState(null);
  const formLayout = {
    labelCol: { span: 1 }, // Largeur des labels
  };

  const handleSaveFacture = (data) => {
    console.log('Données sauvegardées:', data); // Envoyer vers backend ici
    setModaleFacturePayeVisible(false);

  };

  const transformToInvoiceOpen = (record)=>{
 
      setFacturePaye(record)
      setModaleFacturePayeVisible(!modaleFacturePayeVisible)
    

  }

  const transformToInvoiceCancel = (record)=>{
    setFacturePaye(record)
    setModaleFacturePayeVisible(!modaleFacturePayeVisible)
  }
 
  //const transformToInvoice = async (record, statut) => {
  //  if(record.statut === 'payée'){
  //    Modal.info({
  //      title: 'Informations',
  //      content: (
  //        <div>
  //          <p>La facture n° {record.invoiceNumber} est marquée comme payée, vous ne pouvez plus modifier son statut</p>
  //          {/* Ajoute ici d'autres informations que tu souhaites afficher */}
  //        </div>
  //      ),
  //      okText: 'OK', // Bouton unique pour fermer la modal
  //      onOk: () => {
  //        console.log('Modal fermée'); // Logique à exécuter lors de la fermeture
  //      },
  //    });
  //  }
  //  else{
  //    try {
  //      const response = await axios.post(`${import.meta.env.VITE_API_URL}/factures/statut/${record.id}`, {
  //        statut, // Le body de la requête (axios gère automatiquement le format JSON)
  //      });
  //      // Vérifie si la réponse est OK
  //      obtenirFactures();
  //      if (response.status !== 200) {
  //        throw new Error(`Erreur lors de la mise à jour du statut: ${response.statusText}`);
  //      }
  //      // Log le message de succès
  //      console.log('Statut mis à jour avec succès', response.data.message);
  //      // Si tu as besoin de rafraîchir l'interface après la mise à jour
  //      // refreshData(); // Par exemple
  //    } catch (error) {
  //      console.error('Erreur lors de la mise à jour du statut:', error.message);
  //    }
  //  }
  //};
  //
  

  

  const handleSendFacture = async () => {
    try {
        // Préparer les données à envoyer
        const formData = new FormData();
        formData.append('attachment', pdfAttachment, `facture-${emailData.invoiceNumber}.pdf`);
        formData.append('clientName', emailData.clientName);
        formData.append('emailSubject', emailData.emailSubject);
        formData.append('emailBody', emailData.emailBody);

        // Envoyer la requête POST à la route '/senderMail'
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/senderMail`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Traitement de la réponse
        if (response.status === 200) {
     
            // Vous pouvez afficher un message de succès ici, ou réinitialiser l'état si nécessaire

            setModalMailVisible(false)
        } else {
            console.error('Erreur lors de l\'envoi de l\'email :', response.data);
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
    }
};

  const handleOpenModal = (record, type) => {
    // Stocker la facture sélectionnée dans l'état
    setFactures(record);
    
    // Préparer les données pour l'email
    setEmailData({
        clientName: record.client,
        emailSubject: `${type === 'FACT' ? 'Votre facture n°' : 'Votre devis n°'} ${record.invoiceNumber} de ${record.vendeur_nom}`,
        emailBody: `Bonjour ${record.client},\n\nVeuillez trouver ci-joint votre ${type == 'FACT' ? 'facture' : 'devis'}.\n\nBien cordialement,`,
        type: type,
    });

    // Générer le PDF après avoir mis à jour l'état numeroFacture
    const options = {
        margin: [10, 0, 0, 10],
        filename: `facture-${record.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Créer un élément temporaire pour le modèle de facture
    const tempDiv = document.createElement('div');
    tempDiv.className = 'divModalModeleFacture';
    
 
    ReactDOM.render(<ModeleFacture parametrage={parametrage} factures={record} type={type}/>, tempDiv);

    // Ouvrir la modale
    setModalMailVisible(true);

    // Générer le PDF à partir de l'élément temporaire
    html2pdf()
        .from(tempDiv)
        .set(options)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
            const blob = pdf.output('blob'); // Créez un Blob
            setPdfAttachment(blob); // Stockez le Blob dans l'état
        })
        .catch((error) => {
            console.error("Erreur lors de la création du PDF :", error);
        })
        .finally(() => {
            // Nettoyer le DOM en retirant l'élément temporaire
            ReactDOM.unmountComponentAtNode(tempDiv);
        });
  };





  useEffect(() => {
    
    fetchDataClient(id);
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleAddInvoice = (value) => {

    if(value == 'INVO'){
      setIsInvoicee(true)
    }
    else{
      setIsInvoicee(false)
    }
    setIsEditingFacture(false) // on informe qu'on n'est en train de creer une nouvelle facture 
    form.resetFields();
    setProducts([{ productName: '', quantity: 1, price: 0 }]);
    setModalVisible(true);
  };

  const handleAddClient = () => {
    clientForm.resetFields();
    setClientModalVisible(true);
  };
 

  //bouton ok de la modale
 

  //Modification d'un client
  const handleEditClient = async (record) => {
    setEditingClient(record);
    clientForm.setFieldsValue(record);
    setClientModalVisible(true);
    setIsEditingClient(true)
  };
  const handleEditClientRead = async (record) => {
    setEditingClient(record);
    clientForm.setFieldsValue(record);
    setClientModalVisibleRead(true);
    setIsEditingClient(true)
  };

  const handleEditInvoice = (record, type) => {
    console.log('TTC HT ',record.type_saisie)
    form.setFieldsValue({ entryMode: record.type_saisie || 'TTC' });
    setEntryMode(record.type_saisie)

  
 
    if(record.statut === 'payée'){
      Modal.info({
        title: 'Informations',
        content: (
          <div>
            <p>La facture n° {record.invoiceNumber} est marquée comme payée, vous ne pouvez plus la modifier</p>
            {/* Ajoute ici d'autres informations que tu souhaites afficher */}
          </div>
        ),
        okText: 'OK', // Bouton unique pour fermer la modal
        onOk: () => {
          console.log('Modal fermée'); // Logique à exécuter lors de la fermeture
        },
      });
    }
    else{
      if(type == 'INVO'){
        setIsInvoicee(true)
      }
      else{
        setIsInvoicee(false)
      }
      setIsEditingFacture(true)  // on informe qu'on met à jour un client
      const oProduits = record.produits.map(product => ({
        productName: product.nom,
        quantity: product.quantite,
        price: parseFloat(product.prix) // Convertir le prix en nombre
      }));
      setEditingInvoice(record); // Stocke la facture en cours d'édition
      setProducts(oProduits || [{ productName: '', quantity: 2, price: 0 }]); // Pré-remplir les produits si existants
      form.setFieldsValue({
        
        client: record.client_id,
        invoiceNumber: record.invoiceNumber,
        date:  dayjs(record.date, 'DD/MM/YYYY') ,
        // Ajoutez d'autres champs selon votre besoin, par exemple:
        totalAmount: record.totalAmount,
        // Etc.
      });
      setModalVisible(true); // Ouvre la modal
    }
  };



  // Votre fonction modifiée
  const HandleDeleteFacture = async (record) => {
    if(record.statut === 'payée'){
      Modal.info({
        title: 'Informations',
        content: (
          <div>
            <p>La facture n° {record.invoiceNumber} est marquée comme payée, vous ne pouvez plus la supprimer</p>
            {/* Ajoute ici d'autres informations que tu souhaites afficher */}
          </div>
        ),
        okText: 'OK', // Bouton unique pour fermer la modal
        onOk: () => {
          console.log('Modal fermée'); // Logique à exécuter lors de la fermeture
        },
      });
    }
    else{
      Modal.confirm({
        title: 'Confirmer la suppression',
        content: `Êtes-vous sûr de vouloir supprimer cette facture  ?`,
        okText: 'Confirmer',
        okType: 'danger',
        cancelText: 'Annuler',
        okButtonProps: {
            className: 'custom-button', // Classe pour le bouton "Oui"
        },
        cancelButtonProps: {
            className: 'custom-button', // Classe pour le bouton "Non"
        },
          onOk: async () => {
              try {
    
                  const response = await axios.post(`${import.meta.env.VITE_API_URL}/factures/supprimer/${record.id}`, {
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    withCredentials: true,
                  });
   
                  obtenirFactures();
                  return response.data; // Retourne les données de réponse pour un éventuel traitement ultérieur
              } catch (error) {
                  console.error('Erreur lors de la suppression de la facture:', error.response ? error.response.data : error.message);
                  throw error; // Lance l'erreur pour un éventuel traitement ultérieur
              }
          },
          onCancel() {
              console.log('Suppression annulée');
          },
      });
    }
  };
  
 
 

  const calculateTotals = () => {
 
    let totalHT = 0;

    products.forEach((product) => {
      const productTotal = product.quantity * product.price;
      totalHT += entryMode === 'TTC' ? productTotal / (1 + parametrage.vatRate / 100) : productTotal;
    });

    const totalTVA = totalHT * (parametrage.vatRate / 100);
    const totalTTC = totalHT + totalTVA;

    return {
      totalHT: totalHT.toFixed(2),
      totalTVA: totalTVA.toFixed(2),
      totalTTC: totalTTC.toFixed(2),
    };
  };

  const { totalHT, totalTVA, totalTTC } = calculateTotals();


    // bouton sauvegarder de la modale client 
    const handleClientModalOk = async () => {
      try {
        const values = await clientForm.validateFields();
        const token = localStorage.getItem('token'); // ou selon ton système d'authentification
    
        if (isEditingClient) {
          const clientData = { ...values, societe_id, id: editingClient.id };
    
          await axios.post(`${import.meta.env.VITE_API_URL}/updateClient`, clientData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
          });
    
          setClientList(clientList.map(client =>
            client.id === editingClient.id ? { ...client, ...clientData } : client
          ));
    
          setEditingClient(null);
          setIsEditingClient(false);
    
          Modal.success({
            title: 'Succès',
            content: 'Client mis à jour avec succès.',
          });
        } else {
          const clientData = { ...values };
    
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/insertClient`, clientData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
          });
    
          setClientList([...clientList, { ...clientData, id: clientList.length + 1 }]);
    
          Modal.success({
            title: 'Client ajouté',
            content: response.data.message || 'Client créé avec succès.',
          });
        }
    
        setClientModalVisible(false);
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Erreur lors de la sauvegarde du client.';
    
        Modal.error({
          title: 'Erreur',
          content: errorMsg,
        });
    
        console.error('Erreur lors de la sauvegarde du client:', error);
      }
    };


  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleClientModalCancel = () => {
    setClientModalVisible(false);
  };
  const handleClientModalCancelRead = () => {
    setClientModalVisibleRead(false);
  };

  const handleRemoveProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };



  const handleModalModeleFactureCancel = (value, type) => {
    if(type == 'FACT'){
      setIsInvoicee(true)
    }
    else{
      setIsInvoicee(false)
    }
    setFactures(value)
    setModalFactureVisible(!modalFactureVisible);
  };

  const handleModeleFactureImpression = () => {
    const element = factureRef.current; // Récupère l'élément référencé
 

    if (!element) {
        console.error("Element non trouvé !");
        return;
    }

    // Appliquer les styles CSS pour éviter les ruptures de lignes et gérer la marge
    const style = document.createElement('style');
    style.innerHTML = `
        .invoice-table tbody tr {
            page-break-inside: avoid; /* Évite la coupure des lignes dans le tableau */
        }
        .invoice-table td {
            word-wrap: break-word; /* Permet aux mots longs de se couper */
        }
        .invoice-table {
            margin-top: 20px; /* Ajoute 20px de marge au tableau */
        }
        .page-break {
            margin-top: 20px; /* Ajoute 20px de marge en haut pour la seconde page */
        }
    `;
    document.head.appendChild(style);

    // Ajout de la classe pour la seconde page
    const rows = element.querySelectorAll('.invoice-table tbody tr');
    rows.forEach((row) => {
        // Ajoutez une classe pour gérer l'espacement des lignes si nécessaire
        row.classList.add('page-break');
    });

    const options = {
        margin: [10, 0, 0, 10], // Marges à zéro pour le reste
        filename: `facture-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Utilisation de html2pdf pour générer le PDF
    html2pdf()
        .from(element)
        .set(options)
        .save()
        .then(() => {
        })
        .catch((error) => {
            console.error("Erreur lors de la création du PDF :", error);
        });
};

const handleTabChangeAbsence = (key) => {
  setActiveTabAgenda(key);
};

  
  const invoiceColumns = [
    { title: 'Client', dataIndex: 'client', key: 'client' },
    { title: 'Numéro de Facture', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Montant Total', dataIndex: 'totalAmount', key: 'totalAmount' },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut',
      render: (text) => {
        let backgroundColor = 'transparent';
        let color = 'inherit';
  
        if (text === 'payée') {
          backgroundColor = '#b4f8c4'; // Vert clair
          color = '#155724'; // Vert foncé
        } else if (text === 'en attente') {
          backgroundColor = '#cce5ff'; // Bleu clair
          color = '#004085'; // Bleu foncé
        }
        else if (text === 'En retard'){
          backgroundColor = '#f9c3c3'; // Bleu clair
          color = '#850000'; // Bleu foncé
        }
        
  
        return (
          <span style={{ 
            backgroundColor, 
            color,
            fontWeight: 'bold',
            padding: '5px 10px',
            borderRadius: '5px',
            display: 'inline-block'
          }}>
            {text}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const menu = (
          <Menu>
            {record.statut !== 'payée' ?  
            <Menu.Item key="1" onClick={() => transformToInvoiceOpen(record)}>
              Marquer comme payé
            </Menu.Item>
            : 
            <Menu.Item key="2" onClick={() => transformToInvoiceOpen(record)}>
            Afficher le mode de reglement
            </Menu.Item>
            }
            {record.statut !== 'payée' ?  
            <Menu.Item key="3" onClick={() => transformToInvoice(record, 'en attente')}>
              Marquer comme en attente
            </Menu.Item>
            : ""}
          </Menu>
        );
        
        return (
          <div className="actions">
            <Button type="link" icon={<img src={eye} className='iconListe' onClick={()=>handleModalModeleFactureCancel(record, 'FACT')} alt="Example" />} /> 
            <Button type="link" icon={<img src={iconEnveloppe} className='iconListe'  onClick={() => handleOpenModal(record, 'FACT')} alt="Example" />} />
            {hasPermission('manage_clients') ? 
               <Button type="link" icon={<img src={edit} className='iconListe'  onClick={()=> handleEditInvoice(record, 'INVO')} alt="Example" />} />  :''
            }   
            {hasPermission('manage_clients') ? 
                        <Button type="link" icon={<img src={trash} className='iconListe'   onClick={()=> HandleDeleteFacture(record)} alt="Example" />} /> : ''
            }


            {/* Nouveau bouton avec le Dropdown */} 
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="link">
                Plus <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        );
      },
    },
  ];


  const clientColumns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email', className: "col-email" },
    { title: 'Téléphone', dataIndex: 'phone', key: 'phone' },
    { title: 'Adresse', dataIndex: 'address', key: 'address', className: "col-adresse" },
    { title: 'Code postal', dataIndex: 'postalCode', key: 'postalCode', className: "col-postal"  },
    { title: 'Ville', dataIndex: 'city', key: 'city', className: "col-ville" },
    { title: 'Pays', dataIndex: 'country', key: 'country', className: "col-pays" },
    {
      title: 'Actions',
      key: 'actions',  
      render: (_, record) => (
        <div className="actions">
          <Button type="link" icon={<img src={eye} className='iconListe' onClick={()=>handleEditClientRead(record)} alt="Example" />} />  
          <Button type="link" icon={<img src={edit} className='iconListe'  onClick={()=>handleEditClient(record)} alt="Example" />} /> 
          <Button type="link" icon={<img src={trash} className='iconListe'   onClick={() => handleDeleteClient(record)} alt="Example" />} />   
        </div>
      ),
    },
  ];

   
  return (
 
      <div className="facturation-container">
<Tabs
  defaultActiveKey="dashboard"
  onChange={handleTabChange}
  className="tabs"
  items={
    (parametrage.enableInvoices === 1 || parametrage.enableQuotes === 1)
      ? [
          {
            key: 'clientList',
            label: (
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#3454d1' }}>
                Gestion des clients
              </span>
            ),
            children: (
              <>
                <div className="filters">
                  <Input
                    placeholder="Rechercher par nom"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="inputRechercheClient"
                  />
                  <Input
                    placeholder="Rechercher par ville"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    className="inputRechercheClient"
                  />
                </div>
                {hasPermission('manage_clients') ? 
                  <Button
                    type="primary"
                    onClick={handleAddClient}
                    className="create-button"
                    icon={<PlusOutlined />}
                    style={{ marginTop: 20, marginBottom: 20 }}
                  >
                    Ajouter un Client
                  </Button>
                  : ''}
                <Table
                  pagination={{ pageSize: 8 }}
                  columns={clientColumns}
                  dataSource={filteredClients}
                  rowKey="id"
                  locale={{ emptyText: 'Aucune donnée à afficher' }}
                  className="invoice-table"
                  rowClassName={(record, index) =>
                    index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                  }
                />
              </>
            ),
          }
        ]
      : []}
/>

        {/* Modale pour Ajouter une Facture */}
         

        {/* Modale pour Ajouter un Client */}
        <Modal
          open={clientModalVisible}
          onOk={handleClientModalOk}
          onCancel={handleClientModalCancel}
          okText="Sauvegarder"
          cancelText="Annuler"
          width={window.innerWidth <= 768 ? '100vw' : '55vw'}  // Largeur à 50% de la fenêtre
          styles={{
            body: {
              height: window.innerWidth <= 768 ? '60vh' : '80vh',
              overflowY: 'auto',
              overflowX: 'hidden',
            },
            mask: {},      // si tu veux styliser le fond sombre
            header: {},    // si tu veux styliser le header
            footer: {},    // idem pour le footer
            content: {},   // contenu global
          }}
          className={clientModalVisible ? 'modal-slide-in' : ''}
          style={{
            right: 0, // Toujours collé à droite
            position: 'fixed',
            top: window.innerWidth <= 768 ? '13%' : '9%',  // Ajustez la position verticale si nécessaire
            margin: 0,
            padding: 0,
          }}  
        >
          <div className='containerModalMail'> 
            <div className='blocenteteEmail'>
                <div className='iconMail'>
                  <img src={client} alt="client" />
                </div>
                <div>
                <h1>Fiche client</h1>
                </div>
 
            </div>
            <hr className='hr' />
            <div>
              <Form form={clientForm} layout="vertical">
                <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez entrer le nom' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Veuillez entrer l\'email' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="address" label="Adresse" rules={[{   message: 'Veuillez entrer l\'adresse' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="city" label="Ville" rules={[{ required: true, message: 'Veuillez entrer la ville' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="postalCode" label="Code Postal" rules={[{   message: 'Veuillez entrer le code postal' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="country" label="Pays" rules={[{   message: 'Veuillez entrer le pays' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="phone" label="Téléphone" rules={[{ required: true, message: 'Veuillez entrer le téléphone' }]}>
                  <Input />
                </Form.Item>
              </Form>
            </div>
          </div>
        </Modal>
        {/* Modale pour voir la fiche un Client */}
        <Modal
          open={clientModalVisibleRead}
  
          onCancel={handleClientModalCancelRead}
   
          cancelText="Fermer"
          width={window.innerWidth <= 768 ? '100vw' : '55vw'}  // Largeur à 50% de la fenêtre
          styles={{
            body: {
              height: window.innerWidth <= 768 ? '60vh' : '80vh',
              overflowY: 'auto',
              overflowX: 'hidden',
            },
            mask: {},      // si tu veux styliser le fond sombre
            header: {},    // si tu veux styliser le header
            footer: {},    // idem pour le footer
            content: {},   // contenu global
          }}
          className={clientModalVisibleRead ? 'modal-slide-in' : ''}
          style={{
            right: 0, // Toujours collé à droite
            position: 'fixed',
            top: window.innerWidth <= 768 ? '13%' : '9%',  // Ajustez la position verticale si nécessaire
            margin: 0,
            padding: 0,
          }}  
          okButtonProps={{
            style: { display: 'none' }, // Masquer le bouton Ok
          }}
        >
          <div className='containerModalMail'> 
            <div className='blocenteteEmail'>
                <div className='iconMail'>
                  <img src={client} alt="client" />
                </div>
                <div>
                <h1>Fiche client</h1>
                </div>
 
            </div>
            <hr className='hr' />
            <div>
              <Form form={clientForm} layout="vertical">
                <Form.Item name="name" label="Nom" rules={[{   message: 'Veuillez entrer le nom' }]}>
                  <Input readOnly style={{borderColor: '#dae8f7'}}/>
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{   message: 'Veuillez entrer l\'email' }]}>
                  <Input readOnly style={{borderColor: '#dae8f7'}}/>
                </Form.Item>
                <Form.Item name="address" label="Adresse" rules={[{   message: 'Veuillez entrer l\'adresse' }]}>
                  <Input readOnly style={{borderColor: '#dae8f7'}}/>
                </Form.Item>
                <Form.Item name="city" label="Ville" rules={[{   message: 'Veuillez entrer la ville' }]}>
                  <Input readOnly style={{borderColor: '#dae8f7'}}/>
                </Form.Item>
                <Form.Item name="postalCode" label="Code Postal" rules={[{   message: 'Veuillez entrer le code postal' }]}>
                  <Input readOnly style={{borderColor: '#dae8f7'}}/>
                </Form.Item>
                <Form.Item name="country" label="Pays" rules={[{   message: 'Veuillez entrer le pays' }]}>
                  <Input readOnly style={{borderColor: '#dae8f7'}}/>
                </Form.Item>
                  <Form.Item name="phone" label="Téléphone" rules={[{  message: 'Veuillez entrer le téléphone' }]}>
                <Input readOnly style={{borderColor: '#dae8f7'}}/>
                </Form.Item>
              </Form>
            </div>
          </div>
        </Modal>
        <Modal
          open={modalFactureVisible}
          onOk={handleModeleFactureImpression}
          onCancel={handleModalModeleFactureCancel}
          okText="Télécharger"
          cancelText="Annuler"
          width={window.innerWidth <= 768 ? '100vw' : '55vw'} 
          styles={{
            body: {
              height: window.innerWidth <= 768 ? '60vh' : '80vh',
              overflowY: 'auto',
              overflowX: 'hidden',
            },
            mask: {},      // si tu veux styliser le fond sombre
            header: {},    // si tu veux styliser le header
            footer: {},    // idem pour le footer
            content: {},   // contenu global
          }}
          className={modalFactureVisible ? 'modal-slide-in' : ''}
          style={{
            right: 0,
            position: 'fixed',
            top: window.innerWidth <= 768 ? '13%' : '9%', 
            margin: 0,
            padding: 0,
          }} 
        >
            <div ref={factureRef} className='divModalModeleFacture'>
              <ModeleFacture factures={factures} parametrage={parametrage}  type={isInvoice ? 'FACT' : 'DEVI'}/>
            </div>
        </Modal>
        
        <Modal
          okText="Envoyer"
          open={modalMailVisible}
          width={window.innerWidth <= 768 ? '100vw' : '55vw'} // Largeur à 50% de la fenêtre
          styles={{
            body: {
              height: window.innerWidth <= 768 ? '60vh' : '80vh',
              overflowY: 'auto',
              overflowX: 'hidden',
            },
            mask: {},      // si tu veux styliser le fond sombre
            header: {},    // si tu veux styliser le header
            footer: {},    // idem pour le footer
            content: {},   // contenu global
          }}
          className={modalMailVisible ? 'modal-slide-in' : ''}
          style={{
            right: 0, // Toujours collé à droite
            position: 'fixed',
            top: window.innerWidth <= 768 ? '13%' : '9%', // Ajustez la position verticale si nécessaire
            margin: 0,
            padding: 0,
          }}
          onOk={handleSendFacture} // Assurez-vous que cette fonction existe
          onCancel={() => setModalMailVisible(false)}
        >     
          <div className='containerModalMail'> 
            <div className='blocenteteEmail'>
                <div className='iconMail'>
                  <img src={iconEnveloppe} alt="Example" />
                </div>
                <div>
                  <h1>Envoyer un email</h1>
                </div>
 
            </div>
            <hr className='hr' />
            <div className="form-container">
              <Form layout="vertical">
                <Form.Item label="Client">
                  <Input value={emailData.clientName} readOnly className="fixed-height-input" />
                </Form.Item>
                <Form.Item label="Objet">
                  <Input value={emailData.emailSubject} readOnly className="fixed-height-input" />
                </Form.Item>
                <Form.Item label="Message">
                  <Input.TextArea
                    value={emailData.emailBody}
                    rows={8} 
                    
                    className="dynamic-height-textarea"
                  />
                </Form.Item>
                {pdfAttachment && (
                  <Form.Item
                    label={emailData.type === 'FACT' ? 'Télécharger la Facture' : 'Télécharger le Devis'}
                  >
                    <a
                      href={URL.createObjectURL(pdfAttachment)}
                      download={`facture-${emailData.clientName}.pdf`}
                      className="download-link"
                    >
                      Télécharger la pièce jointe
                    </a>
                  </Form.Item>
                )}
              </Form>
            </div>
          </div>
        </Modal>
        <Modal
          open={modaleFacturePayeVisible}
          onOk={() => {
            formRef.current?.submit()
            obtenirFactures();
          }}
          onCancel={transformToInvoiceCancel}
          okText="Valider"
          cancelText="Annuler"
          width={window.innerWidth <= 768 ? '100vw' : '55vw'}  // Largeur à 50% de la fenêtre
          styles={{
            body: {
              height: window.innerWidth <= 768 ? '60vh' : '80vh',
              overflowY: 'auto',
              overflowX: 'hidden',
            },
            mask: {},      // si tu veux styliser le fond sombre
            header: {},    // si tu veux styliser le header
            footer: {},    // idem pour le footer
            content: {},   // contenu global
          }}
          className={modaleFacturePayeVisible ? 'modal-slide-in' : ''}
          style={{
            right: 0, // Toujours collé à droite
            position: 'fixed',
            top: window.innerWidth <= 768 ? '13%' : '9%',  // Ajustez la position verticale si nécessaire
            margin: 0,
            padding: 0,
          }}  
        >
            <div ref={factureRef} className='divModalModeleFacture'>
            <ModaleMarqueCom factures={facturePaye} onSave={handleSaveFacture} formRef={formRef} devise={devise}/>
            </div>
        </Modal>

      </div>
 
  );
};

export default ClientParamétragePage;
