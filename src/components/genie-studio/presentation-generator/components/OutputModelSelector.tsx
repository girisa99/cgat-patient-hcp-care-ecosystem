/**
 * Output Model Selector Component
 * Primary + Override + Multi-Select Pattern for AI Model Selection
 * 
 * Features:
 * - AI-recommended primary model with confidence score
 * - User override dropdown
 * - Multi-select for fallback/comparison models
 * - Tier-based filtering
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ChevronDown,
  Sparkles,
  Zap,
  Check,
  X,
  Brain,
  Cpu,
  Clock,
  DollarSign,
  Star,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ModelCategory,
  ModelOption,
  OutputModelConfig,
  getModelsForCategory,
  getRecommendedPrimaryModel,
  getAlternativeModels,
  buildOutputModelConfig,
  calculateCostMultiplier,
  estimateGenerationTime,
  TierBadgeColors,
  TierLabels,
} from '../services/outputModelSelection';

// ==========================================
// TYPES
// ==========================================

export interface OutputModelSelectorProps {
  category: ModelCategory;
  outputId: string;
  globalTier: 1 | 2 | 3;
  industry?: string;
  languageCode?: string;
  preferSpeed?: boolean;
  preferQuality?: boolean;
  onSelectionChange: (config: OutputModelConfig) => void;
  className?: string;
}

interface ModelCardProps {
  model: ModelOption;
  isSelected: boolean;
  isPrimary: boolean;
  isRecommended: boolean;
  onSelect: () => void;
  showCheckbox?: boolean;
}

// ==========================================
// MODEL CARD SUB-COMPONENT
// ==========================================

function ModelCard({
  model,
  isSelected,
  isPrimary,
  isRecommended,
  onSelect,
  showCheckbox = false,
}: ModelCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border',
        isSelected
          ? 'bg-primary/10 border-primary/40 shadow-sm'
          : isPrimary
          ? 'bg-muted/50 border-primary/20'
          : 'hover:bg-muted border-transparent hover:border-border'
      )}
      onClick={onSelect}
    >
      {showCheckbox && (
        <Checkbox
          checked={isSelected}
          className="mt-1 pointer-events-none"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{model.name}</span>
          
          {/* Tier Badge */}
          <Badge
            variant="outline"
            className={cn('text-[9px] px-1.5', TierBadgeColors[model.tier])}
          >
            {TierLabels[model.tier]}
          </Badge>
          
          {/* Recommended Badge */}
          {isRecommended && (
            <Badge className="text-[9px] px-1.5 bg-amber-100 text-amber-700 border-amber-300">
              <Star className="h-2.5 w-2.5 mr-0.5" />
              AI Pick
            </Badge>
          )}
          
          {/* Primary Badge */}
          {isPrimary && !isRecommended && (
            <Badge variant="secondary" className="text-[9px] px-1.5">
              Primary
            </Badge>
          )}
          
          {isSelected && (
            <Check className="h-4 w-4 text-primary ml-auto shrink-0" />
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-0.5">{model.provider}</p>
        
        {/* Metrics Row */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1" title="Quality Score">
            <Star className="h-3 w-3" />
            {model.qualityScore}
          </span>
          <span className="flex items-center gap-1" title="Speed Score">
            <Zap className="h-3 w-3" />
            {model.speedScore}
          </span>
          <span className="flex items-center gap-1" title="Cost Multiplier">
            <DollarSign className="h-3 w-3" />
            {model.costMultiplier}x
          </span>
        </div>
        
        {/* Capabilities */}
        {model.capabilities && model.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {model.capabilities.slice(0, 3).map(cap => (
              <Badge key={cap} variant="outline" className="text-[8px] px-1 py-0">
                {cap}
              </Badge>
            ))}
            {model.capabilities.length > 3 && (
              <Badge variant="outline" className="text-[8px] px-1 py-0">
                +{model.capabilities.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function OutputModelSelector({
  category,
  outputId,
  globalTier,
  industry,
  languageCode,
  preferSpeed = false,
  preferQuality = true,
  onSelectionChange,
  className,
}: OutputModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'ai-auto' | 'user-override' | 'multi-select'>('ai-auto');
  const [selectedOverrides, setSelectedOverrides] = useState<string[]>([]);
  
  // Build initial config with AI recommendation
  const config = useMemo(() => {
    return buildOutputModelConfig(outputId, category, {
      globalTier,
      industry,
      languageCode,
      preferSpeed,
      preferQuality,
    });
  }, [outputId, category, globalTier, industry, languageCode, preferSpeed, preferQuality]);
  
  // Get all available models
  const allModels = useMemo(() => {
    return getModelsForCategory(category, globalTier);
  }, [category, globalTier]);
  
  // Current primary model (AI or user-selected)
  const primaryModel = useMemo(() => {
    if (mode === 'user-override' && selectedOverrides.length > 0) {
      return allModels.find(m => m.id === selectedOverrides[0]) || config.primaryModel;
    }
    return config.primaryModel;
  }, [mode, selectedOverrides, allModels, config.primaryModel]);
  
  // Selected models for multi-select mode
  const selectedModels = useMemo(() => {
    if (mode === 'multi-select') {
      return allModels.filter(m => selectedOverrides.includes(m.id));
    }
    return primaryModel ? [primaryModel] : [];
  }, [mode, selectedOverrides, allModels, primaryModel]);
  
  // Handle model selection
  const handleModelSelect = useCallback((modelId: string) => {
    if (mode === 'multi-select') {
      // Toggle selection
      const newSelection = selectedOverrides.includes(modelId)
        ? selectedOverrides.filter(id => id !== modelId)
        : [...selectedOverrides, modelId];
      setSelectedOverrides(newSelection);
      
      // Emit change
      onSelectionChange({
        ...config,
        selectedOverrides: newSelection,
        selectionMode: mode,
      });
    } else {
      // Single selection override
      setSelectedOverrides([modelId]);
      setMode('user-override');
      
      onSelectionChange({
        ...config,
        selectedOverrides: [modelId],
        selectionMode: 'user-override',
      });
    }
  }, [mode, selectedOverrides, config, onSelectionChange]);
  
  // Handle mode change
  const handleModeChange = useCallback((newMode: 'ai-auto' | 'user-override' | 'multi-select') => {
    setMode(newMode);
    
    if (newMode === 'ai-auto') {
      setSelectedOverrides([]);
      onSelectionChange({
        ...config,
        selectedOverrides: [],
        selectionMode: 'ai-auto',
      });
    }
  }, [config, onSelectionChange]);
  
  // Calculate costs for current selection
  const costInfo = useMemo(() => {
    const models = selectedModels.length > 0 ? selectedModels : (primaryModel ? [primaryModel] : []);
    return {
      multiplier: calculateCostMultiplier(models),
      time: estimateGenerationTime(models, 5),
    };
  }, [selectedModels, primaryModel]);
  
  // Display text for trigger
  const getDisplayText = () => {
    if (mode === 'ai-auto' && primaryModel) {
      return `AI: ${primaryModel.name}`;
    }
    if (mode === 'multi-select' && selectedModels.length > 0) {
      return `${selectedModels.length} models selected`;
    }
    if (primaryModel) {
      return primaryModel.name;
    }
    return `Select ${category} model...`;
  };
  
  const categoryLabels: Record<ModelCategory, string> = {
    image: 'Image Generation',
    video: 'Video Generation',
    '3d': '3D Generation',
    voice: 'Voice/TTS',
    text: 'Text/LLM',
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          {categoryLabels[category]}
        </Label>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleModeChange('ai-auto')}
            className={cn(
              'px-2 py-0.5 text-[10px] rounded transition-colors',
              mode === 'ai-auto'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Sparkles className="h-3 w-3 inline mr-1" />
            AI Auto
          </button>
          <button
            onClick={() => handleModeChange('multi-select')}
            className={cn(
              'px-2 py-0.5 text-[10px] rounded transition-colors',
              mode === 'multi-select'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            Multi
          </button>
        </div>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 text-sm font-normal"
          >
            <div className="flex items-center gap-2 truncate">
              {mode === 'ai-auto' && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              {mode === 'multi-select' && <Cpu className="h-3.5 w-3.5 text-primary" />}
              <span className="truncate">{getDisplayText()}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[380px] p-0 z-50 bg-popover border shadow-lg" align="start">
          {/* Header */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{categoryLabels[category]}</span>
              <Badge variant="outline" className="text-[9px]">
                Tier 1-{globalTier}
              </Badge>
            </div>
            
            {/* AI Recommendation Info */}
            {config.primaryModel && config.primaryReason && (
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      AI Recommendation: {config.primaryModel.name}
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">
                      {config.primaryReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Model List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {allModels.map(model => {
                const isSelected = mode === 'multi-select'
                  ? selectedOverrides.includes(model.id)
                  : (mode === 'user-override' ? selectedOverrides[0] === model.id : model.id === config.primaryModel?.id);
                const isPrimary = model.id === config.primaryModel?.id;
                const isRecommended = isPrimary && mode === 'ai-auto';
                
                return (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isSelected={isSelected}
                    isPrimary={isPrimary}
                    isRecommended={isRecommended}
                    onSelect={() => handleModelSelect(model.id)}
                    showCheckbox={mode === 'multi-select'}
                  />
                );
              })}
            </div>
          </ScrollArea>
          
          {/* Footer with Cost Summary */}
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  {costInfo.multiplier.toFixed(1)}x cost
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {costInfo.time.min}-{costInfo.time.max}min
                </span>
              </div>
              
              {selectedModels.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {selectedModels.length} selected
                </Badge>
              )}
            </div>
            
            {/* Multi-select warning */}
            {mode === 'multi-select' && selectedModels.length > 2 && (
              <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                Multiple models increase generation time and cost
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Selected models summary for multi-select */}
      {mode === 'multi-select' && selectedModels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedModels.map(model => (
            <Badge key={model.id} variant="secondary" className="text-[10px] gap-1">
              {model.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleModelSelect(model.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default OutputModelSelector;
