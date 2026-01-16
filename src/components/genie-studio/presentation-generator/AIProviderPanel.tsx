/**
 * AI Provider Panel - Universal AI provider selection with recommendations
 * Shows available providers and recommends based on topic/content
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Sparkles,
  Zap,
  Clock,
  DollarSign,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsUp,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface AIProvider {
  id: string;
  name: string;
  shortName: string;
  models: AIModel[];
  icon: React.ReactNode;
  color: string;
  strengths: string[];
  bestFor: string[];
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'premium';
  cost: 'low' | 'medium' | 'high';
  capabilities: string[];
  recommendedFor: string[];
}

export interface AIRecommendation {
  providerId: string;
  modelId: string;
  score: number;
  reason: string;
  matchedCriteria: string[];
}

interface AIProviderPanelProps {
  content?: string;
  collateralType?: string;
  targetAudience?: string;
  selectedProvider?: string;
  selectedModel?: string;
  onProviderChange: (providerId: string, modelId: string) => void;
  className?: string;
}

// Available AI Providers
const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'google',
    name: 'Google AI (Gemini)',
    shortName: 'Gemini',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-blue-500',
    strengths: ['Multimodal', 'Fast', 'Context Window'],
    bestFor: ['presentations', 'creative', 'technical'],
    models: [
      {
        id: 'google/gemini-3-flash-preview',
        name: 'Gemini 3 Flash (Preview)',
        description: 'Fast next-gen model, balanced speed and capability',
        speed: 'fast',
        quality: 'high',
        cost: 'low',
        capabilities: ['text', 'image-analysis', 'reasoning'],
        recommendedFor: ['general', 'presentations', 'quick-generation']
      },
      {
        id: 'google/gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Top-tier for complex reasoning and large context',
        speed: 'medium',
        quality: 'premium',
        cost: 'medium',
        capabilities: ['text', 'image-analysis', 'complex-reasoning', 'large-context'],
        recommendedFor: ['investor', 'whitepaper', 'research', 'technical']
      },
      {
        id: 'google/gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Balanced cost and quality for most tasks',
        speed: 'fast',
        quality: 'high',
        cost: 'low',
        capabilities: ['text', 'image-analysis', 'reasoning'],
        recommendedFor: ['marketing', 'sales', 'training']
      },
      {
        id: 'google/gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: 'Fastest and most cost-effective',
        speed: 'fast',
        quality: 'standard',
        cost: 'low',
        capabilities: ['text', 'classification', 'summarization'],
        recommendedFor: ['simple', 'high-volume', 'quick-draft']
      }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    shortName: 'GPT',
    icon: <Brain className="h-4 w-4" />,
    color: 'text-green-500',
    strengths: ['Accuracy', 'Nuance', 'Reasoning'],
    bestFor: ['investor', 'whitepaper', 'professional'],
    models: [
      {
        id: 'openai/gpt-5',
        name: 'GPT-5',
        description: 'Most powerful, excellent reasoning and multimodal',
        speed: 'medium',
        quality: 'premium',
        cost: 'high',
        capabilities: ['text', 'image-analysis', 'complex-reasoning', 'multimodal'],
        recommendedFor: ['investor', 'whitepaper', 'case-study', 'professional']
      },
      {
        id: 'openai/gpt-5-mini',
        name: 'GPT-5 Mini',
        description: 'Lower cost with strong reasoning capabilities',
        speed: 'fast',
        quality: 'high',
        cost: 'medium',
        capabilities: ['text', 'reasoning', 'multimodal'],
        recommendedFor: ['presentations', 'marketing', 'training']
      },
      {
        id: 'openai/gpt-5-nano',
        name: 'GPT-5 Nano',
        description: 'Speed and cost optimized for simple tasks',
        speed: 'fast',
        quality: 'standard',
        cost: 'low',
        capabilities: ['text', 'classification'],
        recommendedFor: ['simple', 'high-volume', 'draft']
      },
      {
        id: 'openai/gpt-5.2',
        name: 'GPT-5.2',
        description: 'Latest with enhanced reasoning capabilities',
        speed: 'medium',
        quality: 'premium',
        cost: 'high',
        capabilities: ['text', 'complex-reasoning', 'problem-solving'],
        recommendedFor: ['research', 'technical', 'analysis']
      }
    ]
  }
];

// Image Generation Providers
const IMAGE_PROVIDERS: AIProvider[] = [
  {
    id: 'google-image',
    name: 'Google Gemini Image',
    shortName: 'Gemini Img',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-blue-500',
    strengths: ['Fast', 'Consistent', 'Text-aware'],
    bestFor: ['presentations', 'infographics'],
    models: [
      {
        id: 'google/gemini-3-pro-image-preview',
        name: 'Gemini 3 Pro Image (Preview)',
        description: 'Next-gen image generation',
        speed: 'medium',
        quality: 'premium',
        cost: 'medium',
        capabilities: ['text-to-image', 'style-control'],
        recommendedFor: ['marketing', 'conference', 'product-launch']
      },
      {
        id: 'google/gemini-2.5-flash-image',
        name: 'Gemini 2.5 Flash Image',
        description: 'Fast image generation',
        speed: 'fast',
        quality: 'high',
        cost: 'low',
        capabilities: ['text-to-image'],
        recommendedFor: ['presentations', 'quick-visuals']
      }
    ]
  }
];

export function AIProviderPanel({
  content = '',
  collateralType = 'presentation',
  targetAudience = '',
  selectedProvider = 'google',
  selectedModel = 'google/gemini-3-flash-preview',
  onProviderChange,
  className
}: AIProviderPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [showImageProviders, setShowImageProviders] = useState(false);

  // Calculate recommendations based on content and collateral type
  const calculateRecommendations = useCallback(() => {
    const contentLower = content.toLowerCase();
    const allModels = AI_PROVIDERS.flatMap(p => 
      p.models.map(m => ({ ...m, providerId: p.id }))
    );

    const scored = allModels.map(model => {
      let score = 0;
      const matchedCriteria: string[] = [];

      // Check if model is recommended for this collateral type
      if (model.recommendedFor.includes(collateralType)) {
        score += 30;
        matchedCriteria.push(`Best for ${collateralType}`);
      }

      // Content length analysis
      if (content.length > 3000 && model.capabilities.includes('large-context')) {
        score += 20;
        matchedCriteria.push('Large content support');
      }

      // Technical content
      const technicalWords = ['architecture', 'api', 'system', 'integration', 'platform'];
      if (technicalWords.some(w => contentLower.includes(w)) && model.capabilities.includes('complex-reasoning')) {
        score += 15;
        matchedCriteria.push('Technical analysis');
      }

      // Research/data content
      const researchWords = ['research', 'study', 'data', 'statistics', 'analysis'];
      if (researchWords.some(w => contentLower.includes(w)) && model.quality === 'premium') {
        score += 15;
        matchedCriteria.push('Research quality');
      }

      // Speed requirement for quick drafts
      if (content.length < 500 && model.speed === 'fast') {
        score += 10;
        matchedCriteria.push('Quick generation');
      }

      // Cost consideration
      if (model.cost === 'low') score += 5;

      return {
        providerId: model.providerId,
        modelId: model.id,
        score,
        reason: matchedCriteria.join(', ') || 'General purpose',
        matchedCriteria
      };
    });

    scored.sort((a, b) => b.score - a.score);
    setRecommendations(scored.slice(0, 4));
  }, [content, collateralType]);

  useEffect(() => {
    calculateRecommendations();
  }, [calculateRecommendations]);

  const getSelectedProvider = () => AI_PROVIDERS.find(p => p.id === selectedProvider);
  const getSelectedModel = () => 
    AI_PROVIDERS.flatMap(p => p.models).find(m => m.id === selectedModel);

  const topRecommendation = recommendations[0];
  const selectedModelInfo = getSelectedModel();

  return (
    <Card className={cn("border-primary/20", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="p-3 pb-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <p className="text-xs font-medium">Universal AI Provider</p>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedModelInfo?.name || 'Select a model'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {topRecommendation && topRecommendation.modelId === selectedModel && (
                  <Badge variant="secondary" className="text-[9px]">
                    <Star className="h-2.5 w-2.5 mr-0.5 text-amber-500" />
                    Recommended
                  </Badge>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-3 pt-0 space-y-4">
            {/* Quick Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Recommendations for your content
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {recommendations.slice(0, 4).map((rec, idx) => {
                    const provider = AI_PROVIDERS.find(p => p.id === rec.providerId);
                    const model = provider?.models.find(m => m.id === rec.modelId);
                    const isSelected = rec.modelId === selectedModel;
                    
                    return (
                      <Button
                        key={rec.modelId}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "h-auto p-2 justify-start flex-col items-start text-left",
                          idx === 0 && !isSelected && "border-primary/50"
                        )}
                        onClick={() => onProviderChange(rec.providerId, rec.modelId)}
                      >
                        <div className="flex items-center gap-1 w-full">
                          {idx === 0 && <Star className="h-3 w-3 text-amber-500" />}
                          <span className="text-[10px] font-medium truncate">{model?.name}</span>
                          {isSelected && <Check className="h-3 w-3 ml-auto" />}
                        </div>
                        <span className="text-[8px] text-muted-foreground truncate w-full">
                          {rec.reason}
                        </span>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary" className="text-[7px] px-1 py-0">
                            {model?.speed}
                          </Badge>
                          <Badge variant="secondary" className="text-[7px] px-1 py-0">
                            {model?.quality}
                          </Badge>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Providers */}
            <div className="space-y-3">
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                All Text Models
              </Label>
              
              {AI_PROVIDERS.map(provider => (
                <div key={provider.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={provider.color}>{provider.icon}</span>
                    <span className="text-xs font-medium">{provider.name}</span>
                    <div className="flex gap-1 ml-auto">
                      {provider.strengths.slice(0, 2).map(s => (
                        <Badge key={s} variant="outline" className="text-[8px] px-1">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <RadioGroup
                    value={selectedModel}
                    onValueChange={(modelId) => onProviderChange(provider.id, modelId)}
                    className="space-y-1"
                  >
                    {provider.models.map(model => (
                      <div 
                        key={model.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedModel === model.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => onProviderChange(provider.id, model.id)}
                      >
                        <RadioGroupItem value={model.id} id={model.id} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{model.name}</span>
                            {recommendations[0]?.modelId === model.id && (
                              <Star className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {model.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-0.5 items-end">
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-[8px] px-1 py-0">
                                    <Zap className="h-2 w-2 mr-0.5" />
                                    {model.speed}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Speed: {model.speed}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-[8px] px-1 py-0">
                                    <ThumbsUp className="h-2 w-2 mr-0.5" />
                                    {model.quality}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Quality: {model.quality}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-[8px] px-1 py-0">
                                    <DollarSign className="h-2 w-2" />
                                    {model.cost}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Cost: {model.cost}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            {/* Image Providers Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowImageProviders(!showImageProviders)}
            >
              {showImageProviders ? 'Hide' : 'Show'} Image Generation Models
              {showImageProviders ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </Button>

            {showImageProviders && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Image Generation Models
                </Label>
                {IMAGE_PROVIDERS.map(provider => (
                  <div key={provider.id} className="space-y-1">
                    {provider.models.map(model => (
                      <div 
                        key={model.id}
                        className="flex items-center gap-2 p-2 rounded-lg border text-xs"
                      >
                        <span className={provider.color}>{provider.icon}</span>
                        <div className="flex-1">
                          <span className="font-medium">{model.name}</span>
                          <p className="text-[10px] text-muted-foreground">{model.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-[8px]">{model.speed}</Badge>
                          <Badge variant="secondary" className="text-[8px]">{model.quality}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
