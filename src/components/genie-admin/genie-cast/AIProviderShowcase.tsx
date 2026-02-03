/**
 * AI PROVIDER SHOWCASE
 * 
 * Atlabs-inspired animated showcase of 50+ AI models:
 * - Scrolling logo marquee
 * - Provider badges
 * - Unified subscription messaging
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Cpu,
  Mic,
  Video,
  Box,
  Brain,
  Wand2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIProvider {
  name: string;
  category: 'video' | 'llm' | 'tts' | '3d' | 'image';
  color: string;
  icon?: React.ElementType;
}

const AI_PROVIDERS: AIProvider[] = [
  // Video
  { name: 'Alibaba Wan2.2', category: 'video', color: '#FF6A00' },
  { name: 'Kling AI', category: 'video', color: '#7C3AED' },
  { name: 'Runway Gen-3', category: 'video', color: '#3B82F6' },
  { name: 'Minimax', category: 'video', color: '#EC4899' },
  { name: 'Stable Video', category: 'video', color: '#8B5CF6' },
  { name: 'ByteDance', category: 'video', color: '#000000' },
  { name: 'ModelsLab', category: 'video', color: '#10B981' },
  { name: 'Google Veo', category: 'video', color: '#4285F4' },
  
  // LLM
  { name: 'Claude 3.5', category: 'llm', color: '#D97706' },
  { name: 'GPT-4o', category: 'llm', color: '#10A37F' },
  { name: 'Gemini Pro', category: 'llm', color: '#4285F4' },
  { name: 'Qwen 2.5', category: 'llm', color: '#FF6A00' },
  { name: 'DeepSeek', category: 'llm', color: '#1E40AF' },
  
  // TTS
  { name: 'ElevenLabs', category: 'tts', color: '#000000' },
  { name: 'Azure Neural', category: 'tts', color: '#0078D4' },
  { name: 'CosyVoice', category: 'tts', color: '#FF6A00' },
  { name: 'Google TTS', category: 'tts', color: '#4285F4' },
  
  // 3D
  { name: 'Meshy AI', category: '3d', color: '#7C3AED' },
  { name: 'Alibaba 3D', category: '3d', color: '#FF6A00' },
  { name: 'ModelsLab 3D', category: '3d', color: '#10B981' },
  
  // Image
  { name: 'FLUX', category: 'image', color: '#000000' },
  { name: 'SDXL', category: 'image', color: '#8B5CF6' },
  { name: 'Midjourney', category: 'image', color: '#FFFFFF' },
  { name: 'DALL-E 3', category: 'image', color: '#10A37F' },
];

const getCategoryIcon = (category: AIProvider['category']) => {
  switch (category) {
    case 'video': return Video;
    case 'llm': return Brain;
    case 'tts': return Mic;
    case '3d': return Box;
    case 'image': return Wand2;
    default: return Cpu;
  }
};

interface AIProviderShowcaseProps {
  className?: string;
}

export const AIProviderShowcase: React.FC<AIProviderShowcaseProps> = ({ className }) => {
  // Double the providers for seamless loop
  const doubledProviders = [...AI_PROVIDERS, ...AI_PROVIDERS];
  
  return (
    <div className={cn("space-y-4 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">50+ AI Models in One Platform</h3>
      </div>
      
      {/* Scrolling Marquee - Row 1 */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
        
        <motion.div
          className="flex gap-4 py-2"
          animate={{ x: [0, -50 * AI_PROVIDERS.length] }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {doubledProviders.map((provider, index) => {
            const Icon = getCategoryIcon(provider.category);
            return (
              <div
                key={`${provider.name}-${index}`}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-card border border-border hover:border-primary/30 transition-colors",
                  "shadow-sm hover:shadow-md"
                )}
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${provider.color}20` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: provider.color === '#FFFFFF' ? '#000' : provider.color }} />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{provider.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
      
      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/30">
          <Video className="w-3 h-3" />
          Video Gen
        </Badge>
        <Badge variant="outline" className="gap-1.5 bg-accent/10 text-accent border-accent/30">
          <Brain className="w-3 h-3" />
          LLMs
        </Badge>
        <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/30">
          <Mic className="w-3 h-3" />
          Voice & TTS
        </Badge>
        <Badge variant="outline" className="gap-1.5 bg-accent/10 text-accent border-accent/30">
          <Box className="w-3 h-3" />
          3D Models
        </Badge>
        <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/30">
          <Wand2 className="w-3 h-3" />
          Image Gen
        </Badge>
      </div>
    </div>
  );
};

export default AIProviderShowcase;
