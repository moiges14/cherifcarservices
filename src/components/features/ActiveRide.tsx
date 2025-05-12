import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Map from '../maps/Map';
import { Phone, Clock, MapPin, Navigation, Leaf, X } from 'lucide-react';
import { RideStatus, VehicleType } from '../../types';

const ActiveRide: React.FC = () => {
  const { currentRide, cancelRide, isLoading, setCurrentRide } = useApp();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Timer for ride in progress
  useEffect(() => {
    let interval: number | undefined;
    
    if (currentRide && currentRide.status === RideStatus.IN_PROGRESS) {
      interval = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentRide]);
  
  // Simulate driver location updates
  useEffect(() => {
    if (!currentRide || 
        currentRide.status === RideStatus.COMPLETED || 
        currentRide.status === RideStatus.CANCELLED ||
        currentRide.status === RideStatus.SEARCHING) {
      return;
    }

    const updateDriverLocation = () => {
      if (!currentRide.pickupLocation || !currentRide.dropoffLocation) return;

      // Calculate progress based on status
      let progress = 0;
      switch (currentRide.status) {
        case RideStatus.DRIVER_EN_ROUTE:
          progress = Math.random() * 0.8; // Random progress towards pickup
          break;
        case RideStatus.IN_PROGRESS:
          progress = 0.2 + (Math.random() * 0.6); // Random progress towards destination
          break;
        default:
          progress = 0;
      }

      // Interpolate between relevant points
      const startLat = currentRide.status === RideStatus.DRIVER_EN_ROUTE 
        ? currentRide.driver_location?.latitude || currentRide.pickupLocation.latitude 
        : currentRide.pickupLocation.latitude;
      const startLng = currentRide.status === RideStatus.DRIVER_EN_ROUTE
        ? currentRide.driver_location?.longitude || currentRide.pickupLocation.longitude
        : currentRide.pickupLocation.longitude;
      const endLat = currentRide.status === RideStatus.DRIVER_EN_ROUTE
        ? currentRide.pickupLocation.latitude
        : currentRide.dropoffLocation.latitude;
      const endLng = currentRide.status === RideStatus.DRIVER_EN_ROUTE
        ? currentRide.pickupLocation.longitude
        : currentRide.dropoffLocation.longitude;

      const newLat = startLat + (endLat - startLat) * progress;
      const newLng = startLng + (endLng - startLng) * progress;

      setDriverLocation({ latitude: newLat, longitude: newLng });

      // Update estimated arrival time
      const remainingDistance = calculateDistance(
        { latitude: newLat, longitude: newLng },
        currentRide.status === RideStatus.DRIVER_EN_ROUTE 
          ? currentRide.pickupLocation 
          : currentRide.dropoffLocation
      );
      const estimatedMinutes = Math.round(remainingDistance * 2); // Assume 30 km/h average speed
      setEstimatedArrival(`${estimatedMinutes} min`);
    };

    const interval = setInterval(updateDriverLocation, 3000);
    return () => clearInterval(interval);
  }, [currentRide]);

  const calculateDistance = (point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number => {
    const R = 6371; // Earth's radius in km
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  };
  
  if (!currentRide || currentRide.status === RideStatus.COMPLETED || currentRide.status === RideStatus.CANCELLED) {
    return null;
  }
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const getStatusBadge = () => {
    let variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" = "default";
    let label = '';
    
    switch (currentRide.status) {
      case RideStatus.SEARCHING:
        variant = 'info';
        label = 'Recherche de chauffeur';
        break;
      case RideStatus.MATCHED:
        variant = 'secondary';
        label = 'Chauffeur trouvé';
        break;
      case RideStatus.DRIVER_EN_ROUTE:
        variant = 'primary';
        label = 'Chauffeur en route';
        break;
      case RideStatus.ARRIVED:
        variant = 'warning';
        label = 'Chauffeur arrivé';
        break;
      case RideStatus.IN_PROGRESS:
        variant = 'success';
        label = 'En course';
        break;
    }
    
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  const getVehicleIcon = () => {
    switch(currentRide.vehicleType) {
      case VehicleType.ELECTRIC:
      case VehicleType.HYBRID:
        return <Leaf size={16} className="text-green-500" />;
      default:
        return null;
    }
  };
  
  const getEtaText = () => {
    if (estimatedArrival) {
      return currentRide.status === RideStatus.DRIVER_EN_ROUTE
        ? `Arrivée dans ${estimatedArrival}`
        : `Arrivée à destination dans ${estimatedArrival}`;
    }

    switch(currentRide.status) {
      case RideStatus.SEARCHING:
        return 'Recherche d\'un chauffeur...';
      case RideStatus.MATCHED:
        return 'Le chauffeur arrive dans 5 minutes';
      case RideStatus.DRIVER_EN_ROUTE:
        return 'Le chauffeur arrive dans 3 minutes';
      case RideStatus.ARRIVED:
        return 'Votre chauffeur est arrivé';
      case RideStatus.IN_PROGRESS:
        return `${currentRide.duration - Math.floor(timeElapsed / 60)} min jusqu'à destination`;
      default:
        return '';
    }
  };
  
  const handleCancel = async () => {
    if (isConfirmingCancel) {
      await cancelRide(currentRide.id);
      setIsConfirmingCancel(false);
    } else {
      setIsConfirmingCancel(true);
    }
  };
  
  // Mock driver info
  const driver = {
    name: 'Chérif',
    rating: 4.9,
    phone: '+33 6 06 76 18 24',
    vehicle: {
      make: 'Mercedes',
      model: 'Classe S',
      color: 'Noir',
      licensePlate: 'AB-123-CD'
    },
    photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600'
  };

  const renderMap = () => {
    if (!currentRide.pickupLocation || !currentRide.dropoffLocation) return null;

    const markers = [
      {
        ...currentRide.pickupLocation,
        icon: 'pickup'
      },
      {
        ...currentRide.dropoffLocation,
        icon: 'dropoff'
      }
    ];

    if (driverLocation) {
      markers.push({
        ...driverLocation,
        icon: 'driver'
      });
    }

    return (
      <div className="h-48 rounded-lg overflow-hidden mb-4">
        <Map
          markers={markers}
          showRoute={true}
          className="w-full h-full"
        />
      </div>
    );
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 p-4">
      <Card className="max-w-lg mx-auto border border-emerald-100">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <Navigation size={20} className="text-emerald-600" />
            <h3 className="font-medium">Course en cours</h3>
            <div>{getStatusBadge()}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsConfirmingCancel(true)}
            className="text-gray-500 hover:text-red-600"
          >
            <X size={18} />
          </Button>
        </div>

        {renderMap()}
        
        {currentRide.status !== RideStatus.SEARCHING && (
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                <img 
                  src={driver.photo} 
                  alt={driver.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">{driver.name}</div>
                <div className="text-sm text-gray-500">
                  {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
                </div>
              </div>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Phone size={16} />}
                className="mb-1"
                onClick={() => window.location.href = `tel:${driver.phone}`}
              >
                Appeler
              </Button>
              <div className="text-xs bg-gray-100 rounded p-1 text-center">
                {driver.vehicle.licensePlate}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between text-sm mb-4">
          <div className="flex items-center">
            <Clock size={16} className="text-gray-500 mr-1" />
            <span>{getEtaText()}</span>
          </div>
          <div className="flex items-center">
            {getVehicleIcon()}
            <span className="ml-1">{currentRide.price.toFixed(2)}€</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-700 mb-3">
          <div className="flex flex-col items-center mr-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div className="w-0.5 h-6 bg-gray-300 my-1"></div>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
          </div>
          <div className="flex-1">
            <div className="mb-2 truncate">{currentRide.pickupLocation.address}</div>
            <div className="truncate">{currentRide.dropoffLocation.address}</div>
          </div>
        </div>
        
        {isConfirmingCancel ? (
          <div className="mt-4 flex space-x-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsConfirmingCancel(false)}
            >
              Garder la course
            </Button>
            <Button
              variant="danger"
              fullWidth
              isLoading={isLoading}
              onClick={handleCancel}
            >
              Annuler la course
            </Button>
          </div>
        ) : (
          currentRide.status !== RideStatus.IN_PROGRESS && (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setIsConfirmingCancel(true)}
              className="mt-2"
            >
              Annuler la course
            </Button>
          )
        )}
      </Card>
    </div>
  );
};

export default ActiveRide;