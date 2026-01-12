/**
 * Timeline Clip Editor
 * Full clip manipulation: stitch, swap, trim, replace, duplicate, split
 * P2 Feature: Enhanced clip editing capabilities
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scissors,
  Trash2,
  Copy,
  ArrowLeftRight,
  ArrowUpDown,
  RefreshCw,
  GripVertical,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Volume2,
  Film,
  Music,
  Merge,
  Move,
  RotateCcw,
  Download,
  Upload,
  Wand2,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { TimelineClip } from './MultiClipTimeline';

interface TimelineClipEditorProps {
  clips: TimelineClip[];
  selectedClipId: string | null;
  currentTime: number;
  onClipsChange: (clips: TimelineClip[]) => void;
  onSelectClip: (clipId: string | null) => void;
  onSeek: (time: number) => void;
  className?: string;
}

export const TimelineClipEditor: React.FC<TimelineClipEditorProps> = ({
  clips,
  selectedClipId,
  currentTime,
  onClipsChange,
  onSelectClip,
  onSeek,
  className,
}) => {
  const { vibrate } = useMobileFeatures();
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [multiSelectIds, setMultiSelectIds] = useState<string[]>([]);
  const [trimMode, setTrimMode] = useState<'in' | 'out' | null>(null);
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const selectedClip = clips.find(c => c.id === selectedClipId);
  const selectedClips = clips.filter(c => multiSelectIds.includes(c.id));

  // Toggle multi-select
  const toggleMultiSelect = (clipId: string) => {
    setMultiSelectIds(prev => 
      prev.includes(clipId) 
        ? prev.filter(id => id !== clipId)
        : [...prev, clipId]
    );
    vibrate?.(30);
  };

  // Stitch clips together (combine in sequence)
  const stitchClips = useCallback((clipIds: string[]) => {
    if (clipIds.length < 2) {
      toast.error('Select at least 2 clips to stitch');
      return;
    }
    
    const clipsToStitch = clips.filter(c => clipIds.includes(c.id));
    if (clipsToStitch.some(c => c.type !== clipsToStitch[0].type)) {
      toast.error('Can only stitch clips of the same type');
      return;
    }
    
    const sortedClips = clipsToStitch.sort((a, b) => a.startTime - b.startTime);
    let currentStart = sortedClips[0].startTime;
    
    // Reposition clips to be sequential (no gaps)
    const stitchedClips = sortedClips.map(clip => {
      const newClip = { ...clip, startTime: currentStart };
      currentStart += clip.duration;
      return newClip;
    });
    
    // Update clips array
    const otherClips = clips.filter(c => !clipIds.includes(c.id));
    onClipsChange([...otherClips, ...stitchedClips]);
    setMultiSelectIds([]);
    toast.success(`Stitched ${clipIds.length} clips sequentially`);
    vibrate?.(50);
  }, [clips, onClipsChange, vibrate]);

  // Swap two clips positions
  const swapClips = useCallback((clipId1: string, clipId2: string) => {
    const clip1 = clips.find(c => c.id === clipId1);
    const clip2 = clips.find(c => c.id === clipId2);
    
    if (!clip1 || !clip2) {
      toast.error('Cannot find clips to swap');
      return;
    }
    
    const newClips = clips.map(c => {
      if (c.id === clipId1) {
        return { ...c, startTime: clip2.startTime, track: clip2.track };
      }
      if (c.id === clipId2) {
        return { ...c, startTime: clip1.startTime, track: clip1.track };
      }
      return c;
    });
    
    onClipsChange(newClips);
    setSwapSourceId(null);
    toast.success('Clips swapped');
    vibrate?.(50);
  }, [clips, onClipsChange, vibrate]);

  // Move clip to new position
  const moveClip = useCallback((clipId: string, newStartTime: number, newTrack?: number) => {
    const newClips = clips.map(c => {
      if (c.id === clipId) {
        return {
          ...c,
          startTime: Math.max(0, newStartTime),
          track: newTrack ?? c.track,
        };
      }
      return c;
    });
    onClipsChange(newClips);
  }, [clips, onClipsChange]);

  // Trim clip (adjust in/out points)
  const trimClip = useCallback((clipId: string, inPoint?: number, outPoint?: number) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    const newClips = clips.map(c => {
      if (c.id === clipId) {
        const newInPoint = inPoint !== undefined ? Math.max(0, inPoint) : c.inPoint;
        const newOutPoint = outPoint !== undefined ? Math.min(c.duration + c.inPoint, outPoint) : c.outPoint;
        const newDuration = newOutPoint - newInPoint;
        
        return {
          ...c,
          inPoint: newInPoint,
          outPoint: newOutPoint,
          duration: newDuration,
        };
      }
      return c;
    });
    
    onClipsChange(newClips);
  }, [clips, onClipsChange]);

  // Replace clip with new media
  const replaceClip = useCallback((clipId: string, newSourceUrl: string, newName?: string) => {
    const newClips = clips.map(c => {
      if (c.id === clipId) {
        return {
          ...c,
          sourceUrl: newSourceUrl,
          name: newName || c.name,
        };
      }
      return c;
    });
    
    onClipsChange(newClips);
    toast.success('Clip replaced');
  }, [clips, onClipsChange]);

  // Delete clip(s)
  const deleteClips = useCallback((clipIds: string[]) => {
    const newClips = clips.filter(c => !clipIds.includes(c.id));
    onClipsChange(newClips);
    onSelectClip(null);
    setMultiSelectIds([]);
    toast.success(`Deleted ${clipIds.length} clip(s)`);
    vibrate?.(30);
  }, [clips, onClipsChange, onSelectClip, vibrate]);

  // Duplicate clip
  const duplicateClip = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    const newClip: TimelineClip = {
      ...clip,
      id: crypto.randomUUID(),
      startTime: clip.startTime + clip.duration + 0.5,
      name: `${clip.name} (copy)`,
    };
    
    onClipsChange([...clips, newClip]);
    onSelectClip(newClip.id);
    toast.success('Clip duplicated');
    vibrate?.(30);
  }, [clips, onClipsChange, onSelectClip, vibrate]);

  // Split clip at playhead
  const splitAtPlayhead = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    const splitPoint = currentTime - clip.startTime;
    if (splitPoint <= 0 || splitPoint >= clip.duration) {
      toast.error('Move playhead to split point within clip');
      return;
    }
    
    const clip1: TimelineClip = {
      ...clip,
      duration: splitPoint,
      outPoint: clip.inPoint + splitPoint,
    };
    
    const clip2: TimelineClip = {
      ...clip,
      id: crypto.randomUUID(),
      startTime: clip.startTime + splitPoint,
      duration: clip.duration - splitPoint,
      inPoint: clip.inPoint + splitPoint,
      name: `${clip.name} (split)`,
    };
    
    const newClips = clips.filter(c => c.id !== clipId);
    newClips.push(clip1, clip2);
    onClipsChange(newClips);
    toast.success('Clip split at playhead');
    vibrate?.(30);
  }, [clips, currentTime, onClipsChange, vibrate]);

  // Start voice recording to add at current position
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Add as new audio clip at current playhead position
        const newClip: TimelineClip = {
          id: crypto.randomUUID(),
          type: 'audio',
          name: `Voice ${new Date().toLocaleTimeString()}`,
          sourceUrl: audioUrl,
          startTime: currentTime,
          duration: audioBlob.size / 16000, // Estimate duration
          inPoint: 0,
          outPoint: audioBlob.size / 16000,
          track: 1, // Voiceover track
          volume: 1,
          audioType: 'voiceover',
        };
        
        onClipsChange([...clips, newClip]);
        toast.success('Voice recording added to timeline');
        
        // Cleanup stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecordingVoice(true);
      toast.info('Recording voice... Click stop when done');
      vibrate?.(50);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      vibrate?.(30);
    }
  };

  // Nudge clip left/right by 0.5 seconds
  const nudgeClip = (clipId: string, direction: 'left' | 'right') => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    const offset = direction === 'left' ? -0.5 : 0.5;
    moveClip(clipId, Math.max(0, clip.startTime + offset));
    vibrate?.(20);
  };

  // Move clip to different track
  const moveToTrack = (clipId: string, trackIndex: number) => {
    const newClips = clips.map(c => 
      c.id === clipId ? { ...c, track: trackIndex } : c
    );
    onClipsChange(newClips);
    toast.success(`Moved to track ${trackIndex + 1}`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2 px-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Clip Editor
          </span>
          <div className="flex items-center gap-1">
            {multiSelectIds.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {multiSelectIds.length} selected
              </Badge>
            )}
            {selectedClip && (
              <Badge variant="outline" className="text-[10px]">
                {selectedClip.type}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-2 pb-3">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="edit" className="text-[10px] h-7">Edit</TabsTrigger>
            <TabsTrigger value="arrange" className="text-[10px] h-7">Arrange</TabsTrigger>
            <TabsTrigger value="trim" className="text-[10px] h-7">Trim</TabsTrigger>
            <TabsTrigger value="voice" className="text-[10px] h-7">Voice</TabsTrigger>
          </TabsList>

          {/* Edit Tab - Basic clip operations */}
          <TabsContent value="edit" className="space-y-2 mt-2">
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col gap-1 text-[9px]"
                onClick={() => selectedClipId && duplicateClip(selectedClipId)}
                disabled={!selectedClipId}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col gap-1 text-[9px]"
                onClick={() => selectedClipId && splitAtPlayhead(selectedClipId)}
                disabled={!selectedClipId}
              >
                <Scissors className="h-4 w-4" />
                Split
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 flex-col gap-1 text-[9px] text-destructive hover:text-destructive"
                onClick={() => {
                  const ids = multiSelectIds.length > 0 ? multiSelectIds : (selectedClipId ? [selectedClipId] : []);
                  if (ids.length > 0) deleteClips(ids);
                }}
                disabled={!selectedClipId && multiSelectIds.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>

            {/* Replace clip */}
            {selectedClip && (
              <div className="p-2 bg-muted/30 rounded space-y-2">
                <Label className="text-[10px] text-muted-foreground">Replace Source</Label>
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 h-7 text-[9px]"
                    onClick={() => {
                      // Trigger file picker for replacement
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = selectedClip.type === 'video' ? 'video/*' : 
                                     selectedClip.type === 'audio' ? 'audio/*' : 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          replaceClip(selectedClip.id, url, file.name);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Replace Media
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Arrange Tab - Stitch, swap, reorder */}
          <TabsContent value="arrange" className="space-y-2 mt-2">
            {/* Multi-select info */}
            <div className="text-[10px] text-muted-foreground p-2 bg-muted/30 rounded">
              Tap clips to select multiple, then use actions below
            </div>

            {/* Clip list for multi-select */}
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {clips.map((clip, index) => (
                  <div
                    key={clip.id}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all",
                      multiSelectIds.includes(clip.id) 
                        ? "bg-primary/20 border border-primary" 
                        : selectedClipId === clip.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => toggleMultiSelect(clip.id)}
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-muted-foreground w-4">#{index + 1}</span>
                    {clip.type === 'video' ? <Film className="h-3 w-3" /> : <Music className="h-3 w-3" />}
                    <span className="text-[10px] truncate flex-1">{clip.name}</span>
                    <span className="text-[9px] text-muted-foreground">{formatTime(clip.duration)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="grid grid-cols-3 gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-10 flex-col gap-0.5 text-[9px]"
                onClick={() => stitchClips(multiSelectIds)}
                disabled={multiSelectIds.length < 2}
              >
                <Merge className="h-3.5 w-3.5" />
                Stitch
              </Button>
              <Button
                variant={swapSourceId ? "secondary" : "outline"}
                size="sm"
                className="h-10 flex-col gap-0.5 text-[9px]"
                onClick={() => {
                  if (swapSourceId && selectedClipId && swapSourceId !== selectedClipId) {
                    swapClips(swapSourceId, selectedClipId);
                  } else if (selectedClipId) {
                    setSwapSourceId(selectedClipId);
                    toast.info('Select second clip to swap with');
                  }
                }}
                disabled={!selectedClipId}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                {swapSourceId ? 'Swap Now' : 'Swap'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 flex-col gap-0.5 text-[9px]"
                onClick={() => {
                  setMultiSelectIds([]);
                  setSwapSourceId(null);
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>

            {/* Nudge controls */}
            {selectedClip && (
              <div className="flex items-center justify-center gap-2 p-2 bg-muted/30 rounded">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => nudgeClip(selectedClip.id, 'left')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-[10px] text-muted-foreground">Nudge ±0.5s</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => nudgeClip(selectedClip.id, 'right')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Track selection */}
            {selectedClip && (
              <div className="p-2 bg-muted/30 rounded space-y-1">
                <Label className="text-[10px] text-muted-foreground">Move to Track</Label>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(trackIndex => (
                    <Button
                      key={trackIndex}
                      variant={selectedClip.track === trackIndex ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 h-6 text-[9px]"
                      onClick={() => moveToTrack(selectedClip.id, trackIndex)}
                    >
                      {trackIndex + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Trim Tab */}
          <TabsContent value="trim" className="space-y-2 mt-2">
            {selectedClip ? (
              <>
                <div className="p-2 bg-muted/30 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium">{selectedClip.name}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {formatTime(selectedClip.duration)}
                    </Badge>
                  </div>
                  
                  {/* In Point */}
                  <div className="space-y-1">
                    <Label className="text-[9px] text-muted-foreground">In Point</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedClip.inPoint]}
                        min={0}
                        max={selectedClip.outPoint - 0.1}
                        step={0.1}
                        className="flex-1"
                        onValueChange={([value]) => trimClip(selectedClip.id, value, undefined)}
                      />
                      <span className="text-[9px] text-muted-foreground w-10">
                        {formatTime(selectedClip.inPoint)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Out Point */}
                  <div className="space-y-1">
                    <Label className="text-[9px] text-muted-foreground">Out Point</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedClip.outPoint]}
                        min={selectedClip.inPoint + 0.1}
                        max={selectedClip.duration + selectedClip.inPoint}
                        step={0.1}
                        className="flex-1"
                        onValueChange={([value]) => trimClip(selectedClip.id, undefined, value)}
                      />
                      <span className="text-[9px] text-muted-foreground w-10">
                        {formatTime(selectedClip.outPoint)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Volume adjustment for audio/video */}
                {(selectedClip.type === 'audio' || selectedClip.type === 'video') && (
                  <div className="p-2 bg-muted/30 rounded space-y-1">
                    <Label className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      Volume
                    </Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[(selectedClip.volume || 1) * 100]}
                        min={0}
                        max={150}
                        step={5}
                        className="flex-1"
                        onValueChange={([value]) => {
                          const newClips = clips.map(c =>
                            c.id === selectedClip.id ? { ...c, volume: value / 100 } : c
                          );
                          onClipsChange(newClips);
                        }}
                      />
                      <span className="text-[9px] text-muted-foreground w-8">
                        {Math.round((selectedClip.volume || 1) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Select a clip to trim
              </div>
            )}
          </TabsContent>

          {/* Voice Tab - Record voice directly to timeline */}
          <TabsContent value="voice" className="space-y-2 mt-2">
            <div className="text-center p-4 space-y-3">
              <div className="text-[10px] text-muted-foreground">
                Record voice directly at playhead position ({formatTime(currentTime)})
              </div>
              
              <Button
                variant={isRecordingVoice ? "destructive" : "default"}
                size="lg"
                className="w-20 h-20 rounded-full"
                onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
              >
                {isRecordingVoice ? (
                  <Square className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
              
              <p className="text-[10px] text-muted-foreground">
                {isRecordingVoice 
                  ? 'Recording... Tap to stop' 
                  : 'Tap to record voiceover at current position'}
              </p>
            </div>

            <div className="p-2 bg-muted/30 rounded text-[10px] text-muted-foreground">
              <strong>Tip:</strong> Move playhead to desired position first, then record. 
              Voice will sync with your clips automatically.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimelineClipEditor;
