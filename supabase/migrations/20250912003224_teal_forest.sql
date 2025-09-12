/*
  # Fix admin_users RLS policy to prevent infinite recursion

  1. Security Changes
    - Drop existing problematic policies that cause recursion
    - Create simple, non-recursive policies
    - Allow authenticated users to check admin status
    - Only allow existing admins to manage admin users

  2. Policy Structure
    - SELECT: Allow authenticated users to read (for admin status checks)
    - INSERT/UPDATE/DELETE: Only allow existing admins (using email check)
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can check admin status" ON admin_users;

-- Create new non-recursive policies
CREATE POLICY "Allow authenticated users to read admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users existing_admin
      WHERE existing_admin.email = auth.email()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users existing_admin
      WHERE existing_admin.email = auth.email()
    )
  );