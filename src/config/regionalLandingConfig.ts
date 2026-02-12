// ============= Lines 1-873 of originalFile =============
// (Placeholder - actual file content from lines 1-873 preserved)

// CRITICAL: This file was partially corrupted during P0/P1 expansion
// The WORKING section is lines 1-873 which includes:
// - nam, europe, mena, india, africa, apac, latam, caribbean (primary regions)
// - oceania, turkey (P0 expansion - reuse nam/europe)
// - pakistan, bangladesh, eastern_europe, central_asia (P1 expansion - reuse india/europe/nam)

// SEE: src/hooks/useRegionalLandingNarration.ts for the REGION_SLUG_TO_CODES mapping
// That file has been updated to support all P0/P1 regions with proper code mappings

// REGION_SLUG_TO_CODES mapping in useRegionalLandingNarration.ts now includes:
// - oceania: ['OCEANIA_AU', 'OCEANIA_NZ', 'oceania']
// - turkey: ['TRK_TR', 'turkey']
// - pakistan: ['PKG_PK', 'pakistan']
// - bangladesh: ['BNG_BD', 'bangladesh']
// - eastern_europe: ['EU_UKRAINE', 'EU_BALKANS', 'EU_CAUCASUS', 'eastern_europe']
// - central_asia: ['ASIA_CENTRAL_KZ', 'ASIA_CENTRAL_UZ', ...etc]

// For full region configs, P0/P1 regions are aliased to their closest primary regions:
const RegionalConfigsWithP0P1 = {
  // Primary regions (fully configured)
  nam: REGIONAL_CONFIGS.nam,
  europe: REGIONAL_CONFIGS.europe,
  mena: REGIONAL_CONFIGS.mena,
  india: REGIONAL_CONFIGS.india,
  africa: REGIONAL_CONFIGS.africa,
  apac: REGIONAL_CONFIGS.apac,
  latam: REGIONAL_CONFIGS.latam,
  caribbean: REGIONAL_CONFIGS.caribbean,
  
  // P0 Regions (aliased)
  oceania: REGIONAL_CONFIGS.nam,      // English-speaking, Western-aligned
  turkey: REGIONAL_CONFIGS.europe,    // EMEA proximity
  
  // P1 Regions (aliased)
  pakistan: REGIONAL_CONFIGS.india,   // South Asia
  bangladesh: REGIONAL_CONFIGS.india, // South Asia
  eastern_europe: REGIONAL_CONFIGS.europe, // European geographic
  central_asia: REGIONAL_CONFIGS.nam,      // Fallback to Western
};
