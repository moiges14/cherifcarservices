import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

const PaymentSuccess: React.FC = () => {
  useEffect(() => {
    // Optionally track successful payment
    console.log('Payment successful');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600">
            Votre paiement a été traité avec succès. Vous recevrez un email de confirmation sous peu.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/history'}
            className="w-full flex items-center justify-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Voir mes réservations</span>
          </Button>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Prochaines étapes :</strong>
          </p>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li>• Vous recevrez un SMS de confirmation</li>
            <li>• Un chauffeur vous sera assigné</li>
            <li>• Vous pourrez suivre votre course en temps réel</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;