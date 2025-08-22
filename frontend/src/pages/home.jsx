import React, {useState,useRef, useEffect} from 'react'
import LeadsOverviewChart from '@/components/widgetsCharts/LeadsOverviewChart'
import LatestLeads from '@/components/widgetsTables/LatestLeads'
import Schedule from '@/components/widgetsList/Schedule'
import { useAuth } from '../contexte/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Table, Statistic, Row, Col, Tag, DatePicker } from 'antd';
import Project from '@/components/widgetsList/Project'
import TeamProgress from '@/components/widgetsList/Progress'
import PaymentRecordChart from '@/components/widgetsCharts/PaymentRecordChart'
import SiteOverviewStatistics from '@/components/widgetsStatistics/SiteOverviewStatistics'
import TasksOverviewChart from '@/components/widgetsCharts/TasksOverviewChart'
import SalesMiscellaneous from '@/components/widgetsMiscellaneous/SalesMiscellaneous'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import { projectsDataTwo } from '@/utils/fackData/projectsDataTwo'
import ModaleFactureVisualization from '@/components/composantsFacture/ModaleFactureVisualization'
import '../components/css/QuickLinks.css';

const fetchDataFactures = async (vale) => {

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/listeFacture/${vale}`);
   console.log('MOUKO MOUKO')
      return response.data; // Retourne les données directement
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
      return null; // Retourne null en cas d'erreur
    }
};



const fetchDataGraphCircle = async (vale) => {
    try {
      const dataGraph = await axios.get(`${import.meta.env.VITE_API_URL}/dataGraphCircle/${vale}`);
      return dataGraph.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

 


const fetchParamétrages = async (data) => {
 
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/parametrage-facturation/${data}`);
         return response.data.data
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres :', error);
    } 
};

 
const fetchAlerts = async (vale, vale2) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/alertesprogrammee/${vale}/${vale2}`);
  
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
  const fetchNumeroFacture = async (vale) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/numerofacture/${vale}`);
      return response.data.nume_fact;
    } catch (error) {
      console.error("Erreur lors de la récupération du numéro de facture :", error);
      return null;
    }
  };


const fetchDataGraph = async (vale) => {
    try {
      const dataGraph = await axios.get(`${import.meta.env.VITE_API_URL}/dataGraphiqueFacture/${vale}`);
      return dataGraph.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
};
  

 

  


const Home = () => {
    const { id, societe_id, token, logout  } = useAuth(); 
    const navigate = useNavigate(); 
 
  
    const [clientList, setClientList] = useState([]);
    const [suppression, setSuppression] = useState(0);
    const [invoices, setInvoices] = useState([]);
    const factureRef = useRef();
    const [searchTerm, setSearchTerm] = useState(''); // État pour la barre de recherche
    const [dateRange, setDateRange] = useState(null); // État pour la plage de dates
    const [statusFilter, setStatusFilter] = useState('all'); // État pour le statut
    const [filters, setFilters] = useState({ name: '', city: '' });
 
    const [entryMode, setEntryMode] = useState('TTC'); // Mode de saisie : 'TTC' ou 'HT'
    const formRef = useRef(null);
    const [parametrage, setParametrage] = useState([])
    const [devise, setDevise] = useState('');
    const [salesDataGraph, setsalesDataGraph] = useState([]);
    const [alertes, setAlertes] = useState([]);
      const [loading, setLoading] = useState(true); // État pour suivre le chargement
      const [facturesRetard, setFacturesRetard] = useState([])
      const [salesDataGraphCircle, setsalesDataGraphCircle] = useState([]);
      const [societes, setSocietes] = useState([]);
    
    // États pour la modal facture
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState(null);



 

    const recuperationAlerte = async () => {
        const alert = await fetchAlerts(id, societe_id)
        setAlertes(alert)
        console.log('Mes alertes', alertes);
    }

    const recuperationParametrage = async (vale) =>{
 
      const para = await fetchParamétrages(vale)
      setParametrage(para)
    }

    // Fonction pour ouvrir la modal avec une facture (pour activités récentes)
    const openFactureModal = (facture) => {
        setSelectedFacture(facture);
        setModalVisible(true);
    };

    // Fonction pour fermer la modal
    const closeFactureModal = () => {
        setModalVisible(false);
        setSelectedFacture(null);
    };

    // Fonction pour rediriger vers la page factures avec facture sélectionnée (pour factures en retard)
    const redirectToFacturePage = (facture) => {
        // Redirection vers la page factures avec l'ID de la facture en paramètre
        navigate(`/facturation/factures?highlight=${facture.id}`, { 
            state: { 
                selectedFactureId: facture.id,
                openVisualization: true 
            } 
        });
    };

    useEffect(() => {
 
        const test = async () =>{
            let data = await fetchDataFactures(id);
            setFacturesRetard(data.filter(facture => facture.retard > 0));
            setSocietes(data);
            console.log('TOTAL LET ', data)
            const statusDa = await fetchDataGraphCircle(id);
            if(statusDa) setsalesDataGraphCircle(statusDa);
            const dataGraph = await fetchDataGraph(id);
            if(dataGraph) setsalesDataGraph(dataGraph.chartOptions);
            console.log('test moukos ',dataGraph.chartOptions)
         
        }
 
        test()
        recuperationAlerte()
        recuperationParametrage(id)
    
    }, []);


    const columns = [
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: type => type === 'DEVI' ? 'Devis' : 'Facture'
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date'
      },
      {
        title: 'Montant'  ,
        dataIndex: 'totalAmount',
        key: 'totalAmount'
      },
      {
        title: 'Statut',
        dataIndex: 'statut',
        key: 'statut',
        render: statut => {
          let color = 'default';
          switch (statut.toLowerCase()) {
            case 'accepté':
              color = 'green';
              break;
            case 'en attente':
              color = 'orange';
              break;
            case 'payée':
              color = 'blue';
              break;
            default:
              color = 'default';
          }
          return <Tag color={color}>{statut}</Tag>;
        }
      }
    ];
    
    return (
        <>
        {/*
            <PageHeader >
                            header home
            </PageHeader>
        */}
            <div className='main-content'>
                {/* Liens rapides */}
                <div className="quick-links-section">
                    <h6 className="mb-3">
                        <i className="fas fa-rocket me-2"></i>
                        Accès rapide
                    </h6>
                    <div className="row">
                        <div className="col-lg-3 col-md-6 col-6 mb-3">
                            <div 
                                className="quick-link-card"
                                onClick={() => navigate('/facturation/devis')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="quick-link-icon bg-info">
                                    <i className="fas fa-file-alt"></i>
                                </div>
                                <div className="quick-link-text">Devis</div>
                            </div>
                        </div>
                        
                        <div className="col-lg-3 col-md-6 col-6 mb-3">
                            <div 
                                className="quick-link-card"
                                onClick={() => navigate('/facturation/factures')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="quick-link-icon bg-success">
                                    <i className="fas fa-file-invoice-dollar"></i>
                                </div>
                                <div className="quick-link-text">Factures</div>
                            </div>
                        </div>
                        
                        <div className="col-lg-3 col-md-6 col-6 mb-3">
                            <div 
                                className="quick-link-card"
                                onClick={() => navigate('/facturation/clients')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="quick-link-icon bg-primary">
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className="quick-link-text">Clients</div>
                            </div>
                        </div>
                        
                        <div className="col-lg-3 col-md-6 col-6 mb-3">
                            <div 
                                className="quick-link-card"
                                onClick={() => navigate('/facturation/parametrage')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="quick-link-icon bg-secondary">
                                    <i className="fas fa-cog"></i>
                                </div>
                                <div className="quick-link-text">Paramétrage facturation</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <SiteOverviewStatistics parametrage={parametrage} />
                    <PaymentRecordChart salesDataGraph={salesDataGraph} />
                    <Schedule 
                        facturesRetard={facturesRetard} 
                        title={"Factures en retard"} 
                        onFactureClick={redirectToFacturePage}
                    />
                    <Col xs={22} md={8}>
                    <Card
                        title="Activités recentes"
                        style={{ height: '470px' }}
                        bodyStyle={{ height: 'calc(100% - 56px)', padding: '16px', overflowY: 'auto' }}
                      >
                        <Table
                          dataSource={societes}
                          columns={columns}
                          rowKey="id"
                          pagination={false}
                          locale={{ emptyText: 'Aucune donnée à afficher' }}
                          size="small"
                          onRow={(record) => ({
                            onClick: () => {
                              console.log('Activité récente cliquée :', record);
                              openFactureModal(record);
                            },
                            style: { cursor: 'pointer' }
                          })}
                        />

                      </Card>
                    </Col>
                    <LatestLeads alertes={alertes} title={"Alertes"} />
                     
               
                </div>
            </div>
            <Footer />
            
            {/* Modal pour visualiser la facture */}
            <ModaleFactureVisualization
                visible={modalVisible}
                onClose={closeFactureModal}
                facture={selectedFacture}
                parametrage={parametrage}
                tvas={[]} // Vous pouvez ajouter les données TVA si nécessaire
            />
        </>
    )
}

export default Home