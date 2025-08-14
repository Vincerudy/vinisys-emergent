import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button, Tag, List, Avatar, Typography, message, Select, Input, Steps } from "antd";
import '../css//TicketDetail.css'
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import { useAuth } from '../../contexte/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;


const TicketDetailMaintenance = () => {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

 

  const [newMessage, setNewMessage] = useState("");
 
  const [ticketState, setTicketState] = useState({
    status: 'En attente', // valeur par défaut souhaitée
    conversation: [],
    title: '',
    reason: '',
    description: '',
  });
  const [editDescription, setEditDescription] = useState('');

  const getTicketById = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
          headers: {

            'Authorization': `Bearer ${token}`,  // << inclure le token ici
          },
          withCredentials: true,  // <-- c'est ça qui envoie les cookies de session
      });
  
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du ticket :', error);
      throw error;
    }
  };
 

  const conversationEndRef = useRef(null);

  const loadConversation = async (ticket_id, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/message/${ticket_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
  
      const messages = response.data;
  
      setTicketState(prev => ({
        ...prev,
        conversation: messages,
      }));
    } catch (error) {
      console.error('Erreur chargement conversation :', error);
    }
  };

  

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTicketById(id);
        setTicketState(data);
        setEditDescription(data.description || '');
      } catch (error) {
        message.error("Impossible de charger le ticket.");
      } finally {
        setLoading(false);
      }
    };

    if(id){
        fetchTicket();
    }

  }, [id]);

  useEffect(() => {
    if (Array.isArray(ticketState.conversation) && conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticketState.conversation]);
  
useEffect(() => {
  if (ticketState?.id) {
    loadConversation(ticketState.id, token);
  }
}, [ticketState?.id]);
 

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;
  
    const newMsgObj = {
      parent_id: Date.now().toString(),  // ID temporaire côté client
      from: "Support",
      message: newMessage.trim(),
      date: new Date().toLocaleString(), // date côté client pour affichage immédiat
      ticket_id: ticketState.id,
    };
  
    // Mise à jour optimiste de l'affichage
    setTicketState(prev => ({
      ...prev,
      conversation: [...(prev.conversation || []), newMsgObj]
    }));
  
    setNewMessage(""); // vide le champ input

    console.log(' newMsgObj ', newMsgObj)
  
    try {
      // Envoi vers l'API
      await axios.post(
        `${import.meta.env.VITE_API_URL}/message/insert`,
        {
          ticket_id: newMsgObj.ticket_id,
          from: newMsgObj.from,
          message: newMsgObj.message,
          parent_id: newMsgObj.parent_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      // Optionnel : tu pourrais rafraîchir la conversation côté client ici
      // pour récupérer l'ID réel en base ou éviter un décalage
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      // En cas d'erreur, tu pourrais aussi retirer le message affiché (rollback UI) ou afficher une erreur
    }
  };
  

  const handleSaveDescription = async () => {
    try {
      const payload = {
        title: ticketState.title,
        description: editDescription,
        reason: ticketState.reason,
        status: ticketState.status,
      };

      // Mise à jour locale immédiate
      setTicketState((prev) => ({
        ...prev,
        description: editDescription,
      }));
      console.log('Payload envoyé à l’API :', payload);

      // Envoi vers le backend
      if(id){
        await axios.post(
            `${import.meta.env.VITE_API_URL}/tickets/update/${id}`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              withCredentials: true,
            }
        );
      }
      else{
        await axios.post(
            `${import.meta.env.VITE_API_URL}/tickets/create`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              withCredentials: true,
            }
        );
      }

      message.success("Description mise à jour");
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      message.error("Erreur lors de la mise à jour de la description");
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  return (
    <div className="ticket-container">
      {/* Colonne gauche */}
      <div className="ticket-left-column">
      <Input
          value={ticketState.title}
          disabled={ticketState.status === 'En cours' || ticketState.status == 'Terminé' } 
          onChange={(e) => setTicketState((prev) => ({ ...prev, title: e.target.value }))}
          style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}
          placeholder="Titre du ticket"
        />

        {/* Select pour le motif */}
        <div style={{ marginBottom: 16 }}>
          <Text strong>Motif :</Text>
          <Select
            value={ticketState.reason}
            readOnly={ticketState.status === 'En cours' || ticketState.status == 'Terminé' } 
            onChange={(value) => setTicketState((prev) => ({ ...prev, reason: value }))}
            style={{ width: '100%', marginTop: 4 }}
            options={[
              { value: 'Assistance', label: 'Assistance' },
              { value: 'Anomalie', label: 'Anomalie' },
            ]}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
  <Text strong>Statut :</Text>
  <Steps
    current={
      ticketState.status === "En attente"
        ? 0
        : ticketState.status === "En cours"
        ? 1
        : 2
    }
    onChange={(currentStep) => {
      if (ticketState.status === "Terminé") {
        return; // Blocage si l'étape est déjà "Terminé"
      }

      const statusLabels = ["En attente", "En cours", "Terminé"];
      const currentStatusIndex = statusLabels.indexOf(ticketState.status);

      if (currentStep === 2 && currentStatusIndex < 1) {
        message.warning("Vous devez d'abord passer par 'En cours' avant de terminer.");
        return;
      }

      const newStatus = statusLabels[currentStep];
      setTicketState((prev) => ({ ...prev, status: newStatus }));
    }}
    style={{ marginTop: 8 }}
    items={[
      {
        title: "En attente",
        icon: ticketState.status === "En attente" ? (
          <div style={{
            backgroundColor: '#1890ff',
            borderRadius: '50%',
            color: 'white',
            width: 30,
            height: 30,
            fontSize: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>1</div>
        ) : undefined
      },
      {
        title: "En cours",
        icon: ticketState.status === "En cours" ? (
          <div style={{
            backgroundColor: '#52c41a',
            borderRadius: '50%',
            color: 'white',
            width: 30,
            height: 30,
            fontSize: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>2</div>
        ) : undefined
      },
      {
        title: "Terminé",
        icon: ticketState.status === "Terminé" ? (
          <div style={{
            backgroundColor: '#ff4d4f',
            borderRadius: '50%',
            color: 'white',
            width: 35,
            height: 35,
            fontSize: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>3</div>
        ) : undefined
      },
    ]}
  />
</div>



        <div className="ticket-description">
          <ReactQuill
            theme="snow"
            readOnly={ticketState.status === 'En cours' || ticketState.status == 'Terminé' } 
            value={editDescription}
            onChange={setEditDescription}
            modules={modules}
          />
          {ticketState.status === 'En cours' || ticketState.status == 'Terminé' ? '' : 
            <Button
              type="primary"
              onClick={handleSaveDescription}
              className="ticket-description-button"
            >
              Sauvegarder la description
            </Button>
            }
        </div>

        <Button onClick={() => navigate('/listes/tickets')} style={{ marginTop: "auto" }}>
          Retour
        </Button>

      </div>

      {/* Colonne droite */}
      {id ? 
      <div
        style={{
          flex: "1 1 50%",
          display: "flex",
          flexDirection: "column",
          height: "80vh",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          boxSizing: "border-box",
          backgroundColor: "#fafafa",
        }}
      >
        <Text strong style={{ marginBottom: 12 }}>
          Conversation avec le support :
        </Text>

        <div
          style={{
            flex: "1 1 auto",
            overflowY: "auto",
            marginBottom: 16,
            paddingRight: 8,
          }}
        >
          <List
            dataSource={ticketState.conversation}
            locale={{ emptyText: "Aucun message" }}
            renderItem={(item) => {
              const isClient =  item.from === "client";
              return (
                <List.Item
                  style={{
                    justifyContent: isClient ? "flex-start" : "flex-end",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isClient ? "flex-start" : "flex-end",
                    padding: "8px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 4,
                      gap: 8,
                      flexDirection: isClient ? "row" : "row-reverse",
                    }}
                  >
                    <Avatar
                      style={{
                        backgroundColor: isClient ? "#1890ff" : "#52c41a",
                      }}
                    >
                      {isClient ? "C" : "S"}
                    </Avatar>
                    <Text strong>{isClient ? "Client" : "Support"}</Text>
                  </div>
                  <div
                    style={{
                      backgroundColor: isClient ? "#e6f7ff" : "#f6ffed",
                      padding: 12,
                      borderRadius: 8,
                      maxWidth: 400,
                      whiteSpace: "pre-wrap",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    dangerouslySetInnerHTML={{ __html: item.message }}
                  />
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                    {item.date}
                  </Text>
                </List.Item>
              );
            }}
          />
          <div ref={conversationEndRef} />
        </div>

        {/* Champ de saisie fixé en bas */}
        <div style={{ flexShrink: 0 }}>
          <TextArea
            rows={3}
            placeholder="Écrire une réponse..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ backgroundColor: "#fff" }} // Fond blanc ici
          />
          <Button
            type="primary"
            style={{ marginTop: 8, float: "right" }}
            onClick={handleAddMessage}
            disabled={!newMessage.trim()}
          >
            Envoyer
          </Button>
        </div>
      </div>
      : ''}

    </div>
  );
};

export default TicketDetailMaintenance;
