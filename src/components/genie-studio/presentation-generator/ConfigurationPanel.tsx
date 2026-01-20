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

// ==========================================
// PROVIDER CONFIGURATIONS
// ==========================================

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
}) => {
  // Mode state
  const [mode, setMode] = useState<'ai' | 'custom'>(isAutoSelect ? 'ai' : 'custom');

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

  // Get AI model recommendations based on current selections
  const modelRecommendation = useMemo(() => {
    const industry = workflowConfig?.industryCategory || '';
    const segment = workflowConfig?.segment || '';
    const hasAsianLangs = selectedLanguages.some(l => ['zh', 'ja', 'ko', 'th', 'vi'].includes(l));
    
    let textModel = 'google/gemini-3-flash-preview';
    let reasoning = 'Gemini 3 Flash - fast and versatile for general content.';
    
    if (['healthcare', 'pharma', 'legal'].includes(industry)) {
      textModel = 'claude-3-5-sonnet';
      reasoning = `Claude 3.5 Sonnet - optimized for ${industry} domain accuracy.`;
    } else if (['consulting'].includes(industry)) {
      textModel = 'openai/gpt-5';
      reasoning = 'GPT-5 - premium quality for strategic consulting content.';
    } else if (hasAsianLangs) {
      textModel = 'alibaba/qwen-2.5';
      reasoning = 'Qwen 2.5 - superior Asian language support.';
    }
    
    const imageModel = contentCategory === 'visual' ? 'modelslab' : 'flux-pro';
    const translationModel = hasAsianLangs ? 'qwen-mt' : 'deepl';
    
    const confidence = Math.min(98, 75 + (industry ? 10 : 0) + (segment ? 5 : 0) + (selectedContentTypes.length > 0 ? 8 : 0));
    
    return { textModel, imageModel, translationModel, reasoning, confidence };
  }, [workflowConfig, selectedLanguages, contentCategory, selectedContentTypes]);

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
          {/* AI Auto Mode - Show recommendation info */}
          {mode === 'ai' && (
            <div className="p-3 rounded-lg bg-muted/50 border mb-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {modelRecommendation.reasoning} Models auto-selected based on your industry, segment, and content choices.
                </p>
              </div>
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
                <div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm">
                  {TEXT_PROVIDERS.find(p => p.id === currentModels.text)?.short || 'Auto'}
                </div>
              ) : (
                <Select value={currentModels.text} onValueChange={(val) => handleModelChange('text', val)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">{TEXT_PROVIDERS.find(p => p.id === currentModels.text)?.short}</span>
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
              )}
            </div>

            {/* Image Model */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <Label className="text-xs font-medium text-foreground">Image Model</Label>
              </div>
              {mode === 'ai' ? (
                <div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm">
                  {IMAGE_PROVIDERS.find(p => p.id === currentModels.image)?.short || 'Auto'}
                </div>
              ) : (
                <Select value={currentModels.image} onValueChange={(val) => handleModelChange('image', val)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">{IMAGE_PROVIDERS.find(p => p.id === currentModels.image)?.short}</span>
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
              )}
            </div>

            {/* Translation Model */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                <Label className="text-xs font-medium text-foreground">Translation</Label>
              </div>
              {mode === 'ai' ? (
                <div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm">
                  {TRANSLATION_PROVIDERS.find(p => p.id === currentModels.translation)?.short || 'Auto'}
                </div>
              ) : (
                <Select value={currentModels.translation} onValueChange={(val) => handleModelChange('translation', val)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue>
                      <span className="truncate">{TRANSLATION_PROVIDERS.find(p => p.id === currentModels.translation)?.short}</span>
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
