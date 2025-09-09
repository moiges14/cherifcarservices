import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Zap, Car, DollarSign } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Badge from '../common/Badge';
import MapComponent from '../maps/MapComponent';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface RideOption {
  id: string;
  type: 'economy' | 'standard' | 'premium' | 'electric';
  name: string;
  description: string;
  price: number;
  estimatedTime: number;
  icon: React.ComponentType<any>;
  features: string[];
}

const rideOptions: RideOption[] = [
  {
    id: 'economy',
    type: 'economy',
    name: 'Économique',
    description: 'Option abordable pour vos trajets quotidiens',
    price: 12.50,
    estimatedTime: 8,
    icon: Car,
    features: ['4 places', 'Climatisation', 'WiFi gratuit']
  },
  {
    id: 'standard',
    type: 'standard',
    name: 'Standard',
    description: 'Confort et fiabilité pour tous vos déplacements',
    price: 18.00,
    estimatedTime: 6,
    icon: Car,
    features: ['4 places', 'Climatisation', 'WiFi gratuit', 'Chargeur USB']
  },
  {
    id: 'premium',
    type: 'premium',
    name: 'Premium',
    description: 'Expérience de luxe avec véhicules haut de gamme',
    price: 28.00,
    estimatedTime: 5,
    icon: Car,
    features: ['4 places', 'Cuir', 'WiFi gratuit', 'Chargeur USB', 'Eau offerte']
  },
  {
    id: 'electric',
    type: 'electric',
    name: 'Électrique',
    description: 'Transport écologique avec véhicules 100% électriques',
    price: 15.50,
    estimatedTime: 7,
    icon: Zap,
    features: ['4 places', 'Zéro émission', 'WiFi gratuit', 'Chargeur USB']
  }
];

interface BookRideProps {
  onRideBooked: (rideData: any) => void;
}

export default function BookRide({ onRideBooked }: BookRideProps) {
  const { user } = useAuth();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleLocationSubmit = () => {
    if (pickup && destination) {
      setShowOptions(true);
    }
  };

  const handleBookRide = async () => {
    if (!selectedOption || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          ride_type: selectedOption.type,
          pickup,
          dropoff: destination,
          date: new Date().toISOString().split('T')[0],
          time: scheduledTime || new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'searching'
        })
        .select()
        .single();

      if (error) throw error;

      onRideBooked && onRideBooked({
        ...data,
        driver: null,
        estimatedPrice: selectedOption.price
      });
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showOptions) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Réserver une course</h2>
          
          <div className="space-y-4">
            <Input
              leftIcon={<MapPin size={18} />}
              type="text"
              placeholder="Adresse de départ"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
            
            <Input
              leftIcon={<MapPin size={18} />}
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            <Input
              leftIcon={<Clock size={18} />}
              type="time"
              placeholder="Heure de départ (optionnel)"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />

            <Button
              onClick={handleLocationSubmit}
              className="w-full"
              disabled={!pickup || !destination}
            >
              Voir les options
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Map */}
      <Card className="h-64">
        <MapComponent
          pickup={{ address: pickup, lat: 48.8566, lng: 2.3522 }}
          destination={{ address: destination, lat: 48.8606, lng: 2.3376 }}
          showRoute={true}
        />
      </Card>

      {/* Trip Summary */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Résumé du trajet</h3>
          <button
            onClick={() => setShowOptions(false)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Modifier
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
            <div>
              <div className="text-sm text-gray-500">Départ</div>
              <div className="font-medium">{pickup}</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
            <div>
              <div className="text-sm text-gray-500">Destination</div>
              <div className="font-medium">{destination}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Ride Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Choisissez votre option</h3>
        
        {rideOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedOption?.id === option.id;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedOption(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    option.type === 'electric' 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{option.name}</h4>
                      {option.type === 'electric' && (
                        <Badge variant="success">Écologique</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{option.features[0]}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{option.estimatedTime} min</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold">{option.price.toFixed(2)} €</div>
                  <div className="text-xs text-gray-500">Prix estimé</div>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <strong>Inclus :</strong> {option.features.join(', ')}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Book Button */}
      {selectedOption && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">{selectedOption.name}</div>
              <div className="text-sm text-gray-600">
                Arrivée estimée : {selectedOption.estimatedTime} minutes
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{selectedOption.price.toFixed(2)} €</div>
            </div>
          </div>
          
          <Button
            onClick={handleBookRide}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Réservation...' : 'Confirmer la réservation'}
          </Button>
        </Card>
      )}
    </div>
  );
}