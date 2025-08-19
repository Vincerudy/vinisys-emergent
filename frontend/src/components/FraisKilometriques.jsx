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
    // Petit délai pour s'assurer que le DOM est prêt
    const initTimeout = setTimeout(() => {
      initializeMap();
      fetchBaremes();
    }, 100);

    return () => clearTimeout(initTimeout);
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
      console.log('🗺️ Début initialisation Google Maps...');
      setLoading(true);
      setError('');
      
      // Attendre que l'élément DOM soit disponible avec retry
      let retries = 0;
      const maxRetries = 10;
      
      const waitForMapRef = () => {
        return new Promise((resolve, reject) => {
          const checkMapRef = () => {
            retries++;
            console.log(`🔍 Vérification mapRef (tentative ${retries}/${maxRetries})`);
            
            if (mapRef.current) {
              console.log('✅ Element mapRef trouvé!');
              resolve(true);
            } else if (retries >= maxRetries) {
              reject(new Error('Timeout: élément mapRef introuvable après 10 tentatives'));
            } else {
              console.log('⏳ mapRef pas encore disponible, retry dans 200ms...');
              setTimeout(checkMapRef, 200);
            }
          };
          checkMapRef();
        });
      };

      // Attendre que mapRef soit disponible
      await waitForMapRef();

      console.log('📚 Chargement des bibliothèques Google Maps...');
      
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      // Chargement avec timeout
      const libraries = await Promise.race([
        loader.importLibrary('maps').then(maps => ({ maps })),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout chargement Google Maps')), 10000)
        )
      ]);

      console.log('📍 Création de la carte...');

      // Vérification finale avant création de la carte
      if (!mapRef.current) {
        throw new Error('Element mapRef disparu pendant le chargement');
      }

      // Créer la carte
      const mapInstance = new libraries.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 46.8566, lng: 2.3522 }, // Centre exact de la France
        mapTypeControl: false, // Simplifier l'interface pour sidebar
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeId: 'roadmap',
        styles: [] // Style par défaut
      });

      console.log('✅ Carte créée avec succès!');

      // Chargement des services de direction
      const [routesLib, placesLib] = await Promise.all([
        loader.importLibrary('routes'),
        loader.importLibrary('places')
      ]);

      const directionsServiceInstance = new routesLib.DirectionsService();
      const directionsRendererInstance = new routesLib.DirectionsRenderer({
        draggable: true,
        map: mapInstance,
        suppressMarkers: false,
        suppressInfoWindows: true
      });

      console.log('🧭 Services de direction configurés');

      // Configuration autocomplete seulement si les éléments existent
      if (autocompleteARef.current && autocompleteBRef.current) {
        console.log('🔍 Configuration autocomplétion...');
        
        const autocompleteA = new placesLib.Autocomplete(autocompleteARef.current, {
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'geometry'],
          types: ['address']
        });

        const autocompleteB = new placesLib.Autocomplete(autocompleteBRef.current, {
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'geometry'],
          types: ['address']
        });

        // Événements autocomplete
        autocompleteA.addListener('place_changed', () => {
          const place = autocompleteA.getPlace();
          if (place.formatted_address) {
            console.log('📍 Point A:', place.formatted_address);
            setPointA(place.formatted_address);
          }
        });

        autocompleteB.addListener('place_changed', () => {
          const place = autocompleteB.getPlace();
          if (place.formatted_address) {
            console.log('📍 Point B:', place.formatted_address);
            setPointB(place.formatted_address);
          }
        });

        console.log('✅ Autocomplétion configurée');
      }

      // Événement directions changed
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

      // Sauvegarder les instances
      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      
      console.log('🎉 Google Maps initialisé avec succès!');
      setLoading(false);

    } catch (error) {
      console.error('❌ Erreur initialisation Google Maps:', error);
      console.error('🔧 Détails:', {
        message: error.message,
        apiKey: GOOGLE_MAPS_API_KEY ? 'Présente' : 'Manquante',
        mapRefExists: !!mapRef.current,
        retries: retries
      });
      
      setError(`Erreur Google Maps: ${error.message}`);
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