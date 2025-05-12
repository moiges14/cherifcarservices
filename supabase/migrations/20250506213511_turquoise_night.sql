/*
  # Initial Schema Setup
  
  1. New Tables
    - users (auth and profile data)
    - drivers (driver-specific info)
    - vehicles (vehicle details)
    - rides (ride tracking)
    - saved_locations (user saved locations)
    
  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
    
  3. Features
    - Automatic updated_at timestamps
    - UUID primary keys
    - Enum types for vehicles and ride status
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create enum types
DO $$ BEGIN
  CREATE TYPE vehicle_type AS ENUM (
    'economy', 'standard', 'premium', 'electric', 'hybrid', 'shared'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ride_status AS ENUM (
    'searching', 'matched', 'driver_en_route', 'arrived', 'in_progress', 'completed', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  profile_picture text,
  rating numeric DEFAULT 5.0,
  rides_completed integer DEFAULT 0,
  carbon_saved numeric DEFAULT 0,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  profile_picture text,
  rating numeric DEFAULT 5.0,
  rides_completed integer DEFAULT 0,
  is_available boolean DEFAULT true,
  current_latitude numeric,
  current_longitude numeric,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  license_plate text UNIQUE NOT NULL,
  type vehicle_type NOT NULL,
  eco_rating integer CHECK (eco_rating BETWEEN 1 AND 5),
  capacity integer NOT NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  pickup_latitude numeric NOT NULL,
  pickup_longitude numeric NOT NULL,
  pickup_address text,
  dropoff_latitude numeric NOT NULL,
  dropoff_longitude numeric NOT NULL,
  dropoff_address text,
  status ride_status NOT NULL DEFAULT 'searching',
  price numeric NOT NULL,
  distance numeric NOT NULL,
  duration integer NOT NULL,
  carbon_footprint numeric NOT NULL,
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_locations table
CREATE TABLE IF NOT EXISTS saved_locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  address text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at triggers safely
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_drivers_updated_at'
  ) THEN
    CREATE TRIGGER update_drivers_updated_at
      BEFORE UPDATE ON drivers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicles_updated_at'
  ) THEN
    CREATE TRIGGER update_vehicles_updated_at
      BEFORE UPDATE ON vehicles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_rides_updated_at'
  ) THEN
    CREATE TRIGGER update_rides_updated_at
      BEFORE UPDATE ON rides
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_saved_locations_updated_at'
  ) THEN
    CREATE TRIGGER update_saved_locations_updated_at
      BEFORE UPDATE ON saved_locations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create policies for drivers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Drivers can read own data'
  ) THEN
    CREATE POLICY "Drivers can read own data"
      ON drivers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Drivers can update own data'
  ) THEN
    CREATE POLICY "Drivers can update own data"
      ON drivers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create policies for vehicles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read vehicles'
  ) THEN
    CREATE POLICY "Anyone can read vehicles"
      ON vehicles
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Drivers can update own vehicles'
  ) THEN
    CREATE POLICY "Drivers can update own vehicles"
      ON vehicles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = driver_id);
  END IF;
END $$;

-- Create policies for rides
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own rides'
  ) THEN
    CREATE POLICY "Users can read own rides"
      ON rides
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR auth.uid() = driver_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can create rides'
  ) THEN
    CREATE POLICY "Users can create rides"
      ON rides
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users and drivers can update rides'
  ) THEN
    CREATE POLICY "Users and drivers can update rides"
      ON rides
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id OR auth.uid() = driver_id);
  END IF;
END $$;

-- Create policies for saved locations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own saved locations'
  ) THEN
    CREATE POLICY "Users can read own saved locations"
      ON saved_locations
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own saved locations'
  ) THEN
    CREATE POLICY "Users can insert own saved locations"
      ON saved_locations
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own saved locations'
  ) THEN
    CREATE POLICY "Users can update own saved locations"
      ON saved_locations
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own saved locations'
  ) THEN
    CREATE POLICY "Users can delete own saved locations"
      ON saved_locations
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;