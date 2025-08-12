import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexte/AuthContext';
import axios from 'axios';
import './css/RapportPage.css';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiFileText, 
  FiCreditCard,
  FiShoppingCart,
  FiUsers,
  FiPieChart,
  FiBarChart,
  FiCalendar,
  FiRefreshCcw
} from 'react-icons/fi';

const RapportPage = () => {
  const { societe_id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('mois'); // jour, mois, année
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [rapportData, setRapportData] = useState({
    chiffre_affaires: {},
    factures: {},
    depenses: {},
    notes_frais: {},
    benefice_net: 0
  });

  // Initialiser les dates par défaut (mois actuel)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateDebut(firstDay.toISOString().split('T')[0]);
    setDateFin(lastDay.toISOString().split('T')[0]);
  }, []);

  // Charger les données du rapport
  const fetchRapportData = async () => {
    if (!societe_id || !dateDebut || !dateFin) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/rapport/financier/${societe_id}`,
        {
          params: {
            date_debut: dateDebut,
            date_fin: dateFin,
            periode: periode
          }
        }
      );
      
      setRapportData(response.data);
    } catch (error) {
      console.error('Erreur chargement rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapportData();
  }, [societe_id, dateDebut, dateFin, periode]);

  // Changer de période prédéfinie
  const changePeriode = (nouvellePeriode) => {
    setPeriode(nouvellePeriode);
    const now = new Date();
    
    switch (nouvellePeriode) {
      case 'jour':
        setDateDebut(now.toISOString().split('T')[0]);
        setDateFin(now.toISOString().split('T')[0]);
        break;
      case 'mois':
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setDateDebut(firstDay.toISOString().split('T')[0]);
        setDateFin(lastDay.toISOString().split('T')[0]);
        break;
      case 'annee':
        const firstDayYear = new Date(now.getFullYear(), 0, 1);
        const lastDayYear = new Date(now.getFullYear(), 11, 31);
        setDateDebut(firstDayYear.toISOString().split('T')[0]);
        setDateFin(lastDayYear.toISOString().split('T')[0]);
        break;
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant || 0);
  };

  const formatPourcentage = (pourcentage) => {
    return `${pourcentage?.toFixed(1) || 0}%`;
  };

  if (loading) {
    return (
      <div className="rapport-loading">
        <FiRefreshCcw className="spinning" />
        <p>Chargement du rapport financier...</p>
      </div>
    );
  }

  return (
    <div className="rapport-page">
      <div className="rapport-header">
        <h1>
          <FiBarChart />
          Rapport Financier
        </h1>
        
        {/* Filtres de période */}
        <div className="periode-filters">
          <div className="periode-presets">
            <button 
              className={periode === 'jour' ? 'active' : ''}
              onClick={() => changePeriode('jour')}
            >
              Aujourd'hui
            </button>
            <button 
              className={periode === 'mois' ? 'active' : ''}
              onClick={() => changePeriode('mois')}
            >
              Ce mois
            </button>
            <button 
              className={periode === 'annee' ? 'active' : ''}
              onClick={() => changePeriode('annee')}
            >
              Cette année
            </button>
          </div>
          
          <div className="date-range">
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <span>à</span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
            <button onClick={fetchRapportData} className="btn-refresh">
              <FiRefreshCcw />
            </button>
          </div>
        </div>
      </div>

      <div className="rapport-content">
        {/* Section Chiffre d'affaires */}
        <div className="rapport-section">
          <h2>
            <FiTrendingUp />
            Chiffre d'Affaires
          </h2>
          
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-header">
                <FiDollarSign />
                <span>CA Total</span>
              </div>
              <div className="metric-value">
                {formatMontant(rapportData.chiffre_affaires.total)}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <FiFileText />
                <span>Factures émises</span>
              </div>
              <div className="metric-value">
                {rapportData.factures.nombre || 0}
              </div>
            </div>
            
            <div className="metric-card success">
              <div className="metric-header">
                <FiCreditCard />
                <span>Encaissé</span>
              </div>
              <div className="metric-value">
                {formatMontant(rapportData.chiffre_affaires.encaisse)}
              </div>
            </div>
            
            <div className="metric-card warning">
              <div className="metric-header">
                <FiCalendar />
                <span>En attente</span>
              </div>
              <div className="metric-value">
                {formatMontant(rapportData.chiffre_affaires.en_attente)}
              </div>
            </div>
          </div>

          {/* Répartition TVA */}
          <div className="tva-repartition">
            <h3>Répartition par TVA</h3>
            <div className="tva-grid">
              {rapportData.chiffre_affaires.tva_repartition?.map(tva => (
                <div key={tva.taux} className="tva-item">
                  <span className="tva-taux">{formatPourcentage(tva.taux)}</span>
                  <span className="tva-montant">{formatMontant(tva.montant)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avoirs */}
          <div className="avoirs-section">
            <div className="metric-card danger">
              <div className="metric-header">
                <FiRefreshCcw />
                <span>Total Avoirs</span>
              </div>
              <div className="metric-value">
                {formatMontant(rapportData.chiffre_affaires.avoirs)}
              </div>
            </div>
          </div>
        </div>

        {/* Section Dépenses */}
        <div className="rapport-section">
          <h2>
            <FiShoppingCart />
            Dépenses
          </h2>
          
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-header">
                <FiDollarSign />
                <span>Dépenses Totales</span>
              </div>
              <div className="metric-value">
                {formatMontant(rapportData.depenses.total_ttc)}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <FiUsers />
                <span>Notes de frais</span>
              </div>
              <div className="metric-value">
                {formatMontant(rapportData.notes_frais.total_rembourse)}
              </div>
            </div>
            
            <div className="metric-card info">
              <div className="metric-header">
                <span>TVA Récupérable</span>
              </div>
              <div className="metric-value">
                {formatMontant(rapportData.depenses.tva_recuperable)}
              </div>
            </div>
          </div>

          {/* Répartition par catégorie */}
          <div className="categories-repartition">
            <h3>Répartition par Catégorie</h3>
            <div className="categories-grid">
              {rapportData.depenses.categories?.map(cat => (
                <div key={cat.nom_categorie} className="category-item">
                  <div className="category-name">{cat.nom_categorie}</div>
                  <div className="category-montant">{formatMontant(cat.montant)}</div>
                  <div className="category-bar">
                    <div 
                      className="category-fill" 
                      style={{width: `${cat.pourcentage}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Détail HT/TTC/TVA */}
          <div className="detail-montants">
            <div className="montant-detail">
              <span>Montant HT:</span>
              <span>{formatMontant(rapportData.depenses.total_ht)}</span>
            </div>
            <div className="montant-detail">
              <span>TVA:</span>
              <span>{formatMontant(rapportData.depenses.total_tva)}</span>
            </div>
            <div className="montant-detail total">
              <span>Total TTC:</span>
              <span>{formatMontant(rapportData.depenses.total_ttc)}</span>
            </div>
          </div>
        </div>

        {/* Section Notes de Frais */}
        <div className="rapport-section">
          <h2>
            <FiUsers />
            Notes de Frais Employés
          </h2>
          
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-header">
                <FiDollarSign />
                <span>Total Remboursé</span>
              </div>
              <div className="metric-value">
                {formatMontant(rapportData.notes_frais.total_rembourse)}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <FiFileText />
                <span>Nombre de Notes</span>
              </div>
              <div className="metric-value">
                {rapportData.notes_frais.nombre_notes || 0}
              </div>
            </div>
          </div>

          {/* Répartition Notes de Frais par Type */}
          <div className="categories-repartition">
            <h3>Répartition Notes de Frais par Type</h3>
            <div className="categories-grid">
              {rapportData.notes_frais.categories?.map(cat => {
                const totalNotesFrais = rapportData.notes_frais.total_rembourse || 1;
                const pourcentage = (cat.montant / totalNotesFrais) * 100;
                return (
                  <div key={cat.nom} className="category-item">
                    <div className="category-name">{cat.nom}</div>
                    <div className="category-montant">{formatMontant(cat.montant)}</div>
                    <div className="category-bar">
                      <div 
                        className="category-fill" 
                        style={{width: `${pourcentage}%`}}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section Bénéfice Net */}
        <div className="rapport-section benefice-section">
          <h2>
            <FiPieChart />
            Bénéfice Net Comptable
          </h2>
          
          <div className="benefice-calcul">
            <div className="calcul-etape">
              <span>Chiffre d'affaires encaissé:</span>
              <span className="positive">{formatMontant(rapportData.chiffre_affaires.encaisse)}</span>
            </div>
            <div className="calcul-etape">
              <span>- Avoirs émis:</span>
              <span className="negative">-{formatMontant(rapportData.chiffre_affaires.avoirs)}</span>
            </div>
            <div className="calcul-etape">
              <span>- Dépenses TTC:</span>
              <span className="negative">-{formatMontant(rapportData.depenses.total_ttc)}</span>
            </div>
            <div className="calcul-etape">
              <span>+ TVA récupérable:</span>
              <span className="positive">+{formatMontant(rapportData.depenses.tva_recuperable)}</span>
            </div>
            <div className="calcul-etape">
              <span>- Notes de frais:</span>
              <span className="negative">-{formatMontant(rapportData.notes_frais.total_rembourse)}</span>
            </div>
            
            <div className="calcul-resultat">
              <span>Bénéfice Net:</span>
              <span className={rapportData.benefice_net >= 0 ? 'positive' : 'negative'}>
                {formatMontant(rapportData.benefice_net)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapportPage;