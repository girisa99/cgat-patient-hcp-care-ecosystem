/**
 * AIModelConfigPanel - Clean, enterprise-grade AI model selection
 * 
 * Features:
 * - Auto-select based on context
 * - Clean 2x2 grid with proper text alignment
 * - No overflow issues
 */

import React, { useMemo, useEffect } from 'react';
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
  Info,
  Check,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinalWorkflowConfig } from './EnhancedTemplateWorkflow';

// Provider configurations
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
  { id: 'gemini-image', name: 'Gemini Image', short: 'Gemini' },
  { id: 'dall-e-3', name: 'DALL-E 3', short: 'DALL-E 3' },
  { id: 'stability', name: 'Stability AI', short: 'Stability' },
  { id: 'stock', name: 'Stock Images', short: 'Stock' },
];

const VOICE_PROVIDERS = [
  { id: 'elevenlabs-multilingual', name: 'ElevenLabs', short: 'ElevenLabs' },
  { id: 'openai-tts-hd', name: 'OpenAI TTS HD', short: 'OpenAI TTS' },
  { id: 'google-wavenet', name: 'Google WaveNet', short: 'WaveNet' },
  { id: 'azure-neural', name: 'Azure Neural', short: 'Azure' },
  { id: 'aws-polly', name: 'AWS Polly', short: 'Polly' },
  { id: 'alibaba-tts', name: 'Alibaba TTS', short: 'Alibaba' },
];

const TRANSLATION_PROVIDERS = [
  { id: 'deepl', name: 'DeepL', short: 'DeepL' },
  { id: 'google-translate', name: 'Google Translate', short: 'Google' },
  { id: 'qwen-mt', name: 'Qwen-MT', short: 'Qwen-MT' },
  { id: 'azure', name: 'Azure Translator', short: 'Azure' },
  { id: 'nllb', name: 'NLLB (Meta)', short: 'NLLB' },
  { id: 'alibaba', name: 'Alibaba', short: 'Alibaba' },
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
  // Auto-select logic
  const recommendations = useMemo(() => {
    const industry = workflowConfig?.industryCategory || '';
    const hasAsianLangs = selectedLanguages.some(l => ['zh', 'ja', 'ko', 'th', 'vi'].includes(l));
    const hasRareLangs = selectedLanguages.some(l => ['sw', 'hi', 'bn', 'ta'].includes(l));
    
    let text = 'google/gemini-3-flash-preview';
    let textReason = 'Fast & multilingual';
    
    if (['healthcare', 'pharma', 'legal'].includes(industry)) {
      text = 'claude-3-5-sonnet';
      textReason = 'High accuracy';
    } else if (['consulting'].includes(industry)) {
      text = 'openai/gpt-5';
      textReason = 'Premium quality';
    } else if (hasAsianLangs) {
      text = 'alibaba/qwen-2.5';
      textReason = 'CJK optimized';
    }
    
    let image = 'flux-pro';
    let imageReason = 'High quality';
    if (contentCategory === 'visual') {
      image = 'modelslab';
      imageReason = 'Artistic styles';
    } else if (contentCategory === 'business') {
      image = 'stock';
      imageReason = 'Professional';
    }
    
    let voice = 'elevenlabs-multilingual';
    let voiceReason = 'Natural voices';
    if (hasAsianLangs) {
      voice = 'alibaba-tts';
      voiceReason = 'Asian languages';
    } else if (selectedLanguages.length > 5) {
      voice = 'google-wavenet';
      voiceReason = 'Wide coverage';
    }
    
    let translation = 'deepl';
    let translationReason = 'Native quality';
    if (hasAsianLangs) {
      translation = 'qwen-mt';
      translationReason = 'CJK languages';
    } else if (hasRareLangs) {
      translation = 'nllb';
      translationReason = 'Rare languages';
    }
    
    const confidence = Math.min(98, 75 + (industry ? 10 : 0) + (selectedLanguages.length > 0 ? 8 : 0));
    
    return { text, textReason, image, imageReason, voice, voiceReason, translation, translationReason, confidence };
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

  const current = {
    text: isAutoSelect ? recommendations.text : (workflowConfig?.aiRecommendation?.textModel || 'google/gemini-3-flash-preview'),
    image: isAutoSelect ? recommendations.image : (workflowConfig?.aiRecommendation?.imageModel || 'flux-pro'),
    voice: isAutoSelect ? recommendations.voice : (workflowConfig?.aiRecommendation?.voiceModel || 'elevenlabs-multilingual'),
    translation: isAutoSelect ? recommendations.translation : (workflowConfig?.aiRecommendation?.translationModel || 'deepl'),
  };

  const getProviderName = (id: string, list: typeof TEXT_PROVIDERS) => 
    list.find(p => p.id === id)?.short || id;

  return (
    <div className="space-y-4">
      {/* Header with Auto Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Models</span>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px]",
              recommendations.confidence >= 90 ? "bg-green-500/10 text-green-600" :
              recommendations.confidence >= 80 ? "bg-blue-500/10 text-blue-600" :
              "bg-amber-500/10 text-amber-600"
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
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-primary/5 border border-primary/20">
          <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            <span className="text-foreground font-medium">Auto-optimized</span> for {workflowConfig?.industryCategory || 'your context'}
            {selectedLanguages.length > 1 && ` • ${selectedLanguages.length} languages`}
          </p>
        </div>
      )}

      {/* Model Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Text Model */}
        <ModelSelector
          icon={<Type className="h-3.5 w-3.5" />}
          label="Text"
          value={current.text}
          providers={TEXT_PROVIDERS}
          disabled={isAutoSelect}
          reason={isAutoSelect ? recommendations.textReason : undefined}
          onChange={(val) => {
            if (!isAutoSelect && workflowConfig) {
              setWorkflowConfig({
                ...workflowConfig,
                aiRecommendation: { ...workflowConfig.aiRecommendation!, textModel: val }
              });
              setSelectedAIModel(val);
            }
          }}
        />

        {/* Image Model */}
        <ModelSelector
          icon={<ImageIcon className="h-3.5 w-3.5" />}
          label="Image"
          value={current.image}
          providers={IMAGE_PROVIDERS}
          disabled={isAutoSelect}
          reason={isAutoSelect ? recommendations.imageReason : undefined}
          onChange={(val) => {
            if (!isAutoSelect && workflowConfig) {
              setWorkflowConfig({
                ...workflowConfig,
                aiRecommendation: { ...workflowConfig.aiRecommendation!, imageModel: val }
              });
              setImageModel(val as any);
            }
          }}
        />

        {/* Voice Model */}
        <ModelSelector
          icon={<Mic className="h-3.5 w-3.5" />}
          label="Voice"
          value={current.voice}
          providers={VOICE_PROVIDERS}
          disabled={isAutoSelect}
          reason={isAutoSelect ? recommendations.voiceReason : undefined}
          onChange={(val) => {
            if (!isAutoSelect && workflowConfig) {
              setWorkflowConfig({
                ...workflowConfig,
                aiRecommendation: { ...workflowConfig.aiRecommendation!, voiceModel: val }
              });
            }
          }}
        />

        {/* Translation Model */}
        <ModelSelector
          icon={<Languages className="h-3.5 w-3.5" />}
          label="Translation"
          value={current.translation}
          providers={TRANSLATION_PROVIDERS}
          disabled={isAutoSelect}
          reason={isAutoSelect ? recommendations.translationReason : undefined}
          onChange={(val) => {
            if (!isAutoSelect && workflowConfig) {
              setWorkflowConfig({
                ...workflowConfig,
                aiRecommendation: { ...workflowConfig.aiRecommendation!, translationModel: val }
              });
            }
          }}
        />
      </div>

      {/* Manual mode hint */}
      {!isAutoSelect && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3 w-3 shrink-0" />
          <span>Manual mode - enable Auto for AI-optimized selection</span>
        </div>
      )}
    </div>
  );
};

// Clean model selector component
interface ModelSelectorProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  providers: { id: string; name: string; short: string }[];
  disabled: boolean;
  reason?: string;
  onChange: (value: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  icon,
  label,
  value,
  providers,
  disabled,
  reason,
  onChange,
}) => {
  const currentProvider = providers.find(p => p.id === value);
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-primary">{icon}</span>
        <Label className="text-xs font-medium">{label}</Label>
        {disabled && <Check className="h-3 w-3 text-green-500" />}
      </div>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={cn(
          "h-9 text-xs",
          disabled && "opacity-70 bg-muted/30"
        )}>
          <SelectValue>
            <span className="truncate">{currentProvider?.short || value}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-48">
          {providers.map(p => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {reason && (
        <p className="text-[10px] text-muted-foreground truncate">{reason}</p>
      )}
    </div>
  );
};

export default AIModelConfigPanel;
