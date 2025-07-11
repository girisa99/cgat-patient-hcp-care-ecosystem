
-- Add missing category column to external_api_registry if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'external_api_registry' 
                   AND column_name = 'category') THEN
        ALTER TABLE public.external_api_registry 
        ADD COLUMN category CHARACTER VARYING;
    END IF;
END $$;

-- Add missing constraints and check constraints for external_api_registry
DO $$
BEGIN
    -- Add status constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_api_registry_status_check') THEN
        ALTER TABLE public.external_api_registry 
        ADD CONSTRAINT external_api_registry_status_check 
        CHECK (status IN ('draft', 'review', 'published', 'deprecated'));
    END IF;
    
    -- Add visibility constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_api_registry_visibility_check') THEN
        ALTER TABLE public.external_api_registry 
        ADD CONSTRAINT external_api_registry_visibility_check 
        CHECK (visibility IN ('private', 'public', 'marketplace'));
    END IF;
    
    -- Add pricing_model constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_api_registry_pricing_model_check') THEN
        ALTER TABLE public.external_api_registry 
        ADD CONSTRAINT external_api_registry_pricing_model_check 
        CHECK (pricing_model IN ('free', 'freemium', 'paid', 'enterprise'));
    END IF;
END $$;

-- Add missing constraints for developer_portal_applications
DO $$
BEGIN
    -- Add application_type constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'developer_portal_applications_application_type_check') THEN
        ALTER TABLE public.developer_portal_applications 
        ADD CONSTRAINT developer_portal_applications_application_type_check 
        CHECK (application_type IN ('web', 'mobile', 'server', 'integration'));
    END IF;
    
    -- Add environment constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'developer_portal_applications_environment_check') THEN
        ALTER TABLE public.developer_portal_applications 
        ADD CONSTRAINT developer_portal_applications_environment_check 
        CHECK (environment IN ('sandbox', 'development', 'production'));
    END IF;
    
    -- Add status constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'developer_portal_applications_status_check') THEN
        ALTER TABLE public.developer_portal_applications 
        ADD CONSTRAINT developer_portal_applications_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
    END IF;
END $$;

-- Add missing constraints for marketplace_listings
DO $$
BEGIN
    -- Add listing_status constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_listings_listing_status_check') THEN
        ALTER TABLE public.marketplace_listings 
        ADD CONSTRAINT marketplace_listings_listing_status_check 
        CHECK (listing_status IN ('draft', 'pending', 'approved', 'rejected', 'suspended'));
    END IF;
END $$;

-- Add foreign key constraint for external_api_registry to api_integration_registry if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_external_api_registry_internal_api_id') THEN
        ALTER TABLE public.external_api_registry 
        ADD CONSTRAINT fk_external_api_registry_internal_api_id 
        FOREIGN KEY (internal_api_id) REFERENCES public.api_integration_registry(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for api_usage_analytics to api_keys if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_api_usage_analytics_api_key_id') THEN
        ALTER TABLE public.api_usage_analytics 
        ADD CONSTRAINT fk_api_usage_analytics_api_key_id 
        FOREIGN KEY (api_key_id) REFERENCES public.api_keys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for developer_portal_applications to auth.users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_developer_portal_applications_user_id') THEN
        ALTER TABLE public.developer_portal_applications 
        ADD CONSTRAINT fk_developer_portal_applications_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create missing RLS policies only if they don't exist
DO $$
BEGIN
    -- Check and create external_api_endpoints policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'external_api_endpoints' AND policyname = 'Users can view endpoints for published APIs') THEN
        EXECUTE 'CREATE POLICY "Users can view endpoints for published APIs" ON public.external_api_endpoints
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.external_api_registry 
            WHERE id = external_api_endpoints.external_api_id 
            AND (status = ''published'' OR created_by = auth.uid())
          )
        )';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'external_api_endpoints' AND policyname = 'Users can manage endpoints for their APIs') THEN
        EXECUTE 'CREATE POLICY "Users can manage endpoints for their APIs" ON public.external_api_endpoints
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.external_api_registry 
            WHERE id = external_api_endpoints.external_api_id 
            AND created_by = auth.uid()
          )
        )';
    END IF;
END $$;
