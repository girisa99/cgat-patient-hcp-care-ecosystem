/**
 * Shared Region Hierarchy — Single Source of Truth
 * 
 * 3-level structure: Parent → Zone → Country/Language
 * Used by: GlobalRegionSelector, LandingPageScriptsPanel, useGenieCastRegions
 * 
 * This mirrors the REGION_HIERARCHY from LandingPageScriptsPanel
 * but extracted for cross-component reuse.
 */

export interface RegionChild {
  code: string;
  name: string;
  flag: string;
  children?: RegionChild[];
}

export interface RegionGroup {
  groupCode: string;
  groupName: string;
  groupFlag: string;
  children: RegionChild[];
}

export const REGION_HIERARCHY: RegionGroup[] = [
  {
    groupCode: 'NAM', groupName: 'North America', groupFlag: '🇺🇸',
    children: [
      { code: 'NAM_US', name: 'United States', flag: '🇺🇸' },
      { code: 'NAM_CA', name: 'Canada (EN + FR)', flag: '🇨🇦' },
    ],
  },
  {
    groupCode: 'EU', groupName: 'Europe', groupFlag: '🇪🇺',
    children: [
      { code: 'EU_WEST', name: 'UK & Ireland', flag: '🇬🇧' },
      { code: 'EU_DACH', name: 'DACH (Germany, Austria, Switzerland)', flag: '🇩🇪', children: [
        { code: 'EU_DE', name: 'Germany', flag: '🇩🇪' },
        { code: 'EU_AT', name: 'Austria', flag: '🇦🇹' },
        { code: 'EU_CH', name: 'Switzerland', flag: '🇨🇭' },
      ]},
      { code: 'EU_FRANCE', name: 'France & Francophone', flag: '🇫🇷', children: [
        { code: 'EU_FR', name: 'France', flag: '🇫🇷' },
        { code: 'EU_BE_FR', name: 'Belgium (French)', flag: '🇧🇪' },
      ]},
      { code: 'EU_BENELUX', name: 'Benelux & Netherlands', flag: '🇳🇱', children: [
        { code: 'EU_NL', name: 'Netherlands', flag: '🇳🇱' },
        { code: 'EU_BE_NL', name: 'Belgium (Dutch)', flag: '🇧🇪' },
      ]},
      { code: 'EU_IBERIA', name: 'Spain & Portugal', flag: '🇪🇸', children: [
        { code: 'EU_ES', name: 'Spain', flag: '🇪🇸' },
        { code: 'EU_PT', name: 'Portugal', flag: '🇵🇹' },
      ]},
      { code: 'EU_ITALY', name: 'Italy', flag: '🇮🇹', children: [
        { code: 'EU_IT', name: 'Italy (Italiano)', flag: '🇮🇹' },
      ]},
      { code: 'EU_NORDIC', name: 'Nordics', flag: '🇸🇪', children: [
        { code: 'EU_SE', name: 'Sweden', flag: '🇸🇪' },
        { code: 'EU_NO', name: 'Norway', flag: '🇳🇴' },
        { code: 'EU_DK', name: 'Denmark', flag: '🇩🇰' },
        { code: 'EU_FI', name: 'Finland', flag: '🇫🇮' },
      ]},
      { code: 'EU_EAST', name: 'Eastern Europe', flag: '🇵🇱', children: [
        { code: 'EU_PL', name: 'Poland', flag: '🇵🇱' },
        { code: 'EU_CZ', name: 'Czech Republic', flag: '🇨🇿' },
        { code: 'EU_RO', name: 'Romania', flag: '🇷🇴' },
        { code: 'EU_HU', name: 'Hungary', flag: '🇭🇺' },
        { code: 'EU_GR', name: 'Greece (Ελληνικά)', flag: '🇬🇷' },
      ]},
    ],
  },
  {
    groupCode: 'LATAM', groupName: 'Latin America', groupFlag: '🌎',
    children: [
      { code: 'LATAM_BRAZIL', name: 'Brazil (Português)', flag: '🇧🇷' },
      { code: 'LATAM_MEXICO', name: 'Mexico & Central America', flag: '🇲🇽' },
      { code: 'LATAM_ANDEAN', name: 'Andean (Colombia, Peru, Ecuador)', flag: '🇨🇴' },
      { code: 'LATAM_CONESUR', name: 'Southern Cone (Argentina, Chile, Uruguay)', flag: '🇦🇷' },
      { code: 'LATAM_CARIB', name: 'Caribbean (DR, PR, Cuba, Venezuela)', flag: '🇩🇴' },
    ],
  },
  {
    groupCode: 'MENA', groupName: 'Middle East & North Africa', groupFlag: '🌍',
    children: [
      { code: 'MENA_GULF', name: 'Gulf (UAE, Saudi, Qatar, Kuwait)', flag: '🇦🇪' },
      { code: 'MENA_EGYPT', name: 'Egypt (مصري)', flag: '🇪🇬' },
      { code: 'MENA_LEVANT', name: 'Levant (Lebanon, Jordan, Iraq)', flag: '🇱🇧' },
      { code: 'MENA_MAGHREB', name: 'Maghreb (Morocco, Algeria, Tunisia)', flag: '🇲🇦' },
      { code: 'MENA_MSA', name: 'Pan-Arab (Modern Standard Arabic)', flag: '🕌' },
      { code: 'MENA_ISRAEL', name: 'Israel (עברית)', flag: '🇮🇱' },
    ],
  },
  {
    groupCode: 'AFRICA', groupName: 'Africa', groupFlag: '🌍',
    children: [
      { code: 'AFRICA_WEST', name: 'West Africa (Nigeria, Ghana)', flag: '🇳🇬' },
      { code: 'AFRICA_EAST', name: 'East Africa (Kenya, Tanzania)', flag: '🇰🇪' },
      { code: 'AFRICA_SOUTH', name: 'Southern Africa (South Africa)', flag: '🇿🇦' },
      { code: 'AFRICA_FRANCO', name: 'Francophone Africa (Senegal, DRC)', flag: '🇸🇳' },
    ],
  },
  { groupCode: 'PAKISTAN', groupName: 'Pakistan (Urdu)', groupFlag: '🇵🇰', children: [] },
  { groupCode: 'BANGLADESH', groupName: 'Bangladesh (Bengali)', groupFlag: '🇧🇩', children: [] },
  {
    groupCode: 'SOUTH_ASIA', groupName: 'South Asia', groupFlag: '🌏',
    children: [
      { code: 'SA_NEPAL', name: 'Nepal (नेपाली)', flag: '🇳🇵' },
      { code: 'SA_SRILANKA', name: 'Sri Lanka (සිංහල / தமிழ்)', flag: '🇱🇰' },
      { code: 'SA_BHUTAN', name: 'Bhutan (རྫོང་ཁ)', flag: '🇧🇹' },
      { code: 'SA_MALDIVES', name: 'Maldives (ދިވެހި)', flag: '🇲🇻' },
    ],
  },
  {
    groupCode: 'INDIA', groupName: 'India', groupFlag: '🇮🇳',
    children: [
      { code: 'INDIA_NORTH', name: 'North India (Hindi Belt)', flag: '🇮🇳', children: [
        { code: 'INDIA_NORTH_HI', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
        { code: 'INDIA_NORTH_UR', name: 'Urdu (اردو)', flag: '🇮🇳' },
        { code: 'INDIA_NORTH_PA', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
      ]},
      { code: 'INDIA_SOUTH', name: 'South India (Dravidian)', flag: '🇮🇳', children: [
        { code: 'INDIA_SOUTH_TA', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
        { code: 'INDIA_SOUTH_TE', name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
        { code: 'INDIA_SOUTH_KN', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
        { code: 'INDIA_SOUTH_ML', name: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
      ]},
      { code: 'INDIA_WEST', name: 'West India (Maharashtra, Gujarat)', flag: '🇮🇳', children: [
        { code: 'INDIA_WEST_MR', name: 'Marathi (मराठी)', flag: '🇮🇳' },
        { code: 'INDIA_WEST_GU', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
      ]},
      { code: 'INDIA_EAST', name: 'East India (Bengal, Odisha)', flag: '🇮🇳', children: [
        { code: 'INDIA_EAST_BN', name: 'Bengali (বাংলা)', flag: '🇮🇳' },
        { code: 'INDIA_EAST_OR', name: 'Odia (ଓଡ଼ିଆ)', flag: '🇮🇳' },
      ]},
      { code: 'INDIA_PAN', name: 'Pan-India (English)', flag: '🇮🇳', children: [
        { code: 'INDIA_PAN_EN', name: 'Indian English', flag: '🇮🇳' },
      ]},
    ],
  },
  {
    groupCode: 'SEA', groupName: 'Southeast Asia', groupFlag: '🌏',
    children: [
      { code: 'SEA_MALAY', name: 'Malaysia & Indonesia (Malay)', flag: '🇲🇾' },
      { code: 'SEA_THAI', name: 'Thailand (ไทย)', flag: '🇹🇭' },
      { code: 'SEA_VIET', name: 'Vietnam (Tiếng Việt)', flag: '🇻🇳' },
      { code: 'SEA_PHIL', name: 'Philippines (Filipino/Taglish)', flag: '🇵🇭' },
      { code: 'SEA_PAN', name: 'Pan-SEA / Singapore (English)', flag: '🇸🇬' },
    ],
  },
  {
    groupCode: 'CJK', groupName: 'China, Japan & Korea', groupFlag: '🌏',
    children: [
      { code: 'CJK_CN', name: 'China / HK / Macau (普通话/粵語)', flag: '🇨🇳' },
      { code: 'CJK_TW', name: 'Taiwan (繁體中文)', flag: '🇹🇼' },
      { code: 'CJK_JP', name: 'Japan (日本語)', flag: '🇯🇵' },
      { code: 'CJK_KR', name: 'South Korea (한국어)', flag: '🇰🇷' },
    ],
  },
  {
    groupCode: 'OCEANIA', groupName: 'Oceania', groupFlag: '🌏',
    children: [
      { code: 'OCEANIA_AU', name: 'Australia', flag: '🇦🇺' },
      { code: 'OCEANIA_NZ', name: 'New Zealand', flag: '🇳🇿' },
    ],
  },
  { groupCode: 'TURKEY', groupName: 'Turkey (Türkçe)', groupFlag: '🇹🇷', children: [] },
  {
    groupCode: 'CARIBBEAN', groupName: 'Caribbean', groupFlag: '🌴',
    children: [
      { code: 'CARIBBEAN_EN', name: 'English Caribbean (Jamaica, T&T, Bahamas)', flag: '🇯🇲' },
      { code: 'CARIBBEAN_FR', name: 'French Caribbean (Haiti, Martinique)', flag: '🇭🇹' },
    ],
  },
  {
    groupCode: 'EURASIA', groupName: 'Eastern Europe & Caucasus', groupFlag: '🌍',
    children: [
      { code: 'EU_UKRAINE', name: 'Ukraine (Українська)', flag: '🇺🇦' },
      { code: 'EU_BALKANS', name: 'Balkans (Serbia, Bulgaria, Croatia)', flag: '🇷🇸' },
      { code: 'EU_CAUCASUS', name: 'Caucasus (Georgia, Armenia)', flag: '🇬🇪' },
    ],
  },
  {
    groupCode: 'CENTRAL_ASIA', groupName: 'Central Asia', groupFlag: '🌏',
    children: [
      { code: 'ASIA_CENTRAL_KZ', name: 'Kazakhstan (Қазақ)', flag: '🇰🇿' },
      { code: 'ASIA_CENTRAL_UZ', name: 'Uzbekistan (Oʻzbek)', flag: '🇺🇿' },
      { code: 'ASIA_CENTRAL_AZ', name: 'Azerbaijan (Azərbaycan)', flag: '🇦🇿' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

/** Get all leaf codes for a group (includes parent lowercase + child codes + grandchild codes) */
export function getGroupAllCodes(group: RegionGroup): string[] {
  const parentLower = group.groupCode.toLowerCase();
  if (group.children.length === 0) {
    return [group.groupCode, parentLower];
  }
  const childCodes = group.children.flatMap(c =>
    c.children && c.children.length > 0
      ? [c.code, ...c.children.map(gc => gc.code)]
      : [c.code]
  );
  return [group.groupCode, parentLower, ...childCodes];
}

/** Get total leaf/selectable node count for a group */
export function getGroupLeafCount(group: RegionGroup): number {
  if (group.children.length === 0) return 1; // single-node region
  return group.children.reduce((sum, c) => {
    if (c.children && c.children.length > 0) return sum + c.children.length;
    return sum + 1;
  }, 0);
}

/** Count how many leaves are selected in a group */
export function getGroupSelectedCount(group: RegionGroup, selectedCodes: string[]): number {
  if (group.children.length === 0) {
    return selectedCodes.includes(group.groupCode) || selectedCodes.includes(group.groupCode.toLowerCase()) ? 1 : 0;
  }
  return group.children.reduce((sum, c) => {
    if (c.children && c.children.length > 0) {
      return sum + c.children.filter(gc => selectedCodes.includes(gc.code)).length;
    }
    return sum + (selectedCodes.includes(c.code) ? 1 : 0);
  }, 0);
}

/** Flatten all selectable codes */
export function getAllSelectableCodes(): string[] {
  return REGION_HIERARCHY.flatMap(g => getGroupAllCodes(g));
}

/** Get total leaf count across all groups */
export function getTotalLeafCount(): number {
  return REGION_HIERARCHY.reduce((sum, g) => sum + getGroupLeafCount(g), 0);
}
