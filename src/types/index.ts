import { User, AuthError } from '@supabase/supabase-js';

export interface Ride {
  id: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  status: RideStatus;
  price: number;
  distance: number;
  duration: number;
  carbonFootprint: number;
  driverId?: string;
  userId: string;
  vehicleType: VehicleType;
  createdAt: Date;
  scheduledFor?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  rating: number;
  ridesCompleted: number;
  carbonSaved: number;
  preferredVehicleTypes: VehicleType[];
  corporateId?: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  rating: number;
  ridesCompleted: number;
  vehicle: Vehicle;
  isAvailable: boolean;
  currentLocation?: Location;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: VehicleType;
  ecoRating: number;
  capacity: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export enum RideStatus {
  SEARCHING = 'searching',
  MATCHED = 'matched',
  DRIVER_EN_ROUTE = 'driver_en_route',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum VehicleType {
  ECONOMY = 'economy',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  SHARED = 'shared',
  AIRPORT = 'airport'
}

export interface CarbonImpact {
  savings: number;
  comparisonToRegular: number;
  treesEquivalent: number;
}