/**
 * AI Provider Selector Component - Dropdown Version
 * Compact dropdown for selecting AI provider with context & region-aware auto-select
 * 
 * FIXED: Auto AI now uses 4-Zone LLM Routing instead of hardcoded defaults
 * - Claude Zone: US, UK, EU, Brazil
 * - Alibaba Zone: CJK, Arabic
 * - Gemini Zone: India, SEA, Africa
 * - Fallback: GPT-4o
 */

import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  Brain,
  Cpu,
  Star,
  Globe,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegionalLanguage } from '@/hooks/useRegionalLanguage';

export type AIProviderType = 'openai' | 'gemini' | 'claude' | 'huggingface' | 'alibaba' | 'deepseek' | 'auto';

export interface AIProvider {
  id: AIProviderType;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  bestFor: string[];
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'standard';
  regions?: string[]; // Which regions this provider excels in
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'auto',
    name: 'Auto AI (Region & Context-Aware)',
    shortName: 'Auto',
    description: 'Best model based on your region, language & content',
    icon: <Globe className="h-4 w-4" />,
    bestFor: ['All content types', 'Regional optimization'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    shortName: 'Claude',
    description: 'Best for US, UK, EU, Brazil',
    icon: <Brain className="h-4 w-4" />,
    bestFor: ['Healthcare', 'Legal', 'Long documents'],
    speed: 'medium',
    quality: 'high',
    regions: ['en', 'de', 'fr', 'es', 'it', 'pt-BR', 'nl', 'pl', 'ru', 'he'],
  },
  {
    id: 'alibaba',
    name: 'Alibaba Qwen',
    shortName: 'Qwen',
    description: 'Best for CJK & Arabic languages',
    icon: <MapPin className="h-4 w-4" />,
    bestFor: ['Chinese', 'Japanese', 'Korean', 'Arabic'],
    speed: 'fast',
    quality: 'high',
    regions: ['zh-CN', 'zh-TW', 'ja', 'ko', 'ar', 'ar-SA', 'ar-EG'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    shortName: 'Gemini',
    description: 'Best for India, SEA, Africa',
    icon: <Zap className="h-4 w-4" />,
    bestFor: ['Hindi', 'Tamil', 'SEA languages', 'African languages'],
    speed: 'fast',
    quality: 'high',
    regions: ['hi', 'bn', 'te', 'ta', 'id', 'vi', 'th', 'sw', 'yo'],
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    shortName: 'OpenAI',
    description: 'Universal fallback, strong reasoning',
    icon: <Sparkles className="h-4 w-4" />,
    bestFor: ['Complex scripts', 'Creative writing', 'Structured output'],
    speed: 'medium',
    quality: 'high',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V3',
    shortName: 'DeepSeek',
    description: 'Cost-efficient, great for coding & tech',
    icon: <Cpu className="h-4 w-4" />,
    bestFor: ['Tech startups', 'Coding', 'Cost-sensitive'],
    speed: 'fast',
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
  contentType?: 'document' | 'image' | 'audio' | 'video' | 'url' | 'text' | 'presentation' | 'full-pipeline';
  className?: string;
  showLabel?: boolean;
  showRegionalContext?: boolean;
}

export function AIProviderSelector({
  selectedProvider,
  onProviderChange,
  contentType,
  className,
  showLabel = true,
  showRegionalContext = true,
}: AIProviderSelectorProps) {
  // Get regional routing info
  const { 
    llmZone, 
    llmProvider, 
    primaryLanguage, 
    currentBundle 
  } = useRegionalLanguage();
  
  // Get recommended provider based on REGION + CONTEXT (not just content type)
  const getRecommendedProvider = useMemo(() => {
    // 4-Zone LLM Routing Strategy
    switch (llmZone) {
      case 'claude':
        return 'claude';
      case 'alibaba':
        return 'alibaba';
      case 'gemini':
        return 'gemini';
      case 'fallback':
      default:
        // Context-based fallback when zone is generic
        switch (contentType) {
          case 'audio':
            return 'huggingface'; // Best STT
          case 'image':
          case 'video':
            return 'gemini'; // Multimodal
          case 'document':
            return 'claude'; // Long context
          case 'presentation':
          case 'full-pipeline':
            return 'openai'; // Structured output
          default:
            return 'openai';
        }
    }
  }, [llmZone, contentType]);

  // Map Auto to the actual regional provider for display
  const resolvedProvider = selectedProvider === 'auto' ? getRecommendedProvider : selectedProvider;
  const selectedProviderData = AI_PROVIDERS.find(p => p.id === selectedProvider);
  const resolvedProviderData = AI_PROVIDERS.find(p => p.id === resolvedProvider);

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">AI Provider</Label>
          {showRegionalContext && selectedProvider === 'auto' && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <MapPin className="h-2.5 w-2.5" />
              {currentBundle?.name || 'Auto'} → {resolvedProviderData?.shortName}
            </Badge>
          )}
        </div>
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
                  {llmZone !== 'fallback' ? llmZone.toUpperCase() : 'Smart'}
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {AI_PROVIDERS.map((provider) => {
            const isRegionalMatch = provider.regions?.some(r => 
              primaryLanguage?.code?.startsWith(r) || r === primaryLanguage?.code
            );
            
            return (
              <SelectItem key={provider.id} value={provider.id}>
                <div className="flex items-center gap-2 py-1">
                  <div className="h-6 w-6 rounded flex items-center justify-center bg-secondary">
                    {provider.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{provider.name}</span>
                      {provider.id === 'auto' && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 bg-primary/5">
                          Recommended
                        </Badge>
                      )}
                      {provider.id !== 'auto' && isRegionalMatch && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 bg-green-500/10 text-green-600">
                          Your Region
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {selectedProvider === 'auto' && showRegionalContext && (
        <p className="text-xs text-muted-foreground">
          🌐 Using <strong>{resolvedProviderData?.shortName}</strong> based on {currentBundle?.name || 'detected'} region ({llmZone} zone)
        </p>
      )}
      
      {selectedProvider !== 'auto' && selectedProvider !== getRecommendedProvider && (
        <p className="text-xs text-amber-600">
          💡 Tip: <strong>Auto AI</strong> would use <strong>{AI_PROVIDERS.find(p => p.id === getRecommendedProvider)?.shortName}</strong> for your region
        </p>
      )}
    </div>
  );
}

export { AI_PROVIDERS };
