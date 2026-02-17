-- Secure sensitive business and healthcare tables with minimal-impact RLS
-- Pattern: enable RLS, allow SELECT for authenticated users (or admins where required),
-- allow ALL operations only for admins (superAdmin/onboardingTeam via is_admin_user_safe)

-- Helper procedure to apply standard policies conditionally
DO $$ BEGIN
  -- commercial_products
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'commercial_products'
  ) THEN
    EXECUTE 'ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='commercial_products' AND policyname='Authenticated users can view commercial_products'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view commercial_products" ON public.commercial_products FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='commercial_products' AND policyname='Admins can manage commercial_products'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage commercial_products" ON public.commercial_products FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- clinical_trials
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'clinical_trials'
  ) THEN
    EXECUTE 'ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='clinical_trials' AND policyname='Authenticated users can view clinical_trials'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view clinical_trials" ON public.clinical_trials FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='clinical_trials' AND policyname='Admins can manage clinical_trials'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage clinical_trials" ON public.clinical_trials FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- products
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    EXECUTE 'ALTER TABLE public.products ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='products' AND policyname='Authenticated users can view products'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='products' AND policyname='Admins can manage products'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- manufacturers
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'manufacturers'
  ) THEN
    EXECUTE 'ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='manufacturers' AND policyname='Authenticated users can view manufacturers'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view manufacturers" ON public.manufacturers FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='manufacturers' AND policyname='Admins can manage manufacturers'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage manufacturers" ON public.manufacturers FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- service_providers
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'service_providers'
  ) THEN
    EXECUTE 'ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='service_providers' AND policyname='Authenticated users can view service_providers'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view service_providers" ON public.service_providers FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='service_providers' AND policyname='Admins can manage service_providers'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage service_providers" ON public.service_providers FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- services
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'services'
  ) THEN
    EXECUTE 'ALTER TABLE public.services ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='services' AND policyname='Authenticated users can view services'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view services" ON public.services FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='services' AND policyname='Admins can manage services'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- treatment_center_onboarding (restrict to onboardingTeam/superAdmin only)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'treatment_center_onboarding'
  ) THEN
    EXECUTE 'ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='treatment_center_onboarding' AND policyname='Admins can view treatment_center_onboarding'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can view treatment_center_onboarding" ON public.treatment_center_onboarding FOR SELECT USING (is_admin_user_safe(auth.uid()))';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='treatment_center_onboarding' AND policyname='Admins can manage treatment_center_onboarding'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage treatment_center_onboarding" ON public.treatment_center_onboarding FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- mcp_servers (system config)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'mcp_servers'
  ) THEN
    EXECUTE 'ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mcp_servers' AND policyname='Authenticated users can view mcp_servers'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view mcp_servers" ON public.mcp_servers FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mcp_servers' AND policyname='Admins can manage mcp_servers'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage mcp_servers" ON public.mcp_servers FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- voice_providers (system config)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'voice_providers'
  ) THEN
    EXECUTE 'ALTER TABLE public.voice_providers ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='voice_providers' AND policyname='Authenticated users can view voice_providers'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view voice_providers" ON public.voice_providers FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='voice_providers' AND policyname='Admins can manage voice_providers'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage voice_providers" ON public.voice_providers FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;

  -- credit_application_terms (sensitive config/compliance)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'credit_application_terms'
  ) THEN
    EXECUTE 'ALTER TABLE public.credit_application_terms ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='credit_application_terms' AND policyname='Authenticated users can view credit_application_terms'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view credit_application_terms" ON public.credit_application_terms FOR SELECT USING (auth.uid() IS NOT NULL)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='credit_application_terms' AND policyname='Admins can manage credit_application_terms'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can manage credit_application_terms" ON public.credit_application_terms FOR ALL USING (is_admin_user_safe(auth.uid()))';
    END IF;
  END IF;
END $$;