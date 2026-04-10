/**
 * Language Configuration Popup
 * 
 * Dynamically loads AI providers from useContextualAIProviders hook.
 * Shows relevant text, image, voice, and translation models per language.
 * 
 * Integrated with:
 * - useContextualAIProviders for dynamic provider selection
 * - TranslationProviderSelector for intelligent translation provider recommendations
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Globe,
  Brain,
  Image as ImageIcon,
  Mic,
  Zap,
  Crown,
  Sparkles,
  Check,
  ChevronRight,
  Languages,
  Settings2,
  Info,
  TrendingUp,
  DollarSign,
  Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageModelConfig } from '@/services/agentPresentationGeneratorService';
import { SUPPORTED_LANGUAGES, LanguageConfig } from './MultiLanguageGenerator';
import { TranslationProviderSelector } from './TranslationProviderSelector';
import { 
  TranslationProvider, 
  IndustrySegment, 
  TRANSLATION_PROVIDERS,
  translationService,
} from '@/services/translationService';
import { useContextualAIProviders, type ProviderRecommendation } from '@/hooks/useContextualAIProviders';
import { AI_PROVIDER_REGISTRY } from '@/services/ai-hub/providerRegistry';

export interface ExtendedLanguageModelConfig extends LanguageModelConfig {
  translationProvider?: TranslationProvider;
  industrySegment?: IndustrySegment;
}

interface LanguageConfigPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: LanguageConfig | null;
  isPrimary: boolean;
  existingConfig?: ExtendedLanguageModelConfig;
  onConfirm: (config: ExtendedLanguageModelConfig) => void;
  onSkip?: () => void;
  sourceLanguage?: string;
  industrySegment?: IndustrySegment;
  contentType?: 'general' | 'medical' | 'legal' | 'technical' | 'marketing' | 'presentation';
}

// Model display info with provider details
interface ModelOption {
  id: string;
  name: string;
  provider: string;
  tier: 'fast' | 'balanced' | 'premium';
  description: string;
  quality: number;
  speed: number;
  cost: number;
  isConfigured: boolean;
}

// Static model definitions with provider info
const TEXT_MODELS: ModelOption[] = [
  // Gemini
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'gemini', tier: 'fast', description: 'Fast & balanced', quality: 94, speed: 90, cost: 75, isConfigured: true },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', tier: 'balanced', description: 'Great quality', quality: 93, speed: 88, cost: 70, isConfigured: true },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', tier: 'premium', description: 'Best quality', quality: 96, speed: 80, cost: 60, isConfigured: true },
  // OpenAI
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', tier: 'fast', description: 'Efficient & smart', quality: 88, speed: 85, cost: 80, isConfigured: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai', tier: 'balanced', description: 'Balanced excellence', quality: 94, speed: 82, cost: 60, isConfigured: true },
  { id: 'openai/gpt-5', name: 'GPT-5', provider: 'openai', tier: 'premium', description: 'Top reasoning', quality: 98, speed: 78, cost: 45, isConfigured: true },
  // Claude
  { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'claude', tier: 'fast', description: 'Quick responses', quality: 85, speed: 92, cost: 85, isConfigured: true },
  { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'claude', tier: 'balanced', description: 'Excellent writing', quality: 96, speed: 82, cost: 55, isConfigured: true },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'claude', tier: 'premium', description: 'Best reasoning', quality: 98, speed: 70, cost: 40, isConfigured: true },
  // DeepSeek
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'deepseek', tier: 'balanced', description: 'Cost-efficient', quality: 88, speed: 85, cost: 90, isConfigured: true },
  { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek R1', provider: 'deepseek', tier: 'premium', description: 'Strong reasoning', quality: 92, speed: 75, cost: 85, isConfigured: true },
];

const IMAGE_MODELS: ModelOption[] = [
  // Gemini
  { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini Flash Image', provider: 'gemini', tier: 'fast', description: 'Quick generation', quality: 85, speed: 88, cost: 70, isConfigured: true },
  { id: 'google/gemini-3-pro-image-preview', name: 'Gemini Pro Image', provider: 'gemini', tier: 'premium', description: 'Premium quality', quality: 92, speed: 75, cost: 55, isConfigured: true },
  // OpenAI
  { id: 'openai/gpt-image-1', name: 'GPT Image 1', provider: 'openai', tier: 'premium', description: 'Latest OpenAI image model', quality: 95, speed: 80, cost: 60, isConfigured: true },
  // Stability
  { id: 'stability/stable-diffusion-xl', name: 'Stable Diffusion XL', provider: 'stability', tier: 'balanced', description: 'Versatile styles', quality: 92, speed: 75, cost: 65, isConfigured: true },
  { id: 'stability/stable-diffusion-3', name: 'Stable Diffusion 3', provider: 'stability', tier: 'premium', description: 'Latest quality', quality: 95, speed: 70, cost: 55, isConfigured: true },
  // Replicate/Flux
  { id: 'replicate/flux-1.1-pro', name: 'FLUX 1.1 Pro', provider: 'replicate', tier: 'premium', description: 'Photorealistic', quality: 96, speed: 65, cost: 50, isConfigured: true },
  { id: 'replicate/flux-schnell', name: 'FLUX Schnell', provider: 'replicate', tier: 'fast', description: 'Ultra-fast', quality: 82, speed: 95, cost: 80, isConfigured: true },
];

// Voice providers with language support and native voice names
interface VoiceModelConfig {
  id: string;
  name: string;
  provider: string;
  tier: 'fast' | 'balanced' | 'premium';
  description: string;
  quality: number;
  voices: string[];
  supportedLanguages: string[];  // ISO codes
  bestFor: string[];  // Language codes where this is recommended
  languageNativeVoices: Record<string, string[]>;  // Language-specific voices
}

const VOICE_MODELS: VoiceModelConfig[] = [
  { 
    id: 'elevenlabs', 
    name: 'ElevenLabs', 
    provider: 'elevenlabs', 
    tier: 'premium', 
    description: 'Most natural (29 languages)', 
    quality: 98, 
    voices: ['rachel', 'adam', 'sam', 'emily', 'josh', 'bella'],
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr', 'vi', 'id', 'cs', 'uk', 'el', 'hu', 'ro', 'sv', 'fi', 'da', 'no', 'bg', 'hr', 'sk'],
    bestFor: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'nl'],  // Best quality for these
    languageNativeVoices: {
      en: ['rachel', 'adam', 'sam', 'emily', 'josh', 'bella'],
      es: ['paula', 'carlos', 'lucia', 'antonio'],
      fr: ['sophie', 'pierre', 'camille', 'louis'],
      de: ['anna', 'hans', 'claudia', 'max'],
      it: ['giulia', 'marco', 'chiara', 'luca'],
      pt: ['maria', 'joao', 'ana', 'pedro'],
    },
  },
  { 
    id: 'openai', 
    name: 'OpenAI TTS', 
    provider: 'openai', 
    tier: 'balanced', 
    description: 'Great quality (6 voices)', 
    quality: 88, 
    voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'ja', 'ko', 'zh', 'ru'],
    bestFor: ['en'],  // Best for English
    languageNativeVoices: {},  // Same voices for all languages
  },
  { 
    id: 'google', 
    name: 'Google Cloud TTS', 
    provider: 'google', 
    tier: 'balanced', 
    description: 'Wide support (40+ languages)', 
    quality: 85, 
    voices: ['wavenet-a', 'wavenet-b', 'wavenet-c', 'wavenet-d'],
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru', 'th', 'vi', 'id', 'ms', 'fil', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'ur', 'fa', 'he', 'tr', 'el', 'cs', 'pl', 'uk', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'sv', 'no', 'da', 'fi'],
    bestFor: ['th', 'vi', 'id', 'ms', 'fil', 'bn', 'ta', 'te'],  // Southeast Asian & Indian
    languageNativeVoices: {
      th: ['th-TH-Standard-A', 'th-TH-Neural2-A'],
      vi: ['vi-VN-Standard-A', 'vi-VN-Neural2-A'],
      hi: ['hi-IN-Standard-A', 'hi-IN-Neural2-A'],
      id: ['id-ID-Standard-A', 'id-ID-Neural2-A'],
    },
  },
  { 
    id: 'azure', 
    name: 'Azure Neural TTS', 
    provider: 'azure', 
    tier: 'premium', 
    description: 'Enterprise (135+ languages)', 
    quality: 92, 
    voices: ['jenny', 'guy', 'aria', 'davis'],
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru', 'th', 'vi', 'id', 'ms', 'fil', 'bn', 'ta', 'te', 'mr', 'gu', 'ml', 'kn', 'pa', 'ur', 'fa', 'he', 'tr', 'el', 'cs', 'pl', 'uk', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'sr', 'bs', 'sv', 'no', 'da', 'fi', 'nl', 'af', 'am', 'sw', 'zu'],
    bestFor: ['ar', 'he', 'ur', 'fa', 'am', 'sw', 'af'],  // Arabic, Hebrew, African languages
    languageNativeVoices: {
      ar: ['Hamed', 'Zariyah', 'Salma', 'Fahed'],
      he: ['Avri', 'Hila'],
      zh: ['Xiaoxiao', 'Yunyang', 'Xiaoyi'],
      ja: ['Nanami', 'Keita'],
      ko: ['SunHi', 'InJoon'],
    },
  },
  { 
    id: 'aws', 
    name: 'Amazon Polly', 
    provider: 'aws', 
    tier: 'fast', 
    description: 'Low latency (30+ languages)', 
    quality: 80, 
    voices: ['joanna', 'matthew', 'ivy', 'kendra'],
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru', 'pl', 'nl', 'sv', 'no', 'da', 'fi', 'tr', 'ro', 'cs'],
    bestFor: [],  // Cost-effective fallback
    languageNativeVoices: {
      es: ['Lucia', 'Enrique', 'Conchita', 'Mia'],
      pt: ['Vitoria', 'Ricardo', 'Camila'],
      fr: ['Celine', 'Mathieu', 'Lea'],
      de: ['Marlene', 'Hans', 'Vicki'],
    },
  },
  { 
    id: 'alibaba', 
    name: 'Alibaba TTS', 
    provider: 'alibaba', 
    tier: 'balanced', 
    description: 'Best for CJK languages', 
    quality: 90, 
    voices: ['xiaoyun', 'xiaogang', 'ruoxi', 'siqi'],
    supportedLanguages: ['zh', 'ja', 'ko', 'en', 'id', 'ms', 'th', 'vi'],
    bestFor: ['zh', 'ja', 'ko'],  // CJK specialist
    languageNativeVoices: {
      zh: ['xiaoyun', 'xiaogang', 'ruoxi', 'siqi', 'xiaomei', 'sitong'],
      ja: ['tomoka', 'tomoya'],
      ko: ['dahee', 'minjun'],
    },
  },
];

// Get recommended voice provider for a language
function getRecommendedVoiceProvider(languageCode: string): string {
  // Normalize language code (e.g., 'zh-CN' -> 'zh')
  const lang = languageCode.split('-')[0].toLowerCase();
  
  // Find provider where this language is in bestFor
  const bestProvider = VOICE_MODELS.find(m => 
    m.bestFor.includes(lang) && m.supportedLanguages.includes(lang)
  );
  if (bestProvider) return bestProvider.id;
  
  // CJK languages → Alibaba or Azure
  if (['zh', 'ja', 'ko'].includes(lang)) {
    return 'alibaba';
  }
  
  // Arabic/Middle Eastern → Azure
  if (['ar', 'he', 'ur', 'fa'].includes(lang)) {
    return 'azure';
  }
  
  // Indian languages → Google or Azure
  if (['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'ml', 'kn', 'pa'].includes(lang)) {
    return 'google';
  }
  
  // Southeast Asian → Google
  if (['th', 'vi', 'id', 'ms', 'fil'].includes(lang)) {
    return 'google';
  }
  
  // European languages → ElevenLabs (best quality)
  if (['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru'].includes(lang)) {
    return 'elevenlabs';
  }
  
  // Default to ElevenLabs for quality or Google for coverage
  const supported = VOICE_MODELS.find(m => m.supportedLanguages.includes(lang));
  return supported?.id || 'google';
}

// Get native voices for a provider + language combination
function getNativeVoices(providerId: string, languageCode: string): string[] {
  const provider = VOICE_MODELS.find(m => m.id === providerId);
  if (!provider) return [];
  
  const lang = languageCode.split('-')[0].toLowerCase();
  return provider.languageNativeVoices[lang] || provider.voices;
}

// Check if a provider supports a language
function providerSupportsLanguage(providerId: string, languageCode: string): boolean {
  const provider = VOICE_MODELS.find(m => m.id === providerId);
  if (!provider) return false;
  
  const lang = languageCode.split('-')[0].toLowerCase();
  return provider.supportedLanguages.includes(lang);
}

const tierColors: Record<string, string> = {
  fast: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  balanced: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  premium: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

const tierIcons: Record<string, React.ReactNode> = {
  fast: <Zap className="h-3 w-3" />,
  balanced: <Sparkles className="h-3 w-3" />,
  premium: <Crown className="h-3 w-3" />,
};

const providerColors: Record<string, string> = {
  gemini: 'bg-blue-500',
  openai: 'bg-emerald-500',
  claude: 'bg-orange-500',
  deepseek: 'bg-cyan-500',
  stability: 'bg-purple-500',
  replicate: 'bg-pink-500',
  elevenlabs: 'bg-violet-500',
  google: 'bg-yellow-500',
  azure: 'bg-blue-600',
  aws: 'bg-orange-600',
};

function ModelCard({
  model,
  isSelected,
  onSelect,
  showScores = true,
}: {
  model: ModelOption;
  isSelected: boolean;
  onSelect: () => void;
  showScores?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-all text-left w-full",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn("p-1.5 rounded-md border", tierColors[model.tier])}>
          {tierIcons[model.tier]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{model.name}</span>
            <div className={cn("w-2 h-2 rounded-full", providerColors[model.provider])} />
          </div>
          <div className="text-xs text-muted-foreground">{model.description}</div>
        </div>
      </div>
      
      {showScores && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 mr-2">
                <div className="flex flex-col items-end text-[10px]">
                  <span className="text-muted-foreground">Q:{model.quality}</span>
                  <span className="text-muted-foreground">S:{model.speed}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span>Quality:</span>
                  <span className="font-medium">{model.quality}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Speed:</span>
                  <span className="font-medium">{model.speed}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Cost Efficiency:</span>
                  <span className="font-medium">{model.cost}%</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {isSelected && (
        <Check className="h-4 w-4 text-primary flex-shrink-0" />
      )}
    </button>
  );
}

export function LanguageConfigPopup({
  open,
  onOpenChange,
  language,
  isPrimary,
  existingConfig,
  onConfirm,
  onSkip,
  sourceLanguage = 'en',
  industrySegment,
  contentType = 'presentation',
}: LanguageConfigPopupProps) {
  const [config, setConfig] = useState<ExtendedLanguageModelConfig>({
    languageCode: language?.code || 'en',
    textModel: 'google/gemini-3-flash-preview',
    imageModel: 'google/gemini-2.5-flash-image-preview',
    voiceModel: 'openai',
    voiceId: 'alloy',
    translationProvider: 'google_translate',
    industrySegment: industrySegment,
  });

  const [includeVoiceover, setIncludeVoiceover] = useState(false);
  const [activeTab, setActiveTab] = useState<'models' | 'translation'>('models');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Use contextual AI providers for deck
  const aiProviders = useContextualAIProviders('deck', 'script-gen');

  // Get recommended translation provider for this language
  const recommendedProvider = useMemo(() => {
    if (!language) return 'google_translate';
    return translationService.getRecommendedProvider(sourceLanguage, language.code);
  }, [language, sourceLanguage]);

  // Get recommended voice provider for this language
  const recommendedVoiceProvider = useMemo(() => {
    if (!language) return 'elevenlabs';
    return getRecommendedVoiceProvider(language.code);
  }, [language]);

  // Get language-specific voices for current provider
  const availableVoices = useMemo(() => {
    if (!language || !config.voiceModel) return [];
    return getNativeVoices(config.voiceModel, language.code);
  }, [language, config.voiceModel]);

  // Check if current voice provider supports the selected language
  const voiceProviderSupportsLanguage = useMemo(() => {
    if (!language || !config.voiceModel) return true;
    return providerSupportsLanguage(config.voiceModel, language.code);
  }, [language, config.voiceModel]);

  // Update config when language changes - now includes recommended voice provider
  useEffect(() => {
    if (language) {
      if (existingConfig) {
        setConfig(existingConfig);
      } else {
        const recVoiceProvider = getRecommendedVoiceProvider(language.code);
        const recVoices = getNativeVoices(recVoiceProvider, language.code);
        setConfig({
          languageCode: language.code,
          textModel: 'google/gemini-3-flash-preview',
          imageModel: 'google/gemini-2.5-flash-image-preview',
          voiceModel: recVoiceProvider,
          voiceId: recVoices[0] || 'alloy',
          translationProvider: recommendedProvider,
          industrySegment: industrySegment,
        });
      }
    }
  }, [language, existingConfig, recommendedProvider, industrySegment]);

  const updateConfig = (updates: Partial<ExtendedLanguageModelConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleConfirm = () => {
    onConfirm(config);
    onOpenChange(false);
  };

  const selectedTextModel = TEXT_MODELS.find(m => m.id === config.textModel);
  const selectedImageModel = IMAGE_MODELS.find(m => m.id === config.imageModel);
  const selectedVoiceProvider = VOICE_MODELS.find(m => m.id === config.voiceModel);
  const selectedTranslationProvider = TRANSLATION_PROVIDERS.find(p => p.id === config.translationProvider);

  if (!language) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{language.flag}</span>
            Configure {language.name}
            {isPrimary && (
              <Badge variant="default" className="ml-2">Primary</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Select AI models for generating this language version.
            {isPrimary && ' This will be generated first and shown live.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="models" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Models
            </TabsTrigger>
            <TabsTrigger value="translation" className="gap-2">
              <Languages className="h-4 w-4" />
              Translation
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <TabsContent value="models" className="space-y-4 py-4 mt-0">
              {/* Text Generation Model */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Text Generation Model
                  <Badge variant="outline" className="text-[10px] ml-auto">
                    {TEXT_MODELS.length} available
                  </Badge>
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {TEXT_MODELS.map(model => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={config.textModel === model.id}
                      onSelect={() => updateConfig({ textModel: model.id })}
                    />
                  ))}
                </div>
              </div>

              {/* Image Generation Model */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Image Generation Model
                  <Badge variant="outline" className="text-[10px] ml-auto">
                    {IMAGE_MODELS.length} available
                  </Badge>
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {IMAGE_MODELS.map(model => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={config.imageModel === model.id}
                      onSelect={() => updateConfig({ imageModel: model.id })}
                    />
                  ))}
                </div>
              </div>

              {/* Voiceover Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Mic className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Include Voiceover</div>
                    <div className="text-xs text-muted-foreground">Generate AI voiceover for this language</div>
                  </div>
                </div>
                <Switch
                  checked={includeVoiceover}
                  onCheckedChange={setIncludeVoiceover}
                />
              </div>

              {/* Voice Model (shown if voiceover enabled) */}
              {includeVoiceover && (
                <div className="space-y-3 pl-4 border-l-2 border-primary/30">
                  {/* Recommended Voice Provider Banner */}
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Mic className="h-4 w-4 text-violet-600" />
                      <span className="font-medium text-violet-700">Recommended for {language.name}:</span>
                      <Badge variant="outline" className="text-violet-600 border-violet-500/30">
                        {VOICE_MODELS.find(m => m.id === recommendedVoiceProvider)?.name || recommendedVoiceProvider}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Best native voice quality and language support for {language.name}.
                    </p>
                  </div>

                  {/* Language support warning */}
                  {!voiceProviderSupportsLanguage && (
                    <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-yellow-700">
                        {selectedVoiceProvider?.name} may have limited support for {language.name}. Consider using {VOICE_MODELS.find(m => m.id === recommendedVoiceProvider)?.name}.
                      </span>
                    </div>
                  )}

                  <Label className="text-sm flex items-center gap-2">
                    Voice Provider
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {VOICE_MODELS.filter(m => providerSupportsLanguage(m.id, language.code)).length} support {language.name}
                    </Badge>
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {VOICE_MODELS.map(model => {
                      const supportsLang = providerSupportsLanguage(model.id, language.code);
                      const isRecommended = model.id === recommendedVoiceProvider;
                      return (
                        <button
                          key={model.id}
                          onClick={() => {
                            const voices = getNativeVoices(model.id, language.code);
                            updateConfig({ 
                              voiceModel: model.id, 
                              voiceId: voices[0] || model.voices[0]
                            });
                          }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                            config.voiceModel === model.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : supportsLang 
                                ? "border-border hover:border-primary/50"
                                : "border-border/50 opacity-60 hover:border-yellow-500/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("p-1.5 rounded-md border", tierColors[model.tier])}>
                              {tierIcons[model.tier]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{model.name}</span>
                                <div className={cn("w-2 h-2 rounded-full", providerColors[model.provider])} />
                                {isRecommended && (
                                  <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-violet-500/20 text-violet-700">
                                    Best for {language.name}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {model.description}
                                {!supportsLang && (
                                  <span className="text-yellow-600 text-[10px]">• Limited support</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {supportsLang && model.bestFor.includes(language.code.split('-')[0]) && (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            )}
                            {config.voiceModel === model.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Label className="text-sm flex items-center gap-2">
                    Select Voice
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {availableVoices.length} native voices
                    </Badge>
                  </Label>
                  <Select
                    value={config.voiceId || availableVoices[0] || 'alloy'}
                    onValueChange={(value) => updateConfig({ voiceId: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map(voice => (
                        <SelectItem key={voice} value={voice}>
                          {voice.charAt(0).toUpperCase() + voice.slice(1).replace(/[-_]/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="translation" className="py-4 mt-0">
              {/* Translation Provider Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Languages className="h-4 w-4 text-primary" />
                  Translation Provider for {language.name}
                </div>
                
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-700">Recommended:</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-500/30">
                      {TRANSLATION_PROVIDERS.find(p => p.id === recommendedProvider)?.name || recommendedProvider}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {sourceLanguage.toUpperCase()} → {language.code.toUpperCase()} language pair optimization
                  </p>
                </div>

                <TranslationProviderSelector
                  sourceLanguage={sourceLanguage}
                  targetLanguages={[language.code]}
                  selectedProvider={config.translationProvider || 'google_translate'}
                  onProviderChange={(provider) => updateConfig({ translationProvider: provider })}
                  showConfidenceScores={true}
                  industrySegment={industrySegment}
                  className="mt-4"
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Summary */}
        <div className="p-3 rounded-lg bg-muted/50 border border-dashed mt-4">
          <div className="text-xs text-muted-foreground mb-2">Configuration Summary</div>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Brain className="h-3 w-3" />
                    {selectedTextModel?.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Text Generation Model</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {selectedImageModel?.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Image Generation Model</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Languages className="h-3 w-3" />
                    {selectedTranslationProvider?.name || 'Google Translate'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Translation Provider</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {includeVoiceover && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Mic className="h-3 w-3" />
                      {selectedVoiceProvider?.name} - {config.voiceId}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Voice Provider</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2 mt-4">
          {onSkip && !isPrimary && (
            <Button variant="ghost" onClick={onSkip}>
              Use Defaults
            </Button>
          )}
          <Button onClick={handleConfirm} className="gap-2">
            {isPrimary ? 'Configure Primary' : 'Add Language'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
