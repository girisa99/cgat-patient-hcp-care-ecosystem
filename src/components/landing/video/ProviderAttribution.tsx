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
}

// Chapter to Genie product mapping
const CHAPTER_TO_PRODUCT: Record<string, {
  name: string;
  description: string;
  color: string;
}> = {
  opening: { name: 'Genie Studio', description: 'Your Complete AI Suite', color: 'amber' },
  spark: { name: 'Genie Spark', description: 'Ignite Your Ideas', color: 'orange' },
  mind: { name: 'Genie Mind', description: 'AI That Understands', color: 'blue' },
  vibe: { name: 'Genie Vibe', description: 'Script to Screen', color: 'rose' },
  deck: { name: 'Genie Deck', description: 'Ideas to Impact', color: 'emerald' },
  arc: { name: 'Genie Arc', description: 'Your Production Journey', color: 'violet' },
  askGenie: { name: 'Ask Genie', description: 'Your Wish is My Command', color: 'cyan' },
  cast: { name: 'Genie Cast', description: 'Make It. Show It. Scale It.', color: 'amber' },
  closing: { name: 'Genie Studio', description: 'Your Story Awaits', color: 'amber' },
};

// Provider branding
const PROVIDER_CONFIG: Record<string, {
  displayName: string;
  category: string;
  color: string;
}> = {
  openai: { displayName: 'OpenAI', category: 'LLM', color: 'from-green-500/20 to-green-600/10' },
  claude: { displayName: 'Claude', category: 'LLM', color: 'from-orange-500/20 to-orange-600/10' },
  gemini: { displayName: 'Gemini', category: 'LLM', color: 'from-blue-500/20 to-blue-600/10' },
  deepseek: { displayName: 'DeepSeek', category: 'LLM', color: 'from-purple-500/20 to-purple-600/10' },
  alibaba: { displayName: 'Alibaba', category: 'LLM/Avatar', color: 'from-red-500/20 to-red-600/10' },
  azure: { displayName: 'Azure', category: 'TTS/Vision', color: 'from-sky-500/20 to-sky-600/10' },
  modelslab: { displayName: 'ModelsLab', category: 'Video/3D', color: 'from-pink-500/20 to-pink-600/10' },
  meshy: { displayName: 'Meshy AI', category: '3D', color: 'from-cyan-500/20 to-cyan-600/10' },
  elevenlabs: { displayName: 'ElevenLabs', category: 'TTS/Music', color: 'from-indigo-500/20 to-indigo-600/10' },
  deepl: { displayName: 'DeepL', category: 'Translation', color: 'from-teal-500/20 to-teal-600/10' },
  replicate: { displayName: 'Replicate', category: 'Fallback', color: 'from-gray-500/20 to-gray-600/10' },
  gcp: { displayName: 'GCP', category: 'Vision/STT', color: 'from-yellow-500/20 to-yellow-600/10' },
};

// Get providers for each chapter
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

export const ProviderAttribution: React.FC<ProviderAttributionProps> = ({
  chapterId,
  providers,
  isActive,
}) => {
  const product = CHAPTER_TO_PRODUCT[chapterId] || CHAPTER_TO_PRODUCT.opening;
  const chapterProviders = providers.length > 0 ? providers : CHAPTER_PROVIDERS[chapterId] || [];
  
  return (
    <div className="space-y-3">
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
            className={`bg-gradient-to-r from-${product.color}-500/30 to-${product.color}-600/20 border-${product.color}-500/40 text-${product.color}-200`}
          >
            <Wand2 className="w-3 h-3 mr-1" />
            Powered by {product.name}
          </Badge>
          <span className="text-xs text-white/50 hidden md:inline">
            {product.description}
          </span>
        </motion.div>
      </AnimatePresence>
      
      {/* Provider badges */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-1.5"
        >
          {chapterProviders.slice(0, 5).map((providerId, idx) => {
            const provider = PROVIDER_CONFIG[providerId.toLowerCase()] || {
              displayName: providerId,
              category: 'AI',
              color: 'from-gray-500/20 to-gray-600/10',
            };
            
            return (
              <motion.div
                key={providerId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Badge
                  variant="outline"
                  className={`bg-gradient-to-r ${provider.color} border-white/20 text-white/80 text-xs`}
                >
                  {provider.displayName}
                  <span className="text-white/40 ml-1 hidden sm:inline">
                    ({provider.category})
                  </span>
                </Badge>
              </motion.div>
            );
          })}
          
          {chapterProviders.length > 5 && (
            <Badge variant="outline" className="bg-white/5 border-white/20 text-white/60 text-xs">
              +{chapterProviders.length - 5} more
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ProviderAttribution;
