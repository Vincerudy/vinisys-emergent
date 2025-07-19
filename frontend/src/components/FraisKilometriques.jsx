import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = { lat: 48.8566, lng: 2.3522 };

const MapRouteCalculator = () => {
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleCalculate = () => {
    if (!originRef.current.value || !destinationRef.current.value) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          const route = result.routes[0].legs[0];
          setDistance(`${route.distance.text} (${route.duration.text})`);
        } else {
          alert('Impossible de calculer l\'itinéraire : ' + status);
        }
      }
    );
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyCYKDWRjBPotRjX-AgWnL5Y7-iKAbsu2KA"
      libraries={['places']}
      onLoad={() => setMapLoaded(true)}
    >
      {mapLoaded && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <Autocomplete>
              <input
                type="text"
                placeholder="Adresse de départ"
                ref={originRef}
                style={{ width: '300px', marginRight: '10px' }}
              />
            </Autocomplete>
            <Autocomplete>
              <input
                type="text"
                placeholder="Adresse d'arrivée"
                ref={destinationRef}
                style={{ width: '300px', marginRight: '10px' }}
              />
            </Autocomplete>
            <button onClick={handleCalculate}>Calculer la distance</button>
          </div>
          {distance && <p>Distance et durée : {distance}</p>}
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={6}>
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>
      )}
    </LoadScript>
  );
};

export default MapRouteCalculator;
