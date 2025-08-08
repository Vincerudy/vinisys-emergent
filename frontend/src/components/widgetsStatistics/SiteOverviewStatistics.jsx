import React, {useState, useEffect} from 'react'
import axios from 'axios';
import { useAuth } from '../../contexte/AuthContext';


const fetchDataFactures = async (id) => {

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/listeFacture/${id}`);
   console.log('response.data ', response.data)
      return response.data; // Retourne les données directement
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
      return null; // Retourne null en cas d'erreur
    }
  };


const SiteOverviewStatistics = ({parametrage}) => {
    const { id, societe_id } = useAuth();
 
    const [devise, setDevise] = useState('');
    const [invoiceCount, setInvoiceCount] = useState(0);
    const [clientCount, setClientCount] = useState(0);
    const [salesDataGraph, setsalesDataGraph] = useState([]);
    const [salesDataGraphCircle, setsalesDataGraphCircle] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [tvaDue, setTvaDue] = useState("");
    const [total_attente, setTotal_attente] = useState('');
    const [total_retard, settotal_retard] = useState('');
    const [facturesRetard, setFacturesRetard] = useState([])
    const [chiffreAffaire, setChiffreAffaire] = useState("");
 
    useEffect(() => {
        const obtenirFactures = async () => {
          const tva = await axios.get(`${import.meta.env.VITE_API_URL}/dashbordData?id=${id}`);
          console.log('tva', tva)
          setTvaDue(tva?.data[0]?.tva_due || 0)
          setChiffreAffaire(tva?.data[0]?.chiffre_affaire || 0)
          setTotal_attente(tva?.data[0]?.total_attente || 0)
          settotal_retard(tva?.data[0]?.total_retard || 0)
          const data = await fetchDataFactures(id); 
          if (!data || data.length === 0) return;
          setFacturesRetard(data.filter(facture => facture.retard > 0));
    
          setDevise(data?.[0]?.devise || 'EUR');
          setInvoiceCount(data.length); 
          //setTotalAmount(data.reduce((acc, invoice) => acc + parseFloat(invoice.totalAmount), 0));
    
          //const client = await fetchDataClient(id);
          //if (client) setClientCount(client.length);
    
          //const dataGraph = await fetchDataGraph(id);
          //if(dataGraph) setsalesDataGraph(dataGraph);
    //
          //const statusDa = await fetchDataGraphCircle(id);
          //if(statusDa) setsalesDataGraphCircle(statusDa);
    //
          //const monthlyData = await fetchMonthlySales(id);
          //setMonthlySales(monthlyData); // Graphique des ventes mensuelles
     
        };
    
        obtenirFactures();
      }, [id]);
    return (
        <>
                    <div   className="col-xxl-3 col-md-6">
                        <div style={{backgroundColor: "#dffadf"}}  className="card stretch stretch-full short-info-card">
                            <div className="card-body">
                                <div className="d-flex align-items-start justify-content-between mb-4">
                                    <div className="d-flex gap-4 align-items-center">
                                        <div>
                                            <div className="fs-4 fw-bold text-dark">
                                             
                                                <span className="counter">{(chiffreAffaire || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <h3 className="fs-13 fw-semibold text-truncate-1-line">Chiffre d'affaire</h3>
                                        </div>
                                        <div className="avatar-text avatar-lg bg-gray-200 icon">
                                            {devise}
                                        </div>
 
                                    </div>
                                </div>
 
                            </div>
                        </div>
                    </div>
                    <div   className="col-xxl-3 col-md-6">
                        <div style={{backgroundColor: "#E2F7FF"}}  className="card stretch stretch-full short-info-card">
                            <div className="card-body">
                                <div className="d-flex align-items-start justify-content-between mb-4">
                                    <div className="d-flex gap-4 align-items-center">
                                        <div>
                                            <div className="fs-4 fw-bold text-dark">
                                             
                                                <span className="counter">{total_attente.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <h3 className="fs-13 fw-semibold text-truncate-1-line">En attente</h3>
                                        </div>
                                        <div className="avatar-text avatar-lg bg-gray-200 icon">
                                            {devise}
                                        </div>
   
                                    </div>
                                </div>
 
                            </div>
                        </div>
                    </div>
                    <div   className="col-xxl-3 col-md-6">
                        <div style={{backgroundColor: "#FFF2F4"}} className="card stretch stretch-full short-info-card">
                            <div className="card-body">
                                <div className="d-flex align-items-start justify-content-between mb-4">
                                    <div className="d-flex gap-4 align-items-center">
                                        <div>
                                            <div className="fs-4 fw-bold text-dark">
                                             
                                                <span className="counter">{total_retard}</span>
                                            </div>
                                            <h3 className="fs-13 fw-semibold text-truncate-1-line">En retard</h3>
                                        </div>
                                        <div className="avatar-text avatar-lg bg-gray-200 icon">
                                           {devise}
                                        </div>
            
                                    </div>
                                </div>
 
                            </div>
                        </div>
                    </div>
                    <div   className="col-xxl-3 col-md-6">
                        <div style={{backgroundColor: "#FFF4E0"}} className="card stretch stretch-full short-info-card">
                            <div className="card-body">
                                <div className="d-flex align-items-start justify-content-between mb-4">
                                    <div className="d-flex gap-4 align-items-center">
                                    <div>
                                        <h3 className="fs-13 fw-semibold text-truncate-1-line">{parametrage?.vatLabel || 'TVA'} Due</h3>
                                            <div className="fs-4 fw-bold text-dark">
                                             
                                                <span className="counter">{tvaDue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
 
                                        </div>
                                        <div className="avatar-text avatar-lg bg-gray-200 icon">
                                            {devise}
                                        </div>
           
                                    </div>
                                </div>
 
                            </div>
                        </div>
                    </div>
                    
                    
        </>
    )
}

export default SiteOverviewStatistics

