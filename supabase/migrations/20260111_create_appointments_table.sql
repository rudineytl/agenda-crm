-- Migration: Create Appointments Table
-- Description: Creates the appointments table with all necessary fields and RLS policies
-- Date: 2026-01-11

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  professional_id TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  reminder TEXT DEFAULT 'none' CHECK (reminder IN ('none', '1h', '2h', '24h')),
  notes TEXT,
  business_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (allows anon key to access)
-- Note: In production, you should restrict this to authenticated users only
CREATE POLICY "Enable all access for appointments" ON public.appointments
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS appointments_business_id_idx ON public.appointments(business_id);
CREATE INDEX IF NOT EXISTS appointments_client_id_idx ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS appointments_professional_id_idx ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS appointments_service_id_idx ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments(date);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON public.appointments(status);

-- Create composite index for common queries (date + professional)
CREATE INDEX IF NOT EXISTS appointments_date_professional_idx ON public.appointments(date, professional_id);

-- Add comments to table
COMMENT ON TABLE public.appointments IS 'Stores all appointment bookings';

-- Add comments to columns
COMMENT ON COLUMN public.appointments.id IS 'Unique identifier for the appointment';
COMMENT ON COLUMN public.appointments.client_id IS 'Reference to the client being served';
COMMENT ON COLUMN public.appointments.service_id IS 'Reference to the service being provided';
COMMENT ON COLUMN public.appointments.professional_id IS 'Reference to the professional performing the service';
COMMENT ON COLUMN public.appointments.date IS 'Date of the appointment';
COMMENT ON COLUMN public.appointments.time IS 'Time of the appointment (HH:MM format)';
COMMENT ON COLUMN public.appointments.status IS 'Appointment status: pending, confirmed, completed, or cancelled';
COMMENT ON COLUMN public.appointments.reminder IS 'WhatsApp reminder setting: none, 1h, 2h, or 24h';
COMMENT ON COLUMN public.appointments.notes IS 'Additional notes about the appointment';
COMMENT ON COLUMN public.appointments.business_id IS 'Reference to the business this appointment belongs to';
