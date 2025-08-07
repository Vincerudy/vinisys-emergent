import React, { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  Row,
  Col,
  Button,
  Typography,
  Modal,
  Tag,
  message,
  Avatar,
} from 'antd';
import {
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexte/AuthContext';

const { Text, Title } = Typography;

const GestionUtilisateurs = () => {
  const { id, societe_id, token } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [modifications, setModifications] = useState({});
  const navigate = useNavigate();

  // Chargement initial
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}//utilisateurs/liste`, {
          headers: {

            'Authorization': `Bearer ${token}`,  // << inclure le token ici
          },
          withCredentials: true,  // <-- c'est ça qui envoie les cookies de session
        });
        const data = response.data;

        const usersFormatted = data.map(user => ({
          id: Number(user.id),
          nom: user.lastName,
          prenom: user.firstName,
          actif: user.statut === "actif",
          photoUrl: import.meta.env.VITE_API_URL + '/' + user.photoProfil || '',
          autorisations: user.permissions || [],
        }));

        setUtilisateurs(usersFormatted);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs :', error);
        message.error("Impossible de charger les utilisateurs.");
      }
    };

    fetchUsers();
  }, [societe_id]);

  // Toggle actif/inactif et stocker le statut dans modifications
  const toggleActif = (id) => {
    setUtilisateurs(prev =>
      prev.map(user => {
        if (user.id === id) {
          const nouvelActif = !user.actif;
          // Mettre à jour les modifications avec le statut réel (booléen)
          setModifications(prevMods => ({
            ...prevMods,
            [id]: {
              ...prevMods[id],
              statut: nouvelActif
            }
          }));
          return { ...user, actif: nouvelActif };
        }
        return user;
      })
    );
  };

  const supprimerUtilisateur = (id) => {
    Modal.confirm({
      title: 'Confirmation de suppression',
      content: 'Voulez-vous vraiment supprimer cet utilisateur ?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: () => {
        setUtilisateurs(prev => prev.filter(user => user.id !== id));
        message.success('Utilisateur supprimé avec succès.');
      },
    });
  };

  const validerModifications = async () => {
    const idsModifiés = Object.keys(modifications);

    if (idsModifiés.length === 0) {
      message.info('Aucune modification à valider.');
      return;
    }

    console.log('modifications brutes:', modifications);

    const utilisateursModifiés = idsModifiés.map(id => ({
      id,
      ...modifications[id], // doit contenir { statut: ..., role_id: ... } si role_id géré
    }));

    console.log('utilisateursModifiés à envoyer:', utilisateursModifiés);

    try {
      const  modifications = utilisateursModifiés
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/statuts`,
        { modifications }, // données envoyées dans le body
        {
          headers: {
            'Authorization': `Bearer ${token}`, // 🔐 Token JWT
            'Content-Type': 'application/json', // optionnel, par défaut pour JSON
          },
          withCredentials: true, // si tu veux envoyer les cookies (si backend utilise sessions)
        }
      );

      if (response.status === 200) {
        message.success('Modifications validées avec succès.');
        setModifications({});
      } else {
        message.error('Erreur lors de la validation.');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour groupée des statuts :', error);
      message.error('Erreur serveur pendant la validation.');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Gestion des Utilisateurs</Title>
      <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: 24, marginBottom: 30 }}>
        <Button
          type="primary"
          onClick={() => navigate('/societe/roles/user')}
        >
          Ajouter un utilisateur
        </Button>
        <Button
          type="primary"
          onClick={validerModifications}
          disabled={Object.keys(modifications).length === 0}
        >
          Valider les modifications
        </Button>
      </div>

      {utilisateurs.map((user) => (
        <Card
          key={user.id}
          hoverable
          onClick={() => navigate(`/societe/roles/user/${user.id}`)}
          style={{
            marginBottom: 16,
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Row align="middle" gutter={[16, 16]}>
            <Col xs={24} md={2} onClick={e => e.stopPropagation()}>
              <Avatar
                size={48}
                src={user.photoUrl || null}
                icon={!user.photoUrl && <UserOutlined />}
              />
            </Col>

            <Col xs={24} md={5}>
              <Text strong>
                {user.prenom} {user.nom}
              </Text>
            </Col>

            <Col xs={24} md={9}>
              <Text strong>Autorisations :</Text>{' '}
              {user.autorisations.slice(0, 5).map((auth, idx) => (
                <Tag color="blue" key={idx}>{auth}</Tag>
              ))}
              {user.autorisations.length > 5 && <Tag color="default">...</Tag>}
            </Col>

            <Col xs={24} md={4} onClick={e => e.stopPropagation()}>
              <Text strong style={{ marginRight: 8 }}>Actif :</Text>
              <Switch
                checked={user.actif}
                onChange={() => toggleActif(user.id)}
                checkedChildren={<CheckCircleOutlined />}
                unCheckedChildren={<CloseCircleOutlined />}
              />
            </Col>

            <Col xs={24} md={4} style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => supprimerUtilisateur(user.id)}
              >
                Supprimer
              </Button>
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  );
};

export default GestionUtilisateurs;
