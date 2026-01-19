/**
 * AIModelConfigPanel - AI Model Configuration with Auto-Select Logic
 * 
 * Features:
 * - Auto-select models based on industry, segment, languages, content type
 * - Manual override for all provider types
 * - Clear display with icons and detailed info
 * - Confidence scoring and recommendations
 */

import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Sparkles,
  Type,
  Image as ImageIcon,
  Mic,
  Languages,
  Zap,
  Info,
  Check,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinalWorkflowConfig } from './EnhancedTemplateWorkflow';

// Complete provider lists with detailed metadata
export const ALL_TEXT_PROVIDERS = [
  { id: 'auto', name: 'Auto-Select', icon: '🤖', strengths: ['AI chooses best model'], bestFor: ['any'] },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', icon: '⚡', strengths: ['Speed', 'Multilingual', 'Low cost'], bestFor: ['general', 'fast'] },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', icon: '🧠', strengths: ['Complex reasoning', 'Long context', 'Analysis'], bestFor: ['research', 'complex'] },
  { id: 'openai/gpt-5', name: 'GPT-5', icon: '🌟', strengths: ['Premium quality', 'Nuance', 'Creative'], bestFor: ['investor', 'premium'] },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', icon: '💡', strengths: ['Balanced', 'Cost-effective', 'Reliable'], bestFor: ['business', 'general'] },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', icon: '🎭', strengths: ['Nuanced writing', 'Safety', 'Accuracy'], bestFor: ['compliance', 'legal'] },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek', icon: '🔬', strengths: ['Technical', 'Reasoning', 'Cost-effective'], bestFor: ['technical', 'research'] },
  { id: 'alibaba/qwen-2.5', name: 'Qwen 2.5', icon: '🐉', strengths: ['CJK languages', 'Technical', 'Multilingual'], bestFor: ['asia', 'multilingual'] },
];

export const ALL_IMAGE_PROVIDERS = [
  { id: 'auto', name: 'Auto-Select', icon: '🤖', styles: ['AI chooses best'], quality: 'adaptive' },
  { id: 'modelslab', name: 'ModelsLab', icon: '🎨', styles: ['photorealistic', 'artistic', 'corporate'], quality: 'high' },
  { id: 'flux-pro', name: 'Flux Pro', icon: '⚡', styles: ['photorealistic', 'artistic', 'detailed'], quality: 'premium' },
  { id: 'flux-schnell', name: 'Flux Schnell', icon: '🚀', styles: ['fast', 'artistic', 'sketch'], quality: 'good' },
  { id: 'gemini-image', name: 'Gemini Image', icon: '💎', styles: ['balanced', 'professional', 'infographic'], quality: 'high' },
  { id: 'dall-e-3', name: 'DALL-E 3', icon: '🖼️', styles: ['photorealistic', 'creative', 'branded'], quality: 'premium' },
  { id: 'stability', name: 'Stability AI', icon: '🎪', styles: ['artistic', 'abstract', 'stylized'], quality: 'high' },
  { id: 'stock', name: 'Stock Images', icon: '📷', styles: ['professional', 'corporate', 'authentic'], quality: 'curated' },
];

export const ALL_VOICE_PROVIDERS = [
  { id: 'auto', name: 'Auto-Select', icon: '🤖', quality: 'adaptive', languages: 'all', bestFor: ['any'] },
  { id: 'elevenlabs-multilingual', name: 'ElevenLabs', icon: '🎙️', quality: 'premium', languages: 100, bestFor: ['professional', 'natural'] },
  { id: 'openai-tts-hd', name: 'OpenAI TTS HD', icon: '🔊', quality: 'neural', languages: 9, bestFor: ['english', 'clear'] },
  { id: 'google-wavenet', name: 'Google WaveNet', icon: '🌐', quality: 'neural', languages: 200, bestFor: ['multilingual', 'global'] },
  { id: 'azure-neural', name: 'Azure Neural', icon: '☁️', quality: 'premium', languages: 300, bestFor: ['enterprise', 'variety'] },
  { id: 'aws-polly', name: 'AWS Polly', icon: '📢', quality: 'neural', languages: 60, bestFor: ['scalable', 'reliable'] },
  { id: 'alibaba-tts', name: 'Alibaba TTS', icon: '🐉', quality: 'neural', languages: 50, bestFor: ['asian', 'mandarin'] },
];

export const ALL_TRANSLATION_PROVIDERS = [
  { id: 'auto', name: 'Auto-Select', icon: '🤖', regions: ['Global'], quality: 'adaptive', bestFor: ['any'] },
  { id: 'deepl', name: 'DeepL', icon: '🌍', regions: ['Europe', 'Americas'], quality: 'native-like', bestFor: ['european', 'premium'] },
  { id: 'google-translate', name: 'Google Translate', icon: '🌐', regions: ['Global'], quality: 'high', bestFor: ['general', 'coverage'] },
  { id: 'qwen-mt', name: 'Qwen-MT', icon: '🐉', regions: ['Asia', 'China'], quality: 'native', bestFor: ['cjk', 'chinese'] },
  { id: 'azure', name: 'Azure Translator', icon: '☁️', regions: ['Global'], quality: 'high', bestFor: ['enterprise', 'custom'] },
  { id: 'nllb', name: 'NLLB (Meta)', icon: '🌏', regions: ['Africa', 'India', 'SEA'], quality: 'high', bestFor: ['low-resource', 'inclusive'] },
  { id: 'alibaba', name: 'Alibaba Translation', icon: '🏮', regions: ['Asia', 'Middle East'], quality: 'high', bestFor: ['asian', 'commerce'] },
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
  selectedContentTypes = [],
}) => {
  // Auto-select logic based on context
  const recommendedModels = useMemo(() => {
    const industry = workflowConfig?.industryCategory || '';
    const segment = workflowConfig?.segment || '';
    const languages = selectedLanguages || [];
    const hasAsianLanguages = languages.some(l => ['zh', 'ja', 'ko', 'th', 'vi'].includes(l));
    const hasEuropeanLanguages = languages.some(l => ['de', 'fr', 'es', 'it', 'pt', 'nl'].includes(l));
    const hasRareLanguages = languages.some(l => ['sw', 'hi', 'bn', 'ta', 'te'].includes(l));
    
    // Text model recommendation
    let textModel = 'google/gemini-3-flash-preview'; // Default fast
    let textReason = 'Fast and multilingual';
    
    if (['healthcare', 'pharma', 'legal', 'finance'].includes(industry)) {
      textModel = 'claude-3-5-sonnet';
      textReason = 'High accuracy for regulated industries';
    } else if (['consulting', 'investor-pitch'].includes(industry) || segment === 'executive') {
      textModel = 'openai/gpt-5';
      textReason = 'Premium quality for executive content';
    } else if (['technology', 'research'].includes(industry) || contentCategory === 'research') {
      textModel = 'google/gemini-2.5-pro';
      textReason = 'Deep analysis and reasoning';
    } else if (hasAsianLanguages) {
      textModel = 'alibaba/qwen-2.5';
      textReason = 'Optimized for CJK languages';
    }
    
    // Image model recommendation
    let imageModel = 'flux-pro'; // Default high quality
    let imageReason = 'High-quality photorealistic images';
    
    if (contentCategory === 'visual' || contentCategory === 'creative') {
      imageModel = 'modelslab';
      imageReason = 'Versatile artistic styles';
    } else if (['business', 'compliance'].includes(contentCategory)) {
      imageModel = 'stock';
      imageReason = 'Professional corporate imagery';
    } else if (segment === 'technical') {
      imageModel = 'gemini-image';
      imageReason = 'Clean infographic style';
    }
    
    // Voice model recommendation
    let voiceModel = 'elevenlabs-multilingual'; // Default premium
    let voiceReason = 'Natural-sounding multilingual voices';
    
    if (hasAsianLanguages) {
      voiceModel = 'alibaba-tts';
      voiceReason = 'Native Asian language voices';
    } else if (languages.length > 5) {
      voiceModel = 'google-wavenet';
      voiceReason = 'Widest language coverage';
    } else if (['enterprise', 'consulting'].includes(industry)) {
      voiceModel = 'azure-neural';
      voiceReason = 'Enterprise-grade voice quality';
    }
    
    // Translation model recommendation
    let translationModel = 'deepl'; // Default for quality
    let translationReason = 'Native-like European translations';
    
    if (hasAsianLanguages) {
      translationModel = 'qwen-mt';
      translationReason = 'Best for CJK translations';
    } else if (hasRareLanguages) {
      translationModel = 'nllb';
      translationReason = 'Supports low-resource languages';
    } else if (languages.length > 10) {
      translationModel = 'google-translate';
      translationReason = 'Widest language coverage';
    }
    
    // Calculate confidence
    const baseConfidence = 75;
    const industryBonus = industry ? 8 : 0;
    const segmentBonus = segment ? 5 : 0;
    const languageBonus = languages.length > 0 ? 7 : 0;
    const contentBonus = contentCategory !== 'ai-generated' ? 5 : 0;
    const confidence = Math.min(98, baseConfidence + industryBonus + segmentBonus + languageBonus + contentBonus);
    
    return {
      textModel, textReason,
      imageModel, imageReason,
      voiceModel, voiceReason,
      translationModel, translationReason,
      confidence,
    };
  }, [workflowConfig, selectedLanguages, contentCategory]);

  // Apply auto-select when enabled
  useEffect(() => {
    if (isAutoSelect && workflowConfig?.aiRecommendation) {
      setWorkflowConfig({
        ...workflowConfig,
        aiRecommendation: {
          ...workflowConfig.aiRecommendation,
          textModel: recommendedModels.textModel,
          imageModel: recommendedModels.imageModel,
          voiceModel: recommendedModels.voiceModel,
          translationModel: recommendedModels.translationModel,
          confidence: recommendedModels.confidence,
          reason: `${recommendedModels.textReason}. ${recommendedModels.imageReason}.`,
        },
      });
      setSelectedAIModel(recommendedModels.textModel);
      setImageModel(recommendedModels.imageModel as any);
    }
  }, [isAutoSelect, recommendedModels]);

  const currentTextModel = isAutoSelect ? recommendedModels.textModel : (workflowConfig?.aiRecommendation?.textModel || 'google/gemini-3-flash-preview');
  const currentImageModel = isAutoSelect ? recommendedModels.imageModel : (workflowConfig?.aiRecommendation?.imageModel || 'flux-pro');
  const currentVoiceModel = isAutoSelect ? recommendedModels.voiceModel : (workflowConfig?.aiRecommendation?.voiceModel || 'elevenlabs-multilingual');
  const currentTranslationModel = isAutoSelect ? recommendedModels.translationModel : (workflowConfig?.aiRecommendation?.translationModel || 'deepl');
  const currentConfidence = isAutoSelect ? recommendedModels.confidence : (workflowConfig?.aiRecommendation?.confidence || 80);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Model Configuration
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                currentConfidence >= 90 
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300" 
                  : currentConfidence >= 80 
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300"
              )}
            >
              {currentConfidence}% confidence
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="auto-select" className="text-xs text-muted-foreground cursor-pointer">
                      Auto
                    </Label>
                    <Switch
                      id="auto-select"
                      checked={isAutoSelect}
                      onCheckedChange={setIsAutoSelect}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-xs">
                    When enabled, AI automatically selects the best models based on your industry, segment, 
                    languages, and content type. Disable to manually choose providers.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Auto-select explanation */}
        {isAutoSelect && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">AI Auto-Selection Active:</span>{' '}
              Models are optimized for{' '}
              <span className="text-primary font-medium">{workflowConfig?.industryCategory || 'general'}</span>
              {workflowConfig?.segment && <> / <span className="text-primary font-medium">{workflowConfig.segment}</span></>}
              {selectedLanguages.length > 1 && <> with <span className="text-primary font-medium">{selectedLanguages.length} languages</span></>}
            </div>
          </div>
        )}
        
        {/* Model Selection Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Text Model */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-primary" />
              Text Model
              {isAutoSelect && <Check className="h-3 w-3 text-green-500" />}
            </Label>
            <Select
              value={currentTextModel}
              onValueChange={(val) => {
                if (!isAutoSelect) {
                  setWorkflowConfig(workflowConfig ? {
                    ...workflowConfig,
                    aiRecommendation: { ...workflowConfig.aiRecommendation!, textModel: val }
                  } : null);
                  setSelectedAIModel(val);
                }
              }}
              disabled={isAutoSelect}
            >
              <SelectTrigger className={cn("h-10 text-xs bg-background", isAutoSelect && "opacity-70")}>
                <SelectValue placeholder="Select text model" />
              </SelectTrigger>
              <SelectContent className="bg-background max-h-64">
                {ALL_TEXT_PROVIDERS.filter(p => p.id !== 'auto').map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs py-2">
                    <div className="flex items-start gap-2">
                      <span className="text-base">{p.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.strengths.join(' • ')}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAutoSelect && (
              <p className="text-[10px] text-muted-foreground">{recommendedModels.textReason}</p>
            )}
          </div>
          
          {/* Image Model */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              Image Model
              {isAutoSelect && <Check className="h-3 w-3 text-green-500" />}
            </Label>
            <Select
              value={currentImageModel}
              onValueChange={(val) => {
                if (!isAutoSelect) {
                  setWorkflowConfig(workflowConfig ? {
                    ...workflowConfig,
                    aiRecommendation: { ...workflowConfig.aiRecommendation!, imageModel: val }
                  } : null);
                  setImageModel(val as any);
                }
              }}
              disabled={isAutoSelect}
            >
              <SelectTrigger className={cn("h-10 text-xs bg-background", isAutoSelect && "opacity-70")}>
                <SelectValue placeholder="Select image model" />
              </SelectTrigger>
              <SelectContent className="bg-background max-h-64">
                {ALL_IMAGE_PROVIDERS.filter(p => p.id !== 'auto').map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs py-2">
                    <div className="flex items-start gap-2">
                      <span className="text-base">{p.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.styles.slice(0, 2).join(' • ')}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAutoSelect && (
              <p className="text-[10px] text-muted-foreground">{recommendedModels.imageReason}</p>
            )}
          </div>
          
          {/* Voice Model */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-primary" />
              Voice Model
              {isAutoSelect && <Check className="h-3 w-3 text-green-500" />}
            </Label>
            <Select
              value={currentVoiceModel}
              onValueChange={(val) => {
                if (!isAutoSelect) {
                  setWorkflowConfig(workflowConfig ? {
                    ...workflowConfig,
                    aiRecommendation: { ...workflowConfig.aiRecommendation!, voiceModel: val }
                  } : null);
                }
              }}
              disabled={isAutoSelect}
            >
              <SelectTrigger className={cn("h-10 text-xs bg-background", isAutoSelect && "opacity-70")}>
                <SelectValue placeholder="Select voice model" />
              </SelectTrigger>
              <SelectContent className="bg-background max-h-64">
                {ALL_VOICE_PROVIDERS.filter(p => p.id !== 'auto').map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs py-2">
                    <div className="flex items-start gap-2">
                      <span className="text-base">{p.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.quality} • {typeof p.languages === 'number' ? `${p.languages} langs` : p.languages}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAutoSelect && (
              <p className="text-[10px] text-muted-foreground">{recommendedModels.voiceReason}</p>
            )}
          </div>
          
          {/* Translation Model */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-primary" />
              Translation
              {isAutoSelect && <Check className="h-3 w-3 text-green-500" />}
            </Label>
            <Select
              value={currentTranslationModel}
              onValueChange={(val) => {
                if (!isAutoSelect) {
                  setWorkflowConfig(workflowConfig ? {
                    ...workflowConfig,
                    aiRecommendation: { ...workflowConfig.aiRecommendation!, translationModel: val }
                  } : null);
                }
              }}
              disabled={isAutoSelect}
            >
              <SelectTrigger className={cn("h-10 text-xs bg-background", isAutoSelect && "opacity-70")}>
                <SelectValue placeholder="Select translation" />
              </SelectTrigger>
              <SelectContent className="bg-background max-h-64">
                {ALL_TRANSLATION_PROVIDERS.filter(p => p.id !== 'auto').map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs py-2">
                    <div className="flex items-start gap-2">
                      <span className="text-base">{p.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.regions.join(' • ')} • {p.quality}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAutoSelect && (
              <p className="text-[10px] text-muted-foreground">{recommendedModels.translationReason}</p>
            )}
          </div>
        </div>
        
        {/* Summary when not auto */}
        {!isAutoSelect && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>Manual mode: You've customized model selection. Enable Auto to use AI-recommended models.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIModelConfigPanel;
