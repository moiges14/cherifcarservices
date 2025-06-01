import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
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
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError('Google Maps API key is missing. Please check your environment variables.');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
      region: 'FR',
      language: 'fr',
      // Add development URLs to allowed referrers
      authReferrerPolicy: 'origin'
    });

    const loadMap = async () => {
      try {
        await loader.load();
        if (!mapRef.current) return;

        // Define France bounds
        const franceBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(41.3, -5.1), // SW corner
          new google.maps.LatLng(51.1, 9.5)   // NE corner
        );

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          restriction: {
            latLngBounds: franceBounds,
            strictBounds: false
          },
          styles: [
            {
              featureType: 'administrative.country',
              elementType: 'geometry',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'administrative.province',
              elementType: 'geometry',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#c9e9f6' }]
            }
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        setMap(mapInstance);
        setMapError(null);

        if (showRoute) {
          const rendererInstance = new google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#10B981',
              strokeWeight: 4
            }
          });
          setDirectionsRenderer(rendererInstance);
        }

        if (showSearchBox && searchBoxRef.current) {
          const searchBox = new google.maps.places.SearchBox(searchBoxRef.current, {
            bounds: franceBounds
          });
          
          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (!places || places.length === 0) return;

            const place = places[0];
            if (!place.geometry || !place.geometry.location) return;

            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(15);

            if (onLocationSelect) {
              onLocationSelect({
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                address: place.formatted_address || ''
              });
            }
          });

          mapInstance.addListener('bounds_changed', () => {
            searchBox.setBounds(mapInstance.getBounds() as google.maps.LatLngBounds);
          });
        }

        if (onLocationSelect) {
          mapInstance.addListener('click', async (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;

            const geocoder = new google.maps.Geocoder();
            try {
              const response = await geocoder.geocode({
                location: e.latLng,
                region: 'FR'
              });
              
              if (response.results[0]) {
                onLocationSelect({
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng(),
                  address: response.results[0].formatted_address || ''
                });
              }
            } catch (error) {
              console.error('Geocoding error:', error);
              setLocationError('Failed to get address for selected location');
            }
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to load Google Maps. Please check your API key and ensure it has the necessary permissions.');
      }
    };

    loadMap();

    return () => {
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
      mapMarkers.forEach(marker => marker.setMap(null));
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
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
      {(locationError || mapError) && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-red-50 text-red-700 px-4 py-3 rounded-lg shadow-md flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <p>{locationError || mapError}</p>
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
      
      <div ref={mapRef} className={`w-full h-full rounded-lg ${className}`} />
    </div>
  );
};

export default MapComponent;