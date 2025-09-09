import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import Badge from '../common/Badge';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  price: number;
  created_at: string;
  driver_id?: string;
}

export function RideHistory() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setRides(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'in_progress': return 'blue';
      default: return 'yellow';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'in_progress': return 'En cours';
      case 'searching': return 'Recherche';
      case 'matched': return 'Chauffeur trouvé';
      case 'driver_en_route': return 'Chauffeur en route';
      case 'arrived': return 'Chauffeur arrivé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Historique des trajets</h2>

      {rides.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun trajet pour le moment
            </h3>
            <p className="text-gray-500">
              Vos trajets apparaîtront ici une fois que vous aurez effectué votre première course.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <Card key={ride.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge color={getStatusColor(ride.status)}>
                      {getStatusText(ride.status)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(ride.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{ride.pickup_address || 'Adresse de départ'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">{ride.dropoff_address || 'Destination'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 text-lg font-semibold">
                    <DollarSign className="w-5 h-5" />
                    <span>{ride.price?.toFixed(2) || '0.00'} €</span>
                  </div>
                  
                  {ride.status === 'completed' && (
                    <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
                      <Star className="w-4 h-4" />
                      <span>Noter le trajet</span>
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}