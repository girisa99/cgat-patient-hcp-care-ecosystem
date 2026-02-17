/**
 * Script Stitcher Component - Enhanced Multi-Track
 * P1 Feature: Combine multiple scripts with multiple audio tracks
 * Flow: Add scripts → Add audios → Arrange timeline → Mix → Export
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText,
  Music,
  Mic,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Layers,
  Clock,
  ArrowUp,
  ArrowDown,
  AudioWaveform,
  Settings2,
  RotateCcw,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

export interface ScriptSegment {
  id: string;
  scriptId: string;
  title: string;
  content: string;
  duration?: number;
  hasVoiceover?: boolean;
  voiceoverUrl?: string;
  startTime?: number; // Timeline position in seconds
}

export interface MusicTrack {
  id: string;
  name: string;
  url?: string;
  duration?: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
  startTime?: number; // Timeline position
  loop?: boolean;
  muted?: boolean;
}

interface ScriptStitcherProps {
  availableScripts?: Array<{ id: string; title: string; content: string }>;
  availableMusic?: Array<{ id: string; name: string; url?: string; duration?: number }>;
  onExport?: (result: StitchedResult) => void;
  className?: string;
}

export interface StitchedResult {
  segments: ScriptSegment[];
  music: MusicTrack[];
  totalDuration: number;
  combinedScript: string;
}

export const ScriptStitcher: React.FC<ScriptStitcherProps> = ({
  availableScripts = [],
  availableMusic = [],
  onExport,
  className
}) => {
  const { vibrate } = useMobileFeatures();
  
  const [segments, setSegments] = useState<ScriptSegment[]>([]);
  const [audioTracks, setAudioTracks] = useState<MusicTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [masterVolume, setMasterVolume] = useState([0.8]);
  const [activeTab, setActiveTab] = useState<'scripts' | 'audio' | 'timeline'>('scripts');
  
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);

  // Calculate total duration based on segments
  const totalDuration = useMemo(() => {
    const scriptDuration = segments.reduce((total, seg) => {
      const wordCount = seg.content.split(/\s+/).length;
      const estimatedDuration = seg.duration || (wordCount / 150) * 60;
      return total + estimatedDuration;
    }, 0);
    
    const maxAudioEnd = Math.max(
      0,
      ...audioTracks.map(t => (t.startTime || 0) + (t.duration || 0))
    );
    
    return Math.max(scriptDuration, maxAudioEnd);
  }, [segments, audioTracks]);

  // Combined script text
  const combinedScript = useMemo(() => {
    return segments.map(s => s.content).join('\n\n---\n\n');
  }, [segments]);

  // Add script segment
  const addSegment = useCallback((script: { id: string; title: string; content: string }) => {
    const currentEnd = segments.reduce((acc, s) => acc + (s.duration || 0), 0);
    const newSegment: ScriptSegment = {
      id: crypto.randomUUID(),
      scriptId: script.id,
      title: script.title,
      content: script.content,
      duration: (script.content.split(/\s+/).length / 150) * 60,
      startTime: currentEnd,
    };
    setSegments(prev => [...prev, newSegment]);
    vibrate?.(50);
    toast.success(`Added "${script.title}"`);
  }, [segments, vibrate]);

  // Add audio track
  const addAudioTrack = useCallback((music: { id: string; name: string; url?: string; duration?: number }) => {
    const newTrack: MusicTrack = {
      id: crypto.randomUUID(),
      name: music.name,
      url: music.url,
      duration: music.duration || 60,
      volume: 0.5,
      fadeIn: 1,
      fadeOut: 2,
      startTime: 0,
      loop: false,
      muted: false,
    };
    setAudioTracks(prev => [...prev, newTrack]);
    vibrate?.(50);
    toast.success(`Added "${music.name}" to audio tracks`);
  }, [vibrate]);

  // Remove segment
  const removeSegment = useCallback((segmentId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
    vibrate?.(30);
  }, [vibrate]);

  // Remove audio track
  const removeAudioTrack = useCallback((trackId: string) => {
    setAudioTracks(prev => prev.filter(t => t.id !== trackId));
    vibrate?.(30);
  }, [vibrate]);

  // Reorder segment
  const moveSegment = useCallback((segmentId: string, direction: 'up' | 'down') => {
    setSegments(prev => {
      const index = prev.findIndex(s => s.id === segmentId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newSegments = [...prev];
      [newSegments[index], newSegments[newIndex]] = [newSegments[newIndex], newSegments[index]];
      return newSegments;
    });
    vibrate?.(30);
  }, [vibrate]);

  // Update audio track
  const updateAudioTrack = useCallback((trackId: string, updates: Partial<MusicTrack>) => {
    setAudioTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, ...updates } : t
    ));
  }, []);

  // Duplicate audio track
  const duplicateAudioTrack = useCallback((trackId: string) => {
    const track = audioTracks.find(t => t.id === trackId);
    if (track) {
      const newTrack: MusicTrack = {
        ...track,
        id: crypto.randomUUID(),
        name: `${track.name} (copy)`,
        startTime: (track.startTime || 0) + (track.duration || 30),
      };
      setAudioTracks(prev => [...prev, newTrack]);
      toast.success('Track duplicated');
    }
  }, [audioTracks]);

  // Preview playback
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
      // Pause all audio
      audioRefs.current.forEach(audio => audio.pause());
    } else {
      setIsPlaying(true);
      playbackInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            if (playbackInterval.current) {
              clearInterval(playbackInterval.current);
            }
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
  }, [isPlaying, totalDuration]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (playbackInterval.current) {
      clearInterval(playbackInterval.current);
    }
    audioRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  // Export stitched result
  const handleExport = useCallback(() => {
    if (segments.length === 0) {
      toast.error('Add at least one script segment');
      return;
    }

    const result: StitchedResult = {
      segments,
      music: audioTracks,
      totalDuration,
      combinedScript,
    };

    onExport?.(result);
    vibrate?.(200);
    toast.success('Script stitched! Ready for production.');
  }, [segments, audioTracks, totalDuration, combinedScript, onExport, vibrate]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-primary" />
            Multi-Track Stitcher
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {segments.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Music className="h-3 w-3 mr-1" />
              {audioTracks.length}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(totalDuration)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scripts" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">
              <Music className="h-3 w-3 mr-1" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <AudioWaveform className="h-3 w-3 mr-1" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Scripts Tab */}
          <TabsContent value="scripts" className="space-y-3 mt-3">
            {/* Add Script Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {availableScripts.slice(0, 4).map(script => (
                <Button
                  key={script.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 justify-start"
                  onClick={() => addSegment(script)}
                >
                  <Plus className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate text-xs">{script.title}</span>
                </Button>
              ))}
            </div>
            
            {availableScripts.length > 4 && (
              <p className="text-xs text-muted-foreground text-center">
                +{availableScripts.length - 4} more scripts available
              </p>
            )}

            {/* Segments List */}
            {segments.length === 0 ? (
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">No scripts added</p>
                <p className="text-xs text-muted-foreground">
                  Click buttons above to add scripts
                </p>
              </div>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-2">
                  {segments.map((segment, index) => (
                    <div key={segment.id} className="border rounded-lg p-2 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium flex-1 truncate">
                          {segment.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(segment.duration || 0)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveSegment(segment.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveSegment(segment.id, 'down')}
                            disabled={index === segments.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeSegment(segment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pl-6">
                        {segment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio" className="space-y-3 mt-3">
            {/* Add Audio Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {availableMusic.slice(0, 4).map(music => (
                <Button
                  key={music.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 justify-start"
                  onClick={() => addAudioTrack(music)}
                >
                  <Plus className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate text-xs">{music.name}</span>
                </Button>
              ))}
            </div>

            {availableMusic.length > 4 && (
              <p className="text-xs text-muted-foreground text-center">
                +{availableMusic.length - 4} more tracks available
              </p>
            )}

            {/* Audio Tracks List */}
            {audioTracks.length === 0 ? (
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">No audio tracks</p>
                <p className="text-xs text-muted-foreground">
                  Add background music, voiceovers, or SFX
                </p>
              </div>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-3 pr-2">
                  {audioTracks.map((track) => (
                    <div key={track.id} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium flex-1 truncate">
                          {track.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(track.duration || 0)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateAudioTrack(track.id, { muted: !track.muted })}
                        >
                          {track.muted ? (
                            <VolumeX className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      {/* Volume Control */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-10">Vol</span>
                        <Slider
                          value={[track.volume]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={([v]) => updateAudioTrack(track.id, { volume: v })}
                          className="flex-1"
                          disabled={track.muted}
                        />
                        <span className="text-[10px] text-muted-foreground w-8">
                          {Math.round(track.volume * 100)}%
                        </span>
                      </div>

                      {/* Start Time */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-10">Start</span>
                        <Slider
                          value={[track.startTime || 0]}
                          min={0}
                          max={totalDuration || 60}
                          step={1}
                          onValueChange={([v]) => updateAudioTrack(track.id, { startTime: v })}
                          className="flex-1"
                        />
                        <span className="text-[10px] text-muted-foreground w-8">
                          {formatTime(track.startTime || 0)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-1">
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={track.loop}
                            onCheckedChange={(v) => updateAudioTrack(track.id, { loop: v })}
                            className="scale-75"
                          />
                          <span className="text-[10px] text-muted-foreground">Loop</span>
                        </div>
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => duplicateAudioTrack(track.id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeAudioTrack(track.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Master Volume */}
            {audioTracks.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Settings2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">Master</span>
                <Slider
                  value={masterVolume}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={setMasterVolume}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">
                  {Math.round(masterVolume[0] * 100)}%
                </span>
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-3 mt-3">
            {/* Timeline Visualization */}
            <div className="border rounded-lg p-3 bg-muted/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Timeline</span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              {/* Playhead */}
              <div className="relative h-2 bg-muted rounded-full mb-3">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                  style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
                />
              </div>

              {/* Script Track */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-blue-500" />
                  <span className="text-[10px] font-medium">Scripts</span>
                </div>
                <div className="h-8 bg-muted/50 rounded flex overflow-hidden">
                  {segments.map((seg, i) => {
                    const segDuration = seg.duration || 10;
                    const widthPct = totalDuration > 0 ? (segDuration / totalDuration) * 100 : 0;
                    return (
                      <div
                        key={seg.id}
                        className="h-full flex items-center justify-center text-[9px] text-white font-medium border-r border-background"
                        style={{ 
                          width: `${widthPct}%`,
                          backgroundColor: `hsl(${200 + i * 20}, 70%, 50%)`
                        }}
                        title={seg.title}
                      >
                        <span className="truncate px-1">{seg.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audio Tracks */}
              {audioTracks.map((track, i) => (
                <div key={track.id} className="space-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <Music className="h-3 w-3 text-purple-500" />
                    <span className="text-[10px] font-medium truncate flex-1">{track.name}</span>
                    {track.muted && <VolumeX className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <div className="h-6 bg-muted/50 rounded relative overflow-hidden">
                    <div
                      className={cn(
                        "absolute h-full rounded flex items-center justify-center text-[9px] text-white font-medium",
                        track.muted ? "opacity-30" : ""
                      )}
                      style={{ 
                        left: `${totalDuration > 0 ? ((track.startTime || 0) / totalDuration) * 100 : 0}%`,
                        width: `${totalDuration > 0 ? ((track.duration || 30) / totalDuration) * 100 : 50}%`,
                        backgroundColor: `hsl(${280 + i * 30}, 60%, 50%)`
                      }}
                    >
                      <AudioWaveform className="h-3 w-3 opacity-50" />
                    </div>
                  </div>
                </div>
              ))}

              {segments.length === 0 && audioTracks.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">
                    Add scripts and audio to see timeline
                  </p>
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={stopPlayback}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10"
                onClick={togglePlayback}
                disabled={segments.length === 0 && audioTracks.length === 0}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={stopPlayback}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setSegments([]);
              setAudioTracks([]);
              toast.info('Cleared all tracks');
            }}
            disabled={segments.length === 0 && audioTracks.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-pink-500"
            onClick={handleExport}
            disabled={segments.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Stitch & Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScriptStitcher;
