/**
 * Music Sync Assembly
 * P2 Feature: Auto-sync clip cuts to music beats
 * Analyzes music tempo and aligns video cuts to beats
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Music,
  Volume2,
  Zap,
  Play,
  Pause,
  Upload,
  Wand2,
  Loader2,
  CheckCircle2,
  RotateCcw,
  AudioWaveform,
  Clock,
  Disc,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TimelineClip } from './MultiClipTimeline';

interface BeatMarker {
  time: number;
  strength: 'strong' | 'medium' | 'weak';
}

interface MusicAnalysis {
  bpm: number;
  beats: BeatMarker[];
  duration: number;
  key?: string;
  mood?: string;
}

interface MusicSyncAssemblyProps {
  clips: TimelineClip[];
  onSyncClips: (syncedClips: TimelineClip[]) => void;
  className?: string;
}

type SyncMode = 'every-beat' | 'strong-beats' | 'bars' | 'custom';

export const MusicSyncAssembly: React.FC<MusicSyncAssemblyProps> = ({
  clips,
  onSyncClips,
  className,
}) => {
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MusicAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [syncMode, setSyncMode] = useState<SyncMode>('strong-beats');
  const [beatOffset, setBeatOffset] = useState(0);
  const [previewClips, setPreviewClips] = useState<TimelineClip[] | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle music file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setMusicFile(file);
      setMusicUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setPreviewClips(null);
    } else {
      toast.error('Please upload an audio file');
    }
  };

  // Simulate music analysis (in production, use Web Audio API or backend)
  const analyzeMusic = useCallback(async () => {
    if (!musicUrl) {
      toast.error('Please upload music first');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeProgress(0);

    try {
      // Step 1: Load audio
      setAnalyzeProgress(20);
      await new Promise(r => setTimeout(r, 500));
      
      // Step 2: Detect tempo (simulated)
      setAnalyzeProgress(50);
      await new Promise(r => setTimeout(r, 700));
      
      // Simulated BPM detection (random between 80-140)
      const detectedBpm = Math.round(80 + Math.random() * 60);
      const beatInterval = 60 / detectedBpm;
      
      // Step 3: Generate beat markers
      setAnalyzeProgress(75);
      
      // Get audio duration
      const audio = new Audio(musicUrl);
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => resolve();
      });
      
      const duration = audio.duration || 60;
      const beats: BeatMarker[] = [];
      
      for (let time = 0; time < duration; time += beatInterval) {
        const beatNum = Math.round(time / beatInterval);
        const strength: BeatMarker['strength'] = 
          beatNum % 4 === 0 ? 'strong' : 
          beatNum % 2 === 0 ? 'medium' : 'weak';
        
        beats.push({ time, strength });
      }
      
      setAnalyzeProgress(100);
      
      const analysisResult: MusicAnalysis = {
        bpm: detectedBpm,
        beats,
        duration,
        key: ['C Major', 'G Major', 'A Minor', 'D Minor'][Math.floor(Math.random() * 4)],
        mood: ['Energetic', 'Chill', 'Epic', 'Romantic'][Math.floor(Math.random() * 4)],
      };
      
      setAnalysis(analysisResult);
      toast.success(`Detected ${detectedBpm} BPM, ${beats.length} beats`);
    } catch (error) {
      toast.error('Failed to analyze music');
    } finally {
      setIsAnalyzing(false);
    }
  }, [musicUrl]);

  // Sync clips to beats
  const syncToBeats = useCallback(() => {
    if (!analysis) {
      toast.error('Analyze music first');
      return;
    }

    const videoClips = clips.filter(c => c.type === 'video');
    if (videoClips.length === 0) {
      toast.error('Add video clips to sync');
      return;
    }

    // Filter beats based on sync mode
    let targetBeats: BeatMarker[];
    switch (syncMode) {
      case 'every-beat':
        targetBeats = analysis.beats;
        break;
      case 'strong-beats':
        targetBeats = analysis.beats.filter(b => b.strength === 'strong');
        break;
      case 'bars':
        targetBeats = analysis.beats.filter((_, i) => i % 4 === 0);
        break;
      case 'custom':
        // Every nth beat based on offset
        const n = Math.max(1, Math.round(beatOffset / 10) + 1);
        targetBeats = analysis.beats.filter((_, i) => i % n === 0);
        break;
      default:
        targetBeats = analysis.beats.filter(b => b.strength !== 'weak');
    }

    // Assign clips to beats
    const sortedClips = [...videoClips].sort((a, b) => a.startTime - b.startTime);
    const syncedClips: TimelineClip[] = [];
    
    let beatIndex = 0;
    for (const clip of sortedClips) {
      if (beatIndex >= targetBeats.length) {
        // No more beats, keep remaining clips at end
        syncedClips.push({
          ...clip,
          startTime: syncedClips.length > 0 
            ? syncedClips[syncedClips.length - 1].startTime + syncedClips[syncedClips.length - 1].duration
            : clip.startTime,
        });
      } else {
        syncedClips.push({
          ...clip,
          startTime: targetBeats[beatIndex].time + beatOffset / 100,
        });
        beatIndex++;
      }
    }

    // Add non-video clips unchanged
    const otherClips = clips.filter(c => c.type !== 'video');
    
    setPreviewClips([...syncedClips, ...otherClips]);
    toast.success(`Synced ${syncedClips.length} clips to ${targetBeats.length} beats`);
  }, [analysis, clips, syncMode, beatOffset]);

  // Apply synced clips
  const applySync = () => {
    if (previewClips) {
      onSyncClips(previewClips);
      toast.success('Music sync applied');
    }
  };

  // Toggle music playback
  const togglePlayback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(musicUrl || '');
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (musicUrl) {
        URL.revokeObjectURL(musicUrl);
      }
    };
  }, [musicUrl]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2 px-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            Music Sync Assembly
          </span>
          {analysis && (
            <Badge variant="secondary" className="text-[10px]">
              {analysis.bpm} BPM
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-3">
        {/* Music Upload */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {!musicFile ? (
            <Button
              variant="outline"
              className="w-full h-16 flex-col gap-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5" />
              <span className="text-[10px]">Upload Music Track</span>
            </Button>
          ) : (
            <div className="p-2 bg-muted/30 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium truncate flex-1">
                  {musicFile.name}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              {/* Analysis Info */}
              {analysis && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-1 bg-background/50 rounded">
                    <Disc className="h-3 w-3 mx-auto mb-0.5" />
                    <span className="text-[9px] text-muted-foreground">{analysis.bpm} BPM</span>
                  </div>
                  <div className="p-1 bg-background/50 rounded">
                    <Clock className="h-3 w-3 mx-auto mb-0.5" />
                    <span className="text-[9px] text-muted-foreground">
                      {Math.floor(analysis.duration / 60)}:{String(Math.floor(analysis.duration % 60)).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-1 bg-background/50 rounded">
                    <Activity className="h-3 w-3 mx-auto mb-0.5" />
                    <span className="text-[9px] text-muted-foreground">{analysis.beats.length} beats</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analyze Progress */}
        {isAnalyzing && (
          <div className="space-y-1">
            <Progress value={analyzeProgress} className="h-2" />
            <p className="text-[10px] text-muted-foreground text-center">
              Detecting tempo and beats...
            </p>
          </div>
        )}

        {/* Analyze Button */}
        {musicFile && !analysis && (
          <Button
            className="w-full"
            onClick={analyzeMusic}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <AudioWaveform className="h-4 w-4 mr-2" />
                Analyze Beats
              </>
            )}
          </Button>
        )}

        {/* Sync Options */}
        {analysis && (
          <>
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground">Sync Mode</Label>
              <RadioGroup
                value={syncMode}
                onValueChange={(value) => setSyncMode(value as SyncMode)}
                className="grid grid-cols-2 gap-1"
              >
                {[
                  { id: 'every-beat', label: 'Every Beat', desc: 'Fast cuts' },
                  { id: 'strong-beats', label: 'Strong Beats', desc: 'Recommended' },
                  { id: 'bars', label: 'Bars (4 beats)', desc: 'Slower pace' },
                  { id: 'custom', label: 'Custom', desc: 'Manual control' },
                ].map(opt => (
                  <div key={opt.id}>
                    <RadioGroupItem value={opt.id} id={opt.id} className="peer sr-only" />
                    <Label
                      htmlFor={opt.id}
                      className={cn(
                        "flex flex-col p-2 rounded border cursor-pointer transition-all",
                        syncMode === opt.id ? "border-primary bg-primary/10" : "border-muted"
                      )}
                    >
                      <span className="text-[10px] font-medium">{opt.label}</span>
                      <span className="text-[8px] text-muted-foreground">{opt.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Beat Offset (for custom mode) */}
            {syncMode === 'custom' && (
              <div className="space-y-1 p-2 bg-muted/30 rounded">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px]">Beat Frequency</Label>
                  <span className="text-[10px] text-muted-foreground">
                    Every {Math.max(1, Math.round(beatOffset / 10) + 1)} beats
                  </span>
                </div>
                <Slider
                  value={[beatOffset]}
                  min={0}
                  max={100}
                  step={10}
                  onValueChange={([value]) => setBeatOffset(value)}
                />
              </div>
            )}

            {/* Sync Button */}
            <Button
              className="w-full"
              onClick={syncToBeats}
              disabled={clips.filter(c => c.type === 'video').length === 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              Sync {clips.filter(c => c.type === 'video').length} Clips to Beats
            </Button>
          </>
        )}

        {/* Preview & Apply */}
        {previewClips && (
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-[11px] font-medium">Sync Preview Ready</span>
            </div>
            <Button
              className="w-full"
              onClick={applySync}
            >
              Apply Music Sync
            </Button>
          </div>
        )}

        {/* Tips */}
        <div className="text-[9px] text-muted-foreground bg-muted/30 p-2 rounded">
          <strong>Tip:</strong> Upload a music track with a clear beat. AI will detect the tempo and align your video cuts to the rhythm.
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicSyncAssembly;
