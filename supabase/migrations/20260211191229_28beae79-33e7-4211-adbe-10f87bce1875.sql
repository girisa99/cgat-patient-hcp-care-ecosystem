
-- Drop the old restrictive check constraint and replace with one that includes all sub-regions
ALTER TABLE public.regional_narration_scripts DROP CONSTRAINT valid_region;

ALTER TABLE public.regional_narration_scripts ADD CONSTRAINT valid_region CHECK (
  region_code = ANY (ARRAY[
    -- Parent regions
    'nam', 'eu', 'latam', 'mena', 'africa', 'india', 'sea', 'cjk',
    -- NAM sub-regions
    'NAM_US', 'NAM_CANADA', 'NAM_CARIBBEAN',
    -- EU sub-regions
    'EU_WEST', 'EU_NORTH', 'EU_SOUTH', 'EU_EAST', 'EU_DACH',
    -- LATAM sub-regions
    'LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_ANDEAN', 'LATAM_SOUTHERN', 'LATAM_CENTRAL',
    -- MENA sub-regions
    'MENA_GULF', 'MENA_LEVANT', 'MENA_EGYPT', 'MENA_MAGHREB', 'MENA_IRAQ', 'MENA_YEMEN', 'MENA_IRAN',
    -- Africa sub-regions
    'AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_FRANCO',
    -- India sub-regions
    'INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_EAST', 'INDIA_WEST',
    -- SEA sub-regions
    'SEA_MARITIME', 'SEA_MAINLAND', 'SEA_PHILIPPINES',
    -- CJK sub-regions
    'CJK_JAPAN', 'CJK_KOREA', 'CJK_CHINA', 'CJK_TAIWAN', 'CJK_HONGKONG',
    -- Standalone
    'PAKISTAN', 'BANGLADESH'
  ])
);
