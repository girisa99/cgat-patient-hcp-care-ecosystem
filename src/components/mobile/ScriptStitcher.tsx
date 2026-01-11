/**
 * Script Stitcher Component
 * P1 Feature: Combine multiple scripts with music/audio for final production
 * Flow: Select scripts → Order → Add music → Generate voiceover → Export
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText,
  Music,
  Mic,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

export interface ScriptSegment {
  id: string;
  scriptId: string;
  title: string;
  content: string;
  duration?: number; // Estimated duration in seconds
  hasVoiceover?: boolean;
  voiceoverUrl?: string;
}

export interface MusicTrack {
  id: string;
  name: string;
  url?: string;
  duration?: number;
  volume: number; // 0-1
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
}

interface ScriptStitcherProps {
  availableScripts?: Array<{ id: string; title: string; content: string }>;
  availableMusic?: Array<{ id: string; name: string; url?: string; duration?: number }>;
  onExport?: (result: StitchedResult) => void;
  className?: string;
}

export interface StitchedResult {
  segments: ScriptSegment[];
  music: MusicTrack | null;
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
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null);
  const [musicVolume, setMusicVolume] = useState([0.3]); // Background music at 30%
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  // Calculate total duration estimate
  const totalDuration = useMemo(() => {
    return segments.reduce((total, seg) => {
      // Estimate ~150 words per minute for voiceover
      const wordCount = seg.content.split(/\s+/).length;
      const estimatedDuration = seg.duration || (wordCount / 150) * 60;
      return total + estimatedDuration;
    }, 0);
  }, [segments]);

  // Combined script text
  const combinedScript = useMemo(() => {
    return segments.map(s => s.content).join('\n\n---\n\n');
  }, [segments]);

  // Add script segment
  const addSegment = useCallback((script: { id: string; title: string; content: string }) => {
    const newSegment: ScriptSegment = {
      id: crypto.randomUUID(),
      scriptId: script.id,
      title: script.title,
      content: script.content,
      duration: (script.content.split(/\s+/).length / 150) * 60,
    };
    setSegments(prev => [...prev, newSegment]);
    vibrate?.(50);
    toast.success(`Added "${script.title}"`);
  }, [vibrate]);

  // Remove segment
  const removeSegment = useCallback((segmentId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
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

  // Select music
  const selectMusic = useCallback((musicId: string) => {
    const track = availableMusic.find(m => m.id === musicId);
    if (track) {
      setSelectedMusic({
        ...track,
        volume: musicVolume[0],
        fadeIn: 2,
        fadeOut: 2,
      });
    }
  }, [availableMusic, musicVolume]);

  // Export stitched result
  const handleExport = useCallback(() => {
    if (segments.length === 0) {
      toast.error('Add at least one script segment');
      return;
    }

    const result: StitchedResult = {
      segments,
      music: selectedMusic,
      totalDuration,
      combinedScript,
    };

    onExport?.(result);
    vibrate?.(200);
    toast.success('Script stitched! Ready for production.');
  }, [segments, selectedMusic, totalDuration, combinedScript, onExport, vibrate]);

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
            Script Stitcher
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(totalDuration)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Combine scripts with music for your final video
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Script Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-medium flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Add Script Segment
          </label>
          <Select onValueChange={(scriptId) => {
            const script = availableScripts.find(s => s.id === scriptId);
            if (script) addSegment(script);
          }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select a script to add..." />
            </SelectTrigger>
            <SelectContent>
              {availableScripts.length === 0 ? (
                <SelectItem value="__empty__" disabled>
                  No scripts available
                </SelectItem>
              ) : (
                availableScripts.filter(script => script.id).map(script => (
                  <SelectItem key={script.id} value={script.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      {script.title}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Segments List */}
        <div className="space-y-2">
          <label className="text-xs font-medium">
            Segments ({segments.length})
          </label>
          
          {segments.length === 0 ? (
            <div className="p-4 border-2 border-dashed rounded-lg text-center">
              <Layers className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Add scripts to create your storyboard
              </p>
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-2">
                {segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div 
                      className="flex items-center gap-2 p-2 bg-muted/30"
                      onClick={() => setExpandedSegment(
                        expandedSegment === segment.id ? null : segment.id
                      )}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {index + 1}
                      </Badge>
                      
                      <span className="text-sm font-medium flex-1 truncate">
                        {segment.title}
                      </span>
                      
                      <span className="text-[10px] text-muted-foreground">
                        ~{formatTime(segment.duration || 0)}
                      </span>
                      
                      {segment.hasVoiceover && (
                        <Mic className="h-3 w-3 text-green-500" />
                      )}
                      
                      {expandedSegment === segment.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    
                    {expandedSegment === segment.id && (
                      <div className="p-2 border-t space-y-2">
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {segment.content}
                        </p>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveSegment(segment.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveSegment(segment.id, 'down')}
                            disabled={index === segments.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <div className="flex-1" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeSegment(segment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Music Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium flex items-center gap-1">
            <Music className="h-3 w-3" />
            Background Music
          </label>
          
          <Select 
            value={selectedMusic?.id || "none"} 
            onValueChange={(value) => {
              if (value === "none") {
                setSelectedMusic(null);
              } else {
                selectMusic(value);
              }
            }}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select background music..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No music</SelectItem>
              {availableMusic.filter(track => track.id).map(track => (
                <SelectItem key={track.id} value={track.id}>
                  <div className="flex items-center gap-2">
                    <Music className="h-3 w-3" />
                    {track.name}
                    {track.duration && (
                      <span className="text-xs text-muted-foreground">
                        ({formatTime(track.duration)})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedMusic && (
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3" />
              <Slider
                value={musicVolume}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(v) => {
                  setMusicVolume(v);
                  if (selectedMusic) {
                    setSelectedMusic(prev => prev ? { ...prev, volume: v[0] } : null);
                  }
                }}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground min-w-[40px]">
                {Math.round(musicVolume[0] * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Preview Combined */}
        {segments.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Combined Script Preview
            </label>
            <ScrollArea className="h-24 border rounded-lg p-2">
              <p className="text-xs whitespace-pre-wrap">
                {combinedScript}
              </p>
            </ScrollArea>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={segments.length === 0}
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
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
