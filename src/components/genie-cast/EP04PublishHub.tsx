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

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
// PUBLISH HUB PERSISTENCE — save/load generated artifacts to cast_projects.metadata
// ──────────────────────────────────────────────────────────────────────────────

interface PublishHubCache {
  clipUrls?: Record<string, string>;
  readyClips?: string[];
  thumbnailResults?: string[];
  generatedShorts?: Array<{ id: string; url: string; thumbnailUrl?: string; duration: number }>;
  socialCopies?: Array<{ platform: string; format: string; text: string; hashtags: string[] }>;
  savedAt?: string;
}

async function loadPublishHubCache(projectId: string): Promise<PublishHubCache | null> {
  try {
    const { data } = await supabase
      .from('cast_projects')
      .select('metadata')
      .eq('id', projectId)
      .single();
    return (data?.metadata as Record<string, unknown>)?.publishHub as PublishHubCache || null;
  } catch { return null; }
}

async function savePublishHubCache(projectId: string, patch: Partial<PublishHubCache>): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('cast_projects')
      .select('metadata')
      .eq('id', projectId)
      .single();
    const meta = (existing?.metadata as Record<string, unknown>) || {};
    const prev = (meta.publishHub as PublishHubCache) || {};
    const merged = { ...prev, ...patch, savedAt: new Date().toISOString() };
    await supabase
      .from('cast_projects')
      .update({ metadata: { ...meta, publishHub: merged } })
      .eq('id', projectId);
  } catch (e) {
    console.warn('[PublishHub] Cache save failed:', e);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

/** Extract friendly filename from a Supabase Storage URL or any URL */
function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || url;
  } catch {
    return url;
  }
}

/** Get share-via-intent URL for platforms that support web sharing */
function getShareIntentUrl(platformId: string, videoUrl: string, title: string, description: string): string | null {
  const text = `${title}\n\n${description}`.trim();
  const encodedUrl = encodeURIComponent(videoUrl);
  const encodedText = encodeURIComponent(text);

  switch (platformId) {
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    case 'threads':
      return `https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`;
    // youtube, tiktok, instagram require OAuth upload — no intent URL
    default:
      return null;
  }
}

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
  /** Multi-select target platforms from castSession */
  targetPlatformIds?: string[];
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

// Content format definitions per platform
const PLATFORM_CONTENT_FORMATS: Record<string, { id: string; label: string; description: string; icon: string }[]> = {
  youtube: [
    { id: 'video', label: 'Full Video', description: 'Long-form video upload with SEO description', icon: '🎬' },
    { id: 'shorts', label: 'YouTube Shorts', description: 'Vertical short-form clips (< 60s)', icon: '⚡' },
    { id: 'description', label: 'SEO Description', description: 'AI-optimized description with timestamps & keywords', icon: '📝' },
  ],
  linkedin: [
    { id: 'video', label: 'Video Post', description: 'Native video post in feed', icon: '🎥' },
    { id: 'article', label: 'LinkedIn Article', description: '600-800 word thought-leadership article with video embed', icon: '📰' },
    { id: 'post', label: 'Short Post', description: '200-300 word feed post with video link', icon: '💬' },
    { id: 'newsletter', label: 'Newsletter', description: 'LinkedIn Newsletter issue with embedded video', icon: '📧' },
  ],
  twitter: [
    { id: 'video', label: 'Video Tweet', description: 'Single tweet with video attachment', icon: '🎥' },
    { id: 'thread', label: 'Tweet Thread', description: '5-tweet thread with key insights + video', icon: '🧵' },
    { id: 'spaces', label: 'Spaces Promo', description: 'Promotional tweet for X Spaces discussion', icon: '🎙️' },
  ],
  instagram: [
    { id: 'reels', label: 'Instagram Reels', description: 'Vertical short-form video with caption', icon: '🎞️' },
    { id: 'post', label: 'Feed Post', description: 'Square/landscape video with caption & hashtags', icon: '📸' },
    { id: 'stories', label: 'Stories', description: 'Vertical story clips with swipe-up link', icon: '⏳' },
    { id: 'carousel', label: 'Carousel', description: 'Multi-slide carousel with key takeaways', icon: '🎠' },
  ],
  tiktok: [
    { id: 'video', label: 'TikTok Video', description: 'Vertical video with trending caption', icon: '🎵' },
    { id: 'series', label: 'Series', description: 'Multi-part series with cliffhanger hooks', icon: '📺' },
  ],
  facebook: [
    { id: 'video', label: 'Video Post', description: 'Native video post', icon: '🎥' },
    { id: 'reels', label: 'Facebook Reels', description: 'Short-form vertical video', icon: '🎞️' },
    { id: 'article', label: 'Instant Article', description: 'Long-form article with embedded video', icon: '📰' },
  ],
  threads: [
    { id: 'post', label: 'Thread Post', description: 'Short post with video link', icon: '💬' },
  ],
};

interface PlatformCardProps {
  platform: Platform;
  selected: boolean;
  result?: PublishResult;
  onToggle: (id: string) => void;
  onConnect?: (id: string) => void;
  isConnecting?: boolean;
  selectedFormats?: string[];
  onFormatToggle?: (platformId: string, formatId: string) => void;
}

function PlatformCard({ platform, selected, result, onToggle, onConnect, isConnecting, selectedFormats = [], onFormatToggle }: PlatformCardProps) {
  const Icon = platform.icon;
  const isConnected = platform.connected;
  const formats = PLATFORM_CONTENT_FORMATS[platform.id] || [{ id: 'video', label: 'Video', description: 'Native video post', icon: '🎥' }];
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
        'relative rounded-xl border-2 p-4 transition-all select-none',
        selected
          ? isConnected ? 'border-primary/60 bg-primary/5' : 'border-amber-500/40 bg-amber-500/5'
          : 'border-border/40 bg-card/50 hover:border-border',
        result && statusColors[result.status],
        !isConnected && 'opacity-70',
      )}
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

      <div className="flex items-start gap-3 pr-20 cursor-pointer" onClick={() => onToggle(platform.id)}>
        <div className={cn(
          'p-2 rounded-lg border mt-0.5',
          selected && isConnected ? 'border-primary/40 bg-primary/10' : 'border-border/40 bg-muted/30',
        )}>
          <Icon className={cn('w-5 h-5', platform.colorClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-0.5">{platform.name}</div>
          <div className="text-xs text-muted-foreground leading-tight">{platform.description}</div>
        </div>
      </div>

      {/* Content format options — shown when platform is selected */}
      {selected && (
        <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Content Formats</div>
          {formats.map(fmt => {
            const isActive = selectedFormats.includes(fmt.id);
            return (
              <div
                key={fmt.id}
                className={cn(
                  'flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all',
                  isActive
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-transparent hover:border-border/40 hover:bg-muted/20',
                )}
                onClick={() => onFormatToggle?.(platform.id, fmt.id)}
              >
                <Checkbox checked={isActive} className="pointer-events-none" />
                <span className="text-sm">{fmt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{fmt.label}</div>
                  <div className="text-[10px] text-muted-foreground">{fmt.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

function ThumbnailPackSection({ sessionThumbnails = [], videoUrl, castProjectId }: { sessionThumbnails?: string[]; videoUrl?: string; castProjectId?: string }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [thumbnailResults, setThumbnailResults] = useState<string[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const thumbCacheLoaded = useRef(false);

  // Load cached thumbnails from DB on mount
  useEffect(() => {
    if (!castProjectId || thumbCacheLoaded.current) return;
    thumbCacheLoaded.current = true;
    loadPublishHubCache(castProjectId).then(cache => {
      if (cache?.thumbnailResults?.length) {
        setThumbnailResults(cache.thumbnailResults);
        setGenerated(true);
      } else if (sessionThumbnails.length > 0) {
        // Bootstrap from session/DB thumbnails (e.g. cast_projects.thumbnail_url)
        const validUrls = sessionThumbnails.filter(u => u && u.startsWith('http'));
        if (validUrls.length > 0) {
          setThumbnailResults(validUrls);
          setGenerated(true);
        }
      }
    });
  }, [castProjectId, sessionThumbnails]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const sourceUrl = videoUrl || sessionThumbnails?.[0];
      if (!sourceUrl) {
        toast.error('No video available — complete assembly first');
        return;
      }
      // Extract real video frames via RunPod FFmpeg (replaces AI image generation)
      const { data, error } = await supabase.functions.invoke('genie-cast-timeline-submit', {
        body: {
          action: 'generate_thumbnails',
          sourceVideoUrl: sourceUrl,
          timestamps: [10, 30, 60],
          sizes: [
            { label: 'youtube', w: 1280, h: 720 },
            { label: 'linkedin', w: 1200, h: 627 },
            { label: 'tiktok', w: 1080, h: 1920 },
          ],
          castProjectId,
        },
      });
      if (error) throw error;

      if (data?.success === false) {
        setGenError(data?.message || 'Thumbnail generation failed');
        toast.error(data?.message || 'No thumbnails returned');
        setGenerated(true);
        return;
      }

      // Group thumbnails by timestamp — each timestamp yields one URL per size label
      const thumbs: Array<{ timestamp: number; label: string; thumbnailUrl: string }> = data?.thumbnails || [];
      // Collect unique URLs (prefer youtube-sized frames for the gallery)
      const urls: string[] = [];
      const seen = new Set<number>();
      for (const t of thumbs) {
        if (t.thumbnailUrl && t.thumbnailUrl.startsWith('http') && !seen.has(t.timestamp)) {
          urls.push(t.thumbnailUrl);
          seen.add(t.timestamp);
        }
      }

      if (urls.length > 0) {
        setThumbnailResults(urls);
        if (castProjectId) savePublishHubCache(castProjectId, { thumbnailResults: urls });
        toast.success(`${urls.length} thumbnail(s) extracted from video frames`);
      } else {
        setGenError('RunPod returned no valid thumbnail URLs');
        toast.error('No valid thumbnails returned');
      }
      setGenerated(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setGenError(msg);
      toast.error('Thumbnail generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (thumbId: string, index: number) => {
    // Use generated URL if available, otherwise fall back to session thumbnail
    const url = thumbnailResults[index] || sessionThumbnails?.[index];
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `thumbnail-${thumbId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      toast.error('Thumbnail not yet generated');
    }
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
              {/* Thumbnail preview — show generated image or placeholder */}
              <div className="w-24 h-14 rounded-md bg-gradient-to-br from-primary/30 via-violet-500/20 to-pink-500/30 border border-border/40 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                {(thumbnailResults[i] || sessionThumbnails?.[i]) ? (
                  <img src={thumbnailResults[i] || sessionThumbnails[i]} alt={`Variant ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Film className="w-6 h-6 text-primary/60" />
                    <div className="absolute bottom-1 left-1 right-1 text-[8px] text-center text-primary/80 font-bold leading-tight">
                      {thumb.text}
                    </div>
                  </>
                )}
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
                      onClick={() => handleDownload(`${thumb.id}-youtube`, i)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      YT
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleDownload(`${thumb.id}-linkedin`, i)}
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
              onClick={() => {
                const allUrls = [...thumbnailResults, ...sessionThumbnails].filter(u => u && u.startsWith('http'));
                if (allUrls.length === 0) { toast.error('No thumbnails available'); return; }
                allUrls.forEach((url, idx) => {
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `thumbnail-${idx + 1}.jpg`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                });
                toast.success(`Downloading ${allUrls.length} thumbnails…`);
              }}
            >
              <Download className="w-4 h-4" />
              Download All ({thumbnailResults.length || sessionThumbnails.length || 0})
            </Button>
          )}
        </div>

        {/* Generated thumbnails gallery */}
        {thumbnailResults.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {thumbnailResults.map((url, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-primary/20 aspect-video">
                <img src={url} alt={`Generated thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {genError && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
            <p className="text-[10px] text-amber-600 dark:text-amber-400">{genError}</p>
          </div>
        )}
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

/** Parse timestamp string like "0:00–0:30" or "14:30–15:00" into start/end seconds */
function parseClipTimestamp(ts: string): { start: number; end: number } {
  const parts = ts.split('–');
  if (parts.length !== 2) return { start: 0, end: 30 };
  const toSec = (t: string) => {
    const segs = t.trim().split(':').map(Number);
    return (segs[0] || 0) * 60 + (segs[1] || 0);
  };
  return { start: toSec(parts[0]), end: toSec(parts[1]) };
}

function TeaserClipsSection({ dbClips, sourceVideoUrl, castProjectId }: { dbClips?: SocialClipData[]; sourceVideoUrl?: string; castProjectId?: string }) {
  // Use DB-sourced clips when available, otherwise fall back to config
  const effectiveClips: SocialClip[] = React.useMemo(() => {
    if (dbClips && dbClips.length > 0) {
      return dbClips.map(dc => ({
        id: dc.clipId,
        category: dc.category as ClipCategory,
        theme: dc.theme as 'human_ai' | 'practical' | 'democratization' | 'entertainment',
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
  const [clipUrls, setClipUrls] = useState<Record<string, string>>({});
  const [expandedClip, setExpandedClip] = useState<string | null>(null);
  const cacheLoaded = useRef(false);

  // Load cached clip URLs from DB on mount
  useEffect(() => {
    if (!castProjectId || cacheLoaded.current) return;
    cacheLoaded.current = true;
    loadPublishHubCache(castProjectId).then(cache => {
      if (cache?.clipUrls && Object.keys(cache.clipUrls).length > 0) {
        setClipUrls(cache.clipUrls);
        setReadyClips(cache.readyClips || Object.keys(cache.clipUrls));
      }
    });
  }, [castProjectId]);

  // Save clip URLs to DB after generation
  const persistClips = useCallback((urls: Record<string, string>, ready: string[]) => {
    if (!castProjectId) return;
    savePublishHubCache(castProjectId, { clipUrls: urls, readyClips: ready });
  }, [castProjectId]);

  const toggleClip = (id: string) => {
    setSelectedClips(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);
  };

  const [clipErrors, setClipErrors] = useState<Record<string, string>>({});

  const handleGenerateClip = async (clipId: string) => {
    const clip = effectiveClips.find(c => c.id === clipId);
    if (!sourceVideoUrl && !clip?.videoUrl) {
      toast.error('No video available — complete assembly first');
      return;
    }
    setGeneratingClips(p => [...p, clipId]);
    setClipErrors(prev => { const n = { ...prev }; delete n[clipId]; return n; });
    try {
      const { start, end } = parseClipTimestamp(clip?.timestamp || '0:00–0:30');

      const { data, error } = await supabase.functions.invoke('magic-clips-generator', {
        body: {
          sourceVideoUrl: clip?.videoUrl || sourceVideoUrl || '',
          castProjectId: castProjectId || undefined,
          clips: [{ id: clipId, start, end, label: clip?.hook || clipId }],
          mode: 'batch',
          enableLoudnorm: true,
        },
      });
      if (error) throw error;

      if (data?.success === false) {
        const errMsg = data?.error || data?.message || 'Generation service unavailable';
        setClipErrors(prev => ({ ...prev, [clipId]: errMsg }));
        toast.error(`Clip ${clipId}: ${errMsg}`);
        return;
      }

      // Find matching clip in results
      const resultClip = data?.clips?.find((c: any) => c.platformId === clipId) || data?.clips?.[0];
      const clipUrl = resultClip?.clipUrl || '';

      if (clipUrl && clipUrl.startsWith('http')) {
        const newUrls = { ...clipUrls, [clipId]: clipUrl };
        const newReady = readyClips.includes(clipId) ? readyClips : [...readyClips, clipId];
        setClipUrls(newUrls);
        setReadyClips(newReady);
        persistClips(newUrls, newReady);
        toast.success(`Clip ready: ${clipId}`);
      } else {
        setClipErrors(prev => ({ ...prev, [clipId]: resultClip?.error || 'No clip URL returned' }));
        toast.error(`Clip ${clipId}: No URL returned`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setClipErrors(prev => ({ ...prev, [clipId]: msg }));
      toast.error(`Clip generation failed: ${clipId}`);
    } finally {
      setGeneratingClips(p => p.filter(c => c !== clipId));
    }
  };

  const handleGenerateAll = async () => {
    if (!sourceVideoUrl) {
      toast.error('No video available — complete assembly first');
      return;
    }

    // Batch all clips into one RunPod extract_clips job
    const allClipParams = effectiveClips.map(clip => {
      const { start, end } = parseClipTimestamp(clip.timestamp);
      return { id: clip.id, start, end, label: clip.hook || clip.id };
    });

    setGeneratingClips(effectiveClips.map(c => c.id));
    setClipErrors({});

    try {
      const { data, error } = await supabase.functions.invoke('magic-clips-generator', {
        body: {
          sourceVideoUrl,
          castProjectId: castProjectId || undefined,
          clips: allClipParams,
          mode: 'batch',
          enableLoudnorm: true,
        },
      });
      if (error) throw error;

      if (data?.success === false && (!data?.clips || data.clips.length === 0)) {
        const errMsg = data?.error || 'Batch clip generation failed';
        toast.error(errMsg);
        effectiveClips.forEach(c => setClipErrors(prev => ({ ...prev, [c.id]: errMsg })));
        return;
      }

      // Map results back to clip IDs
      const resultClips: Array<{ platformId: string; clipUrl: string; error?: string }> = data?.clips || [];
      let successCount = 0;
      const batchUrls: Record<string, string> = { ...clipUrls };
      const batchReady: string[] = [...readyClips];

      for (const rc of resultClips) {
        const clipId = rc.platformId;
        if (rc.clipUrl && rc.clipUrl.startsWith('http')) {
          batchUrls[clipId] = rc.clipUrl;
          if (!batchReady.includes(clipId)) batchReady.push(clipId);
          successCount++;
        } else {
          setClipErrors(prev => ({ ...prev, [clipId]: rc.error || 'No URL returned' }));
        }
      }

      setClipUrls(batchUrls);
      setReadyClips(batchReady);
      if (successCount > 0) persistClips(batchUrls, batchReady);
      toast.success(`${successCount}/${effectiveClips.length} clips extracted via RunPod`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Batch generation failed: ${msg}`);
      effectiveClips.forEach(c => setClipErrors(prev => ({ ...prev, [c.id]: msg })));
    } finally {
      setGeneratingClips([]);
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
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold">
                              {clip.id}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {clip.timestamp} · {clip.duration}s
                            </Badge>
                            {clip.platforms.map(p => (
                              <Badge key={p} variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                                {p.replace('youtube_shorts', 'YT').replace('linkedin', 'LI').replace('tiktok', 'TT').replace('instagram', 'IG').replace('twitter', 'X')}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                            {clip.hook}
                          </p>
                          {clip.cta && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              CTA: {clip.cta}
                            </p>
                          )}
                          {clip.hashtags && clip.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {clip.hashtags.slice(0, 5).map(h => (
                                <span key={h} className="text-[9px] text-primary/70">{h}</span>
                              ))}
                              {clip.hashtags.length > 5 && <span className="text-[9px] text-muted-foreground">+{clip.hashtags.length - 5}</span>}
                            </div>
                          )}
                          {/* Per-platform messaging toggle */}
                          <button
                            onClick={() => setExpandedClip(isExpanded ? null : clip.id)}
                            className="text-[10px] text-primary hover:underline mt-1"
                          >
                            {isExpanded ? 'Hide platform details' : 'Show platform details'}
                          </button>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          {isReady ? (
                            <>
                              <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40 border px-2 py-0.5">
                                <CheckCircle className="w-2.5 h-2.5 mr-1" />
                                Ready
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2"
                                  onClick={() => {
                                    const url = clipUrls[clip.id];
                                    if (url) window.open(url, '_blank');
                                    else toast.error('Clip URL not available');
                                  }}
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Watch
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2"
                                  onClick={() => {
                                    const url = clipUrls[clip.id];
                                    if (url) {
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `${clip.id}.mp4`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                    } else {
                                      toast.error('Clip URL not available — try regenerating');
                                    }
                                  }}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  MP4
                                </Button>
                              </div>
                            </>
                          ) : isGenerating ? (
                            <Badge variant="outline" className="text-[10px] text-primary border-primary/40 animate-pulse px-2 py-0.5">
                              <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                              Cutting…
                            </Badge>
                          ) : clipErrors[clip.id] ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                                <AlertCircle className="w-2.5 h-2.5 mr-1" />
                                Failed
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 gap-1"
                                onClick={() => handleGenerateClip(clip.id)}
                              >
                                <RefreshCw className="w-3 h-3" /> Retry
                              </Button>
                            </div>
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

                      {/* Clip video preview */}
                      {isReady && clipUrls[clip.id] && (
                        <div className="ml-9 mt-1 mb-2 rounded-lg overflow-hidden border border-primary/20">
                          <video src={clipUrls[clip.id]} controls className="w-full max-h-[200px]" preload="metadata" />
                        </div>
                      )}

                      {/* Error details */}
                      {clipErrors[clip.id] && !isReady && (
                        <div className="ml-9 mt-1 mb-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40">
                          <p className="text-[10px] text-red-600 dark:text-red-400">{clipErrors[clip.id]}</p>
                        </div>
                      )}

                      {/* Per-platform messaging — expanded details with copy buttons */}
                      {isExpanded && (
                        <div className="ml-9 mt-1 mb-2 p-3 rounded-lg border border-border/30 bg-muted/5 space-y-3">
                          {clipUrls[clip.id] && (
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground pb-1 border-b border-border/20">
                              <Film className="w-3 h-3" />
                              <span className="flex-1 truncate font-medium text-foreground/80">{extractFilename(clipUrls[clip.id])}</span>
                              <Button
                                size="sm" variant="ghost" className="h-5 px-1.5 text-[9px] gap-0.5"
                                onClick={() => { navigator.clipboard.writeText(clipUrls[clip.id]); toast.success('Clip URL copied'); }}
                              >
                                <Copy className="w-2.5 h-2.5" /> Copy URL
                              </Button>
                              <a href={clipUrls[clip.id]} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[9px] gap-0.5" asChild>
                                  <span><ExternalLink className="w-2.5 h-2.5" /> Open</span>
                                </Button>
                              </a>
                            </div>
                          )}
                          {Object.entries(clip.messaging).map(([platform, msg]) => {
                            const msgText = 'text' in msg ? msg.text : 'caption' in msg ? msg.caption : 'title' in msg ? `${msg.title}\n${msg.description}` : '';
                            const msgHashtags = 'hashtags' in msg ? (msg as { hashtags?: string[] }).hashtags : undefined;
                            return (
                              <div key={platform} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {platform}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 px-1.5 text-[9px] gap-0.5"
                                    onClick={() => {
                                      const full = `${msgText}${msgHashtags?.length ? '\n\n' + msgHashtags.join(' ') : ''}`;
                                      navigator.clipboard.writeText(full);
                                      toast.success(`${platform} copy copied`);
                                    }}
                                  >
                                    <Copy className="w-2.5 h-2.5" /> Copy
                                  </Button>
                                </div>
                                <p className="text-[11px] text-foreground/80 whitespace-pre-line leading-relaxed">
                                  {msgText}
                                </p>
                                {msgHashtags && msgHashtags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {msgHashtags.map(h => (
                                      <span key={h} className="text-[9px] text-primary/70">{h}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
              onClick={() => {
                const available = readyClips.filter(id => clipUrls[id]);
                if (available.length === 0) { toast.error('No clip URLs available'); return; }
                available.forEach(id => {
                  const a = document.createElement('a');
                  a.href = clipUrls[id];
                  a.download = `${id}.mp4`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                });
                toast.success(`Downloading ${available.length} clips…`);
              }}
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

function DownloadSection({ videoUrl, castProjectId }: { videoUrl?: string; castProjectId?: string }) {
  const dlManager = useStreamingDownload();
  const downloads = [
    { presetId: 'mp4_4k', label: 'Full Video (MP4 · 4K)', icon: Video, size: '~2.4 GB', quality: 'cinematic' },
    { presetId: 'mp4_1080p', label: 'Full Video (MP4 · 1080p)', icon: Video, size: '~680 MB', quality: 'production' },
    { presetId: 'audio_mp3', label: 'Audio Only (MP3 · 320kbps)', icon: Music2, size: '~145 MB', quality: 'audio' },
    { presetId: 'srt_captions', label: 'Transcript (SRT · subtitles)', icon: FileText, size: '~42 KB', quality: 'text' },
    { presetId: 'thumbnail_zip', label: 'Thumbnail Pack (ZIP · all variants)', icon: ImageIcon, size: '~18 MB', quality: 'images' },
  ];

  const handleDownload = async (presetId: string, label: string) => {
    const preset = VIDEO_DOWNLOAD_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    if (!videoUrl) {
      toast.error('No video available — complete assembly first');
      return;
    }

    const filename = `genie-cast-${presetId.replace(/_/g, '-')}.${preset.format}`;

    // Source 1080p MP4 — download directly (no transcoding needed)
    if (presetId === 'mp4_1080p') {
      dlManager.startDownload(videoUrl, presetId, filename);
      return;
    }

    // Transcoded formats — invoke RunPod post-production via edge function
    if (['mp4_4k', 'mp4_720p', 'webm_1080p', 'mov_4k'].includes(presetId)) {
      toast.info(`Transcoding to ${label}… This may take a few minutes.`);
      const { data } = await supabase.functions.invoke('genie-cast-timeline-submit', {
        body: { action: 'platform_resize', sourceVideoUrl: videoUrl, preset: presetId, castProjectId },
      });
      if (data?.videoUrl) {
        dlManager.startDownload(data.videoUrl, presetId, filename);
      } else {
        toast.error(`Transcoding failed for ${label}`);
      }
      return;
    }

    // Audio extraction
    if (['audio_mp3', 'audio_wav'].includes(presetId)) {
      toast.info(`Extracting audio…`);
      const { data } = await supabase.functions.invoke('genie-cast-timeline-submit', {
        body: { action: 'extract_audio', sourceVideoUrl: videoUrl, format: preset.format },
      });
      if (data?.audioUrl) {
        dlManager.startDownload(data.audioUrl, presetId, filename);
      } else {
        toast.error('Audio extraction failed');
      }
      return;
    }

    // Default: direct download of source
    dlManager.startDownload(videoUrl, presetId, filename);
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
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleDownload(item.presetId, item.label)}
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                      {item.presetId === 'mp4_1080p' && videoUrl && (
                        <a href={videoUrl} download={`genie-cast-1080p.mp4`} className="inline-flex">
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" asChild>
                            <span>
                              <ExternalLink className="w-3 h-3" />
                              Direct
                            </span>
                          </Button>
                        </a>
                      )}
                    </>
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

        {/* Source video URL info */}
        <div className="mt-3 pt-3 border-t">
          {videoUrl ? (
            <div className="flex items-center gap-2 text-[10px]">
              <Video className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate flex-1" title={videoUrl}>
                Source: <span className="font-medium text-foreground/80">{extractFilename(videoUrl)}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[9px] gap-0.5"
                onClick={() => { navigator.clipboard.writeText(videoUrl); toast.success('Video URL copied'); }}
              >
                <Copy className="w-2.5 h-2.5" /> Copy URL
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[9px] gap-0.5"
                onClick={() => window.open(videoUrl, '_blank')}
              >
                <ExternalLink className="w-2.5 h-2.5" /> Open
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Complete PRODUCE phase first to enable downloads</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SOCIAL COPY SECTION — AI-generated platform-specific writeups
// ──────────────────────────────────────────────────────────────────────────────

interface SocialCopyItem { platform: string; format: string; text: string; hashtags: string[] }

type AIProvider = 'claude' | 'gpt' | 'gemini';
const AI_PROVIDERS: { id: AIProvider; label: string; model: string; provider: string }[] = [
  { id: 'claude', label: 'Claude', model: 'claude-sonnet-4-6', provider: 'claude' },
  { id: 'gpt', label: 'GPT-4o', model: 'gpt-4o', provider: 'openai' },
  { id: 'gemini', label: 'Gemini', model: 'gemini-2.5-flash', provider: 'gemini' },
];

function SocialCopySection({ sessionTitle, sessionDescription, videoUrl, castProjectId }: { sessionTitle?: string; sessionDescription?: string; videoUrl?: string; castProjectId?: string }) {
  const [copies, setCopies] = useState<SocialCopyItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAI, setSelectedAI] = useState<AIProvider>('claude');
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const copyCacheLoaded = useRef(false);

  // Load cached social copies from DB on mount
  useEffect(() => {
    if (!castProjectId || copyCacheLoaded.current) return;
    copyCacheLoaded.current = true;
    loadPublishHubCache(castProjectId).then(cache => {
      if (cache?.socialCopies?.length) setCopies(cache.socialCopies);
    });
  }, [castProjectId]);

  const videoLink = videoUrl || '[VIDEO_URL]';

  const PROMPT = `Generate comprehensive social media publish content for a video.
Title: "${sessionTitle || 'Untitled'}"
Description: ${sessionDescription || 'N/A'}
Video URL: ${videoLink}

Return a JSON array with exactly 6 objects (one per platform). Each object: { "platform": string, "format": string, "text": string, "hashtags": string[] }

1. LinkedIn Article (format: "article") — 600-800 word professional thought-leadership article. Include a compelling headline, 3-4 sections with subheadings, data points, insights, and a CTA linking to the video. Embed the video URL naturally in the text.

2. YouTube Description (format: "description") — 300-400 word SEO-optimized description. Include: hook paragraph, key takeaways with timestamps (00:00 format), links section, about section, and 15+ SEO keywords naturally woven in. Include video URL for cross-promotion.

3. Twitter/X Thread (format: "thread") — 5-tweet thread. First tweet is the hook (under 280 chars). Tweets 2-4 deliver key insights. Tweet 5 is CTA with video link. Separate each tweet with "---". Use the video URL in the last tweet.

4. Instagram Caption (format: "caption") — 150-200 word engaging caption with emoji, line breaks for readability, storytelling hook, value proposition, and CTA. Add 20 hashtags.

5. TikTok Caption (format: "caption") — Under 150 characters, hook-first, trending format. Include video URL.

6. LinkedIn Post (format: "post") — 200-300 word short-form post for feed. Professional but engaging. Include the video URL. Different from the article — this is a quick-read teaser.

Return ONLY the JSON array, no markdown fences.`;

  const handleGenerate = async () => {
    if (!sessionTitle && !sessionDescription) { toast.error('Add a title or description first'); return; }
    setIsGenerating(true);
    try {
      let raw = '';
      if (selectedAI === 'claude') {
        const { data, error } = await supabase.functions.invoke('chat-with-claude', {
          body: {
            messages: [
              { role: 'system', content: 'You are an expert social media strategist and copywriter. Return valid JSON only.' },
              { role: 'user', content: PROMPT },
            ],
            max_tokens: 6000,
          },
        });
        if (error) throw error;
        raw = data?.content || '';
      } else {
        const providerCfg = AI_PROVIDERS.find(p => p.id === selectedAI)!;
        const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: providerCfg.provider,
            model: providerCfg.model,
            prompt: PROMPT,
            systemPrompt: 'You are an expert social media strategist and copywriter. Return valid JSON only.',
            maxTokens: 6000,
          },
        });
        if (error) throw error;
        raw = data?.content || '';
      }
      const parsed: SocialCopyItem[] = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
      setCopies(parsed);
      if (castProjectId) savePublishHubCache(castProjectId, { socialCopies: parsed });
      toast.success(`Social copy generated via ${AI_PROVIDERS.find(p => p.id === selectedAI)?.label} — ${parsed.length} platforms`);
    } catch (e) {
      toast.error(`Failed to generate copy: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(`${text}\n\n${copies.find(c => c.platform === platform)?.hashtags.map(h => `#${h}`).join(' ') || ''}`);
    toast.success(`${platform} copy copied`);
  };

  const copyAll = () => {
    const all = copies.map(c => `=== ${c.platform} (${c.format}) ===\n\n${c.text}\n\n${c.hashtags.map(h => `#${h}`).join(' ')}`).join('\n\n' + '─'.repeat(50) + '\n\n');
    navigator.clipboard.writeText(all);
    toast.success('Full publish package copied');
  };

  const formatBadgeColor = (format: string) => {
    switch (format) {
      case 'article': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'description': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'thread': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'caption': return 'bg-pink-500/20 text-pink-400 border-pink-500/40';
      case 'post': return 'bg-blue-600/20 text-blue-300 border-blue-600/40';
      default: return '';
    }
  };

  const downloadPlatformCopy = (c: SocialCopyItem) => {
    const fullText = `${c.text}\n\n${c.hashtags.length > 0 ? c.hashtags.map(h => `#${h}`).join(' ') : ''}`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.platform.toLowerCase().replace(/[\s/]+/g, '-')}-${c.format}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const all = copies.map(c => `${'═'.repeat(60)}\n${c.platform.toUpperCase()} — ${c.format.toUpperCase()}\n${'═'.repeat(60)}\n\n${c.text}\n\n${c.hashtags.length > 0 ? 'HASHTAGS: ' + c.hashtags.map(h => `#${h}`).join(' ') : ''}`).join('\n\n\n');
    const blob = new Blob([all], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social-copy-all-platforms.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const platformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return '💼';
      case 'youtube': return '▶️';
      case 'twitter/x': case 'twitter': return '🐦';
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'facebook': return '📘';
      default: return '📝';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Social Copy & Articles
            </CardTitle>
            <CardDescription className="text-xs">AI-generated writeups — LinkedIn articles, YouTube SEO, Twitter threads, captions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border/40 overflow-hidden">
              {AI_PROVIDERS.map(p => (
                <button key={p.id} onClick={() => setSelectedAI(p.id)} className={cn('px-2 py-1 text-[10px] font-medium transition-colors', selectedAI === p.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50 text-muted-foreground')}>
                  {p.label}
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isGenerating} className="gap-2 text-xs">
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {copies.length ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {copies.length > 0 && (
        <CardContent className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={copyAll}>
              <Copy className="w-3 h-3" /> Copy All
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={downloadAll}>
              <Download className="w-3 h-3" /> Download All
            </Button>
          </div>
          {copies.map((c) => {
            const isExpanded = expandedPlatform === c.platform;
            const wordCount = c.text.split(/\s+/).length;
            const charCount = c.text.length;
            return (
              <div key={c.platform} className="rounded-lg border bg-muted/30 overflow-hidden">
                {/* Header — always visible */}
                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpandedPlatform(isExpanded ? null : c.platform)}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{platformIcon(c.platform)}</span>
                    <Badge variant="outline" className="text-xs font-semibold">{c.platform}</Badge>
                    <Badge className={cn('text-[10px] border px-1.5 py-0', formatBadgeColor(c.format))}>{c.format}</Badge>
                    <span className="text-[10px] text-muted-foreground">{wordCount} words · {charCount} chars</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={(e) => { e.stopPropagation(); copyToClipboard(c.text, c.platform); }}>
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={(e) => { e.stopPropagation(); downloadPlatformCopy(c); }}>
                      <Download className="w-3 h-3" /> .txt
                    </Button>
                    <RefreshCw className={cn('w-3 h-3 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                </div>

                {/* Content — always shown, full text when expanded */}
                <div className="px-3 pb-3 space-y-2">
                  {isExpanded ? (
                    <div className="border-t border-border/30 pt-2">
                      <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">{c.text}</div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{c.text}</p>
                  )}
                  {c.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {c.hashtags.map(h => <Badge key={h} variant="secondary" className="text-[10px]">#{h}</Badge>)}
                    </div>
                  )}
                  {videoUrl && isExpanded && (
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground">
                      <Video className="w-3 h-3" />
                      <span className="truncate flex-1 font-medium text-foreground/80">{extractFilename(videoUrl)}</span>
                      <Button
                        size="sm" variant="ghost" className="h-5 px-1.5 text-[9px] gap-0.5"
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(videoUrl); toast.success('Video URL copied'); }}
                      >
                        <Copy className="w-2.5 h-2.5" /> Copy URL
                      </Button>
                      <a href={videoUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[9px] gap-0.5" asChild>
                          <span><ExternalLink className="w-2.5 h-2.5" /> Open</span>
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SMART SHORTS SECTION — AI-analyzed highlight clips via shorts-generator
// ──────────────────────────────────────────────────────────────────────────────

interface ShortSuggestion { id: string; type: string; start: number; end: number; duration: number; score: number; caption: string }
interface GeneratedShort { id: string; url: string; thumbnailUrl?: string; duration: number }

function SmartShortsSection({ sourceVideoUrl, castProjectId }: { sourceVideoUrl?: string; castProjectId?: string }) {
  const [suggestions, setSuggestions] = useState<ShortSuggestion[]>([]);
  const [generated, setGenerated] = useState<GeneratedShort[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const shortsCacheLoaded = useRef(false);

  // Load cached shorts from DB on mount
  useEffect(() => {
    if (!castProjectId || shortsCacheLoaded.current) return;
    shortsCacheLoaded.current = true;
    loadPublishHubCache(castProjectId).then(cache => {
      if (cache?.generatedShorts?.length) setGenerated(cache.generatedShorts);
    });
  }, [castProjectId]);

  const handleAnalyze = async () => {
    if (!sourceVideoUrl) { toast.error('No video available — complete assembly first'); return; }
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('shorts-generator', {
        body: { action: 'analyze', sourceVideoUrl, platform: 'all' },
      });
      if (error) throw error;
      const clips = data?.suggestedClips || data?.suggestions || data?.clips || [];
      setSuggestions(clips.map((c: Record<string, unknown>, i: number) => ({
        id: (c.id as string) || `short-${i}`,
        type: (c.type as string) || 'highlight',
        start: (c.startTime as number) || (c.start as number) || 0,
        end: (c.endTime as number) || (c.end as number) || 0,
        duration: (c.duration as number) || 0,
        score: (c.score as number) || (c.viralPotential as number) || 0,
        caption: (c.suggestedCaption as string) || (c.caption as string) || (c.transcript as string) || '',
      })));
      toast.success(`Found ${clips.length} potential shorts`);
    } catch {
      toast.error('Video analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!sourceVideoUrl || suggestions.length === 0) return;
    setIsGenerating(true);
    try {
      // Call magic-clips-generator directly (→ RunPod FFmpeg) instead of chaining through shorts-generator
      const clipParams = suggestions.map(s => ({
        id: s.id,
        start: s.start,
        end: s.end,
        label: s.caption || `Short ${s.id}`,
      }));

      const { data, error } = await supabase.functions.invoke('magic-clips-generator', {
        body: {
          sourceVideoUrl,
          castProjectId: castProjectId || undefined,
          clips: clipParams,
          mode: 'batch',
          enableLoudnorm: true,
        },
      });
      if (error) throw error;

      const resultClips = data?.clips || [];
      const shorts = resultClips.map((c: Record<string, unknown>, i: number) => ({
        id: (c.platformId as string) || (c.id as string) || `gen-${i}`,
        url: (c.clipUrl as string) || '',
        thumbnailUrl: c.thumbnailUrl as string | undefined,
        duration: (c.duration as number) || 0,
      }));
      setGenerated(shorts);
      if (castProjectId && shorts.length > 0) savePublishHubCache(castProjectId, { generatedShorts: shorts });

      const successCount = resultClips.filter((c: any) => c.clipUrl && (c.clipUrl as string).startsWith('http')).length;
      toast.success(`Generated ${successCount}/${suggestions.length} shorts via RunPod`);
    } catch {
      toast.error('Shorts generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Smart Shorts
            </CardTitle>
            <CardDescription className="text-xs">AI-detected highlight moments → vertical Shorts/Reels</CardDescription>
          </div>
          <div className="flex gap-2">
            {suggestions.length > 0 && (
              <Button size="sm" variant="default" onClick={handleGenerate} disabled={isGenerating} className="gap-2 text-xs">
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                Generate ({suggestions.length})
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2 text-xs">
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Analyze Video
            </Button>
          </div>
        </div>
      </CardHeader>
      {(suggestions.length > 0 || generated.length > 0) && (
        <CardContent className="space-y-3">
          {suggestions.length > 0 && generated.length === 0 && (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={s.id || i} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                  <Badge variant="outline" className="text-[10px] shrink-0">{s.type}</Badge>
                  <span className="text-xs flex-1 truncate">{s.caption}</span>
                  <span className="text-[10px] text-muted-foreground">{s.duration}s</span>
                  <Badge className="text-[10px]">{s.score > 1 ? s.score : Math.round(s.score * 100)}%</Badge>
                </div>
              ))}
            </div>
          )}
          {generated.length > 0 && (
            <div className="space-y-3">
              {generated.map((g, i) => (
                <div key={g.id || i} className="rounded-lg border bg-muted/30 overflow-hidden">
                  <div className="flex items-center gap-3 p-2">
                    <Play className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs flex-1">Short #{i + 1} · {g.duration}s</span>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={() => window.open(g.url, '_blank')}>
                      <ExternalLink className="w-3 h-3" /> Watch
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" asChild>
                      <a href={g.url} download><Download className="w-3 h-3" /> Save</a>
                    </Button>
                  </div>
                  {g.url && g.url.startsWith('http') && (
                    <video src={g.url} controls className="w-full max-h-[300px]" preload="metadata" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
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
  targetPlatformIds,
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

  // ─── DB fallback for video URL and thumbnail (survives page refresh) ──
  const [dbVideoUrl, setDbVideoUrl] = useState<string | null>(null);
  const [dbThumbnailUrl, setDbThumbnailUrl] = useState<string | null>(null);
  const dbFallbackLoaded = useRef(false);

  useEffect(() => {
    if (!projectId || dbFallbackLoaded.current) return;
    dbFallbackLoaded.current = true;
    supabase
      .from('cast_projects')
      .select('final_video_url, thumbnail_url')
      .eq('id', projectId)
      .single()
      .then(({ data }) => {
        if (data?.final_video_url) setDbVideoUrl(data.final_video_url);
        if (data?.thumbnail_url) setDbThumbnailUrl(data.thumbnail_url);
      });
  }, [projectId]);

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
  const defaultPlatforms = targetPlatformIds?.length ? targetPlatformIds : primaryPlatform ? [primaryPlatform] : ['youtube', 'linkedin'];

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(defaultPlatforms);
  const [publishTitle, setPublishTitle] = useState(defaultTitle);
  const [publishDescription, setPublishDescription] = useState(defaultDescription);
  const [publishResults, setPublishResults] = useState<Record<string, PublishResult>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTab, setPublishTab] = useState('platforms');
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);

  // Per-platform content format selections (e.g., { youtube: ['video', 'shorts', 'description'], linkedin: ['article', 'post'] })
  const [platformFormats, setPlatformFormats] = useState<Record<string, string[]>>(() => {
    // Default: select 'video' format for all platforms
    const defaults: Record<string, string[]> = {};
    defaultPlatforms.forEach(p => { defaults[p] = ['video']; });
    return defaults;
  });

  const handleFormatToggle = useCallback((platformId: string, formatId: string) => {
    setPlatformFormats(prev => {
      const current = prev[platformId] || [];
      const next = current.includes(formatId) ? current.filter(f => f !== formatId) : [...current, formatId];
      return { ...prev, [platformId]: next };
    });
  }, []);

  // Derive session context for display — with DB + storage fallbacks for page-refresh resilience
  const hasSessionContext = !!(sessionTitle || productionArtifacts || dbVideoUrl);
  const sessionVideoUrl = productionArtifacts?.assembledVideoUrl || dbVideoUrl || null;

  // Dynamic thumbnail discovery from Supabase Storage (no hardcoded naming)
  const [discoveredThumbnails, setDiscoveredThumbnails] = useState<string[]>([]);
  const thumbnailDiscoveryRef = useRef(false);
  useEffect(() => {
    if (thumbnailDiscoveryRef.current || !projectId) return;
    // Only run discovery if we don't already have thumbnails from props or DB
    const hasThumbs = (productionArtifacts?.thumbnailUrls?.length ?? 0) > 0 || !!dbThumbnailUrl;
    if (hasThumbs) return;
    thumbnailDiscoveryRef.current = true;
    (async () => {
      try {
        const [partsListing, rendersListing] = await Promise.all([
          supabase.storage.from('cast-assets').list(projectId, { limit: 200 }),
          supabase.storage.from('cast-renders').list(projectId, { limit: 200 }),
        ]);
        const allFiles = [
          ...(partsListing.data || []).map(f => ({ ...f, bucket: 'cast-assets' })),
          ...(rendersListing.data || []).map(f => ({ ...f, bucket: 'cast-renders' })),
        ];
        const thumbFiles = allFiles.filter(f =>
          f.name.endsWith('_thumb.jpg') || f.name.endsWith('_thumb.png') || f.name.endsWith('_thumb.jpeg')
        );
        if (thumbFiles.length > 0) {
          const urls = thumbFiles.map(f => {
            const { data: { publicUrl } } = supabase.storage.from(f.bucket).getPublicUrl(`${projectId}/${f.name}`);
            return publicUrl;
          });
          console.log(`[PublishHub Thumbnail Discovery] Found ${urls.length} thumbnails from storage`);
          setDiscoveredThumbnails(urls);
        }
      } catch (err) {
        console.warn('[PublishHub Thumbnail Discovery] Storage listing failed:', err);
      }
    })();
  }, [projectId, productionArtifacts, dbThumbnailUrl, supabase]);

  const sessionThumbnails = (() => {
    // Priority 1: productionArtifacts from parent component (live session)
    if (productionArtifacts?.thumbnailUrls?.length) return productionArtifacts.thumbnailUrls;
    // Priority 2: DB field (cast_projects.thumbnail_url, set by genie-cast-status)
    if (dbThumbnailUrl) return [dbThumbnailUrl];
    // Priority 3: Dynamic storage discovery (lists actual files in storage buckets)
    if (discoveredThumbnails.length > 0) return discoveredThumbnails;
    return [];
  })();

  const togglePlatform = useCallback((id: string) => {
    const platform = PLATFORMS.find(p => p.id === id);
    if (!platform?.connected) {
      const intentUrl = getShareIntentUrl(id, '', '', '');
      if (intentUrl) {
        toast.info(`${platform?.name} not connected — "Share via Link" will be available after publish`);
      } else {
        toast.info(`${platform?.name} requires OAuth connection for publishing`);
      }
    }
    setSelectedPlatforms(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      lsCast.capturePlatformSelection(next, PLATFORMS.length);
      return next;
    });
  }, [PLATFORMS, lsCast]);

  const copyLink = () => {
    const shareUrl = projectId
      ? `${window.location.origin}/genie-cast/share/${projectId}`
      : sessionVideoUrl || 'https://youtu.be/ep04-demo-link';
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  const handleEnhanceDescription = async () => {
    if (!publishDescription.trim()) { toast.error('Write a description first'); return; }
    setIsEnhancingDesc(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-claude', {
        body: {
          messages: [
            { role: 'system', content: 'You are a social media copywriter specializing in video content optimization.' },
            { role: 'user', content: `Rewrite this video description for maximum SEO and engagement on YouTube/LinkedIn. Keep it under 300 words, add relevant keywords, include a compelling hook, and end with a clear CTA. Return ONLY the rewritten description, no explanation.\n\nOriginal:\n${publishDescription}` },
          ],
        },
      });
      if (error) throw error;
      const enhanced = data?.content;
      if (enhanced) { setPublishDescription(enhanced); toast.success('Description enhanced'); }
      else throw new Error('No response from AI');
    } catch {
      toast.error('Failed to enhance description');
    } finally {
      setIsEnhancingDesc(false);
    }
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

    // Publish to each platform — connected via API, unconnected via share intent
    for (const platformId of selectedPlatforms) {
      const platform = PLATFORMS.find(p => p.id === platformId);
      const isConnected = platform?.connected;

      // Unconnected platform — generate share intent URL instead of calling API
      if (!isConnected) {
        const intentUrl = getShareIntentUrl(platformId, videoUrl, publishTitle, publishDescription);
        if (intentUrl) {
          setPublishResults(p => ({
            ...p,
            [platformId]: {
              platformId,
              status: 'failed',
              progress: 100,
              url: intentUrl,
              error: 'Not connected — use Share via Link',
            },
          }));
          lsCast.capturePublishAction({
            platform: platformId,
            success: false,
            publishType: 'immediate',
            errorMessage: 'Share via intent link (not connected)',
          });
        } else {
          setPublishResults(p => ({
            ...p,
            [platformId]: {
              platformId,
              status: 'failed',
              progress: 100,
              error: `${platform?.name} requires OAuth connection for publishing`,
            },
          }));
        }
        continue;
      }

      setPublishResults(p => ({
        ...p,
        [platformId]: { ...p[platformId], status: 'uploading', progress: 30 },
      }));

      try {
        const { data, error } = await supabase.functions.invoke('social-publish', {
          body: {
            platform: platformId,
            contentType: 'video',
            mediaUrl: videoUrl,
            caption: publishDescription || sessionDescription || publishTitle || 'Check out this video!',
            metadata: {
              title: publishTitle || sessionTitle || 'Genie Cast Video',
              description: publishDescription || sessionDescription || '',
              thumbnailUrl: sessionThumbnails?.[0] || undefined,
              visibility: 'public',
            },
            hashtags: [],
          },
        });

        if (error) throw error;

        const publishUrl = data?.postUrl || data?.url || data?.videoUrl;
        const needsConnection = data?.metadata?.requiresConnection === true;
        const success = data?.success !== false && !needsConnection;

        // If API says "requires connection", generate share intent as fallback
        if (!success && needsConnection) {
          const intentUrl = getShareIntentUrl(platformId, videoUrl, publishTitle, publishDescription);
          setPublishResults(p => ({
            ...p,
            [platformId]: {
              ...p[platformId],
              status: 'failed',
              progress: 100,
              url: intentUrl || undefined,
              error: 'Not connected — use Share via Link',
            },
          }));
          continue;
        }

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
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="platforms" className="text-xs gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            Publish
          </TabsTrigger>
          <TabsTrigger value="content" className="text-xs gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Content
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
          {/* Video preview */}
          {sessionVideoUrl ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  Video Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden border border-border/40">
                  <video src={sessionVideoUrl} controls className="w-full max-h-[360px]" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-600">No video available</p>
                  <p className="text-xs text-muted-foreground">Complete assembly in the PRODUCE phase to enable publishing, clips, and downloads.</p>
                </div>
              </CardContent>
            </Card>
          )}

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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={handleEnhanceDescription} disabled={isEnhancingDesc}>
                    {isEnhancingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Enhance with AI
                  </Button>
                </div>
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
                  selectedFormats={platformFormats[platform.id] || []}
                  onFormatToggle={handleFormatToggle}
                />
              ))}
            </div>
          </div>

          {/* Publish button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {selectedPlatforms.length > 0
                ? `Publishing to: ${selectedPlatforms.map(id => {
                    const name = PLATFORMS.find(p => p.id === id)?.name;
                    const fmts = platformFormats[id] || [];
                    const fmtLabels = fmts.map(f => (PLATFORM_CONTENT_FORMATS[id] || []).find(x => x.id === f)?.label).filter(Boolean);
                    return fmtLabels.length > 0 ? `${name} (${fmtLabels.join(', ')})` : name;
                  }).filter(Boolean).join(' · ')}`
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
                        {result.status === 'failed' && result.url && (
                          <a href={result.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-500/40 text-amber-500 hover:bg-amber-500/10">
                              <ExternalLink className="w-3 h-3" />
                              Share via Link
                            </Button>
                          </a>
                        )}
                        {result.status === 'failed' && !result.url && (
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

        {/* CONTENT TAB — AI-generated articles, descriptions, threads, captions */}
        <TabsContent value="content" className="mt-4 space-y-4">
          {/* Selected format summary */}
          {Object.entries(platformFormats).some(([, fmts]) => fmts.length > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Selected Content Formats
                </CardTitle>
                <CardDescription className="text-xs">Content will be generated for these formats when you click "Generate" below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(platformFormats).map(([platformId, fmts]) => {
                    const platform = PLATFORMS.find(p => p.id === platformId);
                    if (!platform || fmts.length === 0) return null;
                    const allFormats = PLATFORM_CONTENT_FORMATS[platformId] || [];
                    return fmts.map(fmtId => {
                      const fmt = allFormats.find(f => f.id === fmtId);
                      if (!fmt) return null;
                      return (
                        <Badge key={`${platformId}-${fmtId}`} variant="outline" className="text-xs gap-1 px-2 py-1">
                          <span>{fmt.icon}</span>
                          <span className="font-medium">{platform.name}</span>
                          <span className="text-muted-foreground">· {fmt.label}</span>
                        </Badge>
                      );
                    });
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Social Copy Generator */}
          <SocialCopySection sessionTitle={publishTitle} sessionDescription={publishDescription} videoUrl={sessionVideoUrl} castProjectId={projectId || undefined} />

          {/* Quick content tips */}
          <Card className="border-border/30">
            <CardContent className="p-4">
              <div className="text-xs font-medium mb-2">Platform Best Practices</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div className="flex gap-2"><span>📰</span><span><b>LinkedIn Article:</b> 600-800 words, thought-leadership, 3-4 sections with subheads</span></div>
                <div className="flex gap-2"><span>📝</span><span><b>YouTube SEO:</b> Hook paragraph, timestamps, 15+ keywords, links section</span></div>
                <div className="flex gap-2"><span>🧵</span><span><b>Twitter Thread:</b> 5 tweets, first is hook (&lt;280 chars), last is CTA with link</span></div>
                <div className="flex gap-2"><span>📸</span><span><b>Instagram:</b> Storytelling hook, 20 hashtags, line breaks for readability</span></div>
                <div className="flex gap-2"><span>🎵</span><span><b>TikTok:</b> Under 150 chars, hook-first, trending format</span></div>
                <div className="flex gap-2"><span>📧</span><span><b>Newsletter:</b> Subject line + preview text + 3 key takeaways + CTA</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLIPS TAB */}
        <TabsContent value="clips" className="mt-4 space-y-4">
          <TeaserClipsSection dbClips={dbProject.isSeeded ? dbProject.socialClips : undefined} sourceVideoUrl={sessionVideoUrl} castProjectId={projectId || undefined} />
          <SmartShortsSection sourceVideoUrl={sessionVideoUrl} castProjectId={projectId || undefined} />
        </TabsContent>

        {/* THUMBNAILS TAB */}
        <TabsContent value="thumbnails" className="mt-4">
          <ThumbnailPackSection sessionThumbnails={sessionThumbnails} videoUrl={sessionVideoUrl} castProjectId={projectId || undefined} />
        </TabsContent>

        {/* DOWNLOAD TAB */}
        <TabsContent value="download" className="mt-4">
          <DownloadSection videoUrl={sessionVideoUrl} castProjectId={projectId || undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EP04PublishHub;
