/**
 * Language Configuration Popup
 * 
 * Appears when user selects each language for generation.
 * Allows configuring AI models for text, image, and voice per language.
 */

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageModelConfig } from '@/services/agentPresentationGeneratorService';
import { SUPPORTED_LANGUAGES, LanguageConfig } from './MultiLanguageGenerator';

interface LanguageConfigPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: LanguageConfig | null;
  isPrimary: boolean;
  existingConfig?: LanguageModelConfig;
  onConfirm: (config: LanguageModelConfig) => void;
  onSkip?: () => void;
}

// Available models
const TEXT_MODELS = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', tier: 'fast', description: 'Fast & balanced' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'balanced', description: 'Great quality' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'premium', description: 'Best quality' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', tier: 'balanced', description: 'Efficient & smart' },
  { id: 'openai/gpt-5', name: 'GPT-5', tier: 'premium', description: 'Top reasoning' },
];

const IMAGE_MODELS = [
  { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini Flash Image', tier: 'fast', description: 'Quick images' },
  { id: 'google/gemini-3-pro-image-preview', name: 'Gemini Pro Image', tier: 'premium', description: 'Premium quality' },
];

const VOICE_MODELS = [
  { id: 'openai', name: 'OpenAI TTS', tier: 'balanced', voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] },
  { id: 'elevenlabs', name: 'ElevenLabs', tier: 'premium', voices: ['rachel', 'adam', 'sam', 'emily'] },
  { id: 'google', name: 'Google Cloud TTS', tier: 'balanced', voices: ['wavenet-a', 'wavenet-b', 'wavenet-c'] },
];

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

export function LanguageConfigPopup({
  open,
  onOpenChange,
  language,
  isPrimary,
  existingConfig,
  onConfirm,
  onSkip,
}: LanguageConfigPopupProps) {
  const [config, setConfig] = useState<LanguageModelConfig>({
    languageCode: language?.code || 'en',
    textModel: 'google/gemini-3-flash-preview',
    imageModel: 'google/gemini-2.5-flash-image-preview',
    voiceModel: 'openai',
    voiceId: 'alloy',
  });

  const [includeVoiceover, setIncludeVoiceover] = useState(false);

  // Update config when language changes
  useEffect(() => {
    if (language) {
      if (existingConfig) {
        setConfig(existingConfig);
      } else {
        setConfig({
          languageCode: language.code,
          textModel: 'google/gemini-3-flash-preview',
          imageModel: 'google/gemini-2.5-flash-image-preview',
          voiceModel: 'openai',
          voiceId: 'alloy',
        });
      }
    }
  }, [language, existingConfig]);

  const updateConfig = (updates: Partial<LanguageModelConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleConfirm = () => {
    onConfirm(config);
    onOpenChange(false);
  };

  const selectedTextModel = TEXT_MODELS.find(m => m.id === config.textModel);
  const selectedImageModel = IMAGE_MODELS.find(m => m.id === config.imageModel);
  const selectedVoiceProvider = VOICE_MODELS.find(m => m.id === config.voiceModel);

  if (!language) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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

        <div className="space-y-4 py-4">
          {/* Text Generation Model */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Text Generation Model
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {TEXT_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => updateConfig({ textModel: model.id })}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                    config.textModel === model.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-md border", tierColors[model.tier])}>
                      {tierIcons[model.tier]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </div>
                  {config.textModel === model.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Image Generation Model */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Image Generation Model
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {IMAGE_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => updateConfig({ imageModel: model.id })}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                    config.imageModel === model.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-md border", tierColors[model.tier])}>
                      {tierIcons[model.tier]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </div>
                  {config.imageModel === model.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
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
            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
              <Label className="text-sm">Voice Provider</Label>
              <Select
                value={config.voiceModel || 'openai'}
                onValueChange={(value) => {
                  const provider = VOICE_MODELS.find(m => m.id === value);
                  updateConfig({ 
                    voiceModel: value, 
                    voiceId: provider?.voices[0] || 'alloy' 
                  });
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant="outline" className={cn("text-[9px]", tierColors[model.tier])}>
                          {model.tier}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label className="text-sm">Voice</Label>
              <Select
                value={config.voiceId || 'alloy'}
                onValueChange={(value) => updateConfig({ voiceId: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedVoiceProvider?.voices.map(voice => (
                    <SelectItem key={voice} value={voice}>
                      {voice.charAt(0).toUpperCase() + voice.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Summary */}
          <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
            <div className="text-xs text-muted-foreground mb-2">Configuration Summary</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {selectedTextModel?.name}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {selectedImageModel?.name}
              </Badge>
              {includeVoiceover && (
                <Badge variant="secondary" className="text-xs">
                  {selectedVoiceProvider?.name} - {config.voiceId}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2">
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
