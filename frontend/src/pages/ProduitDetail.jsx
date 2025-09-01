import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Descriptions,
  message,
  Input,
  InputNumber,
  Select,
  Modal, 
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import './css/ProduitDetail.css';
import { useAuth } from '../contexte/AuthContext';
import { hasPermission } from '../contexte/permissions';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TVA_OPTIONS = [
  { label: '20%', value: 20 },
  { label: '10%', value: 10 },
  { label: '5.5%', value: 5.5 },
  { label: '2.1%', value: 2.1 },
];

const ProduitDetail = () => {
  const { id } = useParams();
  const { societe_id } = useAuth();
  const navigate = useNavigate();

  const [produit, setProduit] = useState(null);
  const [editedProduit, setEditedProduit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastChangedField, setLastChangedField] = useState(null); // Pour savoir quel champ a été modifié en dernier (HT ou TTC)
  const [categoriesStock, setCategoriesStock] = useState([]);
  const [sousCategoriesStock, setSousCategoriesStock] = useState([]);

  const isNew = !id;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!isNew) {
      fetch(`${API_URL}/produit/${id}/${societe_id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`Erreur ${res.status} lors du chargement du produit`);
          return res.json();
        })
        .then((data) => {
          const produitFormatte = {
            id: data.id,
            nom: data.nom || '',
            description: data.description || '',
            prixUnitaireHT: parseFloat(data.prixUnitaireHT) || 0,
            prixUnitaire: parseFloat(data.prixUnitaire) || 0,
            tva: parseFloat(data.tva) || 20, // Valeur par défaut 20%
            quantiteEnStock: data.quantite_en_stock || 0,
            seuil: data.seuil || 0,
            categorie: data.categorie || '',
            sousCategorie: data.sous_categorie || '',
            categorieId: data.categorie_id || null,
            sousCategorieId: data.sous_categorie_id || null,
            image: data.image_path
              ? `${API_URL}/${data.image_path}`
              : '',
          };
          // Si pas de prixUnitaire mais HT, calculer TTC
          if (!produitFormatte.prixUnitaire && produitFormatte.prixUnitaireHT) {
            produitFormatte.prixUnitaire =
              produitFormatte.prixUnitaireHT * (1 + produitFormatte.tva / 100);
          }
          // Inversement, si TTC mais pas HT
          if (!produitFormatte.prixUnitaireHT && produitFormatte.prixUnitaire) {
            produitFormatte.prixUnitaireHT =
              produitFormatte.prixUnitaire / (1 + produitFormatte.tva / 100);
          }
          setProduit(produitFormatte);
          setEditedProduit({ ...produitFormatte });
          setIsEditing(false);
          setSelectedFile(null);
        })
        .catch((err) => {
          message.error(err.message);
          navigate('/liste-produits');
        });
    } else {
      const nouveauProduit = {
        id: '',
        nom: '',
        description: '',
        prixUnitaireHT: 0,
        prixUnitaire: 0,
        tva: 20,
        quantiteEnStock: 0,
        seuil: 0,
        categorie: '',
        sousCategorie: '',
        categorieId: null,
        sousCategorieId: null,
        image: '',
      };
      setProduit(nouveauProduit);
      setEditedProduit({ ...nouveauProduit });
      setIsEditing(true);
      setSelectedFile(null);
    }
  }, [id, societe_id, isNew, API_URL, navigate]);

  const handleRetour = () => navigate(-1);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProduit({ ...produit });
    setSelectedFile(null);
    setLastChangedField(null);
  };

  const handleSave = async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/produit`;
      const method = 'POST';

      const formData = new FormData();

      if (!isNew) {
        formData.append('id', editedProduit.id);
      }

      formData.append('nom', editedProduit.nom || '');
      formData.append('description', editedProduit.description || '');
      formData.append('prixUnitaireHT', editedProduit.prixUnitaireHT || 0);
      formData.append('prixUnitaire', editedProduit.prixUnitaire || 0);
      formData.append('tva', editedProduit.tva || 20);
      formData.append('quantiteEnStock', editedProduit.quantiteEnStock || 0);
      formData.append('seuil', editedProduit.seuil || 0);
      formData.append('categorie', editedProduit.categorie || '');
      formData.append('sousCategorie', editedProduit.sousCategorie || '');
      formData.append('societeId', societe_id);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur ${response.status} lors de la ${
            isNew ? 'création' : 'mise à jour'
          } du produit`
        );
      }

      message.success(`Produit ${isNew ? 'ajouté' : 'mis à jour'} avec succès`);

      const savedProduit = await response.json();
      setProduit(savedProduit);
      setEditedProduit(savedProduit);
      setIsEditing(false);
      setSelectedFile(null);
      setLastChangedField(null);

      navigate('/liste-produits');
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/produit/delete/${produit.id}/${societe_id}`,
        {
          method: 'POST',
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        // Afficher une modale d'erreur avec le message clair du backend
        Modal.error({
          title: 'Erreur lors de la suppression',
          content: data.error || 'Une erreur est survenue.',
        });
        return;
      }
  
      message.success('Produit supprimé avec succès');
      navigate('/liste-produits');
    } catch (err) {
      Modal.error({
        title: 'Erreur inattendue',
        content: err.message || 'Une erreur est survenue.',
      });
    }
  };

  // Synchronisation HT <-> TTC
  const handlePrixHTChange = (value) => {
    setLastChangedField('HT');
    if (value === null || value === undefined || isNaN(value)) value = 0;
    const tva = editedProduit.tva || 20;
    const ttc = parseFloat((value * (1 + tva / 100)).toFixed(2));
    setEditedProduit((prev) => ({
      ...prev,
      prixUnitaireHT: value,
      prixUnitaire: ttc,
    }));
  };

  const handlePrixTTCChange = (value) => {
    setLastChangedField('TTC');
    if (value === null || value === undefined || isNaN(value)) value = 0;
    const tva = editedProduit.tva || 20;
    const ht = parseFloat((value / (1 + tva / 100)).toFixed(2));
    setEditedProduit((prev) => ({
      ...prev,
      prixUnitaire: value,
      prixUnitaireHT: ht,
    }));
  };

  const handleTVAChange = (value) => {
    const prevTVA = editedProduit.tva || 20;
    if (!value) return;
    setEditedProduit((prev) => {
      let prixUnitaireHT = prev.prixUnitaireHT || 0;
      let prixUnitaire = prev.prixUnitaire || 0;
      if (lastChangedField === 'HT') {
        prixUnitaire = parseFloat((prixUnitaireHT * (1 + value / 100)).toFixed(2));
      } else if (lastChangedField === 'TTC') {
        prixUnitaireHT = parseFloat((prixUnitaire / (1 + value / 100)).toFixed(2));
      } else {
        // Par défaut recalcul TTC à partir HT
        prixUnitaire = parseFloat((prixUnitaireHT * (1 + value / 100)).toFixed(2));
      }
      return {
        ...prev,
        tva: value,
        prixUnitaireHT,
        prixUnitaire,
      };
    });
  };

  const handleChange = (field, value) => {
    setEditedProduit((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!produit || !editedProduit) return null;

  const sousCategories = sousCategoriesDisponibles[editedProduit.categorie] || [];

  return (
    <div className="produit-detail-container">
      <Card
        title={
          <div className='div-btn-produit'>
            <Button icon={<ArrowLeftOutlined />} onClick={handleRetour}>
              Retour
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              {isNew ? 'Ajouter un produit' : produit.nom}
            </Title>
            {isEditing && hasPermission('manage_stock') ? (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  style={{ marginRight: 8 }}
                >
                  Enregistrer
                </Button>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Annuler
                </Button>
              </>
            ) : (
              hasPermission('manage_stock') ?
              <>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  style={{ marginRight: 8 }}
                >
                  Modifier
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  Supprimer
                </Button>
              </>
              : ''
            )}
          </div>
        }
        className="produit-detail-card"
      >
        {isEditing ? (
          <>
            <Descriptions
              bordered
              column={1}
              size="small"
              className="produit-detail-descriptions"
            >
              <Descriptions.Item label="Nom">
                <Input
                  value={editedProduit.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Description">
                <TextArea
                  rows={3}
                  value={editedProduit.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Catégorie">
                <Select
                  value={editedProduit.categorie || undefined}
                  onChange={(value) => {
                    handleChange('categorie', value);
                    // Reset sous-catégorie quand catégorie change
                    handleChange('sousCategorie', '');
                  }}
                  placeholder="Sélectionner une catégorie"
                >
                  {categoriesDisponibles.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>

              <Descriptions.Item label="Sous-catégorie">
                <Select
                  value={editedProduit.sousCategorie || undefined}
                  onChange={(value) => handleChange('sousCategorie', value)}
                  placeholder="Sélectionner une sous-catégorie"
                  disabled={!editedProduit.categorie}
                >
                  {sousCategories.map((sousCat) => (
                    <Option key={sousCat} value={sousCat}>
                      {sousCat}
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>

              <Descriptions.Item label="Quantité en stock">
                <InputNumber
                  min={0}
                  value={editedProduit.quantiteEnStock}
                  onChange={(value) => handleChange('quantiteEnStock', value)}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Seuil d'alerte">
                <InputNumber
                  min={0}
                  value={editedProduit.seuil}
                  onChange={(value) => handleChange('seuil', value)}
                />
              </Descriptions.Item>

              <Descriptions.Item label="TVA (%)">
                <Select
                  value={editedProduit.tva}
                  onChange={handleTVAChange}
                  style={{ width: 120 }}
                >
                  {TVA_OPTIONS.map(({ label, value }) => (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>

              <Descriptions.Item label="Prix unitaire HT (€)">
                <InputNumber
                  min={0}
                  step={0.01}
                  value={editedProduit.prixUnitaireHT}
                  onChange={handlePrixHTChange}
                  stringMode
                  style={{ width: '100%' }}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Prix unitaire TTC (€)">
                <InputNumber
                  min={0}
                  step={0.01}
                  value={editedProduit.prixUnitaire}
                  onChange={handlePrixTTCChange}
                  stringMode
                  style={{ width: '100%' }}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Image">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {editedProduit.image && (
                  <img
                    src={editedProduit.image}
                    alt="Produit"
                    style={{ maxWidth: '150px', marginTop: 10 }}
                  />
                )}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <>
            <Title level={4}>{produit.nom}</Title>
            <Paragraph>{produit.description}</Paragraph>

            <Descriptions bordered column={1} size="small" className="produit-detail-descriptions">
              <Descriptions.Item label="Catégorie">{produit.categorie}</Descriptions.Item>
              <Descriptions.Item label="Sous-catégorie">{produit.sousCategorie}</Descriptions.Item>
              <Descriptions.Item label="Quantité en stock">{produit.quantiteEnStock}</Descriptions.Item>
              <Descriptions.Item label="Seuil d'alerte">{produit.seuil}</Descriptions.Item>
              <Descriptions.Item label="TVA (%)">{produit.tva}</Descriptions.Item>
              <Descriptions.Item label="Prix unitaire HT (€)">{produit.prixUnitaireHT.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Prix unitaire TTC (€)">{produit.prixUnitaire.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Image">
                {produit.image ? (
                  <img
                    src={produit.image}
                    alt="Produit"
                    style={{ maxWidth: '150px' }}
                  />
                ) : (
                  'Aucune image'
                )}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    </div>
  );
};

export default ProduitDetail;
