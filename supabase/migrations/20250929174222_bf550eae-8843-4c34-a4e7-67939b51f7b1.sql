-- Add business and deployment tracking fields to genie_brand_configs
ALTER TABLE genie_brand_configs 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS domain_name TEXT,
ADD COLUMN IF NOT EXISTS deployment_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'experimentation',
ADD COLUMN IF NOT EXISTS daily_limit INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS hourly_limit INTEGER DEFAULT 100;

-- Add domain verification table
CREATE TABLE IF NOT EXISTS genie_domain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_config_id UUID NOT NULL REFERENCES genie_brand_configs(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_method TEXT NOT NULL DEFAULT 'dns',
  verification_token TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  business_justification TEXT,
  approval_status TEXT DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add deployment options tracking
CREATE TABLE IF NOT EXISTS genie_deployment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_config_id UUID NOT NULL REFERENCES genie_brand_configs(id) ON DELETE CASCADE,
  deployment_type TEXT NOT NULL, -- 'javascript', 'python', 'embedded_script', 'api_integration'
  configuration JSONB NOT NULL DEFAULT '{}',
  code_generated TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_genie_domain_verifications_domain ON genie_domain_verifications(domain_name);
CREATE INDEX IF NOT EXISTS idx_genie_domain_verifications_brand_config ON genie_domain_verifications(brand_config_id);
CREATE INDEX IF NOT EXISTS idx_genie_deployment_options_brand_config ON genie_deployment_options(brand_config_id);
CREATE INDEX IF NOT EXISTS idx_genie_deployment_options_type ON genie_deployment_options(deployment_type);

-- Enable RLS
ALTER TABLE genie_domain_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_deployment_options ENABLE ROW LEVEL SECURITY;

-- RLS policies for domain verifications
CREATE POLICY "Users can manage their domain verifications" ON genie_domain_verifications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_domain_verifications.brand_config_id
    AND genie_brand_configs.created_by = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_domain_verifications.brand_config_id
    AND genie_brand_configs.created_by = auth.uid()
  )
);

-- RLS policies for deployment options
CREATE POLICY "Users can manage their deployment options" ON genie_deployment_options
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_deployment_options.brand_config_id
    AND genie_brand_configs.created_by = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_deployment_options.brand_config_id
    AND genie_brand_configs.created_by = auth.uid()
  )
);

-- Admin policies for approvals
CREATE POLICY "Admins can manage all domain verifications" ON genie_domain_verifications
FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_genie_domain_verifications()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_genie_deployment_options()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_genie_domain_verifications_updated_at
  BEFORE UPDATE ON genie_domain_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_genie_domain_verifications();

CREATE TRIGGER update_genie_deployment_options_updated_at
  BEFORE UPDATE ON genie_deployment_options
  FOR EACH ROW
  EXECUTE FUNCTION update_genie_deployment_options();