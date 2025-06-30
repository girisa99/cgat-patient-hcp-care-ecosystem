
-- Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service_type TEXT,
  description TEXT,
  geographic_coverage TEXT[] DEFAULT '{}',
  capabilities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create service_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT DEFAULT 'third_party',
  specializations TEXT[] DEFAULT '{}',
  geographic_coverage TEXT[] DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
  -- Add geographic_coverage to services if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'geographic_coverage') THEN
    ALTER TABLE public.services ADD COLUMN geographic_coverage TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add capabilities to services if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'capabilities') THEN
    ALTER TABLE public.services ADD COLUMN capabilities TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add specializations to service_providers if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'specializations') THEN
    ALTER TABLE public.service_providers ADD COLUMN specializations TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add geographic_coverage to service_providers if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'geographic_coverage') THEN
    ALTER TABLE public.service_providers ADD COLUMN geographic_coverage TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Enable RLS for services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.services;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.services;

CREATE POLICY "Enable read access for all users" ON public.services FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.services FOR UPDATE USING (true);

-- Enable RLS for service_providers
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Enable read access for all users" ON public.service_providers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.service_providers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.service_providers;

CREATE POLICY "Enable read access for all users" ON public.service_providers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.service_providers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.service_providers FOR UPDATE USING (true);
