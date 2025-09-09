import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Wallet } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Carte bancaire',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'mobile',
    name: 'Paiement mobile',
    icon: Smartphone,
    description: 'Apple Pay, Google Pay, Samsung Pay'
  },
  {
    id: 'wallet',
    name: 'Portefeuille numérique',
    icon: Wallet,
    description: 'PayPal, Stripe'
  }
];

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would integrate with a payment processor here
      onPaymentSuccess();
      onClose();
    } catch (error: any) {
      setError('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Amount */}
          <Card className="mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{amount.toFixed(2)} €</div>
              <div className="text-sm text-gray-600">Montant à payer</div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">Méthode de paiement</h3>
            
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              const isSelected = selectedMethod?.id === method.id;
              
              return (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method)}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card Details (if card payment selected) */}
          {selectedMethod?.id === 'card' && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Détails de la carte</h3>
              
              <Input
                icon={CreditCard}
                type="text"
                placeholder="Numéro de carte"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                />
                <Input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                />
              </div>
              
              <Input
                type="text"
                placeholder="Nom sur la carte"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            className="w-full"
            disabled={!selectedMethod || loading}
          >
            {loading ? 'Traitement...' : `Payer ${amount.toFixed(2)} €`}
          </Button>

          <div className="mt-4 text-xs text-gray-500 text-center">
            Paiement sécurisé par SSL. Vos données sont protégées.
          </div>
        </div>
      </div>
    </div>
  );
}