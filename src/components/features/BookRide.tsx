import React, { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Clock, Users, Zap, Car, DollarSign, Calendar, Phone, User, X } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Badge from '../common/Badge';
import MapComponent from '../maps/MapComponent';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../hooks/useNotifications';
import StripeCheckout from '../payment/StripeCheckout';
import RoutePreview from './RoutePreview';
import AddressInput from '../common/AddressInput';

interface RideOption {
  id: string;
  type: 'economy' | 'standard' | 'premium' | 'electric';
  name: string;
  description: string;
  basePrice: number;
  pricePerKm: number;
  estimatedTime: number;
  icon: React.ComponentType<any>;
  features: string[];
  maxPassengers: number;
}

interface BookingFormData {
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  rideType: string;
  specialRequests: string;
  contactPhone: string;
  isScheduled: boolean;
}

const rideOptions: RideOption[] = [
  {
    id: 'economy',
    type: 'economy',
    name: 'Économique',
    description: 'Option abordable pour vos trajets quotidiens',
    basePrice: 9.00,
    pricePerKm: 1.50,
    estimatedTime: 8,
    icon: Car,
    features: ['4 places', 'Climatisation', 'WiFi gratuit'],
    maxPassengers: 4
  },
  {
    id: 'standard',
    type: 'standard',
    name: 'Standard',
    description: 'Confort et fiabilité pour tous vos déplacements',
    basePrice: 12.00,
    pricePerKm: 2.00,
    estimatedTime: 6,
    icon: Car,
    features: ['4 places', 'Climatisation', 'WiFi gratuit', 'Chargeur USB'],
    maxPassengers: 4
  },
  {
    id: 'premium',
    type: 'premium',
    name: 'Premium',
    description: 'Expérience de luxe avec véhicules haut de gamme',
    basePrice: 20.00,
    pricePerKm: 3.50,
    estimatedTime: 5,
    icon: Car,
    features: ['4 places', 'Cuir', 'WiFi gratuit', 'Chargeur USB', 'Eau offerte'],
    maxPassengers: 4
  },
  {
    id: 'electric',
    type: 'electric',
    name: 'Électrique',
    description: 'Transport écologique avec véhicules 100% électriques',
    basePrice: 15.00,
    pricePerKm: 2.50,
    estimatedTime: 7,
    icon: Zap,
    features: ['4 places', 'Zéro émission', 'WiFi gratuit', 'Chargeur USB'],
    maxPassengers: 4
  }
];

interface BookRideProps {
  onRideBooked: (rideData: any) => void;
}

export default function BookRide({ onRideBooked }: BookRideProps) {
  const { user } = useAuth();
  const { notifyNewBooking } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showRoutePreview, setShowRoutePreview] = useState(false);
  const [googleMaps, setGoogleMaps] = useState<typeof google.maps | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    pickup: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    passengers: 1,
    rideType: '',
    specialRequests: '',
    contactPhone: '',
    isScheduled: false
  });

  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);

  useEffect(() => {
    if (user) {
      loadSavedLocations();
      loadUserProfile();
    }
    initializeGoogleMaps();
  }, [user]);

  useEffect(() => {
    if (formData.pickup && formData.destination && selectedOption && googleMaps) {
      calculateDistanceAndPrice();
    }
  }, [formData.pickup, formData.destination, selectedOption, googleMaps]);

  const initializeGoogleMaps = async () => {
    if (window.google && window.google.maps) {
      setGoogleMaps(window.google.maps);
      return;
    }

    try {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places', 'geometry'],
        language: 'fr',
        region: 'FR'
      });

      await loader.load();
      setGoogleMaps(window.google.maps);
    } catch (error) {
      console.error('Erreur lors du chargement de Google Maps:', error);
      setGoogleMaps(null);
    }
  };

  const loadSavedLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedLocations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des lieux sauvegardés:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data?.phone) {
        setFormData(prev => ({ ...prev, contactPhone: data.phone }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const calculateDistanceAndPrice = async () => {
    if (!selectedOption) return;
    
    try {
      // Utiliser l'API Google Maps Distance Matrix
      const service = new google.maps.DistanceMatrixService();
      
      const result = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        service.getDistanceMatrix({
          origins: [formData.pickup],
          destinations: [formData.destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Distance Matrix API error: ${status}`));
          }
        });
      });

      const element = result.rows[0]?.elements[0];
      
      if (element && element.status === 'OK') {
        const distanceInKm = element.distance.value / 1000; // Convertir en km
        const durationInMinutes = Math.ceil(element.duration.value / 60); // Convertir en minutes
        const price = selectedOption.basePrice + (distanceInKm * selectedOption.pricePerKm);
        
        setEstimatedDistance(distanceInKm);
        setEstimatedDuration(durationInMinutes);
        setEstimatedPrice(price);
      } else {
        // Fallback en cas d'erreur
        console.warn('Impossible de calculer la distance, utilisation d\'une estimation');
        const fallbackDistance = 10; // 10 km par défaut
        const fallbackDuration = 15; // 15 minutes par défaut
        const price = selectedOption.basePrice + (fallbackDistance * selectedOption.pricePerKm);
        
        setEstimatedDistance(fallbackDistance);
        setEstimatedDuration(fallbackDuration);
        setEstimatedPrice(price);
      }
    } catch (error) {
      console.error('Erreur lors du calcul de distance:', error);
      
      // Fallback en cas d'erreur
      const fallbackDistance = 10; // 10 km par défaut
      const fallbackDuration = 15; // 15 minutes par défaut
      const price = selectedOption.basePrice + (fallbackDistance * selectedOption.pricePerKm);
      
      setEstimatedDistance(fallbackDistance);
      setEstimatedDuration(fallbackDuration);
      setEstimatedPrice(price);
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

  const handleLocationSelect = (field: 'pickup' | 'destination', location: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: location.address
    }));
    
    // Store coordinates for RoutePreview
    if (field === 'pickup') {
      setPickupCoords({ lat: location.lat, lng: location.lng });
    } else {
      setDestinationCoords({ lat: location.lat, lng: location.lng });
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && formData.pickup && formData.destination) {
      // Afficher l'aperçu du trajet avant de passer à l'étape 2
      setShowRoutePreview(true);
    } else if (currentStep === 2 && selectedOption) {
      setCurrentStep(3);
    }
  };

  const handleRouteConfirm = () => {
    setShowRoutePreview(false);
    setCurrentStep(2);
  };

  const handleRouteEdit = () => {
    setShowRoutePreview(false);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookRide = async () => {
    if (!selectedOption || !user) return;

    setLoading(true);
    try {
      const bookingData = {
        user_id: user.id,
        ride_type: selectedOption.type,
        pickup: formData.pickup,
        dropoff: formData.destination,
        date: formData.date,
        time: formData.time,
        status: 'pending',
        passengers: formData.passengers,
        special_requests: formData.specialRequests,
        contact_phone: formData.contactPhone,
        estimated_price: estimatedPrice,
        estimated_distance: estimatedDistance,
        estimated_duration: estimatedDuration
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Créer une notification pour les chauffeurs disponibles
      await notifyAvailableDrivers(data);
      
      // Envoyer les notifications de nouvelle commande
      await notifyNewBooking(data);

      onRideBooked && onRideBooked({
        ...data,
        driver: null,
        estimatedPrice: estimatedPrice
      });

      // Réinitialiser le formulaire
      setCurrentStep(1);
      setFormData({
        pickup: '',
        destination: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        passengers: 1,
        rideType: '',
        specialRequests: '',
        contactPhone: formData.contactPhone,
        isScheduled: false
      });
      setSelectedOption(null);

    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    setShowPayment(true);
  };

  const notifyAvailableDrivers = async (booking: any) => {
    try {
      // Récupérer les chauffeurs disponibles
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('status', 'available');

      if (error) throw error;

      // Ici, vous pourriez implémenter un système de notification
      // par exemple, envoyer des notifications push ou des emails
      console.log(`Notification envoyée à ${drivers?.length || 0} chauffeurs pour la réservation ${booking.id}`);
    } catch (error) {
      console.error('Erreur lors de la notification des chauffeurs:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Où souhaitez-vous aller ?</h2>
        <p className="text-gray-600">Saisissez vos adresses de départ et d'arrivée</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse de départ
          </label>
          <AddressInput
            placeholder="D'où partez-vous ?"
            value={formData.pickup}
            onChange={(value) => setFormData(prev => ({ ...prev, pickup: value }))}
            onPlaceSelect={(place) => {
              if (place && place.geometry && place.geometry.location) {
                handleLocationSelect('pickup', {
                  address: place.formatted_address || place.name || formData.pickup,
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  place_id: place.place_id,
                  name: place.name
                });
              }
            }}
            icon={<MapPin size={18} className="text-green-500" />}
          />
          
          {savedLocations.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">Lieux sauvegardés :</p>
              <div className="flex flex-wrap gap-2">
                {savedLocations.slice(0, 3).map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect('pickup', location)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <AddressInput
            placeholder="Où allez-vous ?"
            value={formData.destination}
            onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
            onPlaceSelect={(place) => {
              if (place && place.geometry && place.geometry.location) {
                handleLocationSelect('destination', {
                  address: place.formatted_address || place.name || formData.destination,
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  place_id: place.place_id,
                  name: place.name
                });
              }
            }}
            icon={<MapPin size={18} className="text-red-500" />}
          />
          
          {savedLocations.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">Lieux sauvegardés :</p>
              <div className="flex flex-wrap gap-2">
                {savedLocations.slice(0, 3).map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect('destination', location)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              leftIcon={<Calendar size={18} />}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                date: e.target.value,
                isScheduled: e.target.value !== new Date().toISOString().split('T')[0]
              }))}
              min={new Date().toISOString().split('T')[0]}
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure
            </label>
            <Input
              leftIcon={<Clock size={18} />}
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              fullWidth
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de passagers
          </label>
          <select
            value={formData.passengers}
            onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>{num} passager{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={handleNextStep}
        className="w-full"
        disabled={!formData.pickup || !formData.destination}
      >
        Voir l'aperçu du trajet
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre véhicule</h2>
        <p className="text-gray-600">Sélectionnez le type de service qui vous convient</p>
      </div>

      {/* Résumé du trajet */}
      <Card className="bg-gray-50">
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
            <div>
              <div className="text-sm text-gray-500">Départ</div>
              <div className="font-medium">{formData.pickup}</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
            <div>
              <div className="text-sm text-gray-500">Destination</div>
              <div className="font-medium">{formData.destination}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {formData.date} à {formData.time} • {formData.passengers} passager{formData.passengers > 1 ? 's' : ''}
            </span>
            {formData.isScheduled && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  onClick={handlePaymentClick}
                  className="flex-1"
                  disabled={loading}
                >
                  Payer maintenant
                </Button>
                <Badge variant="info" size="sm">Programmé</Badge>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Options de véhicules */}
      <div className="space-y-4">
        {rideOptions
          .filter(option => option.maxPassengers >= formData.passengers)
          .map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedOption?.id === option.id;
            const estimatedPrice = option.basePrice + (estimatedDistance * option.pricePerKm);
            
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-emerald-500 bg-emerald-50' 
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
                          <Badge variant="success" size="sm">Écologique</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{option.maxPassengers} places</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>~{estimatedDuration > 0 ? formatDuration(estimatedDuration) : `${option.estimatedTime} min`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">{estimatedPrice.toFixed(2)} €</div>
                    <div className="text-xs text-gray-500">Prix estimé</div>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Inclus :</strong> {option.features.join(', ')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Tarif : {option.basePrice}€ + {option.pricePerKm}€/km
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          onClick={handleNextStep}
          className="flex-1"
          disabled={!selectedOption}
        >
          Continuer
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Finaliser la réservation</h2>
        <p className="text-gray-600">Vérifiez les détails et confirmez votre course</p>
      </div>

      {/* Résumé complet */}
      <Card>
        <h3 className="font-semibold mb-4">Résumé de votre course</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Service</span>
            <span className="font-medium">{selectedOption?.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Date et heure</span>
            <span className="font-medium">{formData.date} à {formData.time}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Passagers</span>
            <span className="font-medium">{formData.passengers}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Distance estimée</span>
            <span className="font-medium">
              {estimatedDistance > 0 ? `${estimatedDistance.toFixed(1)} km` : 'Calcul en cours...'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Durée estimée</span>
            <span className="font-medium">
              {estimatedDuration > 0 ? formatDuration(estimatedDuration) : 'Calcul en cours...'}
            </span>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Prix total</span>
              <span className="text-emerald-600">{estimatedPrice.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Informations de contact */}
      <Card>
        <h3 className="font-semibold mb-4">Informations de contact</h3>
        
        <div className="space-y-4">
          <Input
            leftIcon={<Phone size={18} />}
            type="tel"
            placeholder="Numéro de téléphone"
            value={formData.contactPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
            fullWidth
            label="Téléphone de contact"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demandes spéciales (optionnel)
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Siège bébé, assistance bagages, arrêt supplémentaire..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              rows={3}
            />
          </div>
        </div>
      </Card>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          onClick={handleBookRide}
          className="flex-1"
          disabled={loading || !formData.contactPhone}
          isLoading={loading}
        >
          {loading ? 'Réservation...' : 'Confirmer la réservation'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Itinéraire</span>
          <span>Véhicule</span>
          <span>Confirmation</span>
        </div>
      </div>

      <Card>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </Card>

      {/* Aperçu du trajet */}
      {showRoutePreview && formData.pickup && formData.destination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Aperçu de votre trajet</h2>
                <button
                  onClick={() => setShowRoutePreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <RoutePreview
                pickup={{
                  address: formData.pickup,
                  lat: pickupCoords?.lat || 48.8566,
                  lng: pickupCoords?.lng || 2.3522
                }}
                destination={{
                  address: formData.destination,
                  lat: destinationCoords?.lat || 48.8606,
                  lng: destinationCoords?.lng || 2.3376
                }}
                vehicleType={selectedOption?.type || 'standard'}
                onConfirm={handleRouteConfirm}
                onEdit={handleRouteEdit}
              />
            </div>
          </div>
        </div>
      )}

      <StripeCheckout
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        selectedService="reservation"
        amount={estimatedPrice}
      />
    </div>
  );
}