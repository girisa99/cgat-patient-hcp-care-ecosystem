-- Secure sensitive public tables (fix 2 security errors)
-- Enable RLS and restrict reads to authenticated users only

-- Helper to conditionally create policies
DO $$
BEGIN
  -- treatment_center_onboarding
  EXECUTE 'ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'treatment_center_onboarding' 
      AND policyname = 'Authenticated read treatment_center_onboarding'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Authenticated read treatment_center_onboarding"
      ON public.treatment_center_onboarding
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
    $$;
  END IF;

  -- clinical_trials
  EXECUTE 'ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'clinical_trials' 
      AND policyname = 'Authenticated read clinical_trials'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Authenticated read clinical_trials"
      ON public.clinical_trials
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
    $$;
  END IF;

  -- commercial_products
  EXECUTE 'ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'commercial_products' 
      AND policyname = 'Authenticated read commercial_products'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Authenticated read commercial_products"
      ON public.commercial_products
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
    $$;
  END IF;

  -- products
  EXECUTE 'ALTER TABLE public.products ENABLE ROW LEVEL SECURITY';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products' 
      AND policyname = 'Authenticated read products'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Authenticated read products"
      ON public.products
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
    $$;
  END IF;

  -- manufacturers
  EXECUTE 'ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'manufacturers' 
      AND policyname = 'Authenticated read manufacturers'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Authenticated read manufacturers"
      ON public.manufacturers
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
    $$;
  END IF;
END$$;
