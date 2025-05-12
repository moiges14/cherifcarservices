import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Clock, MapPin, DollarSign, Leaf } from 'lucide-react';
import { RideStatus, VehicleType } from '../../types';

const RideHistory: React.FC = () => {
  const { rides } = useApp();
  
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: RideStatus) => {
    switch (status) {
      case RideStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>;
      case RideStatus.CANCELLED:
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="info">Active</Badge>;
    }
  };

  const getVehicleTypeBadge = (type: VehicleType) => {
    switch (type) {
      case VehicleType.ELECTRIC:
        return <Badge variant="primary" className="bg-green-100"><Leaf size={12} className="mr-1" /> Electric</Badge>;
      case VehicleType.HYBRID:
        return <Badge variant="info" className="bg-teal-100"><Leaf size={12} className="mr-1" /> Hybrid</Badge>;
      case VehicleType.ECONOMY:
        return <Badge variant="default">Economy</Badge>;
      case VehicleType.PREMIUM:
        return <Badge variant="secondary">Premium</Badge>;
      case VehicleType.SHARED:
        return <Badge variant="warning">Shared</Badge>;
      default:
        return <Badge variant="default">Standard</Badge>;
    }
  };

  // Filter out active rides and sort by date (newest first)
  const completedRides = rides
    .filter(ride => ride.status === RideStatus.COMPLETED || ride.status === RideStatus.CANCELLED)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ride History</h1>

      {completedRides.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No ride history yet</h3>
          <p className="mt-1 text-sm text-gray-500">Once you complete some rides, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedRides.map((ride) => (
            <Card key={ride.id} className="hover:shadow-md transition-shadow duration-200" hover>
              <div className="mb-3 flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{formatDate(ride.createdAt)}</div>
                  <div className="text-sm text-gray-500">{formatTime(ride.createdAt)}</div>
                </div>
                <div className="flex space-x-2">
                  {getStatusBadge(ride.status)}
                  {getVehicleTypeBadge(ride.vehicleType)}
                </div>
              </div>

              <div className="flex items-center mb-4 text-sm">
                <div className="flex flex-col items-center mr-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <div className="w-0.5 h-10 bg-gray-300 my-1"></div>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                </div>
                <div className="flex-1">
                  <div className="mb-3 flex items-start">
                    <MapPin size={14} className="text-emerald-600 mt-1 mr-1 flex-shrink-0" />
                    <div className="truncate">{ride.pickupLocation.address}</div>
                  </div>
                  <div className="flex items-start">
                    <MapPin size={14} className="text-red-600 mt-1 mr-1 flex-shrink-0" />
                    <div className="truncate">{ride.dropoffLocation.address}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Clock size={14} className="text-gray-500 mr-1" />
                    <span>{ride.duration} min</span>
                    <span className="mx-2">•</span>
                    <span>{ride.distance} km</span>
                  </div>
                  <div className="flex items-center font-medium">
                    <DollarSign size={14} className="text-gray-500 mr-1" />
                    <span>${ride.price.toFixed(2)}</span>
                  </div>
                </div>
                {(ride.vehicleType === VehicleType.ELECTRIC || ride.vehicleType === VehicleType.HYBRID) && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    <Leaf size={14} className="mr-1" />
                    <span>Saved {(ride.carbonFootprint * 0.3).toFixed(0)}g CO2 compared to standard vehicle</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideHistory;