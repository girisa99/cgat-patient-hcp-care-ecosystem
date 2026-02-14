
-- Drop and recreate valid_region constraint on regional_narration_scripts
-- Adding: MENA_ISRAEL, EU_BENELUX, EU_NL, EU_BE_NL, EU_ITALY, EU_IT, EU_GR, south_asia, SA_NEPAL, SA_SRILANKA, SA_BHUTAN, SA_MALDIVES

ALTER TABLE public.regional_narration_scripts DROP CONSTRAINT IF EXISTS valid_region;

ALTER TABLE public.regional_narration_scripts ADD CONSTRAINT valid_region CHECK (
  region_code = ANY (ARRAY[
    'ENGLISH_BASE',
    -- North America
    'nam', 'NAM_US', 'NAM_CA',
    -- Europe
    'eu', 'EU_WEST',
    'EU_DACH', 'EU_DE', 'EU_AT', 'EU_CH',
    'EU_FRANCE', 'EU_FR', 'EU_BE_FR',
    'EU_BENELUX', 'EU_NL', 'EU_BE_NL',
    'EU_IBERIA', 'EU_ES', 'EU_PT',
    'EU_ITALY', 'EU_IT',
    'EU_NORDIC', 'EU_SE', 'EU_NO', 'EU_DK', 'EU_FI',
    'EU_EAST', 'EU_PL', 'EU_CZ', 'EU_RO', 'EU_HU', 'EU_GR',
    'EU_UKRAINE', 'EU_BALKANS', 'EU_CAUCASUS',
    -- LATAM
    'latam', 'LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_ANDEAN', 'LATAM_CONESUR', 'LATAM_CARIB',
    -- MENA
    'mena', 'MENA_GULF', 'MENA_EGYPT', 'MENA_LEVANT', 'MENA_MAGHREB', 'MENA_MSA', 'MENA_ISRAEL',
    -- Africa
    'africa', 'AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_FRANCO',
    -- Pakistan & Bangladesh
    'pakistan', 'PAKISTAN', 'bangladesh', 'BANGLADESH',
    -- South Asia (NEW)
    'south_asia', 'SA_NEPAL', 'SA_SRILANKA', 'SA_BHUTAN', 'SA_MALDIVES',
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
    -- Oceania
    'oceania', 'OCEANIA_AU', 'OCEANIA_NZ',
    -- Turkey
    'turkey', 'TURKEY',
    -- Caribbean
    'caribbean', 'CARIBBEAN_EN', 'CARIBBEAN_FR',
    -- Eurasia & Central Asia
    'eurasia', 'central_asia',
    'ASIA_CENTRAL_KZ', 'ASIA_CENTRAL_UZ', 'ASIA_CENTRAL_AZ', 'ASIA_CENTRAL_AM', 'ASIA_CENTRAL_GE'
  ])
);

-- Drop and recreate valid_region constraint on regional_landing_content
ALTER TABLE public.regional_landing_content DROP CONSTRAINT IF EXISTS valid_region;

ALTER TABLE public.regional_landing_content ADD CONSTRAINT valid_region CHECK (
  region_code = ANY (ARRAY[
    'WESTERN', 'EUR_NORTH', 'EUR_SOUTH', 'EUR_CENTRAL', 'EUR_EASTERN', 'EUR_BALKANS',
    'MENA', 'AFR', 'IND', 'SEA', 'APAC', 'CJK', 'NAM', 'LATAM', 'CARIB',
    -- EU per-country
    'EU_GB', 'EU_FR', 'EU_DE', 'EU_IT', 'EU_ES', 'EU_NL', 'EU_BE', 'EU_BE_NL', 'EU_BE_FR',
    'EU_CH', 'EU_AT', 'EU_PL', 'EU_CZ', 'EU_SE', 'EU_NO', 'EU_DK', 'EU_NORDIC',
    'EU_RO', 'EU_HU', 'EU_GR', 'EU_FI',
    -- India per-language
    'IND_HI', 'IND_EN', 'IND_TA', 'IND_TE', 'IND_KN', 'IND_ML', 'IND_MR', 'IND_GU', 'IND_BN', 'IND_PA', 'IND_OR', 'IND_UR',
    -- CJK
    'CJK_CN', 'CJK_TW', 'CJK_JP', 'CJK_KR',
    -- SEA
    'SEA_MALAY', 'SEA_THAI', 'SEA_VIET', 'SEA_PHIL', 'SEA_PAN',
    -- MENA
    'MENA_SA', 'MENA_AE', 'MENA_EG', 'MENA_IL', 'MENA_TR', 'MENA_ISRAEL',
    'MENA_GULF', 'MENA_LEVANT', 'MENA_MAGHREB', 'MENA_MSA',
    -- LATAM
    'LATAM_BR', 'LATAM_MX', 'LATAM_AR', 'LATAM_CL', 'LATAM_CO',
    'LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_ANDEAN', 'LATAM_CONESUR', 'LATAM_CARIB',
    -- Africa
    'AFR_ZA', 'AFR_NG', 'AFR_KE', 'AFR_GH', 'AFR_EG',
    'AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_FRANCO',
    -- NAM
    'NAM_US', 'NAM_CA', 'NAM_MX',
    -- Caribbean
    'CARIB_EN', 'CARIB_FR', 'CARIB_HAI', 'CARIBBEAN_EN', 'CARIBBEAN_FR',
    -- Oceania & Turkey
    'OCEANIA_AU', 'OCEANIA_NZ', 'TURKEY', 'INDONESIA',
    -- Eurasia & Caucasus
    'EU_UKRAINE', 'EU_CAUCASUS', 'EU_ARMENIA', 'EU_GEORGIA', 'EU_BALKANS',
    -- Central Asia
    'ASIA_CENTRAL_KZ', 'ASIA_CENTRAL_UZ', 'ASIA_CENTRAL_AZ', 'ASIA_CENTRAL_TM', 'ASIA_CENTRAL_KG',
    'ASIA_CENTRAL_AM', 'ASIA_CENTRAL_GE',
    -- South Asia (NEW)
    'SA_NEPAL', 'SA_SRILANKA', 'SA_BHUTAN', 'SA_MALDIVES',
    -- Pakistan & Bangladesh
    'PAKISTAN', 'BANGLADESH'
  ])
);
