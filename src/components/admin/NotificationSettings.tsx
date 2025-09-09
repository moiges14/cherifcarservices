import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import Card from '../common/Card';
import Button from '../common/Button';

const NotificationSettings: React.FC = () => {
  const { settings, updateSettings, setupPushNotifications } = useNotifications();
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);

  const handleToggle = (setting: keyof typeof settings) => {
    updateSettings({ [setting]: !settings[setting] });
  };

  const testEmailNotification = async () => {
    setTestingEmail(true);
    try {
      // Test d'envoi d'email
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'terrangavtcservices@outlook.fr',
          subject: 'Test de notification',
          message: 'Ceci est un test de notification par email.'
        })
      });
      
      if (response.ok) {
        alert('Email de test envoyé avec succès !');
      } else {
        alert('Erreur lors de l\'envoi de l\'email de test');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi de l\'email de test');
    } finally {
      setTestingEmail(false);
    }
  };

  const testSMSNotification = async () => {
    setTestingSMS(true);
    try {
      // Test d'envoi de SMS
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '0774683800',
          message: 'Test de notification SMS depuis Terranga VTC Services'
        })
      });
      
      if (response.ok) {
        alert('SMS de test envoyé avec succès !');
      } else {
        alert('Erreur lors de l\'envoi du SMS de test');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi du SMS de test');
    } finally {
      setTestingSMS(false);
    }
  };

  const enablePushNotifications = async () => {
    const success = await setupPushNotifications();
    if (success) {
      updateSettings({ push: true });
      alert('Notifications push activées !');
    } else {
      alert('Impossible d\'activer les notifications push');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Paramètres de notification
      </h2>

      <div className="space-y-6">
        {/* Notifications Email */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Notifications par email
                </h3>
                <p className="text-sm text-gray-600">
                  Recevoir les nouvelles commandes par email
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={testEmailNotification}
                disabled={testingEmail}
              >
                {testingEmail ? 'Test...' : 'Tester'}
              </Button>
              <button
                onClick={() => handleToggle('email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.email ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Notifications SMS */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Notifications par SMS
                </h3>
                <p className="text-sm text-gray-600">
                  Recevoir les nouvelles commandes par SMS
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={testSMSNotification}
                disabled={testingSMS}
              >
                {testingSMS ? 'Test...' : 'Tester'}
              </Button>
              <button
                onClick={() => handleToggle('sms')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.sms ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.sms ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Notifications Push */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Notifications push
                </h3>
                <p className="text-sm text-gray-600">
                  Recevoir les notifications dans le navigateur
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!settings.push && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enablePushNotifications}
                >
                  Activer
                </Button>
              )}
              <button
                onClick={() => handleToggle('push')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.push ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Son des notifications */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {settings.sound ? (
                <Volume2 className="w-6 h-6 text-amber-600" />
              ) : (
                <VolumeX className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Son des notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Jouer un son lors des nouvelles notifications
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('sound')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.sound ? 'bg-amber-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.sound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          Configuration requise
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Email : Configurez RESEND_API_KEY dans les variables d'environnement</li>
          <li>• SMS : Configurez les clés Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)</li>
          <li>• Push : Autorisez les notifications dans votre navigateur</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSettings;