/*
  # Add driver features and status management
  
  1. Changes
    - Add new columns to drivers table
    - Add status management
    - Add vehicle information
    - Add rating system
    
  2. Security
    - Update RLS policies for drivers
    - Add policies for public driver profile viewing
*/

-- Update drivers table with new fields
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS status text DEFAULT 'offline'::text,
ADD COLUMN IF NOT EXISTS current_location jsonb,
ADD COLUMN IF NOT EXISTS vehicle_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS license_number text,
ADD COLUMN IF NOT EXISTS rating double precision DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS total_rides integer DEFAULT 0;

-- Add status constraint if it doesn't exist
DO $$ BEGIN
  ALTER TABLE drivers
    ADD CONSTRAINT valid_status CHECK (status IN ('available', 'busy', 'offline'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add function to update driver status when booking status changes
CREATE OR REPLACE FUNCTION update_driver_status_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'in_progress' THEN
    UPDATE drivers SET status = 'busy' WHERE id = NEW.driver_id;
  ELSIF NEW.status IN ('completed', 'cancelled') THEN
    UPDATE drivers SET status = 'available' WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking status changes
DO $$ BEGIN
  CREATE TRIGGER on_booking_driver_update
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_status_on_booking();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update RLS policies
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Drivers can view and update their own profile"
    ON drivers
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view driver profiles"
    ON drivers
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;