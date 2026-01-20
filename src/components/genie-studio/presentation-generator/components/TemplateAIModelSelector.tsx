/**
 * TemplateAIModelSelector - AI model selection with confidence scores and rankings
 * Allows users to select AI models for template generation with recommendations
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Wand2,
  Check,
  Lock,
  Star,
  Zap,
  DollarSign,
  Info,
  ChevronDown,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type TemplateAIModelConfig,
  type AIProvider,
  AI_PROVIDERS,
  getProvidersByCategory,
  getRecommendedAIConfig,
} from '@/hooks/useTemplateLibrary';

interface TemplateAIModelSelectorProps {
  industry: string;
  languages?: string[];
  contentType?: string;
  value?: TemplateAIModelConfig;
  onChange: (config: TemplateAIModelConfig) => void;
  compact?: boolean;
  showRecommendations?: boolean;
}

// Tier badge component
const TierBadge: React.FC<{ tier: string; type: 'cost' | 'speed' | 'quality' }> = ({ tier, type }) => {
  const configs: Record<string, Record<string, { label: string; className: string }>> = {
    cost: {
      low: { label: '$', className: 'bg-primary/10 text-primary border-primary/20' },
      medium: { label: '$$', className: 'bg-accent/10 text-accent-foreground border-accent/20' },
      high: { label: '$$$', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    },
    speed: {
      fast: { label: '⚡ Fast', className: 'bg-primary/10 text-primary border-primary/20' },
      medium: { label: '🔄 Med', className: 'bg-accent/10 text-accent-foreground border-accent/20' },
      slow: { label: '🐢 Slow', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    },
    quality: {
      basic: { label: '★', className: 'bg-muted text-muted-foreground border-muted' },
      standard: { label: '★★', className: 'bg-primary/10 text-primary border-primary/20' },
      premium: { label: '★★★', className: 'bg-primary/20 text-primary border-primary/30' },
    },
  };

  const config = configs[type][tier as keyof typeof configs[typeof type]];
  if (!config) return null;

  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", config.className)}>
      {config.label}
    </Badge>
  );
};

// Provider card for detailed view
const ProviderCard: React.FC<{
  provider: AIProvider;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}> = ({ provider, isSelected, isRecommended, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-3 rounded-lg border text-left transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{provider.name}</span>
            {isRecommended && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-primary/10 text-primary">
                Recommended
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <TierBadge tier={provider.costTier} type="cost" />
            <TierBadge tier={provider.speedTier} type="speed" />
            <TierBadge tier={provider.qualityTier} type="quality" />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {provider.bestFor.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0 bg-muted/50">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-primary">{provider.confidenceScore}%</span>
            {isSelected && <Check className="h-4 w-4 text-primary" />}
          </div>
          <span className="text-[10px] text-muted-foreground">#{provider.ranking} rank</span>
        </div>
      </div>
    </button>
  );
};

// Category selector with expanded view
const CategoryModelSelector: React.FC<{
  category: AIProvider['category'];
  icon: React.ElementType;
  label: string;
  value: string;
  recommendedId: string;
  onChange: (value: string) => void;
  isAutoSelect: boolean;
}> = ({ category, icon: Icon, label, value, recommendedId, onChange, isAutoSelect }) => {
  const [showDetails, setShowDetails] = useState(false);
  const providers = getProvidersByCategory(category);
  const selectedProvider = providers.find(p => p.id === value);
  const recommendedProvider = providers.find(p => p.id === recommendedId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <Label className="text-xs font-medium text-foreground">{label}</Label>
          {isAutoSelect && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3 mr-1" />
              Compare
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {label} Models
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                {providers.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isSelected={value === provider.id}
                    isRecommended={provider.id === recommendedId}
                    onSelect={() => {
                      if (!isAutoSelect) {
                        onChange(provider.id);
                        setShowDetails(false);
                      }
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={isAutoSelect}
      >
        <SelectTrigger className={cn(
          "h-10 bg-background",
          isAutoSelect && "opacity-60 cursor-not-allowed"
        )}>
          <SelectValue>
            <div className="flex items-center justify-between w-full pr-2">
              <span className="truncate">{selectedProvider?.shortName || value}</span>
              {selectedProvider && (
                <span className="text-xs text-primary font-medium ml-2">
                  {selectedProvider.confidenceScore}%
                </span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover border shadow-lg">
          {providers.map(p => (
            <SelectItem key={p.id} value={p.id}>
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  {p.id === recommendedId && (
                    <Sparkles className="h-3 w-3 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TierBadge tier={p.qualityTier} type="quality" />
                  <span className="text-xs text-muted-foreground">#{p.ranking}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const TemplateAIModelSelector: React.FC<TemplateAIModelSelectorProps> = ({
  industry,
  languages = [],
  contentType,
  value,
  onChange,
  compact = false,
  showRecommendations = true,
}) => {
  const [isAutoSelect, setIsAutoSelect] = useState(true);

  // Get AI recommendations
  const recommendations = useMemo(() => {
    return getRecommendedAIConfig(industry, languages, contentType);
  }, [industry, languages, contentType]);

  // Current values (use recommendations if auto, otherwise use provided value)
  const current = useMemo((): TemplateAIModelConfig => {
    if (isAutoSelect) return recommendations;
    return value || recommendations;
  }, [isAutoSelect, value, recommendations]);

  // Handle model change
  const handleModelChange = (type: keyof Omit<TemplateAIModelConfig, 'confidence' | 'reasoning'>, newValue: string) => {
    if (isAutoSelect) return;
    
    const updated: TemplateAIModelConfig = {
      ...current,
      [type]: newValue,
    };
    
    // Recalculate confidence
    const textProvider = AI_PROVIDERS.find(p => p.id === updated.textModel);
    const imageProvider = AI_PROVIDERS.find(p => p.id === updated.imageModel);
    const voiceProvider = AI_PROVIDERS.find(p => p.id === updated.voiceModel);
    const translationProvider = AI_PROVIDERS.find(p => p.id === updated.translationModel);
    
    const avgConfidence = Math.round(
      ((textProvider?.confidenceScore || 80) +
        (imageProvider?.confidenceScore || 80) +
        (voiceProvider?.confidenceScore || 80) +
        (translationProvider?.confidenceScore || 80)) / 4
    );
    
    updated.confidence = avgConfidence;
    onChange(updated);
  };

  // Toggle auto-select
  const handleAutoSelectChange = (auto: boolean) => {
    setIsAutoSelect(auto);
    if (auto) {
      onChange(recommendations);
    }
  };

  if (compact) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Models</span>
            </div>
            <Badge 
              variant="outline"
              className={cn(
                "text-xs",
                current.confidence >= 90 ? "bg-primary/10 text-primary border-primary/20" :
                current.confidence >= 80 ? "bg-accent/10 text-accent-foreground border-accent/20" :
                "bg-muted text-muted-foreground border-muted"
              )}
            >
              {current.confidence}% match
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            AI Model Configuration
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline"
              className={cn(
                "text-xs",
                current.confidence >= 90 ? "bg-primary/10 text-primary border-primary/20" :
                current.confidence >= 80 ? "bg-accent/10 text-accent-foreground border-accent/20" :
                "bg-muted text-muted-foreground border-muted"
              )}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {current.confidence}% confidence
            </Badge>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-ai" className="text-xs text-muted-foreground">Auto</Label>
              <Switch
                id="auto-ai"
                checked={isAutoSelect}
                onCheckedChange={handleAutoSelectChange}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommendation reasoning */}
        {showRecommendations && isAutoSelect && recommendations.reasoning && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">AI Recommendation</p>
              <p className="text-xs text-muted-foreground mt-0.5">{recommendations.reasoning}</p>
            </div>
          </div>
        )}

        {/* Model Grid */}
        <div className="grid grid-cols-2 gap-4">
          <CategoryModelSelector
            category="text"
            icon={Type}
            label="Text Model"
            value={current.textModel}
            recommendedId={recommendations.textModel}
            onChange={(v) => handleModelChange('textModel', v)}
            isAutoSelect={isAutoSelect}
          />
          <CategoryModelSelector
            category="image"
            icon={ImageIcon}
            label="Image Model"
            value={current.imageModel}
            recommendedId={recommendations.imageModel}
            onChange={(v) => handleModelChange('imageModel', v)}
            isAutoSelect={isAutoSelect}
          />
          <CategoryModelSelector
            category="voice"
            icon={Mic}
            label="Voice Model"
            value={current.voiceModel}
            recommendedId={recommendations.voiceModel}
            onChange={(v) => handleModelChange('voiceModel', v)}
            isAutoSelect={isAutoSelect}
          />
          <CategoryModelSelector
            category="translation"
            icon={Languages}
            label="Translation"
            value={current.translationModel}
            recommendedId={recommendations.translationModel}
            onChange={(v) => handleModelChange('translationModel', v)}
            isAutoSelect={isAutoSelect}
          />
        </div>

        {/* Manual mode hint */}
        {!isAutoSelect && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-primary" />
            Manual mode: Click "Compare" on each model to see detailed rankings and metrics
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateAIModelSelector;
