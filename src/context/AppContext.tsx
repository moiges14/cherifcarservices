import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Driver, Ride, VehicleType, RideStatus, Location } from '../types';
import { generateMockRides, generateMockUser } from '../utils/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  rides: Ride[];
  currentRide: Ride | null;
  setCurrentRide: (ride: Ride | null) => void;
  bookRide: (
    pickupLocation: Location,
    dropoffLocation: Location,
    vehicleType: VehicleType,
    scheduledFor?: Date
  ) => Promise<Ride>;
  cancelRide: (rideId: string) => Promise<boolean>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(generateMockUser());
  const [rides, setRides] = useState<Ride[]>(generateMockRides());
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const bookRide = async (
    pickupLocation: Location,
    dropoffLocation: Location,
    vehicleType: VehicleType,
    scheduledFor?: Date
  ): Promise<Ride> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRide: Ride = {
      id: `ride-${Date.now()}`,
      pickupLocation,
      dropoffLocation,
      status: RideStatus.SEARCHING,
      price: calculatePrice(pickupLocation, dropoffLocation, vehicleType),
      distance: calculateDistance(pickupLocation, dropoffLocation),
      duration: calculateDuration(pickupLocation, dropoffLocation),
      carbonFootprint: calculateCarbonFootprint(pickupLocation, dropoffLocation, vehicleType),
      userId: currentUser?.id || 'unknown',
      vehicleType,
      createdAt: new Date(),
      scheduledFor
    };

    // Simulate finding a driver after a delay
    setTimeout(() => {
      const updatedRide = { ...newRide, status: RideStatus.MATCHED, driverId: `driver-${Date.now()}` };
      setRides(prev => [...prev, updatedRide]);
      setCurrentRide(updatedRide);
    }, 3000);

    setRides(prev => [...prev, newRide]);
    setCurrentRide(newRide);
    setIsLoading(false);

    return newRide;
  };

  const cancelRide = async (rideId: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRides(prev => 
      prev.map(ride => 
        ride.id === rideId ? { ...ride, status: RideStatus.CANCELLED } : ride
      )
    );
    
    if (currentRide?.id === rideId) {
      setCurrentRide(prev => prev ? { ...prev, status: RideStatus.CANCELLED } : null);
    }
    
    setIsLoading(false);
    return true;
  };

  // Utility functions for ride calculations
  const calculatePrice = (pickup: Location, dropoff: Location, vehicleType: VehicleType): number => {
    const distance = calculateDistance(pickup, dropoff);
    const baseRate = getBaseRateForVehicleType(vehicleType);
    return +(baseRate * distance + 2.5).toFixed(2);
  };

  const getBaseRateForVehicleType = (type: VehicleType): number => {
    switch (type) {
      case VehicleType.ECONOMY: return 1.2;
      case VehicleType.STANDARD: return 1.5;
      case VehicleType.PREMIUM: return 2.2;
      case VehicleType.ELECTRIC: return 1.8;
      case VehicleType.HYBRID: return 1.6;
      case VehicleType.SHARED: return 0.9;
      default: return 1.5;
    }
  };

  const calculateDistance = (pickup: Location, dropoff: Location): number => {
    // Vérifier que les objets Location sont valides
    if (!pickup || !dropoff || 
        typeof pickup.latitude !== 'number' || 
        typeof pickup.longitude !== 'number' ||
        typeof dropoff.latitude !== 'number' || 
        typeof dropoff.longitude !== 'number') {
      console.warn('Invalid location objects provided to calculateDistance');
      return 10; // Distance par défaut en cas d'erreur
    }
    
    // Simple mock distance calculation
    const latDiff = Math.abs(pickup.latitude - dropoff.latitude);
    const lngDiff = Math.abs(pickup.longitude - dropoff.longitude);
    return +(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111).toFixed(1);
  };

  const calculateDuration = (pickup: Location, dropoff: Location): number => {
    // Mock duration calculation (in minutes)
    const distance = calculateDistance(pickup, dropoff);
    return Math.round(distance * 2 + 5);
  };

  const calculateCarbonFootprint = (pickup: Location, dropoff: Location, vehicleType: VehicleType): number => {
    const distance = calculateDistance(pickup, dropoff);
    const baseEmission = 120; // g CO2 per km for standard car
    
    const emissionFactors = {
      [VehicleType.ECONOMY]: 0.9,
      [VehicleType.STANDARD]: 1.0,
      [VehicleType.PREMIUM]: 1.5,
      [VehicleType.ELECTRIC]: 0.2,
      [VehicleType.HYBRID]: 0.6,
      [VehicleType.SHARED]: 0.5,
    };
    
    return +(distance * baseEmission * emissionFactors[vehicleType]).toFixed(0);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        rides,
        currentRide,
        setCurrentRide,
        bookRide,
        cancelRide,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};