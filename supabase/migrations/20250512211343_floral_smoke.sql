/*
  # Add admin users table and policies
  
  1. New Tables
    - admin_users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - created_at (timestamp)
      
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  CREATE POLICY "Admins can manage admin users"
    ON admin_users
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE email = auth.email()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE email = auth.email()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can check admin status"
    ON admin_users
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;