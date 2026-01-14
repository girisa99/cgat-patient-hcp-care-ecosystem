/**
 * VibeCostTracker - Project Cost Tracking Panel for Genie Vibe
 * 
 * Phase 3 Features:
 * - Real-time cost tracking for TTS, Music, Transcription
 * - Project asset breakdown
 * - Session cost summary
 */

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DollarSign,
  Mic,
  Music,
  FileText,
  CloudUpload,
  Sparkles,
  Video,
  TrendingUp,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import cost tracking types
import type { MediaProject, MediaProjectAsset, CostLog } from '@/components/document-processing/RecordingStudio/hooks/useMediaProject';
import { COST_ESTIMATES } from '@/components/document-processing/RecordingStudio/hooks/useMediaProject';

interface VibeCostTrackerProps {
  project: MediaProject | null;
  assets: MediaProjectAsset[];
  sessionCost: number;
  className?: string;
}

const COST_ICONS: Record<string, React.ReactNode> = {
  tts: <Mic className="h-4 w-4" />,
  music_gen: <Music className="h-4 w-4" />,
  transcription: <FileText className="h-4 w-4" />,
  script_analysis: <Sparkles className="h-4 w-4" />,
  script_enhancement: <Sparkles className="h-4 w-4" />,
  storage: <CloudUpload className="h-4 w-4" />,
  recording: <Video className="h-4 w-4" />,
};

const COST_COLORS: Record<string, string> = {
  tts: 'text-blue-500',
  music_gen: 'text-purple-500',
  transcription: 'text-green-500',
  script_analysis: 'text-pink-500',
  script_enhancement: 'text-pink-500',
  storage: 'text-orange-500',
  recording: 'text-red-500',
};

export function VibeCostTracker({ 
  project, 
  assets, 
  sessionCost,
  className 
}: VibeCostTrackerProps) {
  // Calculate cost breakdown
  const costBreakdown = useMemo(() => {
    if (!project) return null;
    
    const total = project.total_estimated_cost || 0;
    const breakdown = [
      { 
        label: 'TTS Generation', 
        value: project.tts_cost || 0, 
        count: project.total_tts_generations || 0,
        type: 'tts'
      },
      { 
        label: 'Music Generation', 
        value: project.music_generation_cost || 0, 
        count: project.total_music_generations || 0,
        type: 'music_gen'
      },
      { 
        label: 'Transcription', 
        value: project.transcription_cost || 0, 
        count: project.total_transcriptions || 0,
        type: 'transcription'
      },
      { 
        label: 'AI Enhancement', 
        value: project.ai_enhancement_cost || 0, 
        count: project.total_script_enhancements || 0,
        type: 'script_enhancement'
      },
      { 
        label: 'Storage', 
        value: project.storage_cost || 0, 
        count: 0,
        type: 'storage'
      },
    ].filter(item => item.value > 0 || item.count > 0);
    
    return { total, breakdown };
  }, [project]);
  
  // Format currency
  const formatCost = (cost: number): string => {
    if (cost < 0.01) return '< $0.01';
    return `$${cost.toFixed(2)}`;
  };
  
  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };
  
  // Recent assets
  const recentAssets = useMemo(() => {
    return assets.slice(0, 5);
  }, [assets]);

  if (!project) {
    return (
      <div className={cn("p-4 bg-muted/30 rounded-lg border", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm">No project selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Project Header */}
      <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{project.name}</h3>
          </div>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {formatCost(project.total_estimated_cost || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Cost</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {project.total_recordings || 0}
            </p>
            <p className="text-xs text-muted-foreground">Recordings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {formatDuration(project.total_duration_seconds || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Duration</p>
          </div>
        </div>
      </div>
      
      {/* Session Cost */}
      {sessionCost > 0 && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">This Session</span>
            </div>
            <span className="text-sm font-bold text-warning">
              +{formatCost(sessionCost)}
            </span>
          </div>
        </div>
      )}
      
      {/* Cost Breakdown */}
      {costBreakdown && costBreakdown.breakdown.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border">
          <h4 className="text-sm font-medium mb-3">Cost Breakdown</h4>
          <div className="space-y-3">
            {costBreakdown.breakdown.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={COST_COLORS[item.type]}>
                      {COST_ICONS[item.type]}
                    </span>
                    <span>{item.label}</span>
                    {item.count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        ×{item.count}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">{formatCost(item.value)}</span>
                </div>
                <Progress 
                  value={(item.value / (costBreakdown.total || 1)) * 100} 
                  className="h-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Assets */}
      {recentAssets.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border">
          <h4 className="text-sm font-medium mb-3">Recent Assets</h4>
          <ScrollArea className="h-[150px]">
            <div className="space-y-2">
              {recentAssets.map((asset) => (
                <div 
                  key={asset.id}
                  className="flex items-center justify-between p-2 bg-card rounded border text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={COST_COLORS[asset.asset_type] || 'text-muted-foreground'}>
                      {COST_ICONS[asset.asset_type] || <FileText className="h-4 w-4" />}
                    </span>
                    <span className="truncate">{asset.asset_name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {asset.duration_seconds && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(asset.duration_seconds)}
                      </span>
                    )}
                    <span className="font-medium">{formatCost(asset.cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Cost Estimates Reference */}
      <div className="p-3 bg-muted/20 rounded-lg text-xs text-muted-foreground">
        <p className="font-medium mb-1">Cost Estimates</p>
        <div className="grid grid-cols-2 gap-1">
          <span>TTS (OpenAI): ${COST_ESTIMATES.tts.openai}/1K chars</span>
          <span>TTS (ElevenLabs): ${COST_ESTIMATES.tts.elevenlabs}/1K chars</span>
          <span>Transcription: ${COST_ESTIMATES.transcription.openai}/min</span>
          <span>Music Gen: ${COST_ESTIMATES.music_gen.elevenlabs}/30s</span>
        </div>
      </div>
    </div>
  );
}
