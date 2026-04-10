import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Image as ImageIcon, Palette, Video, Film } from 'lucide-react';

export type ImageModelType =
  | 'auto'
  | 'gemini-nano-banana'
  | 'gemini-3-pro-image'
  | 'gpt-image-1'
  | 'claude-image'
  | 'flux-schnell'
  | 'flux-dev'
  | 'stable-diffusion-xl'
  | 'midjourney-style';

export type VideoModelType =
  | 'auto'
  | 'runway-gen3'
  | 'pika-labs'
  | 'sora-preview'
  | 'luma-dream-machine'
  | 'kling-ai';

interface ImageModel {
  id: ImageModelType;
  name: string;
  provider: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'premium';
  icon: React.ReactNode;
}

interface VideoModel {
  id: VideoModelType;
  name: string;
  provider: string;
  description: string;
  duration: 'short' | 'medium' | 'long';
  quality: 'standard' | 'high' | 'premium';
  icon: React.ReactNode;
}

const IMAGE_MODELS: ImageModel[] = [
  {
    id: 'auto',
    name: 'Auto Select',
    provider: 'Universal AI',
    description: 'Automatically selects the best model based on your content',
    speed: 'fast',
    quality: 'high',
    icon: <Sparkles className="h-4 w-4 text-primary" />
  },
  {
    id: 'gemini-nano-banana',
    name: 'Gemini Nano Banana',
    provider: 'Google',
    description: 'Fast image generation with Gemini 2.5 Flash',
    speed: 'fast',
    quality: 'high',
    icon: <Zap className="h-4 w-4 text-yellow-500" />
  },
  {
    id: 'gemini-3-pro-image',
    name: 'Gemini 3 Pro Image',
    provider: 'Google',
    description: 'Next-gen image generation with superior quality',
    speed: 'medium',
    quality: 'premium',
    icon: <Sparkles className="h-4 w-4 text-blue-500" />
  },
  {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    provider: 'OpenAI',
    description: 'Latest OpenAI model with detailed control',
    speed: 'medium',
    quality: 'premium',
    icon: <ImageIcon className="h-4 w-4 text-emerald-500" />
  },
  {
    id: 'claude-image',
    name: 'Claude Vision Create',
    provider: 'Anthropic',
    description: 'Claude-powered image creation with contextual understanding',
    speed: 'medium',
    quality: 'high',
    icon: <Sparkles className="h-4 w-4 text-orange-500" />
  },
  {
    id: 'flux-schnell',
    name: 'FLUX.1 Schnell',
    provider: 'Black Forest Labs',
    description: 'Ultra-fast generation with excellent quality',
    speed: 'fast',
    quality: 'high',
    icon: <Zap className="h-4 w-4 text-orange-500" />
  },
  {
    id: 'flux-dev',
    name: 'FLUX.1 Dev',
    provider: 'Black Forest Labs',
    description: 'Developer-focused with fine-grained control',
    speed: 'slow',
    quality: 'premium',
    icon: <Sparkles className="h-4 w-4 text-purple-500" />
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    description: 'Open-source powerhouse for diverse styles',
    speed: 'medium',
    quality: 'high',
    icon: <Palette className="h-4 w-4 text-pink-500" />
  },
  {
    id: 'midjourney-style',
    name: 'Midjourney Style',
    provider: 'Replicate',
    description: 'Artistic style inspired by Midjourney aesthetics',
    speed: 'slow',
    quality: 'premium',
    icon: <Sparkles className="h-4 w-4 text-indigo-500" />
  }
];

const VIDEO_MODELS: VideoModel[] = [
  {
    id: 'auto',
    name: 'Auto Select',
    provider: 'Universal AI',
    description: 'Automatically selects the best video model',
    duration: 'medium',
    quality: 'high',
    icon: <Video className="h-4 w-4 text-primary" />
  },
  {
    id: 'runway-gen3',
    name: 'Runway Gen-3',
    provider: 'Runway',
    description: 'State-of-the-art video generation with cinematic quality',
    duration: 'short',
    quality: 'premium',
    icon: <Film className="h-4 w-4 text-purple-500" />
  },
  {
    id: 'pika-labs',
    name: 'Pika Labs',
    provider: 'Pika',
    description: 'Fast, creative video generation with style control',
    duration: 'short',
    quality: 'high',
    icon: <Video className="h-4 w-4 text-blue-500" />
  },
  {
    id: 'sora-preview',
    name: 'Sora Preview',
    provider: 'OpenAI',
    description: 'Next-gen video model (preview access)',
    duration: 'long',
    quality: 'premium',
    icon: <Sparkles className="h-4 w-4 text-emerald-500" />
  },
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    provider: 'Luma AI',
    description: 'High-quality video with realistic motion',
    duration: 'medium',
    quality: 'premium',
    icon: <Film className="h-4 w-4 text-amber-500" />
  },
  {
    id: 'kling-ai',
    name: 'Kling AI',
    provider: 'Kuaishou',
    description: 'Long-form video generation with consistency',
    duration: 'long',
    quality: 'high',
    icon: <Video className="h-4 w-4 text-red-500" />
  }
];

interface ImageModelSelectorProps {
  selectedModel: ImageModelType;
  onModelChange: (model: ImageModelType) => void;
  showLabel?: boolean;
  compact?: boolean;
}

const getSpeedColor = (speed: string) => {
  switch (speed) {
    case 'fast': return 'bg-green-500/20 text-green-600';
    case 'medium': return 'bg-yellow-500/20 text-yellow-600';
    case 'slow': return 'bg-orange-500/20 text-orange-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'standard': return 'bg-blue-500/20 text-blue-600';
    case 'high': return 'bg-purple-500/20 text-purple-600';
    case 'premium': return 'bg-amber-500/20 text-amber-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const ImageModelSelector: React.FC<ImageModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  showLabel = true,
  compact = false
}) => {
  const currentModel = IMAGE_MODELS.find(m => m.id === selectedModel) || IMAGE_MODELS[0];

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <ImageIcon className="h-3 w-3" />
          Image Generation Model
        </Label>
      )}
      <Select value={selectedModel} onValueChange={(value) => onModelChange(value as ImageModelType)}>
        <SelectTrigger className={compact ? "h-9" : ""}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {currentModel.icon}
              <span className="truncate">{currentModel.name}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {currentModel.provider}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {IMAGE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-center gap-2">
                  {model.icon}
                  <span className="font-medium">{model.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {model.provider}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {model.description}
                </p>
                <div className="flex gap-2 pl-6">
                  <Badge className={`text-[10px] px-1.5 py-0 ${getSpeedColor(model.speed)}`}>
                    {model.speed}
                  </Badge>
                  <Badge className={`text-[10px] px-1.5 py-0 ${getQualityColor(model.quality)}`}>
                    {model.quality}
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Video Model Selector Component
interface VideoModelSelectorProps {
  selectedModel: VideoModelType;
  onModelChange: (model: VideoModelType) => void;
  showLabel?: boolean;
  compact?: boolean;
}

const getDurationColor = (duration: string) => {
  switch (duration) {
    case 'short': return 'bg-green-500/20 text-green-600';
    case 'medium': return 'bg-yellow-500/20 text-yellow-600';
    case 'long': return 'bg-blue-500/20 text-blue-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const VideoModelSelector: React.FC<VideoModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  showLabel = true,
  compact = false
}) => {
  const currentModel = VIDEO_MODELS.find(m => m.id === selectedModel) || VIDEO_MODELS[0];

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <Video className="h-3 w-3" />
          Video Generation Model
        </Label>
      )}
      <Select value={selectedModel} onValueChange={(value) => onModelChange(value as VideoModelType)}>
        <SelectTrigger className={compact ? "h-9" : ""}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {currentModel.icon}
              <span className="truncate">{currentModel.name}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {currentModel.provider}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {VIDEO_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-center gap-2">
                  {model.icon}
                  <span className="font-medium">{model.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {model.provider}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {model.description}
                </p>
                <div className="flex gap-2 pl-6">
                  <Badge className={`text-[10px] px-1.5 py-0 ${getDurationColor(model.duration)}`}>
                    {model.duration}
                  </Badge>
                  <Badge className={`text-[10px] px-1.5 py-0 ${getQualityColor(model.quality)}`}>
                    {model.quality}
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { IMAGE_MODELS, VIDEO_MODELS };
