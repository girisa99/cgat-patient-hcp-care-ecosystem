/**
 * Translation Provider Service
 * Multi-provider translation with intelligent routing
 * 
 * Providers: DeepL, Google, Azure, Alibaba Qwen-MT, OpenAI
 */

import { GlobalTier } from './tierAudioProviderService';

export interface TranslationProvider {
  id: string;
  name: string;
  tier: GlobalTier;
  quality: 'standard' | 'high' | 'premium';
  strengths: string[];
  supportedLanguages: number;
  specialization?: string[];
  costMultiplier: number;
  supportsGlossary?: boolean;
  supportsFormality?: boolean;
}

export interface LanguageTranslationConfig {
  sourceLanguage: string;
  targetLanguage: string;
  recommendedProvider: string;
  fallbackProviders: string[];
  reason: string;
}

// Translation providers by tier
export const TRANSLATION_PROVIDERS: TranslationProvider[] = [
  // Tier 1 - Standard
  {
    id: 'google-translate',
    name: 'Google Translate',
    tier: 1,
    quality: 'standard',
    strengths: ['Wide coverage', 'Fast', 'Affordable'],
    supportedLanguages: 133,
    costMultiplier: 1.0,
  },
  {
    id: 'azure-translator',
    name: 'Azure Translator',
    tier: 1,
    quality: 'standard',
    strengths: ['Enterprise', 'Custom models', 'Document translation'],
    supportedLanguages: 130,
    costMultiplier: 1.0,
    supportsGlossary: true,
  },
  
  // Tier 2 - Advanced
  {
    id: 'deepl',
    name: 'DeepL',
    tier: 2,
    quality: 'high',
    strengths: ['Natural phrasing', 'European excellence', 'Context-aware'],
    supportedLanguages: 31,
    specialization: ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ru', 'ja', 'zh'],
    costMultiplier: 1.5,
    supportsGlossary: true,
    supportsFormality: true,
  },
  {
    id: 'openai-gpt-translate',
    name: 'OpenAI GPT Translation',
    tier: 2,
    quality: 'high',
    strengths: ['Context understanding', 'Nuance', 'Creative adaptation'],
    supportedLanguages: 100,
    costMultiplier: 2.0,
  },
  {
    id: 'alibaba-qwen-mt',
    name: 'Alibaba Qwen-MT',
    tier: 2,
    quality: 'high',
    strengths: ['CJK excellence', 'Asian languages', 'Enterprise'],
    supportedLanguages: 50,
    specialization: ['zh', 'ja', 'ko', 'th', 'vi', 'id', 'ms'],
    costMultiplier: 1.5,
    supportsGlossary: true,
  },
  
  // Tier 3 - Premium
  {
    id: 'deepl-pro',
    name: 'DeepL Pro',
    tier: 3,
    quality: 'premium',
    strengths: ['Best European quality', 'Formality control', 'CAT integration'],
    supportedLanguages: 31,
    specialization: ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ru', 'ja', 'zh'],
    costMultiplier: 2.5,
    supportsGlossary: true,
    supportsFormality: true,
  },
  {
    id: 'anthropic-claude-translate',
    name: 'Claude Translation',
    tier: 3,
    quality: 'premium',
    strengths: ['Nuanced translation', 'Cultural adaptation', 'Localization'],
    supportedLanguages: 95,
    costMultiplier: 3.0,
  },
  {
    id: 'alibaba-qwen-mt-pro',
    name: 'Alibaba Qwen-MT Pro',
    tier: 3,
    quality: 'premium',
    strengths: ['Best CJK quality', 'Professional localization', 'Domain-specific'],
    supportedLanguages: 50,
    specialization: ['zh', 'ja', 'ko', 'th', 'vi'],
    costMultiplier: 2.5,
    supportsGlossary: true,
  },
];

// Language family groupings for optimal routing
const LANGUAGE_FAMILIES: Record<string, string[]> = {
  'european': ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ru', 'uk', 'cs', 'sk', 'hu', 'ro', 'bg', 'el', 'sv', 'da', 'no', 'fi'],
  'cjk': ['zh', 'zh-CN', 'zh-TW', 'ja', 'ko'],
  'southeast-asian': ['th', 'vi', 'id', 'ms', 'tl', 'my'],
  'south-asian': ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'],
  'middle-eastern': ['ar', 'he', 'fa', 'tr'],
};

// Get language family
function getLanguageFamily(langCode: string): string {
  const normalized = langCode.split('-')[0].toLowerCase();
  for (const [family, languages] of Object.entries(LANGUAGE_FAMILIES)) {
    if (languages.includes(normalized) || languages.includes(langCode)) {
      return family;
    }
  }
  return 'other';
}

// Get recommended translation provider for language pair
export function getTranslationProvider(
  sourceLang: string,
  targetLang: string,
  tier: GlobalTier
): LanguageTranslationConfig {
  const sourceFamily = getLanguageFamily(sourceLang);
  const targetFamily = getLanguageFamily(targetLang);
  
  let recommendedProvider: string;
  let fallbackProviders: string[];
  let reason: string;
  
  // CJK to/from anything - prefer Alibaba
  if (sourceFamily === 'cjk' || targetFamily === 'cjk') {
    if (tier >= 2) {
      recommendedProvider = tier === 3 ? 'alibaba-qwen-mt-pro' : 'alibaba-qwen-mt';
      fallbackProviders = ['deepl', 'azure-translator', 'google-translate'];
      reason = 'Alibaba Qwen-MT excels at CJK language translation';
    } else {
      recommendedProvider = 'google-translate';
      fallbackProviders = ['azure-translator'];
      reason = 'Google Translate provides good CJK support at Tier 1';
    }
  }
  // European languages - prefer DeepL
  else if (sourceFamily === 'european' && targetFamily === 'european') {
    if (tier >= 2) {
      recommendedProvider = tier === 3 ? 'deepl-pro' : 'deepl';
      fallbackProviders = ['openai-gpt-translate', 'azure-translator', 'google-translate'];
      reason = 'DeepL provides the most natural European translations';
    } else {
      recommendedProvider = 'google-translate';
      fallbackProviders = ['azure-translator'];
      reason = 'Google Translate offers reliable European language support';
    }
  }
  // South/Southeast Asian - prefer Google/Azure
  else if (sourceFamily === 'south-asian' || targetFamily === 'south-asian' || 
           sourceFamily === 'southeast-asian' || targetFamily === 'southeast-asian') {
    if (tier >= 2) {
      recommendedProvider = 'azure-translator';
      fallbackProviders = ['google-translate', 'alibaba-qwen-mt'];
      reason = 'Azure provides comprehensive South/Southeast Asian language support';
    } else {
      recommendedProvider = 'google-translate';
      fallbackProviders = ['azure-translator'];
      reason = 'Google has widest coverage for South/Southeast Asian languages';
    }
  }
  // Middle Eastern - prefer Azure/Google
  else if (sourceFamily === 'middle-eastern' || targetFamily === 'middle-eastern') {
    if (tier >= 2) {
      recommendedProvider = 'azure-translator';
      fallbackProviders = ['google-translate', 'openai-gpt-translate'];
      reason = 'Azure offers strong RTL and Middle Eastern language support';
    } else {
      recommendedProvider = 'google-translate';
      fallbackProviders = ['azure-translator'];
      reason = 'Google provides reliable Middle Eastern language support';
    }
  }
  // Default fallback
  else {
    if (tier === 3) {
      recommendedProvider = 'anthropic-claude-translate';
      fallbackProviders = ['deepl-pro', 'openai-gpt-translate', 'google-translate'];
      reason = 'Claude provides nuanced translation for complex language pairs';
    } else if (tier === 2) {
      recommendedProvider = 'openai-gpt-translate';
      fallbackProviders = ['deepl', 'azure-translator', 'google-translate'];
      reason = 'OpenAI GPT provides context-aware translation';
    } else {
      recommendedProvider = 'google-translate';
      fallbackProviders = ['azure-translator'];
      reason = 'Google Translate offers widest language coverage';
    }
  }
  
  return {
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    recommendedProvider,
    fallbackProviders,
    reason,
  };
}

// Get providers by tier
export function getTranslationProvidersByTier(maxTier: GlobalTier): TranslationProvider[] {
  return TRANSLATION_PROVIDERS.filter(p => p.tier <= maxTier);
}

// Get provider details
export function getTranslationProviderDetails(providerId: string): TranslationProvider | null {
  return TRANSLATION_PROVIDERS.find(p => p.id === providerId) || null;
}

// Check if provider supports language
export function providerSupportsLanguage(providerId: string, langCode: string): boolean {
  const provider = getTranslationProviderDetails(providerId);
  if (!provider) return false;
  
  // If provider has specialization, check it
  if (provider.specialization) {
    const normalized = langCode.split('-')[0].toLowerCase();
    return provider.specialization.includes(normalized) || provider.specialization.includes(langCode);
  }
  
  // Otherwise assume supported (based on supportedLanguages count)
  return true;
}

// Get multi-language translation config
export function getMultiLanguageTranslationConfig(
  sourceLanguage: string,
  targetLanguages: string[],
  tier: GlobalTier
): Record<string, LanguageTranslationConfig> {
  const result: Record<string, LanguageTranslationConfig> = {};
  
  for (const targetLang of targetLanguages) {
    result[targetLang] = getTranslationProvider(sourceLanguage, targetLang, tier);
  }
  
  return result;
}

// Estimate translation cost (in relative units)
export function estimateTranslationCost(
  wordCount: number,
  providerId: string
): number {
  const provider = getTranslationProviderDetails(providerId);
  if (!provider) return wordCount * 0.001; // Default cost
  
  // Base cost: $0.00002 per character (~$0.0001 per word)
  const baseCostPerWord = 0.0001;
  return wordCount * baseCostPerWord * provider.costMultiplier;
}

// Service export
export const translationProviderService = {
  getTranslationProvider,
  getTranslationProvidersByTier,
  getTranslationProviderDetails,
  providerSupportsLanguage,
  getMultiLanguageTranslationConfig,
  estimateTranslationCost,
  TRANSLATION_PROVIDERS,
};
