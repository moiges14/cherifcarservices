import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Card from '../common/Card';
import Button from '../common/Button';
import { Car, MapPin, Clock, DollarSign, Star, Settings } from 'lucide-react';
import Map from '../maps/Map';

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeRides, setActiveRides] = useState([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const toggleOnlineStatus = async () => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: isOnline ? 'offline' : 'available' })
        .eq('id', user?.id);

      if (error) throw error;
      setIsOnline(!isOnline);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="md:col-span-1">
          <div className="text-center">
            <div className="mb-4">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${
                isOnline ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Car size={32} className={isOnline ? 'text-green-600' : 'text-gray-400'} />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Driver Status</h2>
            <p className={`text-sm mb-4 ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {isOnline ? 'Online - Ready for Rides' : 'Offline'}
            </p>
            <Button
              variant={isOnline ? 'outline' : 'primary'}
              onClick={toggleOnlineStatus}
              fullWidth
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </Card>

        {/* Earnings Summary */}
        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Earnings Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.today}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.week}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.month}</p>
            </div>
          </div>
        </Card>

        {/* Map */}
        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Current Location</h2>
          <div className="h-[400px] rounded-lg overflow-hidden">
            <Map
              center={currentLocation ? currentLocation : undefined}
              markers={currentLocation ? [{ ...currentLocation, address: 'Your Location' }] : []}
              zoom={14}
            />
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Today's Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="text-gray-400 mr-2" size={20} />
                <span className="text-sm">Hours Online</span>
              </div>
              <span className="font-semibold">4.5</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <MapPin className="text-gray-400 mr-2" size={20} />
                <span className="text-sm">Trips</span>
              </div>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Star className="text-gray-400 mr-2" size={20} />
                <span className="text-sm">Rating</span>
              </div>
              <span className="font-semibold">4.9</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;