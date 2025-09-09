import React, { useState } from 'react';
import { CheckCircle, Circle, ExternalLink, Copy, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const SetupGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copiedText, setCopiedText] = useState<string>('');

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const steps = [
    {
      id: 1,
      title: "Créer un compte Resend (Email)",
      description: "Pour envoyer les notifications par email",
      actions: [
        { text: "Aller sur resend.com", url: "https://resend.com" },
        { text: "Créer un compte gratuit", url: "https://resend.com/signup" }
      ],
      code: "RESEND_API_KEY=re_votre_cle_api_ici"
    },
    {
      id: 2,
      title: "Configurer le domaine Resend",
      description: "Ajouter terrangavtc.fr dans Resend",
      actions: [
        { text: "Dashboard Resend → Domains", url: "https://resend.com/domains" }
      ],
      dns: {
        type: "MX",
        name: "@",
        value: "feedback-smtp.eu-west-1.amazonses.com",
        priority: "10"
      }
    },
    {
      id: 3,
      title: "Créer un compte Twilio (SMS)",
      description: "Pour envoyer les notifications par SMS",
      actions: [
        { text: "Aller sur twilio.com", url: "https://twilio.com" },
        { text: "Créer un compte (15€ gratuit)", url: "https://www.twilio.com/try-twilio" }
      ],
      code: `TWILIO_ACCOUNT_SID=ACvotre_account_sid_ici
TWILIO_AUTH_TOKEN=votre_auth_token_ici
TWILIO_PHONE_NUMBER=+33votre_numero_ici`
    },
    {
      id: 4,
      title: "Acheter un numéro Twilio",
      description: "Numéro français pour envoyer les SMS",
      actions: [
        { text: "Phone Numbers → Buy a number", url: "https://console.twilio.com/us1/develop/phone-numbers/manage/search" }
      ]
    },
    {
      id: 5,
      title: "Configurer Supabase",
      description: "Ajouter les clés API dans Supabase",
      actions: [
        { text: "Supabase → Settings → Edge Functions", url: "https://supabase.com/dashboard" }
      ]
    }
  ];

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const completionPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Configuration des Notifications
        </h1>
        <p className="text-gray-600 mb-6">
          Suivez ces étapes pour recevoir les notifications de commande par email et SMS.
        </p>
        
        {/* Barre de progression */}
        <div className="bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mb-8">
          Progression : {completedSteps.length}/{steps.length} étapes complétées ({Math.round(completionPercentage)}%)
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <Card key={step.id} className={`${isStepCompleted(step.id) ? 'bg-emerald-50 border-emerald-200' : ''}`}>
            <div className="flex items-start space-x-4">
              <button
                onClick={() => toggleStep(step.id)}
                className="flex-shrink-0 mt-1"
              >
                {isStepCompleted(step.id) ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </button>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Étape {step.id}: {step.title}
                </h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                {/* Actions */}
                <div className="space-y-3 mb-4">
                  {step.actions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(action.url, '_blank')}
                        className="flex items-center space-x-2"
                      >
                        <ExternalLink size={14} />
                        <span>{action.text}</span>
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Configuration DNS */}
                {step.dns && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Configuration DNS :</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Type :</strong> {step.dns.type}</div>
                      <div><strong>Nom :</strong> {step.dns.name}</div>
                      <div><strong>Valeur :</strong> {step.dns.value}</div>
                      <div><strong>Priorité :</strong> {step.dns.priority}</div>
                    </div>
                  </div>
                )}

                {/* Code à copier */}
                {step.code && (
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-400">Variables d'environnement :</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(step.code!, `step-${step.id}`)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy size={14} />
                        {copiedText === `step-${step.id}` ? 'Copié !' : 'Copier'}
                      </Button>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap">{step.code}</pre>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Section de test */}
      <Card className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🧪 Tester les Notifications
        </h3>
        <p className="text-gray-600 mb-4">
          Une fois la configuration terminée, vous pouvez tester les notifications dans la section "Notifications" du dashboard admin.
        </p>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Important :</h4>
              <p className="text-amber-800 text-sm">
                Les notifications ne fonctionneront qu'après avoir configuré toutes les clés API dans Supabase.
                Chaque nouvelle commande déclenchera automatiquement l'envoi d'un email et d'un SMS.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Coûts */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💰 Coûts Estimés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📧 Resend (Email)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Gratuit : 3,000 emails/mois</li>
              <li>• Pro : 10€/mois pour 50,000 emails</li>
              <li>• Parfait pour commencer</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📱 Twilio (SMS)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• SMS France : ~0.08€ par SMS</li>
              <li>• 15€ de crédit gratuit à l'inscription</li>
              <li>• ~187 SMS gratuits pour commencer</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SetupGuide;