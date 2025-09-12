/*
  # Fix foreign key relationship between bookings and users

  1. Changes
    - Drop existing foreign key constraint that references auth.users
    - Add new foreign key constraint that references public.users
    - This allows the admin dashboard to properly join bookings with user data

  2. Security
    - Maintains existing RLS policies
    - No changes to data access permissions
*/

-- Drop the existing foreign key constraint that references auth.users
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- Add new foreign key constraint that references public.users
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE SET NULL;