/**
 * RegionalStories - Cross-platform Regional Success Stories
 * 
 * Discover what's working in other regions for cross-pollination.
 * Responsive design works on mobile, tablet, and desktop.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
} from '@/components/ui/dialog';
import {
  Globe2,
  Search,
  ThumbsUp,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Star,
  BarChart3,
  Users,
  Target,
  Eye,
  Lightbulb,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile, useIsMobileOrTablet } from '@/hooks/use-mobile';
import { 
  communityCollaborationService, 
  RegionalSuccessStory,
  StoryFilters,
  REGIONS 
} from '@/services/communityCollaborationService';
import { useToast } from '@/hooks/use-toast';

interface RegionalStoriesProps {
  userRegion?: string;
  onApplyLearning?: (story: RegionalSuccessStory) => void;
}

const MetricBadge: React.FC<{ label: string; value: number | string; icon: React.ReactNode }> = ({ 
  label, value, icon 
}) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
    <span className="text-muted-foreground">{icon}</span>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

const StoryCard: React.FC<{ 
  story: RegionalSuccessStory; 
  onUpvote: () => void;
  onView: () => void;
  compact?: boolean;
}> = ({ story, onUpvote, onView, compact }) => {
  const regionInfo = REGIONS.find(r => r.code === story.region);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 h-full ${
          story.isFeatured ? 'border-amber-500/50' : ''
        }`}
        onClick={onView}
      >
        <CardHeader className={compact ? 'p-3 pb-2' : 'p-4 pb-2'}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {regionInfo?.name || story.region}
                </Badge>
                {story.isVerified && (
                  <Badge className="bg-green-500 text-white gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {story.isFeatured && (
                  <Badge className="bg-amber-500 text-white gap-1 text-xs">
                    <Star className="h-3 w-3" />
                  </Badge>
                )}
              </div>
              <h3 className={`font-semibold line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
                {story.title}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className={compact ? 'p-3 pt-0' : 'p-4 pt-0'}>
          {!compact && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {story.storyContent}
            </p>
          )}

          {/* Key metrics preview */}
          <div className="flex flex-wrap gap-2">
            {story.metrics.engagement && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                {story.metrics.engagement}% engagement
              </Badge>
            )}
            {story.metrics.reach && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Eye className="h-3 w-3" />
                {story.metrics.reach.toLocaleString()} reach
              </Badge>
            )}
          </div>

          {/* Applicable regions */}
          {story.applicableRegions.length > 0 && !compact && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Globe2 className="h-3 w-3" />
              <span>Also applicable to: {story.applicableRegions.slice(0, 3).join(', ')}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className={`flex items-center justify-between border-t ${
          compact ? 'p-2' : 'p-3'
        }`}>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onUpvote(); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{story.upvotes}</span>
            </button>
          </div>
          
          {story.platform && (
            <Badge variant="outline" className="text-xs">
              {story.platform}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export const RegionalStories: React.FC<RegionalStoriesProps> = ({
  userRegion = 'NA',
  onApplyLearning,
}) => {
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'all' | 'my-region' | 'applicable'>('all');
  const [filters, setFilters] = useState<StoryFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<RegionalSuccessStory | null>(null);

  // Fetch stories based on active tab
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['regional-stories', activeTab, filters, searchQuery, userRegion],
    queryFn: async () => {
      if (activeTab === 'my-region') {
        return communityCollaborationService.getStoriesByRegion(userRegion);
      } else if (activeTab === 'applicable') {
        return communityCollaborationService.getStoriesApplicableToRegion(userRegion);
      }
      const searchFilters: StoryFilters = {
        ...filters,
        search: searchQuery || undefined,
      };
      return communityCollaborationService.getStories(searchFilters);
    },
  });

  // Fetch featured stories
  const { data: featuredStories = [] } = useQuery({
    queryKey: ['featured-stories'],
    queryFn: () => communityCollaborationService.getFeaturedStories(3),
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: (storyId: string) => communityCollaborationService.upvoteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regional-stories'] });
      toast({ title: 'Upvoted!', description: 'Thanks for your feedback' });
    },
  });

  const handleApplyLearning = (story: RegionalSuccessStory) => {
    if (onApplyLearning) {
      onApplyLearning(story);
    } else {
      toast({
        title: 'Learning Applied',
        description: 'These insights have been saved to your workspace',
      });
    }
    setSelectedStory(null);
  };

  const gridCols = isMobile ? 'grid-cols-1' : isMobileOrTablet ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-primary" />
            Regional Success Stories
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Learn what's working in different regions
          </p>
        </div>
        
        <Button className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Your Story
        </Button>
      </div>

      {/* Featured Stories Carousel (if not mobile) */}
      {!isMobile && featuredStories.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Featured Stories
          </h3>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex gap-4">
              {featuredStories.map((story) => (
                <div key={story.id} className="w-[350px] shrink-0">
                  <StoryCard
                    story={story}
                    onUpvote={() => upvoteMutation.mutate(story.id)}
                    onView={() => setSelectedStory(story)}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
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

          <Select
            value={filters.verified ? 'verified' : ''}
            onValueChange={(v) => setFilters(prev => ({ ...prev, verified: v === 'verified' }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="">All Stories</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-initial gap-2">
            <Globe2 className="h-4 w-4" />
            All Regions
          </TabsTrigger>
          <TabsTrigger value="my-region" className="flex-1 sm:flex-initial gap-2">
            <MapPin className="h-4 w-4" />
            My Region
          </TabsTrigger>
          <TabsTrigger value="applicable" className="flex-1 sm:flex-initial gap-2">
            <Target className="h-4 w-4" />
            For My Region
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className={`grid ${gridCols} gap-4`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16">
              <Globe2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">No stories found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share a success story from your region!
              </p>
              <Button className="mt-4 gap-2">
                <Share2 className="h-4 w-4" />
                Share Your Story
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className={`grid ${gridCols} gap-4`}>
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onUpvote={() => upvoteMutation.mutate(story.id)}
                    onView={() => setSelectedStory(story)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      {/* Story Detail Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {REGIONS.find(r => r.code === selectedStory.region)?.name || selectedStory.region}
                  </Badge>
                  {selectedStory.isVerified && (
                    <Badge className="bg-green-500 text-white gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">{selectedStory.title}</DialogTitle>
                <DialogDescription>
                  by {selectedStory.authorName || 'Anonymous'} • {selectedStory.authorRegion}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Story Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{selectedStory.storyContent}</p>
                </div>

                {/* Metrics */}
                {Object.keys(selectedStory.metrics).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Results
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedStory.metrics.engagement && (
                        <MetricBadge 
                          label="Engagement" 
                          value={`${selectedStory.metrics.engagement}%`}
                          icon={<TrendingUp className="h-4 w-4" />}
                        />
                      )}
                      {selectedStory.metrics.reach && (
                        <MetricBadge 
                          label="Reach" 
                          value={selectedStory.metrics.reach}
                          icon={<Eye className="h-4 w-4" />}
                        />
                      )}
                      {selectedStory.metrics.conversions && (
                        <MetricBadge 
                          label="Conversions" 
                          value={selectedStory.metrics.conversions}
                          icon={<Target className="h-4 w-4" />}
                        />
                      )}
                      {selectedStory.metrics.views && (
                        <MetricBadge 
                          label="Views" 
                          value={selectedStory.metrics.views}
                          icon={<Users className="h-4 w-4" />}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Learnings */}
                {selectedStory.learnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Key Learnings
                    </h4>
                    <ul className="space-y-2">
                      {selectedStory.learnings.map((learning, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{learning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Applicable Regions */}
                {selectedStory.applicableRegions.length > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-primary" />
                      Applicable to Your Region?
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedStory.applicableRegions.map((region) => (
                        <Badge 
                          key={region} 
                          variant={region === userRegion ? 'default' : 'outline'}
                        >
                          {REGIONS.find(r => r.code === region)?.name || region}
                        </Badge>
                      ))}
                    </div>
                    {selectedStory.applicableRegions.includes(userRegion) && (
                      <p className="text-sm text-muted-foreground">
                        This strategy has been flagged as applicable to your region!
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => handleApplyLearning(selectedStory)}
                  >
                    <Lightbulb className="h-4 w-4" />
                    Apply These Learnings
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => upvoteMutation.mutate(selectedStory.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
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

export default RegionalStories;
