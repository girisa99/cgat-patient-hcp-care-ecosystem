/**
 * Floating Audio Mixer Panel - Draggable audio controls for TTS/Voiceover/Music
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Play, Square, Volume2, VolumeX, Music, Mic, Repeat, AudioLines } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';
import { cn } from '@/lib/utils';

interface AudioTrack {
  id: string;
  name: string;
  type: 'tts' | 'voiceover' | 'music';
  isPlaying: boolean;
  volume: number;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  loop?: boolean;
  onToggleLoop?: () => void;
}

interface FloatingAudioMixerProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: AudioTrack[];
  duckingEnabled?: boolean;
  onToggleDucking?: () => void;
  defaultPosition?: { x: number; y: number };
}

const TRACK_ICONS = {
  tts: Volume2,
  voiceover: Mic,
  music: Music,
};

const TRACK_COLORS = {
  tts: 'text-green-500',
  voiceover: 'text-blue-500',
  music: 'text-purple-500',
};

export function FloatingAudioMixer({
  isOpen,
  onClose,
  tracks,
  duckingEnabled = true,
  onToggleDucking,
  defaultPosition = { x: 20, y: 100 },
}: FloatingAudioMixerProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const activeTracks = tracks.filter(t => t.name);

  return (
    <DraggablePanel
      title="Audio Mixer"
      icon={<AudioLines className="w-4 h-4 text-primary" />}
      isOpen={isOpen}
      onClose={onClose}
      defaultPosition={defaultPosition}
      defaultSize={{ width: 300, height: 350 }}
      minWidth={260}
      minHeight={150}
      isMinimized={isMinimized}
      onMinimizeToggle={() => setIsMinimized(!isMinimized)}
    >
      <div className="p-3 space-y-3">
        {activeTracks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No audio tracks selected.
            <br />
            <span className="text-xs">Select TTS, Voiceover, or Music from the sidebar.</span>
          </div>
        ) : (
          <>
            {/* Audio Tracks */}
            {activeTracks.map((track) => {
              const Icon = TRACK_ICONS[track.type];
              const colorClass = TRACK_COLORS[track.type];
              
              return (
                <div 
                  key={track.id} 
                  className={cn(
                    "p-2.5 rounded-lg border bg-muted/30",
                    track.isPlaying && "border-primary/50 bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className={cn("w-4 h-4 shrink-0", colorClass)} />
                      <span className="text-sm font-medium truncate">{track.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {track.type === 'music' && track.onToggleLoop && (
                        <Button
                          size="icon"
                          variant={track.loop ? 'default' : 'ghost'}
                          className="h-7 w-7"
                          onClick={track.onToggleLoop}
                          title="Loop"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant={track.isPlaying ? 'destructive' : 'default'}
                        className="h-7 w-7"
                        onClick={track.isPlaying ? track.onStop : track.onPlay}
                      >
                        {track.isPlaying ? (
                          <Square className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Volume slider */}
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                    <Slider
                      value={[track.volume * 100]}
                      onValueChange={([v]) => track.onVolumeChange(v / 100)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Ducking control */}
            {onToggleDucking && activeTracks.some(t => t.type === 'music') && activeTracks.some(t => t.type !== 'music') && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <AudioLines className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Auto-Duck Music</span>
                    <p className="text-[10px] text-muted-foreground">Lower music during voice</p>
                  </div>
                </div>
                <Switch
                  checked={duckingEnabled}
                  onCheckedChange={onToggleDucking}
                />
              </div>
            )}
          </>
        )}

        {/* Status indicator */}
        {activeTracks.some(t => t.isPlaying) && (
          <Badge variant="outline" className="w-full justify-center gap-2 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {activeTracks.filter(t => t.isPlaying).length} track(s) playing
          </Badge>
        )}
      </div>
    </DraggablePanel>
  );
}
