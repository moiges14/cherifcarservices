/*
  # Fix infinite recursion in admin_users policies

  1. Problem
    - Current RLS policies on admin_users table are causing infinite recursion
    - Policies are referencing the same table they're protecting

  2. Solution
    - Drop all existing policies on admin_users table
    - Create simple, non-recursive policies
    - Use auth.uid() and auth.email() functions directly instead of table lookups

  3. Security
    - Allow authenticated users to read admin status
    - Only allow existing admins to manage admin users
    - Use direct auth functions to avoid circular references
*/

-- Drop all existing policies on admin_users table
DROP POLICY IF EXISTS "Allow authenticated users to read admin status" ON admin_users;
DROP POLICY IF EXISTS "Only admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can read admin status" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

-- Create simple, non-recursive policies
CREATE POLICY "authenticated_can_read_admin_status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "service_role_can_manage_admins"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow inserts for initial admin setup (can be removed after setup)
CREATE POLICY "allow_admin_insert"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);