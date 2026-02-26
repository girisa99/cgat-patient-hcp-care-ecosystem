/**
 * ContentLibraryGrid - Video Content Library for Genie Cast
 * 
 * Features:
 * - Video grid with thumbnails
 * - Search and filter by status, language, industry
 * - Status badges (completed, processing, failed)
 * - Quick actions (view, edit, delete, distribute)
 * - Real-time data from landing_page_videos table
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Play,
  Eye,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  Video,
  Clock,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

// ============================================
// TYPES
// ============================================

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  region: string | null;
  language_code: string | null;
  language_name: string | null;
  industry: string | null;
  content_type: string | null;
  placement: string | null;
  display_order: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  view_count: number | null;
  duration_seconds: number | null;
  ai_confidence: number | null;
  generation_pipeline: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  generation_status: string | null;
  generation_error: string | null;
}

type StatusFilter = 'all' | 'completed' | 'processing' | 'pending' | 'failed';
type SortOption = 'newest' | 'oldest' | 'title' | 'views';

interface ContentLibraryGridProps {
  onSelectVideo?: (video: VideoItem) => void;
  onDistribute?: (video: VideoItem) => void;
  className?: string;
}

// ============================================
// STATUS HELPERS
// ============================================

function getStatusConfig(status: string | null) {
  switch (status) {
    case 'completed':
      return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Completed' };
    case 'processing':
      return { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Processing', animate: true };
    case 'pending':
      return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pending' };
    case 'failed':
      return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' };
    default:
      return { icon: Video, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Draft' };
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// VIDEO CARD COMPONENT
// ============================================

interface VideoCardProps {
  video: VideoItem;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDistribute: () => void;
}

function VideoCard({ video, onPlay, onEdit, onDelete, onDistribute }: VideoCardProps) {
  const status = getStatusConfig(video.generation_status);
  const StatusIcon = status.icon;
  
  const placeholderThumb = `https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=225&fit=crop&auto=format`;
  
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 border-border/50">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={video.thumbnail_url || placeholderThumb}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderThumb;
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Button
            size="sm"
            variant="secondary"
            className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
            onClick={onPlay}
            disabled={!video.video_url || video.generation_status !== 'completed'}
          >
            <Play className="w-4 h-4" />
            Play
          </Button>
        </div>
        
        {/* Duration badge */}
        {video.duration_seconds && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
            {formatDuration(video.duration_seconds)}
          </div>
        )}
        
        {/* Status badge */}
        <div className={cn("absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", status.bg, status.color)}>
          <StatusIcon className={cn("w-3 h-3", status.animate && "animate-spin")} />
          {status.label}
        </div>
        
        {/* Featured badge */}
        {video.is_featured && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-primary/90 text-primary-foreground rounded-full text-xs font-medium">
            Featured
          </div>
        )}
      </div>
      
      {/* Content */}
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{video.title}</h3>
            {video.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {video.description}
              </p>
            )}
          </div>
          
          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPlay} disabled={!video.video_url}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDistribute} disabled={video.generation_status !== 'completed'}>
                <Share2 className="w-4 h-4 mr-2" />
                Distribute
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Metadata row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {video.language_name && (
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {video.language_name}
            </div>
          )}
          {video.view_count !== null && video.view_count > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {video.view_count} views
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ContentLibraryGrid({ onSelectVideo, onDistribute, className }: ContentLibraryGridProps) {
  const queryClient = useQueryClient();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  // Preview dialog
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  
  // Fetch videos
  const { data: videos, isLoading, error, refetch } = useQuery({
    queryKey: ['content-library-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as VideoItem[];
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('landing_page_videos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library-videos'] });
      toast.success('Video deleted');
    },
    onError: (err) => {
      toast.error(`Failed to delete: ${err.message}`);
    },
  });
  
  // Get unique languages for filter
  const availableLanguages = useMemo(() => {
    if (!videos) return [];
    const langs = new Set(videos.map(v => v.language_name).filter(Boolean));
    return Array.from(langs).sort();
  }, [videos]);
  
  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    
    let filtered = videos;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query) ||
        v.industry?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.generation_status === statusFilter);
    }
    
    // Language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(v => v.language_name === languageFilter);
    }
    
    // Sort
    switch (sortOption) {
      case 'oldest':
        filtered = [...filtered].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'title':
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'views':
        filtered = [...filtered].sort((a, b) => 
          (b.view_count || 0) - (a.view_count || 0)
        );
        break;
      // 'newest' is default from query
    }
    
    return filtered;
  }, [videos, searchQuery, statusFilter, languageFilter, sortOption]);
  
  // Stats
  const stats = useMemo(() => {
    if (!videos) return { total: 0, completed: 0, processing: 0, failed: 0 };
    return {
      total: videos.length,
      completed: videos.filter(v => v.generation_status === 'completed').length,
      processing: videos.filter(v => v.generation_status === 'processing').length,
      failed: videos.filter(v => v.generation_status === 'failed').length,
    };
  }, [videos]);
  
  // Handlers
  const handlePlay = useCallback((video: VideoItem) => {
    setPreviewVideo(video);
  }, []);
  
  const handleEdit = useCallback((video: VideoItem) => {
    onSelectVideo?.(video);
    toast.info('Opening editor...');
  }, [onSelectVideo]);
  
  const handleDistribute = useCallback((video: VideoItem) => {
    onDistribute?.(video);
  }, [onDistribute]);
  
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-center">
          <XCircle className="w-10 h-10 mx-auto text-destructive mb-3" />
          <p className="text-destructive font-medium">Failed to load content library</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Content Library
          </h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} videos • {stats.completed} ready • {stats.processing} processing
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Language filter */}
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {availableLanguages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort */}
            <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-video" />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium">No videos found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== 'all' || languageFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Generate your first video to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={() => handlePlay(video)}
              onEdit={() => handleEdit(video)}
              onDelete={() => deleteMutation.mutate(video.id)}
              onDistribute={() => handleDistribute(video)}
            />
          ))}
        </div>
      )}
      
      {/* Video Preview Dialog */}
      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{previewVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {previewVideo?.video_url ? (
              <video
                src={previewVideo.video_url}
                controls
                autoPlay
                className="w-full rounded-lg bg-black"
              />
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Video not available</p>
              </div>
            )}
            {previewVideo?.description && (
              <p className="text-sm text-muted-foreground mt-3">{previewVideo.description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContentLibraryGrid;
