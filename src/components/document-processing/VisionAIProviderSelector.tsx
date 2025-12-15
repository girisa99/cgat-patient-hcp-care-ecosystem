/**
 * VISION AI PROVIDER SELECTOR
 * Multi-provider and AI model type selection for medical imaging
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Cloud, 
  Server, 
  Sparkles,
  Cpu,
  Layers,
  Target,
  Activity,
  FileText,
  Zap,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  VisionAIProvider, 
  AIModelType, 
  MedicalModalityType,
  VISION_AI_PROVIDERS,
  AI_MODEL_TYPES,
  MODALITY_CONFIGS,
  medicalVisionAIService
} from '@/services/medicalVisionAIService';

interface VisionAIProviderSelectorProps {
  modality: MedicalModalityType;
  selectedProvider: VisionAIProvider;
  selectedModelType: AIModelType;
  analysisType: 'screening' | 'diagnostic' | 'comprehensive';
  onProviderChange: (provider: VisionAIProvider) => void;
  onModelTypeChange: (modelType: AIModelType) => void;
  onAnalysisTypeChange: (type: 'screening' | 'diagnostic' | 'comprehensive') => void;
  compact?: boolean;
}

const ProviderIcon: React.FC<{ provider: VisionAIProvider }> = ({ provider }) => {
  switch (provider) {
    case 'gemini':
      return <Sparkles className="h-4 w-4 text-blue-500" />;
    case 'aws-rekognition':
      return <Cloud className="h-4 w-4 text-orange-500" />;
    case 'azure-health':
      return <Server className="h-4 w-4 text-cyan-500" />;
    default:
      return <Zap className="h-4 w-4 text-muted-foreground" />;
  }
};

const ModelTypeIcon: React.FC<{ modelType: AIModelType }> = ({ modelType }) => {
  switch (modelType) {
    case 'cnn':
      return <Layers className="h-4 w-4 text-blue-500" />;
    case 'u-net':
      return <Target className="h-4 w-4 text-purple-500" />;
    case 'yolo':
    case 'faster-rcnn':
      return <Target className="h-4 w-4 text-amber-500" />;
    case 'rnn':
      return <Activity className="h-4 w-4 text-red-500" />;
    case 'llm':
      return <FileText className="h-4 w-4 text-green-500" />;
    default:
      return <Cpu className="h-4 w-4 text-muted-foreground" />;
  }
};

export const VisionAIProviderSelector: React.FC<VisionAIProviderSelectorProps> = ({
  modality,
  selectedProvider,
  selectedModelType,
  analysisType,
  onProviderChange,
  onModelTypeChange,
  onAnalysisTypeChange,
  compact = false
}) => {
  const modalityConfig = MODALITY_CONFIGS[modality];
  const availableProviders = medicalVisionAIService.getProvidersForModality(modality);
  const supportedModels = modalityConfig?.supportedModels || ['auto'];
  const recommendedModel = modalityConfig?.recommendedModel || 'auto';

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Select value={selectedProvider} onValueChange={(v) => onProviderChange(v as VisionAIProvider)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto Select</SelectItem>
              {availableProviders.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <ProviderIcon provider={p.id} />
                    {p.name.split(' ')[0]}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedModelType} onValueChange={(v) => onModelTypeChange(v as AIModelType)}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Auto ({recommendedModel.toUpperCase()})
                </div>
              </SelectItem>
              {supportedModels.filter(m => m !== 'auto').map(m => (
                <SelectItem key={m} value={m}>
                  <div className="flex items-center gap-2">
                    <ModelTypeIcon modelType={m} />
                    {AI_MODEL_TYPES[m].name.split(' ')[0]}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={analysisType} onValueChange={(v) => onAnalysisTypeChange(v as any)}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Analysis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="diagnostic">Diagnostic</SelectItem>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Vision AI Configuration
        </CardTitle>
        <CardDescription>
          Select provider and AI model for {modality.replace('-', ' ')} analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">AI Provider</Label>
          <RadioGroup 
            value={selectedProvider} 
            onValueChange={(v) => onProviderChange(v as VisionAIProvider)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-2 cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="auto" id="provider-auto" />
              <Label htmlFor="provider-auto" className="cursor-pointer flex items-center gap-2 flex-1">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Auto Select</div>
                  <div className="text-xs text-muted-foreground">Best for modality</div>
                </div>
              </Label>
            </div>
            {availableProviders.map(provider => (
              <div 
                key={provider.id}
                className="flex items-center space-x-2 border rounded-lg p-2 cursor-pointer hover:bg-muted/50"
              >
                <RadioGroupItem value={provider.id} id={`provider-${provider.id}`} />
                <Label htmlFor={`provider-${provider.id}`} className="cursor-pointer flex items-center gap-2 flex-1">
                  <ProviderIcon provider={provider.id} />
                  <div>
                    <div className="text-sm font-medium">{provider.name.split(' ').slice(0, 2).join(' ')}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {provider.capabilities.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* AI Model Type Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">AI Model Type</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-xs">
                    Different AI model architectures are optimized for different tasks.
                    Recommended for {modality}: <strong>{recommendedModel.toUpperCase()}</strong>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div 
              className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                selectedModelType === 'auto' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => onModelTypeChange('auto')}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Auto</div>
                  <div className="text-xs text-muted-foreground">Recommended: {recommendedModel.toUpperCase()}</div>
                </div>
              </div>
            </div>
            
            {supportedModels.filter(m => m !== 'auto').map(modelType => {
              const modelInfo = AI_MODEL_TYPES[modelType];
              const isSelected = selectedModelType === modelType;
              const isRecommended = modelType === recommendedModel;
              
              return (
                <div 
                  key={modelType}
                  className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onModelTypeChange(modelType)}
                >
                  <div className="flex items-center gap-2">
                    <ModelTypeIcon modelType={modelType} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-1">
                        {modelType.toUpperCase()}
                        {isRecommended && (
                          <Badge variant="secondary" className="text-[8px] px-1 py-0">Best</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {modelInfo.bestFor[0]}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Analysis Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Analysis Depth</Label>
          <RadioGroup 
            value={analysisType} 
            onValueChange={(v) => onAnalysisTypeChange(v as any)}
            className="flex gap-2"
          >
            <div className={`flex-1 border rounded-lg p-2 cursor-pointer ${
              analysisType === 'screening' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}>
              <RadioGroupItem value="screening" id="analysis-screening" className="sr-only" />
              <Label htmlFor="analysis-screening" className="cursor-pointer">
                <div className="text-sm font-medium">Screening</div>
                <div className="text-xs text-muted-foreground">Quick check</div>
              </Label>
            </div>
            <div className={`flex-1 border rounded-lg p-2 cursor-pointer ${
              analysisType === 'diagnostic' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}>
              <RadioGroupItem value="diagnostic" id="analysis-diagnostic" className="sr-only" />
              <Label htmlFor="analysis-diagnostic" className="cursor-pointer">
                <div className="text-sm font-medium">Diagnostic</div>
                <div className="text-xs text-muted-foreground">Detailed analysis</div>
              </Label>
            </div>
            <div className={`flex-1 border rounded-lg p-2 cursor-pointer ${
              analysisType === 'comprehensive' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}>
              <RadioGroupItem value="comprehensive" id="analysis-comprehensive" className="sr-only" />
              <Label htmlFor="analysis-comprehensive" className="cursor-pointer">
                <div className="text-sm font-medium">Full</div>
                <div className="text-xs text-muted-foreground">Complete report</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Capabilities Summary */}
        {modalityConfig && (
          <div className="mt-3 p-2 bg-muted/50 rounded-lg">
            <div className="text-xs font-medium mb-1">Analysis Capabilities:</div>
            <div className="flex flex-wrap gap-1">
              {modalityConfig.analysisCapabilities.slice(0, 4).map((cap, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
