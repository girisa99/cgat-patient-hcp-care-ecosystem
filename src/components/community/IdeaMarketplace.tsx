/**
 * IdeaMarketplace - Cross-platform Idea Sharing & Remixing
 * 
 * Unified responsive UI for browsing, sharing, and remixing creative concepts.
 * Works on mobile, tablet, and desktop with adaptive layouts.
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Lightbulb,
  Search,
  Heart,
  Repeat2,
  Eye,
  Star,
  Plus,
  Filter,
  TrendingUp,
  Globe,
  Sparkles,
  ArrowRight,
  Award,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile, useIsMobileOrTablet } from '@/hooks/use-mobile';
import { 
  communityCollaborationService, 
  CommunityIdea, 
  IdeaFilters,
  IDEA_CATEGORIES,
  REGIONS 
} from '@/services/communityCollaborationService';
import { useToast } from '@/hooks/use-toast';

interface IdeaMarketplaceProps {
  userRegion?: string;
  onRemix?: (idea: CommunityIdea) => void;
  showCreateButton?: boolean;
}

const IdeaCard: React.FC<{ 
  idea: CommunityIdea; 
  onLike: () => void;
  onRemix: () => void;
  onView: () => void;
  compact?: boolean;
}> = ({ idea, onLike, onRemix, onView, compact }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 ${
          compact ? 'h-full' : ''
        }`}
        onClick={onView}
      >
        {/* Thumbnail */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ${
          compact ? 'h-24' : 'h-32 sm:h-40'
        }`}>
          {idea.thumbnailUrl ? (
            <img 
              src={idea.thumbnailUrl} 
              alt={idea.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Lightbulb className="h-8 w-8 text-primary/40" />
            </div>
          )}
          
          {/* Featured badge */}
          {idea.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-amber-500 text-white gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            </div>
          )}
          
          {/* Credit reward badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              +{idea.creditReward}
            </Badge>
          </div>
        </div>

        <CardHeader className={compact ? 'p-3' : 'p-4'}>
          <h3 className={`font-semibold line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {idea.title}
          </h3>
          {!compact && idea.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {idea.description}
            </p>
          )}
        </CardHeader>

        <CardContent className={compact ? 'p-3 pt-0' : 'p-4 pt-0'}>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {idea.category}
            </Badge>
            {idea.region && (
              <Badge variant="outline" className="text-xs">
                {idea.region}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className={`flex items-center justify-between border-t ${
          compact ? 'p-2' : 'p-3'
        }`}>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <button 
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className="flex items-center gap-1 hover:text-pink-500 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span>{idea.likeCount}</span>
            </button>
            <span className="flex items-center gap-1">
              <Repeat2 className="h-4 w-4" />
              {idea.remixCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {idea.viewCount}
            </span>
          </div>
          
          {!compact && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onRemix(); }}
              className="gap-1"
            >
              <Repeat2 className="h-4 w-4" />
              Remix
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export const IdeaMarketplace: React.FC<IdeaMarketplaceProps> = ({
  userRegion,
  onRemix,
  showCreateButton = true,
}) => {
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'discover' | 'trending' | 'regional'>('discover');
  const [filters, setFilters] = useState<IdeaFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<CommunityIdea | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch ideas based on active tab
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['community-ideas', activeTab, filters, searchQuery],
    queryFn: async () => {
      const searchFilters: IdeaFilters = {
        ...filters,
        search: searchQuery || undefined,
        featured: activeTab === 'trending' ? true : undefined,
        region: activeTab === 'regional' ? (userRegion || 'NA') : filters.region,
      };
      return communityCollaborationService.getIdeas(searchFilters);
    },
  });

  // Fetch featured ideas for hero section
  const { data: featuredIdeas = [] } = useQuery({
    queryKey: ['featured-ideas'],
    queryFn: () => communityCollaborationService.getFeaturedIdeas(4),
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (ideaId: string) => communityCollaborationService.likeIdea(ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-ideas'] });
      toast({ title: 'Liked!', description: 'Idea added to your favorites' });
    },
  });

  const handleRemix = (idea: CommunityIdea) => {
    if (onRemix) {
      onRemix(idea);
    } else {
      toast({
        title: 'Remix Started',
        description: `Creating your version of "${idea.title}"`,
      });
    }
  };

  const gridCols = isMobile ? 'grid-cols-2' : isMobileOrTablet ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Idea Marketplace
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover, remix, and share creative concepts
          </p>
        </div>
        
        {showCreateButton && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Share Idea
          </Button>
        )}
      </div>

      {/* Featured Hero (Desktop only) */}
      {!isMobile && featuredIdeas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredIdeas.slice(0, 4).map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              compact
              onLike={() => likeMutation.mutate(idea.id)}
              onRemix={() => handleRemix(idea)}
              onView={() => setSelectedIdea(idea)}
            />
          ))}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.category || ''}
            onValueChange={(v) => setFilters(prev => ({ ...prev, category: v || undefined }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="">All Categories</SelectItem>
              {IDEA_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat.replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.region || ''}
            onValueChange={(v) => setFilters(prev => ({ ...prev, region: v || undefined }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="">All Regions</SelectItem>
              {REGIONS.map((r) => (
                <SelectItem key={r.code} value={r.code}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="discover" className="flex-1 sm:flex-initial gap-2">
            <Globe className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex-1 sm:flex-initial gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex-1 sm:flex-initial gap-2">
            <Users className="h-4 w-4" />
            My Region
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className={`grid ${gridCols} gap-4`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-16">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">No ideas found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share an idea in this category!
              </p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Share Your Idea
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className={`grid ${gridCols} gap-4`}>
                {ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onLike={() => likeMutation.mutate(idea.id)}
                    onRemix={() => handleRemix(idea)}
                    onView={() => setSelectedIdea(idea)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      {/* Idea Detail Dialog */}
      <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedIdea && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedIdea.title}</DialogTitle>
                <DialogDescription>{selectedIdea.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Thumbnail */}
                {selectedIdea.thumbnailUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={selectedIdea.thumbnailUrl} 
                      alt={selectedIdea.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-pink-500" />
                    {selectedIdea.likeCount} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="h-4 w-4 text-primary" />
                    {selectedIdea.remixCount} remixes
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedIdea.viewCount} views
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <Badge>{selectedIdea.category}</Badge>
                  {selectedIdea.region && <Badge variant="outline">{selectedIdea.region}</Badge>}
                  {selectedIdea.industry && <Badge variant="outline">{selectedIdea.industry}</Badge>}
                  {selectedIdea.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                {/* Credit Reward */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Remix this idea</p>
                      <p className="text-sm text-muted-foreground">
                        Earn {selectedIdea.creditReward} credits when you create your version
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => {
                      handleRemix(selectedIdea);
                      setSelectedIdea(null);
                    }}
                  >
                    <Repeat2 className="h-4 w-4" />
                    Remix This Idea
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => likeMutation.mutate(selectedIdea.id)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IdeaMarketplace;
