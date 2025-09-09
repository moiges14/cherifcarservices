import React from 'react';
import { Users, Award, Shield, Heart } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            À Propos de Nous
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nous révolutionnons le transport urbain avec des solutions écologiques 
            et innovantes pour un avenir plus durable.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notre Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Transformer la mobilité urbaine en proposant des services de transport 
                respectueux de l'environnement, accessibles et fiables pour tous.
              </p>
              <p className="text-lg text-gray-600">
                Nous croyons qu'un transport durable peut améliorer la qualité de vie 
                tout en préservant notre planète pour les générations futures.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sécurité</h3>
            <p className="text-gray-600">
              La sécurité de nos utilisateurs est notre priorité absolue. 
              Tous nos conducteurs sont vérifiés et nos véhicules régulièrement contrôlés.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
            <p className="text-gray-600">
              Nous nous efforçons d'offrir un service de qualité supérieure 
              avec une attention particulière aux détails et à l'expérience utilisateur.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Communauté</h3>
            <p className="text-gray-600">
              Nous construisons une communauté de voyageurs conscients 
              qui partagent nos valeurs environnementales et sociales.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-xl p-8 md:p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos Réalisations</h2>
            <p className="text-xl opacity-90">
              Des chiffres qui témoignent de notre impact positif
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-90">Trajets Réalisés</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15K+</div>
              <div className="text-lg opacity-90">Utilisateurs Actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2.5T</div>
              <div className="text-lg opacity-90">CO₂ Économisé</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-90">Satisfaction Client</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Notre Équipe
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Une équipe passionnée et expérimentée, dédiée à créer 
            l'avenir du transport durable.
          </p>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-600 italic text-lg">
              "Ensemble, nous construisons un avenir où la mobilité rime avec durabilité."
            </p>
            <div className="mt-6">
              <div className="font-semibold text-gray-900">L'Équipe EcoRide</div>
              <div className="text-gray-500">Fondateurs & Développeurs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;