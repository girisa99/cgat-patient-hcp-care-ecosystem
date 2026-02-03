/**
 * AI PROVIDER SHOWCASE - COMPACT
 * 
 * Compact display of integrated AI models with scrolling marquee
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
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
}

// Only actually integrated providers - 30 models
const AI_PROVIDERS: AIProvider[] = [
  // VIDEO GENERATION (7)
  { name: 'Vertex Veo 3', category: 'video' },
  { name: 'Sora2API', category: 'video' },
  { name: 'Alibaba Wan 2.6', category: 'video' },
  { name: 'Alibaba Wan 2.2', category: 'video' },
  { name: 'ModelsLab', category: 'video' },
  { name: 'Replicate SVD', category: 'video' },
  { name: 'Gemini Video', category: 'video' },
  
  // AVATAR (4)
  { name: 'Wan2.2 Avatar', category: 'video' },
  { name: 'OmniAvatar', category: 'video' },
  { name: 'TaoAvatar', category: 'video' },
  { name: 'MACH Avatar', category: 'video' },
  
  // LLM (5)
  { name: 'Claude 3.5', category: 'llm' },
  { name: 'GPT-4o', category: 'llm' },
  { name: 'Gemini 2.0', category: 'llm' },
  { name: 'Qwen 2.5', category: 'llm' },
  { name: 'DeepSeek V3', category: 'llm' },
  
  // TTS (6)
  { name: 'ElevenLabs', category: 'tts' },
  { name: 'Azure Neural', category: 'tts' },
  { name: 'CosyVoice', category: 'tts' },
  { name: 'Google TTS', category: 'tts' },
  { name: 'OpenAI TTS', category: 'tts' },
  { name: 'Amazon Polly', category: 'tts' },
  
  // 3D (4)
  { name: 'Meshy AI', category: '3d' },
  { name: 'Alibaba 3D', category: '3d' },
  { name: 'Richdreamer', category: '3d' },
  { name: 'ModelsLab 3D', category: '3d' },
  
  // IMAGE (4)
  { name: 'FLUX Pro', category: 'image' },
  { name: 'SDXL', category: 'image' },
  { name: 'Imagen 3', category: 'image' },
  { name: 'ModelsLab Image', category: 'image' },
];

const getCategoryColor = (category: AIProvider['category']) => {
  switch (category) {
    case 'video': return 'text-blue-600 bg-blue-500/10';
    case 'llm': return 'text-amber-600 bg-amber-500/10';
    case 'tts': return 'text-green-600 bg-green-500/10';
    case '3d': return 'text-purple-600 bg-purple-500/10';
    case 'image': return 'text-pink-600 bg-pink-500/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

interface AIProviderShowcaseProps {
  className?: string;
}

export const AIProviderShowcase: React.FC<AIProviderShowcaseProps> = ({ className }) => {
  const doubledProviders = [...AI_PROVIDERS, ...AI_PROVIDERS];
  
  return (
    <div className={cn("space-y-2 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{AI_PROVIDERS.length} AI Models</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
            <Video className="w-2.5 h-2.5" />11
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
            <Brain className="w-2.5 h-2.5" />5
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
            <Mic className="w-2.5 h-2.5" />6
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
            <Box className="w-2.5 h-2.5" />4
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
            <Wand2 className="w-2.5 h-2.5" />4
          </Badge>
        </div>
      </div>
      
      {/* Scrolling Marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
        
        <motion.div
          className="flex gap-2 py-1"
          animate={{ x: [0, -40 * AI_PROVIDERS.length] }}
          transition={{
            x: {
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {doubledProviders.map((provider, index) => (
            <span
              key={`${provider.name}-${index}`}
              className={cn(
                "flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap",
                getCategoryColor(provider.category)
              )}
            >
              {provider.name}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AIProviderShowcase;

/**
 * INTEGRATED PROVIDERS LIST (for reference):
 * 
 * === VIDEO GENERATION (11) ===
 * 1. Google Vertex Veo 3 - Primary cinematic video
 * 2. Sora2API - High-fidelity video
 * 3. Alibaba Wan 2.6 - Fast video generation
 * 4. Alibaba Wan 2.2 - Avatar/lip-sync video
 * 5. ModelsLab AnimateDiff - Anime/stylized video
 * 6. Replicate SVD - Stable video diffusion
 * 7. Gemini Video - Google video generation
 * 8. Alibaba Wan2.2 Avatar - Photorealistic avatars
 * 9. Alibaba OmniAvatar - Full-body avatars
 * 10. Alibaba TaoAvatar - 3DGS/AR avatars
 * 11. Alibaba MACH - Character avatars
 * 
 * === LLM (5) ===
 * 12. Claude 3.5 Sonnet - Primary reasoning
 * 13. GPT-4o - OpenAI multimodal
 * 14. Gemini 2.0 Flash - Google fast LLM
 * 15. Qwen 2.5 Max - Alibaba LLM
 * 16. DeepSeek V3 - Chinese LLM
 * 
 * === TTS & VOICE (6) ===
 * 17. ElevenLabs - Premium voice synthesis
 * 18. Azure Neural TTS - Microsoft neural voices
 * 19. CosyVoice - Alibaba multilingual TTS
 * 20. Google Cloud TTS - Google neural voices
 * 21. OpenAI TTS - OpenAI voice synthesis
 * 22. Amazon Polly - AWS neural voices
 * 
 * === 3D GENERATION (4) ===
 * 23. Meshy AI - Text/image to 3D
 * 24. Alibaba 3D Suite - Full 3D pipeline
 * 25. Alibaba Richdreamer - High-fidelity 3D
 * 26. ModelsLab 3D - Fast 3D generation
 * 
 * === IMAGE GENERATION (4) ===
 * 27. FLUX Pro - High-quality image gen
 * 28. SDXL - Stable Diffusion XL
 * 29. Gemini Imagen 3 - Google image gen
 * 30. ModelsLab Image - Fast image generation
 */
