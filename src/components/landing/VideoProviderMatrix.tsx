/**
 * VIDEO PROVIDER MATRIX COMPONENT
 * 
 * Displays the full 12-provider AI matrix powering the video
 * Shows which provider is active for each capability
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Mic, Video, Box, Languages, 
  Palette, Music, Wand2, Globe, Zap
} from 'lucide-react';

interface VideoProviderMatrixProps {
  activeProviders?: string[];
  currentCapability?: string;
  compact?: boolean;
  className?: string;
}

// Full 12-provider matrix with capabilities
const PROVIDER_MATRIX = {
  // LLM Providers
  'Claude': { 
    icon: Brain, 
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    capabilities: ['llm', 'script', 'translation'],
  },
  'GPT-4o': { 
    icon: Brain, 
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    capabilities: ['llm', 'vision', 'script'],
  },
  'Gemini': { 
    icon: Brain, 
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    capabilities: ['llm', 'vision', 'translation'],
  },
  'DeepSeek': { 
    icon: Brain, 
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    capabilities: ['llm', 'cjk'],
  },
  
  // Voice Providers
  'ElevenLabs': { 
    icon: Mic, 
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    capabilities: ['tts', 'voice_clone', 'music'],
  },
  'Azure Neural': { 
    icon: Mic, 
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    capabilities: ['tts', 'stt', 'visemes'],
  },
  'Alibaba': { 
    icon: Globe, 
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    capabilities: ['tts', 'avatar', 'video', 'cjk'],
  },
  
  // Visual Providers
  'ModelsLab': { 
    icon: Video, 
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    capabilities: ['image', 'video', '3d', 'animation'],
  },
  'Meshy AI': { 
    icon: Box, 
    color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    capabilities: ['3d', 'texturing'],
  },
  
  // Translation
  'DeepL': { 
    icon: Languages, 
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    capabilities: ['translation', 'european'],
  },
  
  // Infrastructure
  'GCP': { 
    icon: Globe, 
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
    capabilities: ['vision', 'ocr', 'oauth'],
  },
  'Replicate': { 
    icon: Wand2, 
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    capabilities: ['fallback', 'opensource'],
  },
};

// Genie products that power different parts
const GENIE_PRODUCTS = {
  'Spark': { color: 'text-yellow-400', capabilities: ['script', 'ideation'] },
  'Mind': { color: 'text-purple-400', capabilities: ['enhancement', 'tts'] },
  'Vibe': { color: 'text-pink-400', capabilities: ['video', 'audio', 'animation'] },
  'Deck': { color: 'text-blue-400', capabilities: ['slides', 'charts'] },
  'Arc': { color: 'text-green-400', capabilities: ['scheduling', 'workflow'] },
  'Cast': { color: 'text-violet-400', capabilities: ['distribution', 'localization'] },
};

export const VideoProviderMatrix: React.FC<VideoProviderMatrixProps> = ({
  activeProviders = [],
  currentCapability,
  compact = false,
  className = '',
}) => {
  const providers = Object.entries(PROVIDER_MATRIX);
  
  if (compact) {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {providers.slice(0, 6).map(([name, config]) => {
          const Icon = config.icon;
          const isActive = activeProviders.includes(name);
          
          return (
            <motion.div
              key={name}
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Badge 
                className={`text-xs ${config.color} ${isActive ? 'ring-1 ring-white/30' : 'opacity-50'}`}
              >
                <Icon className="w-3 h-3 mr-1" />
                {name}
              </Badge>
            </motion.div>
          );
        })}
        {providers.length > 6 && (
          <Badge className="bg-white/10 text-white/60 text-xs">
            +{providers.length - 6} more
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <div className={`${className}`}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-white/80">Powered by 15 AI Providers</span>
      </div>
      
      {/* Provider grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {providers.map(([name, config]) => {
          const Icon = config.icon;
          const isActive = activeProviders.includes(name) || 
            (currentCapability && config.capabilities.includes(currentCapability));
          
          return (
            <motion.div
              key={name}
              className={`relative p-2 rounded-lg border ${
                isActive 
                  ? 'bg-white/10 border-white/30' 
                  : 'bg-black/20 border-white/10 opacity-60'
              }`}
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-white/50'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/50'}`}>
                  {name}
                </span>
              </div>
              
              {isActive && (
                <motion.div
                  className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Genie product attribution */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white/60">Orchestrated by</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GENIE_PRODUCTS).map(([name, config]) => (
            <Badge 
              key={name}
              variant="outline" 
              className={`bg-black/30 border-white/20 ${config.color} text-xs`}
            >
              Genie {name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoProviderMatrix;
