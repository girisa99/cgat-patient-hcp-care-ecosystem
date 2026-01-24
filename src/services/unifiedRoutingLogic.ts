/**
 * Unified Routing Logic Service
 * Implements refined regional routing for LLM, TTS, STT, and Translation
 * Based on linguistic strengths, cost optimization, and quality requirements
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type TaskType = 'general' | 'code' | 'structured' | 'creative' | 'translation' | 'analysis';
export type QualityTier = 'premium' | 'standard' | 'budget';
export type RoutingZone = 'claude' | 'qwen' | 'gpt4' | 'gemini' | 'deepseek' | 'fallback';

export interface LLMRoutingResult {
  primary: string;
  fallback: string;
  cost: number;
  zone: RoutingZone;
  qualityRating: number; // 1-5
  latencyEstimate: 'fast' | 'medium' | 'slow';
}

export interface TTSRoutingResult {
  provider: 'elevenlabs' | 'alibaba-cosyvoice' | 'azure-neural' | 'google-tts' | 'openai-tts';
  cost: number;
  quality: QualityTier;
  voiceOptions: string[];
  supportsCloning: boolean;
  supportsSSML: boolean;
}

export interface STTRoutingResult {
  provider: 'openai-whisper' | 'alibaba-paraformer' | 'azure-speech' | 'google-stt' | 'deepgram';
  cost: number;
  quality: QualityTier;
  supportsRealtime: boolean;
  supportedDialects: string[];
}

export interface TranslationRoutingResult {
  provider: 'deepl' | 'qwen-mt' | 'azure-translator' | 'google-translate' | 'alibaba-mt';
  cost: number;
  quality: QualityTier;
  supportsGlossary: boolean;
  supportsFormality: boolean;
}

export interface RegionalContextPrompt {
  region: string;
  language: string;
  contextPrompt: string;
  register: string;
  formalityLevel: 'formal' | 'semi-formal' | 'polite' | 'casual';
  specialInstructions?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGION ZONE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const CLAUDE_REGIONS = [
  'US', 'UK', 'AU', 'CA', 'NZ', // English-speaking
  'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BE', 'AT', 'CH', // Europe
  'BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', // LatAm
  'IL', 'ZA' // Other
];

const QWEN_REGIONS = [
  'CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MO' // CJK only (NOT Arabic)
];

const GPT4_ARABIC_REGIONS = [
  'SA', 'AE', 'EG', 'MA', 'JO', 'IQ', 'KW', 'QA', 'BH', 'OM', 
  'LB', 'TN', 'DZ', 'LY', 'SY', 'YE', 'SD', 'PS'
];

const GEMINI_REGIONS = [
  'IN', 'PK', 'BD', 'LK', 'NP', 'BT', // South Asia
  'ID', 'VN', 'TH', 'PH', 'MY', 'MM', 'KH', 'LA', // SEA
  'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'ZW', 'ZM', 'RW', 'SN', 'CI' // Africa
];

const ELEVENLABS_REGIONS = [
  'US', 'UK', 'AU', 'CA', 'NZ', // English
  'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', // Europe
  'BR', 'MX', 'AR' // LatAm
];

const CJK_REGIONS = ['CN', 'HK', 'TW', 'JP', 'KR'];

// ═══════════════════════════════════════════════════════════════════════════════
// LLM ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

export function selectLLM(region: string, taskType: TaskType = 'general'): LLMRoutingResult {
  // CODE TASKS: Always use DeepSeek for cost savings (90%+ cheaper)
  if (taskType === 'code' || taskType === 'structured') {
    return {
      primary: 'deepseek-v3',
      fallback: 'claude-3-5-sonnet',
      cost: 0.00028,
      zone: 'deepseek',
      qualityRating: 4,
      latencyEstimate: 'fast'
    };
  }

  // CLAUDE ZONE: English, European, LatAm - Best for business/professional tone
  if (CLAUDE_REGIONS.includes(region)) {
    return {
      primary: 'claude-3-5-sonnet',
      fallback: 'gpt-4o',
      cost: 0.015,
      zone: 'claude',
      qualityRating: 5,
      latencyEstimate: 'medium'
    };
  }

  // QWEN ZONE: CJK only - Native quality, best for Chinese/Japanese/Korean
  if (QWEN_REGIONS.includes(region)) {
    return {
      primary: 'qwen-max',
      fallback: 'gpt-4o',
      cost: 0.004,
      zone: 'qwen',
      qualityRating: 5,
      latencyEstimate: 'fast'
    };
  }

  // GPT-4 ZONE: Arabic/MENA - GPT-4 has better Arabic dialect handling than Qwen
  if (GPT4_ARABIC_REGIONS.includes(region)) {
    return {
      primary: 'gpt-4o',
      fallback: 'claude-3-5-sonnet',
      cost: 0.015,
      zone: 'gpt4',
      qualityRating: 4,
      latencyEstimate: 'medium'
    };
  }

  // GEMINI ZONE: India, SEA, Africa - Cost-effective, good local support
  if (GEMINI_REGIONS.includes(region)) {
    return {
      primary: 'gemini-1.5-pro',
      fallback: 'gpt-4o',
      cost: 0.00125,
      zone: 'gemini',
      qualityRating: 4,
      latencyEstimate: 'fast'
    };
  }

  // DEFAULT FALLBACK
  return {
    primary: 'gpt-4o',
    fallback: 'claude-3-5-sonnet',
    cost: 0.015,
    zone: 'fallback',
    qualityRating: 5,
    latencyEstimate: 'medium'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TTS ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

export function selectTTS(
  region: string, 
  language: string, 
  quality: QualityTier = 'standard'
): TTSRoutingResult {
  // ELEVENLABS: Premium English/European - Best voice quality, cloning
  if (ELEVENLABS_REGIONS.includes(region) && quality === 'premium') {
    return {
      provider: 'elevenlabs',
      cost: 0.30,
      quality: 'premium',
      voiceOptions: ['rachel', 'adam', 'josh', 'bella', 'antoni', 'arnold', 'sam', 'elli'],
      supportsCloning: true,
      supportsSSML: true
    };
  }

  // ALIBABA COSYVOICE: CJK native prosody - Best for Chinese/Japanese/Korean
  if (CJK_REGIONS.includes(region)) {
    return {
      provider: 'alibaba-cosyvoice',
      cost: 0.02,
      quality: 'premium',
      voiceOptions: ['zhiyan', 'zhiyu', 'zhimi', 'zhida', 'tomoka', 'nanami', 'seoyeon', 'sumi'],
      supportsCloning: true,
      supportsSSML: true
    };
  }

  // AZURE NEURAL: Everything else (Arabic, Indian, African, SEA)
  // Best dialect support for Arabic, 40+ Indian voices
  return {
    provider: 'azure-neural',
    cost: 0.016,
    quality: 'standard',
    voiceOptions: getAzureVoicesForRegion(region, language),
    supportsCloning: false,
    supportsSSML: true
  };
}

function getAzureVoicesForRegion(region: string, language: string): string[] {
  const voiceMap: Record<string, string[]> = {
    // Arabic voices
    'SA': ['ar-SA-HamedNeural', 'ar-SA-ZariyahNeural'],
    'AE': ['ar-AE-FatimaNeural', 'ar-AE-HamdanNeural'],
    'EG': ['ar-EG-SalmaNeural', 'ar-EG-ShakirNeural'],
    // Indian voices
    'IN': ['hi-IN-SwaraNeural', 'hi-IN-MadhurNeural', 'ta-IN-PallaviNeural', 'te-IN-ShrutiNeural'],
    // African voices
    'NG': ['en-NG-AbeoNeural', 'en-NG-EzinneNeural'],
    'KE': ['sw-KE-RafikiNeural', 'sw-KE-ZuriNeural'],
    'ZA': ['en-ZA-LeahNeural', 'en-ZA-LukeNeural', 'zu-ZA-ThandoNeural'],
    // SEA voices
    'ID': ['id-ID-ArdiNeural', 'id-ID-GadisNeural'],
    'VN': ['vi-VN-HoaiMyNeural', 'vi-VN-NamMinhNeural'],
    'TH': ['th-TH-PremwadeeNeural', 'th-TH-NiwatNeural'],
    'PH': ['fil-PH-AngeloNeural', 'fil-PH-BlessicaNeural'],
    'MY': ['ms-MY-OsmanNeural', 'ms-MY-YasminNeural']
  };
  return voiceMap[region] || ['en-US-JennyNeural', 'en-US-GuyNeural'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// STT ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

export function selectSTT(
  region: string, 
  language: string, 
  requiresRealtime: boolean = false
): STTRoutingResult {
  // ALIBABA PARAFORMER: CJK Premium - Best for Mandarin/Cantonese
  if (CJK_REGIONS.includes(region) && ['zh', 'yue', 'wuu'].includes(language)) {
    return {
      provider: 'alibaba-paraformer',
      cost: 0.004,
      quality: 'premium',
      supportsRealtime: true,
      supportedDialects: ['mandarin', 'cantonese', 'wu', 'min', 'hakka']
    };
  }

  // AZURE SPEECH: When real-time streaming is required
  if (requiresRealtime) {
    return {
      provider: 'azure-speech',
      cost: 0.01,
      quality: 'standard',
      supportsRealtime: true,
      supportedDialects: getAzureSTTDialects(region, language)
    };
  }

  // OPENAI WHISPER: Universal - Best general accuracy (99 languages)
  return {
    provider: 'openai-whisper',
    cost: 0.006,
    quality: 'premium',
    supportsRealtime: false,
    supportedDialects: ['universal']
  };
}

function getAzureSTTDialects(region: string, language: string): string[] {
  const dialectMap: Record<string, string[]> = {
    'SA': ['ar-SA', 'ar-Gulf'],
    'EG': ['ar-EG', 'ar-Egyptian'],
    'IN': ['hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 'gu-IN'],
    'ID': ['id-ID'],
    'VN': ['vi-VN']
  };
  return dialectMap[region] || [language];
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATION ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

export function selectTranslation(
  sourceLang: string, 
  targetLang: string
): TranslationRoutingResult {
  // DEEPL: European languages - Highest quality
  const deeplLangs = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ru', 'ja', 'zh', 'ko'];
  if (deeplLangs.includes(sourceLang) && deeplLangs.includes(targetLang)) {
    return {
      provider: 'deepl',
      cost: 0.025,
      quality: 'premium',
      supportsGlossary: true,
      supportsFormality: true
    };
  }

  // QWEN-MT: CJK pairs - Native quality
  const cjkLangs = ['zh', 'ja', 'ko'];
  if (cjkLangs.includes(sourceLang) || cjkLangs.includes(targetLang)) {
    return {
      provider: 'qwen-mt',
      cost: 0.01,
      quality: 'premium',
      supportsGlossary: true,
      supportsFormality: false
    };
  }

  // AZURE: Arabic - Best dialect handling
  if (sourceLang === 'ar' || targetLang === 'ar') {
    return {
      provider: 'azure-translator',
      cost: 0.01,
      quality: 'standard',
      supportsGlossary: true,
      supportsFormality: false
    };
  }

  // GOOGLE: Everything else - Widest coverage (130+ languages)
  return {
    provider: 'google-translate',
    cost: 0.02,
    quality: 'standard',
    supportsGlossary: true,
    supportsFormality: false
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGIONAL CONTEXT PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

export const REGIONAL_CONTEXT_PROMPTS: Record<string, RegionalContextPrompt> = {
  DE: {
    region: 'DE',
    language: 'de',
    contextPrompt: 'Generate in German. Use formal Sie register. Standard business terminology.',
    register: 'Formal (Sie)',
    formalityLevel: 'formal',
    specialInstructions: 'Use compound nouns appropriately. Follow German punctuation rules.'
  },
  FR: {
    region: 'FR',
    language: 'fr',
    contextPrompt: 'Generate in French. Use subjunctive where appropriate. Elegant phrasing.',
    register: 'Formal (vous)',
    formalityLevel: 'formal',
    specialInstructions: 'Use passé composé for past actions. Maintain French accent marks.'
  },
  ES: {
    region: 'ES',
    language: 'es',
    contextPrompt: 'Generate in Spanish (Spain). Use vosotros for plural. Castilian style.',
    register: 'Formal (usted)',
    formalityLevel: 'formal',
    specialInstructions: 'Use leísmo where appropriate. Follow RAE conventions.'
  },
  MX: {
    region: 'MX',
    language: 'es-419',
    contextPrompt: 'Generate in Mexican Spanish. Use ustedes. Latin American expressions.',
    register: 'Polite (usted)',
    formalityLevel: 'polite',
    specialInstructions: 'Avoid voseo. Use Mexican idioms where natural.'
  },
  BR: {
    region: 'BR',
    language: 'pt-BR',
    contextPrompt: 'Generate in Brazilian Portuguese. Use você, not tu. Brazilian vocab.',
    register: 'Semi-formal',
    formalityLevel: 'semi-formal',
    specialInstructions: 'Use gerund (-ndo) forms. Follow Brazilian spelling conventions.'
  },
  JP: {
    region: 'JP',
    language: 'ja',
    contextPrompt: 'Generate in Japanese. Use ビジネス敬語 (business keigo) register.',
    register: 'Keigo (敬語)',
    formalityLevel: 'formal',
    specialInstructions: 'Use です/ます forms. Include appropriate honorifics (様, さん).'
  },
  KR: {
    region: 'KR',
    language: 'ko',
    contextPrompt: 'Generate in Korean. Use 존댓말 (formal speech). 만/억 number format.',
    register: 'Formal (존댓말)',
    formalityLevel: 'formal',
    specialInstructions: 'Use -습니다/-ㅂ니다 endings. Follow Korean honorific hierarchy.'
  },
  CN: {
    region: 'CN',
    language: 'zh-Hans',
    contextPrompt: 'Generate in Simplified Chinese. Use 您 for formal. Standard Mandarin.',
    register: 'Formal (您)',
    formalityLevel: 'formal',
    specialInstructions: 'Use simplified characters. Follow mainland conventions.'
  },
  TW: {
    region: 'TW',
    language: 'zh-Hant',
    contextPrompt: 'Generate in Traditional Chinese. Taiwan conventions and expressions.',
    register: 'Formal',
    formalityLevel: 'formal',
    specialInstructions: 'Use traditional characters. Follow Taiwan terminology.'
  },
  SA: {
    region: 'SA',
    language: 'ar',
    contextPrompt: 'Generate in Arabic (Gulf/Najdi dialect). Formal business Saudi style.',
    register: 'Formal MSA + Gulf',
    formalityLevel: 'formal',
    specialInstructions: 'Use Eastern Arabic numerals optionally. RTL formatting required.'
  },
  EG: {
    region: 'EG',
    language: 'ar-EG',
    contextPrompt: 'Generate in Arabic (Egyptian dialect). Cairo business conventions.',
    register: 'Formal + Egyptian',
    formalityLevel: 'formal',
    specialInstructions: 'Egyptian Arabic acceptable for casual, MSA for formal documents.'
  },
  IN: {
    region: 'IN',
    language: 'hi',
    contextPrompt: 'Generate in Hindi. शुद्ध हिंदी for formal, Hinglish OK for casual.',
    register: 'Formal Hindi',
    formalityLevel: 'formal',
    specialInstructions: 'Use आप for respect. Devanagari script required.'
  },
  ID: {
    region: 'ID',
    language: 'id',
    contextPrompt: 'Generate in Bahasa Indonesia. Use formal "Anda" not "kamu".',
    register: 'Formal (Anda)',
    formalityLevel: 'formal',
    specialInstructions: 'Avoid slang (bahasa gaul). Use standard Indonesian.'
  },
  VN: {
    region: 'VN',
    language: 'vi',
    contextPrompt: 'Generate in Vietnamese. Use appropriate honorifics (anh/chị/em).',
    register: 'Polite',
    formalityLevel: 'polite',
    specialInstructions: 'Match pronouns to age/relationship context.'
  },
  TH: {
    region: 'TH',
    language: 'th',
    contextPrompt: 'Generate in Thai. Use ครับ/ค่ะ politeness particles appropriately.',
    register: 'Polite (ครับ/ค่ะ)',
    formalityLevel: 'polite',
    specialInstructions: 'Male speaker uses ครับ, female uses ค่ะ.'
  },
  NG: {
    region: 'NG',
    language: 'en-NG',
    contextPrompt: 'Generate in English with Nigerian business context. Formal British style.',
    register: 'Formal British',
    formalityLevel: 'formal',
    specialInstructions: 'Use British spelling. Avoid colloquialisms.'
  },
  KE: {
    region: 'KE',
    language: 'en-KE',
    contextPrompt: 'Generate in English with Kenyan context. Option for Swahili available.',
    register: 'Formal British',
    formalityLevel: 'formal',
    specialInstructions: 'Swahili greetings acceptable. Use British conventions.'
  },
  AE: {
    region: 'AE',
    language: 'ar-AE',
    contextPrompt: 'Generate in Arabic (Gulf dialect). UAE business style.',
    register: 'Formal Gulf Arabic',
    formalityLevel: 'formal',
    specialInstructions: 'English-Arabic code-switching acceptable in business context.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COST COMPARISON BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegionalCostEstimate {
  region: string;
  llmCost: number;
  ttsCost: number;
  translationCost: number;
  totalPerPipeline: number;
  vsBaseline: string; // percentage vs US/EU baseline
  savings: string;
}

export function getRegionalCostEstimate(region: string): RegionalCostEstimate {
  const llm = selectLLM(region, 'general');
  const tts = selectTTS(region, 'en', 'standard');
  const translation = selectTranslation('en', getLanguageForRegion(region));

  const total = llm.cost + tts.cost + translation.cost;
  const baseline = 0.34; // US/EU baseline (Claude + ElevenLabs + DeepL)
  const percentage = Math.round((total / baseline) * 100);
  const savings = 100 - percentage;

  return {
    region,
    llmCost: llm.cost,
    ttsCost: tts.cost,
    translationCost: translation.cost,
    totalPerPipeline: total,
    vsBaseline: `${percentage}%`,
    savings: savings > 0 ? `${savings}% savings` : 'baseline'
  };
}

function getLanguageForRegion(region: string): string {
  const langMap: Record<string, string> = {
    CN: 'zh', JP: 'ja', KR: 'ko', DE: 'de', FR: 'fr', ES: 'es',
    BR: 'pt', IN: 'hi', SA: 'ar', EG: 'ar', ID: 'id', VN: 'vi',
    TH: 'th', NG: 'en', KE: 'sw'
  };
  return langMap[region] || 'en';
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED ROUTING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface UnifiedRoutingConfig {
  region: string;
  language: string;
  taskType: TaskType;
  qualityTier: QualityTier;
  requiresRealtime?: boolean;
  sourceLang?: string;
  targetLang?: string;
}

export interface UnifiedRoutingResult {
  llm: LLMRoutingResult;
  tts: TTSRoutingResult;
  stt: STTRoutingResult;
  translation?: TranslationRoutingResult;
  contextPrompt: RegionalContextPrompt | null;
  costEstimate: RegionalCostEstimate;
  isRTL: boolean;
  zone: RoutingZone;
}

export function getUnifiedRouting(config: UnifiedRoutingConfig): UnifiedRoutingResult {
  const { region, language, taskType, qualityTier, requiresRealtime, sourceLang, targetLang } = config;

  const llm = selectLLM(region, taskType);
  const tts = selectTTS(region, language, qualityTier);
  const stt = selectSTT(region, language, requiresRealtime);
  const translation = sourceLang && targetLang ? selectTranslation(sourceLang, targetLang) : undefined;
  const contextPrompt = REGIONAL_CONTEXT_PROMPTS[region] || null;
  const costEstimate = getRegionalCostEstimate(region);

  // RTL regions
  const rtlRegions = [...GPT4_ARABIC_REGIONS, 'IR', 'AF'];
  const isRTL = rtlRegions.includes(region);

  return {
    llm,
    tts,
    stt,
    translation,
    contextPrompt,
    costEstimate,
    isRTL,
    zone: llm.zone
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: GET ALL ZONES FOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function getAllZoneConfigurations() {
  return {
    claudeZone: {
      name: 'Claude Zone',
      regions: CLAUDE_REGIONS,
      primaryLLM: 'claude-3-5-sonnet',
      cost: 0.015,
      languages: ['EN', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'PT-BR', 'ES-419']
    },
    qwenZone: {
      name: 'Qwen Zone (CJK)',
      regions: QWEN_REGIONS,
      primaryLLM: 'qwen-max',
      cost: 0.004,
      languages: ['ZH', 'JA', 'KO']
    },
    gpt4Zone: {
      name: 'GPT-4 Zone (Arabic)',
      regions: GPT4_ARABIC_REGIONS,
      primaryLLM: 'gpt-4o',
      cost: 0.015,
      languages: ['AR (MSA)', 'AR-Gulf', 'AR-Egyptian', 'AR-Maghrebi']
    },
    geminiZone: {
      name: 'Gemini Zone',
      regions: GEMINI_REGIONS,
      primaryLLM: 'gemini-1.5-pro',
      cost: 0.00125,
      languages: ['HI', 'BN', 'TE', 'TA', 'ID', 'VI', 'TH', 'SW', 'HA']
    },
    deepseekZone: {
      name: 'DeepSeek Zone (Code)',
      regions: ['ALL'],
      primaryLLM: 'deepseek-v3',
      cost: 0.00028,
      languages: ['Code', 'Structured Output']
    }
  };
}

// Export zone constants for external use
export {
  CLAUDE_REGIONS,
  QWEN_REGIONS,
  GPT4_ARABIC_REGIONS,
  GEMINI_REGIONS,
  ELEVENLABS_REGIONS,
  CJK_REGIONS
};
