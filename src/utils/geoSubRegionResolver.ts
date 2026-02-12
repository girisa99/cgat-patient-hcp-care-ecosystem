/**
 * GEO SUB-REGION RESOLVER
 * 
 * Maps ISO country codes + browser timezone to precise sub-region codes
 * for narration resolution. Uses the regional hierarchy from the routing registry.
 * 
 * Resolution: Country Code → Sub-Region Code (with timezone refinement for large countries)
 * VPN Protection: Cross-validates IP country against browser timezone + language
 */

import type { RegionSlug } from '@/config/regionalLandingConfig';

// ── Country → Sub-Region Code Mapping ──
// Direct 1:1 mapping for most countries; large countries use timezone refinement
const COUNTRY_TO_SUBREGION: Record<string, string> = {
  // NAM
  US: 'NAM_US', CA: 'NAM_CA',

  // MENA
  AE: 'MENA_GULF', SA: 'MENA_GULF', QA: 'MENA_GULF', KW: 'MENA_GULF', BH: 'MENA_GULF', OM: 'MENA_GULF',
  EG: 'MENA_EGYPT',
  JO: 'MENA_LEVANT', LB: 'MENA_LEVANT', IQ: 'MENA_LEVANT', PS: 'MENA_LEVANT', SY: 'MENA_LEVANT',
  MA: 'MENA_MAGHREB', DZ: 'MENA_MAGHREB', TN: 'MENA_MAGHREB', LY: 'MENA_MAGHREB',
  YE: 'MENA_MSA',

  // India (timezone refinement in resolveIndiaSubRegion)
  IN: 'INDIA_PAN', // Default; refined by timezone/IP city

  // Pakistan & Bangladesh
  PK: 'PKG_PK', BD: 'BNG_BD',

  // Africa
  NG: 'AFRICA_WEST', GH: 'AFRICA_WEST', SN: 'AFRICA_WEST', CI: 'AFRICA_WEST', ML: 'AFRICA_WEST',
  BF: 'AFRICA_WEST', NE: 'AFRICA_WEST', GM: 'AFRICA_WEST', GN: 'AFRICA_WEST', SL: 'AFRICA_WEST',
  LR: 'AFRICA_WEST', TG: 'AFRICA_WEST', BJ: 'AFRICA_WEST',
  KE: 'AFRICA_EAST', TZ: 'AFRICA_EAST', UG: 'AFRICA_EAST', ET: 'AFRICA_EAST', RW: 'AFRICA_EAST',
  SO: 'AFRICA_EAST', DJ: 'AFRICA_EAST', ER: 'AFRICA_EAST', SS: 'AFRICA_EAST',
  ZA: 'AFRICA_SOUTH', BW: 'AFRICA_SOUTH', NA: 'AFRICA_SOUTH', LS: 'AFRICA_SOUTH',
  SZ: 'AFRICA_SOUTH', MU: 'AFRICA_SOUTH', ZW: 'AFRICA_SOUTH', ZM: 'AFRICA_SOUTH', MW: 'AFRICA_SOUTH', MZ: 'AFRICA_SOUTH',
  CM: 'AFRICA_FRANCO', CD: 'AFRICA_FRANCO', CG: 'AFRICA_FRANCO', GA: 'AFRICA_FRANCO',
  GQ: 'AFRICA_FRANCO', MG: 'AFRICA_FRANCO', TD: 'AFRICA_FRANCO',

  // CJK
  CN: 'CJK_CN', HK: 'CJK_CN', MO: 'CJK_CN',
  TW: 'CJK_TW',
  JP: 'CJK_JP',
  KR: 'CJK_KR',

  // SEA
  MY: 'SEA_MALAY', SG: 'SEA_MALAY', BN: 'SEA_MALAY',
  TH: 'SEA_THAI',
  VN: 'SEA_VIET',
  PH: 'SEA_PHIL',
  ID: 'SEA_MALAY', // Indonesian (Malay family)
  MM: 'SEA_PAN', KH: 'SEA_PAN', LA: 'SEA_PAN',

  // LATAM
  BR: 'LATAM_BRAZIL',
  MX: 'LATAM_MEXICO',
  PE: 'LATAM_ANDEAN', CO: 'LATAM_ANDEAN', EC: 'LATAM_ANDEAN', BO: 'LATAM_ANDEAN',
  AR: 'LATAM_CONESUR', CL: 'LATAM_CONESUR', UY: 'LATAM_CONESUR', PY: 'LATAM_CONESUR',
  VE: 'LATAM_CARIB', CR: 'LATAM_MEXICO', PA: 'LATAM_MEXICO',
  GT: 'LATAM_MEXICO', HN: 'LATAM_MEXICO', SV: 'LATAM_MEXICO', NI: 'LATAM_MEXICO',

  // Caribbean
  JM: 'LATAM_CARIB', TT: 'LATAM_CARIB', BB: 'LATAM_CARIB', BS: 'LATAM_CARIB',
  HT: 'LATAM_CARIB', DO: 'LATAM_CARIB', PR: 'LATAM_CARIB',

  // Europe (sub-regions)
  GB: 'EU_WEST', IE: 'EU_WEST',
  DE: 'EU_DACH', AT: 'EU_DACH', CH: 'EU_DACH',
  FR: 'EU_WEST', BE: 'EU_WEST', NL: 'EU_WEST',
  SE: 'EU_NORDIC', NO: 'EU_NORDIC', DK: 'EU_NORDIC', FI: 'EU_NORDIC', IS: 'EU_NORDIC',
  PL: 'EU_EAST', CZ: 'EU_EAST', SK: 'EU_EAST', RO: 'EU_EAST', HU: 'EU_EAST', BG: 'EU_EAST',
  ES: 'EU_SOUTH', IT: 'EU_SOUTH', PT: 'EU_SOUTH', GR: 'EU_SOUTH',

  // P0: Oceania & Turkey
  AU: 'OCEANIA_AU', NZ: 'OCEANIA_NZ',
  TR: 'TRK_TR',

  // P1: Eastern Europe
  UA: 'EU_UKRAINE',
  RS: 'EU_BALKANS', BA: 'EU_BALKANS', ME: 'EU_BALKANS', MK: 'EU_BALKANS', AL: 'EU_BALKANS', HR: 'EU_BALKANS',

  // P1: Caucasus & Central Asia
  GE: 'ASIA_CENTRAL_GE', AM: 'ASIA_CENTRAL_AM', AZ: 'ASIA_CENTRAL_AZ',
  KZ: 'ASIA_CENTRAL_KZ', UZ: 'ASIA_CENTRAL_UZ', TM: 'ASIA_CENTRAL_KZ',
  KG: 'ASIA_CENTRAL_KZ', TJ: 'ASIA_CENTRAL_UZ',
};

// ── Country → Parent Region Slug mapping ──
const COUNTRY_TO_PARENT_SLUG: Record<string, RegionSlug> = {
  US: 'nam', CA: 'nam',
  AE: 'mena', SA: 'mena', QA: 'mena', KW: 'mena', BH: 'mena', OM: 'mena',
  EG: 'mena', JO: 'mena', LB: 'mena', IQ: 'mena', PS: 'mena', SY: 'mena',
  MA: 'mena', DZ: 'mena', TN: 'mena', LY: 'mena', YE: 'mena',
  IN: 'india', LK: 'india', NP: 'india',
  PK: 'pakistan', BD: 'bangladesh',
  NG: 'africa', GH: 'africa', KE: 'africa', ZA: 'africa', TZ: 'africa', UG: 'africa',
  ET: 'africa', RW: 'africa', SN: 'africa', CM: 'africa', CI: 'africa',
  CN: 'apac', HK: 'apac', TW: 'apac', JP: 'apac', KR: 'apac',
  ID: 'apac', TH: 'apac', VN: 'apac', MY: 'apac', SG: 'apac', PH: 'apac',
  BR: 'latam', MX: 'latam', AR: 'latam', CO: 'latam', CL: 'latam', PE: 'latam',
  GB: 'europe', DE: 'europe', FR: 'europe', IT: 'europe', ES: 'europe',
  NL: 'europe', SE: 'europe', NO: 'europe', DK: 'europe', FI: 'europe',
  PL: 'europe', CZ: 'europe', RO: 'europe', HU: 'europe', AT: 'europe', CH: 'europe',
  AU: 'oceania', NZ: 'oceania',
  TR: 'turkey',
  UA: 'eastern_europe', RS: 'eastern_europe', BA: 'eastern_europe',
  GE: 'central_asia', AM: 'central_asia', AZ: 'central_asia',
  KZ: 'central_asia', UZ: 'central_asia',
  JM: 'caribbean', TT: 'caribbean', BS: 'caribbean', HT: 'caribbean',
};

// ── Timezone → Country validation mapping ──
// Used to cross-check IP country against browser timezone for VPN detection
const TIMEZONE_COUNTRY_MAP: Record<string, string[]> = {
  // India (single timezone)
  'Asia/Kolkata': ['IN'],
  'Asia/Calcutta': ['IN'],
  // Pakistan
  'Asia/Karachi': ['PK'],
  // Bangladesh
  'Asia/Dhaka': ['BD'],
  // UAE / Gulf
  'Asia/Dubai': ['AE', 'OM'],
  'Asia/Muscat': ['OM'],
  'Asia/Qatar': ['QA'],
  'Asia/Riyadh': ['SA', 'KW', 'BH', 'YE'],
  // Egypt
  'Africa/Cairo': ['EG'],
  // Turkey
  'Europe/Istanbul': ['TR'],
  // CJK
  'Asia/Shanghai': ['CN', 'HK', 'MO'],
  'Asia/Hong_Kong': ['HK', 'CN'],
  'Asia/Tokyo': ['JP'],
  'Asia/Seoul': ['KR'],
  'Asia/Taipei': ['TW'],
  // SEA
  'Asia/Bangkok': ['TH', 'KH', 'LA', 'VN'],
  'Asia/Ho_Chi_Minh': ['VN'],
  'Asia/Jakarta': ['ID'],
  'Asia/Singapore': ['SG', 'MY'],
  'Asia/Kuala_Lumpur': ['MY'],
  'Asia/Manila': ['PH'],
  // Oceania
  'Australia/Sydney': ['AU'],
  'Australia/Melbourne': ['AU'],
  'Pacific/Auckland': ['NZ'],
  // US
  'America/New_York': ['US'],
  'America/Chicago': ['US'],
  'America/Denver': ['US'],
  'America/Los_Angeles': ['US'],
  // Europe
  'Europe/London': ['GB', 'IE'],
  'Europe/Berlin': ['DE', 'AT', 'CH'],
  'Europe/Paris': ['FR', 'BE'],
  'Europe/Madrid': ['ES'],
  'Europe/Rome': ['IT'],
  'Europe/Stockholm': ['SE'],
  'Europe/Oslo': ['NO'],
  'Europe/Copenhagen': ['DK'],
  'Europe/Helsinki': ['FI'],
  'Europe/Warsaw': ['PL'],
  'Europe/Bucharest': ['RO'],
  'Europe/Budapest': ['HU'],
  // Caucasus / Central Asia
  'Asia/Tbilisi': ['GE'],
  'Asia/Yerevan': ['AM'],
  'Asia/Baku': ['AZ'],
  'Asia/Almaty': ['KZ'],
  'Asia/Tashkent': ['UZ'],
  // Eastern Europe
  'Europe/Kiev': ['UA'],
  'Europe/Kyiv': ['UA'],
  'Europe/Belgrade': ['RS', 'BA', 'ME', 'MK'],
  // LATAM
  'America/Sao_Paulo': ['BR'],
  'America/Mexico_City': ['MX'],
  'America/Argentina/Buenos_Aires': ['AR'],
  'America/Bogota': ['CO'],
  'America/Lima': ['PE'],
  'America/Santiago': ['CL'],
};

// ── Sanctioned country codes (must match geo-compliance-check) ──
const SANCTIONED_COUNTRIES = ['RU', 'BY', 'IR', 'KP', 'SY', 'CU'];

// ── Sanctioned timezones for VPN cross-validation ──
const SANCTIONED_TIMEZONES: string[] = [
  'Europe/Moscow', 'Europe/Kaliningrad', 'Europe/Samara', 'Asia/Yekaterinburg',
  'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk',
  'Asia/Yakutsk', 'Asia/Vladivostok', 'Asia/Magadan', 'Asia/Kamchatka',
  'Europe/Minsk', 'Asia/Tehran', 'Asia/Pyongyang', 'Asia/Damascus', 'America/Havana',
];

// ── Sanctioned browser languages ──
const SANCTIONED_LANGUAGES = ['ru', 'be', 'fa', 'ko-KP', 'ar-SY', 'es-CU'];

export interface GeoSubRegionResult {
  /** Resolved sub-region code (e.g., MENA_GULF, INDIA_SOUTH) */
  subRegionCode: string | null;
  /** Parent region slug for landing page routing */
  parentRegionSlug: RegionSlug | null;
  /** ISO country code from IP detection */
  countryCode: string | null;
  /** Country name */
  countryName: string | null;
  /** Whether VPN/bypass was detected */
  vpnDetected: boolean;
  /** Specific bypass reasons */
  bypassReasons: string[];
  /** Risk score (0-100) */
  riskScore: number;
  /** Whether we should fall back to parent region default due to suspicion */
  shouldFallbackToParent: boolean;
  /** Browser timezone */
  browserTimezone: string;
  /** Browser primary language */
  browserLanguage: string;
}

/**
 * Resolve sub-region from IP country code
 */
export function resolveSubRegion(countryCode: string): string | null {
  return COUNTRY_TO_SUBREGION[countryCode?.toUpperCase()] || null;
}

/**
 * Resolve parent region slug from country code
 */
export function resolveParentSlug(countryCode: string): RegionSlug | null {
  return COUNTRY_TO_PARENT_SLUG[countryCode?.toUpperCase()] || null;
}

/**
 * Validate IP country against browser signals for VPN/bypass detection
 * Returns risk assessment with reasons
 */
export function validateGeoIntegrity(
  ipCountryCode: string | null,
  browserTimezone: string,
  browserLanguages: string[]
): { vpnDetected: boolean; reasons: string[]; riskScore: number } {
  const reasons: string[] = [];
  let riskScore = 0;

  // 1. Check if browser timezone is from a sanctioned region
  if (SANCTIONED_TIMEZONES.includes(browserTimezone)) {
    if (ipCountryCode && !SANCTIONED_COUNTRIES.includes(ipCountryCode)) {
      // IP says non-sanctioned but timezone says sanctioned → VPN bypass
      reasons.push(`Browser timezone (${browserTimezone}) indicates sanctioned region, but IP shows ${ipCountryCode}`);
      riskScore += 50;
    }
  }

  // 2. Check if browser language is from a sanctioned region
  const primaryLang = browserLanguages[0]?.toLowerCase() || '';
  if (SANCTIONED_LANGUAGES.some(sl => primaryLang.startsWith(sl))) {
    if (ipCountryCode && !SANCTIONED_COUNTRIES.includes(ipCountryCode)) {
      reasons.push(`Browser language (${primaryLang}) suggests sanctioned region, but IP shows ${ipCountryCode}`);
      riskScore += 30;
    }
  }

  // 3. Cross-validate IP country vs timezone (non-sanctioned mismatch)
  if (ipCountryCode) {
    const validCountries = TIMEZONE_COUNTRY_MAP[browserTimezone];
    if (validCountries && !validCountries.includes(ipCountryCode)) {
      // Timezone doesn't match IP country — possible VPN
      reasons.push(`Timezone (${browserTimezone}) doesn't match IP country (${ipCountryCode})`);
      riskScore += 20;
    }
  }

  // 4. Check for WebRTC leak indicators
  try {
    if (!window.RTCPeerConnection) {
      reasons.push('WebRTC blocked (common VPN indicator)');
      riskScore += 15;
    }
  } catch { /* ignore */ }

  // 5. Check for automated browser
  try {
    if (navigator.webdriver) {
      reasons.push('Automated browser detected');
      riskScore += 25;
    }
  } catch { /* ignore */ }

  // 6. Rapid location changes (check localStorage history)
  try {
    const historyStr = localStorage.getItem('geo_location_history');
    if (historyStr && ipCountryCode) {
      const history = JSON.parse(historyStr) as Array<{ countryCode: string; timestamp: number }>;
      const oneHourAgo = Date.now() - 3600000;
      const recent = history.filter(e => e.timestamp > oneHourAgo);
      const uniqueCountries = new Set([...recent.map(e => e.countryCode), ipCountryCode]);
      if (uniqueCountries.size > 2) {
        reasons.push(`Rapid location changes: ${uniqueCountries.size} countries in 1 hour`);
        riskScore += 35;
      }
    }
  } catch { /* ignore */ }

  return {
    vpnDetected: riskScore >= 40,
    reasons,
    riskScore: Math.min(riskScore, 100),
  };
}

/**
 * Full geo sub-region resolution with VPN protection
 * Call with the IP country data from geo-detect edge function
 */
export function resolveGeoNarration(
  ipCountryCode: string | null,
  ipCountryName: string | null
): GeoSubRegionResult {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const browserLanguages = navigator.languages ? [...navigator.languages] : [navigator.language];
  const browserLanguage = browserLanguages[0] || 'en';

  // Resolve sub-region and parent slug from IP country
  const subRegionCode = ipCountryCode ? resolveSubRegion(ipCountryCode) : null;
  const parentRegionSlug = ipCountryCode ? resolveParentSlug(ipCountryCode) : null;

  // Validate geo integrity (VPN/bypass detection)
  const { vpnDetected, reasons, riskScore } = validateGeoIntegrity(
    ipCountryCode,
    browserTimezone,
    browserLanguages
  );

  // If high risk (≥60), fall back to parent region default instead of sub-region
  const shouldFallbackToParent = riskScore >= 60;

  // Log for analytics
  if (vpnDetected) {
    console.warn('[GeoResolver] VPN/bypass detected:', {
      ipCountry: ipCountryCode,
      timezone: browserTimezone,
      language: browserLanguage,
      riskScore,
      reasons,
    });
  }

  return {
    subRegionCode: shouldFallbackToParent ? null : subRegionCode,
    parentRegionSlug,
    countryCode: ipCountryCode,
    countryName: ipCountryName,
    vpnDetected,
    bypassReasons: reasons,
    riskScore,
    shouldFallbackToParent,
    browserTimezone,
    browserLanguage,
  };
}
