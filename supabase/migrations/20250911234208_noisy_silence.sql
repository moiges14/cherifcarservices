/*
  # Enhanced booking system with notifications

  1. New Columns for bookings table
    - passengers (integer) - Number of passengers
    - special_requests (text) - Special requests from user
    - contact_phone (text) - Contact phone number
    - estimated_price (numeric) - Estimated price for the ride
    - estimated_distance (numeric) - Estimated distance in km
    - estimated_duration (integer) - Estimated duration in minutes
    - booking_reference (text) - Unique booking reference
    - payment_status (text) - Payment status
    - rating (integer) - User rating for the ride
    - review_comment (text) - User review comment

  2. New Tables
    - booking_notifications - Notifications for bookings
    - driver_locations - Real-time driver locations

  3. Functions and Triggers
    - Automatic booking reference generation
    - Automatic notification creation
    - Status change notifications

  4. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Ajouter les nouvelles colonnes à la table bookings
DO $$
BEGIN
  -- Passengers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'passengers'
  ) THEN
    ALTER TABLE bookings ADD COLUMN passengers integer DEFAULT 1;
  END IF;

  -- Special requests
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'special_requests'
  ) THEN
    ALTER TABLE bookings ADD COLUMN special_requests text;
  END IF;

  -- Contact phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE bookings ADD COLUMN contact_phone text;
  END IF;

  -- Estimated price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'estimated_price'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_price numeric(10,2);
  END IF;

  -- Estimated distance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'estimated_distance'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_distance numeric(8,2);
  END IF;

  -- Estimated duration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'estimated_duration'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_duration integer;
  END IF;

  -- Booking reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_reference text UNIQUE;
  END IF;

  -- Payment status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;

  -- Rating
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'rating'
  ) THEN
    ALTER TABLE bookings ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5);
  END IF;

  -- Review comment
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'review_comment'
  ) THEN
    ALTER TABLE bookings ADD COLUMN review_comment text;
  END IF;
END $$;

-- Créer la table des notifications de réservation
CREATE TABLE IF NOT EXISTS booking_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type text NOT NULL CHECK (recipient_type IN ('user', 'driver')),
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Créer la table des localisations des chauffeurs
CREATE TABLE IF NOT EXISTS driver_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  accuracy numeric(8,2),
  heading numeric(5,2),
  speed numeric(8,2),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_booking_notifications_recipient ON booking_notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_booking ON booking_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_updated ON driver_locations(updated_at);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);

-- Fonction pour générer une référence de réservation unique
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS text AS $$
DECLARE
  reference text;
  exists_check boolean;
BEGIN
  LOOP
    -- Générer une référence au format TVS-YYYYMMDD-XXXX
    reference := 'TVS-' || to_char(now(), 'YYYYMMDD') || '-' || 
                 lpad(floor(random() * 10000)::text, 4, '0');
    
    -- Vérifier si la référence existe déjà
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_reference = reference) INTO exists_check;
    
    -- Si elle n'existe pas, on peut l'utiliser
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement une référence de réservation
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.booking_reference IS NULL THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_set_booking_reference'
  ) THEN
    CREATE TRIGGER trigger_set_booking_reference
      BEFORE INSERT ON bookings
      FOR EACH ROW
      EXECUTE FUNCTION set_booking_reference();
  END IF;
END $$;

-- Fonction pour créer des notifications automatiques
CREATE OR REPLACE FUNCTION create_booking_notification(
  p_booking_id uuid,
  p_recipient_id uuid,
  p_recipient_type text,
  p_notification_type text,
  p_title text,
  p_message text
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO booking_notifications (
    booking_id,
    recipient_id,
    recipient_type,
    notification_type,
    title,
    message
  ) VALUES (
    p_booking_id,
    p_recipient_id,
    p_recipient_type,
    p_notification_type,
    p_title,
    p_message
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer des notifications automatiques lors de changements de statut
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS trigger AS $$
DECLARE
  notification_title text;
  notification_message text;
BEGIN
  -- Notifications pour l'utilisateur
  CASE NEW.status
    WHEN 'confirmed' THEN
      notification_title := 'Réservation confirmée';
      notification_message := 'Votre réservation ' || NEW.booking_reference || ' a été confirmée.';
    WHEN 'driver_assigned' THEN
      notification_title := 'Chauffeur assigné';
      notification_message := 'Un chauffeur a été assigné à votre réservation ' || NEW.booking_reference || '.';
    WHEN 'driver_en_route' THEN
      notification_title := 'Chauffeur en route';
      notification_message := 'Votre chauffeur est en route pour la réservation ' || NEW.booking_reference || '.';
    WHEN 'completed' THEN
      notification_title := 'Course terminée';
      notification_message := 'Votre course ' || NEW.booking_reference || ' est terminée. Merci de noter votre chauffeur !';
    WHEN 'cancelled' THEN
      notification_title := 'Réservation annulée';
      notification_message := 'Votre réservation ' || NEW.booking_reference || ' a été annulée.';
    ELSE
      notification_title := NULL;
  END CASE;

  -- Créer la notification pour l'utilisateur si nécessaire
  IF notification_title IS NOT NULL THEN
    PERFORM create_booking_notification(
      NEW.id,
      NEW.user_id,
      'user',
      'status_change',
      notification_title,
      notification_message
    );
  END IF;

  -- Notifications pour le chauffeur (si assigné)
  IF NEW.driver_id IS NOT NULL THEN
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_title := 'Nouvelle réservation';
        notification_message := 'Une nouvelle réservation ' || NEW.booking_reference || ' vous a été assignée.';
      WHEN 'cancelled' THEN
        notification_title := 'Réservation annulée';
        notification_message := 'La réservation ' || NEW.booking_reference || ' a été annulée par le client.';
      ELSE
        notification_title := NULL;
    END CASE;

    IF notification_title IS NOT NULL THEN
      PERFORM create_booking_notification(
        NEW.id,
        NEW.driver_id,
        'driver',
        'status_change',
        notification_title,
        notification_message
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les notifications de changement de statut
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_notify_booking_status_change'
  ) THEN
    CREATE TRIGGER trigger_notify_booking_status_change
      AFTER UPDATE OF status ON bookings
      FOR EACH ROW
      WHEN (OLD.status IS DISTINCT FROM NEW.status)
      EXECUTE FUNCTION notify_booking_status_change();
  END IF;
END $$;

-- Activer RLS sur les nouvelles tables
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour booking_notifications
CREATE POLICY "Users can view their own notifications"
  ON booking_notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON booking_notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Politiques RLS pour driver_locations
CREATE POLICY "Drivers can manage their own location"
  ON driver_locations
  FOR ALL
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Users can view driver locations for their bookings"
  ON driver_locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.driver_id = driver_locations.driver_id 
      AND bookings.user_id = auth.uid()
      AND bookings.status IN ('confirmed', 'driver_en_route', 'arrived', 'in_progress')
    )
  );

-- Mettre à jour les références de réservation existantes
UPDATE bookings 
SET booking_reference = generate_booking_reference() 
WHERE booking_reference IS NULL;