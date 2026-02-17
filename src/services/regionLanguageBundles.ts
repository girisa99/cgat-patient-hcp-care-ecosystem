/**
 * Region Language Bundles Service
 * 
 * Implements the regional auto-assignment of language bundles based on user IP detection.
 * Users get a curated bundle of languages pre-assigned to their region, with the ability
 * to add additional languages beyond the bundle.
 * 
 * SINGLE SOURCE OF TRUTH for all regional language routing across the ecosystem.
 * This consolidates and replaces legacy redundant configurations.
 */

import { COMPLETE_LANGUAGE_MATRIX } from './competitiveLanguageMatrix';
import { getLLMRouteByCountry, type LLMZone } from './llmRoutingStrategy';

// ============================================================================
// TYPES
// ============================================================================

export type BundleType = 
  | 'english_core'
  | 'europe'
  | 'asia'
  | 'india'
  | 'mea'
  | 'africa'
  | 'latam';

export interface LanguageBundle {
  id: BundleType;
  name: string;
  description: string;
  flag: string;
  languages: string[]; // Language codes included in bundle
  primaryLanguage: string;
  llmZone: LLMZone;
}

export interface UserLanguageConfig {
  bundle: BundleType;
  bundleLanguages: string[]; // Auto-assigned from bundle
  additionalLanguages: string[]; // User-added languages
  primaryLanguage: string;
  detectedCountry: string;
  detectedAutomatically: boolean;
  lastUpdated: string;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region: string;
}

// ============================================================================
// LANGUAGE BUNDLES (Based on Excel Matrix)
// ============================================================================

export const LANGUAGE_BUNDLES: Record<BundleType, LanguageBundle> = {
  english_core: {
    id: 'english_core',
    name: 'English Core',
    description: 'USA, Canada, UK, Australia',
    flag: '🌐',
    primaryLanguage: 'en',
    llmZone: 'claude',
    languages: [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'jp',
      'ko', 'kr', 'ar', 'hi', 'nl', 'pl', 'ru', 'tr'
    ],
  },
  
  europe: {
    id: 'europe',
    name: 'Europe Bundle',
    description: 'Germany, France, and EU countries',
    flag: '🇪🇺',
    primaryLanguage: 'de',
    llmZone: 'claude',
    languages: [
      'de', 'en', 'fr', 'es', 'it', 'nl', 'pt', 'pl',
      'ru', 'tr', 'cs', 'hu', 'ro', 'sv', 'da',
      // French variant includes CH variants
      'be', 'ar', 'tr'
    ],
  },
  
  asia: {
    id: 'asia',
    name: 'Asia Bundle',
    description: 'Japan, China, Korea, and SE Asia',
    flag: '🌏',
    primaryLanguage: 'ja',
    llmZone: 'alibaba',
    languages: [
      'ja', 'jp', 'en', 'zh', 'ko', 'kr', 'th', 'vi', 'id', 'ms',
      'tl', 'hi', 'zh-TW', 'zh-HK'
    ],
  },
  
  india: {
    id: 'india',
    name: 'India Bundle',
    description: 'India and South Asia',
    flag: '🇮🇳',
    primaryLanguage: 'hi',
    llmZone: 'gemini',
    languages: [
      'en', 'hi', 'bn', 'te', 'ta', 'mr', 'kn',
      'gu', 'ml', 'pa', 'od', 'as', 'ur', 'ne', 'si'
    ],
  },
  
  mea: {
    id: 'mea',
    name: 'MEA Bundle',
    description: 'Middle East - Saudi/UAE region',
    flag: '🇸🇦',
    primaryLanguage: 'ar',
    llmZone: 'gemini',
    languages: [
      'ar', 'ar-EG', 'ar-SA', 'ar-AE', 'ar-MA', 'ar-DZ', 'ar-IQ', 'ar-JO',
      'en', 'he', 'tr', 'fa', 'ur', 'fr', 'es'
    ],
  },
  
  africa: {
    id: 'africa',
    name: 'Africa Bundle',
    description: 'Nigeria, Kenya, and Sub-Saharan Africa',
    flag: '🌍',
    primaryLanguage: 'en',
    llmZone: 'gemini',
    languages: [
      'en', 'sw', 'yo', 'ha', 'ig', 'zu', 'xh',
      'am', 'fr', 'ar', 'pt'
    ],
  },
  
  latam: {
    id: 'latam',
    name: 'LatAm Bundle',
    description: 'Brazil, Mexico, and Latin America',
    flag: '🌎',
    primaryLanguage: 'pt-BR',
    llmZone: 'claude',
    languages: [
      'pt-BR', 'en', 'es', 'es-MX', 'es-AR',
      'fr', 'it', 'de'
    ],
  },
};

// ============================================================================
// COUNTRY TO BUNDLE MAPPING
// ============================================================================

const COUNTRY_TO_BUNDLE: Record<string, BundleType> = {
  // English Core (USA, Canada, UK, AU, NZ)
  US: 'english_core', CA: 'english_core', GB: 'english_core', 
  AU: 'english_core', NZ: 'english_core', IE: 'english_core',
  
  // Europe Bundle
  DE: 'europe', FR: 'europe', IT: 'europe', ES: 'europe', PT: 'europe',
  NL: 'europe', BE: 'europe', AT: 'europe', CH: 'europe', PL: 'europe',
  CZ: 'europe', RO: 'europe', HU: 'europe', SE: 'europe', DK: 'europe',
  NO: 'europe', FI: 'europe', GR: 'europe', SK: 'europe', HR: 'europe',
  BG: 'europe', RS: 'europe', SI: 'europe', LT: 'europe', LV: 'europe', 
  EE: 'europe', RU: 'europe', UA: 'europe',
  
  // Asia Bundle
  JP: 'asia', CN: 'asia', TW: 'asia', HK: 'asia', MO: 'asia',
  KR: 'asia', TH: 'asia', VN: 'asia', ID: 'asia', MY: 'asia',
  PH: 'asia', SG: 'asia', MM: 'asia', KH: 'asia', LA: 'asia', BN: 'asia',
  
  // India Bundle
  IN: 'india', PK: 'india', BD: 'india', LK: 'india', NP: 'india',
  
  // MEA Bundle (Middle East)
  SA: 'mea', AE: 'mea', EG: 'mea', QA: 'mea', KW: 'mea', BH: 'mea',
  OM: 'mea', JO: 'mea', LB: 'mea', IQ: 'mea', SY: 'mea', YE: 'mea',
  PS: 'mea', IL: 'mea', IR: 'mea', TR: 'mea',
  
  // Africa Bundle
  NG: 'africa', KE: 'africa', TZ: 'africa', ET: 'africa', GH: 'africa',
  ZA: 'africa', UG: 'africa', RW: 'africa', CI: 'africa', SN: 'africa',
  CM: 'africa', AO: 'africa', MZ: 'africa', ZW: 'africa', ZM: 'africa',
  SD: 'africa', SO: 'africa',
  MA: 'africa', DZ: 'africa', TN: 'africa', LY: 'africa', // North Africa
  
  // LatAm Bundle
  BR: 'latam', MX: 'latam', AR: 'latam', CO: 'latam', CL: 'latam',
  PE: 'latam', VE: 'latam', EC: 'latam', GT: 'latam', CU: 'latam',
  DO: 'latam', HN: 'latam', NI: 'latam', SV: 'latam', CR: 'latam',
  PA: 'latam', UY: 'latam', PY: 'latam', BO: 'latam', PR: 'latam',
};

// ============================================================================
// ALL AVAILABLE LANGUAGES (For user to add beyond bundle)
// ============================================================================

export const ALL_AVAILABLE_LANGUAGES: LanguageInfo[] = [
  // Major World Languages
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', region: 'Global' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', region: 'Global' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', region: 'Global' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', region: 'Europe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', region: 'Europe' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', region: 'Global' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português Brasileiro', direction: 'ltr', region: 'LatAm' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', region: 'Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', region: 'Europe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', region: 'Europe' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', region: 'Europe' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr', region: 'Europe' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', region: 'Europe' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', region: 'Europe' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', direction: 'ltr', region: 'Europe' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', region: 'Europe' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', direction: 'ltr', region: 'Europe' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', region: 'Europe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', region: 'Europe' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', region: 'MEA' },
  
  // CJK Languages
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr', region: 'Asia' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr', region: 'Asia' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', direction: 'ltr', region: 'Asia' },
  { code: 'zh-HK', name: 'Chinese (Cantonese)', nativeName: '粵語', direction: 'ltr', region: 'Asia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', region: 'Asia' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', region: 'Asia' },
  
  // SE Asian Languages
  { code: 'th', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', region: 'Asia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', region: 'Asia' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', region: 'Asia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', region: 'Asia' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', direction: 'ltr', region: 'Asia' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာဘာသာ', direction: 'ltr', region: 'Asia' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', direction: 'ltr', region: 'Asia' },
  
  // Indian Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', region: 'India' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', region: 'India' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', region: 'India' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', region: 'India' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', region: 'India' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', region: 'India' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', region: 'India' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', region: 'India' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', region: 'India' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', direction: 'ltr', region: 'India' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', direction: 'ltr', region: 'India' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', direction: 'ltr', region: 'India' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', direction: 'ltr', region: 'India' },
  
  // Arabic Dialects
  { code: 'ar', name: 'Arabic (MSA)', nativeName: 'العربية', direction: 'rtl', region: 'MEA' },
  { code: 'ar-EG', name: 'Arabic (Egyptian)', nativeName: 'العربية المصرية', direction: 'rtl', region: 'MEA' },
  { code: 'ar-SA', name: 'Arabic (Saudi)', nativeName: 'العربية السعودية', direction: 'rtl', region: 'MEA' },
  { code: 'ar-AE', name: 'Arabic (Gulf)', nativeName: 'العربية الخليجية', direction: 'rtl', region: 'MEA' },
  { code: 'ar-MA', name: 'Arabic (Moroccan)', nativeName: 'الدارجة المغربية', direction: 'rtl', region: 'MEA' },
  { code: 'ar-DZ', name: 'Arabic (Algerian)', nativeName: 'الدارجة الجزائرية', direction: 'rtl', region: 'MEA' },
  { code: 'ar-IQ', name: 'Arabic (Iraqi)', nativeName: 'العراقية', direction: 'rtl', region: 'MEA' },
  
  // Other RTL Languages
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', region: 'MEA' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', region: 'MEA' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', region: 'India' },
  
  // African Languages
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', region: 'Africa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', direction: 'ltr', region: 'Africa' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', direction: 'ltr', region: 'Africa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', direction: 'ltr', region: 'Africa' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', direction: 'ltr', region: 'Africa' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', direction: 'ltr', region: 'Africa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', direction: 'ltr', region: 'Africa' },
  
  // Spanish Variants
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español Mexicano', direction: 'ltr', region: 'LatAm' },
  { code: 'es-AR', name: 'Spanish (Argentina)', nativeName: 'Español Rioplatense', direction: 'ltr', region: 'LatAm' },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

const STORAGE_KEY = 'genie_language_bundle_config';

class RegionLanguageBundleService {
  private config: UserLanguageConfig | null = null;

  /**
   * Get bundle for a country code
   */
  getBundleForCountry(countryCode: string): BundleType {
    return COUNTRY_TO_BUNDLE[countryCode] || 'english_core';
  }

  /**
   * Get bundle configuration
   */
  getBundle(bundleType: BundleType): LanguageBundle {
    return LANGUAGE_BUNDLES[bundleType];
  }

  /**
   * Get all bundles
   */
  getAllBundles(): LanguageBundle[] {
    return Object.values(LANGUAGE_BUNDLES);
  }

  /**
   * Initialize config from IP detection
   */
  async initializeFromIP(): Promise<UserLanguageConfig> {
    // Check for saved config first
    const saved = this.loadSavedConfig();
    if (saved) {
      this.config = saved;
      return saved;
    }

    // Detect from IP
    try {
      const response = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) throw new Error('IP detection failed');

      const data = await response.json();
      const countryCode = data.country_code || 'US';
      
      return this.createConfigForCountry(countryCode, true);
    } catch (error) {
      console.warn('[RegionLanguageBundleService] IP detection failed:', error);
      return this.createConfigForCountry('US', true);
    }
  }

  /**
   * Create config for a country
   */
  createConfigForCountry(countryCode: string, autoDetected: boolean): UserLanguageConfig {
    const bundleType = this.getBundleForCountry(countryCode);
    const bundle = this.getBundle(bundleType);

    const config: UserLanguageConfig = {
      bundle: bundleType,
      bundleLanguages: [...bundle.languages],
      additionalLanguages: [],
      primaryLanguage: bundle.primaryLanguage,
      detectedCountry: countryCode,
      detectedAutomatically: autoDetected,
      lastUpdated: new Date().toISOString(),
    };

    this.config = config;
    this.saveConfig(config);
    return config;
  }

  /**
   * Get current config
   */
  getConfig(): UserLanguageConfig | null {
    if (!this.config) {
      this.config = this.loadSavedConfig();
    }
    return this.config;
  }

  /**
   * Get all enabled languages (bundle + additional)
   */
  getEnabledLanguages(): string[] {
    const config = this.getConfig();
    if (!config) return ['en'];
    
    const all = new Set([...config.bundleLanguages, ...config.additionalLanguages]);
    return Array.from(all);
  }

  /**
   * Get language info for enabled languages
   */
  getEnabledLanguageInfo(): LanguageInfo[] {
    const enabled = this.getEnabledLanguages();
    return ALL_AVAILABLE_LANGUAGES.filter(lang => enabled.includes(lang.code));
  }

  /**
   * Add additional language beyond bundle
   */
  addLanguage(languageCode: string): UserLanguageConfig {
    const config = this.getConfig() || this.createConfigForCountry('US', false);
    
    // Don't add duplicates
    if (!config.additionalLanguages.includes(languageCode) && 
        !config.bundleLanguages.includes(languageCode)) {
      config.additionalLanguages.push(languageCode);
      config.lastUpdated = new Date().toISOString();
      this.config = config;
      this.saveConfig(config);
    }
    
    return config;
  }

  /**
   * Remove additional language
   */
  removeLanguage(languageCode: string): UserLanguageConfig {
    const config = this.getConfig() || this.createConfigForCountry('US', false);
    
    // Can only remove from additionalLanguages, not bundle
    config.additionalLanguages = config.additionalLanguages.filter(l => l !== languageCode);
    config.lastUpdated = new Date().toISOString();
    this.config = config;
    this.saveConfig(config);
    
    return config;
  }

  /**
   * Change primary language
   */
  setPrimaryLanguage(languageCode: string): UserLanguageConfig {
    const config = this.getConfig() || this.createConfigForCountry('US', false);
    
    const enabled = this.getEnabledLanguages();
    if (enabled.includes(languageCode)) {
      config.primaryLanguage = languageCode;
      config.lastUpdated = new Date().toISOString();
      this.config = config;
      this.saveConfig(config);
    }
    
    return config;
  }

  /**
   * Change bundle (manual region change)
   */
  setBundle(bundleType: BundleType): UserLanguageConfig {
    const bundle = this.getBundle(bundleType);
    const config = this.getConfig() || this.createConfigForCountry('US', false);
    
    config.bundle = bundleType;
    config.bundleLanguages = [...bundle.languages];
    config.primaryLanguage = bundle.primaryLanguage;
    config.detectedAutomatically = false;
    config.lastUpdated = new Date().toISOString();
    
    this.config = config;
    this.saveConfig(config);
    return config;
  }

  /**
   * Get available languages to add (not in current enabled list)
   */
  getAvailableToAdd(): LanguageInfo[] {
    const enabled = this.getEnabledLanguages();
    return ALL_AVAILABLE_LANGUAGES.filter(lang => !enabled.includes(lang.code));
  }

  /**
   * Get language info by code
   */
  getLanguageInfo(code: string): LanguageInfo | undefined {
    return ALL_AVAILABLE_LANGUAGES.find(l => l.code === code);
  }

  /**
   * Check if language is RTL
   */
  isRTL(languageCode: string): boolean {
    const lang = this.getLanguageInfo(languageCode);
    return lang?.direction === 'rtl';
  }

  /**
   * Get LLM zone for current bundle
   */
  getLLMZone(): LLMZone {
    const config = this.getConfig();
    if (!config) return 'fallback';
    
    const bundle = this.getBundle(config.bundle);
    return bundle.llmZone;
  }

  // Storage helpers
  private saveConfig(config: UserLanguageConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('[RegionLanguageBundleService] Failed to save config:', e);
    }
  }

  private loadSavedConfig(): UserLanguageConfig | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[RegionLanguageBundleService] Failed to load config:', e);
    }
    return null;
  }

  /**
   * Clear saved config (for testing)
   */
  clearConfig(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.config = null;
    } catch (e) {
      console.warn('[RegionLanguageBundleService] Failed to clear config:', e);
    }
  }
}

// Singleton export
export const regionLanguageBundleService = new RegionLanguageBundleService();

// Default export
export default regionLanguageBundleService;
