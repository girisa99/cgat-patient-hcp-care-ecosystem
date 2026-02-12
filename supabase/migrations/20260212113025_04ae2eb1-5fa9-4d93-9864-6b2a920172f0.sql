-- Drop existing valid_region constraint and re-create with India per-language codes
ALTER TABLE public.regional_narration_scripts DROP CONSTRAINT valid_region;

ALTER TABLE public.regional_narration_scripts ADD CONSTRAINT valid_region CHECK (
  region_code = ANY (ARRAY[
    -- Parent-level fallbacks (lowercase)
    'nam', 'eu', 'latam', 'mena', 'africa', 'india', 'sea', 'cjk',
    -- NAM sub-regions
    'NAM_US', 'NAM_CA',
    -- EU sub-regions (existing)
    'EU_WEST', 'EU_DACH', 'EU_FRANCE', 'EU_IBERIA', 'EU_NORDIC', 'EU_EAST',
    -- EU per-country codes
    'EU_DE', 'EU_AT', 'EU_CH',
    'EU_FR', 'EU_BE_FR',
    'EU_ES', 'EU_PT',
    'EU_SE', 'EU_NO', 'EU_DK', 'EU_FI',
    'EU_PL', 'EU_CZ', 'EU_RO', 'EU_HU',
    -- LATAM sub-regions
    'LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_ANDEAN', 'LATAM_CONESUR', 'LATAM_CARIB',
    -- MENA sub-regions
    'MENA_GULF', 'MENA_EGYPT', 'MENA_LEVANT', 'MENA_MAGHREB', 'MENA_MSA',
    -- Africa sub-regions
    'AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_FRANCO',
    -- Standalone
    'PAKISTAN', 'BANGLADESH',
    -- India sub-regions (parent level)
    'INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_WEST', 'INDIA_EAST', 'INDIA_PAN',
    -- India per-language codes (NEW - 12 leaf nodes)
    'INDIA_NORTH_HI', 'INDIA_NORTH_UR', 'INDIA_NORTH_PA',
    'INDIA_SOUTH_TA', 'INDIA_SOUTH_TE', 'INDIA_SOUTH_KN', 'INDIA_SOUTH_ML',
    'INDIA_WEST_MR', 'INDIA_WEST_GU',
    'INDIA_EAST_BN', 'INDIA_EAST_OR',
    'INDIA_PAN_EN',
    -- SEA sub-regions
    'SEA_MALAY', 'SEA_THAI', 'SEA_VIET', 'SEA_PHIL', 'SEA_PAN',
    -- CJK sub-regions
    'CJK_CN', 'CJK_TW', 'CJK_JP', 'CJK_KR'
  ])
);