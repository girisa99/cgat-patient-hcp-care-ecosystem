/**
 * PROVIDER ATTRIBUTION COMPONENT
 * 
 * Shows the COMPLETE 4-Zone AI provider routing:
 * - LLM: Claude (Western/EU), Gemini (India/SEA), Qwen (CJK/Arabic)
 * - TTS: ElevenLabs (Western), Azure (India/EU), Qwen3-TTS (CJK)
 * - Video: Vertex AI Veo, ModelsLab, Sora2API
 * - Translation: DeepL (Western), Google (India), Qwen-MT (CJK)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Wand2, Brain, Mic2, Video, Languages } from 'lucide-react';

interface ProviderAttributionProps {
  chapterId: string;
  providers: string[];
  isActive: boolean;
  languageCode?: string;
}

// Chapter to Genie product mapping
const CHAPTER_TO_PRODUCT: Record<string, {
  name: string;
  description: string;
}> = {
  opening: { name: 'Genie Suite', description: 'Your Complete AI Suite' },
  spark: { name: 'Genie Spark', description: 'Ignite Your Ideas' },
  mind: { name: 'Genie Mind', description: 'AI That Understands' },
  vibe: { name: 'Genie Vibe', description: 'Script to Screen' },
  deck: { name: 'Genie Deck', description: 'Ideas to Impact' },
  hub: { name: 'Genie Hub', description: 'Your Creative Command Center' },
  askGenie: { name: 'Ask Genie', description: 'Your Wish is My Command' },
  cast: { name: 'Genie Cast', description: 'Make It. Show It. Scale It.' },
  closing: { name: 'Genie Suite', description: 'Your Story Awaits' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4-ZONE REGIONAL ROUTING - COMPLETE PROVIDER MATRIX
// 
// COMPETITIVE DIFFERENTIATOR: IP-Auto-Suggest → User Override
// Unlike single-provider competitors, we offer 3-7 providers per category
// with automatic regional optimization AND manual user selection
// ═══════════════════════════════════════════════════════════════════════════════

type ZoneType = 'claude' | 'gemini' | 'alibaba' | 'global';

interface ZoneConfig {
  name: string;
  regions: string[]; // Explicit regions covered
  llm: { provider: string; displayName: string; fullForm: string };
  tts: { provider: string; displayName: string; fullForm: string };
  video: { provider: string; displayName: string; fullForm: string };
  translation: { provider: string; displayName: string; fullForm: string };
}

// Zone configurations per the 4-Zone Strategy with FULL regional coverage
const ZONE_CONFIGS: Record<ZoneType, ZoneConfig> = {
  claude: {
    name: 'Claude Zone (Americas/Europe/Oceania)',
    regions: ['US', 'UK', 'EU', 'Brazil', 'LATAM', 'Caribbean', 'Australia', 'New Zealand', 'Israel', 'South Africa'],
    llm: { provider: 'claude', displayName: 'Claude 3.5', fullForm: 'Large Language Model by Anthropic' },
    tts: { provider: 'elevenlabs', displayName: 'ElevenLabs', fullForm: 'Text-to-Speech by ElevenLabs' },
    video: { provider: 'vertex', displayName: 'Vertex AI Veo', fullForm: 'Video Generation by Google Vertex AI' },
    translation: { provider: 'deepl', displayName: 'DeepL', fullForm: 'Neural Translation by DeepL' },
  },
  gemini: {
    name: 'Gemini Zone (South Asia/SEA/Africa)',
    regions: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines', 'Singapore', 'Nigeria', 'Kenya', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'South Africa'],
    llm: { provider: 'gemini', displayName: 'Gemini Pro', fullForm: 'Large Language Model by Google DeepMind' },
    tts: { provider: 'azure', displayName: 'Azure Neural', fullForm: 'Text-to-Speech by Microsoft Azure with Visemes' },
    video: { provider: 'vertex', displayName: 'Vertex AI Veo', fullForm: 'Video Generation by Google Vertex AI' },
    translation: { provider: 'google', displayName: 'Google Translate', fullForm: 'Neural Translation supporting 22+ Indian languages' },
  },
  alibaba: {
    name: 'Alibaba Zone (CJK/MENA)',
    regions: ['China', 'Japan', 'Korea', 'Taiwan', 'Hong Kong', 'Saudi Arabia', 'UAE', 'Egypt', 'Morocco', 'Iraq', 'Jordan', 'Lebanon', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
    llm: { provider: 'qwen', displayName: 'Qwen-Max', fullForm: 'Large Language Model by Alibaba Cloud' },
    tts: { provider: 'qwen3-tts', displayName: 'Qwen3-TTS', fullForm: 'Text-to-Speech by Alibaba DashScope' },
    video: { provider: 'alibaba', displayName: 'Alibaba WAN', fullForm: 'Video Generation by Alibaba Wan 2.6' },
    translation: { provider: 'qwen-mt', displayName: 'Qwen-MT', fullForm: 'Neural Translation supporting 7 Arabic dialects' },
  },
  global: {
    name: 'Global Fallback',
    regions: ['Worldwide'],
    llm: { provider: 'gpt4o', displayName: 'GPT-4o', fullForm: 'Large Language Model by OpenAI' },
    tts: { provider: 'elevenlabs', displayName: 'ElevenLabs', fullForm: 'Text-to-Speech by ElevenLabs' },
    video: { provider: 'modelslab', displayName: 'ModelsLab', fullForm: 'Video Generation by ModelsLab' },
    translation: { provider: 'google', displayName: 'Google', fullForm: 'Neural Translation by Google' },
  },
};

// COMPLETE Language to Zone mapping - ALL 70+ languages with explicit regions
const LANGUAGE_ZONE_MAP: Record<string, ZoneType> = {
  // ══════════════════════════════════════════════════════════════
  // CLAUDE ZONE: Americas, Europe, Oceania
  // ══════════════════════════════════════════════════════════════
  en: 'claude',      // US, UK, Australia, NZ, Caribbean
  es: 'claude',      // Spain, Mexico, LATAM, Caribbean
  fr: 'claude',      // France, Canada, Caribbean (Haiti, Martinique)
  pt: 'claude',      // Brazil, Portugal
  de: 'claude',      // Germany, Austria, Switzerland
  it: 'claude',      // Italy
  nl: 'claude',      // Netherlands, Belgium
  pl: 'claude',      // Poland
  ru: 'claude',      // Russia (uses Claude for quality)
  he: 'claude',      // Israel
  
  // ══════════════════════════════════════════════════════════════
  // GEMINI ZONE: South Asia, Southeast Asia, Africa
  // ══════════════════════════════════════════════════════════════
  // INDIA (22+ languages)
  hi: 'gemini',      // Hindi - North India, Fiji
  te: 'gemini',      // Telugu - Andhra, Telangana
  ta: 'gemini',      // Tamil - Tamil Nadu, Sri Lanka, Singapore
  bn: 'gemini',      // Bengali - West Bengal, Bangladesh
  mr: 'gemini',      // Marathi - Maharashtra
  gu: 'gemini',      // Gujarati - Gujarat
  kn: 'gemini',      // Kannada - Karnataka
  ml: 'gemini',      // Malayalam - Kerala
  pa: 'gemini',      // Punjabi - Punjab
  or: 'gemini',      // Odia - Odisha
  as: 'gemini',      // Assamese - Assam
  ur: 'gemini',      // Urdu - Pakistan, India
  ne: 'gemini',      // Nepali - Nepal
  si: 'gemini',      // Sinhala - Sri Lanka
  
  // SOUTHEAST ASIA
  id: 'gemini',      // Indonesian - Indonesia
  vi: 'gemini',      // Vietnamese - Vietnam
  th: 'gemini',      // Thai - Thailand
  ms: 'gemini',      // Malay - Malaysia, Brunei, Singapore
  fil: 'gemini',     // Filipino - Philippines
  my: 'gemini',      // Burmese - Myanmar
  km: 'gemini',      // Khmer - Cambodia
  lo: 'gemini',      // Lao - Laos
  
  // AFRICA
  sw: 'gemini',      // Swahili - Kenya, Tanzania, Uganda
  yo: 'gemini',      // Yoruba - Nigeria
  ha: 'gemini',      // Hausa - Nigeria, Niger
  ig: 'gemini',      // Igbo - Nigeria
  am: 'gemini',      // Amharic - Ethiopia
  zu: 'gemini',      // Zulu - South Africa
  xh: 'gemini',      // Xhosa - South Africa
  af: 'gemini',      // Afrikaans - South Africa
  rw: 'gemini',      // Kinyarwanda - Rwanda
  so: 'gemini',      // Somali - Somalia
  
  // Turkish - bridges Europe/Asia
  tr: 'gemini',
  
  // ══════════════════════════════════════════════════════════════
  // ALIBABA ZONE: CJK + MENA (Arabic dialects)
  // ══════════════════════════════════════════════════════════════
  // CJK
  zh: 'alibaba',     // Chinese - China, Taiwan, HK, Singapore
  ja: 'alibaba',     // Japanese - Japan
  ko: 'alibaba',     // Korean - Korea
  
  // MENA - 7 Arabic dialects
  ar: 'alibaba',     // Modern Standard Arabic
  'ar-SA': 'alibaba', // Gulf Arabic - Saudi, UAE, Qatar
  'ar-EG': 'alibaba', // Egyptian Arabic
  'ar-MA': 'alibaba', // Maghrebi Arabic - Morocco, Algeria, Tunisia
  'ar-IQ': 'alibaba', // Iraqi Arabic
  'ar-JO': 'alibaba', // Levantine Arabic - Jordan, Lebanon, Syria
  'ar-YE': 'alibaba', // Yemeni Arabic
};

// Special TTS overrides (some languages have better TTS in different providers)
const TTS_OVERRIDES: Record<string, { provider: string; displayName: string; fullForm: string }> = {
  de: { provider: 'azure', displayName: 'Azure Neural', fullForm: 'Text-to-Speech by Microsoft Azure (German optimized)' },
  pt: { provider: 'azure', displayName: 'Azure Neural', fullForm: 'Text-to-Speech by Microsoft Azure (Portuguese optimized)' },
  tr: { provider: 'azure', displayName: 'Azure Neural', fullForm: 'Text-to-Speech by Microsoft Azure (Turkish optimized)' },
  ko: { provider: 'azure', displayName: 'Azure Neural', fullForm: 'Text-to-Speech by Microsoft Azure (Korean optimized)' },
};

// Get the complete provider stack for a language
export function getProvidersForLanguage(langCode: string): ZoneConfig {
  const zone = LANGUAGE_ZONE_MAP[langCode] || 'global';
  // Deep clone to avoid mutating the original config
  const config: ZoneConfig = {
    ...ZONE_CONFIGS[zone],
    llm: { ...ZONE_CONFIGS[zone].llm },
    tts: { ...ZONE_CONFIGS[zone].tts },
    video: { ...ZONE_CONFIGS[zone].video },
    translation: { ...ZONE_CONFIGS[zone].translation },
  };
  
  // Apply TTS overrides
  if (TTS_OVERRIDES[langCode]) {
    config.tts = TTS_OVERRIDES[langCode];
  }
  
  return config;
}

// Export for other components
export const LANGUAGE_TTS_PROVIDERS: Record<string, string> = {
  en: 'elevenlabs',
  es: 'elevenlabs',
  fr: 'elevenlabs',
  ar: 'qwen3-tts',
  hi: 'azure',
  te: 'azure',
  ta: 'azure',
  bn: 'azure',
  zh: 'qwen3-tts',
  ja: 'qwen3-tts',
  ko: 'azure',
  pt: 'azure',
  de: 'azure',
  tr: 'azure',
  sw: 'azure',
};

export const ProviderAttribution: React.FC<ProviderAttributionProps> = ({
  chapterId,
  isActive,
  languageCode = 'en',
}) => {
  const product = CHAPTER_TO_PRODUCT[chapterId] || CHAPTER_TO_PRODUCT.opening;
  const providerConfig = getProvidersForLanguage(languageCode);
  const zone = LANGUAGE_ZONE_MAP[languageCode] || 'global';
  
  // Provider category badges with icons - FULL FORMS for voiceover clarity
  const providerBadges = [
    { 
      icon: Brain, 
      label: providerConfig.llm.displayName, 
      category: 'LLM',
      fullForm: providerConfig.llm.fullForm,
      shortLabel: 'Large Language Model',
      color: 'from-blue-500/30 to-cyan-500/20 border-blue-400/40 text-blue-200'
    },
    { 
      icon: Mic2, 
      label: providerConfig.tts.displayName, 
      category: 'TTS',
      fullForm: providerConfig.tts.fullForm,
      shortLabel: 'Text-to-Speech',
      color: 'from-purple-500/30 to-pink-500/20 border-purple-400/40 text-purple-200'
    },
    { 
      icon: Video, 
      label: providerConfig.video.displayName, 
      category: 'Video',
      fullForm: providerConfig.video.fullForm,
      shortLabel: 'Video Generation',
      color: 'from-green-500/30 to-emerald-500/20 border-green-400/40 text-green-200'
    },
    { 
      icon: Languages, 
      label: providerConfig.translation.displayName, 
      category: 'i18n',
      fullForm: providerConfig.translation.fullForm,
      shortLabel: 'Translation',
      color: 'from-amber-500/30 to-orange-500/20 border-amber-400/40 text-amber-200'
    },
  ];
  
  return (
    <div className="space-y-2">
      {/* Product branding */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chapterId}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2"
        >
          <Badge 
            className="bg-gradient-to-r from-amber-500/30 to-purple-500/20 border-amber-500/40 text-amber-100"
          >
            <Wand2 className="w-3 h-3 mr-1" />
            {product.name}
          </Badge>
          <Badge 
            variant="outline"
            className="bg-black/40 border-white/20 text-white/60 text-[10px]"
          >
            {zone.charAt(0).toUpperCase() + zone.slice(1)} Zone
          </Badge>
        </motion.div>
      </AnimatePresence>
      
      {/* Complete provider stack - showing all 4 categories */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-1.5"
        >
          {providerBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Badge
                  variant="outline"
                  className={`bg-gradient-to-r ${badge.color} text-xs`}
                  title={badge.fullForm} // Tooltip with full explanation
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {badge.label}
                  <span className="opacity-60 ml-1 text-[10px]">
                    ({badge.shortLabel})
                  </span>
                </Badge>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ProviderAttribution;
