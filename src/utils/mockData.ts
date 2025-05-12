import { User, Ride, Driver, Vehicle, VehicleType, RideStatus, Location } from '../types';

export const generateMockUser = (): User => {
  return {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '555-123-4567',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    ridesCompleted: 47,
    carbonSaved: 27.4,
    preferredVehicleTypes: [VehicleType.ELECTRIC, VehicleType.HYBRID]
  };
};

export const generateMockDriver = (): Driver => {
  return {
    id: 'driver-1',
    name: 'Sam Wilson',
    email: 'sam@example.com',
    phone: '555-987-6543',
    profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    ridesCompleted: 362,
    vehicle: {
      id: 'vehicle-1',
      make: 'Tesla',
      model: 'Model 3',
      year: 2022,
      licensePlate: 'ECO123',
      type: VehicleType.ELECTRIC,
      ecoRating: 5,
      capacity: 4
    },
    isAvailable: true,
    currentLocation: {
      latitude: 37.7792,
      longitude: -122.4191,
      address: '123 Main St, San Francisco, CA'
    }
  };
};

export const generateMockRides = (): Ride[] => {
  return [
    {
      id: 'ride-1',
      pickupLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Market St, San Francisco, CA'
      },
      dropoffLocation: {
        latitude: 37.7833,
        longitude: -122.4167,
        address: '456 Powell St, San Francisco, CA'
      },
      status: RideStatus.COMPLETED,
      price: 18.50,
      distance: 2.3,
      duration: 12,
      carbonFootprint: 138,
      driverId: 'driver-2',
      userId: 'user-1',
      vehicleType: VehicleType.HYBRID,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
    {
      id: 'ride-2',
      pickupLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Market St, San Francisco, CA'
      },
      dropoffLocation: {
        latitude: 37.7833,
        longitude: -122.4167,
        address: '456 Powell St, San Francisco, CA'
      },
      status: RideStatus.COMPLETED,
      price: 12.75,
      distance: 1.5,
      duration: 8,
      carbonFootprint: 30,
      driverId: 'driver-3',
      userId: 'user-1',
      vehicleType: VehicleType.ELECTRIC,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    },
    {
      id: 'ride-3',
      pickupLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Market St, San Francisco, CA'
      },
      dropoffLocation: {
        latitude: 37.7633,
        longitude: -122.4167,
        address: '789 Valencia St, San Francisco, CA'
      },
      status: RideStatus.COMPLETED,
      price: 22.30,
      distance: 3.1,
      duration: 18,
      carbonFootprint: 62,
      driverId: 'driver-1',
      userId: 'user-1',
      vehicleType: VehicleType.HYBRID,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    }
  ];
};

export const generateMockLocations = (): Record<string, Location> => {
  return {
    home: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Market St, San Francisco, CA'
    },
    work: {
      latitude: 37.7833,
      longitude: -122.4167,
      address: '456 Powell St, San Francisco, CA'
    },
    gym: {
      latitude: 37.7633,
      longitude: -122.4167,
      address: '789 Valencia St, San Francisco, CA'
    },
    restaurant: {
      latitude: 37.7923,
      longitude: -122.4101,
      address: '321 Broadway, San Francisco, CA'
    },
  };
};