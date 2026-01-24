/**
 * Arabic & MENA Localization Registry
 * 
 * Comprehensive localization requirements for Arabic-speaking markets:
 * - RTL layout considerations
 * - Regional dialect mapping for voice TTS
 * - Cultural considerations
 * - Font and text expansion handling
 * - Date/number format preferences
 * 
 * Why Arabic Localization is Critical:
 * - 70% of MENA population uses Arabic interface preference
 * - Only 3% of online content available in Arabic
 * - Arabic-localized SaaS products see 40-60% higher adoption in MENA
 * - CRM market in MENA: 27.83% of cloud applications (growing)
 */

// =============================================================================
// TYPES
// =============================================================================

export type ArabicDialect = 
  | 'msa'      // Modern Standard Arabic
  | 'gulf'     // Gulf/Khaleeji (SA, UAE, Kuwait, Qatar, Bahrain, Oman)
  | 'egyptian' // Egyptian/Masri
  | 'levantine'// Levantine/Shami (Jordan, Lebanon, Palestine, Syria)
  | 'maghrebi' // Maghrebi/Darija (Morocco, Algeria, Tunisia, Libya)
  | 'iraqi';   // Mesopotamian Arabic

export type MenaCountryCode = 
  | 'SA' | 'AE' | 'QA' | 'KW' | 'BH' | 'OM' // Gulf
  | 'EG' // Egypt
  | 'JO' | 'LB' | 'PS' | 'SY' // Levant
  | 'MA' | 'DZ' | 'TN' | 'LY' // Maghreb
  | 'IQ' // Iraq
  | 'YE' | 'SD'; // Other

export type NumeralSystem = 'western' | 'eastern';
export type CalendarSystem = 'gregorian' | 'hijri' | 'both';
export type WeekendDays = 'fri-sat' | 'sat-sun';

export interface ArabicLanguageRequirement {
  element: string;
  requirement: string;
  implementation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface DialectMapping {
  dialect: ArabicDialect;
  dialectName: string;
  dialectNameArabic: string;
  countries: MenaCountryCode[];
  notes: string;
  businessPriority: 'highest' | 'high' | 'medium' | 'low';
  voiceProviders: {
    primary: string;
    fallback: string;
  };
  voiceIds?: {
    male?: string;
    female?: string;
  };
}

export interface CulturalConsideration {
  area: string;
  requirement: string;
  notes: string;
  severity: 'mandatory' | 'recommended' | 'optional';
}

export interface CountryLocalizationConfig {
  countryCode: MenaCountryCode;
  countryName: string;
  countryNameArabic: string;
  dialect: ArabicDialect;
  numeralSystem: NumeralSystem;
  calendarPreference: CalendarSystem;
  weekendDays: WeekendDays;
  currencyCode: string;
  currencySymbol: string;
  currencyNameArabic: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  businessFormality: 'formal' | 'semi-formal';
  genderSensitivity: 'high' | 'medium' | 'low';
}

export interface ArabicFontConfig {
  fontFamily: string;
  googleFontsUrl?: string;
  cssClass: string;
  direction: 'rtl';
  recommended: boolean;
  notes: string;
}

// =============================================================================
// ARABIC LANGUAGE REQUIREMENTS
// =============================================================================

export const ARABIC_LANGUAGE_REQUIREMENTS: ArabicLanguageRequirement[] = [
  {
    element: 'UI Direction',
    requirement: 'RTL (right-to-left) layout',
    implementation: 'CSS direction: rtl; complete UI flip with Tailwind rtl: variants',
    priority: 'critical'
  },
  {
    element: 'Text Content',
    requirement: 'Modern Standard Arabic (MSA)',
    implementation: 'Use MSA for written content, understood everywhere across MENA',
    priority: 'critical'
  },
  {
    element: 'Voice TTS',
    requirement: 'Regional dialects for authenticity',
    implementation: 'Route to dialect-specific voices: Gulf for business, Egyptian for media content',
    priority: 'high'
  },
  {
    element: 'Text Expansion',
    requirement: 'Arabic takes 25% more space than English',
    implementation: 'Use flexible containers, test with Arabic text, allow dynamic resizing',
    priority: 'high'
  },
  {
    element: 'Fonts',
    requirement: 'Arabic-compatible typography',
    implementation: 'Use Noto Sans Arabic, Cairo, or Tajawal for web; include fallback fonts',
    priority: 'critical'
  },
  {
    element: 'Date Format',
    requirement: 'Hijri calendar option',
    implementation: 'Include Hijri alongside Gregorian, default based on user preference',
    priority: 'medium'
  },
  {
    element: 'Numbers',
    requirement: 'Eastern Arabic numerals option',
    implementation: 'Support ٠١٢٣٤٥٦٧٨٩ alongside 0123456789, user preference toggle',
    priority: 'medium'
  },
  {
    element: 'Currency',
    requirement: 'Local currency formatting',
    implementation: 'SAR, AED, EGP with proper symbol placement (often after amount)',
    priority: 'high'
  },
  {
    element: 'Icons',
    requirement: 'Mirror directional icons',
    implementation: 'Flip arrows, chevrons, progress indicators for RTL context',
    priority: 'high'
  },
  {
    element: 'Forms',
    requirement: 'RTL form inputs',
    implementation: 'Text inputs, dropdowns, and validation messages must be RTL-aligned',
    priority: 'critical'
  }
];

// =============================================================================
// REGIONAL DIALECT MAPPING
// =============================================================================

export const DIALECT_MAPPINGS: DialectMapping[] = [
  {
    dialect: 'msa',
    dialectName: 'Modern Standard Arabic',
    dialectNameArabic: 'اللغة العربية الفصحى',
    countries: ['SA', 'AE', 'EG', 'JO', 'LB', 'MA', 'DZ', 'IQ', 'QA', 'KW', 'BH', 'OM'],
    notes: 'Universal written form, used in formal contexts, news, and official documents',
    businessPriority: 'highest',
    voiceProviders: {
      primary: 'azure',
      fallback: 'google'
    }
  },
  {
    dialect: 'gulf',
    dialectName: 'Gulf Arabic (Khaleeji)',
    dialectNameArabic: 'العربية الخليجية',
    countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
    notes: 'Most important for business in GCC countries. Preferred for corporate and government content.',
    businessPriority: 'highest',
    voiceProviders: {
      primary: 'azure',
      fallback: 'elevenlabs'
    },
    voiceIds: {
      male: 'ar-SA-HamedNeural',
      female: 'ar-SA-ZariyahNeural'
    }
  },
  {
    dialect: 'egyptian',
    dialectName: 'Egyptian Arabic (Masri)',
    dialectNameArabic: 'العربية المصرية',
    countries: ['EG'],
    notes: 'Most widely understood dialect across Arab world due to Egyptian media influence',
    businessPriority: 'high',
    voiceProviders: {
      primary: 'azure',
      fallback: 'google'
    },
    voiceIds: {
      male: 'ar-EG-ShakirNeural',
      female: 'ar-EG-SalmaNeural'
    }
  },
  {
    dialect: 'levantine',
    dialectName: 'Levantine Arabic (Shami)',
    dialectNameArabic: 'العربية الشامية',
    countries: ['JO', 'LB', 'PS', 'SY'],
    notes: 'Distinct from Gulf Arabic. Used in Jordan, Lebanon, Palestine, Syria.',
    businessPriority: 'medium',
    voiceProviders: {
      primary: 'azure',
      fallback: 'google'
    },
    voiceIds: {
      male: 'ar-JO-TaimNeural',
      female: 'ar-JO-SanaNeural'
    }
  },
  {
    dialect: 'maghrebi',
    dialectName: 'Maghrebi Arabic (Darija)',
    dialectNameArabic: 'الدارجة المغربية',
    countries: ['MA', 'DZ', 'TN', 'LY'],
    notes: 'Very different from Eastern Arabic. May need separate localization for Morocco/Algeria.',
    businessPriority: 'medium',
    voiceProviders: {
      primary: 'azure',
      fallback: 'google'
    },
    voiceIds: {
      male: 'ar-MA-JamalNeural',
      female: 'ar-MA-MounaNeural'
    }
  },
  {
    dialect: 'iraqi',
    dialectName: 'Mesopotamian Arabic',
    dialectNameArabic: 'العراقية',
    countries: ['IQ'],
    notes: 'Similar to Gulf but with distinct vocabulary and pronunciation',
    businessPriority: 'medium',
    voiceProviders: {
      primary: 'azure',
      fallback: 'google'
    },
    voiceIds: {
      male: 'ar-IQ-BasselNeural',
      female: 'ar-IQ-RanaNeural'
    }
  }
];

// =============================================================================
// CULTURAL CONSIDERATIONS
// =============================================================================

export const CULTURAL_CONSIDERATIONS: CulturalConsideration[] = [
  {
    area: 'Imagery',
    requirement: 'Modest dress in stock photos',
    notes: 'Avoid revealing clothing. Use conservative business attire. Consider local dress codes.',
    severity: 'mandatory'
  },
  {
    area: 'Colors',
    requirement: 'Green is positive (Islamic significance)',
    notes: 'Use green for positive actions/success. Red can mean danger or stop. Gold suggests premium.',
    severity: 'recommended'
  },
  {
    area: 'Content',
    requirement: 'No profanity or religious insensitivity',
    notes: 'Review all AI-generated outputs. Avoid references to alcohol, pork, or religious criticism.',
    severity: 'mandatory'
  },
  {
    area: 'Gender',
    requirement: 'Gender-appropriate options',
    notes: 'Allow male/female avatar selection. Some audiences prefer same-gender presenters.',
    severity: 'recommended'
  },
  {
    area: 'Time',
    requirement: 'Prayer time awareness',
    notes: 'Consider 5 daily prayer times in scheduling. Avoid scheduling during Jummah (Friday noon).',
    severity: 'recommended'
  },
  {
    area: 'Weekend',
    requirement: 'Friday-Saturday weekend',
    notes: 'Most MENA countries observe Fri-Sat weekend, different from Western Sat-Sun.',
    severity: 'mandatory'
  },
  {
    area: 'Ramadan',
    requirement: 'Ramadan awareness',
    notes: 'Reduced business hours during Ramadan. Avoid food imagery during fasting hours.',
    severity: 'recommended'
  },
  {
    area: 'Titles',
    requirement: 'Proper honorifics',
    notes: 'Use appropriate titles (Sheikh, Dr., Eng., etc.). Respect for seniority is important.',
    severity: 'recommended'
  },
  {
    area: 'Family',
    requirement: 'Family values emphasis',
    notes: 'Family-oriented content resonates well. Emphasize community and relationships.',
    severity: 'optional'
  },
  {
    area: 'Symbols',
    requirement: 'Avoid sensitive symbols',
    notes: 'Be cautious with religious symbols, national flags, or political references.',
    severity: 'mandatory'
  }
];

// =============================================================================
// COUNTRY-SPECIFIC CONFIGURATIONS
// =============================================================================

export const COUNTRY_CONFIGS: Record<MenaCountryCode, CountryLocalizationConfig> = {
  // Gulf States
  SA: {
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    countryNameArabic: 'المملكة العربية السعودية',
    dialect: 'gulf',
    numeralSystem: 'western', // Western numerals common in business
    calendarPreference: 'both',
    weekendDays: 'fri-sat',
    currencyCode: 'SAR',
    currencySymbol: 'ر.س',
    currencyNameArabic: 'ريال سعودي',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  AE: {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    countryNameArabic: 'الإمارات العربية المتحدة',
    dialect: 'gulf',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'sat-sun', // UAE moved to Sat-Sun in 2022
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    currencyNameArabic: 'درهم إماراتي',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'semi-formal',
    genderSensitivity: 'medium'
  },
  QA: {
    countryCode: 'QA',
    countryName: 'Qatar',
    countryNameArabic: 'قطر',
    dialect: 'gulf',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'QAR',
    currencySymbol: 'ر.ق',
    currencyNameArabic: 'ريال قطري',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  KW: {
    countryCode: 'KW',
    countryName: 'Kuwait',
    countryNameArabic: 'الكويت',
    dialect: 'gulf',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'KWD',
    currencySymbol: 'د.ك',
    currencyNameArabic: 'دينار كويتي',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  BH: {
    countryCode: 'BH',
    countryName: 'Bahrain',
    countryNameArabic: 'البحرين',
    dialect: 'gulf',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'BHD',
    currencySymbol: 'د.ب',
    currencyNameArabic: 'دينار بحريني',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'semi-formal',
    genderSensitivity: 'medium'
  },
  OM: {
    countryCode: 'OM',
    countryName: 'Oman',
    countryNameArabic: 'عُمان',
    dialect: 'gulf',
    numeralSystem: 'western',
    calendarPreference: 'both',
    weekendDays: 'fri-sat',
    currencyCode: 'OMR',
    currencySymbol: 'ر.ع',
    currencyNameArabic: 'ريال عماني',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  
  // Egypt
  EG: {
    countryCode: 'EG',
    countryName: 'Egypt',
    countryNameArabic: 'مصر',
    dialect: 'egyptian',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'EGP',
    currencySymbol: 'ج.م',
    currencyNameArabic: 'جنيه مصري',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'semi-formal',
    genderSensitivity: 'medium'
  },
  
  // Levant
  JO: {
    countryCode: 'JO',
    countryName: 'Jordan',
    countryNameArabic: 'الأردن',
    dialect: 'levantine',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'JOD',
    currencySymbol: 'د.أ',
    currencyNameArabic: 'دينار أردني',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'medium'
  },
  LB: {
    countryCode: 'LB',
    countryName: 'Lebanon',
    countryNameArabic: 'لبنان',
    dialect: 'levantine',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'sat-sun',
    currencyCode: 'LBP',
    currencySymbol: 'ل.ل',
    currencyNameArabic: 'ليرة لبنانية',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'semi-formal',
    genderSensitivity: 'low'
  },
  PS: {
    countryCode: 'PS',
    countryName: 'Palestine',
    countryNameArabic: 'فلسطين',
    dialect: 'levantine',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'ILS',
    currencySymbol: '₪',
    currencyNameArabic: 'شيكل',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  SY: {
    countryCode: 'SY',
    countryName: 'Syria',
    countryNameArabic: 'سوريا',
    dialect: 'levantine',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'SYP',
    currencySymbol: 'ل.س',
    currencyNameArabic: 'ليرة سورية',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  
  // Maghreb
  MA: {
    countryCode: 'MA',
    countryName: 'Morocco',
    countryNameArabic: 'المغرب',
    dialect: 'maghrebi',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'sat-sun',
    currencyCode: 'MAD',
    currencySymbol: 'د.م',
    currencyNameArabic: 'درهم مغربي',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    businessFormality: 'formal',
    genderSensitivity: 'medium'
  },
  DZ: {
    countryCode: 'DZ',
    countryName: 'Algeria',
    countryNameArabic: 'الجزائر',
    dialect: 'maghrebi',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'DZD',
    currencySymbol: 'د.ج',
    currencyNameArabic: 'دينار جزائري',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    businessFormality: 'formal',
    genderSensitivity: 'medium'
  },
  TN: {
    countryCode: 'TN',
    countryName: 'Tunisia',
    countryNameArabic: 'تونس',
    dialect: 'maghrebi',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'sat-sun',
    currencyCode: 'TND',
    currencySymbol: 'د.ت',
    currencyNameArabic: 'دينار تونسي',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    businessFormality: 'semi-formal',
    genderSensitivity: 'low'
  },
  LY: {
    countryCode: 'LY',
    countryName: 'Libya',
    countryNameArabic: 'ليبيا',
    dialect: 'maghrebi',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'LYD',
    currencySymbol: 'د.ل',
    currencyNameArabic: 'دينار ليبي',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  
  // Iraq
  IQ: {
    countryCode: 'IQ',
    countryName: 'Iraq',
    countryNameArabic: 'العراق',
    dialect: 'iraqi',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'IQD',
    currencySymbol: 'د.ع',
    currencyNameArabic: 'دينار عراقي',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  
  // Other
  YE: {
    countryCode: 'YE',
    countryName: 'Yemen',
    countryNameArabic: 'اليمن',
    dialect: 'gulf',
    numeralSystem: 'western',
    calendarPreference: 'hijri',
    weekendDays: 'fri-sat',
    currencyCode: 'YER',
    currencySymbol: 'ر.ي',
    currencyNameArabic: 'ريال يمني',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  },
  SD: {
    countryCode: 'SD',
    countryName: 'Sudan',
    countryNameArabic: 'السودان',
    dialect: 'msa',
    numeralSystem: 'western',
    calendarPreference: 'gregorian',
    weekendDays: 'fri-sat',
    currencyCode: 'SDG',
    currencySymbol: 'ج.س',
    currencyNameArabic: 'جنيه سوداني',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    businessFormality: 'formal',
    genderSensitivity: 'high'
  }
};

// =============================================================================
// ARABIC FONTS
// =============================================================================

export const ARABIC_FONTS: ArabicFontConfig[] = [
  {
    fontFamily: 'Noto Sans Arabic',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap',
    cssClass: 'font-noto-arabic',
    direction: 'rtl',
    recommended: true,
    notes: 'Best for digital interfaces. Excellent Unicode support across all Arabic scripts.'
  },
  {
    fontFamily: 'Cairo',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap',
    cssClass: 'font-cairo',
    direction: 'rtl',
    recommended: true,
    notes: 'Modern, clean design. Popular for Egyptian audiences. Good for headlines.'
  },
  {
    fontFamily: 'Tajawal',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
    cssClass: 'font-tajawal',
    direction: 'rtl',
    recommended: true,
    notes: 'Elegant and readable. Works well for both body text and headers.'
  },
  {
    fontFamily: 'Almarai',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap',
    cssClass: 'font-almarai',
    direction: 'rtl',
    recommended: false,
    notes: 'Saudi-origin font. Good for Gulf region targeting.'
  },
  {
    fontFamily: 'Amiri',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
    cssClass: 'font-amiri',
    direction: 'rtl',
    recommended: false,
    notes: 'Traditional Naskh style. Best for formal/religious content.'
  },
  {
    fontFamily: 'IBM Plex Sans Arabic',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap',
    cssClass: 'font-ibm-plex-arabic',
    direction: 'rtl',
    recommended: true,
    notes: 'Professional and modern. Excellent for enterprise/tech content.'
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get dialect for a country
 */
export function getDialectForCountry(countryCode: MenaCountryCode): ArabicDialect {
  return COUNTRY_CONFIGS[countryCode]?.dialect || 'msa';
}

/**
 * Get dialect mapping details
 */
export function getDialectMapping(dialect: ArabicDialect): DialectMapping | undefined {
  return DIALECT_MAPPINGS.find(d => d.dialect === dialect);
}

/**
 * Get voice provider for a country
 */
export function getVoiceProviderForCountry(countryCode: MenaCountryCode): {
  dialect: ArabicDialect;
  provider: string;
  fallback: string;
  voiceIds?: { male?: string; female?: string };
} {
  const config = COUNTRY_CONFIGS[countryCode];
  const dialectMapping = getDialectMapping(config?.dialect || 'msa');
  
  return {
    dialect: config?.dialect || 'msa',
    provider: dialectMapping?.voiceProviders.primary || 'azure',
    fallback: dialectMapping?.voiceProviders.fallback || 'google',
    voiceIds: dialectMapping?.voiceIds
  };
}

/**
 * Get country configuration
 */
export function getCountryConfig(countryCode: MenaCountryCode): CountryLocalizationConfig | undefined {
  return COUNTRY_CONFIGS[countryCode];
}

/**
 * Check if country uses RTL
 */
export function isRTLCountry(countryCode: string): boolean {
  return Object.keys(COUNTRY_CONFIGS).includes(countryCode as MenaCountryCode);
}

/**
 * Get recommended font for Arabic content
 */
export function getRecommendedArabicFont(): ArabicFontConfig {
  return ARABIC_FONTS.find(f => f.recommended && f.fontFamily === 'Noto Sans Arabic') || ARABIC_FONTS[0];
}

/**
 * Get cultural considerations for content generation
 */
export function getCulturalGuidelines(severity?: 'mandatory' | 'recommended' | 'optional'): CulturalConsideration[] {
  if (severity) {
    return CULTURAL_CONSIDERATIONS.filter(c => c.severity === severity);
  }
  return CULTURAL_CONSIDERATIONS;
}

/**
 * Convert Western numerals to Eastern Arabic numerals
 */
export function toEasternArabicNumerals(num: number | string): string {
  const easternNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (digit) => easternNumerals[parseInt(digit)]);
}

/**
 * Convert Eastern Arabic numerals to Western numerals
 */
export function toWesternNumerals(str: string): string {
  const westernNumerals: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return str.replace(/[٠-٩]/g, (digit) => westernNumerals[digit] || digit);
}

/**
 * Build comprehensive localization config for a MENA country
 */
export function buildMenaLocalizationConfig(countryCode: MenaCountryCode): {
  country: CountryLocalizationConfig;
  dialect: DialectMapping | undefined;
  voice: ReturnType<typeof getVoiceProviderForCountry>;
  font: ArabicFontConfig;
  culturalGuidelines: CulturalConsideration[];
  requirements: ArabicLanguageRequirement[];
} {
  const country = getCountryConfig(countryCode);
  const dialect = getDialectMapping(country?.dialect || 'msa');
  const voice = getVoiceProviderForCountry(countryCode);
  const font = getRecommendedArabicFont();
  const culturalGuidelines = getCulturalGuidelines('mandatory');
  
  return {
    country: country!,
    dialect,
    voice,
    font,
    culturalGuidelines,
    requirements: ARABIC_LANGUAGE_REQUIREMENTS
  };
}

/**
 * Get recommended implementation strategy for MENA market
 */
export function getMenaImplementationStrategy(): {
  textStrategy: string;
  voiceStrategy: string;
  priorityMarkets: MenaCountryCode[];
  dialectPriority: ArabicDialect[];
} {
  return {
    textStrategy: 'Use Modern Standard Arabic (MSA) for all written content',
    voiceStrategy: 'Use Gulf Arabic (Khaleeji) for business content, Egyptian for media/entertainment',
    priorityMarkets: ['SA', 'AE', 'EG', 'QA', 'KW'],
    dialectPriority: ['gulf', 'msa', 'egyptian', 'levantine', 'maghrebi', 'iraqi']
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const ArabicMenaLocalizationRegistry = {
  // Constants
  ARABIC_LANGUAGE_REQUIREMENTS,
  DIALECT_MAPPINGS,
  CULTURAL_CONSIDERATIONS,
  COUNTRY_CONFIGS,
  ARABIC_FONTS,
  
  // Functions
  getDialectForCountry,
  getDialectMapping,
  getVoiceProviderForCountry,
  getCountryConfig,
  isRTLCountry,
  getRecommendedArabicFont,
  getCulturalGuidelines,
  toEasternArabicNumerals,
  toWesternNumerals,
  buildMenaLocalizationConfig,
  getMenaImplementationStrategy
};

export default ArabicMenaLocalizationRegistry;
