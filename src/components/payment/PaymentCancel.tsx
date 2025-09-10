import React from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

const PaymentCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement annulé
          </h1>
          <p className="text-gray-600">
            Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer le paiement</span>
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Besoin d'aide ?</strong>
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Contactez-nous au 07 74 68 38 00 ou par email à terrangavtcservices@outlook.fr
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PaymentCancel;