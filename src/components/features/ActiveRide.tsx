import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageCircle, Star, Clock, Car } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const ActiveRide: React.FC = () => {
  const { activeRide, setActiveRide } = useApp();
  const [rideStatus, setRideStatus] = useState('en_route');
  const [estimatedTime, setEstimatedTime] = useState(8);

  useEffect(() => {
    if (!activeRide) return;

    const timer = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
    }, 60000);

    return () => clearInterval(timer);
  }, [activeRide]);

  if (!activeRide) {
    return null;
  }

  const handleCompleteRide = () => {
    setActiveRide(null);
  };

  const handleCallDriver = () => {
    window.open('tel:0774683800');
  };

  const handleMessageDriver = () => {
    // Ouvrir l'interface de messagerie
    console.log('Ouvrir la messagerie avec le chauffeur');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* En-tête de la course */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Course en cours</h2>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">En route</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Départ</p>
                <p className="font-medium">{activeRide.pickup}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-medium">{activeRide.dropoff}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informations du chauffeur */}
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Ahmed Benali</h3>
              <p className="text-gray-600">Peugeot 308 • ABC-123</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">4.9</span>
                <span className="text-sm text-gray-500">(127 courses)</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleCallDriver}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
            <Button
              onClick={handleMessageDriver}
              variant="outline"
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </Card>

        {/* Temps estimé */}
        <Card className="p-6">
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-bold text-lg mb-1">Arrivée estimée</h3>
            <p className="text-3xl font-bold text-blue-600">{estimatedTime} min</p>
            <p className="text-sm text-gray-600 mt-1">Le chauffeur arrive bientôt</p>
          </div>
        </Card>

        {/* Carte (placeholder) */}
        <Card className="p-4">
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Carte en temps réel</p>
              <p className="text-sm text-gray-500">Position du chauffeur</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleCompleteRide}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Terminer la course
          </Button>
          
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-600 hover:bg-red-50"
          >
            Annuler la course
          </Button>
        </div>
      </div>
    </div>
  );
};