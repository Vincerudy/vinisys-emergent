import React, { useState, useEffect, useMemo } from 'react';
import { Input, Select, Row, Col, Tag, Empty, Spin, Button } from 'antd';
import { SearchOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

 
import { useAuth } from '../contexte/AuthContext';
 
import { 
  FiPlus, 
  FiFilter, 
  FiDownload, 
  FiCreditCard, 
  FiTrendingUp, 
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUsers,
  FiMap,
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiCheck,
  FiX,
  FiPieChart,
  FiGrid
} from 'react-icons/fi';

const { Option } = Select;

// Les catégories et sous-catégories seront chargées dynamiquement

const generateGradient = () => {
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + Math.floor(Math.random() * 90) + 30) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 80%, 65%))`;
};

const ListeProduits = () => {
  const { societe_id } = useAuth();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('Tous');
  const [selectedSousCategorie, setSelectedSousCategorie] = useState('');
  const [categoriesStock, setCategoriesStock] = useState([]);
  const [sousCategoriesStock, setSousCategoriesStock] = useState([]);
  const navigate = useNavigate();

  const gradients = useMemo(() => {
    const map = {};
    produits.forEach(p => {
      map[p.id] = generateGradient();
    });
    return map;
  }, [produits]);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/produits/${societe_id}`);
        if (!response.ok) throw new Error('Erreur serveur');
        const data = await response.json();
        console.log('data ', data)
        const mapped = data.map(prod => ({
          id: prod.id,
          nom: prod.nom,
          seuil: prod.seuil,
          description: prod.description,
          prixUnitaire: parseFloat(prod.prixUnitaire) || 0,
          prixUnitaireHT: parseFloat(prod.prixUnitaireHT) || 0,
          quantiteEnStock: prod.quantite_en_stock,
          categorie: prod.categorie || 'Non défini',
          sousCategorie: prod.sous_categorie || '',
          image: prod.image_path || '',
        }));
        const sorted = mapped.sort((a, b) => b.id - a.id);
        setProduits(sorted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduits();
  }, [societe_id]);

  const filteredProduits = produits.filter(prod => {
    const matchesSearch = prod.nom.toLowerCase().includes(searchValue.toLowerCase());
    const matchesCategorie = selectedCategorie === 'Tous' || prod.categorie === selectedCategorie;
    const matchesSousCategorie = !selectedSousCategorie || prod.sousCategorie === selectedSousCategorie;
    return matchesSearch && matchesCategorie && matchesSousCategorie;
  });

  return (
    <div className="modern-container">
      <div style={{background: 'linear-gradient(180deg, rgba(92, 19, 151, 0.101), rgba(73, 5, 29, 0.06))', padding: '20px', borderRadius: '10px', marginBottom: '20px'}}>
        <h3 className="quick-links-title">
          <FiMap />
          Accès rapide
        </h3>
        <div className="quick-links-grid">
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/produit'}
          >
            <div className="quick-link-icon">
              <FiFileText />
            </div>
            <div className="quick-link-text">Créer un produit</div>
          </div>
          
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/Import-produit'}
          >
            <div className="quick-link-icon">
              <FiPlus />
            </div>
            <div className="quick-link-text">Importer des produits</div>
          </div>
          
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/mouvements'}
          >
            <div className="quick-link-icon">
              <FiCheckCircle />
            </div>
            <div className="quick-link-text">Mouvement de stock</div>
          </div>
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/inventaire-manuel'}
          >
            <div className="quick-link-icon">
              <FiCalendar />
            </div>
            <div className="quick-link-text">Inventaire manuel</div>
          </div>
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/Inventaire-auto'}
          >
            <div className="quick-link-icon">
              <FiCalendar />
            </div>
            <div className="quick-link-text">Inventaire automatique</div>
          </div>
          
          <div 
            className="quick-link-card"
            onClick={() => window.location.hash = '#/categories-stock'}
          >
            <div className="quick-link-icon">
              <FiGrid />
            </div>
            <div className="quick-link-text">Catégories</div>
          </div>
          
        </div>
        <div style={{width:'100%'}} className="modern-filters-row">
        <Input
          placeholder="🔍 Rechercher un produit"
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          allowClear
          style={{ width: '45%', height: '50px' }}
        />
        <Select
          placeholder="Catégorie"
          value={selectedCategorie}
          onChange={(val) => {
            setSelectedCategorie(val);
            setSelectedSousCategorie('');
          }}
          allowClear
          style={{ width: '45%', height: '50px', border: 'none' }}
        >
          {categorieOptions.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
        {selectedCategorie !== 'Tous' && sousCategorieMap[selectedCategorie] && (
          <Select
            placeholder="Sous-catégorie"
            value={selectedSousCategorie}
            onChange={setSelectedSousCategorie}
            allowClear
            style={{ width: '45%', height: '50px', border: 'none' }}
          >
            {sousCategorieMap[selectedCategorie].map(sc => (
              <Option key={sc} value={sc}>{sc}</Option>
            ))}
          </Select>
        )}
      </div>
      </div>

 

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '4rem auto' }} />
      ) : filteredProduits.length === 0 ? (
        <Empty description="Aucun produit trouvé" style={{ marginTop: '3rem' }} />
      ) : (
        <Row gutter={[24, 24]} className="modern-cards-row">
          {filteredProduits.map(prod => {
            const gradient = gradients[prod.id];
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={prod.id}>
                <div
                  className="rainbow-company-card"
                  style={{ background: gradient }}
                  onClick={() => navigate(`/produit/${prod.id}`)}
                >
                  <div className="company-initials">
                    <ShoppingOutlined />
                  </div>
                  <div className="company-info">
                    <div className="company-name">{prod.nom}</div>
                    <div className="company-id"><p style={{color: 'white', fontWeight: 'bold'}}>Prix HT: {prod.prixUnitaireHT.toFixed(2)} €</p></div>
                    <div className="company-id"><p style={{color: 'white', fontWeight: 'bold'}}>Prix TTC: {prod.prixUnitaire.toFixed(2)} €</p></div>
                    <div className="company-id"><p style={{color: 'white', fontWeight: 'bold'}}>Stock : {prod.quantiteEnStock}</p></div>
                    <div className="company-status">
                      <Tag color={prod.quantiteEnStock > prod.seuil ? 'green' : 'red'}>
                        {prod.quantiteEnStock > prod.seuil ? 'Disponible' : 'Stock bas'}
                      </Tag>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default ListeProduits;
