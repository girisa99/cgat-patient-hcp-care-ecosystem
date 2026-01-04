/**
 * Production Info Panel - Shows current production context in Recording Studio
 * Displays show name, participants, linked assets, stage, and project stats
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Podcast, 
  Tv, 
  Video, 
  Mic, 
  Users, 
  FileText, 
  Music,
  Circle,
  Radio,
  DollarSign,
  Volume2,
  Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductionContextForStudio } from '../types';

interface ProductionInfoProps {
  productionContext: ProductionContextForStudio;
  className?: string;
  // Optional project stats - shown when available
  projectStats?: {
    totalRecordings: number;
    totalTTS: number;
    totalCost: number;
    sessionCost?: number;
  };
}

const SCRIPT_MODE_ICONS: Record<string, React.ComponentType<any>> = {
  podcast: Podcast,
  webcast: Tv,
  video: Video,
  audio: Mic,
};

const SCRIPT_MODE_COLORS: Record<string, string> = {
  podcast: 'bg-purple-500',
  webcast: 'bg-blue-500',
  video: 'bg-red-500',
  audio: 'bg-green-500',
};

const STAGE_COLORS: Record<string, string> = {
  outreach: 'bg-blue-500',
  script: 'bg-purple-500',
  rehearsal: 'bg-yellow-500',
  recording: 'bg-red-500',
  post_production: 'bg-orange-500',
  published: 'bg-green-500',
};

const formatCost = (cost: number) => {
  if (cost < 0.01) return '<$0.01';
  return `$${cost.toFixed(2)}`;
};

export function ProductionInfo({ productionContext, className, projectStats }: ProductionInfoProps) {
  const ModeIcon = SCRIPT_MODE_ICONS[productionContext.scriptMode] || Radio;
  const modeColor = SCRIPT_MODE_COLORS[productionContext.scriptMode] || 'bg-primary';
  const stageColor = STAGE_COLORS[productionContext.currentStage] || 'bg-muted';
  
  return (
    <div className={cn("bg-card rounded-lg border p-3 space-y-3", className)}>
      {/* Production Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn("p-1.5 rounded", modeColor)}>
            <ModeIcon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate">{productionContext.showTitle}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{productionContext.scriptMode}</span>
              <Circle className="h-1 w-1 fill-current" />
              <span className="capitalize">{productionContext.currentStage.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-[10px] shrink-0", stageColor, "text-white border-0")}
        >
          {productionContext.currentStage === 'recording' && (
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
          {productionContext.currentStage.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      
      {/* Project Stats - Show when available */}
      {projectStats && (
        <>
          <Separator />
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="p-1.5 rounded bg-muted/50">
              <Film className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
              <div className="text-sm font-semibold">{projectStats.totalRecordings}</div>
              <div className="text-[9px] text-muted-foreground">Recs</div>
            </div>
            <div className="p-1.5 rounded bg-muted/50">
              <Volume2 className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
              <div className="text-sm font-semibold">{projectStats.totalTTS}</div>
              <div className="text-[9px] text-muted-foreground">TTS</div>
            </div>
            <div className="p-1.5 rounded bg-muted/50">
              <DollarSign className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
              <div className="text-sm font-semibold">{formatCost(projectStats.sessionCost ?? 0)}</div>
              <div className="text-[9px] text-muted-foreground">Session</div>
            </div>
            <div className="p-1.5 rounded bg-muted/50">
              <DollarSign className="h-3 w-3 mx-auto text-green-500 mb-0.5" />
              <div className="text-sm font-semibold">{formatCost(projectStats.totalCost)}</div>
              <div className="text-[9px] text-muted-foreground">Total</div>
            </div>
          </div>
        </>
      )}
      
      {/* Participants */}
      {productionContext.participants.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Participants</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {productionContext.participants.slice(0, 4).map((p) => (
                <div 
                  key={p.id} 
                  className="flex items-center gap-1.5 bg-muted/50 rounded-full pl-0.5 pr-2 py-0.5"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] font-medium truncate max-w-[80px]">{p.name}</span>
                  <Badge variant="secondary" className="text-[9px] h-3.5 px-1 capitalize">
                    {p.role.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {productionContext.participants.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{productionContext.participants.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Linked Assets */}
      {(productionContext.linkedScriptId || productionContext.linkedMusicId) && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Linked Assets</span>
            <div className="flex flex-wrap gap-1">
              {productionContext.linkedScriptId && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <FileText className="h-2.5 w-2.5" />
                  Script Linked
                </Badge>
              )}
              {productionContext.linkedMusicId && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Music className="h-2.5 w-2.5" />
                  Music Linked
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Studio Settings Preview */}
      {productionContext.studioSettings && (
        <>
          <Separator />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-medium">
                {productionContext.studioSettings.teleprompterSpeed}x
              </div>
              <div className="text-[10px] text-muted-foreground">Prompt Speed</div>
            </div>
            <div>
              <div className="text-sm font-medium capitalize">
                {productionContext.studioSettings.ttsProvider}
              </div>
              <div className="text-[10px] text-muted-foreground">Voice</div>
            </div>
            <div>
              <div className="text-sm font-medium">
                {productionContext.studioSettings.studioSoundEnabled ? 'On' : 'Off'}
              </div>
              <div className="text-[10px] text-muted-foreground">Studio Sound</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
