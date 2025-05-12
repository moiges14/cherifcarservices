import React, { useState } from 'react';
import { CreditCard, X, DollarSign } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
  currency?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  onSuccess,
  currency = 'usd'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === 'cash') {
        // For cash payment, we just process it directly
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
        onSuccess();
        onClose();
        return;
      }

      // Credit card validation
      if (cardNumber.replace(/\s/g, '').length < 16) {
        throw new Error('Invalid card number');
      }
      
      if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
        throw new Error('Invalid expiry date format (MM/YY)');
      }
      
      if (cvc.length < 3) {
        throw new Error('Invalid CVC');
      }
      
      // Simulate card payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
          <p className="text-gray-600">Amount: ${(amount / 100).toFixed(2)} {currency.toUpperCase()}</p>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 p-4 rounded-lg border transition-colors ${
                paymentMethod === 'card'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <CreditCard size={24} className={paymentMethod === 'card' ? 'text-emerald-600' : 'text-gray-400'} />
              </div>
              <div className="text-center">
                <p className="font-medium">Credit Card</p>
                <p className="text-sm text-gray-500">Pay securely online</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 p-4 rounded-lg border transition-colors ${
                paymentMethod === 'cash'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <DollarSign size={24} className={paymentMethod === 'cash' ? 'text-emerald-600' : 'text-gray-400'} />
              </div>
              <div className="text-center">
                <p className="font-medium">Cash</p>
                <p className="text-sm text-gray-500">Pay to driver</p>
              </div>
            </button>
          </div>

          {paymentMethod === 'card' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                You will pay ${(amount / 100).toFixed(2)} in cash directly to your driver at the end of the ride.
                Please make sure to have the exact amount ready.
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={loading}
            onClick={handleSubmit}
            leftIcon={paymentMethod === 'card' ? <CreditCard size={18} /> : <DollarSign size={18} />}
          >
            {paymentMethod === 'card' ? 'Pay with Card' : 'Pay with Cash'}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Your payment information is secure</p>
          {paymentMethod === 'card' && (
            <p className="mt-1 text-xs">For demo purposes, any valid-looking card info will work</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentModal;