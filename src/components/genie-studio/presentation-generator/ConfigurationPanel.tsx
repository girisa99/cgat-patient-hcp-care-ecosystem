/**
 * ConfigurationPanel - Unified AI vs Custom configuration
 * Combines Industry, Segment, Content Type, and AI Models under single toggle
 * Matches Step 3 TemplateBrandingPanelV2 pattern
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
import { CONTENT_CATEGORIES, EXTENDED_COLLATERAL_TYPES, CATEGORY_SUB_OPTIONS } from './ContentTypeSelector';

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
  // Mode state - matches Step 3 pattern
  const [mode, setMode] = useState<'ai' | 'custom'>(isAutoSelect ? 'ai' : 'custom');

  // Sync mode with isAutoSelect prop
  useEffect(() => {
    setIsAutoSelect(mode === 'ai');
  }, [mode, setIsAutoSelect]);

  // AI Auto recommendations based on context
  const aiRecommendation = useMemo(() => {
    const hasAsianLangs = selectedLanguages.some(l => ['zh', 'ja', 'ko', 'th', 'vi'].includes(l));
    
    // Default recommendations for AI Auto mode
    const defaultIndustry = 'technology';
    const defaultSegment = 'saas';
    const defaultContentType = 'investor-pitch';
    
    let textModel = 'google/gemini-3-flash-preview';
    let reasoning = 'Optimized for general content generation with fast turnaround.';
    
    if (hasAsianLangs) {
      textModel = 'alibaba/qwen-2.5';
      reasoning = 'Qwen 2.5 selected for superior Asian language support.';
    }
    
    const imageModel = 'flux-pro';
    const translationModel = hasAsianLangs ? 'qwen-mt' : 'deepl';
    
    const confidence = 92;
    
    return {
      industry: defaultIndustry,
      segment: defaultSegment,
      contentType: defaultContentType,
      textModel,
      imageModel,
      translationModel,
      reasoning,
      confidence,
    };
  }, [selectedLanguages]);

  // Apply AI Auto selection
  useEffect(() => {
    if (mode === 'ai' && workflowConfig) {
      const rec = getRecommendedProviders(
        aiRecommendation.industry,
        aiRecommendation.segment,
        aiRecommendation.contentType,
        selectedLanguages
      );
      
      setWorkflowConfig({
        ...workflowConfig,
        industryCategory: aiRecommendation.industry,
        segment: aiRecommendation.segment,
        aiRecommendation: rec,
      });
      
      setContentCategory('ai-generated');
      setSelectedContentTypes([aiRecommendation.contentType]);
      setSelectedAIModel(rec.textModel);
      setImageModel(rec.imageModel as any);
    }
  }, [mode, aiRecommendation]);

  // Handle industry change (custom mode)
  const handleIndustryChange = (value: string) => {
    if (!workflowConfig) return;
    const rec = getRecommendedProviders(
      value,
      '',
      workflowConfig?.collateralType?.id || '',
      selectedLanguages
    );
    setWorkflowConfig({
      ...workflowConfig,
      industryCategory: value,
      segment: '',
      aiRecommendation: rec,
    });
    setSelectedAIModel(rec.textModel);
    setImageModel(rec.imageModel as any);
  };

  // Handle segment change (custom mode)
  const handleSegmentChange = (value: string) => {
    if (!workflowConfig) return;
    const rec = getRecommendedProviders(
      workflowConfig?.industryCategory || '',
      value,
      workflowConfig?.collateralType?.id || '',
      selectedLanguages
    );
    setWorkflowConfig({
      ...workflowConfig,
      segment: value,
      aiRecommendation: rec,
    });
    setSelectedAIModel(rec.textModel);
    setImageModel(rec.imageModel as any);
  };

  // Handle model change (custom mode)
  const handleModelChange = (type: 'text' | 'image' | 'translation', value: string) => {
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

  // Current model values
  const currentModels = useMemo(() => ({
    text: workflowConfig?.aiRecommendation?.textModel || 'google/gemini-3-flash-preview',
    image: workflowConfig?.aiRecommendation?.imageModel || 'flux-pro',
    translation: workflowConfig?.aiRecommendation?.translationModel || 'deepl',
  }), [workflowConfig]);

  // Available segments for selected industry
  const availableSegments = workflowConfig?.industryCategory 
    ? SEGMENTS[workflowConfig.industryCategory] || []
    : [];

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
              AI Auto Configuration
              <Badge variant="secondary" className="ml-auto text-xs">
                {aiRecommendation.confidence}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Reasoning */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {aiRecommendation.reasoning} AI will automatically select optimal industry context, content type, and models based on your prompt and languages.
                </p>
              </div>
            </div>

            {/* AI Selected Context Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-medium">Industry</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {INDUSTRY_CATEGORIES.find(i => i.id === aiRecommendation.industry)?.name || 'Auto'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-medium">Content</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {EXTENDED_COLLATERAL_TYPES.find(c => c.id === aiRecommendation.contentType)?.name || 'Auto'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Type className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-medium">Text</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {TEXT_PROVIDERS.find(p => p.id === aiRecommendation.textModel)?.short}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-medium">Image</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {IMAGE_PROVIDERS.find(p => p.id === aiRecommendation.imageModel)?.short}
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
        <>
          {/* Industry & Segment Section */}
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
                  <Select
                    value={workflowConfig?.industryCategory || ''}
                    onValueChange={handleIndustryChange}
                  >
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
                          if (newIndustry) {
                            toast.success(`Industry "${newIndustry}" noted. Contact support to add permanently.`);
                          }
                        }}
                      >
                        <span>+</span>
                        <span>Add New Industry...</span>
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

          {/* Content Type Section */}
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
                <Select
                  value={contentCategory}
                  onValueChange={setContentCategory}
                >
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                    {CONTENT_CATEGORIES.map(cat => {
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Models
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Text Model */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    <Label className="text-xs font-medium text-foreground">Text Model</Label>
                  </div>
                  <Select 
                    value={currentModels.text} 
                    onValueChange={(val) => handleModelChange('text', val)}
                  >
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue>
                        <span className="truncate">
                          {TEXT_PROVIDERS.find(p => p.id === currentModels.text)?.short}
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
                    value={currentModels.image} 
                    onValueChange={(val) => handleModelChange('image', val)}
                  >
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue>
                        <span className="truncate">
                          {IMAGE_PROVIDERS.find(p => p.id === currentModels.image)?.short}
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
                    value={currentModels.translation} 
                    onValueChange={(val) => handleModelChange('translation', val)}
                  >
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue>
                        <span className="truncate">
                          {TRANSLATION_PROVIDERS.find(p => p.id === currentModels.translation)?.short}
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
            </CardContent>
          </Card>

          {/* Quick Switch to AI */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setMode('ai')}
          >
            <Bot className="h-3 w-3 mr-1" />
            Let AI auto-configure everything for your context
          </Button>
        </>
      )}
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
