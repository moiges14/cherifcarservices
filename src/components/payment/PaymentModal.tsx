import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, amount, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'mobile' | 'wallet'>('card');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      onPaymentSuccess();
      onClose();
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'card' as const,
      name: 'Carte bancaire',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
    },
    {
      id: 'mobile' as const,
      name: 'Paiement mobile',
      icon: Smartphone,
      description: 'Apple Pay, Google Pay',
    },
    {
      id: 'wallet' as const,
      name: 'Portefeuille numérique',
      icon: Wallet,
      description: 'PayPal, Stripe',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Paiement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {amount.toFixed(2)} €
            </div>
            <p className="text-gray-600">Montant à payer</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="font-semibold">Choisir un moyen de paiement</h3>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 border rounded-lg text-left transition-colors ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6 text-gray-600" />
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Traitement...' : `Payer ${amount.toFixed(2)} €`}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Annuler
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Paiement sécurisé par SSL. Vos données sont protégées.
        </div>
      </div>
    </div>
  );
}