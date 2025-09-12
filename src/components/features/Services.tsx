import React from 'react';
import Card from '../common/Card';
import { Car, Plane, Clock, Star, MapPin, Shield, Euro, Calculator } from 'lucide-react';

const Services: React.FC = () => {
  const rates = [
    {
      id: 'base',
      title: 'Tarif de base',
      description: 'Prise en charge + distance parcourue',
      basePrice: 9,
      pricePerKm: 2,
      icon: <Car size={24} className="text-emerald-600" />,
      features: [
        'Prise en charge : 9€',
        'Prix par kilomètre : 2€',
        'Attente gratuite : 5 minutes',
        'Supplément attente : 0,50€/min'
      ]
    },
    {
      id: 'airport',
      title: 'Transfert Aéroport',
      description: 'Tarifs préférentiels pour les aéroports',
      basePrice: 50,
      pricePerKm: 0,
      icon: <Plane size={24} className="text-blue-600" />,
      features: [
        'CDG : À partir de 70€',
        'Orly : À partir de 60€',
        'Beauvais : À partir de 90€',
        'Suivi des vols inclus'
      ]
    },
    {
      id: 'hourly',
      title: 'Location à l\'heure',
      description: 'Service de chauffeur privé',
      basePrice: 45,
      pricePerKm: 0,
      icon: <Clock size={24} className="text-purple-600" />,
      features: [
        'Tarif horaire : 45€',
        'Minimum 2 heures',
        'Kilométrage inclus',
        'Attente incluse'
      ]
    }
  ];

  const services = [
    {
      id: 'airport',
      title: 'Transfert Aéroport',
      description: 'Service de transport professionnel vers et depuis les aéroports',
      icon: <Plane size={24} className="text-blue-600" />,
      features: [
        'Suivi des vols en temps réel',
        'Assistance bagages',
        'Service ponctuel et fiable',
        'Véhicules confortables'
      ],
      price: 'À partir de 50€'
    },
    {
      id: 'hourly',
      title: 'Location à l\'heure',
      description: 'Service de chauffeur privé à l\'heure pour vos besoins spécifiques',
      icon: <Clock size={24} className="text-emerald-600" />,
      features: [
        'Minimum 2 heures',
        'Chauffeur professionnel',
        'Véhicule haut de gamme',
        'Service personnalisé'
      ],
      price: '45€/heure'
    },
    {
      id: 'events',
      title: 'Événements Spéciaux',
      description: 'Transport pour mariages, cérémonies et événements professionnels',
      icon: <Star size={24} className="text-amber-600" />,
      features: [
        'Véhicules décorés sur demande',
        'Chauffeurs en tenue formelle',
        'Service premium',
        'Réservation à l\'avance requise'
      ],
      price: 'Sur devis'
    },
    {
      id: 'tourism',
      title: 'Circuits Touristiques',
      description: 'Découvrez la région avec un chauffeur-guide expérimenté',
      icon: <MapPin size={24} className="text-red-600" />,
      features: [
        'Circuits personnalisés',
        'Guide professionnel',
        'Arrêts photos',
        'Durée flexible'
      ],
      price: 'À partir de 75€/heure'
    },
    {
      id: 'business',
      title: 'Service Entreprise',
      description: 'Solutions de transport pour professionnels et entreprises',
      icon: <Car size={24} className="text-gray-600" />,
      features: [
        'Facturation entreprise',
        'Compte dédié',
        'Service prioritaire',
        'Tarifs préférentiels'
      ],
      price: 'Tarifs négociés'
    },
    {
      id: 'vip',
      title: 'Service VIP',
      description: 'Service premium avec véhicules haut de gamme et prestations sur mesure',
      icon: <Shield size={24} className="text-purple-600" />,
      features: [
        'Véhicules luxueux',
        'Chauffeurs d\'élite',
        'Service conciergerie',
        'Confidentialité garantie'
      ],
      price: 'Sur devis'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Section Tarifs */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Nos Tarifs</h1>
        <p className="text-lg text-gray-600">
          Tarification transparente et compétitive pour tous vos déplacements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {rates.map((rate) => (
          <Card key={rate.id} className="text-center hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                {rate.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {rate.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {rate.description}
              </p>
              
              <div className="mb-6">
                {rate.id === 'base' ? (
                  <div>
                    <div className="text-3xl font-bold text-emerald-600 mb-1">
                      {rate.basePrice}€ + {rate.pricePerKm}€/km
                    </div>
                    <div className="text-sm text-gray-500">Tarif standard</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl font-bold text-emerald-600 mb-1">
                      {rate.basePrice}€{rate.id === 'hourly' ? '/h' : ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rate.id === 'airport' ? 'À partir de' : 'Tarif fixe'}
                    </div>
                  </div>
                )}
              </div>
              
              <ul className="space-y-2 mb-6 text-left">
                {rate.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {/* Calculateur de prix */}
      <Card className="mb-16">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Calculateur de prix
            </h2>
            <p className="text-gray-600">
              Estimez le coût de votre trajet en quelques clics
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance estimée (km)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onChange={(e) => {
                    const distance = parseFloat(e.target.value) || 0;
                    const total = 9 + (distance * 2);
                    const resultElement = document.getElementById('price-result');
                    if (resultElement) {
                      resultElement.textContent = `${total.toFixed(2)}€`;
                    }
                  }}
                />
              </div>
              
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Prix estimé</div>
                <div id="price-result" className="text-2xl font-bold text-emerald-600">
                  9.00€
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (9€ de base + distance × 2€/km)
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section Services */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Prestations</h2>
        <p className="text-lg text-gray-600">
          Des services de transport premium adaptés à tous vos besoins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <Card key={service.id} className="transition-transform hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                {service.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>
              
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <div className="text-lg font-semibold text-emerald-600">
                  {service.price}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 bg-emerald-50 rounded-lg p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Service Sur Mesure
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vous avez un besoin spécifique ? Contactez-nous pour une prestation personnalisée. 
            Notre équipe est à votre disposition pour créer une offre adaptée à vos exigences.
          </p>
          <div className="mt-6 text-lg font-medium text-emerald-700">
            Contactez-nous au : 07 74 68 38 00
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💳 Modes de paiement
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Carte bancaire (Visa, Mastercard)</li>
              <li>• Espèces</li>
              <li>• Virement bancaire (entreprises)</li>
              <li>• Chèques (sur demande)</li>
            </ul>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ℹ️ Informations importantes
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Attente gratuite : 5 minutes</li>
              <li>• Supplément attente : 0,50€/minute</li>
              <li>• Supplément nuit (22h-6h) : +20%</li>
              <li>• Supplément dimanche/férié : +15%</li>
              <li>• Annulation gratuite jusqu'à 1h avant</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Services;