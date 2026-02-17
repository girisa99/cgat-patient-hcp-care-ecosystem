/**
 * CONTENT LIBRARY
 * 
 * View, manage, and update existing generated content:
 * - Browse all saved compositions
 * - Filter by status, region, language
 * - Video playback and preview
 * - Schedule and publish status tracking
 * - Edit/Update existing content
 * - Re-publish to new destinations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Filter, Eye, Edit, Trash2, 
  MoreVertical, Play, Download, Share2, Globe,
  Video, User, Box, Layers, Pause,
  Clock, CheckCircle, Loader2, Calendar,
  MapPin, Languages, ExternalLink, Volume2, VolumeX,
  AlertCircle, AlertTriangle, ArrowLeft, Sparkles, Wand2, Scissors
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { PublishingDestination, CompositionElementType } from './types';

interface ContentLibraryProps {
  onEdit?: (compositionId: string) => void;
  onCreateNew?: () => void;
}

// Enhanced content item from landing_page_videos
interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  region: string;
  language_code: string;
  language_name: string;
  industry: string | null;
  content_type: string;
  placement: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  duration_seconds: number | null;
  ai_confidence: number;
  generation_pipeline: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  created_by: string | null;
  // New generation status fields
  generation_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  generation_error?: string | null;
  generation_started_at?: string | null;
}

// Region display names
const REGION_LABELS: Record<string, string> = {
  'NAM': 'North America',
  'EUR': 'Europe',
  'MENA': 'Middle East & North Africa',
  'IND': 'India',
  'APAC': 'Asia Pacific',
  'LATAM': 'Latin America',
  'AFR': 'Africa',
  'CJK': 'China/Japan/Korea',
};

const getElementIcon = (type: CompositionElementType) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4" />;
    case 'avatar': return <User className="w-4 h-4" />;
    case '3d': return <Box className="w-4 h-4" />;
    case 'animation': return <Layers className="w-4 h-4" />;
    default: return <Video className="w-4 h-4" />;
  }
};

// Detect seed/sample data vs real AI-generated content
const isSeedData = (item: ContentItem): boolean => {
  // Sample video URLs from Google or stock images from Unsplash indicate seed data
  const sampleVideoPatterns = [
    'gtv-videos-bucket',
    'sample/',
    'BigBuckBunny',
    'ElephantsDream',
    'Sintel',
    'ForBigger',
  ];
  const sampleImagePatterns = [
    'unsplash.com',
    'placeholder',
    'picsum.photos',
  ];
  
  const hasSampleVideo = sampleVideoPatterns.some(p => item.video_url?.includes(p));
  const hasSampleImage = sampleImagePatterns.some(p => item.thumbnail_url?.includes(p));
  
  return hasSampleVideo || hasSampleImage;
};

const getStatusBadge = (item: ContentItem) => {
  // Show generation status first for Genie Cast generated content
  if (item.generation_status === 'pending') {
    return (
      <Badge className="bg-yellow-500/20 border-yellow-500/30 text-yellow-600">
        <Clock className="w-3 h-3 mr-1 animate-pulse" /> Pending Generation
      </Badge>
    );
  }
  if (item.generation_status === 'processing') {
    return (
      <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-600">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing...
      </Badge>
    );
  }
  if (item.generation_status === 'failed') {
    return (
      <Badge className="bg-destructive/20 border-destructive/30 text-destructive">
        <AlertCircle className="w-3 h-3 mr-1" /> Failed
      </Badge>
    );
  }
  // Show seed data indicator
  if (isSeedData(item)) {
    return (
      <Badge className="bg-amber-500/20 border-amber-500/30 text-amber-600">
        <AlertCircle className="w-3 h-3 mr-1" /> Sample Data
      </Badge>
    );
  }
  if (item.published_at) {
    return (
      <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-600">
        <CheckCircle className="w-3 h-3 mr-1" /> Published
      </Badge>
    );
  }
  // Check if video is generated successfully
  if (item.generation_status === 'completed') {
    return (
      <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-600">
        <CheckCircle className="w-3 h-3 mr-1" /> Ready
      </Badge>
    );
  }
  if (item.is_active) {
    return (
      <Badge className="bg-primary/20 border-primary/30 text-primary">
        <Clock className="w-3 h-3 mr-1" /> Active
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <Edit className="w-3 h-3 mr-1" /> Draft
    </Badge>
  );
};

const getPlatformIcon = (destination: PublishingDestination) => {
  switch (destination) {
    case 'youtube': return <Share2 className="w-4 h-4 text-destructive" />;
    case 'linkedin':
    case 'linkedin_company': return <Share2 className="w-4 h-4 text-primary" />;
    case 'facebook': return <Share2 className="w-4 h-4 text-primary" />;
    case 'instagram': return <Share2 className="w-4 h-4 text-accent-foreground" />;
    case 'twitter': return <Share2 className="w-4 h-4 text-primary" />;
    case 'landing_page':
    case 'website': return <Globe className="w-4 h-4 text-primary" />;
    default: return <Share2 className="w-4 h-4" />;
  }
};

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ContentLibrary: React.FC<ContentLibraryProps> = ({
  onEdit,
  onCreateNew,
}) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeDialogTab, setActiveDialogTab] = useState<string>('details');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Magic clips handler - generate platform-specific clips
  const handleGenerateMagicClips = async (item: ContentItem) => {
    if (!item.video_url || item.generation_status !== 'completed') {
      toast.error('Video must be fully generated before creating magic clips');
      return;
    }

    toast.info('Generating Magic Clips for all platforms...', {
      description: 'AI is creating optimized versions for YouTube Shorts, TikTok, Instagram, LinkedIn, Twitter, and Facebook'
    });

    try {
      const { data, error } = await supabase.functions.invoke('magic-clips-generator', {
        body: {
          sourceVideoUrl: item.video_url,
          sourceVideoId: item.id,
          platforms: ['youtube_shorts', 'tiktok', 'instagram_reels', 'linkedin', 'twitter', 'facebook'],
          mode: 'auto',
          language: item.language_code,
          addCaptions: true,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.success) {
        const completed = data.completedClips || 0;
        const total = data.totalClips || 6;
        toast.success(`Magic Clips generated!`, {
          description: `${completed}/${total} platform-specific clips created`
        });
      } else {
        toast.warning('Some clips are pending', {
          description: data?.message || 'Video assembly is being processed in the background'
        });
      }
    } catch (err) {
      console.error('Magic clips error:', err);
      toast.error('Failed to generate magic clips', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  // Single clip generation handler
  const handleGenerateSingleClip = async (item: ContentItem, platformId: string) => {
    if (!item.video_url || item.generation_status !== 'completed') {
      toast.error('Video must be fully generated before creating clips');
      return;
    }

    toast.info(`Generating clip for ${platformId}...`);

    try {
      const { data, error } = await supabase.functions.invoke('magic-clips-generator', {
        body: {
          sourceVideoUrl: item.video_url,
          sourceVideoId: item.id,
          platforms: [platformId],
          mode: 'auto',
          language: item.language_code,
          addCaptions: true,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.success && data.clips?.[0]?.status === 'completed') {
        toast.success(`${platformId} clip ready!`, {
          description: 'Clip is available for publishing'
        });
      } else {
        toast.info(`${platformId} clip is being processed`, {
          description: 'Check back in a few minutes'
        });
      }
    } catch (err) {
      console.error('Single clip error:', err);
      toast.error(`Failed to generate ${platformId} clip`);
    }
  };

  // Get unique regions and languages for filters
  const uniqueRegions = [...new Set(content.map(c => c.region))];
  const uniqueLanguages = [...new Set(content.map(c => c.language_code))];
  const languageNames = content.reduce((acc, c) => {
    acc[c.language_code] = c.language_name;
    return acc;
  }, {} as Record<string, string>);

  // Fetch content from both landing_page_videos AND composition_projects
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        // Fetch from landing_page_videos (legacy)
        const { data: landingData, error: landingError } = await supabase
          .from('landing_page_videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (landingError) {
          console.error('Error fetching landing_page_videos:', landingError);
        }

        // Also fetch from composition_projects with chapters
        const { data: projectsData, error: projectsError } = await supabase
          .from('composition_projects')
          .select(`
            *,
            composition_chapters (*)
          `)
          .order('updated_at', { ascending: false });

        if (projectsError) {
          console.error('Error fetching composition_projects:', projectsError);
        }

        // Convert composition_projects to ContentItem format
        const projectItems: ContentItem[] = [];
        for (const project of projectsData || []) {
          const chapters = (project as any).composition_chapters || [];
          for (const chapter of chapters) {
            if (chapter.video_url || chapter.preview_url) {
              projectItems.push({
                id: `project-${project.id}-${chapter.id}`,
                title: `${project.name} - ${chapter.title}`,
                description: chapter.script_content?.substring(0, 500) || `Chapter: ${chapter.title}`,
                video_url: chapter.video_url || chapter.preview_url || '',
                thumbnail_url: chapter.preview_url || null,
                region: getRegionFromLang(project.primary_language),
                language_code: project.primary_language,
                language_name: getLanguageNameFromCode(project.primary_language),
                industry: chapter.visual_types?.[0] || 'general',
                content_type: chapter.visual_types?.[0] || 'video',
                placement: 'studio',
                display_order: chapter.chapter_order || 0,
                is_active: true,
                is_featured: false,
                view_count: 0,
                duration_seconds: chapter.duration || 30,
                ai_confidence: chapter.video_confidence_score || 85,
                generation_pipeline: 'composition_studio',
                created_at: chapter.created_at || project.created_at,
                updated_at: chapter.updated_at || project.updated_at,
                published_at: null,
                created_by: project.user_id,
              });
            }
          }
        }

        // Combine both sources, preferring newer items first
        const combined = [...(landingData || []), ...projectItems]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setContent(combined as ContentItem[]);
      } catch (err) {
        console.error('Error fetching content:', err);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Helper functions for language/region mapping
  const getRegionFromLang = (langCode: string): string => {
    const regionMap: Record<string, string> = {
      'en': 'NAM', 'en-US': 'NAM', 'en-GB': 'EUR',
      'ar': 'MENA', 'ar-SA': 'MENA', 'ar-AE': 'MENA',
      'hi': 'IND', 'te': 'IND', 'kn': 'IND', 'ta': 'IND', 'mr': 'IND', 'bn': 'IND',
      'zh': 'CJK', 'ja': 'CJK', 'ko': 'CJK',
      'de': 'EUR', 'fr': 'EUR', 'es': 'EUR', 'it': 'EUR', 'pt': 'EUR',
    };
    return regionMap[langCode] || 'NAM';
  };

  const getLanguageNameFromCode = (langCode: string): string => {
    const nameMap: Record<string, string> = {
      'en': 'English', 'en-US': 'English (US)', 'en-GB': 'English (UK)',
      'ar': 'Arabic', 'ar-SA': 'Arabic (Saudi)', 'ar-AE': 'Arabic (UAE)',
      'hi': 'Hindi', 'te': 'Telugu', 'kn': 'Kannada', 'ta': 'Tamil', 'mr': 'Marathi', 'bn': 'Bengali',
      'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
      'de': 'German', 'fr': 'French', 'es': 'Spanish', 'it': 'Italian', 'pt': 'Portuguese',
    };
    return nameMap[langCode] || langCode;
  };

  // Filter content
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Enhanced status filter with generation_status support
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'completed') {
      matchesStatus = item.generation_status === 'completed';
    } else if (statusFilter === 'pending') {
      matchesStatus = item.generation_status === 'pending';
    } else if (statusFilter === 'processing') {
      matchesStatus = item.generation_status === 'processing';
    } else if (statusFilter === 'failed') {
      matchesStatus = item.generation_status === 'failed';
    } else if (statusFilter === 'published') {
      matchesStatus = !!item.published_at;
    } else if (statusFilter === 'active') {
      matchesStatus = item.is_active && !item.published_at;
    }
    
    const matchesRegion = regionFilter === 'all' || item.region === regionFilter;
    const matchesLanguage = languageFilter === 'all' || item.language_code === languageFilter;
    
    return matchesSearch && matchesStatus && matchesRegion && matchesLanguage;
  });

  const handleDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      const { error } = await supabase
        .from('landing_page_videos')
        .delete()
        .eq('id', contentToDelete.id);

      if (error) throw error;

      setContent(prev => prev.filter(c => c.id !== contentToDelete.id));
      toast.success('Content deleted');
      setIsDeleteDialogOpen(false);
      setContentToDelete(null);
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete');
    }
  };

  const handlePreview = (item: ContentItem) => {
    setSelectedContent(item);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Stats
  const publishedCount = content.filter(c => c.published_at).length;
  const activeCount = content.filter(c => c.is_active).length;
  const sampleDataCount = content.filter(c => isSeedData(c)).length;

  // Delete all sample data
  const handleDeleteSampleData = async () => {
    const sampleItems = content.filter(c => isSeedData(c));
    if (sampleItems.length === 0) {
      toast.info('No sample data to delete');
      return;
    }
    
    try {
      const ids = sampleItems.map(c => c.id);
      const { error } = await supabase
        .from('landing_page_videos')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setContent(prev => prev.filter(c => !isSeedData(c)));
      toast.success(`Deleted ${sampleItems.length} sample items`);
    } catch (err) {
      console.error('Error deleting sample data:', err);
      toast.error('Failed to delete sample data');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sample Data Warning */}
      {sampleDataCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                {sampleDataCount} sample item{sampleDataCount > 1 ? 's' : ''} detected
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                These are placeholder videos with stock images (not AI-generated content)
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDeleteSampleData}>
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Sample Data
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Library</h3>
          <p className="text-sm text-muted-foreground">
            {content.length} items · {publishedCount} published · {activeCount} active
            {sampleDataCount > 0 && ` · ${sampleDataCount} sample`}
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Layers className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">✅ Completed</SelectItem>
            <SelectItem value="pending">⏳ Pending</SelectItem>
            <SelectItem value="processing">🔄 Processing</SelectItem>
            <SelectItem value="failed">❌ Failed</SelectItem>
            <SelectItem value="published">📢 Published</SelectItem>
            <SelectItem value="active">🟢 Active</SelectItem>
          </SelectContent>
        </Select>

        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-44">
            <MapPin className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {uniqueRegions.map(region => (
              <SelectItem key={region} value={region}>
                {REGION_LABELS[region] || region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-40">
            <Languages className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {uniqueLanguages.map(lang => (
              <SelectItem key={lang} value={lang}>
                {languageNames[lang] || lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredContent.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No content found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || regionFilter !== 'all' || languageFilter !== 'all'
                ? 'Try adjusting your filters' 
                : 'Create your first content to get started'}
            </p>
            <Button onClick={onCreateNew}>Create Content</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <Card 
              key={item.id} 
              className="group hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handlePreview(item)}
            >
              {/* Thumbnail with Play overlay */}
              <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                {/* Background gradient - always present */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
                
                {/* Thumbnail image with fallback */}
                {item.thumbnail_url && item.thumbnail_url.startsWith('http') ? (
                  <img 
                    src={item.thumbnail_url} 
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      // Hide broken image, show fallback
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                
                {/* Fallback video icon - shows through if no image */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center shadow-lg">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                
                {/* Play button overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="lg" variant="secondary" className="rounded-full w-12 h-12 shadow-lg">
                    <Play className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Featured badge - top left */}
                {item.is_featured && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-accent text-accent-foreground text-xs">Featured</Badge>
                  </div>
                )}
                
                {/* Status badge - top right */}
                <div className="absolute top-2 right-2 z-10">
                  {getStatusBadge(item)}
                </div>
                
                {/* Duration badge - bottom right */}
                {item.duration_seconds && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono z-10">
                    {formatDuration(item.duration_seconds)}
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.description || 'No description'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePreview(item); }}>
                        <Play className="w-4 h-4 mr-2" />
                        Play Video
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(item.id); }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(item.video_url, '_blank'); }}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContentToDelete(item);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Info chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {REGION_LABELS[item.region] || item.region}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Languages className="w-3 h-3 mr-1" />
                    {item.language_name}
                  </Badge>
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-3">
                    {item.view_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.view_count.toLocaleString()}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {item.placement}
                    </Badge>
                  </div>
                </div>

                {/* Published info */}
                {item.published_at && (
                  <div className="mt-2 pt-2 border-t text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Published {format(new Date(item.published_at), 'MMM d, yyyy')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Preview Dialog - Fixed layout with proper z-index and structure */}
      <Dialog open={!!selectedContent} onOpenChange={() => { setSelectedContent(null); setIsPlaying(false); setActiveDialogTab('details'); }}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          {/* Fixed Header */}
          <DialogHeader className="p-4 pb-2 border-b bg-background">
            <DialogTitle className="flex items-center gap-2 text-base">
              {selectedContent?.title}
              {selectedContent?.is_featured && (
                <Badge className="bg-accent text-accent-foreground">Featured</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="line-clamp-1 text-xs">{selectedContent?.description}</DialogDescription>
          </DialogHeader>
          
          {/* Scrollable Content Area */}
          <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
            {/* Video Player - Fixed aspect ratio container */}
            <div className="relative w-full bg-black" style={{ aspectRatio: '16/9', maxHeight: '400px' }}>
              {/* Pending generation - show status message */}
              {selectedContent?.generation_status === 'pending' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900/30 to-amber-900/30 p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3">
                    <Clock className="w-7 h-7 text-yellow-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Video Processing Pending</h3>
                  <p className="text-xs text-yellow-200/80 max-w-sm mb-3">
                    TTS audio has been generated. Video assembly is being processed via AI providers.
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                      Audio: Ready
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      Video: Assembling
                    </Badge>
                  </div>
                </div>
              ) : selectedContent?.generation_status === 'processing' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-6 text-center">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-3" />
                  <h3 className="text-base font-semibold text-white mb-2">Generating Video...</h3>
                  <p className="text-xs text-blue-200/80 max-w-sm">
                    Video is being assembled from audio and visual assets.
                  </p>
                </div>
              ) : selectedContent?.generation_status === 'failed' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/30 to-rose-900/30 p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Generation Failed</h3>
                  <p className="text-xs text-red-200/80 max-w-sm mb-3">
                    {selectedContent?.generation_error || 'Video generation encountered an error.'}
                  </p>
                  <Button variant="outline" size="sm" className="border-red-500/50 text-red-300 hover:bg-red-500/20">
                    Retry Generation
                  </Button>
                </div>
              ) : selectedContent?.video_url && !selectedContent.video_url.startsWith('composite://') ? (
                <>
                  <video
                    ref={videoRef}
                    src={selectedContent.video_url}
                    poster={selectedContent.thumbnail_url || undefined}
                    className="absolute inset-0 w-full h-full object-contain"
                    onEnded={() => setIsPlaying(false)}
                    onClick={togglePlayback}
                    onError={() => {
                      console.error('Video load error:', selectedContent.video_url);
                      toast.error('Failed to load video. The file may not exist yet.');
                    }}
                  />
                  
                  {/* Video controls overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-3">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20 h-8 w-8"
                        onClick={togglePlayback}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20 h-8 w-8"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <span className="text-white text-xs">
                        {formatDuration(selectedContent.duration_seconds)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
                  <Video className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No video available</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Video may still be processing</p>
                </div>
              )}
            </div>

            {/* Tabs Section - Outside video container to prevent overlap */}
            <div className="p-4 pt-2">
              <Tabs defaultValue="details" value={activeDialogTab} onValueChange={setActiveDialogTab}>
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="publishing">Publishing</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Region</Label>
                      <p className="font-medium flex items-center gap-1 mt-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {REGION_LABELS[selectedContent?.region || ''] || selectedContent?.region}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Language</Label>
                      <p className="font-medium flex items-center gap-1 mt-1 text-sm">
                        <Languages className="w-3 h-3" />
                        {selectedContent?.language_name} ({selectedContent?.language_code})
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Industry</Label>
                      <p className="font-medium mt-1 text-sm">{selectedContent?.industry || 'General'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Content Type</Label>
                      <p className="font-medium mt-1 text-sm">{selectedContent?.content_type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Placement</Label>
                      <p className="font-medium mt-1 text-sm">{selectedContent?.placement}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Pipeline</Label>
                      <p className="font-medium mt-1 text-sm">{selectedContent?.generation_pipeline || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">AI Confidence</Label>
                      <p className="font-medium mt-1 text-sm">{selectedContent?.ai_confidence}%</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Status</Label>
                      <div className="mt-1">{selectedContent && getStatusBadge(selectedContent)}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="publishing" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Created</Label>
                      <p className="font-medium mt-1 text-sm">
                        {selectedContent && format(new Date(selectedContent.created_at), 'PPP p')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Last Updated</Label>
                      <p className="font-medium mt-1 text-sm">
                        {selectedContent && format(new Date(selectedContent.updated_at), 'PPP p')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Published</Label>
                      <p className="font-medium mt-1 text-sm">
                        {selectedContent?.published_at 
                          ? format(new Date(selectedContent.published_at), 'PPP p')
                          : 'Not published yet'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Active Status</Label>
                      <p className="font-medium mt-1 text-sm">
                        {selectedContent?.is_active ? 'Active (Live)' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Magic Clips - AI Auto-generate platform-specific clips */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Magic Clips (AI Auto-generate)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          AI creates optimized short-form clips for each platform
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGenerateMagicClips(selectedContent!)}
                        disabled={!selectedContent?.video_url || selectedContent?.generation_status !== 'completed'}
                        className="gap-1 h-7 text-xs"
                      >
                        <Wand2 className="w-3 h-3" />
                        Generate All
                      </Button>
                    </div>
                    
                    {/* Platform-specific clip options */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { id: 'youtube_shorts', name: 'YouTube Shorts', duration: '60s', aspect: '9:16' },
                        { id: 'tiktok', name: 'TikTok', duration: '30s', aspect: '9:16' },
                        { id: 'instagram_reels', name: 'Instagram Reels', duration: '30s', aspect: '9:16' },
                        { id: 'linkedin', name: 'LinkedIn', duration: '30s', aspect: '16:9' },
                        { id: 'twitter', name: 'Twitter/X', duration: '45s', aspect: '16:9' },
                        { id: 'facebook', name: 'Facebook', duration: '60s', aspect: '16:9' },
                      ].map(platform => (
                        <Card key={platform.id} className="p-2 hover:border-primary/50 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium">{platform.name}</p>
                              <p className="text-[10px] text-muted-foreground">{platform.duration} • {platform.aspect}</p>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6"
                              onClick={() => handleGenerateSingleClip(selectedContent!, platform.id)}
                              disabled={!selectedContent?.video_url || selectedContent?.generation_status !== 'completed'}
                            >
                              <Scissors className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Publish to platforms */}
                  <div className="pt-3 border-t">
                    <Label className="text-muted-foreground text-xs mb-2 block">Publish to Platforms</Label>
                    <div className="flex flex-wrap gap-2">
                      {['landing_page', 'youtube', 'linkedin', 'facebook', 'instagram', 'twitter', 'tiktok'].map(platform => (
                        <Button key={platform} variant="outline" size="sm" className="text-xs h-7">
                          {getPlatformIcon(platform as PublishingDestination)}
                          <span className="ml-1 capitalize">{platform.replace('_', ' ')}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4 mt-0">
                  <div className="grid grid-cols-3 gap-3">
                    <Card>
                      <CardContent className="pt-3 pb-3 text-center">
                        <Eye className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xl font-bold">{selectedContent?.view_count?.toLocaleString() || 0}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-3 pb-3 text-center">
                        <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xl font-bold">{formatDuration(selectedContent?.duration_seconds || 0)}</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-3 pb-3 text-center">
                        <CheckCircle className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xl font-bold">{selectedContent?.display_order}</p>
                        <p className="text-xs text-muted-foreground">Priority</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="p-4 pt-2 border-t bg-background flex-row gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setSelectedContent(null); setIsPlaying(false); setActiveDialogTab('details'); }}>
              Close
            </Button>
            {selectedContent?.video_url && (
              <Button variant="outline" size="sm" onClick={() => window.open(selectedContent?.video_url, '_blank')}>
                <ExternalLink className="w-3 h-3 mr-1" />
                Full Screen
              </Button>
            )}
            <Button 
              size="sm"
              onClick={() => {
                // Route based on content source - Genie Cast vs Studio
                const isGenieCast = selectedContent?.generation_pipeline === 'genie-cast-assembler' || 
                                   selectedContent?.placement === 'hero_showcase' ||
                                   !selectedContent?.id.startsWith('project-');
                if (isGenieCast) {
                  // Navigate to Genie Cast tab with the selected content ID
                  setSelectedContent(null);
                  setIsPlaying(false);
                  // Use URL params to navigate to Genie Cast
                  window.location.href = `/genie-cast?edit=${selectedContent?.id}`;
                } else {
                  // For Studio content, call the onEdit handler
                  onEdit?.(selectedContent!.id);
                  setSelectedContent(null);
                }
              }}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{contentToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentLibrary;
