/**
 * AI Provider Selector Component - Dropdown Version
 * Compact dropdown for selecting AI provider with auto-select option
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  Brain,
  Cpu,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIProviderType = 'openai' | 'gemini' | 'claude' | 'huggingface' | 'auto';

export interface AIProvider {
  id: AIProviderType;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  bestFor: string[];
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'standard';
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'auto',
    name: 'Auto-Select (Recommended)',
    shortName: 'Auto',
    description: 'System chooses best AI for your content',
    icon: <Sparkles className="h-4 w-4" />,
    bestFor: ['All content types'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    shortName: 'OpenAI',
    description: 'Powerful reasoning and creativity',
    icon: <Sparkles className="h-4 w-4" />,
    bestFor: ['Complex scripts', 'Creative writing'],
    speed: 'medium',
    quality: 'high',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    shortName: 'Gemini',
    description: 'Fast multimodal understanding',
    icon: <Zap className="h-4 w-4" />,
    bestFor: ['Image analysis', 'Fast processing'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    shortName: 'Claude',
    description: 'Nuanced, thoughtful responses',
    icon: <Brain className="h-4 w-4" />,
    bestFor: ['Long documents', 'Technical writing'],
    speed: 'medium',
    quality: 'high',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    shortName: 'HuggingFace',
    description: 'Open models, specialized tasks',
    icon: <Cpu className="h-4 w-4" />,
    bestFor: ['Speech-to-text', 'Custom models'],
    speed: 'medium',
    quality: 'standard',
  },
];

interface AIProviderSelectorProps {
  selectedProvider: AIProviderType;
  onProviderChange: (provider: AIProviderType) => void;
  contentType?: 'document' | 'image' | 'audio' | 'video' | 'url' | 'text' | 'full-pipeline';
  className?: string;
  showLabel?: boolean;
}

export function AIProviderSelector({
  selectedProvider,
  onProviderChange,
  contentType,
  className,
  showLabel = true,
}: AIProviderSelectorProps) {
  // Get recommended provider based on content type
  const getRecommendedProvider = (type?: string): AIProviderType => {
    switch (type) {
      case 'image':
        return 'gemini';
      case 'audio':
        return 'huggingface';
      case 'video':
        return 'gemini';
      case 'document':
        return 'claude';
      case 'url':
        return 'gemini';
      case 'full-pipeline':
        return 'openai';
      default:
        return 'openai';
    }
  };

  const recommendedProvider = getRecommendedProvider(contentType);
  const selectedProviderData = AI_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <Label className="text-sm font-medium">AI Provider</Label>
      )}
      <Select value={selectedProvider} onValueChange={(v) => onProviderChange(v as AIProviderType)}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedProviderData?.icon}
              <span>{selectedProviderData?.name || 'Select Provider'}</span>
              {selectedProvider === 'auto' && (
                <Badge variant="secondary" className="text-[10px] ml-1">
                  <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                  Smart
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {AI_PROVIDERS.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex items-center gap-2 py-1">
                <div className="h-6 w-6 rounded flex items-center justify-center bg-secondary">
                  {provider.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{provider.name}</span>
                    {provider.id === recommendedProvider && provider.id !== 'auto' && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        Best for {contentType}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{provider.description}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedProvider !== 'auto' && selectedProvider !== recommendedProvider && contentType && (
        <p className="text-xs text-muted-foreground">
          💡 Tip: <strong>{AI_PROVIDERS.find(p => p.id === recommendedProvider)?.shortName}</strong> is recommended for {contentType} content
        </p>
      )}
    </div>
  );
}

export { AI_PROVIDERS };
