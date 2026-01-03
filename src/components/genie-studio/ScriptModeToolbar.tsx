/**
 * Mode-specific toolbar for Script Editor
 * Shows different tools based on script mode (podcast, webcast, video, audio)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  User,
  Users,
  Clock,
  MessageSquare,
  Presentation,
  Monitor,
  HelpCircle,
  Eye,
  Film,
  Timer,
  Image,
  ArrowRight,
  Music,
  Pause,
  Type,
  Wind,
  Bell,
  Mic,
  Podcast,
  Tv,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScriptMode } from '@/types/projects';

interface ScriptModeToolbarProps {
  mode: ScriptMode;
  onInsert: (marker: string) => void;
  disabled?: boolean;
}

interface ToolButton {
  icon: React.ElementType;
  label: string;
  marker: string;
  description: string;
}

const MODE_TOOLS: Record<ScriptMode, ToolButton[]> = {
  podcast: [
    { icon: User, label: 'Host', marker: '[HOST]: ', description: 'Insert host speaker tag' },
    { icon: Users, label: 'Guest', marker: '[GUEST]: ', description: 'Insert guest speaker tag' },
    { icon: Clock, label: 'Timestamp', marker: '[00:00] ', description: 'Insert timestamp marker' },
    { icon: MessageSquare, label: 'Question', marker: '[Q] ', description: 'Insert interview question' },
    { icon: Bell, label: 'Cue', marker: '[CUE: ] ', description: 'Insert cue note for production' },
    { icon: Pause, label: 'Break', marker: '\n---\n', description: 'Insert segment break' },
  ],
  webcast: [
    { icon: Presentation, label: 'Slide', marker: '[SLIDE: #] ', description: 'Mark slide number' },
    { icon: Monitor, label: 'Demo', marker: '[DEMO: ] ', description: 'Insert demo note' },
    { icon: HelpCircle, label: 'Q&A', marker: '[Q&A] ', description: 'Mark Q&A section' },
    { icon: Eye, label: 'Visual', marker: '[VISUAL: ] ', description: 'Insert visual cue' },
    { icon: ArrowRight, label: 'Transition', marker: '[TRANSITION] ', description: 'Mark slide transition' },
    { icon: Bell, label: 'Note', marker: '[NOTE: ] ', description: 'Insert presenter note' },
  ],
  video: [
    { icon: Film, label: 'Scene', marker: '[SCENE: ] ', description: 'Describe scene/location' },
    { icon: Timer, label: 'Timing', marker: '[00:00-00:00] ', description: 'Insert timing mark' },
    { icon: Image, label: 'B-Roll', marker: '[B-ROLL: ] ', description: 'Note B-roll footage' },
    { icon: ArrowRight, label: 'Transition', marker: '[TRANSITION: ] ', description: 'Insert transition type' },
    { icon: Music, label: 'Music', marker: '[MUSIC: ] ', description: 'Note background music' },
    { icon: Eye, label: 'On-Screen', marker: '[ON-SCREEN: ] ', description: 'Text/graphics on screen' },
  ],
  audio: [
    { icon: Timer, label: 'Pace', marker: '[PACE: normal/slow/fast] ', description: 'Set reading pace' },
    { icon: Type, label: 'Emphasis', marker: '*', description: 'Wrap text for emphasis' },
    { icon: Wind, label: 'Breath', marker: '[BREATH] ', description: 'Insert breath/pause mark' },
    { icon: Music, label: 'SFX', marker: '[SFX: ] ', description: 'Insert sound effect cue' },
    { icon: Pause, label: 'Pause', marker: '[PAUSE: 2s] ', description: 'Insert timed pause' },
    { icon: Bell, label: 'Cue', marker: '[CUE: ] ', description: 'Insert production cue' },
  ],
};

const MODE_ICONS: Record<ScriptMode, React.ElementType> = {
  podcast: Podcast,
  webcast: Tv,
  video: Video,
  audio: Mic,
};

const MODE_COLORS: Record<ScriptMode, string> = {
  podcast: 'bg-purple-500',
  webcast: 'bg-blue-500',
  video: 'bg-red-500',
  audio: 'bg-green-500',
};

export function ScriptModeToolbar({ mode, onInsert, disabled }: ScriptModeToolbarProps) {
  const tools = MODE_TOOLS[mode];
  const ModeIcon = MODE_ICONS[mode];
  const modeColor = MODE_COLORS[mode];

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-2 pr-2 border-r border-border/50">
        <div className={cn('p-1.5 rounded', modeColor)}>
          <ModeIcon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium capitalize">{mode} Mode</span>
      </div>

      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Tooltip key={tool.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onInsert(tool.marker)}
                  disabled={disabled}
                >
                  <tool.icon className="h-4 w-4 mr-1" />
                  <span className="text-xs">{tool.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium">{tool.label}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
                <code className="text-xs bg-muted px-1 rounded mt-1 block">{tool.marker}</code>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
