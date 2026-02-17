/**
 * UnifiedCostPanel - Consolidated Cost & Asset Tracking
 * 
 * CONSOLIDATES:
 * - VibeCostTracker (inline panel)
 * - ProjectAssetBreakdown (sheet panel)
 * 
 * Supports two display modes:
 * - 'inline': Compact card for embedding in tabs
 * - 'sheet': Full sheet with asset breakdown
 */

import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DollarSign,
  Mic,
  Music,
  FileText,
  CloudUpload,
  Sparkles,
  Video,
  TrendingUp,
  Clock,
  HardDrive,
  Download,
  ExternalLink,
  ChevronRight,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types from MediaProject
interface MediaProject {
  id: string;
  name: string;
  status: string;
  total_estimated_cost?: number;
  tts_cost?: number;
  music_generation_cost?: number;
  transcription_cost?: number;
  ai_enhancement_cost?: number;
  storage_cost?: number;
  total_recordings?: number;
  total_duration_seconds?: number;
  total_tts_generations?: number;
  total_music_generations?: number;
  total_transcriptions?: number;
  total_script_enhancements?: number;
}

interface MediaProjectAsset {
  id: string;
  asset_type: string;
  asset_name: string;
  asset_url?: string | null;
  duration_seconds?: number | null;
  file_size_bytes?: number | null;
  cost: number;
  created_at: string;
}

interface UnifiedCostPanelProps {
  /** Display mode */
  mode?: 'inline' | 'sheet';
  /** Project data */
  project: MediaProject | null;
  /** Project assets */
  assets: MediaProjectAsset[];
  /** Session cost (for inline mode) */
  sessionCost?: number;
  /** Whether sheet is open (for sheet mode) */
  isOpen?: boolean;
  /** Close handler (for sheet mode) */
  onClose?: () => void;
  /** Custom class */
  className?: string;
}

// Unified icon/color config
const ASSET_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  tts: { icon: Mic, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  voiceover: { icon: Mic, color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
  music: { icon: Music, color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  music_gen: { icon: Music, color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
  transcription: { icon: FileText, color: 'text-green-500', bgColor: 'bg-green-500/20' },
  script: { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  script_analysis: { icon: Sparkles, color: 'text-pink-500', bgColor: 'bg-pink-500/20' },
  script_enhancement: { icon: Sparkles, color: 'text-pink-500', bgColor: 'bg-pink-500/20' },
  enhancement: { icon: Wand2, color: 'text-cyan-500', bgColor: 'bg-cyan-500/20' },
  storage: { icon: CloudUpload, color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  recording: { icon: Video, color: 'text-red-500', bgColor: 'bg-red-500/20' },
};

// Format helpers
const formatCost = (cost: number): string => {
  if (cost < 0.01) return '< $0.01';
  return `$${cost.toFixed(2)}`;
};

const formatCostDetailed = (cost: number): string => {
  return `$${cost.toFixed(4)}`;
};

const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const formatSize = (bytes: number | null | undefined): string => {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Inline Mode Component
function InlineCostPanel({ 
  project, 
  assets, 
  sessionCost = 0,
  className,
  onOpenSheet
}: {
  project: MediaProject | null;
  assets: MediaProjectAsset[];
  sessionCost: number;
  className?: string;
  onOpenSheet?: () => void;
}) {
  const costBreakdown = useMemo(() => {
    if (!project) return null;
    
    const total = project.total_estimated_cost || 0;
    const breakdown = [
      { label: 'TTS', value: project.tts_cost || 0, count: project.total_tts_generations || 0, type: 'tts' },
      { label: 'Music', value: project.music_generation_cost || 0, count: project.total_music_generations || 0, type: 'music_gen' },
      { label: 'Transcription', value: project.transcription_cost || 0, count: project.total_transcriptions || 0, type: 'transcription' },
      { label: 'AI Enhancement', value: project.ai_enhancement_cost || 0, count: project.total_script_enhancements || 0, type: 'script_enhancement' },
      { label: 'Storage', value: project.storage_cost || 0, count: 0, type: 'storage' },
    ].filter(item => item.value > 0 || item.count > 0);
    
    return { total, breakdown };
  }, [project]);

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
      {/* Project Summary */}
      <div 
        className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
        onClick={onOpenSheet}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{project.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            {onOpenSheet && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {formatCost(project.total_estimated_cost || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Cost</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{project.total_recordings || 0}</p>
            <p className="text-xs text-muted-foreground">Recordings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{formatDuration(project.total_duration_seconds)}</p>
            <p className="text-xs text-muted-foreground">Duration</p>
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
            <span className="text-sm font-bold text-warning">+{formatCost(sessionCost)}</span>
          </div>
        </div>
      )}
      
      {/* Quick Breakdown */}
      {costBreakdown && costBreakdown.breakdown.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border">
          <h4 className="text-sm font-medium mb-3">Cost Breakdown</h4>
          <div className="space-y-2">
            {costBreakdown.breakdown.slice(0, 4).map((item) => {
              const config = ASSET_CONFIG[item.type];
              const Icon = config?.icon || FileText;
              return (
                <div key={item.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", config?.color || 'text-muted-foreground')} />
                    <span>{item.label}</span>
                    {item.count > 0 && (
                      <Badge variant="outline" className="text-xs">×{item.count}</Badge>
                    )}
                  </div>
                  <span className="font-medium">{formatCost(item.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Sheet Mode Component  
function SheetCostPanel({
  project,
  assets,
  isOpen,
  onClose,
}: {
  project: MediaProject | null;
  assets: MediaProjectAsset[];
  isOpen: boolean;
  onClose: () => void;
}) {
  // Group assets by type
  const groupedAssets = useMemo(() => {
    return assets.reduce((acc, asset) => {
      const type = asset.asset_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(asset);
      return acc;
    }, {} as Record<string, MediaProjectAsset[]>);
  }, [assets]);

  const totalCost = project?.total_estimated_cost || 0;

  const handleDownload = (url: string | null | undefined, name: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[500px] sm:w-[550px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Project Assets: {project?.name || 'Unknown'}</span>
            <Badge variant="outline" className="text-xs gap-1">
              <DollarSign className="w-3 h-3" />
              Total: {formatCostDetailed(totalCost)}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{assets.length}</p>
                <p className="text-xs text-muted-foreground">Total Assets</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{Object.keys(groupedAssets).length}</p>
                <p className="text-xs text-muted-foreground">Asset Types</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{formatCost(totalCost)}</p>
                <p className="text-xs text-muted-foreground">Total Cost</p>
              </div>
            </div>

            <Separator />

            {/* Asset Groups */}
            {Object.entries(groupedAssets).map(([type, typeAssets]) => {
              const config = ASSET_CONFIG[type] || { icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted' };
              const Icon = config.icon;
              const groupCost = typeAssets.reduce((sum, a) => sum + (a.cost || 0), 0);

              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded", config.bgColor, config.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="secondary" className="text-xs">{typeAssets.length}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatCostDetailed(groupCost)}</span>
                  </div>

                  <div className="space-y-1.5 pl-8">
                    {typeAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="bg-muted/30 rounded-lg p-2.5 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{asset.asset_name}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {asset.duration_seconds && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(asset.duration_seconds)}
                                </span>
                              )}
                              {asset.file_size_bytes && (
                                <span className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  {formatSize(asset.file_size_bytes)}
                                </span>
                              )}
                              {asset.cost > 0 && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {formatCostDetailed(asset.cost)}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatDate(asset.created_at)}
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                            {asset.asset_url && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => handleDownload(asset.asset_url, asset.asset_name)}
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => window.open(asset.asset_url!, '_blank')}
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {assets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No assets in this project yet</p>
                <p className="text-xs mt-1">Start recording or generating content to add assets</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Main exported component
export function UnifiedCostPanel({
  mode = 'inline',
  project,
  assets,
  sessionCost = 0,
  isOpen = false,
  onClose,
  className,
}: UnifiedCostPanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (mode === 'sheet') {
    return (
      <SheetCostPanel
        project={project}
        assets={assets}
        isOpen={isOpen}
        onClose={onClose || (() => {})}
      />
    );
  }

  return (
    <>
      <InlineCostPanel
        project={project}
        assets={assets}
        sessionCost={sessionCost}
        className={className}
        onOpenSheet={() => setSheetOpen(true)}
      />
      <SheetCostPanel
        project={project}
        assets={assets}
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

// Re-export for backwards compatibility
export { UnifiedCostPanel as VibeCostTracker };
export { UnifiedCostPanel as ProjectAssetBreakdown };
