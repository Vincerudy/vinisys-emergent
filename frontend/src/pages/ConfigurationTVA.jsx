import React, { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  Row,
  Col,
  Button,
  message,
  Typography,
  Alert,
  Input,
  InputNumber,
} from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';

const { Text, Title } = Typography;

const SortableItem = ({ tva, handleChangeLibelle, handleChangeTaux, handleToggleActive, handleToggleTaxeSecondaire }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tva.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        styles={{ padding: 16, display: 'flex', alignItems: 'center' }}
        style={{
          boxShadow: isDragging
            ? '0 0 8px rgba(24, 144, 255, 0.6)'
            : '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: 8,
          marginBottom: 16,
          userSelect: 'none',
        }}
      >
        <div
          {...listeners}
          {...attributes}
          style={{
            width: 24,
            height: 24,
            backgroundColor: '#3454d1',
            borderRadius: 4,
            cursor: 'grab',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontWeight: 'bold',
            marginRight: 16,
            userSelect: 'none',
          }}
          aria-label="Drag handle"
          title="Glisser pour déplacer"
        >
          ☰
        </div>

        <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ flex: 1 }}>
          <Col xs={24} md={5}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={{ marginRight: 8, whiteSpace: 'nowrap' }}>Libellé :</Text>
              <Input
                value={tva.libelle}
                onChange={(e) => handleChangeLibelle(tva.id, e.target.value)}
                style={{ flex: 1 }}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </Col>

          <Col xs={24} md={5}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={{ marginRight: 8, whiteSpace: 'nowrap' }}>Taux :</Text>
              <InputNumber
                min={0}
                max={100}
                value={tva.taux}
                onChange={(value) => handleChangeTaux(tva.id, value)}
                formatter={(value) => `${value} %`}
                parser={(value) => parseFloat(value.replace(' %', ''))}
                style={{ flex: 1 }}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </Col>

          <Col xs={24} md={4}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={{ marginRight: 8, whiteSpace: 'nowrap' }}>Actif :</Text>
              <Switch
                checked={tva.active === 'O'}
                onChange={() => handleToggleActive(tva.id)}
                checkedChildren="OUI"
                unCheckedChildren="NON"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </Col>

          <Col xs={24} md={6}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={{ marginRight: 8, whiteSpace: 'nowrap' }}>Taxe secondaire :</Text>
              <Switch
                checked={tva.taxe_secondaire === 'OUI'}
                onChange={() => handleToggleTaxeSecondaire(tva.id)}
                checkedChildren="OUI"
                unCheckedChildren="NON"
                onClick={e => e.stopPropagation()}
                style={{ 
                  backgroundColor: tva.taxe_secondaire === 'OUI' ? '#52c41a' : '#d9d9d9'
                }}
              />
            </div>
          </Col>

          <Col xs={24} md={2}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#3454d1',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                userSelect: 'none',
                marginLeft: 'auto',
              }}
            >
              {tva.ordre}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

const ConfigurationTVA = () => {
    const { societe_id } = useAuth();
 

  const [tvas, setTvas] = useState([]);

  useEffect(() => {
    const fetchTvaData = async () => {
      try {
        // 1. Initialiser la TVA
        const initResponse = await axios.get(`${import.meta.env.VITE_API_URL}/init-tva/${societe_id}`);
        console.log('Réponse init TVA :', initResponse.data);

        // 2. Une fois init terminée, récupérer la liste des TVA
        const listResponse = await axios.get(`${import.meta.env.VITE_API_URL}/tva/liste/${societe_id}`);
        console.log('Liste des TVA:', listResponse.data);
        setTvas(listResponse.data);
      } catch (error) {
        console.error('Erreur lors de l’appel à init-tva ou tva/liste :', error);
      }
    };

    if (societe_id) {
      fetchTvaData();
    }
  }, [societe_id]);

  const handleToggleActive = (id) => {
    setTvas((prev) =>
      prev.map((tva) =>
        tva.id === id ? { ...tva, active: tva.active === 'O' ? 'N' : 'O' } : tva
      )
    );
  };

  const handleChangeLibelle = (id, newValue) => {
    setTvas((prev) =>
      prev.map((tva) => (tva.id === id ? { ...tva, libelle: newValue } : tva))
    );
  };

  const handleChangeTaux = (id, newValue) => {
    setTvas((prev) =>
      prev.map((tva) => (tva.id === id ? { ...tva, taux: newValue } : tva))
    );
  };

  const handleToggleTaxeSecondaire = (id) => {
    setTvas((prev) =>
      prev.map((tva) => {
        if (tva.id === id) {
          // Si on active cette TVA comme taxe secondaire
          const newValue = tva.taxe_secondaire === 'OUI' ? 'NON' : 'OUI';
          return { ...tva, taxe_secondaire: newValue };
        } else if (tva.taxe_secondaire === 'OUI') {
          // Désactiver toutes les autres TVA comme taxe secondaire
          return { ...tva, taxe_secondaire: 'NON' };
        }
        return tva;
      })
    );
  };

  const sendTVAToBackend = async () => {
    try {
      const payload = tvas.map((tva) => ({
        ...tva,
        ordre: tva.ordre,
        societe_id: societe_id,
      }));
      console.log('payload ', payload);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tva/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l’envoi au serveur');
      }

      const data = await response.json();
      console.log('Réponse du serveur :', data);
      message.success('Configuration TVA enregistrée avec succès');
    } catch (error) {
      console.error(error);
      message.error('Échec de l’enregistrement de la configuration TVA');
    }
  };

  const handleSave = () => {
    sendTVAToBackend();
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tvas.findIndex((item) => item.id === active.id);
      const newIndex = tvas.findIndex((item) => item.id === over.id);
      const newTvas = arrayMove(tvas, oldIndex, newIndex).map((tva, idx) => ({
        ...tva,
        ordre: idx + 1,
      }));
      setTvas(newTvas);
    }
  };

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Configuration des TVA
      </Title>

      <Alert
        message="Information"
        description="Vous pouvez activer plusieurs TVA simultanément si besoin, ou désactiver toutes les TVA si votre entreprise n'est pas assujettie à la TVA. Vous pouvez glisser déposer chaque ligne pour changer l'ordre en maintenant la ligne par l'icone bleu."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <Button type="primary" onClick={handleSave}>
          Sauvegarder
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tvas.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tvas
            .sort((a, b) => a.ordre - b.ordre)
            .map((tva) => (
              <SortableItem
                key={tva.id}
                tva={tva}
                handleChangeLibelle={handleChangeLibelle}
                handleChangeTaux={handleChangeTaux}
                handleToggleActive={handleToggleActive}
                handleToggleTaxeSecondaire={handleToggleTaxeSecondaire}
              />
            ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ConfigurationTVA;
