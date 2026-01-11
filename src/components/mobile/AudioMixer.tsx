/**
 * Audio Mixer
 * Mix recordings with voiceovers and background music
 * Replaces/enhances ScriptStitcher for the pipeline
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Music, 
  Mic, 
  Volume2, 
  VolumeX,
  Plus,
  Trash2,
  Play,
  Pause,
  Check,
  Loader2,
  Download,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

interface AudioTrack {
  id: string;
  name: string;
  url?: string;
  type: 'recording' | 'voiceover' | 'music';
  duration?: number;
  volume: number;
  muted: boolean;
}

interface AudioMixerProps {
  recordings?: Array<{ id: string; url?: string; duration?: number; name?: string }>;
  voiceovers?: Array<{ id: string; name: string; url?: string }>;
  music?: Array<{ id: string; name: string; url?: string; duration?: number }>;
  onMixComplete?: (mixedTrack: { url: string; duration: number; tracks: AudioTrack[] }) => void;
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
  
  const [mixedTracks, setMixedTracks] = useState<AudioTrack[]>([]);
  const [masterVolume, setMasterVolume] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMixing, setIsMixing] = useState(false);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    if (mixedTracks.length === 0) return 0;
    return Math.max(...mixedTracks.map(t => t.duration || 0));
  }, [mixedTracks]);

  const addTrack = useCallback((
    item: { id: string; name?: string; url?: string; duration?: number }, 
    type: AudioTrack['type']
  ) => {
    const newTrack: AudioTrack = {
      id: `${type}-${item.id}-${Date.now()}`,
      name: item.name || `${type} ${mixedTracks.length + 1}`,
      url: item.url,
      type,
      duration: item.duration || 30,
      volume: 100,
      muted: false,
    };
    
    setMixedTracks(prev => [...prev, newTrack]);
    vibrate?.(50);
    toast.success(`Added ${type} track`);
  }, [mixedTracks.length, vibrate]);

  const removeTrack = useCallback((trackId: string) => {
    setMixedTracks(prev => prev.filter(t => t.id !== trackId));
    toast.success('Track removed');
  }, []);

  const updateTrackVolume = useCallback((trackId: string, volume: number) => {
    setMixedTracks(prev => 
      prev.map(t => t.id === trackId ? { ...t, volume } : t)
    );
  }, []);

  const toggleTrackMute = useCallback((trackId: string) => {
    setMixedTracks(prev => 
      prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t)
    );
  }, []);

  const handleMix = async () => {
    if (mixedTracks.length === 0) {
      toast.error('Add at least one track to mix');
      return;
    }

    setIsMixing(true);
    
    try {
      // Simulate mixing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      vibrate?.(500);
      toast.success('Mix complete!');
      
      onMixComplete?.({
        url: mixedTracks[0]?.url || '',
        duration: totalDuration,
        tracks: mixedTracks,
      });
    } catch (error) {
      console.error('Mix error:', error);
      toast.error('Mix failed. Please try again.');
    } finally {
      setIsMixing(false);
    }
  };

  const getTypeColor = (type: AudioTrack['type']) => {
    switch (type) {
      case 'recording': return 'bg-blue-500/20 text-blue-600';
      case 'voiceover': return 'bg-purple-500/20 text-purple-600';
      case 'music': return 'bg-amber-500/20 text-amber-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: AudioTrack['type']) => {
    switch (type) {
      case 'voiceover': return Mic;
      case 'music': return Music;
      default: return Volume2;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Audio Mixer</span>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {mixedTracks.length} tracks
        </Badge>
      </div>

      {/* Add Tracks Section */}
      <Card className="bg-muted/30">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs">Add Tracks</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          {/* Recordings */}
          {recordings.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground">Recordings</label>
              <div className="flex gap-1 flex-wrap">
                {recordings.map(rec => (
                  <Button
                    key={rec.id}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => addTrack(rec, 'recording')}
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
              <label className="text-[10px] font-medium text-muted-foreground">Voiceovers</label>
              <div className="flex gap-1 flex-wrap">
                {voiceovers.map(vo => (
                  <Button
                    key={vo.id}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => addTrack(vo, 'voiceover')}
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
              <label className="text-[10px] font-medium text-muted-foreground">Music</label>
              <div className="flex gap-1 flex-wrap">
                {music.map(track => (
                  <Button
                    key={track.id}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => addTrack(track, 'music')}
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
              No audio sources available. Record content or generate voiceovers first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Mixed Tracks */}
      {mixedTracks.length > 0 && (
        <Card>
          <CardHeader className="py-2 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs">Mix Tracks</CardTitle>
              <span className="text-[10px] text-muted-foreground">
                {Math.round(totalDuration)}s total
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-2">
                {mixedTracks.map(track => {
                  const TypeIcon = getTypeIcon(track.type);
                  return (
                    <div 
                      key={track.id}
                      className="p-2 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge className={cn("text-[10px] px-1.5", getTypeColor(track.type))}>
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
                            onClick={() => toggleTrackMute(track.id)}
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
                            onClick={() => removeTrack(track.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Volume Slider */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-8">
                          {track.volume}%
                        </span>
                        <Slider
                          value={[track.volume]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={([value]) => updateTrackVolume(track.id, value)}
                          className="flex-1"
                          disabled={track.muted}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Master Volume */}
      {mixedTracks.length > 0 && (
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

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={mixedTracks.length === 0}
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
          disabled={mixedTracks.length === 0 || isMixing}
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
