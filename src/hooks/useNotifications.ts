import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  sound: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    sound: true
  });

  // Configurer les notifications push
  const setupPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Push notifications enabled');
        return true;
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
    
    return false;
  };

  // Envoyer une notification email
  const sendEmailNotification = async (
    to: string,
    subject: string,
    message: string,
    bookingData?: any
  ) => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        console.warn('Supabase not configured, skipping email notification');
        return;
      }

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          message,
          bookingData
        }
      });

      if (error) throw error;
      console.log('Email notification sent');
    } catch (error) {
      console.warn('Email notification failed:', error);
      // Don't throw error to prevent blocking the booking process
      return null;
    }
  };

  // Envoyer une notification SMS
  const sendSMSNotification = async (
    to: string,
    message: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          to,
          message
        }
      });

      if (error) throw error;
      console.log('SMS notification sent');
    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  };

  // Notification pour nouvelle commande
  const notifyNewBooking = async (booking: any) => {
    const message = `Nouvelle réservation ${booking.booking_reference}
De: ${booking.pickup}
À: ${booking.dropoff}
Date: ${booking.date} à ${booking.time}
Client: ${booking.user_email}
Téléphone: ${booking.contact_phone || 'Non renseigné'}`;

    // Email
    if (settings.email) {
      await sendEmailNotification(
        'terrangavtcservices@outlook.fr',
        `Nouvelle réservation - ${booking.booking_reference}`,
        message,
        booking
      );
    }

    // SMS
    if (settings.sms) {
      await sendSMSNotification(
        '0774683800',
        `Nouvelle réservation ${booking.booking_reference}. Consultez l'app pour plus de détails.`
      );
    }

    // Notification push
    if (settings.push && Notification.permission === 'granted') {
      new Notification('Nouvelle réservation', {
        body: `${booking.booking_reference} - ${booking.pickup} → ${booking.dropoff}`,
        icon: '/logo 14.png',
        tag: `booking-${booking.id}`,
        requireInteraction: true
      });
    }

    // Son
    if (settings.sound) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        // Ignore les erreurs de lecture audio
      });
    }
  };

  // Mettre à jour les paramètres
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Sauvegarder dans localStorage
    localStorage.setItem('notificationSettings', JSON.stringify({
      ...settings,
      ...newSettings
    }));
  };

  // Charger les paramètres au démarrage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  return {
    settings,
    updateSettings,
    setupPushNotifications,
    notifyNewBooking,
    sendEmailNotification,
    sendSMSNotification
  };
};