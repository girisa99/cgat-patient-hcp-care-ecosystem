/**
 * Voice Director Panel
 * Multi-provider TTS UI with coaching, narration, dialogue, and presentation modes
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Loader2, 
  Volume2, 
  Sparkles,
  MessageSquare,
  BookOpen,
  Users,
  Presentation,
  X,
  Wand2,
  Timer,
  FileAudio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useVoiceDirector, 
  VoiceProvider, 
  VoiceMode,
  VoiceDirectorResult,
  VOICE_OPTIONS,
  MODE_DESCRIPTIONS,
} from '@/hooks/useVoiceDirector';

interface VoiceDirectorPanelProps {
  initialText?: string;
  onVoiceGenerated?: (result: VoiceDirectorResult) => void;
  onClose?: () => void;
  className?: string;
}

const PROVIDER_INFO: Record<VoiceProvider, { name: string; description: string; icon: React.ReactNode }> = {
  auto: {
    name: 'Auto Select',
    description: 'Best provider based on content',
    icon: <Sparkles className="h-4 w-4" />,
  },
  elevenlabs: {
    name: 'ElevenLabs',
    description: 'Expressive, natural voices',
    icon: <Volume2 className="h-4 w-4" />,
  },
  openai: {
    name: 'OpenAI',
    description: 'Reliable HD quality',
    icon: <Wand2 className="h-4 w-4" />,
  },
  google: {
    name: 'Google Cloud',
    description: 'Clear, professional audio',
    icon: <Mic className="h-4 w-4" />,
  },
};

const MODE_ICONS: Record<VoiceMode, React.ReactNode> = {
  coaching: <MessageSquare className="h-4 w-4" />,
  narration: <BookOpen className="h-4 w-4" />,
  dialogue: <Users className="h-4 w-4" />,
  presentation: <Presentation className="h-4 w-4" />,
};

export const VoiceDirectorPanel: React.FC<VoiceDirectorPanelProps> = ({
  initialText = '',
  onVoiceGenerated,
  onClose,
  className,
}) => {
  const [text, setText] = useState(initialText);
  const [provider, setProvider] = useState<VoiceProvider>('auto');
  const [mode, setMode] = useState<VoiceMode>('narration');
  const [voice, setVoice] = useState<string>('');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
  });

  const {
    isGenerating,
    isPlaying,
    lastResult,
    error,
    generateVoice,
    togglePlayback,
    downloadAudio,
    getVoicesForProvider,
  } = useVoiceDirector();

  const availableVoices = getVoicesForProvider(provider);

  // Handle voice generation
  const handleGenerate = useCallback(async () => {
    const result = await generateVoice(text, {
      provider,
      voice: voice || undefined,
      mode,
      speed,
      pitch: provider === 'google' ? pitch : undefined,
      voiceSettings: provider === 'elevenlabs' ? voiceSettings : undefined,
    });

    if (result && onVoiceGenerated) {
      onVoiceGenerated(result);
    }
  }, [text, provider, voice, mode, speed, pitch, voiceSettings, generateVoice, onVoiceGenerated]);

  // Word and character count
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const estimatedDuration = (wordCount / 150) * 60 / speed;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Voice Director</CardTitle>
              <CardDescription className="text-xs">Multi-provider AI voiceover</CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Provider</Label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PROVIDER_INFO) as VoiceProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setProvider(p);
                  setVoice(''); // Reset voice when provider changes
                }}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border text-left transition-all",
                  provider === p
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded flex items-center justify-center",
                  provider === p ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {PROVIDER_INFO[p].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{PROVIDER_INFO[p].name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {PROVIDER_INFO[p].description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Voice Mode</Label>
          <Tabs value={mode} onValueChange={(v) => setMode(v as VoiceMode)}>
            <TabsList className="grid grid-cols-4 h-9">
              {(Object.keys(MODE_ICONS) as VoiceMode[]).map((m) => (
                <TabsTrigger key={m} value={m} className="text-xs px-2">
                  {MODE_ICONS[m]}
                  <span className="ml-1 hidden sm:inline capitalize">{m}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="text-[10px] text-muted-foreground">{MODE_DESCRIPTIONS[mode]}</p>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Voice</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <div className="flex items-center gap-2">
                    <span>{v.name}</span>
                    <Badge variant="outline" className="text-[9px]">{v.style}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Script / Text</Label>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} chars</span>
              <span>•</span>
              <Timer className="h-3 w-3" />
              <span>~{estimatedDuration.toFixed(0)}s</span>
            </div>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech..."
            className="min-h-[100px] text-sm resize-none"
          />
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Speed</Label>
            <span className="text-xs text-muted-foreground">{speed.toFixed(2)}x</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={([v]) => setSpeed(v)}
            min={0.5}
            max={2.0}
            step={0.05}
            className="w-full"
          />
        </div>

        {/* Advanced Settings (ElevenLabs & Google) */}
        {(provider === 'elevenlabs' || provider === 'google' || provider === 'auto') && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </Button>

            {showAdvanced && (
              <div className="space-y-3 p-3 rounded-lg bg-muted/50">
                {(provider === 'elevenlabs' || provider === 'auto') && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Stability</Label>
                        <span className="text-xs text-muted-foreground">
                          {voiceSettings.stability.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[voiceSettings.stability]}
                        onValueChange={([v]) => setVoiceSettings(s => ({ ...s, stability: v }))}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Lower = more expressive, Higher = more consistent
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Style</Label>
                        <span className="text-xs text-muted-foreground">
                          {voiceSettings.style.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[voiceSettings.style]}
                        onValueChange={([v]) => setVoiceSettings(s => ({ ...s, style: v }))}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                    </div>
                  </>
                )}

                {provider === 'google' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Pitch</Label>
                      <span className="text-xs text-muted-foreground">{pitch}</span>
                    </div>
                    <Slider
                      value={[pitch]}
                      onValueChange={([v]) => setPitch(v)}
                      min={-20}
                      max={20}
                      step={1}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Voice
              </>
            )}
          </Button>

          {lastResult && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayback}
                disabled={isGenerating}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => downloadAudio()}
                disabled={isGenerating}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Result Info */}
        {lastResult && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Generated Audio</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <p className="text-muted-foreground">Provider</p>
                <p className="font-medium capitalize">{lastResult.provider}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Voice</p>
                <p className="font-medium">{lastResult.voice}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">~{lastResult.duration_estimate?.toFixed(1)}s</p>
              </div>
            </div>

            {/* Coaching Feedback */}
            {lastResult.metadata.coachingFeedback?.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-[10px] font-medium text-amber-600 mb-1">Coaching Tips:</p>
                <ul className="space-y-1">
                  {lastResult.metadata.coachingFeedback.map((tip, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                      <span className="text-amber-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceDirectorPanel;
