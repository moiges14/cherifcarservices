/*
  # Add user preferences and profile fields

  1. Changes
    - Add new columns to users table:
      - preferred_vehicle_type (vehicle_type)
      - preferred_payment_method (text)
      - language (text)
      - theme (text)
      - notification_preferences (jsonb)
      - eco_preferences (jsonb)

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_vehicle_type vehicle_type,
ADD COLUMN IF NOT EXISTS preferred_payment_method text,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "ride_updates": true,
  "promotions": false,
  "eco_impact": true,
  "email": true,
  "push": true,
  "sms": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS eco_preferences jsonb DEFAULT '{
  "prioritize_eco_friendly": true,
  "allow_ride_sharing": true,
  "carbon_offset": true
}'::jsonb;