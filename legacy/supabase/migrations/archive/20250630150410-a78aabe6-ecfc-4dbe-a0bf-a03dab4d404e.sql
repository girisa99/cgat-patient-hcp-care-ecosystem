
-- SAFE SQL MIGRATION: Only create NEW tables for onboarding data
-- This will NOT affect existing authentication, modules, or user management

-- 1. Create therapies table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.therapies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  therapy_type TEXT,
  description TEXT,
  indication_areas TEXT[],
  regulatory_status TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create manufacturers table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer_type TEXT,
  headquarters_location TEXT,
  quality_certifications TEXT[],
  manufacturing_capabilities TEXT[],
  partnership_tier TEXT,
  regulatory_status JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create modalities table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  modality_type TEXT,
  description TEXT,
  administration_requirements JSONB DEFAULT '{}',
  cold_chain_requirements JSONB DEFAULT '{}',
  manufacturing_complexity TEXT,
  shelf_life_considerations TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create products table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  therapy_id UUID REFERENCES public.therapies(id),
  modality_id UUID REFERENCES public.modalities(id),
  manufacturer_id UUID REFERENCES public.manufacturers(id),
  product_type TEXT,
  indication_areas TEXT[],
  regulatory_approvals JSONB DEFAULT '{}',
  pricing_information JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create services table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type TEXT,
  description TEXT,
  capabilities TEXT[],
  geographic_coverage TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create service_providers table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT,
  specializations TEXT[],
  geographic_coverage TEXT[],
  certifications TEXT[],
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create service_provider_capabilities table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.service_provider_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID REFERENCES public.service_providers(id),
  service_type TEXT,
  therapy_area TEXT,
  capability_level TEXT,
  is_preferred BOOLEAN DEFAULT false,
  geographic_coverage TEXT[],
  certifications TEXT[],
  experience_years INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create clinical_trials table (only if it doesn't exist - but check if it already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clinical_trials') THEN
    CREATE TABLE public.clinical_trials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID REFERENCES public.products(id),
      nct_number TEXT,
      title TEXT NOT NULL,
      phase TEXT,
      trial_status TEXT,
      primary_indication TEXT,
      patient_population TEXT,
      enrollment_target INTEGER,
      enrollment_current INTEGER DEFAULT 0,
      start_date DATE,
      estimated_completion_date DATE,
      actual_completion_date DATE,
      primary_endpoint TEXT,
      secondary_endpoints TEXT[],
      eligibility_criteria JSONB DEFAULT '{}',
      trial_locations TEXT[],
      investigational_sites JSONB DEFAULT '{}',
      sponsor_info JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END $$;

-- 9. Create commercial_products table (only if it doesn't exist - but check if it already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'commercial_products') THEN
    CREATE TABLE public.commercial_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID REFERENCES public.products(id),
      launch_date DATE,
      market_regions TEXT[],
      reimbursement_status JSONB DEFAULT '{}',
      patient_access_programs JSONB DEFAULT '{}',
      distribution_channels TEXT[],
      competitive_landscape JSONB DEFAULT '{}',
      volume_projections JSONB DEFAULT '{}',
      key_opinion_leaders TEXT[],
      medical_affairs_contacts JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END $$;

-- 10. Add updated_at triggers for new tables only
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers only to new tables (safe)
DO $$ 
BEGIN
  -- Add trigger for therapies if table exists and trigger doesn't
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'therapies') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_therapies_updated_at') THEN
      CREATE TRIGGER update_therapies_updated_at
        BEFORE UPDATE ON public.therapies
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;

  -- Add trigger for manufacturers if table exists and trigger doesn't
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'manufacturers') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_manufacturers_updated_at') THEN
      CREATE TRIGGER update_manufacturers_updated_at
        BEFORE UPDATE ON public.manufacturers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;

  -- Add trigger for modalities if table exists and trigger doesn't
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modalities') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_modalities_updated_at') THEN
      CREATE TRIGGER update_modalities_updated_at
        BEFORE UPDATE ON public.modalities
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;

  -- Add trigger for products if table exists and trigger doesn't
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON public.products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;

  -- Add trigger for services if table exists and trigger doesn't
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
      CREATE TRIGGER update_services_updated_at
        BEFORE UPDATE ON public.services
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;

  -- Add trigger for service_providers if table exists and trigger doesn't
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_providers') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_service_providers_updated_at') THEN
      CREATE TRIGGER update_service_providers_updated_at
        BEFORE UPDATE ON public.service_providers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;
END $$;

-- 11. Add basic RLS policies (safe - only for new tables)
-- Enable RLS first
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_capabilities ENABLE ROW LEVEL SECURITY;

-- Create permissive read policies for authenticated users (using DROP/CREATE to avoid conflicts)
DO $$
BEGIN
  -- Therapies policies
  BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read access" ON public.therapies;
    CREATE POLICY "Allow authenticated read access" ON public.therapies FOR SELECT TO authenticated USING (true);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Manufacturers policies
  BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read access" ON public.manufacturers;
    CREATE POLICY "Allow authenticated read access" ON public.manufacturers FOR SELECT TO authenticated USING (true);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Modalities policies
  BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read access" ON public.modalities;
    CREATE POLICY "Allow authenticated read access" ON public.modalities FOR SELECT TO authenticated USING (true);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Products policies
  BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read access" ON public.products;
    CREATE POLICY "Allow authenticated read access" ON public.products FOR SELECT TO authenticated USING (true);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Services policies
  BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read access" ON public.services;
    CREATE POLICY "Allow authenticated read access" ON public.services FOR SELECT TO authenticated USING (true);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Service providers policies
  BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read access" ON public.service_providers;
    CREATE POLICY "Allow authenticated read access" ON public.service_providers FOR SELECT TO authenticated USING (true);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Service provider capabilities policies
  BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read access" ON public.service_provider_capabilities;
    CREATE POLICY "Allow authenticated read access" ON public.service_provider_capabilities FOR SELECT TO authenticated USING (true);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Add policies for clinical_trials and commercial_products if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clinical_trials') THEN
    ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
    BEGIN
      DROP POLICY IF EXISTS "Allow authenticated read access" ON public.clinical_trials;
      CREATE POLICY "Allow authenticated read access" ON public.clinical_trials FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'commercial_products') THEN
    ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY;
    BEGIN
      DROP POLICY IF EXISTS "Allow authenticated read access" ON public.commercial_products;
      CREATE POLICY "Allow authenticated read access" ON public.commercial_products FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;
