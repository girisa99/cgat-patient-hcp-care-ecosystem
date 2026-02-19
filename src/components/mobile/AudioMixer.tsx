/**
 * Media Mixer (Video + Audio)
 * Mix video recordings with voiceovers and background music
 * Select video tracks, audio tracks, and create a unified mix for timeline
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Music, 
  Mic, 
  Volume2, 
  VolumeX,
  Video,
  Film,
  Plus,
  Trash2,
  Play,
  Pause,
  Check,
  Loader2,
  ArrowRight,
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

interface VideoTrack {
  id: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  selected: boolean;
  order: number;
  visible: boolean;
}

interface AudioTrack {
  id: string;
  name: string;
  url?: string;
  type: 'recording' | 'voiceover' | 'music';
  duration?: number;
  volume: number;
  muted: boolean;
  // Sync/alignment properties
  startOffset: number; // When this audio starts relative to video (in seconds)
  fadeIn: number; // Fade in duration (seconds)
  fadeOut: number; // Fade out duration (seconds)
  trimStart: number; // Trim from beginning (seconds)
  trimEnd: number; // Trim from end (seconds)
}

interface MixedOutput {
  videoTracks: VideoTrack[];
  audioTracks: AudioTrack[];
  totalDuration: number;
  masterVolume: number;
  // Sync metadata
  syncPoints?: { videoTime: number; audioTrackId: string; label?: string }[];
}

interface AudioMixerProps {
  recordings?: Array<{ id: string; url?: string; duration?: number; name?: string; thumbnailUrl?: string }>;
  voiceovers?: Array<{ id: string; name: string; url?: string }>;
  music?: Array<{ id: string; name: string; url?: string; duration?: number }>;
  onMixComplete?: (mixedOutput: MixedOutput) => void;
  className?: string;
}

export const AudioMixer: React.FC<AudioMixerProps> = ({
  recordings = [],
  voiceovers = [],
  music = [],
  onMixComplete,
  className
}) => {
  const { vibrate } = useMobileFeatures();
  
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [masterVolume, setMasterVolume] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMixing, setIsMixing] = useState(false);

  // Calculate total duration (max of all tracks)
  const totalDuration = useMemo(() => {
    const videoDurations = videoTracks.filter(t => t.selected).map(t => t.duration || 0);
    const audioDurations = audioTracks.map(t => t.duration || 0);
    const allDurations = [...videoDurations, ...audioDurations];
    return allDurations.length > 0 ? Math.max(...allDurations) : 0;
  }, [videoTracks, audioTracks]);

  // Add video track from recordings
  const addVideoTrack = useCallback((rec: { id: string; name?: string; url?: string; duration?: number; thumbnailUrl?: string }) => {
    // Check if already added
    if (videoTracks.some(t => t.id === rec.id)) {
      toast.info('Video already added');
      return;
    }
    
    const newTrack: VideoTrack = {
      id: rec.id,
      name: rec.name || `Video ${videoTracks.length + 1}`,
      url: rec.url,
      thumbnailUrl: rec.thumbnailUrl,
      duration: rec.duration || 30,
      selected: true,
      order: videoTracks.length,
      visible: true,
    };
    
    setVideoTracks(prev => [...prev, newTrack]);
    vibrate?.(50);
    toast.success('Video track added');
  }, [videoTracks, vibrate]);

  // Toggle video track selection
  const toggleVideoSelection = useCallback((trackId: string) => {
    setVideoTracks(prev => 
      prev.map(t => t.id === trackId ? { ...t, selected: !t.selected } : t)
    );
  }, []);

  // Toggle video visibility
  const toggleVideoVisibility = useCallback((trackId: string) => {
    setVideoTracks(prev => 
      prev.map(t => t.id === trackId ? { ...t, visible: !t.visible } : t)
    );
  }, []);

  // Remove video track
  const removeVideoTrack = useCallback((trackId: string) => {
    setVideoTracks(prev => prev.filter(t => t.id !== trackId));
    toast.success('Video track removed');
  }, []);

  // Add audio track
  const addAudioTrack = useCallback((
    item: { id: string; name?: string; url?: string; duration?: number }, 
    type: AudioTrack['type']
  ) => {
    const newTrack: AudioTrack = {
      id: `${type}-${item.id}-${Date.now()}`,
      name: item.name || `${type} ${audioTracks.length + 1}`,
      url: item.url,
      type,
      duration: item.duration || 30,
      volume: type === 'music' ? 30 : 100, // Lower default for music
      muted: false,
      // Sync defaults
      startOffset: 0,
      fadeIn: type === 'music' ? 2 : 0, // Music fades in by default
      fadeOut: type === 'music' ? 2 : 0, // Music fades out by default
      trimStart: 0,
      trimEnd: 0,
    };
    
    setAudioTracks(prev => [...prev, newTrack]);
    vibrate?.(50);
    toast.success(`Added ${type} track`);
  }, [audioTracks.length, vibrate]);

  // Update audio track timing/sync
  const updateAudioTrackTiming = useCallback((trackId: string, updates: Partial<AudioTrack>) => {
    setAudioTracks(prev => 
      prev.map(t => t.id === trackId ? { ...t, ...updates } : t)
    );
  }, []);

  const removeAudioTrack = useCallback((trackId: string) => {
    setAudioTracks(prev => prev.filter(t => t.id !== trackId));
    toast.success('Audio track removed');
  }, []);

  const updateAudioTrackVolume = useCallback((trackId: string, volume: number) => {
    setAudioTracks(prev => 
      prev.map(t => t.id === trackId ? { ...t, volume } : t)
    );
  }, []);

  const toggleAudioMute = useCallback((trackId: string) => {
    setAudioTracks(prev => 
      prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t)
    );
  }, []);

  const handleMix = async () => {
    const selectedVideos = videoTracks.filter(t => t.selected);
    
    if (selectedVideos.length === 0 && audioTracks.length === 0) {
      toast.error('Add at least one video or audio track');
      return;
    }

    setIsMixing(true);
    
    try {
      // Simulate mixing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      vibrate?.(500);
      toast.success('Mix complete! Continue to Timeline');
      
      onMixComplete?.({
        videoTracks: selectedVideos,
        audioTracks,
        totalDuration,
        masterVolume,
      });
    } catch (error) {
      console.error('Mix error:', error);
      toast.error('Mix failed. Please try again.');
    } finally {
      setIsMixing(false);
    }
  };

  const getAudioTypeColor = (type: AudioTrack['type']) => {
    switch (type) {
      case 'recording': return 'bg-blue-500/20 text-blue-600';
      case 'voiceover': return 'bg-purple-500/20 text-purple-600';
      case 'music': return 'bg-amber-500/20 text-amber-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAudioTypeIcon = (type: AudioTrack['type']) => {
    switch (type) {
      case 'voiceover': return Mic;
      case 'music': return Music;
      default: return Volume2;
    }
  };

  const selectedVideoCount = videoTracks.filter(t => t.selected).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Media Mixer</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            <Video className="h-2.5 w-2.5 mr-1" />
            {selectedVideoCount} videos
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            <Music className="h-2.5 w-2.5 mr-1" />
            {audioTracks.length} audio
          </Badge>
        </div>
      </div>

      {/* Video/Audio Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'video' | 'audio')}>
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="video" className="text-xs gap-1.5">
            <Video className="h-3.5 w-3.5" />
            Video Tracks
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-xs gap-1.5">
            <Music className="h-3.5 w-3.5" />
            Audio Tracks
          </TabsTrigger>
        </TabsList>

        {/* Video Tracks Tab */}
        <TabsContent value="video" className="space-y-3 mt-3">
          {/* Available Recordings */}
          <Card className="bg-muted/30">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">Select Video Recordings</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {recordings.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {recordings.map(rec => {
                    const isAdded = videoTracks.some(t => t.id === rec.id);
                    return (
                      <div
                        key={rec.id}
                        className={cn(
                          "relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all",
                          isAdded ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"
                        )}
                        onClick={() => !isAdded && addVideoTrack(rec)}
                      >
                        {/* Thumbnail or placeholder */}
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          {rec.thumbnailUrl ? (
                            <img src={rec.thumbnailUrl} alt={rec.name} className="w-full h-full object-cover" />
                          ) : (
                            <Video className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="p-1.5">
                          <p className="text-[10px] font-medium truncate">
                            {rec.name || `Recording ${rec.id.slice(0, 4)}`}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {rec.duration ? `${Math.round(rec.duration)}s` : 'Unknown'}
                          </p>
                        </div>
                        {isAdded && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No video recordings available. Go to Record tab first.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Selected Video Tracks */}
          {videoTracks.length > 0 && (
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  <span>Selected Videos ({selectedVideoCount})</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Drag to reorder
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ScrollArea className="h-36">
                  <div className="space-y-2 pr-2">
                    {videoTracks.map((track, index) => (
                      <div 
                        key={track.id}
                        className={cn(
                          "flex items-center gap-2 p-2 border rounded-lg transition-all",
                          track.selected ? "bg-primary/5 border-primary/30" : "bg-muted/30 opacity-60"
                        )}
                      >
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
                        
                        <Checkbox
                          checked={track.selected}
                          onCheckedChange={() => toggleVideoSelection(track.id)}
                          className="h-4 w-4"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{track.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {track.duration ? `${Math.round(track.duration)}s` : '—'}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleVideoVisibility(track.id)}
                        >
                          {track.visible ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeVideoTrack(track.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Audio Tracks Tab */}
        <TabsContent value="audio" className="space-y-3 mt-3">
          {/* Add Audio Sources */}
          <Card className="bg-muted/30">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">Add Audio Tracks</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              {/* Recording Audio (from video recordings) */}
              {recordings.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <Volume2 className="h-2.5 w-2.5" />
                    From Recordings
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {recordings.map(rec => (
                      <Button
                        key={rec.id}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => addAudioTrack(rec, 'recording')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {rec.name || `Recording ${rec.id.slice(0, 4)}`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voiceovers */}
              {voiceovers.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <Mic className="h-2.5 w-2.5" />
                    Voiceovers (TTS)
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {voiceovers.map(vo => (
                      <Button
                        key={vo.id}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => addAudioTrack(vo, 'voiceover')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {vo.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Music */}
              {music.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <Music className="h-2.5 w-2.5" />
                    Background Music
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {music.map(track => (
                      <Button
                        key={track.id}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => addAudioTrack(track, 'music')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {track.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {recordings.length === 0 && voiceovers.length === 0 && music.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No audio sources available. Record content or generate voiceovers in Genie Suite.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Audio Tracks List with Sync Controls */}
          {audioTracks.length > 0 && (
            <Card>
              <CardHeader className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs">Audio Mix & Sync</CardTitle>
                  <span className="text-[10px] text-muted-foreground">
                    {audioTracks.length} tracks
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-2">
                    {audioTracks.map(track => {
                      const TypeIcon = getAudioTypeIcon(track.type);
                      const effectiveDuration = (track.duration || 30) - track.trimStart - track.trimEnd;
                      
                      return (
                        <div 
                          key={track.id}
                          className="p-2 border rounded-lg space-y-2 bg-card"
                        >
                          {/* Track Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge className={cn("text-[10px] px-1.5", getAudioTypeColor(track.type))}>
                                <TypeIcon className="h-2.5 w-2.5 mr-0.5" />
                                {track.type}
                              </Badge>
                              <span className="text-xs font-medium truncate">{track.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleAudioMute(track.id)}
                              >
                                {track.muted ? (
                                  <VolumeX className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <Volume2 className="h-3 w-3" />
                                )}
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

                          {/* Visual Timeline Bar */}
                          <div className="relative h-6 bg-muted/50 rounded overflow-hidden">
                            {/* Video reference line */}
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full h-0.5 bg-blue-500/30" />
                            </div>
                            {/* Audio position indicator */}
                            <div 
                              className={cn(
                                "absolute top-0.5 bottom-0.5 rounded transition-all",
                                track.type === 'music' ? 'bg-amber-500/60' : 
                                track.type === 'voiceover' ? 'bg-purple-500/60' : 'bg-blue-500/60'
                              )}
                              style={{
                                left: `${Math.min((track.startOffset / totalDuration) * 100, 100)}%`,
                                width: `${Math.min((effectiveDuration / totalDuration) * 100, 100 - (track.startOffset / totalDuration) * 100)}%`,
                              }}
                            >
                              {/* Fade indicators */}
                              {track.fadeIn > 0 && (
                                <div 
                                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-background/80 to-transparent"
                                  style={{ width: `${(track.fadeIn / effectiveDuration) * 100}%` }}
                                />
                              )}
                              {track.fadeOut > 0 && (
                                <div 
                                  className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-background/80 to-transparent"
                                  style={{ width: `${(track.fadeOut / effectiveDuration) * 100}%` }}
                                />
                              )}
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-medium">
                                {effectiveDuration.toFixed(1)}s
                              </span>
                            </div>
                          </div>
                          
                          {/* Volume Slider */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-12">Volume</span>
                            <Slider
                              value={[track.volume]}
                              min={0}
                              max={100}
                              step={5}
                              onValueChange={([value]) => updateAudioTrackVolume(track.id, value)}
                              className="flex-1"
                              disabled={track.muted}
                            />
                            <span className="text-[10px] text-muted-foreground w-8 text-right">
                              {track.volume}%
                            </span>
                          </div>

                          {/* Start Offset (Sync Point) */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-12">Start at</span>
                            <Slider
                              value={[track.startOffset]}
                              min={0}
                              max={Math.max(totalDuration - 1, 1)}
                              step={0.5}
                              onValueChange={([value]) => updateAudioTrackTiming(track.id, { startOffset: value })}
                              className="flex-1"
                            />
                            <span className="text-[10px] text-muted-foreground w-8 text-right">
                              {track.startOffset.toFixed(1)}s
                            </span>
                          </div>

                          {/* Fade Controls (for music primarily) */}
                          {track.type === 'music' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-muted-foreground w-10">Fade In</span>
                                <Slider
                                  value={[track.fadeIn]}
                                  min={0}
                                  max={10}
                                  step={0.5}
                                  onValueChange={([value]) => updateAudioTrackTiming(track.id, { fadeIn: value })}
                                  className="flex-1"
                                />
                                <span className="text-[9px] text-muted-foreground w-6">
                                  {track.fadeIn}s
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-muted-foreground w-10">Fade Out</span>
                                <Slider
                                  value={[track.fadeOut]}
                                  min={0}
                                  max={10}
                                  step={0.5}
                                  onValueChange={([value]) => updateAudioTrackTiming(track.id, { fadeOut: value })}
                                  className="flex-1"
                                />
                                <span className="text-[9px] text-muted-foreground w-6">
                                  {track.fadeOut}s
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Trim Controls */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-muted-foreground w-12">Trim Start</span>
                              <Slider
                                value={[track.trimStart]}
                                min={0}
                                max={Math.max((track.duration || 30) - track.trimEnd - 1, 0)}
                                step={0.5}
                                onValueChange={([value]) => updateAudioTrackTiming(track.id, { trimStart: value })}
                                className="flex-1"
                              />
                              <span className="text-[9px] text-muted-foreground w-6">
                                {track.trimStart.toFixed(1)}s
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-muted-foreground w-12">Trim End</span>
                              <Slider
                                value={[track.trimEnd]}
                                min={0}
                                max={Math.max((track.duration || 30) - track.trimStart - 1, 0)}
                                step={0.5}
                                onValueChange={([value]) => updateAudioTrackTiming(track.id, { trimEnd: value })}
                                className="flex-1"
                              />
                              <span className="text-[9px] text-muted-foreground w-6">
                                {track.trimEnd.toFixed(1)}s
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Master Volume */}
      {(videoTracks.length > 0 || audioTracks.length > 0) && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium flex items-center gap-2">
              <Volume2 className="h-3 w-3" />
              Master Volume
            </label>
            <span className="text-xs text-muted-foreground">{masterVolume}%</span>
          </div>
          <Slider
            value={[masterVolume]}
            min={0}
            max={100}
            step={5}
            onValueChange={([value]) => setMasterVolume(value)}
          />
        </div>
      )}

      {/* Summary */}
      {(selectedVideoCount > 0 || audioTracks.length > 0) && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Mix Summary</span>
            <span className="text-[10px] text-muted-foreground">
              ~{Math.round(totalDuration)}s total
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedVideoCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                <Video className="h-2.5 w-2.5 mr-1" />
                {selectedVideoCount} video{selectedVideoCount > 1 ? 's' : ''}
              </Badge>
            )}
            {audioTracks.filter(t => t.type === 'recording').length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                <Volume2 className="h-2.5 w-2.5 mr-1" />
                {audioTracks.filter(t => t.type === 'recording').length} audio
              </Badge>
            )}
            {audioTracks.filter(t => t.type === 'voiceover').length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                <Mic className="h-2.5 w-2.5 mr-1" />
                {audioTracks.filter(t => t.type === 'voiceover').length} voiceover
              </Badge>
            )}
            {audioTracks.filter(t => t.type === 'music').length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                <Music className="h-2.5 w-2.5 mr-1" />
                {audioTracks.filter(t => t.type === 'music').length} music
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={selectedVideoCount === 0 && audioTracks.length === 0}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Preview
            </>
          )}
        </Button>
        
        <Button
          className="flex-1 gap-2"
          onClick={handleMix}
          disabled={(selectedVideoCount === 0 && audioTracks.length === 0) || isMixing}
        >
          {isMixing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mixing...
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              Create Mix
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AudioMixer;
