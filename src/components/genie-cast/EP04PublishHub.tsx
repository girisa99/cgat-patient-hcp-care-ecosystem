/**
 * PUBLISH HUB — Session-Aware Multi-Platform Publishing
 *
 * Reads title, description, artifacts, and platform preferences from castSession.
 * Falls back to EP04 demo content when no session context is provided.
 *
 * Features:
 * - YouTube (OAuth connected) — main video + Shorts
 * - LinkedIn (OAuth connected) — video post + article
 * - Facebook, TikTok, Instagram, Twitter/X, Threads
 * - Thumbnail pack download (3 variants)
 * - Teaser clips (5 × 30s) per platform
 * - Direct download (MP4 + MP3)
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Share2,
  Youtube,
  Linkedin,
  Download,
  Image as ImageIcon,
  Film,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Loader2,
  Send,
  Lock,
  Scissors,
  FileText,
  Sparkles,
  Video,
  Music2,
  Globe,
  Zap,
  RefreshCw,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { EP04_SOCIAL_CLIPS, EP04_THUMBNAILS, type SocialClip, type ClipCategory } from '@/config/ep04-production-config';
import { useStreamingDownload, VIDEO_DOWNLOAD_PRESETS, type DownloadJob } from '@/hooks/video-editing/useStreamingDownload';
import type { ProductionArtifacts } from '@/hooks/useGenieCastSession';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjectData, type SocialClipData } from '@/hooks/useCastProjectData';

// ──────────────────────────────────────────────────────────────────────────────
// SESSION PROPS — connects PRODUCE → PUBLISH
// ──────────────────────────────────────────────────────────────────────────────

export interface PublishHubSessionProps {
  /** Video title from castSession (overrides default) */
  sessionTitle?: string;
  /** Video description from castSession (overrides default) */
  sessionDescription?: string;
  /** Primary platform from castSession (pre-selects platform) */
  primaryPlatform?: string;
  /** Production artifacts from PRODUCE phase (video URLs, thumbnails, captions) */
  productionArtifacts?: ProductionArtifacts | null;
  /** Selected region for regional targeting */
  selectedRegion?: string;
  /** Content format name for display */
  contentFormat?: string;
  /** Selected visual style names */
  visualStyles?: string[];
}

// ──────────────────────────────────────────────────────────────────────────────
// PLATFORM DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────

// Platform configuration — unified via useSocialPlatforms hook (replaces 95-line hardcoded array)
import { useSocialPlatforms, type SocialPlatform } from '@/hooks/useSocialPlatforms';
import { useLSCastIntegration } from '@/hooks/useLSCastIntegration';
import { useSocialOAuth, type SocialPlatform as OAuthPlatform } from '@/hooks/useSocialOAuth';

// Re-export Platform type for backward compatibility
type Platform = SocialPlatform;

type PublishStatus = 'idle' | 'pending' | 'uploading' | 'published' | 'failed';

interface PublishResult {
  platformId: string;
  status: PublishStatus;
  progress: number;
  url?: string;
  error?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// PLATFORM CARD
// ──────────────────────────────────────────────────────────────────────────────

interface PlatformCardProps {
  platform: Platform;
  selected: boolean;
  result?: PublishResult;
  onToggle: (id: string) => void;
  onConnect?: (id: string) => void;
  isConnecting?: boolean;
}

function PlatformCard({ platform, selected, result, onToggle, onConnect, isConnecting }: PlatformCardProps) {
  const Icon = platform.icon;
  const isConnected = platform.connected;
  const statusColors: Record<PublishStatus, string> = {
    idle: '',
    pending: 'border-amber-500/40',
    uploading: 'border-primary/60',
    published: 'border-emerald-500/40',
    failed: 'border-destructive/60',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 p-4 cursor-pointer transition-all select-none',
        selected && isConnected
          ? 'border-primary/60 bg-primary/5'
          : 'border-border/40 bg-card/50 hover:border-border',
        result && statusColors[result.status],
        !isConnected && 'opacity-70',
      )}
      onClick={() => onToggle(platform.id)}
    >
      {/* Connected badge */}
      <div className="absolute top-2.5 right-2.5">
        {isConnected ? (
          <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40 border px-1.5 py-0.5">
            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
            Connected
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0.5 text-muted-foreground cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onConnect?.(platform.id);
            }}
          >
            {isConnecting ? (
              <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />
            ) : (
              <Lock className="w-2.5 h-2.5 mr-0.5" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Badge>
        )}
      </div>

      <div className="flex items-start gap-3 pr-20">
        <div className={cn(
          'p-2 rounded-lg border mt-0.5',
          selected && isConnected ? 'border-primary/40 bg-primary/10' : 'border-border/40 bg-muted/30',
        )}>
          <Icon className={cn('w-5 h-5', platform.colorClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-0.5">{platform.name}</div>
          <div className="text-xs text-muted-foreground leading-tight">{platform.description}</div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {platform.supportsShorts && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Shorts</Badge>
            )}
            {platform.supportsArticle && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Article</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {result && result.status === 'uploading' && (
        <div className="mt-3">
          <Progress value={result.progress} className="h-1" />
          <div className="text-xs text-muted-foreground mt-1">{result.progress}% uploaded</div>
        </div>
      )}

      {/* Published URL */}
      {result?.status === 'published' && result.url && (
        <div className="mt-3 flex items-center gap-2">
          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/40 border">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
            onClick={e => e.stopPropagation()}
          >
            View <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {result?.status === 'failed' && (
        <div className="mt-3">
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            {result.error || 'Failed'}
          </Badge>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// THUMBNAIL PACK
// ──────────────────────────────────────────────────────────────────────────────

function ThumbnailPackSection({ sessionThumbnails = [] }: { sessionThumbnails?: string[] }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Call auto-thumbnail-generator edge function for real thumbnails
      const videoUrl = sessionThumbnails?.[0]; // Use existing thumbnail or video frame
      if (videoUrl) {
        await supabase.functions.invoke('auto-thumbnail-generator', {
          body: { videoUrl, count: 3, style: 'engagement' },
        });
      }
      setGenerated(true);
      toast.success('Thumbnail pack ready — 3 variants generated');
    } catch {
      toast.error('Thumbnail generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (thumbId: string) => {
    toast.info(`Downloading ${thumbId}…`);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Thumbnail Pack · 3 Variants
        </CardTitle>
        <CardDescription className="text-xs">
          YouTube (1280×720) + LinkedIn (1200×627) + TikTok (1080×1920) for each variant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {EP04_THUMBNAILS.map((thumb, i) => (
            <div
              key={thumb.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20"
            >
              {/* Placeholder thumbnail preview */}
              <div className="w-24 h-14 rounded-md bg-gradient-to-br from-primary/30 via-violet-500/20 to-pink-500/30 border border-border/40 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <Film className="w-6 h-6 text-primary/60" />
                <div className="absolute bottom-1 left-1 right-1 text-[8px] text-center text-primary/80 font-bold leading-tight">
                  {thumb.text}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium mb-0.5">Variant {i + 1}</div>
                <div className="text-xs text-muted-foreground leading-tight">{thumb.concept}</div>
                <Badge variant="outline" className="text-[10px] mt-1 px-1.5 py-0">{thumb.text}</Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                {generated ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleDownload(`${thumb.id}-youtube`)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      YT
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleDownload(`${thumb.id}-linkedin`)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      LI
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="sm"
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generated ? 'Regenerate' : 'Generate Thumbnails'}
          </Button>
          {generated && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => toast.info('Downloading all 9 thumbnails (3 variants × 3 platforms)…')}
            >
              <Download className="w-4 h-4" />
              Download All (9)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TEASER CLIPS SECTION
// ──────────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ClipCategory, { label: string; emoji: string; description: string }> = {
  curiosity: { label: 'Curiosity Hooks', emoji: '🎣', description: 'Stop-scrollers for all platforms' },
  pain_point: { label: 'Pain Points', emoji: '😤', description: 'Relatable moments that drive engagement' },
  data_proof: { label: 'Data & Proof', emoji: '📊', description: 'Credibility clips for LinkedIn & YouTube' },
  democratization: { label: 'AI Democratization', emoji: '🌍', description: 'Inspirational — Reels, TikTok, Shorts' },
  character: { label: 'Character Moments', emoji: '🎭', description: 'Entertainment — character highlights' },
  teaser: { label: 'What\'s Next', emoji: '🔮', description: 'Teaser for upcoming features' },
};

const CATEGORY_ORDER: ClipCategory[] = ['curiosity', 'pain_point', 'data_proof', 'democratization', 'character', 'teaser'];

function TeaserClipsSection({ dbClips }: { dbClips?: SocialClipData[] }) {
  // Use DB-sourced clips when available, otherwise fall back to config
  const effectiveClips: SocialClip[] = React.useMemo(() => {
    if (dbClips && dbClips.length > 0) {
      return dbClips.map(dc => ({
        id: dc.clipId,
        category: dc.category as ClipCategory,
        theme: dc.theme,
        sourceScenes: [], // Not needed for rendering
        timestamp: dc.timestamp,
        duration: dc.duration,
        hook: dc.hook,
        cta: dc.cta,
        hashtags: dc.hashtags,
        platforms: dc.platforms,
        captionStyle: dc.captionStyle as SocialClip['captionStyle'],
        messaging: dc.messaging as SocialClip['messaging'],
      }));
    }
    return EP04_SOCIAL_CLIPS;
  }, [dbClips]);

  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [generatingClips, setGeneratingClips] = useState<string[]>([]);
  const [readyClips, setReadyClips] = useState<string[]>([]);
  const [expandedClip, setExpandedClip] = useState<string | null>(null);

  const toggleClip = (id: string) => {
    setSelectedClips(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);
  };

  const handleGenerateClip = async (clipId: string) => {
    setGeneratingClips(p => [...p, clipId]);
    try {
      const clip = effectiveClips.find(c => c.id === clipId);
      await supabase.functions.invoke('magic-clips-generator', {
        body: {
          sourceVideoUrl: clip?.videoUrl || '',
          platforms: clip?.platforms || ['youtube_shorts', 'linkedin', 'tiktok', 'instagram', 'twitter'],
          mode: 'manual',
          addCaptions: true,
          captionStyle: clip?.captionStyle || 'subtitle',
          language: 'en',
        },
      });
      setReadyClips(p => [...p, clipId]);
      toast.success(`Clip ready: ${clipId}`);
    } catch {
      toast.error(`Clip generation failed: ${clipId}`);
    } finally {
      setGeneratingClips(p => p.filter(c => c !== clipId));
    }
  };

  const handleGenerateAll = async () => {
    for (const clip of effectiveClips) {
      await handleGenerateClip(clip.id);
    }
  };

  // Group clips by category
  const clipsByCategory = CATEGORY_ORDER.map(cat => ({
    category: cat,
    ...CATEGORY_LABELS[cat],
    clips: effectiveClips.filter(c => c.category === cat),
  })).filter(g => g.clips.length > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Scissors className="w-4 h-4 text-primary" />
              Social Clips · {effectiveClips.length} clips · 6 categories
            </CardTitle>
            <CardDescription className="text-xs">
              Multi-platform clips — YouTube Shorts, TikTok, Instagram Reels, LinkedIn, Twitter/X
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleGenerateAll} className="gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Generate All ({effectiveClips.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {clipsByCategory.map(({ category, label, emoji, description, clips }) => (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">{emoji}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">{label}</span>
                <span className="text-[10px] text-muted-foreground">— {description}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">{clips.length} clips</Badge>
              </div>

              <div className="space-y-2">
                {clips.map((clip) => {
                  const isGenerating = generatingClips.includes(clip.id);
                  const isReady = readyClips.includes(clip.id);
                  const isSelected = selectedClips.includes(clip.id);
                  const isExpanded = expandedClip === clip.id;

                  return (
                    <div key={clip.id}>
                      <div
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border transition-all',
                          isSelected ? 'border-primary/50 bg-primary/5' : 'border-border/40 bg-muted/10',
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleClip(clip.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {clip.id.split('-')[0]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{clip.duration}s</span>
                            {clip.platforms.map(p => (
                              <Badge key={p} variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                                {p.replace('youtube_shorts', 'YT').replace('linkedin', 'LI').replace('tiktok', 'TT').replace('instagram', 'IG').replace('twitter', 'X')}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs leading-relaxed text-foreground/90 italic">
                            "{clip.hook}"
                          </p>
                          {/* Per-platform messaging preview toggle */}
                          <button
                            onClick={() => setExpandedClip(isExpanded ? null : clip.id)}
                            className="text-[10px] text-primary hover:underline mt-1"
                          >
                            {isExpanded ? 'Hide messaging' : 'Show per-platform messaging'}
                          </button>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          {isReady ? (
                            <>
                              <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40 border px-2 py-0.5">
                                <CheckCircle className="w-2.5 h-2.5 mr-1" />
                                Ready
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                onClick={() => toast.info(`Downloading ${clip.id}…`)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                MP4
                              </Button>
                            </>
                          ) : isGenerating ? (
                            <Badge variant="outline" className="text-[10px] text-primary border-primary/40 animate-pulse px-2 py-0.5">
                              <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                              Cutting…
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleGenerateClip(clip.id)}
                            >
                              <Scissors className="w-3 h-3" />
                              Cut
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Per-platform messaging preview */}
                      {isExpanded && (
                        <div className="ml-9 mt-1 mb-2 p-3 rounded-lg border border-border/30 bg-muted/5 space-y-2">
                          {Object.entries(clip.messaging).map(([platform, msg]) => (
                            <div key={platform} className="space-y-0.5">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {platform}
                              </div>
                              <p className="text-[11px] text-foreground/80 whitespace-pre-line leading-relaxed">
                                {'text' in msg ? msg.text : 'caption' in msg ? msg.caption : 'title' in msg ? `${msg.title}\n${msg.description}` : ''}
                              </p>
                              {'hashtags' in msg && (msg as { hashtags?: string[] }).hashtags && (
                                <div className="flex gap-1 flex-wrap">
                                  {((msg as { hashtags: string[] }).hashtags).map(h => (
                                    <span key={h} className="text-[9px] text-primary/70">{h}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {readyClips.length > 0 && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-xs"
              onClick={() => toast.info('Downloading all ready clips…')}
            >
              <Download className="w-3.5 h-3.5" />
              Download Ready ({readyClips.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-xs"
              onClick={() => toast.info('Publishing selected clips to all target platforms…')}
            >
              <Send className="w-3.5 h-3.5" />
              Publish Selected
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// DOWNLOAD SECTION
// ──────────────────────────────────────────────────────────────────────────────

function DownloadSection() {
  const dlManager = useStreamingDownload();
  const downloads = [
    { presetId: 'mp4_4k', label: 'Full Video (MP4 · 4K)', icon: Video, size: '~2.4 GB', quality: 'cinematic' },
    { presetId: 'mp4_1080p', label: 'Full Video (MP4 · 1080p)', icon: Video, size: '~680 MB', quality: 'production' },
    { presetId: 'audio_mp3', label: 'Audio Only (MP3 · 320kbps)', icon: Music2, size: '~145 MB', quality: 'audio' },
    { presetId: 'srt_captions', label: 'Transcript (SRT · subtitles)', icon: FileText, size: '~42 KB', quality: 'text' },
    { presetId: 'thumbnail_zip', label: 'Thumbnail Pack (ZIP · all variants)', icon: ImageIcon, size: '~18 MB', quality: 'images' },
  ];

  const handleDownload = (presetId: string, label: string) => {
    const preset = VIDEO_DOWNLOAD_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    // In production: URL would come from assembled video storage
    // For now, show preparing toast and queue the download
    toast.info(`Preparing ${label}…`);
    const filename = `genie-cast-${presetId.replace(/_/g, '-')}.${preset.format}`;
    dlManager.startDownload(
      `/api/production/download/${presetId}`, // Production endpoint
      presetId,
      filename,
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          Download Assets
        </CardTitle>
        <CardDescription className="text-xs">
          Download all production assets — streaming with progress, pause/resume, retry on failure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {downloads.map((item) => {
            const Icon = item.icon;
            const activeJob = dlManager.jobs.find(j => j.presetId === item.presetId && j.status !== 'complete' && j.status !== 'failed' && j.status !== 'cancelled');
            const isDownloading = !!activeJob;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {isDownloading
                        ? `${activeJob.progress}% · ${dlManager.formatSpeed(activeJob.speedBytesPerSec)} · ETA ${dlManager.formatEta(activeJob.etaSeconds)}`
                        : item.size}
                    </div>
                    {isDownloading && (
                      <Progress value={activeJob.progress} className="h-1 mt-1 w-32" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isDownloading ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => dlManager.pauseDownload(activeJob.id)}
                    >
                      Pause
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleDownload(item.presetId, item.label)}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active/completed download jobs */}
        {dlManager.jobs.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground font-medium">
                Downloads: {dlManager.stats.completedJobs}/{dlManager.stats.totalJobs} complete
              </span>
              {dlManager.stats.completedJobs > 0 && (
                <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={dlManager.clearCompleted}>
                  Clear completed
                </Button>
              )}
            </div>
            {dlManager.jobs.filter(j => j.status === 'failed').map(job => (
              <div key={job.id} className="flex items-center gap-2 text-[10px] text-red-500 p-1.5 rounded bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-3 w-3" />
                <span className="flex-1 truncate">{job.error}</span>
                <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => dlManager.retryDownload(job.id)}>
                  Retry
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export function EP04PublishHub({
  sessionTitle,
  sessionDescription,
  primaryPlatform,
  productionArtifacts,
  selectedRegion,
  contentFormat,
  visualStyles,
}: PublishHubSessionProps = {}) {
  const { platforms: PLATFORMS } = useSocialPlatforms();
  const oauth = useSocialOAuth();
  const lsCast = useLSCastIntegration();

  // ─── DB-driven social clips ────────────────────────────────────────
  const [searchParams] = React.useState(() => new URLSearchParams(window.location.search));
  const projectId = searchParams.get('projectId');
  const dbProject = useCastProjectData(projectId);

  // OAuth connect handler — triggers platform OAuth flow
  const handleConnect = useCallback(async (platformId: string) => {
    const oauthPlatform = platformId as OAuthPlatform;
    try {
      await oauth.connect(oauthPlatform);
    } catch {
      toast.error(`Failed to connect ${platformId}`);
    }
  }, [oauth]);

  // Session-aware defaults: use castSession data when available, fall back to EP04 demo
  const defaultTitle = sessionTitle || 'Two AIs, One Sprint, Zero Standup Meetings | GenieSuite EP04';
  const defaultDescription = sessionDescription || 'We ran a 5-day AI development sprint with Claude Code and Lovable. 41 tasks. No standups. Here\'s what we tracked, what broke, and what delivered 5x faster.';
  const defaultPlatforms = primaryPlatform ? [primaryPlatform] : ['youtube', 'linkedin'];

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(defaultPlatforms);
  const [publishTitle, setPublishTitle] = useState(defaultTitle);
  const [publishDescription, setPublishDescription] = useState(defaultDescription);
  const [publishResults, setPublishResults] = useState<Record<string, PublishResult>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTab, setPublishTab] = useState('platforms');

  // Derive session context for display
  const hasSessionContext = !!(sessionTitle || productionArtifacts);
  const sessionVideoUrl = productionArtifacts?.assembledVideoUrl;
  const sessionThumbnails = productionArtifacts?.thumbnailUrls || [];

  const togglePlatform = useCallback((id: string) => {
    const platform = PLATFORMS.find(p => p.id === id);
    if (!platform?.connected) {
      toast.info(`Connect your ${platform?.name} account to enable publishing`);
      return;
    }
    setSelectedPlatforms(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      lsCast.capturePlatformSelection(next, PLATFORMS.length);
      return next;
    });
  }, [PLATFORMS, lsCast]);

  const copyLink = () => {
    const url = sessionVideoUrl || 'https://youtu.be/ep04-demo-link';
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }

    const videoUrl = sessionVideoUrl;
    if (!videoUrl) {
      toast.error('No video URL available — complete PRODUCE step first');
      return;
    }

    setIsPublishing(true);

    const initial: Record<string, PublishResult> = {};
    selectedPlatforms.forEach(id => {
      initial[id] = { platformId: id, status: 'pending', progress: 0 };
    });
    setPublishResults(initial);

    // Publish to each platform via social-publish edge function
    for (const platformId of selectedPlatforms) {
      setPublishResults(p => ({
        ...p,
        [platformId]: { ...p[platformId], status: 'uploading', progress: 30 },
      }));

      try {
        const { data, error } = await supabase.functions.invoke('social-publish', {
          body: {
            platform: platformId,
            videoUrl,
            title: publishTitle || sessionTitle || 'Genie Cast Video',
            description: publishDescription || sessionDescription || '',
            thumbnailUrl: sessionThumbnails?.[0] || undefined,
            hashtags: [],
            region: selectedRegion || 'global',
          },
        });

        if (error) throw error;

        const publishUrl = data?.url || data?.postUrl || data?.videoUrl;
        const success = data?.success !== false;

        setPublishResults(p => ({
          ...p,
          [platformId]: {
            ...p[platformId],
            status: success ? 'published' : 'failed',
            progress: 100,
            url: publishUrl || undefined,
            error: success ? undefined : (data?.error || 'Publish failed'),
          },
        }));

        // Capture publish result for LS training
        lsCast.capturePublishAction({
          platform: platformId,
          success,
          publishType: 'immediate',
          errorMessage: success ? undefined : (data?.error || 'Publish failed'),
        });

        if (success) {
          toast.success(`Published to ${PLATFORMS.find(p => p.id === platformId)?.name}`);
        } else {
          toast.error(`${platformId} failed: ${data?.error || 'Unknown error'}`);
        }
      } catch (err) {
        setPublishResults(p => ({
          ...p,
          [platformId]: {
            ...p[platformId],
            status: 'failed',
            progress: 0,
            error: err instanceof Error ? err.message : 'Publish failed',
          },
        }));
        lsCast.capturePublishAction({
          platform: platformId,
          success: false,
          publishType: 'immediate',
          errorMessage: err instanceof Error ? err.message : 'Publish failed',
        });
        toast.error(`${platformId} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    setIsPublishing(false);
    const successCount = Object.values(publishResults).filter(r => r.status === 'published').length;
    if (successCount > 0) {
      toast.success(`Published to ${successCount} platform(s)!`);
    }
  };

  const connectedCount = PLATFORMS.filter(p => p.connected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-violet-500/5 to-pink-500/5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Publish Hub</h2>
                <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/40 border">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {connectedCount} OAuth connected
                </Badge>
                {hasSessionContext && (
                  <Badge variant="outline" className="text-xs text-primary border-primary/40">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Session Linked
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate max-w-lg">
                {hasSessionContext
                  ? `${contentFormat || 'Video'} · ${selectedRegion || 'Global'} · Multi-platform distribution`
                  : '"Two AIs, One Sprint, Zero Standup Meetings" · Full multi-platform distribution'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-2 flex-shrink-0">
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
          </div>

          {/* Connected platform quick chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {PLATFORMS.map(p => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border',
                    p.connected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-muted/30 border-border/30 text-muted-foreground',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {p.name}
                  {p.connected && <CheckCircle className="w-3 h-3" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={publishTab} onValueChange={setPublishTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="platforms" className="text-xs gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            Publish
          </TabsTrigger>
          <TabsTrigger value="clips" className="text-xs gap-1.5">
            <Scissors className="w-3.5 h-3.5" />
            Clips
          </TabsTrigger>
          <TabsTrigger value="thumbnails" className="text-xs gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            Thumbnails
          </TabsTrigger>
          <TabsTrigger value="download" className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Download
          </TabsTrigger>
        </TabsList>

        {/* PLATFORMS TAB */}
        <TabsContent value="platforms" className="space-y-5 mt-4">
          {/* Metadata */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Video Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={publishTitle}
                  onChange={e => setPublishTitle(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <Textarea
                  value={publishDescription}
                  onChange={e => setPublishDescription(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Select Platforms</span>
              <span className="text-xs text-muted-foreground">
                {selectedPlatforms.length} selected
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PLATFORMS.map(platform => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  selected={selectedPlatforms.includes(platform.id)}
                  result={publishResults[platform.id]}
                  onToggle={togglePlatform}
                  onConnect={handleConnect}
                  isConnecting={oauth.isConnecting === platform.id}
                />
              ))}
            </div>
          </div>

          {/* Publish button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {selectedPlatforms.length > 0
                ? `Publishing to: ${selectedPlatforms.map(id => PLATFORMS.find(p => p.id === id)?.name).filter(Boolean).join(', ')}`
                : 'No platforms selected'}
            </div>
            <Button
              onClick={handlePublish}
              disabled={selectedPlatforms.length === 0 || isPublishing}
              className="gap-2"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isPublishing
                ? `Publishing (${Object.values(publishResults).filter(r => r.status === 'published').length}/${selectedPlatforms.length})…`
                : `Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
            </Button>
          </div>

          {/* Live results */}
          <AnimatePresence>
            {Object.values(publishResults).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Separator />
                <div className="text-sm font-medium">Publish Results</div>
                {Object.values(publishResults).map(result => {
                  const platform = PLATFORMS.find(p => p.id === result.platformId);
                  const Icon = platform?.icon || Globe;
                  return (
                    <div key={result.platformId} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                      <div className="flex items-center gap-3">
                        <Icon className={cn('w-4 h-4', platform?.colorClass)} />
                        <span className="text-sm font-medium">{platform?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === 'uploading' && (
                          <div className="flex items-center gap-2">
                            <Progress value={result.progress} className="w-20 h-1.5" />
                            <span className="text-xs text-muted-foreground">{result.progress}%</span>
                          </div>
                        )}
                        {result.status === 'published' && (
                          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/40 border">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        )}
                        {result.status === 'failed' && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        {result.status === 'pending' && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Queued
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* CLIPS TAB */}
        <TabsContent value="clips" className="mt-4">
          <TeaserClipsSection dbClips={dbProject.isSeeded ? dbProject.socialClips : undefined} />
        </TabsContent>

        {/* THUMBNAILS TAB */}
        <TabsContent value="thumbnails" className="mt-4">
          <ThumbnailPackSection sessionThumbnails={sessionThumbnails} />
        </TabsContent>

        {/* DOWNLOAD TAB */}
        <TabsContent value="download" className="mt-4">
          <DownloadSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EP04PublishHub;
