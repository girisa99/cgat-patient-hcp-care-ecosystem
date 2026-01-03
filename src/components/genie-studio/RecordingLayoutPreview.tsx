/**
 * Recording Layout Preview
 * Shows mode-specific recording studio layout configuration
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Monitor,
  FileText,
  Users,
  Clock,
  Eye,
  Settings,
  LayoutGrid,
  Columns,
  Square,
  Focus,
  Podcast,
  Tv,
  Video,
  Mic,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScriptMode } from '@/types/projects';
import {
  SCRIPT_MODE_CONFIGS,
  type RecordingLayoutPreset,
} from '@/config/scriptModePresets';

interface RecordingLayoutPreviewProps {
  mode: ScriptMode;
  layoutOverrides?: Partial<RecordingLayoutPreset>;
  onLayoutChange?: (updates: Partial<RecordingLayoutPreset>) => void;
  disabled?: boolean;
}

const LAYOUT_ICONS = {
  single: Square,
  split: Columns,
  grid: LayoutGrid,
  focus: Focus,
};

const MODE_ICONS = {
  podcast: Podcast,
  webcast: Tv,
  video: Video,
  audio: Mic,
};

export function RecordingLayoutPreview({
  mode,
  layoutOverrides,
  onLayoutChange,
  disabled,
}: RecordingLayoutPreviewProps) {
  const modeConfig = SCRIPT_MODE_CONFIGS[mode];
  const baseLayout = modeConfig.recordingLayout;
  const layout: RecordingLayoutPreset = { ...baseLayout, ...layoutOverrides };
  
  const LayoutIcon = LAYOUT_ICONS[layout.layout];
  const ModeIcon = MODE_ICONS[mode];

  const toggleOption = (key: keyof RecordingLayoutPreset, value: boolean) => {
    onLayoutChange?.({ [key]: value });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded', modeConfig.color)}>
              <ModeIcon className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-sm font-medium">Recording Layout</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {layout.layout} view
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 pb-4">
        {/* Layout Preview */}
        <div className="relative bg-muted/30 rounded-lg p-4 border border-border/50">
          <div className="grid gap-2" style={{ 
            gridTemplateColumns: layout.layout === 'split' 
              ? `${layout.panelSizes.script}fr ${layout.panelSizes.preview}fr ${layout.panelSizes.participants || 0}fr`.replace(' 0fr', '')
              : layout.layout === 'grid'
              ? '1fr 1fr'
              : '1fr'
          }}>
            {/* Script Panel */}
            <div className={cn(
              'bg-card border rounded p-2 flex flex-col items-center justify-center min-h-[60px]',
              layout.layout === 'single' && 'col-span-full'
            )}>
              <FileText className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground">Script</span>
              {layout.showTeleprompter && (
                <Badge variant="outline" className="text-[8px] mt-1">Teleprompter</Badge>
              )}
            </div>
            
            {/* Preview Panel */}
            {layout.panelSizes.preview > 0 && (
              <div className={cn(
                'bg-card border rounded p-2 flex flex-col items-center justify-center min-h-[60px]',
                layout.layout === 'focus' && 'row-span-2'
              )}>
                <Monitor className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Preview</span>
                {layout.showVisualCues && (
                  <Badge variant="outline" className="text-[8px] mt-1">Visual Cues</Badge>
                )}
              </div>
            )}
            
            {/* Participants Panel (if applicable) */}
            {layout.showParticipantList && layout.panelSizes.participants > 0 && (
              <div className="bg-card border rounded p-2 flex flex-col items-center justify-center min-h-[60px]">
                <Users className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Participants</span>
              </div>
            )}
          </div>
          
          {/* Timer Overlay */}
          {layout.showTimer && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 rounded px-2 py-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px]">00:00</span>
            </div>
          )}
        </div>

        {/* Layout Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Teleprompter
            </Label>
            <Switch
              checked={layout.showTeleprompter}
              onCheckedChange={(v) => toggleOption('showTeleprompter', v)}
              disabled={disabled || !onLayoutChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Timer
            </Label>
            <Switch
              checked={layout.showTimer}
              onCheckedChange={(v) => toggleOption('showTimer', v)}
              disabled={disabled || !onLayoutChange}
            />
          </div>
          
          {mode === 'podcast' && (
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Users className="h-3 w-3" />
                Participant List
              </Label>
              <Switch
                checked={layout.showParticipantList}
                onCheckedChange={(v) => toggleOption('showParticipantList', v)}
                disabled={disabled || !onLayoutChange}
              />
            </div>
          )}
          
          {(mode === 'webcast' || mode === 'video') && (
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                <Eye className="h-3 w-3" />
                Visual Cues
              </Label>
              <Switch
                checked={layout.showVisualCues}
                onCheckedChange={(v) => toggleOption('showVisualCues', v)}
                disabled={disabled || !onLayoutChange}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-2">
              <Settings className="h-3 w-3" />
              Media Controls
            </Label>
            <Switch
              checked={layout.showMediaControls}
              onCheckedChange={(v) => toggleOption('showMediaControls', v)}
              disabled={disabled || !onLayoutChange}
            />
          </div>
        </div>

        {/* Features for this mode */}
        <div className="pt-2 border-t">
          <Label className="text-xs text-muted-foreground mb-2 block">Mode Features</Label>
          <div className="flex flex-wrap gap-1">
            {layout.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-[10px]">
                {feature.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
