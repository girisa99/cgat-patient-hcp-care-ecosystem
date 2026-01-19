/**
 * AIModelConfigPanel - Clean AI model selection with working dropdowns
 * Dropdowns are fully selectable when Auto mode is OFF
 */

import React, { useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles,
  Type,
  Image as ImageIcon,
  Mic,
  Languages,
  Wand2,
  Check,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinalWorkflowConfig } from './EnhancedTemplateWorkflow';

// Provider configurations with short display names
const TEXT_PROVIDERS = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', short: 'Gemini Flash' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', short: 'Gemini Pro' },
  { id: 'openai/gpt-5', name: 'GPT-5', short: 'GPT-5' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', short: 'GPT-5 Mini' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', short: 'Claude 3.5' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek', short: 'DeepSeek' },
  { id: 'alibaba/qwen-2.5', name: 'Qwen 2.5', short: 'Qwen 2.5' },
];

const IMAGE_PROVIDERS = [
  { id: 'modelslab', name: 'ModelsLab', short: 'ModelsLab' },
  { id: 'flux-pro', name: 'Flux Pro', short: 'Flux Pro' },
  { id: 'flux-schnell', name: 'Flux Schnell', short: 'Flux Fast' },
  { id: 'dall-e-3', name: 'DALL-E 3', short: 'DALL-E 3' },
  { id: 'stability', name: 'Stability AI', short: 'Stability' },
  { id: 'stock', name: 'Stock Images', short: 'Stock' },
];

const VOICE_PROVIDERS = [
  { id: 'elevenlabs-multilingual', name: 'ElevenLabs Multilingual', short: 'ElevenLabs' },
  { id: 'openai-tts-hd', name: 'OpenAI TTS HD', short: 'OpenAI' },
  { id: 'google-wavenet', name: 'Google WaveNet', short: 'WaveNet' },
  { id: 'azure-neural', name: 'Azure Neural', short: 'Azure' },
  { id: 'aws-polly', name: 'AWS Polly', short: 'Polly' },
];

const TRANSLATION_PROVIDERS = [
  { id: 'deepl', name: 'DeepL', short: 'DeepL' },
  { id: 'google-translate', name: 'Google Translate', short: 'Google' },
  { id: 'qwen-mt', name: 'Qwen-MT', short: 'Qwen' },
  { id: 'azure', name: 'Azure Translator', short: 'Azure' },
  { id: 'nllb', name: 'NLLB', short: 'NLLB' },
];

interface AIModelConfigPanelProps {
  workflowConfig: FinalWorkflowConfig | null;
  setWorkflowConfig: (config: FinalWorkflowConfig | null) => void;
  selectedAIModel: string;
  setSelectedAIModel: (model: string) => void;
  setImageModel: (model: any) => void;
  selectedLanguages: string[];
  isAutoSelect: boolean;
  setIsAutoSelect: (auto: boolean) => void;
  contentCategory?: string;
  selectedContentTypes?: string[];
}

export const AIModelConfigPanel: React.FC<AIModelConfigPanelProps> = ({
  workflowConfig,
  setWorkflowConfig,
  selectedAIModel,
  setSelectedAIModel,
  setImageModel,
  selectedLanguages,
  isAutoSelect,
  setIsAutoSelect,
  contentCategory = 'ai-generated',
}) => {
  // Auto-select recommendations
  const recommendations = useMemo(() => {
    const industry = workflowConfig?.industryCategory || '';
    const hasAsianLangs = selectedLanguages.some(l => ['zh', 'ja', 'ko', 'th', 'vi'].includes(l));
    
    let text = 'google/gemini-3-flash-preview';
    if (['healthcare', 'pharma', 'legal'].includes(industry)) text = 'claude-3-5-sonnet';
    else if (['consulting'].includes(industry)) text = 'openai/gpt-5';
    else if (hasAsianLangs) text = 'alibaba/qwen-2.5';
    
    let image = contentCategory === 'visual' ? 'modelslab' : 'flux-pro';
    let voice = hasAsianLangs ? 'google-wavenet' : 'elevenlabs-multilingual';
    let translation = hasAsianLangs ? 'qwen-mt' : 'deepl';
    
    const confidence = Math.min(98, 75 + (industry ? 10 : 0) + (selectedLanguages.length > 0 ? 8 : 0));
    
    return { text, image, voice, translation, confidence };
  }, [workflowConfig, selectedLanguages, contentCategory]);

  // Apply auto-select
  useEffect(() => {
    if (isAutoSelect && workflowConfig?.aiRecommendation) {
      setWorkflowConfig({
        ...workflowConfig,
        aiRecommendation: {
          ...workflowConfig.aiRecommendation,
          textModel: recommendations.text,
          imageModel: recommendations.image,
          voiceModel: recommendations.voice,
          translationModel: recommendations.translation,
          confidence: recommendations.confidence,
        },
      });
      setSelectedAIModel(recommendations.text);
      setImageModel(recommendations.image as any);
    }
  }, [isAutoSelect, recommendations]);

  // Current selected values
  const current = useMemo(() => ({
    text: isAutoSelect ? recommendations.text : (workflowConfig?.aiRecommendation?.textModel || 'google/gemini-3-flash-preview'),
    image: isAutoSelect ? recommendations.image : (workflowConfig?.aiRecommendation?.imageModel || 'flux-pro'),
    voice: isAutoSelect ? recommendations.voice : (workflowConfig?.aiRecommendation?.voiceModel || 'elevenlabs-multilingual'),
    translation: isAutoSelect ? recommendations.translation : (workflowConfig?.aiRecommendation?.translationModel || 'deepl'),
  }), [isAutoSelect, recommendations, workflowConfig]);

  // Update handler for manual selection
  const handleModelChange = (type: 'text' | 'image' | 'voice' | 'translation', value: string) => {
    if (isAutoSelect) return; // Prevent changes when auto is on
    
    if (workflowConfig) {
      const key = `${type}Model` as keyof typeof workflowConfig.aiRecommendation;
      setWorkflowConfig({
        ...workflowConfig,
        aiRecommendation: { 
          ...workflowConfig.aiRecommendation!, 
          [key]: value 
        }
      });
      
      // Update external state
      if (type === 'text') setSelectedAIModel(value);
      if (type === 'image') setImageModel(value as any);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header with Auto Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI Models</span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px]",
                recommendations.confidence >= 90 ? "bg-green-500/10 text-green-600 border-green-200" :
                recommendations.confidence >= 80 ? "bg-blue-500/10 text-blue-600 border-blue-200" :
                "bg-amber-500/10 text-amber-600 border-amber-200"
              )}
            >
              {recommendations.confidence}% match
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-models" className="text-xs text-muted-foreground">Auto</Label>
            <Switch
              id="auto-models"
              checked={isAutoSelect}
              onCheckedChange={setIsAutoSelect}
            />
          </div>
        </div>

        {/* Auto-select info */}
        {isAutoSelect && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Auto-optimized</span> for {workflowConfig?.industryCategory || 'your context'}
            </p>
          </div>
        )}

        {/* Model Grid - 2x2 Clean Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Text Model */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              <Label className="text-xs font-medium text-foreground">Text Model</Label>
              {isAutoSelect && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Select 
              value={current.text} 
              onValueChange={(val) => handleModelChange('text', val)}
              disabled={isAutoSelect}
            >
              <SelectTrigger className={cn(
                "h-10 bg-background",
                isAutoSelect && "opacity-60 cursor-not-allowed"
              )}>
                <SelectValue>
                  <span className="truncate">
                    {TEXT_PROVIDERS.find(p => p.id === current.text)?.short || current.text}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover border shadow-lg">
                {TEXT_PROVIDERS.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Model */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <Label className="text-xs font-medium text-foreground">Image Model</Label>
              {isAutoSelect && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Select 
              value={current.image} 
              onValueChange={(val) => handleModelChange('image', val)}
              disabled={isAutoSelect}
            >
              <SelectTrigger className={cn(
                "h-10 bg-background",
                isAutoSelect && "opacity-60 cursor-not-allowed"
              )}>
                <SelectValue>
                  <span className="truncate">
                    {IMAGE_PROVIDERS.find(p => p.id === current.image)?.short || current.image}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover border shadow-lg">
                {IMAGE_PROVIDERS.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Model */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <Label className="text-xs font-medium text-foreground">Voice Model</Label>
              {isAutoSelect && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Select 
              value={current.voice} 
              onValueChange={(val) => handleModelChange('voice', val)}
              disabled={isAutoSelect}
            >
              <SelectTrigger className={cn(
                "h-10 bg-background",
                isAutoSelect && "opacity-60 cursor-not-allowed"
              )}>
                <SelectValue>
                  <span className="truncate">
                    {VOICE_PROVIDERS.find(p => p.id === current.voice)?.short || current.voice}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover border shadow-lg">
                {VOICE_PROVIDERS.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Translation Model */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" />
              <Label className="text-xs font-medium text-foreground">Translation</Label>
              {isAutoSelect && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Select 
              value={current.translation} 
              onValueChange={(val) => handleModelChange('translation', val)}
              disabled={isAutoSelect}
            >
              <SelectTrigger className={cn(
                "h-10 bg-background",
                isAutoSelect && "opacity-60 cursor-not-allowed"
              )}>
                <SelectValue>
                  <span className="truncate">
                    {TRANSLATION_PROVIDERS.find(p => p.id === current.translation)?.short || current.translation}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover border shadow-lg">
                {TRANSLATION_PROVIDERS.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hint for manual mode */}
        {!isAutoSelect && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            Manual mode: Select your preferred models from each dropdown
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AIModelConfigPanel;
