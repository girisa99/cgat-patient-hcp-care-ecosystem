/**
 * PROVIDER ATTRIBUTION COMPONENT
 * 
 * Shows which AI providers and Genie products are powering the current chapter
 * with animated badges and real-time updates
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';

interface ProviderAttributionProps {
  chapterId: string;
  providers: string[];
  isActive: boolean;
  languageCode?: string; // Added to show correct TTS provider per language
}

// Chapter to Genie product mapping - SYNCED with chapterId
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

// Provider branding with categories
const PROVIDER_CONFIG: Record<string, {
  displayName: string;
  category: string;
}> = {
  openai: { displayName: 'GPT-4o', category: 'LLM' },
  claude: { displayName: 'Claude', category: 'LLM' },
  gemini: { displayName: 'Gemini', category: 'LLM' },
  deepseek: { displayName: 'DeepSeek', category: 'LLM' },
  alibaba: { displayName: 'Alibaba WAN 2.2', category: 'Avatar' },
  azure: { displayName: 'Azure Neural', category: 'TTS' },
  modelslab: { displayName: 'ModelsLab', category: 'Video/3D' },
  meshy: { displayName: 'Meshy AI', category: '3D' },
  elevenlabs: { displayName: 'ElevenLabs', category: 'TTS' },
  deepl: { displayName: 'DeepL', category: 'Translation' },
  replicate: { displayName: 'Replicate', category: 'Fallback' },
  gcp: { displayName: 'GCP', category: 'Vision' },
  cosyvoice: { displayName: 'CosyVoice', category: 'TTS' },
};

// Get providers for each chapter based on LANGUAGE
// This mapping shows which providers are actually used per chapter
const CHAPTER_PROVIDERS: Record<string, string[]> = {
  opening: ['claude', 'elevenlabs', 'meshy'],
  spark: ['claude', 'openai', 'gemini', 'azure'],
  mind: ['elevenlabs', 'azure', 'alibaba', 'deepl'],
  vibe: ['modelslab', 'meshy', 'alibaba', 'elevenlabs', 'azure'],
  deck: ['claude', 'modelslab', 'meshy'],
  arc: ['claude', 'gemini', 'modelslab'],
  askGenie: ['claude', 'openai', 'gemini', 'elevenlabs'],
  cast: ['alibaba', 'modelslab', 'elevenlabs', 'deepl'],
  closing: ['claude', 'elevenlabs', 'meshy'],
};

// Language-specific TTS providers - which provider is used for each language
export const LANGUAGE_TTS_PROVIDERS: Record<string, string> = {
  en: 'elevenlabs',
  ar: 'azure',
  hi: 'azure',
  te: 'azure',
  ta: 'azure',
  bn: 'azure',
  zh: 'alibaba',
  ja: 'alibaba',
  ko: 'azure',
  es: 'elevenlabs',
  fr: 'elevenlabs',
  pt: 'azure',
  de: 'azure',
  tr: 'azure',
  sw: 'azure',
};

export const ProviderAttribution: React.FC<ProviderAttributionProps> = ({
  chapterId,
  providers,
  isActive,
  languageCode = 'en',
}) => {
  const product = CHAPTER_TO_PRODUCT[chapterId] || CHAPTER_TO_PRODUCT.opening;
  
  // Get the correct TTS provider based on language
  const ttsProvider = LANGUAGE_TTS_PROVIDERS[languageCode] || 'elevenlabs';
  
  // Build provider list with correct TTS for the selected language
  const buildProvidersForLanguage = (): string[] => {
    const baseProviders = CHAPTER_PROVIDERS[chapterId] || [];
    // Replace any TTS providers with the language-specific one
    const languageAwareProviders = baseProviders.map(p => {
      if (p === 'elevenlabs' || p === 'azure' || p === 'alibaba') {
        // Only replace if it's a TTS provider slot
        if (baseProviders.indexOf(p) === baseProviders.findIndex(bp => 
          bp === 'elevenlabs' || bp === 'azure' || bp === 'alibaba'
        )) {
          return ttsProvider;
        }
      }
      return p;
    });
    return [...new Set(languageAwareProviders)]; // Remove duplicates
  };
  
  const chapterProviders = providers.length > 0 ? providers : buildProvidersForLanguage();
  
  return (
    <div className="space-y-2">
      {/* Product branding - correctly synced to chapterId */}
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
            Powered by {product.name}
          </Badge>
          <span className="text-xs text-white/50 hidden md:inline">
            {product.description}
          </span>
        </motion.div>
      </AnimatePresence>
      
      {/* Provider badges - showing actual providers for this language */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-1.5"
        >
          {/* Always show the TTS provider first for clarity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0 }}
          >
            <Badge
              variant="outline"
              className="bg-purple-500/20 border-purple-400/40 text-purple-200 text-xs"
            >
              🎤 {PROVIDER_CONFIG[ttsProvider]?.displayName || ttsProvider}
              <span className="text-purple-300/60 ml-1 text-[10px]">
                (TTS)
              </span>
            </Badge>
          </motion.div>
          
          {/* Show other providers */}
          {chapterProviders.filter(p => p !== ttsProvider).slice(0, 3).map((providerId, idx) => {
            const provider = PROVIDER_CONFIG[providerId.toLowerCase()] || {
              displayName: providerId,
              category: 'AI',
            };
            
            return (
              <motion.div
                key={providerId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (idx + 1) * 0.1 }}
              >
                <Badge
                  variant="outline"
                  className="bg-black/40 border-white/20 text-white/80 text-xs"
                >
                  {provider.displayName}
                  <span className="text-white/40 ml-1 text-[10px]">
                    ({provider.category})
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
