import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Map from '../maps/Map';
import PaymentModal from '../payment/PaymentModal';
import { Car, Calendar, Clock, ChevronDown, ChevronUp, ArrowRight, Leaf, Users, Timer, Zap, MapPin, X, Search, Info, History, Star } from 'lucide-react';
import { VehicleType, Location } from '../../types';

const BookRide: React.FC = () => {
  const { bookRide, isLoading } = useApp();
  
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>(VehicleType.STANDARD);
  const [step, setStep] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>('vehicle');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [showDiscount, setShowDiscount] = useState(false);
  const [waitTime, setWaitTime] = useState(5);
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff' | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);

  const [suggestedLocations, setSuggestedLocations] = useState<Array<{
    address: string;
    type: 'recent' | 'popular' | 'saved';
    location: Location;
  }>>([
    {
      address: 'Eiffel Tower, Champ de Mars, Paris',
      type: 'popular',
      location: { latitude: 48.8584, longitude: 2.2945 }
    },
    {
      address: 'Arc de Triomphe, Place Charles de Gaulle, Paris',
      type: 'popular',
      location: { latitude: 48.8738, longitude: 2.2950 }
    },
    {
      address: 'Notre-Dame Cathedral, Paris',
      type: 'popular',
      location: { latitude: 48.8530, longitude: 2.3499 }
    },
    {
      address: 'Louvre Museum, Rue de Rivoli, Paris',
      type: 'recent',
      location: { latitude: 48.8606, longitude: 2.3376 }
    },
    {
      address: 'Champs-Élysées, Paris',
      type: 'saved',
      location: { latitude: 48.8698, longitude: 2.3075 }
    }
  ]);

  useEffect(() => {
    if (pickupLocation && dropoffLocation && step === 1) {
      setStep(2);
    }
  }, [pickupLocation, dropoffLocation]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Mock search results for demo
    const mockResults: Location[] = [
      {
        latitude: 48.8566,
        longitude: 2.3522,
        address: `${query} - Paris, France`
      },
      {
        latitude: 48.8606,
        longitude: 2.3376,
        address: `${query} - Champs-Élysées, Paris`
      },
      {
        latitude: 48.8584,
        longitude: 2.2945,
        address: `${query} - Tour Eiffel, Paris`
      }
    ];

    setSearchResults(mockResults);
  };

  const handleLocationSelect = (location: Location, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      setPickupLocation(location);
    } else {
      setDropoffLocation(location);
    }
    setSearchQuery('');
    setSearchResults([]);
    setActiveInput(null);
  };

  const handleBookRide = async () => {
    if (!pickupLocation || !dropoffLocation) return;
    
    const priceInCents = Math.round(parseFloat(calculatePrice(pickupLocation, dropoffLocation).replace('€', '')) * 100);
    setPaymentAmount(priceInCents);
    setShowPayment(true);
  };

  const processBooking = async () => {
    if (!pickupLocation || !dropoffLocation) return;
    
    let scheduledFor: Date | undefined;
    if (isScheduled && scheduledDate && scheduledTime) {
      scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    }
    
    await bookRide(pickupLocation, dropoffLocation, selectedVehicleType, scheduledFor);
    
    // Reset form
    setPickupLocation(null);
    setDropoffLocation(null);
    setSelectedVehicleType(VehicleType.STANDARD);
    setStep(1);
    setExpandedSection('vehicle');
    setIsScheduled(false);
    setScheduledDate('');
    setScheduledTime('');
    setShowDiscount(false);
  };

  const calculatePrice = (pickup: Location, dropoff: Location): string => {
    if (!pickup || !dropoff) return '€0.00';
    
    // Calculate distance in kilometers
    const distance = calculateDistance(pickup, dropoff);
    
    // Base fare is 9 euros
    const baseFare = 9;
    
    // Additional kilometers are charged at 2 euros per km
    const additionalKmCharge = Math.max(0, distance - 1) * 2;
    
    // Total price is base fare plus additional kilometer charges
    const totalPrice = baseFare + additionalKmCharge;
    
    return `€${totalPrice.toFixed(2)}`;
  };

  const calculateDistance = (pickup: Location, dropoff: Location): number => {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = pickup.latitude * Math.PI / 180;
    const lat2 = dropoff.latitude * Math.PI / 180;
    const dLat = (dropoff.latitude - pickup.latitude) * Math.PI / 180;
    const dLon = (dropoff.longitude - pickup.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return +(R * c).toFixed(1); // Distance in km, rounded to 1 decimal
  };

  const getVehicleTypeIcon = (type: VehicleType) => {
    switch (type) {
      case VehicleType.ELECTRIC:
        return <Zap size={16} className="text-green-600" />;
      case VehicleType.HYBRID:
        return <Leaf size={16} className="text-emerald-600" />;
      case VehicleType.SHARED:
        return <Users size={16} className="text-sky-600" />;
      case VehicleType.PREMIUM:
        return <Car size={16} className="text-amber-600" />;
      case VehicleType.AIRPORT:
        return <Car size={16} className="text-blue-600" />;
      case VehicleType.ECONOMY:
      case VehicleType.STANDARD:
      default:
        return <Car size={16} />;
    }
  };

  const renderSuggestions = (type: 'pickup' | 'dropoff') => {
    if (!activeInput || activeInput !== type || searchQuery.trim() || searchResults.length > 0) {
      return null;
    }

    return (
      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 divide-y divide-gray-100">
        {/* Recent Locations */}
        <div className="p-2">
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <History size={14} className="mr-1" /> Recent Places
            </h3>
          </div>
          {suggestedLocations
            .filter(loc => loc.type === 'recent')
            .map((location, index) => (
              <button
                key={`recent-${index}`}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-start"
                onClick={() => handleLocationSelect(location.location, type)}
              >
                <MapPin size={16} className="mt-1 mr-2 flex-shrink-0 text-gray-400" />
                <span className="text-sm text-gray-700">{location.address}</span>
              </button>
            ))}
        </div>

        {/* Popular Destinations */}
        <div className="p-2">
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Star size={14} className="mr-1" /> Popular Destinations
            </h3>
          </div>
          {suggestedLocations
            .filter(loc => loc.type === 'popular')
            .map((location, index) => (
              <button
                key={`popular-${index}`}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-start"
                onClick={() => handleLocationSelect(location.location, type)}
              >
                <MapPin size={16} className="mt-1 mr-2 flex-shrink-0 text-gray-400" />
                <span className="text-sm text-gray-700">{location.address}</span>
              </button>
            ))}
        </div>

        {/* Saved Locations */}
        <div className="p-2">
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <MapPin size={14} className="mr-1" /> Saved Places
            </h3>
          </div>
          {suggestedLocations
            .filter(loc => loc.type === 'saved')
            .map((location, index) => (
              <button
                key={`saved-${index}`}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-start"
                onClick={() => handleLocationSelect(location.location, type)}
              >
                <MapPin size={16} className="mt-1 mr-2 flex-shrink-0 text-gray-400" />
                <span className="text-sm text-gray-700">{location.address}</span>
              </button>
            ))}
        </div>
      </div>
    );
  };

  const renderLocationInput = (type: 'pickup' | 'dropoff', placeholder: string) => {
    const location = type === 'pickup' ? pickupLocation : dropoffLocation;
    const icon = <MapPin size={18} className={type === 'pickup' ? 'text-emerald-600' : 'text-red-600'} />;

    return (
      <div className="relative">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
          <input
            type="text"
            value={activeInput === type ? searchQuery : location?.address || ''}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            onFocus={() => {
              setActiveInput(type);
              setSearchQuery('');
            }}
            placeholder={placeholder}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
              activeInput === type
                ? 'border-emerald-500 ring-emerald-200'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {location && (
            <button
              onClick={() => {
                if (type === 'pickup') setPickupLocation(null);
                else setDropoffLocation(null);
                if (step > 1) setStep(1);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search Results */}
        {activeInput === type && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
            {searchResults.map((result, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-start border-b last:border-b-0"
                onClick={() => handleLocationSelect(result, type)}
              >
                <MapPin size={16} className="mt-1 mr-2 flex-shrink-0 text-gray-400" />
                <span className="text-sm text-gray-700">{result.address}</span>
              </button>
            ))}
          </div>
        )}

        {/* Location Suggestions */}
        {renderSuggestions(type)}
      </div>
    );
  };

  const renderVehicleTypes = () => {
    const vehicleInfo = {
      [VehicleType.ECONOMY]: {
        icon: <Car size={20} />,
        title: 'Economy',
        description: 'Budget-friendly rides',
        features: ['4 seats', 'Basic comfort', 'Best price'],
        image: null
      },
      [VehicleType.STANDARD]: {
        icon: <Car size={20} />,
        title: 'Standard',
        description: 'Comfortable daily rides',
        features: ['4 seats', 'Air conditioning', 'Quality service'],
        image: null
      },
      [VehicleType.PREMIUM]: {
        icon: <Car size={20} className="text-amber-600" />,
        title: 'Premium',
        description: 'Luxury experience',
        features: ['4 seats', 'Premium vehicles', 'Professional driver'],
        image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      [VehicleType.ELECTRIC]: {
        icon: <Zap size={20} className="text-green-600" />,
        title: 'Electric',
        description: 'Zero emissions',
        features: ['4 seats', '100% electric', 'Eco-friendly'],
        image: "https://images.pexels.com/photos/18494158/pexels-photo-18494158/free-photo-of-a-black-tesla-model-y-parked-on-a-street.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      },
      [VehicleType.HYBRID]: {
        icon: <Leaf size={20} className="text-emerald-600" />,
        title: 'Hybrid',
        description: 'Low emissions',
        features: ['4 seats', 'Fuel efficient', 'Eco-conscious'],
        image: null
      },
      [VehicleType.SHARED]: {
        icon: <Users size={20} className="text-sky-600" />,
        title: 'Shared',
        description: 'Share your ride',
        features: ['2-3 seats', 'Split cost', 'Meet new people'],
        image: null
      },
      [VehicleType.AIRPORT]: {
        icon: <Car size={20} className="text-blue-600" />,
        title: 'Airport Transfer',
        description: 'Reliable airport service',
        features: ['4 seats', 'Flight tracking', 'Meet & Greet'],
        image: null
      }
    };

    return (
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(vehicleInfo).map(([type, info]) => (
          <button
            key={type}
            onClick={() => setSelectedVehicleType(type as VehicleType)}
            className={`
              flex flex-col p-4 rounded-lg border transition-all
              ${selectedVehicleType === type
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {info.image ? (
              <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                <img 
                  src={info.image} 
                  alt={info.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center mb-2">
                <span className="mr-2">{info.icon}</span>
                <span className="font-medium">{info.title}</span>
              </div>
            )}
            {!info.image && (
              <>
                <p className="text-xs text-gray-500 mb-2">{info.description}</p>
                <div className="flex flex-wrap gap-1">
                  {info.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </>
            )}
            {info.image && (
              <div className="mt-2">
                <h3 className="font-medium">{info.title}</h3>
                <p className="text-sm text-gray-600">{info.description}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderPricingTable = () => {
    return (
      <div className="border-t border-gray-200 pt-4">
        <button
          className="w-full flex justify-between items-center py-3 text-lg font-medium"
          onClick={() => setExpandedSection(expandedSection === 'rates' ? null : 'rates')}
        >
          <span>Rate Card</span>
          {expandedSection === 'rates' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSection === 'rates' && (
          <div className="mt-3 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-emerald-600">Fixed Rate</h3>
                <p className="text-3xl font-bold mt-2">€2.00/km</p>
                <p className="text-gray-600 mt-2">Simple, transparent pricing for all rides</p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="font-medium">Base Rate</span>
                  <span className="text-emerald-600 font-bold">€2.00 per kilometer</span>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-medium text-emerald-800 mb-2">Included in Every Ride:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-emerald-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                      Professional driver
                    </li>
                    <li className="flex items-center text-emerald-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                      Air-conditioned vehicle
                    </li>
                    <li className="flex items-center text-emerald-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                      Door-to-door service
                    </li>
                    <li className="flex items-center text-emerald-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                      24/7 customer support
                    </li>
                  </ul>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>* Additional fees may apply for tolls and waiting time</p>
                  <p>* Minimum fare may apply for very short distances</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Full-screen map background */}
      <div className="absolute inset-0 z-0">
        <Map
          markers={[
            ...(pickupLocation ? [{ ...pickupLocation, icon: 'pickup' }] : []),
            ...(dropoffLocation ? [{ ...dropoffLocation, icon: 'dropoff' }] : []),
          ]}
          onLocationSelect={(location) => {
            if (activeInput) {
              handleLocationSelect(location, activeInput);
            }
          }}
          showRoute={!!(pickupLocation && dropoffLocation)}
          className="w-full h-full"
        />
      </div>

      {/* Booking interface overlay */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="max-w-md mx-auto pt-6 px-4 pb-20">
          <Card className="backdrop-blur-sm bg-white/95 shadow-lg">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Réserver une course</h2>
              
              {renderLocationInput('pickup', 'Point de départ')}
              {renderLocationInput('dropoff', 'Destination')}
              
              {step >= 2 && (
                <>
                  <div>
                    <button
                      className="w-full flex justify-between items-center py-3 text-lg font-medium"
                      onClick={() => setExpandedSection(expandedSection === 'vehicle' ? null : 'vehicle')}
                    >
                      <span>Type de véhicule</span>
                      {expandedSection === 'vehicle' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {expandedSection === 'vehicle' && renderVehicleTypes()}
                  </div>
                  
                  {renderPricingTable()}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      className="w-full flex justify-between items-center py-3 text-lg font-medium"
                      onClick={() => setExpandedSection(expandedSection === 'schedule' ? null : 'schedule')}
                    >
                      <span>Horaire</span>
                      {expandedSection === 'schedule' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {expandedSection === 'schedule' && (
                      <div className="mt-3 space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="schedule-ride"
                            checked={isScheduled}
                            onChange={(e) => setIsScheduled(e.target.checked)}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          <label htmlFor="schedule-ride" className="ml-2 block text-sm text-gray-700">
                            Réserver pour plus tard
                          </label>
                        </div>
                        
                        {isScheduled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Calendar size={16} className="text-gray-400" />
                                </div>
                                <input
                                  type="date"
                                  id="date"
                                  value={scheduledDate}
                                  onChange={(e) => setScheduledDate(e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                                Heure
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Clock size={16} className="text-gray-400" />
                                </div>
                                <input
                                  type="time"
                                  id="time"
                                  value={scheduledTime}
                                  onChange={(e) => setScheduledTime(e.target.value)}
                                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Summary */}
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <div className="flex justify-between text-lg font-medium mb-2">
                      <span>Total</span>
                      <span>{pickupLocation && dropoffLocation ? calculatePrice(pickupLocation, dropoffLocation) : '€0.00'}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1" />
                          <span>Forfait de base €9.00</span>
                        </div>
                        {pickupLocation && dropoffLocation && (
                          <div className="flex items-center">
                            <Car size={16} className="mr-1" />
                            <span>{calculateDistance(pickupLocation, dropoffLocation)} km × €2.00</span>
                          </div>
                        )}
                      </div>
                      <div>{isScheduled ? 'Programmé' : 'Maintenant'}</div>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleBookRide}
                      disabled={!pickupLocation || !dropoffLocation || (isScheduled && (!scheduledDate || !scheduledTime))}
                      isLoading={isLoading}
                    >
                      {isScheduled ? 'Réserver' : 'Commander'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          amount={paymentAmount}
          onSuccess={processBooking}
        />
      )}
    </div>
  );
};

export default BookRide;