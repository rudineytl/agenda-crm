-- Migration: Create Clients Table
-- Description: Creates the clients table with all necessary fields and RLS policies
-- Date: 2026-01-11

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  notes TEXT,
  business_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (allows anon key to access)
-- Note: In production, you should restrict this to authenticated users only
CREATE POLICY "Enable all access for clients" ON public.clients
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS clients_business_id_idx ON public.clients(business_id);
CREATE INDEX IF NOT EXISTS clients_whatsapp_idx ON public.clients(whatsapp);

-- Add comments to table
COMMENT ON TABLE public.clients IS 'Stores client/customer information';

-- Add comments to columns
COMMENT ON COLUMN public.clients.id IS 'Unique identifier for the client';
COMMENT ON COLUMN public.clients.name IS 'Client full name';
COMMENT ON COLUMN public.clients.whatsapp IS 'Client WhatsApp number';
COMMENT ON COLUMN public.clients.notes IS 'Additional notes about the client';
COMMENT ON COLUMN public.clients.business_id IS 'Reference to the business this client belongs to';
