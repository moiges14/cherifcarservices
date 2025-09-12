import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import AddressInput from '../common/AddressInput';
import Button from '../common/Button';
import Card from '../common/Card';
import { MapPin, Clock, Users, Car, Calculator } from 'lucide-react';

interface BookRideProps {
  onRideBooked: (ride: any) => void;
}

interface FormData {
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  rideType: string;
  specialRequests: string;
}

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface UserProfile {
  display_name?: string;
  phone?: string;
  preferred_locations?: any;
}

const BookRide: React.FC<BookRideProps> = ({ onRideBooked }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    rideType: 'standard',
    specialRequests: ''
  });
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedOption, setSelectedOption] = useState('standard');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedLocations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setSavedLocations(data || []);
    } catch (error) {
      console.error('Error loading saved locations:', error);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const calculateDistanceAndPrice = async () => {
    if (!formData.pickup || !formData.destination || !window.google?.maps) return;

    try {
      const service = new window.google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [formData.pickup],
        destinations: [formData.destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        if (status === 'OK' && response?.rows[0]?.elements[0]?.status === 'OK') {
          const element = response.rows[0].elements[0];
          const distance = element.distance.value / 1000; // Convert to km
          const duration = element.duration.value / 60; // Convert to minutes
          
          setEstimatedDistance(distance);
          setEstimatedDuration(Math.round(duration));
          
          // Calculate price based on distance and ride type
          let basePrice = 5; // Base price in euros
          let pricePerKm = 1.5;
          
          switch (selectedOption) {
            case 'economy':
              pricePerKm = 1.2;
              break;
            case 'premium':
              pricePerKm = 2.0;
              break;
            case 'electric':
              pricePerKm = 1.8;
              break;
            default:
              pricePerKm = 1.5;
          }
          
          const totalPrice = basePrice + (distance * pricePerKm);
          setEstimatedPrice(Math.round(totalPrice * 100) / 100);
        }
      });
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadSavedLocations();
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (formData.pickup && formData.destination && selectedOption && window.google?.maps) {
      calculateDistanceAndPrice();
    }
  }, [formData.pickup, formData.destination, selectedOption]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      const rideData = {
        user_id: user.id,
        pickup: formData.pickup,
        dropoff: formData.destination,
        date: formData.date,
        time: formData.time,
        passengers: formData.passengers,
        ride_type: formData.rideType,
        special_requests: formData.specialRequests,
        status: 'pending',
        estimated_price: estimatedPrice,
        estimated_distance: estimatedDistance,
        estimated_duration: estimatedDuration
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([rideData])
        .select()
        .single();

      if (error) throw error;

      onRideBooked(data);
      
      // Reset form
      setFormData({
        pickup: '',
        destination: '',
        date: '',
        time: '',
        passengers: 1,
        rideType: 'standard',
        specialRequests: ''
      });
      
    } catch (error) {
      console.error('Error booking ride:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rideOptions = [
    { id: 'economy', name: 'Économique', icon: Car, price: '€', description: 'Option abordable' },
    { id: 'standard', name: 'Standard', icon: Car, price: '€€', description: 'Confort standard' },
    { id: 'premium', name: 'Premium', icon: Car, price: '€€€', description: 'Véhicule haut de gamme' },
    { id: 'electric', name: 'Électrique', icon: Car, price: '€€', description: 'Véhicule écologique' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Réserver une course
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Point de départ
              </label>
              <AddressInput
                value={formData.pickup}
                onChange={(value) => handleInputChange('pickup', value)}
                placeholder="Adresse de départ"
                savedLocations={savedLocations}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Destination
              </label>
              <AddressInput
                value={formData.destination}
                onChange={(value) => handleInputChange('destination', value)}
                placeholder="Adresse de destination"
                savedLocations={savedLocations}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Heure
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Passengers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Nombre de passagers
            </label>
            <select
              value={formData.passengers}
              onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} passager{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Ride Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Type de véhicule
            </label>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rideOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedOption(option.id);
                    handleInputChange('rideType', option.id);
                  }}
                >
                  <option.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <h3 className="font-medium text-center">{option.name}</h3>
                  <p className="text-sm text-gray-500 text-center">{option.description}</p>
                  <p className="text-lg font-bold text-center text-blue-600 mt-1">{option.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Estimation */}
          {estimatedPrice && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Estimation</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {estimatedPrice}€
                  </div>
                  {estimatedDistance && estimatedDuration && (
                    <div className="text-sm text-green-700">
                      {estimatedDistance.toFixed(1)} km • {estimatedDuration} min
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demandes spéciales (optionnel)
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              placeholder="Siège enfant, aide aux bagages, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.pickup || !formData.destination || !formData.date || !formData.time}
            className="w-full py-3 text-lg"
          >
            {isLoading ? 'Réservation en cours...' : 'Réserver maintenant'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BookRide;