import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Location } from '../../types';
import { AlertCircle, MapPin } from 'lucide-react';

interface MapComponentProps {
  center?: { lat: number, lng: number };
  zoom?: number;
  markers?: (Location & { icon?: 'pickup' | 'dropoff' | 'driver' })[];
  onLocationSelect?: (location: Location) => void;
  showSearchBox?: boolean;
  showRoute?: boolean;
  className?: string;
  pickup?: { address: string; lat: number; lng: number };
  destination?: { address: string; lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
  zoom = 12,
  markers = [],
  onLocationSelect,
  showSearchBox = false,
  showRoute = false,
  className = '',
  pickup,
  destination,
  driverLocation,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (!map) return;
    updateMarkers();
  }, [map, markers, pickup, destination, driverLocation]);

  useEffect(() => {
    if (map && showRoute && (pickup || destination || markers.length >= 2)) {
      showDirections();
    }
  }, [map, showRoute, pickup, destination, markers]);

  const initializeMap = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError('Clé API Google Maps manquante. Veuillez configurer VITE_GOOGLE_MAPS_API_KEY.');
      setIsLoading(false);
      return;
    }

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      await loader.load();

      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);

      // Initialiser la SearchBox si nécessaire
      if (showSearchBox && searchBoxRef.current) {
        const searchBoxInstance = new google.maps.places.SearchBox(searchBoxRef.current);
        setSearchBox(searchBoxInstance);

        mapInstance.addListener('bounds_changed', () => {
          searchBoxInstance.setBounds(mapInstance.getBounds()!);
        });

        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry?.location && onLocationSelect) {
              onLocationSelect({
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                address: place.formatted_address || place.name || ''
              });
            }
          }
        });
      }

      // Initialiser DirectionsRenderer
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#10B981',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      renderer.setMap(mapInstance);
      setDirectionsRenderer(renderer);

      // Ajouter un listener pour les clics sur la carte
      if (onLocationSelect) {
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: event.latLng },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  onLocationSelect({
                    latitude: event.latLng!.lat(),
                    longitude: event.latLng!.lng(),
                    address: results[0].formatted_address
                  });
                }
              }
            );
          }
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement de Google Maps:', error);
      setMapError('Erreur lors du chargement de la carte. Vérifiez votre connexion internet.');
      setIsLoading(false);
    }
  };

  const updateMarkers = () => {
    if (!map) return;

    // Supprimer les anciens marqueurs
    mapMarkers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Ajouter les marqueurs de pickup et destination
    if (pickup) {
      const pickupMarker = new google.maps.Marker({
        position: { lat: pickup.lat, lng: pickup.lng },
        map,
        title: 'Départ',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      });

      const pickupInfoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>Départ</strong><br/>${pickup.address}</div>`
      });

      pickupMarker.addListener('click', () => {
        pickupInfoWindow.open(map, pickupMarker);
      });

      newMarkers.push(pickupMarker);
    }

    if (destination) {
      const destinationMarker = new google.maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map,
        title: 'Destination',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      });

      const destInfoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>Destination</strong><br/>${destination.address}</div>`
      });

      destinationMarker.addListener('click', () => {
        destInfoWindow.open(map, destinationMarker);
      });

      newMarkers.push(destinationMarker);
    }

    // Ajouter le marqueur du chauffeur
    if (driverLocation) {
      const driverMarker = new google.maps.Marker({
        position: driverLocation,
        map,
        title: 'Chauffeur',
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 0
        }
      });

      const driverInfoWindow = new google.maps.InfoWindow({
        content: '<div class="p-2"><strong>Votre chauffeur</strong></div>'
      });

      driverMarker.addListener('click', () => {
        driverInfoWindow.open(map, driverMarker);
      });

      newMarkers.push(driverMarker);
    }

    // Ajouter les marqueurs génériques
    markers.forEach((location) => {
      let icon: google.maps.Symbol;
      
      switch (location.icon) {
        case 'pickup':
          icon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          };
          break;
        case 'dropoff':
          icon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          };
          break;
        case 'driver':
          icon = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            rotation: 0
          };
          break;
        default:
          icon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#6B7280',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          };
      }

      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        icon
      });

      if (location.address) {
        const infoWindow = new google.maps.InfoWindow({
          content: `<div class="p-2">${location.address}</div>`
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }

      newMarkers.push(marker);
    });

    setMapMarkers(newMarkers);

    // Ajuster la vue pour inclure tous les marqueurs
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);
      
      // Éviter un zoom trop important pour un seul marqueur
      if (newMarkers.length === 1) {
        map.setZoom(Math.min(map.getZoom() || 15, 15));
      }
    }
  };

  const showDirections = () => {
    if (!map || !directionsRenderer) return;

    const directionsService = new google.maps.DirectionsService();
    
    let origin: google.maps.LatLng | string;
    let destination: google.maps.LatLng | string;

    if (pickup && destination) {
      origin = new google.maps.LatLng(pickup.lat, pickup.lng);
      destination = new google.maps.LatLng(destination.lat, destination.lng);
    } else if (markers.length >= 2) {
      origin = new google.maps.LatLng(markers[0].latitude, markers[0].longitude);
      destination = new google.maps.LatLng(markers[1].latitude, markers[1].longitude);
    } else {
      return;
    }

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'FR',
        language: 'fr'
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Erreur lors du calcul de l\'itinéraire:', status);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-4">
          <AlertCircle size={48} className="mx-auto mb-2 text-red-500" />
          <p className="font-medium mb-1">Carte indisponible</p>
          <p className="text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {showSearchBox && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <input
            ref={searchBoxRef}
            type="text"
            placeholder="Rechercher un lieu..."
            className="w-full px-4 py-2 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default MapComponent;