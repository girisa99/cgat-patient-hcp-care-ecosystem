/**
 * CONTENT LIBRARY
 * 
 * View, manage, and update existing generated content:
 * - Browse all saved compositions
 * - Filter by status, date, language
 * - Edit/Update existing content
 * - Re-publish to new destinations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Search, Filter, Eye, Edit, Trash2, 
  MoreVertical, Play, Download, Share2, Globe,
  Video, User, Box, Layers,
  Clock, CheckCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { SavedComposition, PublishingDestination, CompositionElementType } from './types';

interface ContentLibraryProps {
  onEdit?: (compositionId: string) => void;
  onCreateNew?: () => void;
}

const getElementIcon = (type: CompositionElementType) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4" />;
    case 'avatar': return <User className="w-4 h-4" />;
    case '3d': return <Box className="w-4 h-4" />;
    case 'animation': return <Layers className="w-4 h-4" />;
    default: return <Video className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-600"><CheckCircle className="w-3 h-3 mr-1" /> Published</Badge>;
    case 'ready':
      return <Badge className="bg-primary/20 border-primary/30 text-primary"><Clock className="w-3 h-3 mr-1" /> Ready</Badge>;
    case 'in_progress':
      return <Badge className="bg-accent/20 border-accent/30 text-accent-foreground"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating</Badge>;
    case 'draft':
      return <Badge variant="outline"><Edit className="w-3 h-3 mr-1" /> Draft</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
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

export const ContentLibrary: React.FC<ContentLibraryProps> = ({
  onEdit,
  onCreateNew,
}) => {
  const [compositions, setCompositions] = useState<SavedComposition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedComposition, setSelectedComposition] = useState<SavedComposition | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [compositionToDelete, setCompositionToDelete] = useState<SavedComposition | null>(null);

  // Fetch saved compositions
  useEffect(() => {
    const fetchCompositions = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch from landing_page_videos as our content store
        const { data, error } = await supabase
          .from('landing_page_videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to SavedComposition format
        const transformed: SavedComposition[] = (data || []).map((item: any) => ({
          id: item.id,
          name: item.title || 'Untitled',
          description: item.description,
          targetLanguages: [item.language || 'en'],
          primaryLanguage: item.language || 'en',
          resolution: '1080p',
          aspectRatio: '16:9',
          chapters: [],
          globalSettings: {},
          destination: item.destination_type || 'landing_page',
          destinations: item.published_platforms || [],
          placement: item.placement,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at || item.created_at),
          createdBy: item.created_by || '',
          status: item.is_active ? 'published' : 'draft',
          thumbnailUrl: item.thumbnail_url,
          viewCount: item.view_count || 0,
          lastPublished: item.published_at ? new Date(item.published_at) : undefined,
          publishedTo: item.published_platforms,
          publishedUrls: item.published_urls,
        }));

        setCompositions(transformed);
      } catch (err) {
        console.error('Error fetching compositions:', err);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompositions();
  }, []);

  // Filter compositions
  const filteredCompositions = compositions.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!compositionToDelete) return;
    
    try {
      const { error } = await supabase
        .from('landing_page_videos')
        .delete()
        .eq('id', compositionToDelete.id);

      if (error) throw error;

      setCompositions(prev => prev.filter(c => c.id !== compositionToDelete.id));
      toast.success('Content deleted');
      setIsDeleteDialogOpen(false);
      setCompositionToDelete(null);
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete');
    }
  };

  const handlePreview = (composition: SavedComposition) => {
    setSelectedComposition(composition);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Library</h3>
          <p className="text-sm text-muted-foreground">
            {compositions.length} compositions · {compositions.filter(c => c.status === 'published').length} published
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Layers className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search compositions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="in_progress">Generating</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCompositions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No compositions found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first composition to get started'}
            </p>
            <Button onClick={onCreateNew}>Create Composition</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompositions.map((composition) => (
            <Card 
              key={composition.id} 
              className="group hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handlePreview(composition)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                {composition.thumbnailUrl ? (
                  <img 
                    src={composition.thumbnailUrl} 
                    alt={composition.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary">
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
                <div className="absolute top-2 right-2">
                  {getStatusBadge(composition.status)}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{composition.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(composition.createdAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(composition.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePreview(composition)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
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
                          setCompositionToDelete(composition);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Languages */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {composition.targetLanguages.slice(0, 3).map(lang => (
                    <Badge key={lang} variant="secondary" className="text-xs">
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                  {composition.targetLanguages.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{composition.targetLanguages.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Published platforms */}
                {composition.publishedTo && composition.publishedTo.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Published to:</span>
                    <div className="flex gap-1">
                      {composition.publishedTo.map(platform => (
                        <span key={platform}>{getPlatformIcon(platform)}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* View count */}
                {composition.viewCount !== undefined && composition.viewCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Eye className="w-3 h-3" />
                    {composition.viewCount.toLocaleString()} views
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!selectedComposition} onOpenChange={() => setSelectedComposition(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedComposition?.name}</DialogTitle>
            <DialogDescription>{selectedComposition?.description}</DialogDescription>
          </DialogHeader>
          
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {selectedComposition?.thumbnailUrl ? (
              <img 
                src={selectedComposition.thumbnailUrl}
                alt={selectedComposition.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Languages</Label>
              <p>{selectedComposition?.targetLanguages.join(', ')}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Resolution</Label>
              <p>{selectedComposition?.resolution}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">{selectedComposition && getStatusBadge(selectedComposition.status)}</div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedComposition(null)}>
              Close
            </Button>
            <Button onClick={() => {
              onEdit?.(selectedComposition!.id);
              setSelectedComposition(null);
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Composition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Composition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{compositionToDelete?.name}"? This action cannot be undone.
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
