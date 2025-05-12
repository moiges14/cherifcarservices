/*
  # Fix User Table RLS Policies

  1. Changes
    - Add policy for users to insert their own profile
    - Update existing policies for better security
    - Add policy for public profile reading
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies with proper permissions
CREATE POLICY "Users can manage their own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view basic user info"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;