/*
  # Ajouter la colonne contact_phone à la table bookings

  1. Modifications
    - Ajouter la colonne `contact_phone` de type text à la table `bookings`
    - La colonne est optionnelle (nullable) pour maintenir la compatibilité avec les données existantes
*/

-- Ajouter la colonne contact_phone à la table bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE bookings ADD COLUMN contact_phone text;
  END IF;
END $$;