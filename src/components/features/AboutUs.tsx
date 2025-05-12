import React from 'react';
import { Car, Award, Shield, Users, Clock, MapPin, Phone } from 'lucide-react';
import Card from '../common/Card';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue chez Chérif Car Services
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Chérif Car Service réinvente la mobilité en alliant élégance, sécurité et technologie de pointe. 
          Notre équipe de chauffeurs professionnels vous accompagne à chaque trajet pour vous offrir une 
          expérience sur-mesure, fluide et totalement sécurisée.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
          <div className="prose text-gray-600">
            <p className="mb-4">
              Fondée avec la vision d'offrir un service de transport premium et personnalisé,
              Chérif Car Services s'est établie comme une référence dans le secteur du transport
              privé en Île-de-France.
            </p>
            <p className="mb-4">
              Notre engagement envers l'excellence et la satisfaction client nous a permis de
              développer une clientèle fidèle, des particuliers aux professionnels exigeants.
            </p>
            <p>
              Aujourd'hui, nous sommes fiers de continuer à innover et à améliorer nos services
              pour répondre aux besoins évolutifs de nos clients.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">10+</div>
            <div className="text-gray-600">Années d'expérience</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">5000+</div>
            <div className="text-gray-600">Clients satisfaits</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">15+</div>
            <div className="text-gray-600">Véhicules de luxe</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">4.9/5</div>
            <div className="text-gray-600">Note moyenne</div>
          </Card>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nos Valeurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold ml-4">Fiabilité</h3>
            </div>
            <p className="text-gray-600">
              La ponctualité et la fiabilité sont au cœur de notre service.
              Vous pouvez compter sur nous pour chaque trajet.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold ml-4">Excellence</h3>
            </div>
            <p className="text-gray-600">
              Nous visons l'excellence dans chaque aspect de notre service,
              de la qualité de nos véhicules au professionnalisme de nos chauffeurs.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold ml-4">Service Client</h3>
            </div>
            <p className="text-gray-600">
              Votre satisfaction est notre priorité. Nous nous engageons à offrir
              un service personnalisé et attentif à chaque client.
            </p>
          </Card>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Contactez-nous</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center justify-center">
            <Phone className="w-6 h-6 text-emerald-600 mr-3" />
            <div>
              <div className="font-medium">Téléphone</div>
              <a href="tel:+33606761824" className="text-emerald-600 hover:text-emerald-700">
                +33 6 06 76 18 24
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <MapPin className="w-6 h-6 text-emerald-600 mr-3" />
            <div>
              <div className="font-medium">Adresse</div>
              <div>2B rue Paul Emile Victor, Louvres</div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Clock className="w-6 h-6 text-emerald-600 mr-3" />
            <div>
              <div className="font-medium">Horaires</div>
              <div>24/7 sur réservation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;