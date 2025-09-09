import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageCircle, Star, Navigation, Clock } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import MapComponent from '../maps/MapComponent';

interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  estimatedArrival: number; // minutes
  phone?: string;
  photo?: string | null;
}

interface ActiveRideProps {
  rideId: string;
  pickup: string;
  destination: string;
  driver: Driver;
  status: 'matched' | 'driver_en_route' | 'arrived' | 'in_progress';
  onCancel: () => void;
}

export default function ActiveRide({ 
  rideId, 
  pickup, 
  destination, 
  driver, 
  status, 
  onCancel 
}: ActiveRideProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDriverDetails, setShowDriverDetails] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case 'matched':
        return 'Chauffeur trouvé ! Préparation en cours...';
      case 'driver_en_route':
        return `Votre chauffeur arrive dans ${driver.estimatedArrival} min`;
      case 'arrived':
        return 'Votre chauffeur est arrivé !';
      case 'in_progress':
        return 'Course en cours...';
      default:
        return 'Recherche en cours...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'matched':
        return 'text-blue-600';
      case 'driver_en_route':
        return 'text-yellow-600';
      case 'arrived':
        return 'text-green-600';
      case 'in_progress':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Status Header */}
      <Card className="text-center">
        <div className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Course #{rideId.slice(-8)}
        </div>
        
        {status === 'arrived' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              🚗 Votre chauffeur vous attend !
            </p>
            <p className="text-green-600 text-sm">
              Vérifiez le numéro de plaque : {driver.vehicle.licensePlate}
            </p>
          </div>
        )}
      </Card>

      {/* Map */}
      <Card className="h-64">
        <MapComponent
          pickup={{ address: pickup, lat: 48.8566, lng: 2.3522 }}
          destination={{ address: destination, lat: 48.8606, lng: 2.3376 }}
          driverLocation={driver.location || { lat: 48.8586, lng: 2.3486 }}
          showRoute={true}
        />
      </Card>

      {/* Driver Info */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Votre chauffeur</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{driver.rating}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            {driver.photo ? (
              <img
                src={driver.photo}
                alt={driver.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">
                  {driver.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium">{driver.name}</div>
            <div className="text-sm text-gray-600">
              {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
            </div>
            <div className="text-sm text-gray-500">
              {driver.vehicle.licensePlate}
            </div>
          </div>
          <button
            onClick={() => setShowDriverDetails(!showDriverDetails)}
            className="text-emerald-600 text-sm font-medium"
          >
            {showDriverDetails ? 'Masquer' : 'Détails'}
          </button>
        </div>
        
        {showDriverDetails && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Expérience :</span>
                <span className="ml-1 font-medium">5 ans</span>
              </div>
              <div>
                <span className="text-gray-500">Courses :</span>
                <span className="ml-1 font-medium">2,847</span>
              </div>
              <div>
                <span className="text-gray-500">Langues :</span>
                <span className="ml-1 font-medium">FR, EN</span>
              </div>
              <div>
                <span className="text-gray-500">Spécialités :</span>
                <span className="ml-1 font-medium">Aéroport</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={() => window.open(`tel:${driver.phone || '0774683800'}`)}
          >
            <Phone className="w-4 h-4" />
            <span>Appeler</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message</span>
          </Button>
        </div>
      </Card>

      {/* Trip Details */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Détails du trajet</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">Départ</div>
              <div className="font-medium">{pickup}</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">Destination</div>
              <div className="font-medium">{destination}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Heure de départ</span>
              </div>
              <div className="font-medium">
                {currentTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Navigation className="w-4 h-4 text-gray-400" />
                <span>Distance estimée</span>
              </div>
              <div className="font-medium">12.5 km</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      {status !== 'in_progress' && (
        <Card>
          <div className="space-y-3">
            {status === 'matched' && (
              <div className="text-center text-sm text-gray-600 mb-3">
                Vous pouvez annuler gratuitement jusqu'à l'arrivée du chauffeur
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={onCancel}
            >
              {status === 'arrived' ? 'Annuler (des frais peuvent s\'appliquer)' : 'Annuler la course'}
            </Button>
            
            {status === 'arrived' && (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {/* Marquer comme en cours */}}
              >
                Confirmer la prise en charge
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}