
-- Update valid_region constraint to match actual codes used in REGION_HIERARCHY
ALTER TABLE public.regional_narration_scripts DROP CONSTRAINT valid_region;

ALTER TABLE public.regional_narration_scripts ADD CONSTRAINT valid_region CHECK (
  region_code = ANY (ARRAY[
    -- Parent regions (lowercase)
    'nam', 'eu', 'latam', 'mena', 'africa', 'india', 'sea', 'cjk',
    -- NAM sub-regions
    'NAM_US', 'NAM_CA',
    -- EU sub-regions
    'EU_WEST', 'EU_DACH', 'EU_FRANCE', 'EU_IBERIA', 'EU_NORDIC', 'EU_EAST',
    -- LATAM sub-regions
    'LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_ANDEAN', 'LATAM_CONESUR', 'LATAM_CARIB',
    -- MENA sub-regions
    'MENA_GULF', 'MENA_EGYPT', 'MENA_LEVANT', 'MENA_MAGHREB', 'MENA_MSA',
    -- Africa sub-regions
    'AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_FRANCO',
    -- Standalone
    'PAKISTAN', 'BANGLADESH',
    -- India sub-regions
    'INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_WEST', 'INDIA_EAST', 'INDIA_PAN',
    -- SEA sub-regions
    'SEA_MALAY', 'SEA_THAI', 'SEA_VIET', 'SEA_PHIL', 'SEA_PAN',
    -- CJK sub-regions
    'CJK_CN', 'CJK_TW', 'CJK_JP', 'CJK_KR'
  ])
);
