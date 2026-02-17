/**
 * Voice & Music Step - Step 5
 * 
 * Configure voiceover and background music for presentations.
 * Supports multi-language voice synthesis across providers.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, Music, Play, Pause, Volume2, Clock,
  User, Sparkles, Globe, Settings, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

export interface VoiceMusicStepProps {
  value: VoiceMusicState;
  onChange: (value: VoiceMusicState) => void;
  languages: string[];
  isMobile?: boolean;
}

export interface VoiceMusicState {
  enabled: boolean;
  provider: VoiceProvider;
  voiceId: string | null;
  persona: VoicePersona;
  speed: number;
  pitch: number;
  stability: number;
  clarity: number;
  perLanguageVoices: Record<string, string>;
  backgroundMusic: boolean;
  musicTrack: string | null;
  musicVolume: number;
  pauseBetweenSlides: number;
  autoNarrate: boolean;
}

export type VoiceProvider = 'elevenlabs' | 'azure' | 'google' | 'openai';
export type VoicePersona = 'professional' | 'friendly' | 'authoritative' | 'casual' | 'narrator';

// ==========================================
// CONSTANTS
// ==========================================

const VOICE_PROVIDERS = [
  { id: 'elevenlabs', name: 'ElevenLabs', quality: 'Premium', tier: 'pro' },
  { id: 'azure', name: 'Azure Neural', quality: 'High', tier: 'standard' },
  { id: 'google', name: 'Google WaveNet', quality: 'High', tier: 'standard' },
  { id: 'openai', name: 'OpenAI TTS', quality: 'High', tier: 'standard' },
];

const VOICE_PERSONAS = [
  { id: 'professional', name: 'Professional', description: 'Clear, business-appropriate' },
  { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
  { id: 'authoritative', name: 'Authoritative', description: 'Confident, commanding' },
  { id: 'casual', name: 'Casual', description: 'Relaxed, conversational' },
  { id: 'narrator', name: 'Narrator', description: 'Documentary style' },
];

const SAMPLE_VOICES: Record<VoiceProvider, Array<{ id: string; name: string; language: string; gender: string }>> = {
  elevenlabs: [
    { id: 'rachel', name: 'Rachel', language: 'en', gender: 'female' },
    { id: 'adam', name: 'Adam', language: 'en', gender: 'male' },
    { id: 'bella', name: 'Bella', language: 'en', gender: 'female' },
    { id: 'josh', name: 'Josh', language: 'en', gender: 'male' },
  ],
  azure: [
    { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US', gender: 'female' },
    { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US', gender: 'male' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia', language: 'en-GB', gender: 'female' },
  ],
  google: [
    { id: 'en-US-Neural2-A', name: 'US Voice A', language: 'en-US', gender: 'female' },
    { id: 'en-US-Neural2-D', name: 'US Voice D', language: 'en-US', gender: 'male' },
  ],
  openai: [
    { id: 'alloy', name: 'Alloy', language: 'en', gender: 'neutral' },
    { id: 'echo', name: 'Echo', language: 'en', gender: 'male' },
    { id: 'nova', name: 'Nova', language: 'en', gender: 'female' },
  ],
};

const MUSIC_TRACKS = [
  { id: 'corporate-upbeat', name: 'Corporate Upbeat', mood: 'energetic', duration: '3:20' },
  { id: 'ambient-calm', name: 'Ambient Calm', mood: 'peaceful', duration: '4:15' },
  { id: 'inspirational', name: 'Inspirational', mood: 'motivating', duration: '3:45' },
  { id: 'tech-minimal', name: 'Tech Minimal', mood: 'modern', duration: '3:00' },
  { id: 'none', name: 'No Music', mood: 'silent', duration: '-' },
];

// ==========================================
// COMPONENT
// ==========================================

export const VoiceMusicStep: React.FC<VoiceMusicStepProps> = ({
  value,
  onChange,
  languages,
  isMobile = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleChange = <K extends keyof VoiceMusicState>(
    key: K, 
    val: VoiceMusicState[K]
  ) => {
    onChange({ ...value, [key]: val });
  };

  const handlePreviewVoice = async () => {
    setPreviewLoading(true);
    // Simulate preview
    await new Promise(r => setTimeout(r, 1500));
    setPreviewLoading(false);
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const availableVoices = SAMPLE_VOICES[value.provider] || [];

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Enable Voiceover</p>
                <p className="text-sm text-muted-foreground">
                  Add AI-generated narration to your presentation
                </p>
              </div>
            </div>
            <Switch
              checked={value.enabled}
              onCheckedChange={(checked) => handleChange('enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {value.enabled && (
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className={cn("grid w-full", isMobile ? "grid-cols-2" : "grid-cols-3")}>
            <TabsTrigger value="voice">
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="music">
              <Music className="h-4 w-4 mr-2" />
              Music
            </TabsTrigger>
            {!isMobile && (
              <TabsTrigger value="advanced">
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            )}
          </TabsList>

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-4 mt-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Voice Provider</Label>
              <div className={cn("grid gap-2", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                {VOICE_PROVIDERS.map((provider) => (
                  <Card
                    key={provider.id}
                    className={cn(
                      "cursor-pointer transition-all p-3",
                      value.provider === provider.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleChange('provider', provider.id as VoiceProvider)}
                  >
                    <p className="font-medium text-sm">{provider.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-[9px]">
                        {provider.quality}
                      </Badge>
                      {provider.tier === 'pro' && (
                        <Badge className="text-[9px] bg-yellow-500">PRO</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select
                value={value.voiceId || ''}
                onValueChange={(v) => handleChange('voiceId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{voice.name}</span>
                        <Badge variant="outline" className="text-[9px] ml-2">
                          {voice.gender}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Persona */}
            <div className="space-y-2">
              <Label>Speaking Style</Label>
              <ScrollArea className={cn(isMobile ? "h-auto" : "h-auto")}>
                <div className="flex gap-2 flex-wrap">
                  {VOICE_PERSONAS.map((persona) => (
                    <Badge
                      key={persona.id}
                      variant={value.persona === persona.id ? "default" : "outline"}
                      className="cursor-pointer py-1.5"
                      onClick={() => handleChange('persona', persona.id as VoicePersona)}
                    >
                      {persona.name}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Preview Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handlePreviewVoice}
              disabled={!value.voiceId || previewLoading}
            >
              {previewLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isPlaying ? 'Playing...' : 'Preview Voice'}
            </Button>

            {/* Multi-Language Voice Mapping */}
            {languages.length > 1 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Per-Language Voices
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Assign different voices for each language
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {languages.map((lang) => (
                    <div key={lang} className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{lang.toUpperCase()}</Badge>
                      <Select
                        value={value.perLanguageVoices[lang] || value.voiceId || ''}
                        onValueChange={(v) => handleChange('perLanguageVoices', {
                          ...value.perLanguageVoices,
                          [lang]: v
                        })}
                      >
                        <SelectTrigger className="w-[160px] h-8">
                          <SelectValue placeholder="Auto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Auto (same as primary)</SelectItem>
                          {availableVoices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Music Tab */}
          <TabsContent value="music" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Background Music</p>
                <p className="text-sm text-muted-foreground">
                  Add ambient music to your presentation
                </p>
              </div>
              <Switch
                checked={value.backgroundMusic}
                onCheckedChange={(checked) => handleChange('backgroundMusic', checked)}
              />
            </div>

            {value.backgroundMusic && (
              <>
                <div className="space-y-2">
                  <Label>Track</Label>
                  <div className="grid gap-2">
                    {MUSIC_TRACKS.map((track) => (
                      <Card
                        key={track.id}
                        className={cn(
                          "cursor-pointer transition-all p-3 flex items-center justify-between",
                          value.musicTrack === track.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => handleChange('musicTrack', track.id)}
                      >
                        <div>
                          <p className="font-medium text-sm">{track.name}</p>
                          <p className="text-xs text-muted-foreground">{track.mood}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {track.duration}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Music Volume</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(value.musicVolume * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[value.musicVolume]}
                    onValueChange={([v]) => handleChange('musicVolume', v)}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Advanced Tab (Desktop only) */}
          {!isMobile && (
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Speed</Label>
                    <span className="text-sm text-muted-foreground">
                      {value.speed.toFixed(1)}x
                    </span>
                  </div>
                  <Slider
                    value={[value.speed]}
                    onValueChange={([v]) => handleChange('speed', v)}
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Pitch</Label>
                    <span className="text-sm text-muted-foreground">
                      {value.pitch > 0 ? '+' : ''}{value.pitch}
                    </span>
                  </div>
                  <Slider
                    value={[value.pitch]}
                    onValueChange={([v]) => handleChange('pitch', v)}
                    min={-10}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Stability</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(value.stability * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[value.stability]}
                    onValueChange={([v]) => handleChange('stability', v)}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Clarity</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(value.clarity * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[value.clarity]}
                    onValueChange={([v]) => handleChange('clarity', v)}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pause Between Slides
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {value.pauseBetweenSlides}s
                  </span>
                </div>
                <Slider
                  value={[value.pauseBetweenSlides]}
                  onValueChange={([v]) => handleChange('pauseBetweenSlides', v)}
                  min={0}
                  max={5}
                  step={0.5}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Narrate</p>
                  <p className="text-sm text-muted-foreground">
                    Generate script from slide content
                  </p>
                </div>
                <Switch
                  checked={value.autoNarrate}
                  onCheckedChange={(checked) => handleChange('autoNarrate', checked)}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default VoiceMusicStep;
