/*
  # Ajouter les colonnes manquantes à la table bookings

  1. Nouvelles colonnes
    - `estimated_distance` (numeric) - Distance estimée du trajet
    - `estimated_price` (numeric) - Prix estimé du trajet
    - `estimated_duration` (integer) - Durée estimée en minutes
    - `passengers` (integer) - Nombre de passagers
    - `special_requests` (text) - Demandes spéciales

  2. Sécurité
    - Utilisation de DO blocks pour vérifier l'existence des colonnes
    - Colonnes nullables pour compatibilité avec données existantes
*/

-- Ajouter la colonne estimated_distance si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'estimated_distance'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_distance numeric;
  END IF;
END $$;

-- Ajouter la colonne estimated_price si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'estimated_price'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_price numeric;
  END IF;
END $$;

-- Ajouter la colonne estimated_duration si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'estimated_duration'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_duration integer;
  END IF;
END $$;

-- Ajouter la colonne passengers si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'passengers'
  ) THEN
    ALTER TABLE bookings ADD COLUMN passengers integer DEFAULT 1;
  END IF;
END $$;

-- Ajouter la colonne special_requests si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'special_requests'
  ) THEN
    ALTER TABLE bookings ADD COLUMN special_requests text;
  END IF;
END $$;