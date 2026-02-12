-- Phase A1: Regional Landing Content Table
-- Foundation for database-driven regional landing pages with locked routing

CREATE TABLE IF NOT EXISTS public.regional_landing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL,
  
  -- Content fields (text-only in Phase A1)
  headline TEXT NOT NULL,
  subheadline TEXT,
  welcome_script TEXT,
  cta_primary_text TEXT DEFAULT 'Get Started',
  cta_primary_url TEXT,
  cta_secondary_text TEXT,
  cta_secondary_url TEXT,
  
  -- Metadata
  language_code TEXT,
  rtl_enabled BOOLEAN DEFAULT FALSE,
  
  -- Asset placeholders (empty until Phase B1/B2)
  assets JSONB DEFAULT '{}',
  
  -- Version & workflow
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_region CHECK (region_code IN (
    -- Parent regions (15)
    'WESTERN', 'EUR_NORTH', 'EUR_SOUTH', 'EUR_CENTRAL', 'EUR_EASTERN', 'EUR_BALKANS',
    'MENA', 'AFR', 'IND', 'SEA', 'APAC', 'CJK', 'NAM', 'LATAM', 'CARIB',
    -- Europe sub-regions (15)
    'EU_GB', 'EU_FR', 'EU_DE', 'EU_IT', 'EU_ES', 'EU_NL', 'EU_BE', 'EU_CH', 'EU_AT', 'EU_PL', 'EU_CZ', 'EU_SE', 'EU_NO', 'EU_DK', 'EU_NORDIC',
    -- India sub-regions (12)
    'IND_HI', 'IND_EN', 'IND_TA', 'IND_TE', 'IND_KN', 'IND_ML', 'IND_MR', 'IND_GU', 'IND_BN', 'IND_PA', 'IND_OR', 'IND_UR',
    -- CJK (4)
    'CJK_CN', 'CJK_TW', 'CJK_JP', 'CJK_KR',
    -- SEA (5)
    'SEA_MALAY', 'SEA_THAI', 'SEA_VIET', 'SEA_PHIL', 'SEA_PAN',
    -- MENA (5)
    'MENA_SA', 'MENA_AE', 'MENA_EG', 'MENA_IL', 'MENA_TR',
    -- LATAM (5)
    'LATAM_BR', 'LATAM_MX', 'LATAM_AR', 'LATAM_CL', 'LATAM_CO',
    -- Africa (5)
    'AFR_ZA', 'AFR_NG', 'AFR_KE', 'AFR_GH', 'AFR_EG',
    -- NAM (3)
    'NAM_US', 'NAM_CA', 'NAM_MX',
    -- Caribbean (3)
    'CARIB_EN', 'CARIB_FR', 'CARIB_HAI',
    -- Oceania (2)
    'OCEANIA_AU', 'OCEANIA_NZ',
    -- P0 Expansion
    'TURKEY', 'INDONESIA',
    -- P1 Expansion - Eastern Europe
    'EU_UKRAINE', 'EU_CAUCASUS', 'EU_ARMENIA', 'EU_GEORGIA',
    -- P1 Expansion - Central Asia
    'ASIA_CENTRAL_KZ', 'ASIA_CENTRAL_UZ', 'ASIA_CENTRAL_AZ', 'ASIA_CENTRAL_TM', 'ASIA_CENTRAL_KG'
  )),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'approved', 'active', 'archived'))
);

-- Enable RLS
ALTER TABLE public.regional_landing_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active regional content"
  ON public.regional_landing_content
  FOR SELECT
  USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create regional content"
  ON public.regional_landing_content
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update regional content"
  ON public.regional_landing_content
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_regional_landing_region_code ON public.regional_landing_content(region_code);
CREATE INDEX idx_regional_landing_status ON public.regional_landing_content(status);
CREATE INDEX idx_regional_landing_version ON public.regional_landing_content(region_code, version DESC);
CREATE INDEX idx_regional_landing_created_by ON public.regional_landing_content(created_by);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_regional_landing_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER regional_landing_content_updated_at
  BEFORE UPDATE ON public.regional_landing_content
  FOR EACH ROW
  EXECUTE FUNCTION update_regional_landing_content_updated_at();