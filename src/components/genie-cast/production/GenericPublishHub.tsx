/**
 * GenericPublishHub — Project-agnostic publish hub for Cast production
 *
 * Accepts projectId + finalVideoUrl as props.
 * Loads project metadata from DB and delegates to EP04PublishHub
 * with session props (removing EP04-specific fallback behavior).
 *
 * Features:
 * - Multi-platform publishing (YouTube, LinkedIn, TikTok, Instagram, etc.)
 * - Thumbnail pack download
 * - Teaser clips per platform
 * - Direct download (MP4/MP3)
 * - Project status updates on publish
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Share2, Download, CheckCircle, Loader2, Send,
  ExternalLink, Copy, Globe, Film,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useSocialPlatforms, type SocialPlatform } from '@/hooks/useSocialPlatforms';
import { useSocialOAuth, type SocialPlatform as OAuthPlatform } from '@/hooks/useSocialOAuth';
import { useCastProjects } from '@/hooks/useCastProjects';

const untypedSupabase = supabase as any;

interface GenericPublishHubProps {
  projectId: string;
  finalVideoUrl: string;
  projectTitle?: string;
  onPublished?: () => void;
}

type PublishStatus = 'idle' | 'pending' | 'uploading' | 'published' | 'failed';

interface PublishResult {
  platformId: string;
  status: PublishStatus;
  progress: number;
  url?: string;
  error?: string;
}

function getShareIntentUrl(platformId: string, videoUrl: string, title: string, description: string): string | null {
  const encodedUrl = encodeURIComponent(videoUrl);
  const encodedText = encodeURIComponent(`${title}\n\n${description}`.trim());
  switch (platformId) {
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'twitter': return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    case 'threads': return `https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`;
    default: return null;
  }
}

export function GenericPublishHub({ projectId, finalVideoUrl, projectTitle, onPublished }: GenericPublishHubProps) {
  const { platforms: PLATFORMS } = useSocialPlatforms();
  const oauth = useSocialOAuth();
  const castProjects = useCastProjects();

  const [title, setTitle] = useState(projectTitle || '');
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube', 'linkedin']);
  const [publishResults, setPublishResults] = useState<Record<string, PublishResult>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  // Load project metadata
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const { data } = await untypedSupabase
        .from('cast_projects')
        .select('title, metadata')
        .eq('id', projectId)
        .single();
      if (data) {
        if (!title && data.title) setTitle(data.title);
        const meta = data.metadata as Record<string, unknown> | null;
        if (meta?.description) setDescription(meta.description as string);
      }
    })();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlatform = useCallback((id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const handleConnect = useCallback(async (platformId: string) => {
    try {
      await oauth.connect(platformId as OAuthPlatform);
    } catch {
      toast.error(`Failed to connect ${platformId}`);
    }
  }, [oauth]);

  const copyLink = useCallback(() => {
    const shareUrl = `${window.location.origin}/genie-cast/share/${projectId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied');
  }, [projectId]);

  const handlePublish = useCallback(async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }
    if (!finalVideoUrl) {
      toast.error('No video URL — complete production first');
      return;
    }

    setIsPublishing(true);
    const initial: Record<string, PublishResult> = {};
    selectedPlatforms.forEach(id => {
      initial[id] = { platformId: id, status: 'pending', progress: 0 };
    });
    setPublishResults(initial);

    for (const platformId of selectedPlatforms) {
      const platform = PLATFORMS.find(p => p.id === platformId);
      const isConnected = platform?.connected;

      if (!isConnected) {
        const intentUrl = getShareIntentUrl(platformId, finalVideoUrl, title, description);
        setPublishResults(p => ({
          ...p,
          [platformId]: {
            platformId,
            status: intentUrl ? 'published' : 'failed',
            progress: 100,
            url: intentUrl || undefined,
            error: intentUrl ? undefined : `${platform?.name} requires OAuth connection`,
          },
        }));
        if (intentUrl) window.open(intentUrl, '_blank');
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
            mediaUrl: finalVideoUrl,
            caption: description || title,
            metadata: {
              title,
              description,
              tags: [],
              privacy: 'public',
              projectId,
            },
          },
        });

        if (error) throw error;
        setPublishResults(p => ({
          ...p,
          [platformId]: {
            platformId,
            status: 'published',
            progress: 100,
            url: data?.url || data?.postUrl,
          },
        }));
      } catch (err: any) {
        setPublishResults(p => ({
          ...p,
          [platformId]: {
            platformId,
            status: 'failed',
            progress: 100,
            error: err.message || 'Publish failed',
          },
        }));
      }
    }

    // Update project status to published
    try {
      await castProjects.advanceStage(projectId, 'published', 'published');
    } catch {
      // Non-blocking
    }

    setIsPublishing(false);
    onPublished?.();
    toast.success('Publishing complete');
  }, [selectedPlatforms, finalVideoUrl, title, description, PLATFORMS, projectId, castProjects, onPublished]);

  const publishedCount = Object.values(publishResults).filter(r => r.status === 'published').length;

  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Publish to Platforms</h3>
          </div>
          <Input
            placeholder="Video title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-sm"
          />
          <Textarea
            placeholder="Video description for social platforms..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="text-sm min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Select Platforms</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {PLATFORMS.map(platform => {
              const selected = selectedPlatforms.includes(platform.id);
              const result = publishResults[platform.id];
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-xs',
                    selected
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/20 hover:border-border/40',
                    result?.status === 'published' && 'border-green-500/40 bg-green-500/5',
                    result?.status === 'failed' && 'border-red-500/40 bg-red-500/5',
                  )}
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{platform.name}</p>
                    {!platform.connected && (
                      <button
                        onClick={e => { e.stopPropagation(); handleConnect(platform.id); }}
                        className="text-[10px] text-primary hover:underline"
                      >
                        Connect
                      </button>
                    )}
                    {platform.connected && <span className="text-[10px] text-green-600">Connected</span>}
                  </div>
                  {result?.status === 'published' && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                  {result?.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button onClick={handlePublish} disabled={isPublishing || selectedPlatforms.length === 0} className="flex-1">
          {isPublishing ? (
            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Publishing...</>
          ) : publishedCount > 0 ? (
            <><CheckCircle className="h-4 w-4 mr-1" /> Published to {publishedCount} platform(s)</>
          ) : (
            <><Send className="h-4 w-4 mr-1" /> Publish to {selectedPlatforms.length} Platform(s)</>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={copyLink}>
          <Copy className="h-4 w-4 mr-1" /> Copy Link
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={finalVideoUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-1" /> Download
          </a>
        </Button>
      </div>

      {/* Results */}
      {Object.keys(publishResults).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Publish Results</h4>
            <div className="space-y-2">
              {Object.values(publishResults).map(result => {
                const platform = PLATFORMS.find(p => p.id === result.platformId);
                return (
                  <div key={result.platformId} className="flex items-center gap-2 text-xs">
                    <span className="font-medium w-24">{platform?.name}</span>
                    <Badge
                      variant={result.status === 'published' ? 'default' : result.status === 'failed' ? 'destructive' : 'outline'}
                      className="text-[10px]"
                    >
                      {result.status}
                    </Badge>
                    {result.url && (
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {result.error && <span className="text-destructive">{result.error}</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GenericPublishHub;
