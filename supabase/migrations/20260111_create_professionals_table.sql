-- Migration: Create Professionals Table
-- Description: Creates the professionals table with all necessary fields and RLS policies
-- Date: 2026-01-11

-- Create professionals table
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  business_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (allows anon key to access)
-- Note: In production, you should restrict this to authenticated users only
CREATE POLICY "Enable all access for professionals" ON public.professionals
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create index for faster queries by business_id
CREATE INDEX IF NOT EXISTS professionals_business_id_idx ON public.professionals(business_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS professionals_status_idx ON public.professionals(status);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS professionals_email_idx ON public.professionals(email);

-- Add comment to table
COMMENT ON TABLE public.professionals IS 'Stores all professionals/staff members for businesses';

-- Add comments to columns
COMMENT ON COLUMN public.professionals.id IS 'Unique identifier for the professional';
COMMENT ON COLUMN public.professionals.name IS 'Full name of the professional';
COMMENT ON COLUMN public.professionals.email IS 'Email address for login and notifications';
COMMENT ON COLUMN public.professionals.status IS 'Professional status: active or inactive';
COMMENT ON COLUMN public.professionals.business_id IS 'Reference to the business this professional works for';
