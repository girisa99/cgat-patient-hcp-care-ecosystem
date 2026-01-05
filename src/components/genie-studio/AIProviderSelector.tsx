/**
 * AI Provider Selector Component
 * Allows user to select AI provider or use auto-select
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  Brain,
  Cpu,
  Star,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIProviderType = 'openai' | 'gemini' | 'claude' | 'huggingface' | 'auto';

export interface AIProvider {
  id: AIProviderType;
  name: string;
  description: string;
  icon: React.ReactNode;
  bestFor: string[];
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'standard';
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    description: 'Powerful reasoning and creativity',
    icon: <Sparkles className="h-4 w-4" />,
    bestFor: ['Complex scripts', 'Creative writing', 'Detailed analysis'],
    speed: 'medium',
    quality: 'high',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Fast multimodal understanding',
    icon: <Zap className="h-4 w-4" />,
    bestFor: ['Image analysis', 'Fast processing', 'Multimodal content'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Nuanced, thoughtful responses',
    icon: <Brain className="h-4 w-4" />,
    bestFor: ['Long documents', 'Nuanced content', 'Technical writing'],
    speed: 'medium',
    quality: 'high',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Open models, specialized tasks',
    icon: <Cpu className="h-4 w-4" />,
    bestFor: ['Speech-to-text', 'Custom models', 'Experimental'],
    speed: 'medium',
    quality: 'standard',
  },
];

interface AIProviderSelectorProps {
  selectedProvider: AIProviderType;
  onProviderChange: (provider: AIProviderType) => void;
  autoSelect: boolean;
  onAutoSelectChange: (autoSelect: boolean) => void;
  contentType?: 'document' | 'image' | 'audio' | 'url' | 'text';
  className?: string;
  compact?: boolean;
}

export function AIProviderSelector({
  selectedProvider,
  onProviderChange,
  autoSelect,
  onAutoSelectChange,
  contentType,
  className,
  compact = false,
}: AIProviderSelectorProps) {
  // Auto-recommend provider based on content type
  const getRecommendedProvider = (type?: string): AIProviderType => {
    switch (type) {
      case 'image':
        return 'gemini'; // Best for vision
      case 'audio':
        return 'huggingface'; // Best for speech-to-text
      case 'document':
        return 'claude'; // Best for long documents
      case 'url':
        return 'gemini'; // Fast multimodal
      default:
        return 'openai'; // General purpose
    }
  };

  const recommendedProvider = getRecommendedProvider(contentType);

  const handleAutoSelectToggle = (checked: boolean) => {
    onAutoSelectChange(checked);
    if (checked) {
      onProviderChange('auto');
    } else {
      onProviderChange(recommendedProvider);
    }
  };

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">AI Provider</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-select</span>
            <Switch
              checked={autoSelect}
              onCheckedChange={handleAutoSelectToggle}
            />
          </div>
        </div>
        
        {!autoSelect && (
          <div className="flex flex-wrap gap-2">
            {AI_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => onProviderChange(provider.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all",
                  selectedProvider === provider.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {provider.icon}
                {provider.name.split(' ')[0]}
                {provider.id === recommendedProvider && (
                  <Star className="h-3 w-3 fill-current" />
                )}
              </button>
            ))}
          </div>
        )}
        
        {autoSelect && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span>System will choose the best provider for your content</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Auto-select toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Label className="text-sm font-medium cursor-pointer">Smart Auto-Select</Label>
            <p className="text-xs text-muted-foreground">
              Let the system choose the best AI for your content
            </p>
          </div>
        </div>
        <Switch
          checked={autoSelect}
          onCheckedChange={handleAutoSelectToggle}
        />
      </div>

      {/* Manual provider selection */}
      {!autoSelect && (
        <div className="space-y-3">
          <Label>Select AI Provider</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => onProviderChange(provider.id)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all relative",
                  selectedProvider === provider.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-secondary/30"
                )}
              >
                {provider.id === recommendedProvider && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2 text-[10px] px-1.5 py-0"
                  >
                    <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                    Best for {contentType || 'this'}
                  </Badge>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    selectedProvider === provider.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary"
                  )}>
                    {provider.icon}
                  </div>
                  <span className="font-medium text-sm">{provider.name}</span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {provider.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {provider.speed === 'fast' ? '⚡ Fast' : provider.speed === 'medium' ? '🔄 Medium' : '🐢 Slow'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {provider.quality === 'high' ? '✨ High Quality' : provider.quality === 'medium' ? '👍 Good' : '📊 Standard'}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { AI_PROVIDERS };
