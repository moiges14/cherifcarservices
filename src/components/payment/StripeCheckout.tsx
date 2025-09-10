import React, { useState } from 'react';
import { X, CreditCard, Check } from 'lucide-react';
import { createCheckoutSession } from '../../lib/stripe';
import { products } from '../../stripe-config';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import Card from '../common/Card';

interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: 'reservation' | 'airport';
  amount?: number;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  isOpen,
  onClose,
  selectedService = 'reservation',
  amount
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (productKey: keyof typeof products) => {
    setLoading(true);
    setError('');

    try {
      // Get the current user's session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Vous devez être connecté pour effectuer un paiement');
      }

      const product = products[productKey];
      const successUrl = `${window.location.origin}/payment-success`;
      const cancelUrl = `${window.location.origin}/payment-cancel`;

      const checkoutUrl = await createCheckoutSession(
        product.priceId,
        product.mode,
        successUrl,
        cancelUrl,
        session.access_token
      );

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la session de paiement');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Paiement sécurisé</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Service de réservation */}
          <div className="border rounded-lg p-4 hover:border-emerald-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{products.reservation.name}</h3>
                  <p className="text-sm text-gray-600">{products.reservation.description}</p>
                </div>
              </div>
              {selectedService === 'reservation' && (
                <Check className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-emerald-600">
                9€ + 2€/km
              </div>
              <Button
                onClick={() => handleCheckout('reservation')}
                disabled={loading}
                size="sm"
                className={selectedService === 'reservation' ? 'bg-emerald-600' : ''}
              >
                {loading ? 'Chargement...' : 'Choisir'}
              </Button>
            </div>
          </div>

          {/* Service aéroport */}
          <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{products.airport.name}</h3>
                  <p className="text-sm text-gray-600">{products.airport.description}</p>
                </div>
              </div>
              {selectedService === 'airport' && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-blue-600">
                Tarif fixe
              </div>
              <Button
                onClick={() => handleCheckout('airport')}
                disabled={loading}
                size="sm"
                variant="secondary"
                className={selectedService === 'airport' ? 'bg-blue-600 text-white' : ''}
              >
                {loading ? 'Chargement...' : 'Choisir'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span>Paiement sécurisé par Stripe</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span>Cartes Visa, Mastercard, American Express acceptées</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </div>
      </Card>
    </div>
  );
};

export default StripeCheckout;