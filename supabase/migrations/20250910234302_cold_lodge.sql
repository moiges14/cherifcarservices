/*
  # Fix foreign key relationships for bookings table

  1. Foreign Keys
    - Ensure bookings.user_id references users.id (not auth.users.id)
    - Update existing foreign key constraint if needed

  2. Security
    - Maintain existing RLS policies
*/

-- First, check if we need to update the foreign key constraint
-- Drop existing constraint if it references auth.users instead of users
DO $$
BEGIN
  -- Check if foreign key exists and points to auth.users
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'bookings' 
    AND kcu.column_name = 'user_id'
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth'
  ) THEN
    -- Drop the constraint that references auth.users
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
  END IF;
END $$;

-- Add or update foreign key constraint to reference public.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'bookings' 
    AND kcu.column_name = 'user_id'
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'public'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;