/**
 * Voice Selector Component
 * Mode-aware voice selection for TTS generation
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Play, Settings2, Volume2, ChevronDown, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScriptMode } from '@/types/projects';
import {
  SCRIPT_MODE_CONFIGS,
  getVoicesForMode,
  type VoicePreset,
} from '@/config/scriptModePresets';

interface VoiceSelectorProps {
  mode: ScriptMode;
  selectedVoice: VoicePreset | null;
  onVoiceChange: (voice: VoicePreset) => void;
  customSettings?: {
    stability: number;
    similarityBoost: number;
    style: number;
    speed: number;
  };
  onSettingsChange?: (settings: {
    stability: number;
    similarityBoost: number;
    style: number;
    speed: number;
  }) => void;
  onPreview?: (voice: VoicePreset) => void;
  isPreviewLoading?: boolean;
  disabled?: boolean;
}

export function VoiceSelector({
  mode,
  selectedVoice,
  onVoiceChange,
  customSettings,
  onSettingsChange,
  onPreview,
  isPreviewLoading,
  disabled,
}: VoiceSelectorProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  
  const modeConfig = SCRIPT_MODE_CONFIGS[mode];
  const availableVoices = getVoicesForMode(mode);
  const currentVoice = selectedVoice || modeConfig.tts.defaultVoice;
  
  const settings = customSettings || {
    stability: currentVoice.stability,
    similarityBoost: currentVoice.similarityBoost,
    style: currentVoice.style,
    speed: currentVoice.speed,
  };

  const handleVoiceSelect = (voiceName: string) => {
    const voice = availableVoices.find(v => v.voiceName === voiceName);
    if (voice) {
      onVoiceChange(voice);
      // Reset settings to voice defaults
      onSettingsChange?.({
        stability: voice.stability,
        similarityBoost: voice.similarityBoost,
        style: voice.style,
        speed: voice.speed,
      });
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded', modeConfig.color)}>
              <Volume2 className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-sm font-medium">Voice Settings</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {mode} Mode
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 pb-4">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Voice</Label>
          <div className="flex items-center gap-2">
            <Select
              value={currentVoice.voiceName}
              onValueChange={handleVoiceSelect}
              disabled={disabled}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.voiceName} value={voice.voiceName}>
                    <div className="flex items-center gap-2">
                      <Mic className="h-3 w-3" />
                      <span>{voice.voiceName}</span>
                      <Badge variant="outline" className="text-[10px] ml-1">
                        {voice.provider}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {onPreview && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPreview(currentVoice)}
                disabled={disabled || isPreviewLoading}
                className="shrink-0"
              >
                <Play className={cn('h-4 w-4', isPreviewLoading && 'animate-pulse')} />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentVoice.description}
          </p>
        </div>

        {/* Advanced Settings */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                <span>Advanced Settings</span>
              </div>
              <ChevronDown className={cn('h-4 w-4 transition-transform', showAdvanced && 'rotate-180')} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Stability */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Stability</Label>
                <span className="text-xs text-muted-foreground">{(settings.stability * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[settings.stability]}
                onValueChange={([v]) => onSettingsChange?.({ ...settings, stability: v })}
                min={0}
                max={1}
                step={0.05}
                disabled={disabled || !onSettingsChange}
              />
              <p className="text-[10px] text-muted-foreground">
                Lower = more expressive, Higher = more consistent
              </p>
            </div>

            {/* Similarity Boost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Similarity</Label>
                <span className="text-xs text-muted-foreground">{(settings.similarityBoost * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[settings.similarityBoost]}
                onValueChange={([v]) => onSettingsChange?.({ ...settings, similarityBoost: v })}
                min={0}
                max={1}
                step={0.05}
                disabled={disabled || !onSettingsChange}
              />
              <p className="text-[10px] text-muted-foreground">
                How closely to match the original voice
              </p>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Style</Label>
                <span className="text-xs text-muted-foreground">{(settings.style * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[settings.style]}
                onValueChange={([v]) => onSettingsChange?.({ ...settings, style: v })}
                min={0}
                max={1}
                step={0.05}
                disabled={disabled || !onSettingsChange}
              />
              <p className="text-[10px] text-muted-foreground">
                Higher = more stylized delivery
              </p>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Speed</Label>
                <span className="text-xs text-muted-foreground">{settings.speed.toFixed(2)}x</span>
              </div>
              <Slider
                value={[settings.speed]}
                onValueChange={([v]) => onSettingsChange?.({ ...settings, speed: v })}
                min={0.7}
                max={1.3}
                step={0.05}
                disabled={disabled || !onSettingsChange}
              />
              <p className="text-[10px] text-muted-foreground">
                Adjust speech rate (0.7x - 1.3x)
              </p>
            </div>

            {/* Reset to Mode Defaults */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const defaultVoice = modeConfig.tts.defaultVoice;
                onVoiceChange(defaultVoice);
                onSettingsChange?.({
                  stability: defaultVoice.stability,
                  similarityBoost: defaultVoice.similarityBoost,
                  style: defaultVoice.style,
                  speed: defaultVoice.speed,
                });
              }}
              disabled={disabled}
            >
              Reset to {mode} Mode Defaults
            </Button>
          </CollapsibleContent>
        </Collapsible>

        {/* Mode Recommendation */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span> {modeConfig.tts.backgroundMusicSuggestion}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
