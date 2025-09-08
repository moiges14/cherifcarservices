import React, { useEffect, useRef, useState } from 'react';
import { Location } from '../../types';
import { AlertCircle } from 'lucide-react';

interface MapComponentProps {
  center?: { lat: number, lng: number };
  zoom?: number;
  markers?: (Location & { icon?: 'pickup' | 'dropoff' | 'driver' })[];
  onLocationSelect?: (location: Location) => void;
  showSearchBox?: boolean;
  showRoute?: boolean;
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 48.8566, lng: 2.3522 },
  zoom = 6,
  markers = [],
  onLocationSelect,
  showSearchBox = false,
  showRoute = false,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Temporarily disable Google Maps to prevent API errors
    setMapError('Google Maps is temporarily disabled. Please configure a valid API key in your environment variables.');
  }, []);

  useEffect(() => {
    if (!map) return;

    mapMarkers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    markers.forEach((location) => {
      let icon: google.maps.Symbol | string;
      
      switch (location.icon) {
        case 'pickup':
          icon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#059669',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          };
          break;
        case 'dropoff':
          icon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#DC2626',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          };
          break;
        case 'driver':
          icon = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#059669',
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
            fillColor: '#4B5563',
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

    if (showRoute && directionsRenderer && markers.length >= 2) {
      const directionsService = new google.maps.DirectionsService();
      const origin = { lat: markers[0].latitude, lng: markers[0].longitude };
      const destination = { lat: markers[1].latitude, lng: markers[1].longitude };

      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
          region: 'FR'
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    }

    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(location => {
        bounds.extend({ lat: location.latitude, lng: location.longitude });
      });
      map.fitBounds(bounds);
    }
  }, [map, markers, showRoute, directionsRenderer]);

  return (
    <div className="relative h-full">
      {mapError && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-red-50 text-red-700 px-4 py-3 rounded-lg shadow-md flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <p>{mapError}</p>
        </div>
      )}
      
      {showSearchBox && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <input
            ref={searchBoxRef}
            type="text"
            placeholder="Rechercher un lieu en France..."
            className="w-full px-4 py-2 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}
      
      <div ref={mapRef} className={`w-full h-full rounded-lg bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-2" />
          <p>Map temporarily unavailable</p>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;