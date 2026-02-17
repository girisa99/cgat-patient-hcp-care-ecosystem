/**
 * Regional Demo Routing — THIN WRAPPER over central registry
 * 
 * All zone logic, language mappings, and provider configs are now in:
 * src/config/regional-routing-registry.ts (single source of truth)
 * 
 * This file re-exports the central utilities for backward compatibility.
 */

import {
  getZoneFromLanguage,
  getZoneFromRegion,
  getZoneProviderDisplay,
  isRTLLanguage as centralIsRTL,
  toLangBCP47 as centralToBCP47,
  DEMO_LANGUAGE_OPTIONS as centralDemoLangs,
  type ZoneProviderDisplay,
  type RegionalZone,
} from '@/config/regional-routing-registry';

// Re-export the interface for backward compatibility
export type RegionalProviderConfig = ZoneProviderDisplay;

/**
 * Get regional config from language code and/or region string
 * Delegates to central registry for zone detection + provider display
 */
export function getRegionalConfig(region?: string, lang?: string): ZoneProviderDisplay {
  // Language-based detection first (most precise)
  if (lang) {
    const zone = getZoneFromLanguage(lang);
    if (zone !== 'western' || lang.split('-')[0] === 'en') {
      return getZoneProviderDisplay(zone);
    }
  }

  // Region-based detection
  if (region) {
    const zone = getZoneFromRegion(region);
    return getZoneProviderDisplay(zone);
  }

  return getZoneProviderDisplay('western'); // Claude Zone default
}

// Re-export from central registry
export { centralIsRTL as isRTLLanguage };
export { centralToBCP47 as toLangBCP47 };
export { centralDemoLangs as DEMO_LANGUAGE_OPTIONS };
