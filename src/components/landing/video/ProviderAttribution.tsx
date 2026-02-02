/**
 * PROVIDER ATTRIBUTION COMPONENT
 * 
 * Shows the COMPLETE 4-Zone AI provider routing:
 * - LLM: Claude (Western/EU), Gemini (India/SEA), Qwen (CJK/Arabic)
 * - TTS: ElevenLabs (Western), Azure (India/EU), CosyVoice (CJK)
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
  opening: { name: 'Genie Studio', description: 'Your Complete AI Suite' },
  spark: { name: 'Genie Spark', description: 'Ignite Your Ideas' },
  mind: { name: 'Genie Mind', description: 'AI That Understands' },
  vibe: { name: 'Genie Vibe', description: 'Script to Screen' },
  deck: { name: 'Genie Deck', description: 'Ideas to Impact' },
  arc: { name: 'Genie Arc', description: 'Your Production Journey' },
  askGenie: { name: 'Ask Genie', description: 'Your Wish is My Command' },
  cast: { name: 'Genie Cast', description: 'Make It. Show It. Scale It.' },
  closing: { name: 'Genie Studio', description: 'Your Story Awaits' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4-ZONE REGIONAL ROUTING - COMPLETE PROVIDER MATRIX
// ═══════════════════════════════════════════════════════════════════════════════

type ZoneType = 'claude' | 'gemini' | 'alibaba' | 'global';

interface ZoneConfig {
  name: string;
  llm: { provider: string; displayName: string };
  tts: { provider: string; displayName: string };
  video: { provider: string; displayName: string };
  translation: { provider: string; displayName: string };
}

// Zone configurations per the 4-Zone Strategy
const ZONE_CONFIGS: Record<ZoneType, ZoneConfig> = {
  claude: {
    name: 'Claude Zone (Western/EU)',
    llm: { provider: 'claude', displayName: 'Claude 3.5' },
    tts: { provider: 'elevenlabs', displayName: 'ElevenLabs' },
    video: { provider: 'vertex', displayName: 'Vertex AI Veo' },
    translation: { provider: 'deepl', displayName: 'DeepL' },
  },
  gemini: {
    name: 'Gemini Zone (India/SEA/Africa)',
    llm: { provider: 'gemini', displayName: 'Gemini Pro' },
    tts: { provider: 'azure', displayName: 'Azure Neural' },
    video: { provider: 'vertex', displayName: 'Vertex AI Veo' },
    translation: { provider: 'google', displayName: 'Google Translate' },
  },
  alibaba: {
    name: 'Alibaba Zone (CJK/Arabic)',
    llm: { provider: 'qwen', displayName: 'Qwen-Max' },
    tts: { provider: 'cosyvoice', displayName: 'CosyVoice' },
    video: { provider: 'alibaba', displayName: 'Alibaba WAN' },
    translation: { provider: 'qwen-mt', displayName: 'Qwen-MT' },
  },
  global: {
    name: 'Global Fallback',
    llm: { provider: 'gpt4o', displayName: 'GPT-4o' },
    tts: { provider: 'elevenlabs', displayName: 'ElevenLabs' },
    video: { provider: 'modelslab', displayName: 'ModelsLab' },
    translation: { provider: 'google', displayName: 'Google' },
  },
};

// Language to Zone mapping
const LANGUAGE_ZONE_MAP: Record<string, ZoneType> = {
  // Claude Zone (Western/EU/Brazil)
  en: 'claude',
  es: 'claude',
  fr: 'claude',
  pt: 'claude',
  de: 'claude', // German uses Claude LLM but Azure TTS for quality
  
  // Gemini Zone (India/SEA/Africa)
  hi: 'gemini',
  te: 'gemini',
  ta: 'gemini',
  bn: 'gemini',
  sw: 'gemini',
  id: 'gemini',
  vi: 'gemini',
  
  // Alibaba Zone (CJK/Arabic)
  zh: 'alibaba',
  ja: 'alibaba',
  ko: 'alibaba',
  ar: 'alibaba',
  
  // Turkish uses Gemini zone
  tr: 'gemini',
};

// Special TTS overrides (some languages have better TTS in different providers)
const TTS_OVERRIDES: Record<string, { provider: string; displayName: string }> = {
  de: { provider: 'azure', displayName: 'Azure Neural' }, // German better on Azure
  pt: { provider: 'azure', displayName: 'Azure Neural' }, // Portuguese better on Azure
  tr: { provider: 'azure', displayName: 'Azure Neural' }, // Turkish better on Azure
  ko: { provider: 'azure', displayName: 'Azure Neural' }, // Korean better on Azure
};

// Get the complete provider stack for a language
export function getProvidersForLanguage(langCode: string): ZoneConfig {
  const zone = LANGUAGE_ZONE_MAP[langCode] || 'global';
  const config = { ...ZONE_CONFIGS[zone] };
  
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
  ar: 'cosyvoice',
  hi: 'azure',
  te: 'azure',
  ta: 'azure',
  bn: 'azure',
  zh: 'cosyvoice',
  ja: 'cosyvoice',
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
  
  // Provider category badges with icons
  const providerBadges = [
    { 
      icon: Brain, 
      label: providerConfig.llm.displayName, 
      category: 'LLM',
      color: 'from-blue-500/30 to-cyan-500/20 border-blue-400/40 text-blue-200'
    },
    { 
      icon: Mic2, 
      label: providerConfig.tts.displayName, 
      category: 'TTS',
      color: 'from-purple-500/30 to-pink-500/20 border-purple-400/40 text-purple-200'
    },
    { 
      icon: Video, 
      label: providerConfig.video.displayName, 
      category: 'Video',
      color: 'from-green-500/30 to-emerald-500/20 border-green-400/40 text-green-200'
    },
    { 
      icon: Languages, 
      label: providerConfig.translation.displayName, 
      category: 'i18n',
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
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {badge.label}
                  <span className="opacity-60 ml-1 text-[10px]">
                    ({badge.category})
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
