/**
 * Language Model Selector Component
 * 
 * Allows users to select different AI models per language for:
 * - Text generation
 * - Image generation
 * - Voice/TTS generation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Globe,
  Brain,
  Image as ImageIcon,
  Mic,
  ChevronDown,
  ChevronRight,
  Settings2,
  Zap,
  Crown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageModelConfig } from '@/services/agentPresentationGeneratorService';
import { SUPPORTED_LANGUAGES, LanguageConfig } from './MultiLanguageGenerator';

interface LanguageModelSelectorProps {
  selectedLanguages: string[];
  primaryLanguage: string;
  modelConfigs: LanguageModelConfig[];
  onModelConfigChange: (configs: LanguageModelConfig[]) => void;
  className?: string;
}

// Available models
const TEXT_MODELS = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', tier: 'fast', icon: Zap },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'balanced', icon: Sparkles },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'premium', icon: Crown },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', tier: 'balanced', icon: Sparkles },
  { id: 'openai/gpt-5', name: 'GPT-5', tier: 'premium', icon: Crown },
];

const IMAGE_MODELS = [
  { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini Flash Image', tier: 'fast', icon: Zap },
  { id: 'google/gemini-3-pro-image-preview', name: 'Gemini Pro Image', tier: 'premium', icon: Crown },
];

const VOICE_MODELS = [
  { id: 'openai', name: 'OpenAI TTS', tier: 'balanced' },
  { id: 'elevenlabs', name: 'ElevenLabs', tier: 'premium' },
  { id: 'google', name: 'Google Cloud TTS', tier: 'balanced' },
];

const tierColors: Record<string, string> = {
  fast: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  balanced: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  premium: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

function getDefaultConfig(languageCode: string): LanguageModelConfig {
  return {
    languageCode,
    textModel: 'google/gemini-3-flash-preview',
    imageModel: 'google/gemini-2.5-flash-image-preview',
    voiceModel: 'openai',
    voiceId: 'alloy',
  };
}

function LanguageModelCard({
  language,
  config,
  isPrimary,
  onConfigChange,
}: {
  language: LanguageConfig;
  config: LanguageModelConfig;
  isPrimary: boolean;
  onConfigChange: (config: LanguageModelConfig) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(isPrimary);

  const updateConfig = (updates: Partial<LanguageModelConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const selectedTextModel = TEXT_MODELS.find(m => m.id === config.textModel);
  const selectedImageModel = IMAGE_MODELS.find(m => m.id === config.imageModel);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        "border rounded-lg transition-all",
        isPrimary && "ring-2 ring-primary/30 bg-primary/5",
        isExpanded && "shadow-sm"
      )}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{language.name}</span>
                  {isPrimary && (
                    <Badge variant="default" className="text-[9px] px-1.5">Primary</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {selectedTextModel?.name} • {selectedImageModel?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-[9px]", tierColors[selectedTextModel?.tier || 'balanced'])}
              >
                {selectedTextModel?.tier}
              </Badge>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-3 border-t bg-muted/20">
            {/* Text Model */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Text Generation Model
              </Label>
              <Select
                value={config.textModel}
                onValueChange={(value) => updateConfig({ textModel: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_MODELS.map(model => {
                    const Icon = model.icon;
                    return (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3" />
                          <span>{model.name}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-[8px] ml-auto", tierColors[model.tier])}
                          >
                            {model.tier}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Image Model */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                Image Generation Model
              </Label>
              <Select
                value={config.imageModel}
                onValueChange={(value) => updateConfig({ imageModel: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS.map(model => {
                    const Icon = model.icon;
                    return (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3" />
                          <span>{model.name}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-[8px] ml-auto", tierColors[model.tier])}
                          >
                            {model.tier}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Voice Model */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Mic className="h-3 w-3" />
                Voice/TTS Provider
              </Label>
              <Select
                value={config.voiceModel || 'openai'}
                onValueChange={(value) => updateConfig({ voiceModel: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <Mic className="h-3 w-3" />
                        <span>{model.name}</span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[8px] ml-auto", tierColors[model.tier])}
                        >
                          {model.tier}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function LanguageModelSelector({
  selectedLanguages,
  primaryLanguage,
  modelConfigs,
  onModelConfigChange,
  className,
}: LanguageModelSelectorProps) {
  // Ensure all selected languages have configs
  React.useEffect(() => {
    const existingCodes = new Set(modelConfigs.map(c => c.languageCode));
    const missingConfigs: LanguageModelConfig[] = [];
    
    for (const langCode of selectedLanguages) {
      if (!existingCodes.has(langCode)) {
        missingConfigs.push(getDefaultConfig(langCode));
      }
    }
    
    if (missingConfigs.length > 0) {
      onModelConfigChange([...modelConfigs, ...missingConfigs]);
    }
  }, [selectedLanguages, modelConfigs, onModelConfigChange]);

  // Filter to only show configs for selected languages
  const activeConfigs = modelConfigs.filter(c => selectedLanguages.includes(c.languageCode));

  const handleConfigChange = (languageCode: string, newConfig: LanguageModelConfig) => {
    const updated = modelConfigs.map(c => 
      c.languageCode === languageCode ? newConfig : c
    );
    onModelConfigChange(updated);
  };

  const applyToAll = (templateConfig: LanguageModelConfig) => {
    const updated = modelConfigs.map(c => ({
      ...c,
      textModel: templateConfig.textModel,
      imageModel: templateConfig.imageModel,
      voiceModel: templateConfig.voiceModel,
    }));
    onModelConfigChange(updated);
  };

  if (selectedLanguages.length === 0) {
    return null;
  }

  // Sort to show primary first
  const sortedLanguages = [...selectedLanguages].sort((a, b) => {
    if (a === primaryLanguage) return -1;
    if (b === primaryLanguage) return 1;
    return 0;
  });

  const primaryConfig = activeConfigs.find(c => c.languageCode === primaryLanguage);

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Model Selection per Language
          </CardTitle>
          {selectedLanguages.length > 1 && primaryConfig && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={() => applyToAll(primaryConfig)}
            >
              Apply Primary to All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {sortedLanguages.map(langCode => {
              const language = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
              const config = activeConfigs.find(c => c.languageCode === langCode) 
                || getDefaultConfig(langCode);
              
              if (!language) return null;

              return (
                <LanguageModelCard
                  key={langCode}
                  language={language}
                  config={config}
                  isPrimary={langCode === primaryLanguage}
                  onConfigChange={(newConfig) => handleConfigChange(langCode, newConfig)}
                />
              );
            })}
          </div>
        </ScrollArea>

        {/* Info */}
        <div className="mt-3 p-2 bg-muted/50 rounded-lg text-[10px] text-muted-foreground">
          <Globe className="h-3 w-3 inline mr-1" />
          Each language can use different AI models for optimal results.
          Premium models provide higher quality but take longer.
        </div>
      </CardContent>
    </Card>
  );
}
