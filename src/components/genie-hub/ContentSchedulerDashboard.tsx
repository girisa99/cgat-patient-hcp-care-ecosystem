/**
 * CONTENT SCHEDULER DASHBOARD
 *
 * Admin interface for managing scheduled posts across:
 * - 16 parent regions (from MASTER_REGION_GROUPS) with timezone-aware scheduling
 * - 6 platforms (YouTube, LinkedIn, TikTok, Instagram, Twitter, Blog)
 * - Universal Enrichment integration for post optimization
 * - Inline script editing with enrichment context
 * - Post management (edit, reschedule, cancel)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar, Clock, Globe, RefreshCw,
  CheckCircle, AlertCircle, Loader2, Send,
  Pencil, X, Sparkles, HelpCircle, Trash2, CalendarClock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MASTER_REGION_GROUPS, type RegionGroupConfig } from '@/config/regionConfig';
import { useUniversalEnrichment } from '@/hooks/useUniversalEnrichment';

// ─── Derive 16 parent regions from MASTER_REGION_GROUPS (single source of truth) ───
const PARENT_REGIONS = MASTER_REGION_GROUPS.map((group: RegionGroupConfig) => ({
  id: group.parent.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
  name: group.parent,
  icon: group.icon,
  subRegionCount: group.regions.length,
  timezones: group.regions.map(r => r.code),
}));

// Platforms
const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', color: 'bg-red-500' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-foreground' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
  { id: 'twitter', name: 'Twitter', color: 'bg-sky-500' },
  { id: 'blog', name: 'Blog', color: 'bg-emerald-500' },
];

interface SchedulerStatus {
  total: number;
  pending: number;
  processing: number;
  published: number;
  failed: number;
  regions: string[];
}

interface ScheduledPostDB {
  id: string;
  platform: string;
  scheduled_time: string;
  status: string;
  timezone: string | null;
  content_data: any;
  pipeline_id: string | null;
}

export const ContentSchedulerDashboard: React.FC = () => {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [posts, setPosts] = useState<ScheduledPostDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Script edit dialog state
  const [editingPost, setEditingPost] = useState<ScheduledPostDB | null>(null);
  const [editScript, setEditScript] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Universal Enrichment integration
  const { additionalContext, status: enrichmentStatus } = useUniversalEnrichment({
    productName: 'Genie Hub',
  });

  useEffect(() => {
    fetchStatus();
    fetchPosts();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('marketing-daily-scheduler', {
        body: { action: 'status' },
      });
      if (error) throw error;
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('id, platform, scheduled_time, status, timezone, content_data, pipeline_id')
        .gte('scheduled_time', `${today}T00:00:00Z`)
        .order('scheduled_time', { ascending: true })
        .limit(100);

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('marketing-daily-scheduler', {
        body: {
          action: 'schedule',
          enrichmentContext: additionalContext || undefined,
        },
      });
      if (error) throw error;

      toast.success(`Scheduled ${data.postsScheduled} posts across ${data.regions?.length || 0} regions`);
      await fetchStatus();
      await fetchPosts();
    } catch (err) {
      console.error('Failed to generate schedule:', err);
      toast.error('Failed to generate schedule');
    } finally {
      setIsRunning(false);
    }
  };

  const handlePublishPending = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('marketing-daily-scheduler', {
        body: { action: 'publish' },
      });
      if (error) throw error;

      toast.success(`Published ${data.published} posts`);
      await fetchStatus();
      await fetchPosts();
    } catch (err) {
      console.error('Failed to publish:', err);
      toast.error('Failed to publish posts');
    } finally {
      setIsRunning(false);
    }
  };

  // ─── Post Management: Edit ──────────────────────────────────────────
  const openEditDialog = useCallback((post: ScheduledPostDB) => {
    setEditingPost(post);
    setEditTitle(post.content_data?.title || '');
    setEditScript(post.content_data?.script || post.content_data?.body || '');
    setEditTime(post.scheduled_time ? format(new Date(post.scheduled_time), "yyyy-MM-dd'T'HH:mm") : '');
  }, []);

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    setIsSaving(true);
    try {
      const updatedContentData = {
        ...editingPost.content_data,
        title: editTitle,
        script: editScript,
        body: editScript,
        lastEditedAt: new Date().toISOString(),
        enrichmentApplied: !!additionalContext,
      };

      const { error } = await supabase
        .from('scheduled_posts')
        .update({
          content_data: updatedContentData,
          scheduled_time: editTime ? new Date(editTime).toISOString() : editingPost.scheduled_time,
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      toast.success('Post updated successfully');
      setEditingPost(null);
      await fetchPosts();
    } catch (err) {
      console.error('Failed to update post:', err);
      toast.error('Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Post Management: Cancel ────────────────────────────────────────
  const handleCancelPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', postId);

      if (error) throw error;
      toast.success('Post cancelled');
      await fetchPosts();
    } catch (err) {
      console.error('Failed to cancel post:', err);
      toast.error('Failed to cancel post');
    }
  };

  // ─── Enrichment: Apply to script ────────────────────────────────────
  const handleEnrichScript = useCallback(() => {
    if (!additionalContext || !editScript) return;
    const enrichedScript = `${editScript}\n\n---\n[Enrichment Context Applied]\n${additionalContext.slice(0, 500)}`;
    setEditScript(enrichedScript);
    toast.success('Enrichment context applied to script');
  }, [additionalContext, editScript]);

  const getStatusBadge = (postStatus: string) => {
    switch (postStatus) {
      case 'published':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground"><X className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  // Map timezone/region code to parent region
  const getParentRegionFromPost = (post: ScheduledPostDB) => {
    const tz = post.timezone || post.content_data?.region || '';
    const tzLower = tz.toLowerCase();
    return PARENT_REGIONS.find(r =>
      r.id === tzLower ||
      r.timezones.some(t => t.toLowerCase().includes(tzLower)) ||
      r.name.toLowerCase().includes(tzLower)
    );
  };

  const filteredPosts = selectedRegion
    ? posts.filter(p => {
        const parentRegion = getParentRegionFromPost(p);
        return parentRegion?.id === selectedRegion;
      })
    : posts;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Enrichment Status Banner */}
        {enrichmentStatus && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-purple-600 dark:text-purple-400">
              Universal Enrichment:
              {enrichmentStatus.hasBrandContext ? ' Brand' : ''}
              {enrichmentStatus.hasAudienceContext ? ' + Audience' : ''}
              {enrichmentStatus.hasRegionalScript ? ' + Regional' : ''}
              {enrichmentStatus.hasProductKnowledge ? ' + Knowledge' : ''}
              {enrichmentStatus.hasProductContext ? ' + Product' : ''}
              {' '}context active
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-purple-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Enrichment context from brand intelligence, audience frameworks, and regional styles
                is applied when generating and editing scheduled posts.
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{status?.total || posts.length}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{status?.pending || posts.filter(p => p.status === 'pending').length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">{status?.processing || posts.filter(p => p.status === 'processing').length}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">{status?.published || posts.filter(p => p.status === 'published').length}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-destructive">{status?.failed || posts.filter(p => p.status === 'failed').length}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleGenerateSchedule} disabled={isRunning}>
                {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                Generate Today's Schedule
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto-generate posts for all 16 regions with enrichment context</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handlePublishPending} disabled={isRunning}>
                <Send className="w-4 h-4 mr-2" />
                Publish Pending
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dispatch all pending posts to their target platforms</TooltipContent>
          </Tooltip>
          <Button variant="ghost" onClick={() => { fetchStatus(); fetchPosts(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Region Filter — 16 parent regions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              16 Parent Regions
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedRegion === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegion(null)}
            >
              All Regions
            </Button>
            {PARENT_REGIONS.map(region => (
              <Tooltip key={region.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedRegion === region.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    {region.icon} {region.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {region.subRegionCount} sub-regions
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Posts
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Click the edit icon on any pending post to modify its script,
                  reschedule, or apply enrichment context. Published posts are read-only.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              {filteredPosts.length} posts {selectedRegion ? `for ${PARENT_REGIONS.find(r => r.id === selectedRegion)?.name}` : 'across all 16 regions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p>No scheduled posts for today</p>
                <Button variant="link" onClick={handleGenerateSchedule}>
                  Generate schedule
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredPosts.map(post => {
                    const parentRegion = getParentRegionFromPost(post);
                    const platform = PLATFORMS.find(p => p.id === post.platform);
                    const contentTitle = post.content_data?.title || post.pipeline_id || 'Untitled';
                    const canEdit = post.status === 'pending' || post.status === 'failed';

                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30 group"
                      >
                        <div className={`w-2 h-10 rounded-full ${platform?.color || 'bg-muted'}`} />

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{contentTitle}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{parentRegion?.icon || '🌍'} {parentRegion?.name || 'Global'}</span>
                            <span>·</span>
                            <span>{platform?.name || post.platform}</span>
                            <span>·</span>
                            <span>{format(new Date(post.scheduled_time), 'HH:mm')}</span>
                          </div>
                        </div>

                        {/* Post actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(post)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit script & reschedule</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleCancelPost(post.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel post</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>

                        {getStatusBadge(post.status)}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* ─── Edit Post Dialog with Script Editor + Enrichment ──────────── */}
        <Dialog open={!!editingPost} onOpenChange={(open) => { if (!open) setEditingPost(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit Scheduled Post
              </DialogTitle>
              <DialogDescription>
                Modify the script, reschedule, or apply enrichment context before publishing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Post title"
                />
              </div>

              {/* Script Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Script / Body</label>
                  {additionalContext && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-purple-600" onClick={handleEnrichScript}>
                          <Sparkles className="w-3.5 h-3.5" />
                          Apply Enrichment
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Inject brand, audience, and regional enrichment context into this script
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Textarea
                  value={editScript}
                  onChange={e => setEditScript(e.target.value)}
                  placeholder="Post script or body content..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              {/* Reschedule */}
              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Schedule Time
                </label>
                <Input
                  type="datetime-local"
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                />
              </div>

              {/* Enrichment status */}
              {enrichmentStatus && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 px-2 py-1.5 bg-muted/30 rounded">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Enrichment layers:
                  {enrichmentStatus.hasBrandContext && <Badge variant="outline" className="text-[10px] px-1 py-0">Brand</Badge>}
                  {enrichmentStatus.hasAudienceContext && <Badge variant="outline" className="text-[10px] px-1 py-0">Audience</Badge>}
                  {enrichmentStatus.hasRegionalScript && <Badge variant="outline" className="text-[10px] px-1 py-0">Regional</Badge>}
                  {enrichmentStatus.hasProductKnowledge && <Badge variant="outline" className="text-[10px] px-1 py-0">Knowledge</Badge>}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ContentSchedulerDashboard;
