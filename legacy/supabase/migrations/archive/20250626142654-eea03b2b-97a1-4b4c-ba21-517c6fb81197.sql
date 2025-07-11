
-- Create external API registry table
CREATE TABLE public.external_api_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  internal_api_id UUID REFERENCES public.api_integration_registry(id) ON DELETE CASCADE NOT NULL,
  external_name VARCHAR NOT NULL,
  external_description TEXT,
  version VARCHAR NOT NULL DEFAULT '1.0.0',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'deprecated')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'marketplace')),
  pricing_model VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (pricing_model IN ('free', 'freemium', 'paid', 'enterprise')),
  base_url TEXT,
  documentation_url TEXT,
  sandbox_url TEXT,
  rate_limits JSONB DEFAULT '{"requests": 1000, "period": "hour"}'::jsonb,
  authentication_methods TEXT[] DEFAULT '{"api_key"}',
  supported_formats TEXT[] DEFAULT '{"json"}',
  tags TEXT[] DEFAULT '{}',
  marketplace_config JSONB DEFAULT '{}'::jsonb,
  analytics_config JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id)
);

-- Create external API endpoints table
CREATE TABLE public.external_api_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_api_id UUID REFERENCES public.external_api_registry(id) ON DELETE CASCADE NOT NULL,
  internal_endpoint_id VARCHAR, -- Reference to internal endpoint
  external_path VARCHAR NOT NULL,
  method VARCHAR(10) NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  requires_authentication BOOLEAN DEFAULT true,
  rate_limit_override JSONB,
  request_schema JSONB,
  response_schema JSONB,
  example_request JSONB,
  example_response JSONB,
  tags TEXT[] DEFAULT '{}',
  deprecated BOOLEAN DEFAULT false,
  deprecation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create developer applications table (enhanced version)
CREATE TABLE public.developer_portal_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_name VARCHAR NOT NULL,
  application_type VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (application_type IN ('web', 'mobile', 'server', 'integration')),
  company_name VARCHAR,
  website_url TEXT,
  description TEXT NOT NULL,
  use_case TEXT,
  requested_apis UUID[] DEFAULT '{}', -- Array of external_api_registry IDs
  requested_scopes TEXT[] DEFAULT '{}',
  environment VARCHAR(20) NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'development', 'production')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approval_notes TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  privacy_policy_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Create API usage analytics table
CREATE TABLE public.api_usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_api_id UUID REFERENCES public.external_api_registry(id) ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint_path VARCHAR NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  user_agent TEXT,
  ip_address INET,
  country_code VARCHAR(2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  rate_limited BOOLEAN DEFAULT false
);

-- Create marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_api_id UUID REFERENCES public.external_api_registry(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  logo_url TEXT,
  screenshots TEXT[] DEFAULT '{}',
  video_url TEXT,
  demo_url TEXT,
  support_url TEXT,
  pricing_info JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb, -- Usage stats, ratings, etc.
  seo_keywords TEXT[] DEFAULT '{}',
  seo_description TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  listing_status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (listing_status IN ('draft', 'pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create external API change logs table
CREATE TABLE public.external_api_change_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_api_id UUID REFERENCES public.external_api_registry(id) ON DELETE CASCADE NOT NULL,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('created', 'updated', 'published', 'deprecated', 'endpoint_added', 'endpoint_removed', 'breaking_change')),
  version_from VARCHAR,
  version_to VARCHAR,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  breaking_change BOOLEAN DEFAULT false,
  migration_guide TEXT,
  affected_endpoints TEXT[] DEFAULT '{}',
  developer_notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.external_api_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_portal_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_api_change_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for external_api_registry
CREATE POLICY "External APIs are publicly viewable when published" 
  ON public.external_api_registry 
  FOR SELECT 
  USING (status = 'published' AND visibility IN ('public', 'marketplace'));

CREATE POLICY "Authenticated users can create external APIs" 
  ON public.external_api_registry 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own external APIs" 
  ON public.external_api_registry 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- RLS Policies for external_api_endpoints
CREATE POLICY "External API endpoints are viewable with parent API" 
  ON public.external_api_endpoints 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.external_api_registry 
    WHERE id = external_api_endpoints.external_api_id 
    AND (status = 'published' OR created_by = auth.uid())
  ));

-- RLS Policies for developer_portal_applications
CREATE POLICY "Users can view their own applications" 
  ON public.developer_portal_applications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own applications" 
  ON public.developer_portal_applications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own applications" 
  ON public.developer_portal_applications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS Policies for marketplace_listings
CREATE POLICY "Marketplace listings are publicly viewable when approved" 
  ON public.marketplace_listings 
  FOR SELECT 
  USING (listing_status = 'approved');

-- Create indexes for performance
CREATE INDEX idx_external_api_registry_status ON public.external_api_registry(status);
CREATE INDEX idx_external_api_registry_visibility ON public.external_api_registry(visibility);
CREATE INDEX idx_external_api_endpoints_api_id ON public.external_api_endpoints(external_api_id);
CREATE INDEX idx_developer_portal_applications_user_id ON public.developer_portal_applications(user_id);
CREATE INDEX idx_developer_portal_applications_status ON public.developer_portal_applications(status);
CREATE INDEX idx_api_usage_analytics_api_id ON public.api_usage_analytics(external_api_id);
CREATE INDEX idx_api_usage_analytics_timestamp ON public.api_usage_analytics(timestamp);
CREATE INDEX idx_marketplace_listings_category ON public.marketplace_listings(category);
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(listing_status);

-- Create trigger to update updated_at columns
CREATE TRIGGER update_external_api_registry_updated_at 
  BEFORE UPDATE ON public.external_api_registry 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_external_api_endpoints_updated_at 
  BEFORE UPDATE ON public.external_api_endpoints 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_developer_portal_applications_updated_at 
  BEFORE UPDATE ON public.developer_portal_applications 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at 
  BEFORE UPDATE ON public.marketplace_listings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
