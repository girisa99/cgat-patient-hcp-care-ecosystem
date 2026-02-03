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
  AlertCircle, AlertTriangle
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
  const videoRef = useRef<HTMLVideoElement>(null);

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
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && item.published_at) ||
      (statusFilter === 'active' && item.is_active && !item.published_at) ||
      (statusFilter === 'draft' && !item.is_active);
    
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
          <SelectTrigger className="w-36">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
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
                {item.thumbnail_url ? (
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="lg" variant="secondary" className="rounded-full w-14 h-14">
                    <Play className="w-6 h-6" />
                  </Button>
                </div>
                
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(item)}
                </div>
                
                {/* Duration badge */}
                {item.duration_seconds && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(item.duration_seconds)}
                  </div>
                )}
                
                {/* Featured badge */}
                {item.is_featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-accent text-accent-foreground">Featured</Badge>
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

      {/* Video Preview Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => { setSelectedContent(null); setIsPlaying(false); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedContent?.title}
              {selectedContent?.is_featured && (
                <Badge className="bg-accent text-accent-foreground">Featured</Badge>
              )}
            </DialogTitle>
            <DialogDescription>{selectedContent?.description}</DialogDescription>
          </DialogHeader>
          
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {selectedContent?.video_url ? (
              <>
                <video
                  ref={videoRef}
                  src={selectedContent.video_url}
                  poster={selectedContent.thumbnail_url || undefined}
                  className="w-full h-full object-contain"
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlayback}
                />
                
                {/* Video controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-3">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-white hover:bg-white/20"
                      onClick={togglePlayback}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <span className="text-white text-sm">
                      {formatDuration(selectedContent.duration_seconds)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Metadata Tabs */}
          <Tabs defaultValue="details" className="mt-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="publishing">Publishing</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Region</Label>
                  <p className="font-medium flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {REGION_LABELS[selectedContent?.region || ''] || selectedContent?.region}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Language</Label>
                  <p className="font-medium flex items-center gap-1 mt-1">
                    <Languages className="w-4 h-4" />
                    {selectedContent?.language_name} ({selectedContent?.language_code})
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Industry</Label>
                  <p className="font-medium mt-1">{selectedContent?.industry || 'General'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Content Type</Label>
                  <p className="font-medium mt-1">{selectedContent?.content_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Placement</Label>
                  <p className="font-medium mt-1">{selectedContent?.placement}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Pipeline</Label>
                  <p className="font-medium mt-1">{selectedContent?.generation_pipeline || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">AI Confidence</Label>
                  <p className="font-medium mt-1">{selectedContent?.ai_confidence}%</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="mt-1">{selectedContent && getStatusBadge(selectedContent)}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="publishing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Created</Label>
                  <p className="font-medium mt-1">
                    {selectedContent && format(new Date(selectedContent.created_at), 'PPP p')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Last Updated</Label>
                  <p className="font-medium mt-1">
                    {selectedContent && format(new Date(selectedContent.updated_at), 'PPP p')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Published</Label>
                  <p className="font-medium mt-1">
                    {selectedContent?.published_at 
                      ? format(new Date(selectedContent.published_at), 'PPP p')
                      : 'Not published yet'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Active Status</Label>
                  <p className="font-medium mt-1">
                    {selectedContent?.is_active ? 'Active (Live)' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              {/* Publish to platforms */}
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground text-xs mb-2 block">Publish to Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {['landing_page', 'youtube', 'linkedin', 'facebook', 'instagram', 'twitter', 'tiktok'].map(platform => (
                    <Button key={platform} variant="outline" size="sm" className="text-xs">
                      {getPlatformIcon(platform as PublishingDestination)}
                      <span className="ml-1 capitalize">{platform.replace('_', ' ')}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Eye className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{selectedContent?.view_count?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Clock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{formatDuration(selectedContent?.duration_seconds || 0)}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{selectedContent?.display_order}</p>
                    <p className="text-xs text-muted-foreground">Priority</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { setSelectedContent(null); setIsPlaying(false); }}>
              Close
            </Button>
            <Button variant="outline" onClick={() => window.open(selectedContent?.video_url, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Full Screen
            </Button>
            <Button onClick={() => {
              onEdit?.(selectedContent!.id);
              setSelectedContent(null);
            }}>
              <Edit className="w-4 h-4 mr-2" />
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
