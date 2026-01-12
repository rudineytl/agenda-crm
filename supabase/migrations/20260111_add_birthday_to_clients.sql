-- Migration: Add Birthday Field to Clients
-- Description: Adds birth_date column to clients table for birthday tracking
-- Date: 2026-01-11

-- Add birth_date column to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Create index for birthday queries (helps with "birthdays this week" queries)
CREATE INDEX IF NOT EXISTS clients_birth_date_idx ON public.clients(birth_date);

-- Create a partial index for non-null birthdays (more efficient)
CREATE INDEX IF NOT EXISTS clients_birth_date_not_null_idx 
ON public.clients(birth_date) 
WHERE birth_date IS NOT NULL;

-- Add comment to column
COMMENT ON COLUMN public.clients.birth_date IS 'Client birth date for birthday notifications and greetings';

-- Optional: Create a function to get upcoming birthdays
CREATE OR REPLACE FUNCTION get_upcoming_birthdays(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  id UUID,
  name TEXT,
  whatsapp TEXT,
  birth_date DATE,
  days_until_birthday INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.whatsapp,
    c.birth_date,
    CASE 
      WHEN EXTRACT(DOY FROM c.birth_date) >= EXTRACT(DOY FROM CURRENT_DATE) THEN
        EXTRACT(DOY FROM c.birth_date)::INTEGER - EXTRACT(DOY FROM CURRENT_DATE)::INTEGER
      ELSE
        (365 + EXTRACT(DOY FROM c.birth_date)::INTEGER - EXTRACT(DOY FROM CURRENT_DATE)::INTEGER)
    END as days_until_birthday
  FROM public.clients c
  WHERE c.birth_date IS NOT NULL
    AND (
      -- Birthday is within the next N days this year
      (EXTRACT(DOY FROM c.birth_date) BETWEEN EXTRACT(DOY FROM CURRENT_DATE) 
       AND EXTRACT(DOY FROM CURRENT_DATE) + days_ahead)
      OR
      -- Birthday is early next year (handles year wrap-around)
      (EXTRACT(DOY FROM CURRENT_DATE) + days_ahead > 365 
       AND EXTRACT(DOY FROM c.birth_date) <= (EXTRACT(DOY FROM CURRENT_DATE) + days_ahead - 365))
    )
  ORDER BY days_until_birthday;
END;
$$ LANGUAGE plpgsql;

-- Add comment to function
COMMENT ON FUNCTION get_upcoming_birthdays IS 'Returns clients with birthdays in the next N days (default 7)';
