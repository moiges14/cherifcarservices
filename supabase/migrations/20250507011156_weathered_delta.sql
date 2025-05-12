/*
  # Add additional user profile fields
  
  1. Changes
    - Add billing_address field
    - Add corporate_code field
    - Add emergency_contact field
    - Add payment_methods field
*/

ALTER TABLE users
ADD COLUMN IF NOT EXISTS billing_address text,
ADD COLUMN IF NOT EXISTS corporate_code text,
ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{
  "name": "",
  "phone": "",
  "relationship": ""
}'::jsonb,
ADD COLUMN IF NOT EXISTS payment_methods jsonb[] DEFAULT '{}'::jsonb[];

-- Ensure RLS policies are up to date
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can manage their own profile'
  ) THEN
    CREATE POLICY "Users can manage their own profile"
      ON users
      FOR ALL
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;