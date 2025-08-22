import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import './css/FraisKilometriques.css';

const containerStyle = {
  width: '100%',
  height: '250px' // Hauteur adaptée pour la sidebar
};

const center = { lat: 48.8566, lng: 2.3522 }; // Paris

const FraisKilometriques = ({ onCalculationChange }) => {
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [baremes, setBaremes] = useState([]);
  const [selectedBareme, setSelectedBareme] = useState('');
  const [montantCalcule, setMontantCalcule] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  // Chargement des barèmes kilométriques au démarrage
  useEffect(() => {
    fetchBaremes();
  }, []);

  const fetchBaremes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/baremes-kilometriques`);
      if (response.data.success) {
        setBaremes(response.data.baremes);
        if (response.data.baremes.length > 0) {
          setSelectedBareme(response.data.baremes[0].id.toString());
        }
        console.log('✅ Barèmes kilométriques chargés:', response.data.baremes);
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement barèmes:', error);
      setError('Erreur lors du chargement des barèmes kilométriques');
      setLoading(false);
    }
  };

  // Calcul automatique du montant quand distance ou barème change
  useEffect(() => {
    if (distanceKm > 0 && selectedBareme && baremes.length > 0) {
      const bareme = baremes.find(b => b.id.toString() === selectedBareme);
      if (bareme) {
        const montant = distanceKm * parseFloat(bareme.tarif_km);
        setMontantCalcule(montant);
        
        // Notifier le composant parent
        if (onCalculationChange) {
          onCalculationChange({
            distance: distanceKm,
            tarif_km: bareme.tarif_km,
            puissance_fiscale: bareme.puissance_fiscale,
            montant_ttc: montant,
            point_depart: originInputRef.current?.value || '',
            point_arrivee: destinationInputRef.current?.value || ''
          });
        }
        console.log('💰 Montant calculé:', montant, '€ pour', distanceKm, 'km à', bareme.tarif_km, '€/km');
      }
    }
  }, [distanceKm, selectedBareme, baremes, onCalculationChange]);

  const handleOriginLoad = (autocomplete) => {
    originRef.current = autocomplete;
  };

  const handleDestinationLoad = (autocomplete) => {
    destinationRef.current = autocomplete;
  };

  const handleCalculate = () => {
    if (!originInputRef.current || !destinationInputRef.current) return;

    const origin = originInputRef.current.value;
    const destination = destinationInputRef.current.value;
    
    if (!origin || !destination) {
      alert('Veuillez saisir les adresses de départ et d\'arrivée');
      return;
    }

    console.log('🗺️ Calcul itinéraire:', origin, '→', destination);

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          const route = result.routes[0].legs[0];
          const distanceText = route.distance.text;
          const durationText = route.duration.text;
          const distanceValue = route.distance.value / 1000; // Convertir en km
          
          setDistance(`${distanceText} (${durationText})`);
          setDistanceKm(distanceValue);
          
          console.log('✅ Itinéraire calculé:', distanceValue, 'km');
        } else {
          console.error('❌ Erreur calcul itinéraire:', status);
          alert('Impossible de calculer l\'itinéraire : ' + status);
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="frais-kilometriques loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des barèmes kilométriques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="frais-kilometriques error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => {
              setError('');
              fetchBaremes();
            }}
          >
            <i className="fas fa-redo"></i>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="frais-kilometriques">
      <div className="frais-km-header">
        <h3>
          <i className="fas fa-route"></i>
          Calcul d'indemnité kilométrique
        </h3>
      </div>

      <LoadScript
        googleMapsApiKey="AIzaSyCYKDWRjBPotRjX-AgWnL5Y7-iKAbsu2KA"
        libraries={['places', 'geometry']}
        onLoad={() => console.log('✅ Google Maps LoadScript chargé')}
        onError={(e) => {
          console.error('❌ Erreur LoadScript:', e);
          setError('Erreur de chargement Google Maps. Vérifiez votre connexion internet.');
        }}
        loadingElement={<div>Chargement Google Maps...</div>}
      >
        <div className="route-inputs">
          <div className="input-group">
            <label>
              <i className="fas fa-map-marker-alt start-marker"></i>
              Point de départ
            </label>
            <input
              ref={originInputRef}
              type="text"
              placeholder="Saisir l'adresse de départ (ex: Paris, France)"
              className="route-input"
            />
          </div>

          <div className="input-group">
            <label>
              <i className="fas fa-map-marker-alt end-marker"></i>
              Point d'arrivée
            </label>
            <input
              ref={destinationInputRef}
              type="text"
              placeholder="Saisir l'adresse d'arrivée (ex: Lyon, France)"
              className="route-input"
            />
          </div>

          <div className="input-group">
            <label>
              <i className="fas fa-car"></i>
              Puissance fiscale du véhicule
            </label>
            <select
              value={selectedBareme}
              onChange={(e) => setSelectedBareme(e.target.value)}
              className="route-input"
            >
              <option value="">Sélectionner la puissance</option>
              {baremes.map(bareme => (
                <option key={bareme.id} value={bareme.id}>
                  {bareme.puissance_fiscale} - {bareme.tarif_km}€/km
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleCalculate} className="calculate-btn">
            <i className="fas fa-route"></i>
            Calculer la distance
          </button>
        </div>

        {distance && (
          <div className="distance-result">
            <p><strong>Distance et durée :</strong> {distance}</p>
          </div>
        )}

        <div className="map-container">
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={6}>
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>

        {(distanceKm > 0 && montantCalcule > 0) && (
          <div className="calculation-result">
            <div className="result-item">
              <span className="label">
                <i className="fas fa-road"></i>
                Distance
              </span>
              <span className="value">{distanceKm.toFixed(2)} km</span>
            </div>
            
            <div className="result-item">
              <span className="label">
                <i className="fas fa-euro-sign"></i>
                Tarif kilométrique
              </span>
              <span className="value">
                {baremes.find(b => b.id.toString() === selectedBareme)?.tarif_km}€/km
              </span>
            </div>
            
            <div className="result-item total">
              <span className="label">
                <i className="fas fa-calculator"></i>
                Montant TTC
              </span>
              <span className="value">{montantCalcule.toFixed(2)}€</span>
            </div>
          </div>
        )}
      </LoadScript>
    </div>
  );
};

export default FraisKilometriques;