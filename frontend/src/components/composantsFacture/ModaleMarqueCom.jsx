import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, InputNumber, Row, Col } from 'antd';
import trash from '../../assets/trash.png'
import dayjs from 'dayjs';
import './css/ModaleMarqueCom.css';
import axios from 'axios';
import { useAuth } from '../../contexte/AuthContext';
const { Option } = Select;


const ModaleMarqueCom = ({ factures, onSave, formRef, devise, onSuccess }) => {
  const { id, societe_id, token, logout  } = useAuth();
  const [form] = Form.useForm();
   
  const [montantPaye, setMontantPaye] = useState(0);
  const [modesPaiement, setModesPaiement] = useState([{ mode: '', montant: 0 }]); // Initialisation avec un seul mode de paiement
  console.log('FACTURE ID ', factures.id)

  
  const fetchModeReglement = async () => {
    if (!factures?.id) {
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/lectureModeReglement/${factures.id}`);

      if (response.status === 200 && response.data?.data && response.data.data.length > 0) {
        // Si des données sont disponibles, on les utilise
        setModesPaiement(response.data.data);
        const lastPayment = response.data.data.find(payment => payment.is_last_payment === 1);
        if (lastPayment) {
          setMontantPaye(parseFloat(lastPayment.montant));
        }
        console.log("Données récupérées :", response.data);
      } else {
        // Si aucune donnée n'est récupérée, on initialise à [{ mode: '', montant: 0 }]
        setModesPaiement([{ mode: '', montant: 0 }]);
        console.log("Aucune donnée récupérée, initialisation par défaut.");
      }
    } catch (error) {
      console.log("Erreur lors de la récupération des modes de règlement :", error);
      // Initialisation par défaut en cas d'erreur
      setModesPaiement([{ mode: '', montant: 0 }]);
    }
  };
 

  useEffect(() => {  
    fetchModeReglement();
  }, [factures.id]);
  
const montants = modesPaiement
.filter(mode => !mode.hasOwnProperty('is_last_payment')) // Filtrer les objets sans `is_last_payment`
.map(mode => mode.montant); 

console.log('MOMOM', montants);


  const handleSubmit = async (values) => {
 
    try {
      // Préparation des données à envoyer
      const payload = {
        factureNumber: factures.invoiceNumber,
        client: factures.client,
        encaissementDate: values.encaissementDate ? values.encaissementDate.format('YYYY-MM-DD') : null, // Assurez-vous que la date soit bien formatée
        modesPaiement: modesPaiement
          .filter(mode => !mode.hasOwnProperty('is_last_payment')) // Filtrer les objets sans `is_last_payment`
          .map(mode => ({
            mode: mode.mode,
            montant: mode.montant_paye
          })),
        Montant_total: factures.totalAmount,
        totalPaye: montantPaye,
        resteAPayer: parseFloat(totalFacture) - parseFloat(montantPaye)
      };
      
  
      console.log('Données envoyées:', payload);  // Afficher les données pour débogage
  
      // Envoi des données à la route /transformeFacture
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/reglement/${societe_id}/${id}`, payload);
      
      // Gérer la réponse du serveur
      if (response.status === 200 || response.status === 201) {
        onSave?.(); // Si tu veux le garder
        onSuccess?.(); // ← Ajout ici !
        fetchModeReglement()
        console.log('Facture transformée avec succès:', response.data);
      } else {
        console.error('Erreur lors de la transformation de la facture', response);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des données:', error);
    }
  };

  const handleModePaiementChange = (index, value) => {
    const newModesPaiement = [...modesPaiement];
    newModesPaiement[index].mode = value;
    setModesPaiement(newModesPaiement);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString); // Convertir la chaîne en objet Date
  
    const day = String(date.getDate()).padStart(2, '0'); // Ajouter un zéro devant si nécessaire
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0, donc on ajoute 1
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`; // Formater au format DD/MM/YYYY
  };
  
 
 const handleMontantChange = (index, value) => {
  const newModesPaiement = [...modesPaiement];
 
  
  // Assurer que le montant est un nombre valide
  
  newModesPaiement[index].montant_paye = isNaN(value) ? 0 : value;
  
  setModesPaiement(newModesPaiement);
 
  // Calculer le montant payé avec la somme des montants
  calculateMontantPaye(newModesPaiement);
};

const calculateMontantPaye = (updatedModesPaiement = []) => {
  console.log('updatedModesPaiement', updatedModesPaiement);
  
  if (!Array.isArray(updatedModesPaiement)) {
    setMontantPaye(0);
    return;
  }
  
  // Convertir et additionner correctement les montants
  const total = updatedModesPaiement.reduce((sum, mode) => {
    const montant = parseFloat(mode.montant_paye);  // Assurer la conversion en nombre
    return sum + (isNaN(montant) ? 0 : montant);
  }, 0);

  console.log('Montant total calculé:', total); // Vérifier le calcul
  
  setMontantPaye(total);
};


  

  const handleAddModePaiement = () => {
    setModesPaiement([...modesPaiement, { mode: '', montant: 0 }]); // Ajout d'un nouveau mode de paiement
  };

  const handleDeleteModePaiement = (index) => {
    const newModesPaiement = modesPaiement.filter((_, i) => i !== index); // Suppression du mode de paiement à l'index donné
    setModesPaiement(newModesPaiement);
    calculateMontantPaye(newModesPaiement);
  };

  const totalFacture = parseFloat(factures.totalAmount); // Montant total de la facture
  // Trouver le paiement où is_last_payment === 1

// Affecter la valeur de montant à une constante si le paiement existe
   
  const resteDu = totalFacture - montantPaye;
 

  return (
    <div className="marquer-facture-paye" style={{ backgroundColor: '#fff' }}>
        <div  style={{ backgroundColor: '#cce5ff', lineHeight: '1', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{color: '#004085'}}>Marquer comme Payé</h2>
            <p style={{color: '#004085'}}>Facture n° <strong>{factures.invoiceNumber}</strong> de <strong>{factures.client}</strong></p>
        </div>
      <Form
      key={factures?.id || 'new'}
       onFinish={handleSubmit} 
       ref={formRef}
        form={form}
 
        layout="vertical"
        initialValues={{
          factureNumber: factures.invoiceNumber,
          client: factures.client,
          encaissementDate: null,
          montantPaye: 0,
        }}
        style={{ backgroundColor: '#fff', padding: '20px' }}
      >
 

        <Form.Item initialValues={{ encaissementDate: dayjs() }} name="encaissementDate">
          <Row>
            <Col span={12}>
            <Form.Item
                className='DateEncaissement' 
                name="encaissementDate" 
                initialValue={dayjs()} // On initialise la date avec dayjs()
                label="Date d'Encaissement"
                rules={[{ required: true, message: 'Veuillez entrer une date' }]}
            >
                <DatePicker format="DD-MM-YYYY" />
            </Form.Item>
            </Col>
          </Row>
        </Form.Item>

 
        {modesPaiement.map((mode, index) => (
     
          <Row gutter={16} key={index} style={{ marginBottom: 8 }}>
            <Col span={mode.is_last_payment == 1 || mode.is_last_payment == 0 ? 24 : 12}>
            {mode.is_last_payment == 1 || mode.is_last_payment == 0 ? 
              <div style={{ width:  window.innerWidth <= 768 ?  '100%' : ""}} className='nodePaiementEnregistre'>
                <p><span className='textDate'>Payé {mode.mode == 'espece' ? 'en' : 'par'}  </span> {mode.mode} <span className='textDate'> le {formatDate(mode.dat)}</span></p> 
              
                <p>{mode.montant_paye} {devise}</p> 

              </div>

              : 
              <Form.Item

                label={`Mode de Paiement ${index + 1}  ` }
                name={`modePaiement${index}`}
                rules={[{ required: true, message: 'Veuillez sélectionner un mode de paiement' }]}
              >
                            
                <Select
                  placeholder="Sélectionnez un mode de paiement"
                  style={{ width: '100%' }}
                  value={mode.mode}
                  onChange={(value) => handleModePaiementChange(index, value)}
                >
                    
                  <Option value="carteBancaire">Carte bancaire</Option>
                  <Option value="espece">Espèce</Option>
                  <Option value="cheque">Chèque</Option>
                  <Option value="virement">Virement</Option>
                  <Option value="autre">Autre</Option>
                </Select>

              </Form.Item>
            }
            
            </Col>
            {mode.is_last_payment == 1 || mode.is_last_payment == 0 ? "":
            <Col span={10}>
              <Form.Item
                label={`Montant Payé ${index + 1}`}
                name={`montantPaye${index}`}
                rules={[{ required: true, message: 'Veuillez entrer un montant payé' }]}
              >
                <InputNumber
                  min={0}
                  value={mode.montant}
                  onChange={(value) => handleMontantChange(index, value)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            }
           {mode.is_last_payment == 1 || mode.is_last_payment == 0 ? "": 
            <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button 
                type="danger" 
                icon={<img src={trash} alt="client" style={{height: '30px'}}/>}
                shape="circle" 
                onClick={() => handleDeleteModePaiement(index)} 
              />
            </Col>
            }
          </Row>
        ))}

        {/* Bouton pour ajouter un mode de règlement supplémentaire */}
        <Row>
          <Col span={8}>
            {/* Condition pour masquer le bouton si le reste à payer est égal à 0 */}
            {resteDu > 0 && (
              <Button type="dashed" onClick={handleAddModePaiement} style={{ width: '100%' }}>
                Ajouter un Mode
              </Button>
            )}
          </Col>
        </Row>

        {/* Bouton pour marquer la facture comme payée */}
      </Form>

      {/* Bloc d'informations sur la facture */}
        <div className='resumeFacture'>
          <div className='BlocResume'> 
            <h4 className='fontSize'>Résumé de la Facture</h4>
            <div className='fontSizeTexte'><strong>Montant Total:</strong> {totalFacture.toFixed(2)} {devise}</div>
            <div><strong>Total Payé:</strong> {parseFloat(montantPaye || 0).toFixed(2)} {devise}</div>
            <div><strong>Reste à Payer:</strong> {resteDu.toFixed(2)} {devise}</div>
          </div>
        </div>
    </div>
  );
};

export default ModaleMarqueCom;
