-- Migration: Create Businesses Table
-- Description: Creates the businesses table with all necessary fields and RLS policies
-- Date: 2026-01-11

-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hours TEXT DEFAULT '08:00 - 18:00',
  branding_color TEXT DEFAULT '#4f46e5',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (allows anon key to access)
-- Note: In production, you should restrict this to authenticated users only
CREATE POLICY "Enable all access for businesses" ON public.businesses
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Add comments to table
COMMENT ON TABLE public.businesses IS 'Stores business/salon information';

-- Add comments to columns
COMMENT ON COLUMN public.businesses.id IS 'Unique identifier for the business';
COMMENT ON COLUMN public.businesses.name IS 'Business name';
COMMENT ON COLUMN public.businesses.hours IS 'Business operating hours';
COMMENT ON COLUMN public.businesses.branding_color IS 'Primary brand color (hex format)';
COMMENT ON COLUMN public.businesses.logo_url IS 'URL to the business logo image';
