import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../hooks/useNotifications';
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
  const { notifyNewBooking } = useNotifications();
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('standard');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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
    if (!formData.pickup || !formData.destination || !window.google?.maps?.DistanceMatrixService) {
      setEstimatedPrice(null);
      setEstimatedDistance(null);
      setEstimatedDuration(null);
      return;
    }

    setIsCalculating(true);
    
    try {
      const service = new window.google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [formData.pickup],
        destinations: [formData.destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
        region: 'FR'
      }, (response, status) => {
        setIsCalculating(false);
        
        if (status === window.google.maps.DistanceMatrixStatus.OK && 
            response?.rows[0]?.elements[0]?.status === 'OK') {
          const element = response.rows[0].elements[0];
          const distance = element.distance.value / 1000; // Convert to km
          const duration = element.duration.value / 60; // Convert to minutes
          
          setEstimatedDistance(distance);
          setEstimatedDuration(Math.round(duration));
          
          // Calculate price based on distance and ride type
          const calculatedPrice = calculatePrice(distance, selectedOption);
          setEstimatedPrice(calculatedPrice);
        } else {
          console.warn('Distance Matrix API error:', status, response);
          // Fallback: estimate based on straight-line distance
          const fallbackDistance = estimateStraightLineDistance(formData.pickup, formData.destination);
          if (fallbackDistance > 0) {
            setEstimatedDistance(fallbackDistance);
            setEstimatedDuration(Math.round(fallbackDistance * 2.5)); // Rough estimate
            setEstimatedPrice(calculatePrice(fallbackDistance, selectedOption));
          }
        }
      });
    } catch (error) {
      console.error('Error calculating distance:', error);
      setIsCalculating(false);
      
      // Fallback calculation
      const fallbackDistance = estimateStraightLineDistance(formData.pickup, formData.destination);
      if (fallbackDistance > 0) {
        setEstimatedDistance(fallbackDistance);
        setEstimatedDuration(Math.round(fallbackDistance * 2.5));
        setEstimatedPrice(calculatePrice(fallbackDistance, selectedOption));
      }
    }
  };

  const calculatePrice = (distanceKm: number, rideType: string): number => {
    let basePrice = 9; // Base price in euros (as per tariff)
    let pricePerKm = 2; // Price per km (as per tariff)
    
    switch (rideType) {
      case 'economy':
        basePrice = 7;
        pricePerKm = 1.5;
        break;
      case 'standard':
        basePrice = 9;
        pricePerKm = 2;
        break;
      case 'premium':
        basePrice = 15;
        pricePerKm = 3;
        break;
      case 'electric':
        basePrice = 10;
        pricePerKm = 2.2;
        break;
      default:
        basePrice = 9;
        pricePerKm = 2;
    }
    
    const totalPrice = basePrice + (distanceKm * pricePerKm);
    return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
  };

  const estimateStraightLineDistance = (pickup: string, destination: string): number => {
    // This is a very rough fallback - in reality you'd need geocoding
    // For now, return a default distance for demonstration
    if (pickup && destination && pickup !== destination) {
      // Rough estimate based on address length difference (very basic fallback)
      const lengthDiff = Math.abs(pickup.length - destination.length);
      return Math.max(5, Math.min(50, lengthDiff * 0.5)); // Between 5-50km
    }
    return 0;
  };

  // Debounced calculation to avoid too many API calls
  useEffect(() => {
    if (formData.pickup && formData.destination && selectedOption) {
      const timeoutId = setTimeout(() => {
        calculateDistanceAndPrice();
      }, 1000); // Wait 1 second after user stops typing
      
      return () => clearTimeout(timeoutId);
    } else {
      setEstimatedPrice(null);
      setEstimatedDistance(null);
      setEstimatedDuration(null);
    }
  }, [formData.pickup, formData.destination, selectedOption]);

  // Remove the old useEffect that was calling calculateDistanceAndPrice
  // useEffect(() => {
  //   if (formData.pickup && formData.destination && selectedOption && window.google?.maps) {
  //     calculateDistanceAndPrice();
  //   }
  // }, [formData.pickup, formData.destination, selectedOption]);

  const handleRideTypeChange = (rideType: string) => {
    setSelectedOption(rideType);
    handleInputChange('rideType', rideType);
    
    // Recalculate price immediately when ride type changes
    if (estimatedDistance) {
      const newPrice = calculatePrice(estimatedDistance, rideType);
      setEstimatedPrice(newPrice);
    }
  };

  const handleAddressChange = (field: 'pickup' | 'destination', value: string, placeData?: any) => {
    handleInputChange(field, value);
    
    // Store additional place data if available
    if (placeData && placeData.lat && placeData.lng) {
      // You could store coordinates for more accurate calculations
      console.log(`${field} coordinates:`, placeData.lat, placeData.lng);
    }
  };

  // Remove the old calculateDistanceAndPrice function and replace with the new one above
  // const calculateDistanceAndPrice = async () => {
  //   // ... old implementation
  // };

  // Update the ride type selection to use the new handler
  const rideOptions = [
    { 
      id: 'economy', 
      name: 'Économique', 
      icon: Car, 
      price: '7€ + 1,5€/km', 
      description: 'Option abordable' 
    },
    { 
      id: 'standard', 
      name: 'Standard', 
      icon: Car, 
      price: '9€ + 2€/km', 
      description: 'Confort standard' 
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      icon: Car, 
      price: '15€ + 3€/km', 
      description: 'Véhicule haut de gamme' 
    },
    { 
      id: 'electric', 
      name: 'Électrique', 
      icon: Car, 
      price: '10€ + 2,2€/km', 
      description: 'Véhicule écologique' 
    }
  ];

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
      // Vérifier que les champs requis sont remplis
      if (!formData.pickup || !formData.destination || !formData.date || !formData.time) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

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
        estimated_duration: estimatedDuration,
        contact_phone: userProfile?.phone || ''
      };

      console.log('Tentative de réservation avec les données:', rideData);

      const { data, error } = await supabase
        .from('bookings')
        .insert([rideData])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(`Erreur de réservation: ${error.message}`);
      }

      console.log('Réservation créée avec succès:', data);

      // Créer la référence de réservation après insertion
      const bookingWithRef = {
        ...data,
        booking_reference: `REF-${data.id.slice(-8)}`,
        user_email: user.email
      };

      // Envoyer les notifications
      try {
        await notifyNewBooking(bookingWithRef);
      } catch (notifError) {
        console.warn('Erreur lors de l\'envoi des notifications:', notifError);
        // Ne pas bloquer la réservation si les notifications échouent
      }

      // Appeler le callback avec les données complètes
      onRideBooked(bookingWithRef);
      
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

      // Réinitialiser les estimations
      setEstimatedPrice(null);
      setEstimatedDistance(null);
      setEstimatedDuration(null);

      // Message de succès
      alert('Réservation créée avec succès ! Vous recevrez une confirmation par email.');
      
    } catch (error) {
      console.error('Error booking ride:', error);
      alert(`Erreur lors de la réservation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
            disabled={isLoading || !formData.pickup || !formData.destination || !formData.date || !formData.time || !user}
            className="w-full py-3 text-lg"
          >
            {isLoading ? 'Réservation en cours...' : !user ? 'Connexion requise' : 'Réserver maintenant'}
          </Button>

          {!user && (
            <p className="text-center text-sm text-gray-600 mt-2">
              Vous devez être connecté pour effectuer une réservation
            </p>
          )}
        </form>
      </Card>
    </div>
  );
};

export default BookRide;