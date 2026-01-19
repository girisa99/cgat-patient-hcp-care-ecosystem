/**
 * Voice & Audio Configuration Panel
 * Inspired by HubSpot Clip Creator, ElevenLabs, and professional TTS tools
 * Provides granular control over voice generation for presentations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
  Mic,
  Volume2,
  Play,
  Pause,
  Settings2,
  Globe,
  User,
  Wand2,
  ChevronDown,
  Sparkles,
  Music,
  Clock,
  Check,
  Loader2,
  AudioLines,
  RefreshCw,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Voice provider options with capabilities
const VOICE_PROVIDERS = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Premium voices with cloning',
    quality: 'ultra',
    features: ['voice-cloning', 'emotion', 'multilingual'],
    languages: 29,
    voices: 24
  },
  {
    id: 'openai',
    name: 'OpenAI TTS',
    description: 'Natural conversational voices',
    quality: 'high',
    features: ['fast', 'consistent'],
    languages: 57,
    voices: 6
  },
  {
    id: 'google',
    name: 'Google Cloud TTS',
    description: 'Wide language coverage',
    quality: 'high',
    features: ['multilingual', 'ssml'],
    languages: 80,
    voices: 220
  },
  {
    id: 'azure',
    name: 'Azure Speech',
    description: 'Enterprise-grade synthesis',
    quality: 'high',
    features: ['neural', 'custom-voice'],
    languages: 75,
    voices: 400
  },
  {
    id: 'aws',
    name: 'Amazon Polly',
    description: 'Reliable cloud voices',
    quality: 'standard',
    features: ['ssml', 'lexicons'],
    languages: 29,
    voices: 60
  }
];

// Voice personas for different presentation styles
const VOICE_PERSONAS = [
  { id: 'professional', name: 'Professional', desc: 'Business presentations', icon: '💼' },
  { id: 'friendly', name: 'Friendly', desc: 'Casual & approachable', icon: '😊' },
  { id: 'authoritative', name: 'Authoritative', desc: 'Expert & confident', icon: '🎯' },
  { id: 'educational', name: 'Educational', desc: 'Clear & instructive', icon: '📚' },
  { id: 'inspirational', name: 'Inspirational', desc: 'Motivating & uplifting', icon: '✨' },
  { id: 'calm', name: 'Calm', desc: 'Relaxed & soothing', icon: '🌿' }
];

// Sample voices per provider
const SAMPLE_VOICES: Record<string, Array<{ id: string; name: string; gender: string; accent: string; preview?: string }>> = {
  elevenlabs: [
    { id: 'rachel', name: 'Rachel', gender: 'female', accent: 'American' },
    { id: 'adam', name: 'Adam', gender: 'male', accent: 'American' },
    { id: 'bella', name: 'Bella', gender: 'female', accent: 'British' },
    { id: 'josh', name: 'Josh', gender: 'male', accent: 'American' }
  ],
  openai: [
    { id: 'alloy', name: 'Alloy', gender: 'neutral', accent: 'American' },
    { id: 'echo', name: 'Echo', gender: 'male', accent: 'American' },
    { id: 'fable', name: 'Fable', gender: 'female', accent: 'British' },
    { id: 'onyx', name: 'Onyx', gender: 'male', accent: 'American' },
    { id: 'nova', name: 'Nova', gender: 'female', accent: 'American' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', accent: 'American' }
  ],
  google: [
    { id: 'en-US-Neural2-A', name: 'Aria', gender: 'female', accent: 'American' },
    { id: 'en-US-Neural2-D', name: 'Davis', gender: 'male', accent: 'American' },
    { id: 'en-GB-Neural2-A', name: 'Emily', gender: 'female', accent: 'British' },
    { id: 'en-GB-Neural2-B', name: 'Brian', gender: 'male', accent: 'British' }
  ],
  azure: [
    { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'female', accent: 'American' },
    { id: 'en-US-GuyNeural', name: 'Guy', gender: 'male', accent: 'American' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia', gender: 'female', accent: 'British' },
    { id: 'en-AU-NatashaNeural', name: 'Natasha', gender: 'female', accent: 'Australian' }
  ],
  aws: [
    { id: 'Joanna', name: 'Joanna', gender: 'female', accent: 'American' },
    { id: 'Matthew', name: 'Matthew', gender: 'male', accent: 'American' },
    { id: 'Amy', name: 'Amy', gender: 'female', accent: 'British' },
    { id: 'Brian', name: 'Brian', gender: 'male', accent: 'British' }
  ]
};

export interface VoiceConfig {
  enabled: boolean;
  provider: string;
  voiceId: string;
  persona: string;
  speed: number;
  pitch: number;
  stability: number;
  clarity: number;
  backgroundMusic: boolean;
  musicVolume: number;
  pauseBetweenSlides: number;
}

interface VoiceAudioConfigPanelProps {
  config: VoiceConfig;
  onConfigChange: (config: VoiceConfig) => void;
  selectedLanguage?: string;
  className?: string;
}

export function VoiceAudioConfigPanel({
  config,
  onConfigChange,
  selectedLanguage = 'en',
  className
}: VoiceAudioConfigPanelProps) {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const selectedProvider = VOICE_PROVIDERS.find(p => p.id === config.provider);
  const availableVoices = SAMPLE_VOICES[config.provider] || [];

  const handlePlayPreview = async (voiceId: string) => {
    if (isPlaying === voiceId) {
      setIsPlaying(null);
      return;
    }
    
    setIsPlaying(voiceId);
    // Simulate audio preview
    setTimeout(() => setIsPlaying(null), 3000);
  };

  const handleGenerateFullPreview = async () => {
    setIsGeneratingPreview(true);
    try {
      // Would call voice API here
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Voice preview generated!');
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Enable Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl",
            config.enabled ? "bg-primary/10" : "bg-muted"
          )}>
            <Mic className={cn("h-5 w-5", config.enabled ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Voice & Audio</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered voiceover narration
            </p>
          </div>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(enabled) => onConfigChange({ ...config, enabled })}
        />
      </div>

      {config.enabled && (
        <>
          {/* Provider Selection */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <AudioLines className="h-4 w-4 text-primary" />
                Voice Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {VOICE_PROVIDERS.slice(0, 4).map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => onConfigChange({ ...config, provider: provider.id, voiceId: SAMPLE_VOICES[provider.id]?.[0]?.id || '' })}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all",
                      config.provider === provider.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{provider.name}</p>
                      <Badge variant="outline" className="text-[9px]">
                        {provider.quality}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{provider.description}</p>
                    <div className="flex gap-1 mt-2">
                      <span className="text-[10px] text-muted-foreground">{provider.languages} langs</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{provider.voices} voices</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Persona */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Voice Persona
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-2">
                {VOICE_PERSONAS.map(persona => (
                  <button
                    key={persona.id}
                    onClick={() => onConfigChange({ ...config, persona: persona.id })}
                    className={cn(
                      "p-2 rounded-lg border-2 text-center transition-all",
                      config.persona === persona.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-lg">{persona.icon}</span>
                    <p className="text-xs font-medium mt-1">{persona.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Headphones className="h-4 w-4 text-primary" />
                Select Voice
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ScrollArea className="h-32">
                <div className="grid grid-cols-2 gap-2">
                  {availableVoices.map(voice => (
                    <div
                      key={voice.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all",
                        config.voiceId === voice.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => onConfigChange({ ...config, voiceId: voice.id })}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                          voice.gender === 'female' ? 'bg-pink-100 text-pink-600' :
                          voice.gender === 'male' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                        )}>
                          {voice.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{voice.name}</p>
                          <p className="text-[10px] text-muted-foreground">{voice.accent}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(voice.id);
                        }}
                      >
                        {isPlaying === voice.id ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <Card>
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Voice Settings</p>
                      <p className="text-xs text-muted-foreground">Speed, pitch, and quality controls</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showAdvanced && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-0 space-y-4">
                  {/* Speed */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Speed</Label>
                      <span className="text-xs text-muted-foreground">{config.speed}x</span>
                    </div>
                    <Slider
                      value={[config.speed]}
                      onValueChange={([speed]) => onConfigChange({ ...config, speed })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Pitch */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Pitch</Label>
                      <span className="text-xs text-muted-foreground">{config.pitch > 0 ? '+' : ''}{config.pitch}</span>
                    </div>
                    <Slider
                      value={[config.pitch]}
                      onValueChange={([pitch]) => onConfigChange({ ...config, pitch })}
                      min={-10}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Stability (ElevenLabs) */}
                  {config.provider === 'elevenlabs' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Stability</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(config.stability * 100)}%</span>
                      </div>
                      <Slider
                        value={[config.stability]}
                        onValueChange={([stability]) => onConfigChange({ ...config, stability })}
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Pause Between Slides */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pause Between Slides
                      </Label>
                      <span className="text-xs text-muted-foreground">{config.pauseBetweenSlides}s</span>
                    </div>
                    <Slider
                      value={[config.pauseBetweenSlides]}
                      onValueChange={([pauseBetweenSlides]) => onConfigChange({ ...config, pauseBetweenSlides })}
                      min={0}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Background Music */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    config.backgroundMusic ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Music className={cn("h-4 w-4", config.backgroundMusic ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Background Music</p>
                    <p className="text-xs text-muted-foreground">Subtle ambient music</p>
                  </div>
                </div>
                <Switch
                  checked={config.backgroundMusic}
                  onCheckedChange={(backgroundMusic) => onConfigChange({ ...config, backgroundMusic })}
                />
              </div>
              
              {config.backgroundMusic && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Music Volume</Label>
                    <span className="text-xs text-muted-foreground">{Math.round(config.musicVolume * 100)}%</span>
                  </div>
                  <Slider
                    value={[config.musicVolume]}
                    onValueChange={([musicVolume]) => onConfigChange({ ...config, musicVolume })}
                    min={0}
                    max={0.5}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Button */}
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={handleGenerateFullPreview}
            disabled={isGeneratingPreview}
          >
            {isGeneratingPreview ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Preview...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Voice Preview
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
