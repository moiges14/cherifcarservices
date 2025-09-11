import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Car, Navigation, DollarSign, Route } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import MapComponent from '../maps/MapComponent';

interface RoutePreviewProps {
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  vehicleType?: string;
  onConfirm?: () => void;
  onEdit?: () => void;
  className?: string;
}

const RoutePreview: React.FC<RoutePreviewProps> = ({
  pickup,
  destination,
  vehicleType = 'standard',
  onConfirm,
  onEdit,
  className = ''
}) => {
  const [routeInfo, setRouteInfo] = useState({
    distance: 0,
    duration: 0,
    price: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateRoute();
  }, [pickup, destination]);

  const calculateRoute = async () => {
    setLoading(true);
    try {
      // Simulation du calcul de trajet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calcul approximatif basé sur les coordonnées
      const latDiff = Math.abs(pickup.lat - destination.lat);
      const lngDiff = Math.abs(pickup.lng - destination.lng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Conversion approximative en km
      
      const duration = Math.max(10, Math.round(distance * 2.5)); // Durée approximative en minutes
      const basePrice = getBasePrice(vehicleType);
      const price = basePrice + (distance * getPricePerKm(vehicleType));
      
      setRouteInfo({
        distance: Math.max(1, distance),
        duration,
        price
      });
    } catch (error) {
      console.error('Erreur lors du calcul du trajet:', error);
      // Valeurs par défaut en cas d'erreur
      setRouteInfo({
        distance: 10,
        duration: 15,
        price: 25
      });
    } finally {
      setLoading(false);
    }
  };

  const getBasePrice = (type: string) => {
    switch (type) {
      case 'economy': return 9;
      case 'standard': return 12;
      case 'premium': return 20;
      case 'electric': return 15;
      default: return 12;
    }
  };

  const getPricePerKm = (type: string) => {
    switch (type) {
      case 'economy': return 1.5;
      case 'standard': return 2.0;
      case 'premium': return 3.5;
      case 'electric': return 2.5;
      default: return 2.0;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'premium': return '🚗';
      case 'electric': return '⚡';
      case 'economy': return '🚙';
      default: return '🚕';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Carte du trajet */}
      <Card className="overflow-hidden">
        <div className="h-64 relative">
          <MapComponent
            pickup={pickup}
            destination={destination}
            showRoute={true}
            className="w-full h-full"
          />
          
          {/* Overlay avec informations rapides */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Route className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-gray-900">Aperçu du trajet</span>
                </div>
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                ) : (
                  <div className="text-sm text-gray-600">
                    {routeInfo.distance.toFixed(1)} km • {formatDuration(routeInfo.duration)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Détails du trajet */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Détails du trajet</h3>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Modifier
              </Button>
            )}
          </div>

          {/* Points de départ et d'arrivée */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Départ</div>
                <div className="font-medium text-gray-900 truncate">{pickup.address}</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">Destination</div>
                <div className="font-medium text-gray-900 truncate">{destination.address}</div>
              </div>
            </div>
          </div>

          {/* Informations du trajet */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Navigation className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-sm text-gray-500">Distance</div>
              <div className="font-semibold text-gray-900">
                {loading ? '...' : `${routeInfo.distance.toFixed(1)} km`}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-sm text-gray-500">Durée</div>
              <div className="font-semibold text-gray-900">
                {loading ? '...' : formatDuration(routeInfo.duration)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Car className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-sm text-gray-500">Véhicule</div>
              <div className="font-semibold text-gray-900 flex items-center justify-center">
                <span className="mr-1">{getVehicleIcon(vehicleType)}</span>
                <span className="capitalize">{vehicleType}</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-sm text-gray-500">Prix estimé</div>
              <div className="font-semibold text-emerald-600 text-lg">
                {loading ? '...' : `${routeInfo.price.toFixed(2)} €`}
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
                ℹ️
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informations importantes :</p>
                <ul className="space-y-1 text-xs">
                  <li>• Le prix peut varier selon les conditions de circulation</li>
                  <li>• Durée estimée hors embouteillages</li>
                  <li>• Tarifs incluent les frais de service</li>
                  <li>• Paiement sécurisé par carte bancaire</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bouton de confirmation */}
          {onConfirm && (
            <Button
              onClick={onConfirm}
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? 'Calcul en cours...' : 'Confirmer la réservation'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RoutePreview;