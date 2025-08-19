import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
import './css/FraisKilometriques.css';

const FraisKilometriques = ({ onCalculationChange }) => {
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [baremes, setBaremes] = useState([]);
  const [selectedBareme, setSelectedBareme] = useState('');
  const [pointA, setPointA] = useState('');
  const [pointB, setPointB] = useState('');
  const [distance, setDistance] = useState(0);
  const [montantCalcule, setMontantCalcule] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const mapRef = useRef(null);
  const autocompleteARef = useRef(null);
  const autocompleteBRef = useRef(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyCYKDWRjBPotRjX-AgWnL5Y7-iKAbsu2KA';

  useEffect(() => {
    initializeMap();
    fetchBaremes();
  }, []);

  const fetchBaremes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/baremes-kilometriques`);
      if (response.data.success) {
        setBaremes(response.data.baremes);
        if (response.data.baremes.length > 0) {
          setSelectedBareme(response.data.baremes[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Erreur chargement barèmes:', error);
      setError('Erreur lors du chargement des barèmes kilométriques');
    }
  };

  const initializeMap = async () => {
    try {
      console.log('🗺️ Initialisation Google Maps...');
      
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places'],
        region: 'FR',
        language: 'fr'
      });

      console.log('📡 Chargement des bibliothèques Google Maps...');
      
      // Vérifier que Google Maps est disponible
      await loader.load();
      console.log('✅ Google Maps chargé avec succès');

      const { Map } = await loader.importLibrary('maps');
      const { DirectionsService, DirectionsRenderer } = await loader.importLibrary('routes');
      const { Autocomplete } = await loader.importLibrary('places');

      console.log('📍 Création de la carte...');

      // Initialiser la carte centrée sur la France
      const mapInstance = new Map(mapRef.current, {
        zoom: 6,
        center: { lat: 46.603354, lng: 1.888334 }, // Centre de la France
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: 'roadmap'
      });

      console.log('🧭 Configuration des services de direction...');

      const directionsServiceInstance = new DirectionsService();
      const directionsRendererInstance = new DirectionsRenderer({
        draggable: true,
        map: mapInstance,
        panel: null
      });

      console.log('🔍 Configuration de l\'autocomplétion...');

      // Vérifier que les éléments DOM existent
      if (!autocompleteARef.current || !autocompleteBRef.current) {
        throw new Error('Éléments DOM d\'autocomplétion non trouvés');
      }

      // Autocomplete pour point A
      const autocompleteA = new Autocomplete(autocompleteARef.current, {
        componentRestrictions: { country: 'fr' },
        fields: ['place_id', 'formatted_address', 'geometry'],
        types: ['geocode']
      });

      // Autocomplete pour point B  
      const autocompleteB = new Autocomplete(autocompleteBRef.current, {
        componentRestrictions: { country: 'fr' },
        fields: ['place_id', 'formatted_address', 'geometry'],
        types: ['geocode']
      });

      console.log('👂 Configuration des événements...');

      // Écouteurs pour les changements d'adresse
      autocompleteA.addListener('place_changed', () => {
        const place = autocompleteA.getPlace();
        if (place.formatted_address) {
          console.log('📍 Point A sélectionné:', place.formatted_address);
          setPointA(place.formatted_address);
        }
      });

      autocompleteB.addListener('place_changed', () => {
        const place = autocompleteB.getPlace();
        if (place.formatted_address) {
          console.log('📍 Point B sélectionné:', place.formatted_address);
          setPointB(place.formatted_address);
        }
      });

      // Écouteur pour le drag des waypoints
      directionsRendererInstance.addListener('directions_changed', () => {
        const directions = directionsRendererInstance.getDirections();
        if (directions && directions.routes && directions.routes[0]) {
          const route = directions.routes[0];
          const leg = route.legs[0];
          const distanceKm = leg.distance.value / 1000;
          console.log('📏 Distance calculée:', distanceKm, 'km');
          setDistance(distanceKm);
          setPointA(leg.start_address);
          setPointB(leg.end_address);
        }
      });

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      setLoading(false);

      console.log('🎉 Google Maps initialisé avec succès !');

    } catch (error) {
      console.error('❌ Erreur initialisation Google Maps:', error);
      console.error('💡 Détails de l\'erreur:', {
        message: error.message,
        stack: error.stack,
        apiKey: GOOGLE_MAPS_API_KEY ? 'Présente' : 'Manquante'
      });
      
      setError(`Erreur lors de l'initialisation de Google Maps: ${error.message}`);
      setLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!directionsService || !directionsRenderer || !pointA || !pointB) {
      return;
    }

    try {
      const result = await directionsService.route({
        origin: pointA,
        destination: pointB,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      });

      directionsRenderer.setDirections(result);
      
      if (result.routes && result.routes[0] && result.routes[0].legs && result.routes[0].legs[0]) {
        const distanceKm = result.routes[0].legs[0].distance.value / 1000;
        setDistance(distanceKm);
      }

    } catch (error) {
      console.error('Erreur calcul itinéraire:', error);
      setError('Erreur lors du calcul de l\'itinéraire');
    }
  };

  // Calculer le montant quand distance ou barème change
  useEffect(() => {
    if (distance > 0 && selectedBareme && baremes.length > 0) {
      const bareme = baremes.find(b => b.id.toString() === selectedBareme);
      if (bareme) {
        const montant = distance * parseFloat(bareme.tarif_km);
        setMontantCalcule(montant);
        
        // Notifier le composant parent
        if (onCalculationChange) {
          onCalculationChange({
            distance: distance,
            tarif_km: bareme.tarif_km,
            puissance_fiscale: bareme.puissance_fiscale,
            montant_ttc: montant,
            point_depart: pointA,
            point_arrivee: pointB
          });
        }
      }
    }
  }, [distance, selectedBareme, baremes, pointA, pointB, onCalculationChange]);

  // Déclencher le calcul quand les points changent
  useEffect(() => {
    if (pointA && pointB) {
      calculateRoute();
    }
  }, [pointA, pointB]);

  if (loading) {
    return (
      <div className="frais-kilometriques loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement de Google Maps...</p>
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
              setLoading(true);
              initializeMap();
            }}
          >
            <i className="fas fa-redo"></i>
            Réessayer
          </button>
          <div className="manual-input">
            <h4>Saisie manuelle</h4>
            <p>En cas de problème avec Google Maps, vous pouvez saisir manuellement :</p>
            <div className="manual-form">
              <input
                type="text"
                placeholder="Point de départ"
                value={pointA}
                onChange={(e) => setPointA(e.target.value)}
              />
              <input
                type="text"
                placeholder="Point d'arrivée"
                value={pointB}
                onChange={(e) => setPointB(e.target.value)}
              />
              <input
                type="number"
                placeholder="Distance en km"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
              />
              <select
                value={selectedBareme}
                onChange={(e) => setSelectedBareme(e.target.value)}
              >
                <option value="">Sélectionner puissance</option>
                {baremes.map(bareme => (
                  <option key={bareme.id} value={bareme.id}>
                    {bareme.puissance_fiscale} - {bareme.tarif_km}€/km
                  </option>
                ))}
              </select>
            </div>
          </div>
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

      <div className="route-inputs">
        <div className="input-group">
          <label htmlFor="pointA">
            <i className="fas fa-map-marker-alt start-marker"></i>
            Point de départ
          </label>
          <input
            ref={autocompleteARef}
            type="text"
            id="pointA"
            placeholder="Saisir l'adresse de départ"
            value={pointA}
            onChange={(e) => setPointA(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="pointB">
            <i className="fas fa-map-marker-alt end-marker"></i>
            Point d'arrivée
          </label>
          <input
            ref={autocompleteBRef}
            type="text"
            id="pointB"
            placeholder="Saisir l'adresse d'arrivée"
            value={pointB}
            onChange={(e) => setPointB(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="puissance">
            <i className="fas fa-car"></i>
            Puissance fiscale du véhicule
          </label>
          <select
            id="puissance"
            value={selectedBareme}
            onChange={(e) => setSelectedBareme(e.target.value)}
          >
            {baremes.map(bareme => (
              <option key={bareme.id} value={bareme.id}>
                {bareme.puissance_fiscale} - {bareme.tarif_km}€/km
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="map-container">
        <div ref={mapRef} className="google-map"></div>
      </div>

      {(distance > 0 || montantCalcule > 0) && (
        <div className="calculation-result">
          <div className="result-item">
            <span className="label">
              <i className="fas fa-road"></i>
              Distance
            </span>
            <span className="value">{distance.toFixed(2)} km</span>
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
    </div>
  );
};

export default FraisKilometriques;