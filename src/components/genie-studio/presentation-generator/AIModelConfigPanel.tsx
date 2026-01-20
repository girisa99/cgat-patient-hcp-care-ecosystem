/**
 * AIModelConfigPanel - AI vs Custom mode toggle (matching Step 3 pattern)
 * Uses same two-mode architecture as TemplateBrandingPanelV2
 */

import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bot,
  Pencil,
  Type,
  Image as ImageIcon,
  Languages,
  Wand2,
  Check,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinalWorkflowConfig } from './wizardConstants';

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
  // Mode state - matches Step 3 pattern
  const [mode, setMode] = useState<'ai' | 'custom'>(isAutoSelect ? 'ai' : 'custom');

  // Sync mode with isAutoSelect prop
  useEffect(() => {
    setIsAutoSelect(mode === 'ai');
  }, [mode, setIsAutoSelect]);

  // Auto-select recommendations based on context
  const recommendations = useMemo(() => {
    const industry = workflowConfig?.industryCategory || '';
    const hasAsianLangs = selectedLanguages.some(l => ['zh', 'ja', 'ko', 'th', 'vi'].includes(l));
    
    let text = 'google/gemini-3-flash-preview';
    let reasoning = 'Gemini 3 Flash provides excellent speed and quality for general content generation.';
    
    if (['healthcare', 'pharma', 'legal'].includes(industry)) {
      text = 'claude-3-5-sonnet';
      reasoning = `Claude 3.5 excels at ${industry} domain with nuanced, accurate content.`;
    } else if (['consulting'].includes(industry)) {
      text = 'openai/gpt-5';
      reasoning = 'GPT-5 delivers premium strategic and business consulting content.';
    } else if (hasAsianLangs) {
      text = 'alibaba/qwen-2.5';
      reasoning = 'Qwen 2.5 optimized for Asian language content generation.';
    }
    
    let image = contentCategory === 'visual' ? 'modelslab' : 'flux-pro';
    let translation = hasAsianLangs ? 'qwen-mt' : 'deepl';
    
    const confidence = Math.min(98, 75 + (industry ? 10 : 0) + (selectedLanguages.length > 0 ? 8 : 0));
    
    return { text, image, translation, confidence, reasoning };
  }, [workflowConfig, selectedLanguages, contentCategory]);

  // Apply auto-select when in AI mode
  useEffect(() => {
    if (mode === 'ai' && workflowConfig?.aiRecommendation) {
      setWorkflowConfig({
        ...workflowConfig,
        aiRecommendation: {
          ...workflowConfig.aiRecommendation,
          textModel: recommendations.text,
          imageModel: recommendations.image,
          translationModel: recommendations.translation,
          confidence: recommendations.confidence,
        },
      });
      setSelectedAIModel(recommendations.text);
      setImageModel(recommendations.image as any);
    }
  }, [mode, recommendations]);

  // Current selected values
  const current = useMemo(() => ({
    text: mode === 'ai' ? recommendations.text : (workflowConfig?.aiRecommendation?.textModel || 'google/gemini-3-flash-preview'),
    image: mode === 'ai' ? recommendations.image : (workflowConfig?.aiRecommendation?.imageModel || 'flux-pro'),
    translation: mode === 'ai' ? recommendations.translation : (workflowConfig?.aiRecommendation?.translationModel || 'deepl'),
  }), [mode, recommendations, workflowConfig]);

  // Update handler for manual selection
  const handleModelChange = (type: 'text' | 'image' | 'translation', value: string) => {
    if (mode === 'ai') return;
    
    if (workflowConfig) {
      const key = `${type}Model` as keyof typeof workflowConfig.aiRecommendation;
      setWorkflowConfig({
        ...workflowConfig,
        aiRecommendation: { 
          ...workflowConfig.aiRecommendation!, 
          [key]: value 
        }
      });
      
      if (type === 'text') setSelectedAIModel(value);
      if (type === 'image') setImageModel(value as any);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle - Matches Step 3 */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'ai' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setMode('ai')}
            >
              <Bot className="h-4 w-4" />
              AI Auto
              {mode === 'ai' && <Check className="h-3 w-3" />}
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setMode('custom')}
            >
              <Pencil className="h-4 w-4" />
              Custom
              {mode === 'custom' && <Check className="h-3 w-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Auto Mode */}
      {mode === 'ai' && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              AI Model Recommendation
              <Badge variant="secondary" className="ml-auto text-xs">
                {recommendations.confidence}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Reasoning */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{recommendations.reasoning}</p>
              </div>
            </div>

            {/* Selected Models Preview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Type className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-medium">Text</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {TEXT_PROVIDERS.find(p => p.id === recommendations.text)?.short}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-medium">Image</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {IMAGE_PROVIDERS.find(p => p.id === recommendations.image)?.short}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Languages className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-medium">Translation</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {TRANSLATION_PROVIDERS.find(p => p.id === recommendations.translation)?.short}
                </p>
              </div>
            </div>

            {/* Quick Switch to Custom */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setMode('custom')}
            >
              Want more control? Switch to Custom mode
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Custom Mode */}
      {mode === 'custom' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              Manual Model Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Grid - 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Text Model */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" />
                  <Label className="text-xs font-medium text-foreground">Text Model</Label>
                </div>
                <Select 
                  value={current.text} 
                  onValueChange={(val) => handleModelChange('text', val)}
                >
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">
                        {TEXT_PROVIDERS.find(p => p.id === current.text)?.short || current.text}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border shadow-lg">
                    {TEXT_PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-medium">{p.name}</span>
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
                </div>
                <Select 
                  value={current.image} 
                  onValueChange={(val) => handleModelChange('image', val)}
                >
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">
                        {IMAGE_PROVIDERS.find(p => p.id === current.image)?.short || current.image}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border shadow-lg">
                    {IMAGE_PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-medium">{p.name}</span>
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
                </div>
                <Select 
                  value={current.translation} 
                  onValueChange={(val) => handleModelChange('translation', val)}
                >
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">
                        {TRANSLATION_PROVIDERS.find(p => p.id === current.translation)?.short || current.translation}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border shadow-lg">
                    {TRANSLATION_PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-medium">{p.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Switch to AI */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setMode('ai')}
            >
              <Bot className="h-3 w-3 mr-1" />
              Let AI choose optimal models for your context
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIModelConfigPanel;
