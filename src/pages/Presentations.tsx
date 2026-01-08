import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Presentation, Plus, Search, Grid, List, Eye, Download, 
  Share2, Linkedin, Copy, ExternalLink, MoreVertical, 
  Trash2, Edit, Globe, Lock, BarChart3
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PresentationCard } from '@/components/presentations/PresentationCard';
import { CreatePresentationDialog } from '@/components/presentations/CreatePresentationDialog';
import { ShareDialog } from '@/components/presentations/ShareDialog';
import AppLayout from '@/components/layout/AppLayout';

interface PresentationType {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  og_image_url: string | null;
  presentation_type: string | null;
  category: string | null;
  tags: string[] | null;
  is_public: boolean;
  status: string;
  view_count: number;
  share_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  linkedin_post_template: string | null;
}

const Presentations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationType | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: presentations = [], isLoading } = useQuery({
    queryKey: ['presentations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PresentationType[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('presentations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast.success('Presentation deleted');
    },
    onError: () => toast.error('Failed to delete presentation')
  });

  const filteredPresentations = presentations.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: presentations.length,
    published: presentations.filter(p => p.status === 'published').length,
    drafts: presentations.filter(p => p.status === 'draft').length,
    totalViews: presentations.reduce((acc, p) => acc + (p.view_count || 0), 0),
    totalShares: presentations.reduce((acc, p) => acc + (p.share_count || 0), 0)
  };

  const handleShare = (presentation: PresentationType) => {
    setSelectedPresentation(presentation);
    setIsShareOpen(true);
  };

  const handleView = (presentation: PresentationType) => {
    window.open(`/public/presentation/${presentation.slug}`, '_blank');
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Presentation className="w-8 h-8 text-primary" />
              Presentations
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and share your presentations
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Presentation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{stats.totalShares}</div>
              <p className="text-sm text-muted-foreground">Total Shares</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search presentations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Presentations Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredPresentations.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Presentation className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No presentations yet</h3>
              <p className="text-muted-foreground mb-4">Create your first presentation to get started</p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Presentation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-3"
          }>
            {filteredPresentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
                viewMode={viewMode}
                onShare={() => handleShare(presentation)}
                onView={() => handleView(presentation)}
                onDelete={() => deleteMutation.mutate(presentation.id)}
              />
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <CreatePresentationDialog 
          open={isCreateOpen} 
          onOpenChange={setIsCreateOpen}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['presentations'] })}
        />

        {/* Share Dialog */}
        {selectedPresentation && (
          <ShareDialog
            open={isShareOpen}
            onOpenChange={setIsShareOpen}
            presentation={selectedPresentation}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Presentations;
