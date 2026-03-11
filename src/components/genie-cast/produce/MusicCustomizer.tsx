/**
 * MusicCustomizer — Industry-aware music & SFX customization panel
 *
 * Features:
 * 1. Auto-fills genre/mood/BPM from project industry + format (via musicAutoComposer)
 * 2. Genre/mood/BPM pickers with real-time prompt preview
 * 3. 15s preview playback before committing
 * 4. Upload your own music (wav/mp3/ogg → Supabase Storage)
 * 5. Per-scene SFX suggestions from industry + scene type
 * 6. Integrates with useMusicComposerAgent for generation
 *
 * @see src/config/musicAutoComposer.ts — industry/format/mood mappings
 * @see src/hooks/useMusicComposerAgent.ts — generation hook
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Mic2, Play, Pause, Square, Upload, Download,
  Loader2, Sparkles, Volume2, Sliders, RefreshCw,
  ChevronDown, ChevronUp, X, Check, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  INDUSTRY_MUSIC_MAP,
  FORMAT_MUSIC_MAP,
  composeMusicPrompt,
  composeSfxPrompts,
  type IndustryMusicProfile,
  type FormatMusicProfile,
  type MusicComposition,
  type SfxComposition,
} from '@/config/musicAutoComposer';

import {
  useMusicComposerAgent,
  type MusicStyle,
  type MusicMood,
  type GeneratedAudio,
} from '@/hooks/useMusicComposerAgent';

// ─── TYPES ─────────────────────────────────────────────────────────────────

export interface MusicCustomizerProps {
  /** Project industry (auto-fills defaults) */
  industry?: string;
  /** Project format (social-clip, explainer, documentary, etc.) */
  format?: string;
  /** Target scene duration in seconds */
  sceneDuration?: number;
  /** Scene index (for position-aware pacing) */
  sceneIndex?: number;
  /** Total scenes (for position-aware pacing) */
  totalScenes?: number;
  /** Quality tier */
  quality?: 'draft' | 'production' | 'cinematic';
  /** Current scene type (for SFX suggestions) */
  sceneType?: string;
  /** Callback when music is selected/generated */
  onMusicSelected?: (audio: GeneratedAudio) => void;
  /** Callback when SFX is selected */
  onSfxSelected?: (audio: GeneratedAudio) => void;
  /** Callback when user uploads custom music */
  onCustomUpload?: (file: File, url: string) => void;
  /** Optional className */
  className?: string;
}

// Available moods for the mood picker
const MOOD_OPTIONS = [
  { value: 'inspiring', label: 'Inspiring', color: 'bg-amber-500' },
  { value: 'educational', label: 'Educational', color: 'bg-blue-500' },
  { value: 'dramatic', label: 'Dramatic', color: 'bg-red-500' },
  { value: 'playful', label: 'Playful', color: 'bg-pink-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-orange-500' },
  { value: 'conversational', label: 'Conversational', color: 'bg-green-500' },
  { value: 'authoritative', label: 'Authoritative', color: 'bg-indigo-500' },
  { value: 'empathetic', label: 'Empathetic', color: 'bg-purple-500' },
  { value: 'celebratory', label: 'Celebratory', color: 'bg-yellow-500' },
  { value: 'mysterious', label: 'Mysterious', color: 'bg-slate-500' },
  { value: 'nostalgic', label: 'Nostalgic', color: 'bg-rose-500' },
  { value: 'provocative', label: 'Provocative', color: 'bg-red-600' },
] as const;

// Map musicAutoComposer styles → useMusicComposerAgent MusicStyle
const STYLE_TO_MUSIC_STYLE: Record<string, MusicStyle> = {
  'corporate-ambient': 'corporate',
  'clinical-ambient': 'ambient',
  'electronic-upbeat': 'electronic',
  'classical-corporate': 'classical',
  'acoustic-warm': 'acoustic',
  'cinematic-epic': 'cinematic',
  'jazz-acoustic': 'jazz',
  'electronic-minimal': 'electronic',
  'aspirational-ambient': 'ambient',
  'driving-electronic': 'electronic',
  'world-acoustic': 'acoustic',
  'high-energy-electronic': 'electronic',
  'formal-classical': 'classical',
  'inspirational-acoustic': 'inspirational',
  'formal-ambient': 'ambient',
  'modern-corporate': 'corporate',
};

// Map mood to MusicMood for the hook
const MOOD_TO_MUSIC_MOOD: Record<string, MusicMood> = {
  inspiring: 'hopeful',
  educational: 'relaxing',
  dramatic: 'tense',
  playful: 'happy',
  urgent: 'energetic',
  conversational: 'relaxing',
  authoritative: 'energetic',
  empathetic: 'sad',
  celebratory: 'happy',
  mysterious: 'mysterious',
  nostalgic: 'romantic',
  provocative: 'dark',
};

// ─── COMPONENT ─────────────────────────────────────────────────────────────

export function MusicCustomizer({
  industry = 'general',
  format = 'explainer',
  sceneDuration = 30,
  sceneIndex = 0,
  totalScenes = 1,
  quality = 'production',
  sceneType = 'talking-head',
  onMusicSelected,
  onSfxSelected,
  onCustomUpload,
  className,
}: MusicCustomizerProps) {
  const composer = useMusicComposerAgent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Derive defaults from industry/format ──────────────────────────────
  const industryProfile = useMemo(
    () => INDUSTRY_MUSIC_MAP[industry] || INDUSTRY_MUSIC_MAP.general,
    [industry]
  );
  const formatProfile = useMemo(
    () => FORMAT_MUSIC_MAP[format] || FORMAT_MUSIC_MAP.explainer,
    [format]
  );

  // ─── State ─────────────────────────────────────────────────────────────
  const [selectedMood, setSelectedMood] = useState('conversational');
  const [bpm, setBpm] = useState(
    Math.round((industryProfile.bpmRange[0] + industryProfile.bpmRange[1]) / 2)
  );
  const [duration, setDuration] = useState(Math.min(sceneDuration, 60));
  const [customPrompt, setCustomPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [sfxExpanded, setSfxExpanded] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Update BPM when industry changes
  useEffect(() => {
    const profile = INDUSTRY_MUSIC_MAP[industry] || INDUSTRY_MUSIC_MAP.general;
    setBpm(Math.round((profile.bpmRange[0] + profile.bpmRange[1]) / 2));
  }, [industry]);

  // ─── Auto-composed prompt preview ──────────────────────────────────────
  const autoComposition = useMemo<MusicComposition>(
    () =>
      composeMusicPrompt({
        industry,
        format,
        mood: selectedMood,
        sceneDuration: duration,
        sceneIndex,
        totalScenes,
        quality,
      }),
    [industry, format, selectedMood, duration, sceneIndex, totalScenes, quality]
  );

  // ─── SFX suggestions ──────────────────────────────────────────────────
  const sfxSuggestions = useMemo<SfxComposition[]>(
    () =>
      composeSfxPrompts({
        industry,
        format,
        mood: selectedMood,
        sceneType,
      }),
    [industry, format, selectedMood, sceneType]
  );

  // ─── Generate music ────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const musicStyle = STYLE_TO_MUSIC_STYLE[industryProfile.style] || 'corporate';
    const musicMood = MOOD_TO_MUSIC_MOOD[selectedMood] || 'relaxing';

    const result = await composer.generateMusic({
      type: 'music',
      style: musicStyle,
      mood: musicMood,
      prompt: customPrompt || autoComposition.musicPrompt,
      duration,
      bpm,
      instruments: autoComposition.instruments,
    });

    if (result && onMusicSelected) {
      onMusicSelected(result);
    }
  }, [composer, industryProfile, selectedMood, customPrompt, autoComposition, duration, bpm, onMusicSelected]);

  // ─── Generate SFX ──────────────────────────────────────────────────────
  const handleGenerateSfx = useCallback(
    async (sfx: SfxComposition) => {
      const result = await composer.generateSFX(sfx.prompt, sfx.duration);
      if (result && onSfxSelected) {
        onSfxSelected(result);
      }
    },
    [composer, onSfxSelected]
  );

  // ─── Preview playback ─────────────────────────────────────────────────
  const handlePreview = useCallback(
    (audio: GeneratedAudio) => {
      if (previewingId === audio.id && isPreviewPlaying) {
        // Pause
        previewAudioRef.current?.pause();
        setIsPreviewPlaying(false);
        setPreviewingId(null);
        return;
      }

      // Stop any current preview
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }

      const audioEl = new Audio(audio.audioUrl);
      previewAudioRef.current = audioEl;

      // Auto-stop at 15s for preview
      const timeout = setTimeout(() => {
        audioEl.pause();
        setIsPreviewPlaying(false);
        setPreviewingId(null);
      }, 15_000);

      audioEl.onended = () => {
        clearTimeout(timeout);
        setIsPreviewPlaying(false);
        setPreviewingId(null);
      };

      audioEl.play();
      setIsPreviewPlaying(true);
      setPreviewingId(audio.id);
    },
    [previewingId, isPreviewPlaying]
  );

  // ─── File upload ───────────────────────────────────────────────────────
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload an audio file (MP3, WAV, OGG, AAC)');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error('File too large (max 50MB)');
        return;
      }

      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      onCustomUpload?.(file, url);
      toast.success(`Uploaded: ${file.name}`);
    },
    [onCustomUpload]
  );

  // Cleanup preview audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, []);

  return (
    <Card className={cn('border-purple-500/20', className)}>
      <CardHeader
        className="cursor-pointer pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <CardTitle className="text-sm">Music & SFX Customizer</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {industryProfile.style}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <CardDescription className="text-xs">
          Auto-tuned for {industry} · {format} — adjust mood, BPM, instruments, or upload your own
        </CardDescription>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 space-y-4">
              <Tabs defaultValue="music" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-8">
                  <TabsTrigger value="music" className="text-xs gap-1">
                    <Music className="w-3 h-3" /> Music
                  </TabsTrigger>
                  <TabsTrigger value="sfx" className="text-xs gap-1">
                    <Mic2 className="w-3 h-3" /> SFX
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs gap-1">
                    <Upload className="w-3 h-3" /> Upload
                  </TabsTrigger>
                </TabsList>

                {/* ── MUSIC TAB ─────────────────────────────────────────── */}
                <TabsContent value="music" className="space-y-3 mt-3">
                  {/* Industry auto-detect banner */}
                  <div className="flex items-center gap-2 p-2 rounded-md bg-purple-500/10 text-xs text-purple-300">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      Auto-configured: <strong>{industryProfile.style}</strong> ·{' '}
                      {industryProfile.bpmRange[0]}-{industryProfile.bpmRange[1]} BPM ·{' '}
                      {industryProfile.instruments.slice(0, 3).join(', ')}
                    </span>
                  </div>

                  {/* Mood picker — visual chips */}
                  <div>
                    <Label className="text-xs mb-2 block">Mood</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {MOOD_OPTIONS.map(({ value, label, color }) => (
                        <button
                          key={value}
                          onClick={() => setSelectedMood(value)}
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border',
                            selectedMood === value
                              ? `${color} text-white border-transparent ring-2 ring-white/20`
                              : 'bg-transparent text-muted-foreground border-border hover:border-white/30'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BPM slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs">BPM</Label>
                      <span className="text-xs text-muted-foreground font-mono">{bpm}</span>
                    </div>
                    <Slider
                      value={[bpm]}
                      onValueChange={([v]) => setBpm(v)}
                      min={60}
                      max={160}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                      <span>60 (Slow)</span>
                      <span>110 (Medium)</span>
                      <span>160 (Fast)</span>
                    </div>
                  </div>

                  {/* Duration slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs">Duration</Label>
                      <span className="text-xs text-muted-foreground font-mono">{duration}s</span>
                    </div>
                    <Slider
                      value={[duration]}
                      onValueChange={([v]) => setDuration(v)}
                      min={10}
                      max={Math.min(formatProfile.maxDuration, 120)}
                      step={5}
                    />
                  </div>

                  {/* Instruments (read-only display from auto-config) */}
                  <div>
                    <Label className="text-xs mb-1 block">Instruments</Label>
                    <div className="flex flex-wrap gap-1">
                      {autoComposition.instruments.map((inst) => (
                        <Badge key={inst} variant="outline" className="text-[10px]">
                          {inst}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Custom prompt override */}
                  <div>
                    <Label className="text-xs mb-1 block">Custom prompt (optional)</Label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Override the auto-generated prompt..."
                      className="text-xs h-16 resize-none"
                    />
                  </div>

                  {/* Auto-generated prompt preview */}
                  <div className="p-2 rounded-md bg-muted/50 border border-dashed">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">
                      Generated Prompt
                    </p>
                    <p className="text-[10px] text-foreground/80 leading-relaxed">
                      {customPrompt || autoComposition.musicPrompt}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-[9px]">
                        {autoComposition.loop ? 'Loop' : 'One-shot'}
                      </Badge>
                      <Badge variant="secondary" className="text-[9px]">
                        Fade: {autoComposition.fadeType}
                      </Badge>
                      <Badge variant="secondary" className="text-[9px]">
                        Duck: {Math.round(autoComposition.duckingLevel * 100)}%
                      </Badge>
                    </div>
                  </div>

                  {/* Generate button */}
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    disabled={composer.isGenerating}
                    onClick={handleGenerate}
                  >
                    {composer.isGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" /> Generate Music
                      </>
                    )}
                  </Button>

                  {/* Generation progress */}
                  {composer.isGenerating && (
                    <div>
                      <Progress value={composer.progress || 0} className="h-2" />
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {composer.currentStep || 'Processing...'}
                      </p>
                    </div>
                  )}

                  {/* Generated results with 15s preview */}
                  {composer.generatedAudio?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">
                        Generated ({composer.generatedAudio.length})
                      </p>
                      {composer.generatedAudio
                        .filter((a) => a.type === 'music')
                        .slice(0, 5)
                        .map((audio) => (
                          <div
                            key={audio.id}
                            className="flex items-center gap-2 p-1.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handlePreview(audio)}
                            >
                              {previewingId === audio.id && isPreviewPlaying ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                            </Button>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] truncate">
                                {audio.style || 'Music'} · {audio.mood || ''} · {audio.duration}s
                              </p>
                              {previewingId === audio.id && isPreviewPlaying && (
                                <p className="text-[9px] text-purple-400">15s preview playing...</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => composer.downloadAudio(audio)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            {onMusicSelected && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-green-400 hover:text-green-300"
                                onClick={() => onMusicSelected(audio)}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>

                {/* ── SFX TAB ──────────────────────────────────────────── */}
                <TabsContent value="sfx" className="space-y-3 mt-3">
                  {/* Industry SFX suggestions */}
                  <div className="flex items-center gap-2 p-2 rounded-md bg-blue-500/10 text-xs text-blue-300">
                    <Mic2 className="w-3 h-3" />
                    <span>
                      Suggested for <strong>{industry}</strong> · {sceneType}
                    </span>
                  </div>

                  {sfxSuggestions.length > 0 ? (
                    <div className="space-y-2">
                      {sfxSuggestions.map((sfx, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-md border border-border/50 hover:border-blue-500/30 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-xs font-medium">{sfx.prompt}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {sfx.timing} · {sfx.duration}s
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            disabled={composer.isGenerating}
                            onClick={() => handleGenerateSfx(sfx)}
                          >
                            <Zap className="w-3 h-3" /> Generate
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No SFX suggestions for this scene type
                    </p>
                  )}

                  <Separator />

                  {/* Custom SFX prompt */}
                  <div>
                    <Label className="text-xs mb-1 block">Custom SFX prompt</Label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Describe the sound effect..."
                        className="text-xs h-14 resize-none flex-1"
                        id="custom-sfx-prompt"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="self-end h-7 text-xs gap-1"
                        disabled={composer.isGenerating}
                        onClick={() => {
                          const el = document.getElementById('custom-sfx-prompt') as HTMLTextAreaElement;
                          if (el?.value.trim()) {
                            composer.generateSFX(el.value.trim(), 3);
                          }
                        }}
                      >
                        <Zap className="w-3 h-3" /> Go
                      </Button>
                    </div>
                  </div>

                  {/* Generated SFX results */}
                  {composer.generatedAudio?.filter((a) => a.type === 'sfx').length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">
                        Generated SFX
                      </p>
                      {composer.generatedAudio
                        .filter((a) => a.type === 'sfx')
                        .slice(0, 5)
                        .map((audio) => (
                          <div
                            key={audio.id}
                            className="flex items-center gap-2 p-1.5 rounded-md bg-muted/30"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handlePreview(audio)}
                            >
                              {previewingId === audio.id && isPreviewPlaying ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                            </Button>
                            <p className="text-[10px] flex-1 truncate">{audio.prompt}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => composer.downloadAudio(audio)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            {onSfxSelected && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-green-400"
                                onClick={() => onSfxSelected(audio)}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>

                {/* ── UPLOAD TAB ────────────────────────────────────────── */}
                <TabsContent value="upload" className="space-y-3 mt-3">
                  <div className="text-center py-4 space-y-3">
                    <div
                      className="border-2 border-dashed border-border/50 rounded-lg p-6 cursor-pointer hover:border-purple-500/30 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Click to upload your own music
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        MP3, WAV, OGG, AAC · Max 50MB
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    {uploadedFile && (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                        <Check className="w-3 h-3 text-green-400" />
                        <p className="text-xs text-green-300 truncate flex-1">
                          {uploadedFile.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => setUploadedFile(null)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <p className="text-[10px] text-muted-foreground/60">
                      Uploaded music will be used instead of AI-generated tracks.
                      Ensure you have rights to use the music commercially.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default MusicCustomizer;
