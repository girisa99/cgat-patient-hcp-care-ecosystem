/**
 * Music Composer Agent Panel
 * UI for AI-powered music composition and SFX generation
 * Integrates with Phase 6: Music in Guided Experience
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Music, 
  Wand2, 
  Play, 
  Pause, 
  Download, 
  X, 
  Sparkles,
  Volume2,
  Clock,
  Zap,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicComposerAgent, MusicStyle, MusicMood, MusicRequest, GeneratedAudio, COMPOSER_PRESETS } from '@/hooks/useMusicComposerAgent';

interface MusicComposerPanelProps {
  videoDuration?: number;
  onMusicGenerated?: (result: GeneratedAudio) => void;
  onApplyMusic?: (audioUrl: string) => void;
  onClose?: () => void;
  className?: string;
}

export const MusicComposerPanel: React.FC<MusicComposerPanelProps> = ({
  videoDuration = 30,
  onMusicGenerated,
  onApplyMusic,
  onClose,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'music' | 'sfx' | 'ambient'>('music');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<MusicStyle>('cinematic');
  const [selectedMood, setSelectedMood] = useState<MusicMood>('happy');
  const [duration, setDuration] = useState(videoDuration);
  const [tempo, setTempo] = useState(120);
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { generateMusic, generateSFX, generateAmbient, isGenerating, progress, error, getPresets } = useMusicComposerAgent();

  const styles: { value: MusicStyle; label: string; emoji: string }[] = [
    { value: 'cinematic', label: 'Cinematic', emoji: '🎬' },
    { value: 'electronic', label: 'Electronic', emoji: '🎧' },
    { value: 'acoustic', label: 'Acoustic', emoji: '🎸' },
    { value: 'classical', label: 'Classical', emoji: '🎻' },
    { value: 'ambient', label: 'Ambient', emoji: '🌊' },
    { value: 'corporate', label: 'Corporate', emoji: '💼' },
    { value: 'upbeat', label: 'Upbeat', emoji: '🎤' },
    { value: 'jazz', label: 'Jazz', emoji: '🎷' },
    { value: 'lofi', label: 'Lo-Fi', emoji: '☕' },
    { value: 'epic', label: 'Epic', emoji: '⚔️' },
  ];

  const moods: { value: MusicMood; label: string; color: string }[] = [
    { value: 'happy', label: 'Happy', color: 'bg-yellow-500' },
    { value: 'energetic', label: 'Energetic', color: 'bg-red-500' },
    { value: 'relaxing', label: 'Relaxing', color: 'bg-blue-500' },
    { value: 'tense', label: 'Tense', color: 'bg-purple-500' },
    { value: 'mysterious', label: 'Mysterious', color: 'bg-indigo-500' },
    { value: 'romantic', label: 'Romantic', color: 'bg-pink-500' },
    { value: 'dark', label: 'Dark', color: 'bg-gray-700' },
    { value: 'hopeful', label: 'Hopeful', color: 'bg-green-500' },
    { value: 'peaceful', label: 'Peaceful', color: 'bg-cyan-500' },
    { value: 'sad', label: 'Sad', color: 'bg-slate-500' },
  ];

  const sfxCategories = [
    { id: 'whoosh', label: 'Whoosh', emoji: '💨' },
    { id: 'impact', label: 'Impact', emoji: '💥' },
    { id: 'click', label: 'Click', emoji: '👆' },
    { id: 'notification', label: 'Notification', emoji: '🔔' },
    { id: 'transition', label: 'Transition', emoji: '➡️' },
    { id: 'success', label: 'Success', emoji: '✅' },
  ];

  const presets = getPresets();

  const handleGenerateMusic = useCallback(async () => {
    const request: MusicRequest = {
      type: 'music',
      style: selectedStyle,
      mood: selectedMood,
      duration,
      bpm: tempo,
      prompt: customPrompt || undefined,
    };
    
    const result = await generateMusic(request);
    if (result) {
      setGeneratedMusic(result);
      onMusicGenerated?.(result);
    }
  }, [selectedStyle, selectedMood, duration, tempo, customPrompt, generateMusic, onMusicGenerated]);

  const handleGenerateSFX = useCallback(async (category: string) => {
    const result = await generateSFX(category);
    if (result) {
      setGeneratedMusic(result);
      onMusicGenerated?.(result);
    }
  }, [generateSFX, onMusicGenerated]);

  const handleGenerateAmbient = useCallback(async (environment: string) => {
    const result = await generateAmbient(environment, duration);
    if (result) {
      setGeneratedMusic(result);
      onMusicGenerated?.(result);
    }
  }, [generateAmbient, duration, onMusicGenerated]);

  const handleApply = useCallback(() => {
    if (generatedMusic?.audioUrl) {
      onApplyMusic?.(generatedMusic.audioUrl);
      onClose?.();
    }
  }, [generatedMusic, onApplyMusic, onClose]);

  const handlePresetSelect = useCallback((preset: typeof presets[0]) => {
    setSelectedStyle(preset.style);
    setSelectedMood(preset.mood);
    if (preset.bpm) setTempo(preset.bpm);
  }, []);

  return (
    <Card className={cn("w-full bg-card/95 backdrop-blur-sm shadow-xl border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Music className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-sm">Music Composer Agent</CardTitle>
              <p className="text-xs text-muted-foreground">AI-powered music & SFX generation</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid grid-cols-3 h-8">
            <TabsTrigger value="music" className="text-xs">
              <Music className="h-3 w-3 mr-1" /> Music
            </TabsTrigger>
            <TabsTrigger value="sfx" className="text-xs">
              <Zap className="h-3 w-3 mr-1" /> SFX
            </TabsTrigger>
            <TabsTrigger value="ambient" className="text-xs">
              <Volume2 className="h-3 w-3 mr-1" /> Ambient
            </TabsTrigger>
          </TabsList>

          {/* Music Tab */}
          <TabsContent value="music" className="space-y-3 mt-3">
            {/* Quick Presets */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Quick Presets</p>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {presets.slice(0, 6).map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Style</p>
              <div className="grid grid-cols-5 gap-1.5">
                {styles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={cn(
                      "flex flex-col items-center p-2 rounded-lg border text-center transition-all",
                      selectedStyle === style.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <span className="text-lg">{style.emoji}</span>
                    <span className="text-[9px] mt-0.5">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selection */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Mood</p>
              <div className="flex flex-wrap gap-1.5">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-all",
                      selectedMood === mood.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", mood.color)} />
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Tempo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Duration
                  </p>
                  <span className="text-xs">{duration}s</span>
                </div>
                <Slider
                  value={[duration]}
                  onValueChange={([v]) => setDuration(v)}
                  min={5}
                  max={180}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Tempo</p>
                  <span className="text-xs">{tempo} BPM</span>
                </div>
                <Slider
                  value={[tempo]}
                  onValueChange={([v]) => setTempo(v)}
                  min={60}
                  max={180}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Custom Prompt */}
            <Input
              placeholder="Optional: Describe the music you want..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="text-sm"
            />

            {/* Generate Button */}
            <Button
              className="w-full"
              onClick={handleGenerateMusic}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Composing... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Music
                </>
              )}
            </Button>
          </TabsContent>

          {/* SFX Tab */}
          <TabsContent value="sfx" className="space-y-3 mt-3">
            <p className="text-xs text-muted-foreground">Quick sound effects for your video</p>
            <div className="grid grid-cols-3 gap-2">
              {sfxCategories.map((sfx) => (
                <Button
                  key={sfx.id}
                  variant="outline"
                  className="flex flex-col h-auto py-3"
                  onClick={() => handleGenerateSFX(sfx.id)}
                  disabled={isGenerating}
                >
                  <span className="text-xl mb-1">{sfx.emoji}</span>
                  <span className="text-xs">{sfx.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>

          {/* Ambient Tab */}
          <TabsContent value="ambient" className="space-y-3 mt-3">
            <p className="text-xs text-muted-foreground">Background ambient sounds</p>
            <div className="grid grid-cols-2 gap-2">
              {['nature', 'city', 'office', 'cafe', 'rain', 'ocean'].map((env) => (
                <Button
                  key={env}
                  variant="outline"
                  className="capitalize"
                  onClick={() => handleGenerateAmbient(env)}
                  disabled={isGenerating}
                >
                  {env}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Duration</p>
                <span className="text-xs">{duration}s</span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={([v]) => setDuration(v)}
                min={10}
                max={300}
                step={10}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {/* Generated Result */}
        {generatedMusic && (
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {generatedMusic.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {generatedMusic.duration}s • {generatedMusic.metadata?.bpm || '—'} BPM
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Button className="w-full" size="sm" onClick={handleApply}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Apply to Video
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MusicComposerPanel;
