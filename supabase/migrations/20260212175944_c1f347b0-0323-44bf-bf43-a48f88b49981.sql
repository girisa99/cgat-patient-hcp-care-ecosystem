-- Add P0/P1 region codes to valid_region constraint
ALTER TABLE public.regional_narration_scripts DROP CONSTRAINT IF EXISTS valid_region;

ALTER TABLE public.regional_narration_scripts ADD CONSTRAINT valid_region CHECK (
  region_code IN (
    -- Global English Base
    'ENGLISH_BASE',
    -- NAM
    'nam', 'NAM_US', 'NAM_CA',
    -- EU Core
    'eu', 'EU_WEST', 'EU_DACH', 'EU_DE', 'EU_AT', 'EU_CH',
    'EU_FRANCE', 'EU_FR', 'EU_BE_FR',
    'EU_IBERIA', 'EU_ES', 'EU_PT',
    'EU_NORDIC', 'EU_SE', 'EU_NO', 'EU_DK', 'EU_FI',
    'EU_EAST', 'EU_PL', 'EU_CZ', 'EU_RO', 'EU_HU',
    -- P1: Extended EU
    'EU_UKRAINE', 'EU_BALKANS', 'EU_CAUCASUS',
    -- LATAM
    'latam', 'LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_ANDEAN', 'LATAM_CONESUR', 'LATAM_CARIB',
    -- MENA
    'mena', 'MENA_GULF', 'MENA_EGYPT', 'MENA_LEVANT', 'MENA_MAGHREB', 'MENA_MSA',
    -- Africa
    'africa', 'AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_FRANCO',
    -- Pakistan & Bangladesh
    'pakistan', 'PAKISTAN', 'bangladesh', 'BANGLADESH',
    -- India
    'india', 'INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_WEST', 'INDIA_EAST', 'INDIA_PAN',
    'INDIA_NORTH_HI', 'INDIA_NORTH_UR', 'INDIA_NORTH_PA',
    'INDIA_SOUTH_TA', 'INDIA_SOUTH_TE', 'INDIA_SOUTH_KN', 'INDIA_SOUTH_ML',
    'INDIA_WEST_MR', 'INDIA_WEST_GU',
    'INDIA_EAST_BN', 'INDIA_EAST_OR',
    'INDIA_PAN_EN',
    -- SEA
    'sea', 'SEA_MALAY', 'SEA_THAI', 'SEA_VIET', 'SEA_PHIL', 'SEA_PAN',
    -- CJK
    'cjk', 'CJK_CN', 'CJK_TW', 'CJK_JP', 'CJK_KR',
    -- P0: Oceania
    'oceania', 'OCEANIA_AU', 'OCEANIA_NZ',
    -- P0: Turkey
    'turkey', 'TURKEY',
    -- P1: Caribbean (separate from LATAM_CARIB)
    'caribbean', 'CARIBBEAN_EN', 'CARIBBEAN_FR',
    -- P1: Eurasia (Eastern Europe & Caucasus)
    'eurasia',
    -- P1: Central Asia
    'central_asia', 'ASIA_CENTRAL_KZ', 'ASIA_CENTRAL_UZ', 'ASIA_CENTRAL_AZ', 'ASIA_CENTRAL_AM', 'ASIA_CENTRAL_GE'
  )
);