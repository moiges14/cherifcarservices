import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Users, Leaf } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { MapComponent } from '../maps/MapComponent';
import { PaymentModal } from '../payment/PaymentModal';

interface BookingData {
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  rideType: string;
}

export function BookRide() {
  const [booking, setBooking] = useState<BookingData>({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    rideType: 'standard',
  });
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser();
    calculatePrice();
  }, [booking.pickup, booking.dropoff, booking.rideType]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const calculatePrice = () => {
    if (!booking.pickup || !booking.dropoff) {
      setPrice(0);
      return;
    }

    // Simple price calculation based on ride type
    let basePrice = 15;
    switch (booking.rideType) {
      case 'economy':
        basePrice = 12;
        break;
      case 'premium':
        basePrice = 25;
        break;
      case 'electric':
        basePrice = 18;
        break;
      case 'shared':
        basePrice = 8;
        break;
    }

    // Add some randomness for distance simulation
    const distance = Math.random() * 10 + 2;
    setPrice(basePrice + distance * 1.5);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: user.id,
          ride_type: booking.rideType,
          pickup: booking.pickup,
          dropoff: booking.dropoff,
          date: booking.date,
          time: booking.time,
          status: 'pending',
        },
      ]);

    if (!error) {
      setShowPayment(true);
    }
    setLoading(false);
  };

  const rideTypes = [
    {
      id: 'economy',
      name: 'Économique',
      description: 'Option abordable',
      icon: DollarSign,
      multiplier: 0.8,
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Confort et prix équilibrés',
      icon: Users,
      multiplier: 1,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Véhicules haut de gamme',
      icon: Users,
      multiplier: 1.7,
    },
    {
      id: 'electric',
      name: 'Électrique',
      description: 'Véhicules écologiques',
      icon: Leaf,
      multiplier: 1.2,
    },
    {
      id: 'shared',
      name: 'Partagé',
      description: 'Économique et écologique',
      icon: Users,
      multiplier: 0.5,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Réserver un trajet</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Form */}
        <div>
          <Card>
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="space-y-4">
                <Input
                  icon={MapPin}
                  type="text"
                  placeholder="Adresse de départ"
                  value={booking.pickup}
                  onChange={(e) => setBooking({ ...booking, pickup: e.target.value })}
                  required
                />
                
                <Input
                  icon={MapPin}
                  type="text"
                  placeholder="Destination"
                  value={booking.dropoff}
                  onChange={(e) => setBooking({ ...booking, dropoff: e.target.value })}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={booking.date}
                    onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                    required
                  />
                  <Input
                    type="time"
                    value={booking.time}
                    onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Type de véhicule</h3>
                <div className="space-y-2">
                  {rideTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setBooking({ ...booking, rideType: type.id })}
                        className={`w-full p-4 border rounded-lg text-left transition-colors ${
                          booking.rideType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <div className="font-medium">{type.name}</div>
                              <div className="text-sm text-gray-500">{type.description}</div>
                            </div>
                          </div>
                          <div className="text-lg font-semibold">
                            {(price * type.multiplier).toFixed(2)} €
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {price > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Prix estimé :</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {(price * (rideTypes.find(t => t.id === booking.rideType)?.multiplier || 1)).toFixed(2)} €
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !user || price === 0}
              >
                {loading ? 'Réservation...' : 'Réserver maintenant'}
              </Button>

              {!user && (
                <p className="text-sm text-gray-500 text-center">
                  Vous devez être connecté pour réserver un trajet
                </p>
              )}
            </form>
          </Card>
        </div>

        {/* Map */}
        <div>
          <Card className="h-96">
            <MapComponent />
          </Card>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={price * (rideTypes.find(t => t.id === booking.rideType)?.multiplier || 1)}
        onPaymentSuccess={() => {
          alert('Paiement réussi ! Votre trajet a été réservé.');
        }}
      />
    </div>
  );
}