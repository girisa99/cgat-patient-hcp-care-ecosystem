/**
 * AI MODEL SELECTOR COMPONENT
 * Allows selection of AI models for Stage 1 and Stage 2 extraction
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Zap, Brain, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVAILABLE_AI_MODELS, MultiModelPipelineConfig, AIModelConfig } from '@/types/dataRoutingTypes';

interface ModelSelectorProps {
  config: MultiModelPipelineConfig;
  onChange: (config: MultiModelPipelineConfig) => void;
  className?: string;
}

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'gemini':
      return <Sparkles className="h-4 w-4 text-blue-500" />;
    case 'openai':
      return <Brain className="h-4 w-4 text-green-500" />;
    case 'claude':
      return <Zap className="h-4 w-4 text-purple-500" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
};

const getCostBadge = (costTier: string) => {
  switch (costTier) {
    case 'low':
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Low Cost</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Medium</Badge>;
    case 'high':
      return <Badge variant="secondary" className="bg-red-100 text-red-700">Premium</Badge>;
    default:
      return null;
  }
};

const getSpeedBadge = (speedTier: string) => {
  switch (speedTier) {
    case 'fast':
      return <Badge variant="outline" className="border-green-500 text-green-600">Fast</Badge>;
    case 'medium':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Balanced</Badge>;
    case 'slow':
      return <Badge variant="outline" className="border-red-500 text-red-600">Thorough</Badge>;
    default:
      return null;
  }
};

const ModelOption: React.FC<{
  modelKey: string;
  model: AIModelConfig;
  selected: boolean;
  onSelect: () => void;
  stage: 'stage1' | 'stage2';
}> = ({ modelKey, model, selected, onSelect, stage }) => {
  const isRecommended = 
    (stage === 'stage1' && modelKey === 'gemini-flash') ||
    (stage === 'stage2' && modelKey === 'gemini-pro');

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-4 rounded-lg border-2 cursor-pointer transition-all",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getProviderIcon(model.provider)}
          <span className="font-medium">{model.displayName}</span>
        </div>
        {isRecommended && (
          <Badge variant="default" className="text-xs">Recommended</Badge>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {getCostBadge(model.costTier)}
        {getSpeedBadge(model.speedTier)}
        {model.supportsHandwriting && (
          <Badge variant="outline" className="text-xs">Handwriting</Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 mt-2">
        {model.strengths.map((strength, i) => (
          <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full">
            {strength}
          </span>
        ))}
      </div>
    </div>
  );
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  config,
  onChange,
  className
}) => {
  const models = Object.entries(AVAILABLE_AI_MODELS);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5" />
          AI Model Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stage 1 Model Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50">Stage 1</Badge>
            <Label className="font-medium">Classification & Section Detection</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Fast model for identifying form type, manufacturer, and sections
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {models.map(([key, model]) => (
              <ModelOption
                key={key}
                modelKey={key}
                model={model}
                selected={config.stage1Model === key}
                onSelect={() => onChange({ ...config, stage1Model: key })}
                stage="stage1"
              />
            ))}
          </div>
        </div>

        {/* Stage 2 Model Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50">Stage 2</Badge>
            <Label className="font-medium">Deep Field Extraction</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Accurate model for extracting all fields, handling handwriting, tables
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {models.map(([key, model]) => (
              <ModelOption
                key={key}
                modelKey={key}
                model={model}
                selected={config.stage2Model === key}
                onSelect={() => onChange({ ...config, stage2Model: key })}
                stage="stage2"
              />
            ))}
          </div>
        </div>

        {/* Comparison Mode */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div>
            <Label className="font-medium">Enable Model Comparison</Label>
            <p className="text-sm text-muted-foreground">
              Run multiple models and compare results for higher confidence
            </p>
          </div>
          <Switch
            checked={config.enableComparison}
            onCheckedChange={(checked) => onChange({ ...config, enableComparison: checked })}
          />
        </div>

        {/* Current Selection Summary */}
        <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="text-sm font-medium mb-2">Current Pipeline</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">
              {AVAILABLE_AI_MODELS[config.stage1Model]?.displayName || config.stage1Model}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 bg-green-100 rounded text-green-700">
              {AVAILABLE_AI_MODELS[config.stage2Model]?.displayName || config.stage2Model}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
