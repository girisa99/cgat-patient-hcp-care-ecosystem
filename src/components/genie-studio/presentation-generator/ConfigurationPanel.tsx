/**
 * ConfigurationPanel - Unified AI vs Custom configuration
 * AI Auto: User selects context (industry, segment, content), AI models auto-selected
 * Custom: Full manual control over everything including AI models
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot,
  Pencil,
  Check,
  Wand2,
  Info,
  Building2,
  Target,
  FileText,
  Type,
  Image as ImageIcon,
  Languages,
  ChevronDown,
  Sparkles,
  // Output type icons
  Box,
  Film,
  Video,
  MousePointerClick,
  Layers,
  Play,
  Clapperboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  FinalWorkflowConfig, 
  INDUSTRY_CATEGORIES, 
  SEGMENTS,
  getRecommendedProviders,
} from './wizardConstants';
import { CONTENT_CATEGORIES, EXTENDED_COLLATERAL_TYPES } from './ContentTypeSelector';
import { OutputType, OUTPUT_TYPE_CONFIGS } from './types';

// Output type icon mapping
const OUTPUT_TYPE_ICONS: Record<OutputType, React.ElementType> = {
  '2d-static': ImageIcon,
  '2d-animated': Sparkles,
  '3d-scene': Box,
  '3d-animated': Box,
  'video-intro': Play,
  'video-full': Clapperboard,
  'interactive': MousePointerClick,
  'mixed': Layers,
};

// ==========================================
// PROVIDER CONFIGURATIONS - Universal AI Hub
// All providers from UniversalAIHub/UniversalMediaAdapter
// ==========================================

const TEXT_PROVIDERS = [
  // Tier 1 - Primary/Recommended
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', short: 'Gemini 3 Flash', tier: 1, description: 'Fastest, multimodal via Lovable AI' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', short: 'Gemini 3 Pro', tier: 1, description: 'Next-gen reasoning' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', short: 'Gemini Pro', tier: 1, description: 'Best for complex reasoning, 1M context' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', short: 'Gemini Flash', tier: 1, description: 'Fast balanced multimodal' },
  { id: 'openai/gpt-5', name: 'OpenAI GPT-5', short: 'GPT-5', tier: 1, description: 'Premium quality, strong reasoning' },
  { id: 'openai/gpt-5-mini', name: 'OpenAI GPT-5 Mini', short: 'GPT-5 Mini', tier: 1, description: 'Cost-effective GPT-5' },
  { id: 'openai/gpt-5.2', name: 'OpenAI GPT-5.2', short: 'GPT-5.2', tier: 1, description: 'Latest with enhanced reasoning' },
  // Tier 2 - Specialized
  { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', short: 'Claude Opus', tier: 2, description: 'Best for nuance, 200k context' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', short: 'Claude Sonnet', tier: 2, description: 'Balanced Claude quality' },
  { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', short: 'Claude 3.5', tier: 2, description: 'Compliance-sensitive content' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', short: 'DeepSeek', tier: 3, description: 'Best for Chinese, low cost' },
  { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', short: 'DeepSeek Code', tier: 3, description: 'Technical/code content' },
  // Tier 3 - Alibaba/Azure
  { id: 'alibaba/qwen-max', name: 'Qwen Max', short: 'Qwen Max', tier: 3, description: 'Excellent CJK, full-stack' },
  { id: 'alibaba/qwen-2.5', name: 'Qwen 2.5', short: 'Qwen 2.5', tier: 3, description: 'Asian language optimized' },
  { id: 'alibaba/qwen-turbo', name: 'Qwen Turbo', short: 'Qwen Fast', tier: 3, description: 'Fast, low cost' },
  { id: 'azure/gpt-4o', name: 'Azure OpenAI GPT-4o', short: 'Azure GPT-4o', tier: 2, description: 'Enterprise SLA, HIPAA' },
];

const IMAGE_PROVIDERS = [
  // Tier 1 - Primary via Lovable AI / ModelsLab
  { id: 'gemini-nano-banana', name: 'Gemini 2.5 Flash Image', short: 'Gemini Image', tier: 1, description: 'Fast via Lovable AI' },
  { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro Image', short: 'Gemini 3 Image', tier: 1, description: 'Highest quality via Lovable AI' },
  { id: 'modelslab', name: 'ModelsLab Hub', short: 'ModelsLab', tier: 1, description: 'Multi-model hub for Image/Video/3D' },
  { id: 'modelslab-realvision', name: 'ModelsLab RealVision', short: 'RealVision', tier: 1, description: 'Photorealistic images' },
  { id: 'modelslab-video', name: 'ModelsLab Video', short: 'ModelsLab Video', tier: 1, description: 'Video generation' },
  // Tier 2 - Premium
  { id: 'flux-pro', name: 'Flux Pro', short: 'Flux Pro', tier: 2, description: 'High quality, fine control' },
  { id: 'flux-schnell', name: 'Flux Schnell', short: 'Flux Fast', tier: 2, description: 'Fast generation' },
  { id: 'dall-e-3', name: 'OpenAI DALL-E 3', short: 'DALL-E 3', tier: 2, description: 'Excellent text rendering' },
  { id: 'stability', name: 'Stability AI SDXL', short: 'Stability', tier: 2, description: 'Fine control, ControlNet' },
  // Tier 3 - Alibaba/Replicate
  { id: 'alibaba-wanx', name: 'Alibaba Wanx', short: 'Wanx', tier: 3, description: 'Asian aesthetics, low cost' },
  { id: 'replicate', name: 'Replicate', short: 'Replicate', tier: 3, description: 'Open source models' },
  { id: 'huggingface', name: 'HuggingFace FLUX', short: 'HF FLUX', tier: 3, description: 'Open models, customizable' },
  { id: 'stock', name: 'Stock Images', short: 'Stock', tier: 3, description: 'Pre-existing stock photos' },
];

const TRANSLATION_PROVIDERS = [
  // Tier 1 - Best quality
  { id: 'deepl', name: 'DeepL Pro', short: 'DeepL', tier: 1, description: 'Highest quality EU languages' },
  { id: 'google-translate', name: 'Google Translate', short: 'Google', tier: 1, description: '249+ languages, reliable' },
  // Tier 2 - Specialized
  { id: 'qwen-mt', name: 'Qwen-MT', short: 'Qwen MT', tier: 2, description: 'Best for CJK languages' },
  { id: 'azure', name: 'Azure Translator', short: 'Azure', tier: 2, description: 'Enterprise, 135+ languages' },
  { id: 'aws-translate', name: 'AWS Translate', short: 'AWS', tier: 2, description: 'High volume, custom terminology' },
  // Tier 3 - LLM-based
  { id: 'gemini-translate', name: 'Gemini Translation', short: 'Gemini', tier: 3, description: 'Context-aware via Lovable AI' },
  { id: 'gpt-translate', name: 'GPT Translation', short: 'GPT', tier: 3, description: 'Context-aware, creative' },
  { id: 'claude-translate', name: 'Claude Translation', short: 'Claude', tier: 3, description: 'Literary, nuanced' },
  { id: 'nllb', name: 'NLLB (Meta)', short: 'NLLB', tier: 3, description: '200 languages, open source' },
];

const VOICE_PROVIDERS = [
  { id: 'elevenlabs-multilingual', name: 'ElevenLabs Multilingual', short: 'ElevenLabs', tier: 1, description: 'Most natural sounding' },
  { id: 'azure-neural', name: 'Azure Neural TTS', short: 'Azure TTS', tier: 1, description: 'Huge voice selection, SSML' },
  { id: 'google-wavenet', name: 'Google WaveNet', short: 'Google TTS', tier: 2, description: 'WaveNet voices, many languages' },
  { id: 'openai-tts-hd', name: 'OpenAI TTS HD', short: 'OpenAI TTS', tier: 2, description: 'Simple, good quality' },
  { id: 'alibaba-cosyvoice', name: 'Alibaba CosyVoice', short: 'CosyVoice', tier: 3, description: 'Best Chinese voices' },
  { id: 'amazon-polly', name: 'Amazon Polly', short: 'Polly', tier: 3, description: 'Neural voices, AWS' },
];

// Categories without AI Auto for Custom mode
const MANUAL_CONTENT_CATEGORIES = CONTENT_CATEGORIES.filter(c => c.id !== 'ai-generated');

// ==========================================
// PROPS INTERFACE
// ==========================================

interface ConfigurationPanelProps {
  workflowConfig: FinalWorkflowConfig | null;
  setWorkflowConfig: (config: FinalWorkflowConfig | null) => void;
  selectedAIModel: string;
  setSelectedAIModel: (model: string) => void;
  setImageModel: (model: any) => void;
  selectedLanguages: string[];
  isAutoSelect: boolean;
  setIsAutoSelect: (auto: boolean) => void;
  contentCategory: string;
  setContentCategory: (category: string) => void;
  selectedContentTypes: string[];
  setSelectedContentTypes: (types: string[]) => void;
  selectedOutputType?: OutputType;
  setSelectedOutputType?: (type: OutputType) => void;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  workflowConfig,
  setWorkflowConfig,
  selectedAIModel,
  setSelectedAIModel,
  setImageModel,
  selectedLanguages,
  isAutoSelect,
  setIsAutoSelect,
  contentCategory,
  setContentCategory,
  selectedContentTypes,
  setSelectedContentTypes,
  selectedOutputType,
  setSelectedOutputType,
}) => {
  // Mode state
  const [mode, setMode] = useState<'ai' | 'custom'>(isAutoSelect ? 'ai' : 'custom');
  
  // Local output type state (used if parent doesn't provide)
  const [localOutputType, setLocalOutputType] = useState<OutputType>('2d-static');
  const currentOutputType = selectedOutputType ?? localOutputType;
  const handleOutputTypeChange = (type: OutputType) => {
    if (setSelectedOutputType) {
      setSelectedOutputType(type);
    } else {
      setLocalOutputType(type);
    }
  };

  // Sync mode with isAutoSelect prop
  useEffect(() => {
    setIsAutoSelect(mode === 'ai');
  }, [mode, setIsAutoSelect]);

  // When switching to custom mode, reset category if it's ai-generated
  useEffect(() => {
    if (mode === 'custom' && contentCategory === 'ai-generated') {
      setContentCategory('business');
    }
  }, [mode, contentCategory, setContentCategory]);

  // Get AI model recommendations using the proper getRecommendedProviders function
  const modelRecommendation = useMemo(() => {
    const industry = workflowConfig?.industryCategory || '';
    const segment = workflowConfig?.segment || '';
    const collateralType = workflowConfig?.collateralType?.id || selectedContentTypes[0] || '';
    
    // Use the proper recommendation function from wizardConstants
    return getRecommendedProviders(industry, segment, collateralType, selectedLanguages);
  }, [workflowConfig?.industryCategory, workflowConfig?.segment, workflowConfig?.collateralType, selectedContentTypes, selectedLanguages]);

  // Auto-apply AI models when in AI Auto mode or when context changes
  useEffect(() => {
    if (mode === 'ai' && workflowConfig) {
      setWorkflowConfig({
        ...workflowConfig,
        aiRecommendation: {
          ...workflowConfig.aiRecommendation!,
          textModel: modelRecommendation.textModel,
          imageModel: modelRecommendation.imageModel,
          translationModel: modelRecommendation.translationModel,
          confidence: modelRecommendation.confidence,
        },
      });
      setSelectedAIModel(modelRecommendation.textModel);
      setImageModel(modelRecommendation.imageModel as any);
    }
  }, [mode, modelRecommendation.textModel, modelRecommendation.imageModel, modelRecommendation.translationModel]);

  // Handle industry change
  const handleIndustryChange = (value: string) => {
    if (!workflowConfig) return;
    const rec = getRecommendedProviders(value, '', workflowConfig?.collateralType?.id || '', selectedLanguages);
    setWorkflowConfig({
      ...workflowConfig,
      industryCategory: value,
      segment: '',
      aiRecommendation: mode === 'ai' ? rec : workflowConfig.aiRecommendation,
    });
    if (mode === 'ai') {
      setSelectedAIModel(rec.textModel);
      setImageModel(rec.imageModel as any);
    }
  };

  // Handle segment change
  const handleSegmentChange = (value: string) => {
    if (!workflowConfig) return;
    const rec = getRecommendedProviders(workflowConfig.industryCategory || '', value, workflowConfig?.collateralType?.id || '', selectedLanguages);
    setWorkflowConfig({
      ...workflowConfig,
      segment: value,
      aiRecommendation: mode === 'ai' ? rec : workflowConfig.aiRecommendation,
    });
    if (mode === 'ai') {
      setSelectedAIModel(rec.textModel);
      setImageModel(rec.imageModel as any);
    }
  };

  // Handle model change (custom mode only)
  const handleModelChange = (type: 'text' | 'image' | 'translation', value: string) => {
    if (!workflowConfig || mode === 'ai') return;
    const key = `${type}Model` as keyof typeof workflowConfig.aiRecommendation;
    setWorkflowConfig({
      ...workflowConfig,
      aiRecommendation: { ...workflowConfig.aiRecommendation!, [key]: value }
    });
    if (type === 'text') setSelectedAIModel(value);
    if (type === 'image') setImageModel(value as any);
  };

  // Current model values
  const currentModels = useMemo(() => ({
    text: workflowConfig?.aiRecommendation?.textModel || modelRecommendation.textModel,
    image: workflowConfig?.aiRecommendation?.imageModel || modelRecommendation.imageModel,
    translation: workflowConfig?.aiRecommendation?.translationModel || modelRecommendation.translationModel,
  }), [workflowConfig, modelRecommendation]);

  // Available segments for selected industry
  const availableSegments = workflowConfig?.industryCategory 
    ? SEGMENTS[workflowConfig.industryCategory] || []
    : [];

  // Categories for current mode
  const availableCategories = mode === 'ai' ? CONTENT_CATEGORIES : MANUAL_CONTENT_CATEGORIES;

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
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

      {/* Industry & Segment Section - Both Modes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Industry Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Industry Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Industry</Label>
              <Select value={workflowConfig?.industryCategory || ''} onValueChange={handleIndustryChange}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  {INDUSTRY_CATEGORIES.map(industry => (
                    <SelectItem key={industry.id} value={industry.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{industry.icon}</span>
                        <span>{industry.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <Separator className="my-1" />
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndustry = prompt('Enter new industry name:');
                      if (newIndustry) toast.success(`Industry "${newIndustry}" noted.`);
                    }}
                  >
                    <span>+</span>
                    <span>Add New...</span>
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Segment Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">
                Segment <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Select
                value={workflowConfig?.segment || ''}
                onValueChange={handleSegmentChange}
                disabled={!workflowConfig?.industryCategory || availableSegments.length === 0}
              >
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue placeholder={workflowConfig?.industryCategory ? "Select segment..." : "Select industry first"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  {availableSegments.map(segment => (
                    <SelectItem key={segment.id} value={segment.id}>
                      <div className="flex flex-col">
                        <span>{segment.name}</span>
                        <span className="text-xs text-muted-foreground">{segment.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Type Section - Both Modes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Content Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Dropdown */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Category</Label>
            <Select value={contentCategory} onValueChange={setContentCategory}>
              <SelectTrigger className="h-10 bg-background">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                {availableCategories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span>{cat.label}</span>
                        {cat.isAI && <Badge variant="secondary" className="text-[10px] ml-1">AI</Badge>}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Content Types Multi-select */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Content Types</Label>
            <ContentTypeMultiSelect
              selectedTypes={selectedContentTypes}
              onTypesChange={setSelectedContentTypes}
              categoryFilter={contentCategory !== 'ai-generated' ? contentCategory : undefined}
            />
          </div>

          {/* Selected badges */}
          {selectedContentTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedContentTypes.map(typeId => {
                const ct = EXTENDED_COLLATERAL_TYPES.find(c => c.id === typeId);
                return ct ? (
                  <Badge key={typeId} variant="secondary" className="text-xs">
                    {ct.name}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => setSelectedContentTypes(selectedContentTypes.filter(t => t !== typeId))}
                    >
                      ×
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Type Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Output Type
            {currentOutputType !== '2d-static' && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {OUTPUT_TYPE_CONFIGS.find(o => o.id === currentOutputType)?.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Output Type Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OUTPUT_TYPE_CONFIGS.map(outputType => {
              const Icon = OUTPUT_TYPE_ICONS[outputType.id];
              const isSelected = currentOutputType === outputType.id;
              return (
                <button
                  key={outputType.id}
                  onClick={() => handleOutputTypeChange(outputType.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center",
                    isSelected 
                      ? "border-primary bg-primary/10 ring-1 ring-primary" 
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <div className="space-y-0.5">
                    <p className={cn("text-xs font-medium", isSelected && "text-primary")}>{outputType.name}</p>
                    {outputType.tier === 3 && (
                      <Badge variant="outline" className="text-[9px] px-1">Pro</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Output Type Details */}
          {currentOutputType && (
            <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {OUTPUT_TYPE_CONFIGS.find(o => o.id === currentOutputType)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {OUTPUT_TYPE_CONFIGS.find(o => o.id === currentOutputType)?.description}
                  </p>
                </div>
              </div>
              
              {/* Capabilities */}
              <div className="flex flex-wrap gap-1 pl-6">
                {OUTPUT_TYPE_CONFIGS.find(o => o.id === currentOutputType)?.capabilities.map((cap, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
                ))}
              </div>
              
              {/* Available Providers */}
              <div className="pl-6">
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-medium">Providers: </span>
                  {OUTPUT_TYPE_CONFIGS.find(o => o.id === currentOutputType)?.providers.slice(0, 4).join(', ')}
                  {(OUTPUT_TYPE_CONFIGS.find(o => o.id === currentOutputType)?.providers.length || 0) > 4 && '...'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Models Section */}
      <Card className={mode === 'ai' ? 'border-primary/20' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Models
            {mode === 'ai' && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {modelRecommendation.confidence}% match
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Auto Mode - Show recommendation info with alternatives */}
          {mode === 'ai' && (
            <div className="p-3 rounded-lg bg-muted/50 border mb-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {modelRecommendation.reason}
                </p>
              </div>
              {modelRecommendation.alternativeTextModels && modelRecommendation.alternativeTextModels.length > 0 && (
                <div className="text-xs text-muted-foreground pl-6">
                  <span className="font-medium">Alternatives: </span>
                  {modelRecommendation.alternativeTextModels.slice(0, 2).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Model Grid - Read-only in AI mode, editable in Custom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Text Model */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                <Label className="text-xs font-medium text-foreground">Text Model</Label>
              </div>
              {mode === 'ai' ? (
                <div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm gap-2">
                  <span>{TEXT_PROVIDERS.find(p => p.id === currentModels.text)?.short || currentModels.text}</span>
                  <Badge variant="outline" className="text-[10px]">AI Selected</Badge>
                </div>
              ) : (
                <Select value={currentModels.text} onValueChange={(val) => handleModelChange('text', val)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">{TEXT_PROVIDERS.find(p => p.id === currentModels.text)?.short || currentModels.text}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border shadow-lg max-h-[300px]">
                    <ScrollArea className="h-[280px]">
                      {TEXT_PROVIDERS.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{p.name}</span>
                              {p.tier === 1 && <Badge variant="default" className="text-[9px] px-1">Tier 1</Badge>}
                              {p.tier === 2 && <Badge variant="secondary" className="text-[9px] px-1">Tier 2</Badge>}
                            </div>
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Image Model */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <Label className="text-xs font-medium text-foreground">Image Model</Label>
              </div>
              {mode === 'ai' ? (
                <div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm gap-2">
                  <span>{IMAGE_PROVIDERS.find(p => p.id === currentModels.image)?.short || currentModels.image}</span>
                  <Badge variant="outline" className="text-[10px]">AI Selected</Badge>
                </div>
              ) : (
                <Select value={currentModels.image} onValueChange={(val) => handleModelChange('image', val)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">{IMAGE_PROVIDERS.find(p => p.id === currentModels.image)?.short || currentModels.image}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border shadow-lg max-h-[300px]">
                    <ScrollArea className="h-[280px]">
                      {IMAGE_PROVIDERS.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{p.name}</span>
                              {p.tier === 1 && <Badge variant="default" className="text-[9px] px-1">Tier 1</Badge>}
                              {p.tier === 2 && <Badge variant="secondary" className="text-[9px] px-1">Tier 2</Badge>}
                            </div>
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Translation Model */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                <Label className="text-xs font-medium text-foreground">Translation</Label>
              </div>
              {mode === 'ai' ? (
                <div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm gap-2">
                  <span>{TRANSLATION_PROVIDERS.find(p => p.id === currentModels.translation)?.short || currentModels.translation}</span>
                  <Badge variant="outline" className="text-[10px]">AI Selected</Badge>
                </div>
              ) : (
                <Select value={currentModels.translation} onValueChange={(val) => handleModelChange('translation', val)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">{TRANSLATION_PROVIDERS.find(p => p.id === currentModels.translation)?.short || currentModels.translation}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border shadow-lg max-h-[300px]">
                    <ScrollArea className="h-[280px]">
                      {TRANSLATION_PROVIDERS.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{p.name}</span>
                              {p.tier === 1 && <Badge variant="default" className="text-[9px] px-1">Tier 1</Badge>}
                              {p.tier === 2 && <Badge variant="secondary" className="text-[9px] px-1">Tier 2</Badge>}
                            </div>
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Mode switch hint */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setMode(mode === 'ai' ? 'custom' : 'ai')}
          >
            {mode === 'ai' ? (
              <>
                <Pencil className="h-3 w-3 mr-1" />
                Want to choose models manually? Switch to Custom
              </>
            ) : (
              <>
                <Bot className="h-3 w-3 mr-1" />
                Let AI choose optimal models for your context
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ==========================================
// CONTENT TYPE MULTI-SELECT DROPDOWN
// ==========================================

interface ContentTypeMultiSelectProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  categoryFilter?: string;
}

const ContentTypeMultiSelect: React.FC<ContentTypeMultiSelectProps> = ({
  selectedTypes,
  onTypesChange,
  categoryFilter,
}) => {
  const [open, setOpen] = useState(false);

  const filteredTypes = categoryFilter
    ? EXTENDED_COLLATERAL_TYPES.filter(ct => ct.category === categoryFilter)
    : EXTENDED_COLLATERAL_TYPES;

  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypesChange(selectedTypes.filter(id => id !== typeId));
    } else {
      onTypesChange([...selectedTypes, typeId]);
    }
  };

  const displayText = selectedTypes.length === 0
    ? 'Select content types...'
    : `${selectedTypes.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 text-sm font-normal"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 z-50 bg-popover border shadow-lg" align="start">
        <ScrollArea className="h-[280px]">
          <div className="p-2 space-y-1">
            {filteredTypes.map(ct => (
              <div
                key={ct.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                  selectedTypes.includes(ct.id) && "bg-primary/10"
                )}
                onClick={() => toggleType(ct.id)}
              >
                <Checkbox
                  checked={selectedTypes.includes(ct.id)}
                  className="pointer-events-none"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ct.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{ct.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {selectedTypes.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onTypesChange([])}
            >
              Clear All
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ConfigurationPanel;
