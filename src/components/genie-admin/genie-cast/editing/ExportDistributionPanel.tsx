/**
 * ExportDistributionPanel — Multi-Platform Export UI
 *
 * Visual UI for selecting target platforms and configuring export.
 * Supports ALL platforms: Instagram, TikTok, YouTube, Facebook, LinkedIn, X,
 * WhatsApp, Snapchat, WeChat, LINE, KakaoTalk, Pinterest, Telegram,
 * Threads, Bluesky, Digital Signage, CTV, Email, Website, Download formats.
 *
 * Features:
 *   - Platform grid with category tabs
 *   - Per-platform preview with aspect ratio mockup
 *   - Duration/size validation per platform
 *   - Batch export with per-platform progress
 *   - Caption, watermark, and hashtag configuration
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Share2,
  Check,
  X,
  AlertCircle,
  Loader2,
  RotateCcw,
  Play,
  Smartphone,
  Monitor,
  Tv,
  Globe,
  Mail,
  MessageCircle,
  Hash,
  Type,
  Image as ImageIcon,
  Maximize2,
  Clock,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlatformExportHook, PlatformPreset, PlatformId, ExportJob } from '@/hooks/video-editing/usePlatformExport';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ExportDistributionPanelProps {
  exportHook: PlatformExportHook;
  timelineDurationMs: number;
  className?: string;
}

// ─── Category Config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  short_video: { label: 'Short Video', icon: Smartphone, description: 'Reels, TikTok, Shorts' },
  long_video: { label: 'Long Video', icon: Play, description: 'YouTube, Vimeo' },
  social_feed: { label: 'Social Feeds', icon: Globe, description: 'Instagram, Facebook, LinkedIn, X' },
  story: { label: 'Stories', icon: Smartphone, description: 'Instagram, Facebook, LinkedIn Stories' },
  messaging: { label: 'Messaging', icon: MessageCircle, description: 'WhatsApp, Telegram, WeChat, LINE' },
  professional: { label: 'Professional', icon: Monitor, description: 'Email, Website, Signage, CTV' },
  download: { label: 'Download', icon: Download, description: 'MP4, WebM, MOV, GIF' },
};

// ─── Platform Card ──────────────────────────────────────────────────────────

function PlatformCard({
  preset,
  isSelected,
  isCompatible,
  durationWarning,
  onToggle,
}: {
  preset: PlatformPreset;
  isSelected: boolean;
  isCompatible: boolean;
  durationWarning?: string;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'relative p-3 rounded-lg border-2 cursor-pointer transition-all',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/20',
        !isCompatible && 'opacity-50',
      )}
      onClick={onToggle}
    >
      {/* Selected check */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Platform name */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{preset.name}</span>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Maximize2 className="h-2.5 w-2.5" />
          {preset.aspectRatio}
        </div>
        <div className="flex items-center gap-1">
          <Monitor className="h-2.5 w-2.5" />
          {preset.resolution.width}x{preset.resolution.height}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {preset.maxDurationSec < 120 ? `${preset.maxDurationSec}s` : `${Math.floor(preset.maxDurationSec / 60)}m`}
        </div>
        <div className="flex items-center gap-1">
          <HardDrive className="h-2.5 w-2.5" />
          {preset.maxFileSizeMb < 1000 ? `${preset.maxFileSizeMb}MB` : `${(preset.maxFileSizeMb / 1000).toFixed(0)}GB`}
        </div>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-1 mt-2">
        {preset.supportsCaptions && <Badge variant="outline" className="text-[8px] h-4 px-1">CC</Badge>}
        {preset.supportsHashtags && <Badge variant="outline" className="text-[8px] h-4 px-1">#</Badge>}
        {preset.supportsScheduling && <Badge variant="outline" className="text-[8px] h-4 px-1">Schedule</Badge>}
        {preset.autoCaption && <Badge variant="secondary" className="text-[8px] h-4 px-1">Auto-CC</Badge>}
      </div>

      {/* Duration warning */}
      {durationWarning && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-600">
          <AlertCircle className="h-3 w-3" />
          {durationWarning}
        </div>
      )}

      {/* Notes */}
      <p className="text-[9px] text-muted-foreground mt-1.5 line-clamp-2">{preset.notes}</p>
    </div>
  );
}

// ─── Export Job Row ─────────────────────────────────────────────────────────

function ExportJobRow({ job, preset, onRetry }: { job: ExportJob; preset?: PlatformPreset; onRetry: () => void }) {
  const statusConfig: Record<ExportJob['status'], { color: string; label: string; icon: React.ElementType }> = {
    queued: { color: 'text-muted-foreground', label: 'Queued', icon: Clock },
    processing: { color: 'text-blue-500', label: 'Processing', icon: Loader2 },
    encoding: { color: 'text-purple-500', label: 'Encoding', icon: Loader2 },
    uploading: { color: 'text-cyan-500', label: 'Uploading', icon: Loader2 },
    complete: { color: 'text-emerald-500', label: 'Complete', icon: Check },
    failed: { color: 'text-red-500', label: 'Failed', icon: AlertCircle },
  };

  const config = statusConfig[job.status];
  const Icon = config.icon;
  const isAnimating = ['processing', 'encoding', 'uploading'].includes(job.status);

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
      <Icon className={cn('h-4 w-4 flex-shrink-0', config.color, isAnimating && 'animate-spin')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{preset?.name || job.platformId}</span>
          <Badge variant="outline" className={cn('text-[9px]', config.color)}>{config.label}</Badge>
        </div>
        {isAnimating && <Progress value={job.progress} className="h-1 mt-1" />}
        {job.error && <p className="text-[10px] text-red-500 mt-0.5">{job.error}</p>}
      </div>
      <div className="flex items-center gap-1">
        {job.status === 'complete' && job.outputUrl && (
          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
            <a href={job.outputUrl} download>
              <Download className="h-3 w-3" />
            </a>
          </Button>
        )}
        {job.status === 'failed' && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRetry}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
        <span className="text-[10px] text-muted-foreground">{job.progress}%</span>
      </div>
    </div>
  );
}

// ─── Aspect Ratio Preview ───────────────────────────────────────────────────

function AspectRatioPreview({ ratio }: { ratio: string }) {
  const dims: Record<string, { w: number; h: number }> = {
    '16:9': { w: 64, h: 36 },
    '9:16': { w: 36, h: 64 },
    '1:1': { w: 48, h: 48 },
    '4:5': { w: 40, h: 50 },
    '4:3': { w: 48, h: 36 },
    '21:9': { w: 70, h: 30 },
  };
  const dim = dims[ratio] || { w: 48, h: 36 };

  return (
    <div
      className="border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center bg-muted/20"
      style={{ width: dim.w, height: dim.h }}
    >
      <span className="text-[8px] text-muted-foreground">{ratio}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ExportDistributionPanel({
  exportHook,
  timelineDurationMs,
  className,
}: ExportDistributionPanelProps) {
  const {
    config,
    setConfig,
    jobs,
    isExporting,
    exportStats,
    getPreset,
    presetsByCategory,
    selectedPresets,
    allPresets,
    togglePlatform,
    selectCategory,
    clearPlatforms,
    startExport,
    retryJob,
    cancelExport,
  } = exportHook;

  const [activeCategory, setActiveCategory] = useState('short_video');
  const durationSec = timelineDurationMs / 1000;

  // Check platform compatibility
  const getDurationWarning = useCallback((preset: PlatformPreset): string | undefined => {
    if (durationSec > preset.maxDurationSec) {
      return `Content is ${Math.round(durationSec)}s, max is ${preset.maxDurationSec}s — will be trimmed`;
    }
    if (durationSec < preset.minDurationSec) {
      return `Content is ${Math.round(durationSec)}s, min is ${preset.minDurationSec}s`;
    }
    return undefined;
  }, [durationSec]);

  // Unique aspect ratios needed
  const requiredAspectRatios = useMemo(() => {
    const ratios = new Set(selectedPresets.map(p => p.aspectRatio));
    return Array.from(ratios);
  }, [selectedPresets]);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Export & Distribute
            </CardTitle>
            <CardDescription className="text-xs">
              Export to 30+ platforms with auto-optimized format, resolution, and captions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {config.selectedPlatforms.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {config.selectedPlatforms.length} platforms
              </Badge>
            )}
            {requiredAspectRatios.length > 0 && (
              <div className="flex items-center gap-1">
                {requiredAspectRatios.map(r => (
                  <AspectRatioPreview key={r} ratio={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Platform Selection Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto flex-nowrap">
            {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => {
              const count = presetsByCategory.get(key)?.length || 0;
              const selectedCount = (presetsByCategory.get(key) || []).filter(p => config.selectedPlatforms.includes(p.id)).length;
              return (
                <TabsTrigger key={key} value={key} className="text-xs h-7 gap-1 flex-shrink-0">
                  <cat.icon className="h-3 w-3" />
                  {cat.label}
                  {selectedCount > 0 && (
                    <Badge variant="default" className="text-[8px] h-3.5 px-1 ml-0.5">{selectedCount}</Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
            <TabsContent key={key} value={key} className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{cat.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => selectCategory(key as PlatformPreset['category'])}
                >
                  Select All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {(presetsByCategory.get(key) || []).map(preset => (
                  <PlatformCard
                    key={preset.id}
                    preset={preset}
                    isSelected={config.selectedPlatforms.includes(preset.id)}
                    isCompatible={durationSec <= preset.maxDurationSec}
                    durationWarning={getDurationWarning(preset)}
                    onToggle={() => togglePlatform(preset.id)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Separator />

        {/* Export Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Caption & Watermark */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground">Options</h4>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Include Captions</Label>
              <Switch
                checked={config.includeCaptions}
                onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeCaptions: v }))}
              />
            </div>

            {config.includeCaptions && (
              <Select
                value={config.captionStyle}
                onValueChange={(v) => setConfig(prev => ({ ...prev, captionStyle: v as any }))}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="burned_in">Burned-in (embedded)</SelectItem>
                  <SelectItem value="srt_file">SRT file (separate)</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center justify-between">
              <Label className="text-xs">Watermark</Label>
              <Switch
                checked={config.includeWatermark}
                onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeWatermark: v }))}
              />
            </div>

            {config.includeWatermark && (
              <Select
                value={config.watermarkPosition}
                onValueChange={(v) => setConfig(prev => ({ ...prev, watermarkPosition: v as any }))}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top_left">Top Left</SelectItem>
                  <SelectItem value="top_right">Top Right</SelectItem>
                  <SelectItem value="bottom_left">Bottom Left</SelectItem>
                  <SelectItem value="bottom_right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Right: Title, description, hashtags */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground">Metadata</h4>

            <Input
              placeholder="Video title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              className="h-7 text-xs"
            />

            <Textarea
              placeholder="Description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              className="text-xs min-h-[60px]"
              rows={2}
            />

            <Input
              placeholder="Hashtags (comma-separated)"
              value={config.hashtags.join(', ')}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                hashtags: e.target.value.split(',').map(h => h.trim()).filter(Boolean),
              }))}
              className="h-7 text-xs"
            />
          </div>
        </div>

        <Separator />

        {/* Export Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => startExport(timelineDurationMs)}
            disabled={config.selectedPlatforms.length === 0 || isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Export to {config.selectedPlatforms.length} Platform{config.selectedPlatforms.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {isExporting && (
            <Button variant="destructive" size="sm" onClick={cancelExport} className="gap-1">
              <X className="h-3 w-3" />
              Cancel
            </Button>
          )}

          {config.selectedPlatforms.length > 0 && !isExporting && (
            <Button variant="ghost" size="sm" onClick={clearPlatforms} className="text-xs">
              Clear Selection
            </Button>
          )}

          {/* Export stats */}
          {jobs.length > 0 && (
            <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span className="text-emerald-500">{exportStats.completed} done</span>
              {exportStats.failed > 0 && <span className="text-red-500">{exportStats.failed} failed</span>}
              {exportStats.inProgress > 0 && <span className="text-blue-500">{exportStats.inProgress} in progress</span>}
              <Progress value={exportStats.overallProgress} className="h-1.5 w-24" />
            </div>
          )}
        </div>

        {/* Export Jobs */}
        {jobs.length > 0 && (
          <ScrollArea className="max-h-[240px]">
            <div className="space-y-1.5">
              {jobs.map(job => (
                <ExportJobRow
                  key={job.id}
                  job={job}
                  preset={getPreset(job.platformId)}
                  onRetry={() => retryJob(job.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default ExportDistributionPanel;
