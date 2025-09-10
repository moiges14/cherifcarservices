/*
  # Create booking notifications system

  1. New Tables
    - `booking_notifications`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings)
      - `recipient_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `message` (text)
      - `notification_type` (text)
      - `is_read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `booking_notifications` table
    - Add policies for users to read their own notifications
    - Add policies for admins to create notifications

  3. Indexes
    - Index on recipient_id for faster queries
    - Index on booking_id for joins
    - Index on created_at for ordering
*/

CREATE TABLE IF NOT EXISTS booking_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text NOT NULL DEFAULT 'general',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own notifications"
  ON booking_notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON booking_notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON booking_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_notifications_recipient_id 
  ON booking_notifications(recipient_id);

CREATE INDEX IF NOT EXISTS idx_booking_notifications_booking_id 
  ON booking_notifications(booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_notifications_created_at 
  ON booking_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_booking_notifications_is_read 
  ON booking_notifications(is_read) WHERE is_read = false;