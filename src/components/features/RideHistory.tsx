import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Star, Filter, Search, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  price: number;
  created_at: string;
  driver_id?: string;
  ride_type?: string;
  distance?: number;
  duration?: number;
}

export function RideHistory() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRideHistory();
  }, []);

  useEffect(() => {
    filterRides();
  }, [rides, searchTerm, statusFilter, dateFilter]);

  const fetchRideHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Essayer d'abord la table bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsData && !bookingsError) {
        // Mapper les données de bookings vers le format attendu
        const mappedRides = bookingsData.map(booking => ({
          id: booking.id,
          pickup_address: booking.pickup,
          dropoff_address: booking.dropoff,
          status: booking.status,
          price: booking.estimated_price || 0,
          created_at: booking.created_at,
          driver_id: booking.driver_id,
          ride_type: booking.ride_type,
          distance: booking.estimated_distance,
          duration: booking.estimated_duration
        }));
        setRides(mappedRides);
      } else {
        // Fallback vers la table rides si bookings n'existe pas
        const { data: ridesData, error: ridesError } = await supabase
          .from('rides')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ridesData && !ridesError) {
          setRides(ridesData);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
    
    setLoading(false);
  };

  const filterRides = () => {
    let filtered = [...rides];

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(ride =>
        ride.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropoff_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ride => ride.status === statusFilter);
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(ride => 
          new Date(ride.created_at) >= filterDate
        );
      }
    }

    setFilteredRides(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      case 'in_progress': return 'En cours';
      case 'searching': return 'Recherche';
      case 'matched': return 'Chauffeur trouvé';
      case 'driver_en_route': return 'Chauffeur en route';
      case 'arrived': return 'Chauffeur arrivé';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getRideTypeText = (type?: string) => {
    switch (type) {
      case 'economy': return 'Économique';
      case 'standard': return 'Standard';
      case 'premium': return 'Premium';
      case 'electric': return 'Électrique';
      default: return type || 'Standard';
    }
  };

  const getTotalSpent = () => {
    return filteredRides
      .filter(ride => ride.status === 'completed' || ride.status === 'confirmed')
      .reduce((total, ride) => total + (ride.price || 0), 0);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Historique des trajets</h2>
          <p className="text-gray-600 mt-1">
            {filteredRides.length} course{filteredRides.length > 1 ? 's' : ''} 
            {filteredRides.length > 0 && ` • Total dépensé: ${getTotalSpent().toFixed(2)} €`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter size={16} />}
        >
          Filtres
        </Button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <Input
                leftIcon={<Search size={16} />}
                type="text"
                placeholder="Adresse de départ ou destination"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Terminé</option>
                <option value="confirmed">Confirmé</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Toutes les périodes</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {filteredRides.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {rides.length === 0 ? 'Aucun trajet pour le moment' : 'Aucun résultat trouvé'}
            </h3>
            <p className="text-gray-500">
              {rides.length === 0 
                ? 'Vos trajets apparaîtront ici une fois que vous aurez effectué votre première course.'
                : 'Essayez de modifier vos critères de recherche.'
              }
            </p>
            {rides.length === 0 && (
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => window.location.href = '#book'}
              >
                Réserver ma première course
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRides.map((ride) => (
            <Card key={ride.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant={getStatusColor(ride.status)}>
                      {getStatusText(ride.status)}
                    </Badge>
                    {ride.ride_type && (
                      <Badge variant="secondary" size="sm">
                        {getRideTypeText(ride.ride_type)}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(ride.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
                  
                  {(ride.distance || ride.duration) && (
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      {ride.distance && (
                        <span>{ride.distance.toFixed(1)} km</span>
                      )}
                      {ride.duration && (
                        <span>{ride.duration} min</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 text-lg font-semibold">
                    <DollarSign className="w-5 h-5" />
                    <span>{ride.price?.toFixed(2) || '0.00'} €</span>
                  </div>
                  
                  {(ride.status === 'completed' || ride.status === 'confirmed') && (
                    <div className="flex flex-col space-y-1 mt-2">
                      <button className="flex items-center space-x-1 text-sm text-emerald-600 hover:text-emerald-800">
                        <Star className="w-4 h-4" />
                        <span>Noter</span>
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-800">
                        Refaire
                      </button>
                    </div>
                  )}
                  
                  {ride.status === 'pending' && (
                    <button className="text-sm text-red-600 hover:text-red-800 mt-2">
                      Annuler
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