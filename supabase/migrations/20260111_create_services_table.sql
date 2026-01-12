-- Migration: Create Services Table
-- Description: Creates the services table with all necessary fields and RLS policies
-- Date: 2026-01-11

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  business_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (allows anon key to access)
-- Note: In production, you should restrict this to authenticated users only
CREATE POLICY "Enable all access for services" ON public.services
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create index for faster queries by business_id
CREATE INDEX IF NOT EXISTS services_business_id_idx ON public.services(business_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS services_status_idx ON public.services(status);

-- Add comment to table
COMMENT ON TABLE public.services IS 'Stores all services offered by businesses';

-- Add comments to columns
COMMENT ON COLUMN public.services.id IS 'Unique identifier for the service';
COMMENT ON COLUMN public.services.name IS 'Name of the service (e.g., Haircut, Manicure)';
COMMENT ON COLUMN public.services.duration IS 'Duration of service in minutes';
COMMENT ON COLUMN public.services.price IS 'Price of the service in local currency';
COMMENT ON COLUMN public.services.status IS 'Service status: active or inactive';
COMMENT ON COLUMN public.services.business_id IS 'Reference to the business that offers this service';
