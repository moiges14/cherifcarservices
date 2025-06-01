import React from 'react';
import Card from '../common/Card';
import { Car, Plane, Clock, Star, MapPin, Shield } from 'lucide-react';

const Services: React.FC = () => {
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
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Nos Prestations</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Service Sur Mesure
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vous avez un besoin spécifique ? Contactez-nous pour une prestation personnalisée. 
            Notre équipe est à votre disposition pour créer une offre adaptée à vos exigences.
          </p>
          <div className="mt-6 text-lg font-medium text-emerald-700">
            Contactez-nous au : 07 74 68 38 00
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;