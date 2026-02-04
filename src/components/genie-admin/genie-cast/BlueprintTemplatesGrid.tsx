/**
 * Blueprint Templates Grid
 * Displays all available templates with category filtering, AI thumbnails, and preview
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Clock,
  Layers,
  Play,
  Sparkles,
  Target,
  BookOpen,
  Megaphone,
  Film,
  RefreshCw,
  Database,
  Image as ImageIcon,
  Wand2,
  Heart,
  Stethoscope,
  Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideoBlueprints, type VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { BlueprintPreviewModal } from './BlueprintPreviewModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlueprintTemplatesGridProps {
  onSelectBlueprint?: (blueprint: VideoBlueprint) => void;
  selectedBlueprintId?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  marketing: <Target className="h-4 w-4" />,
  educational: <BookOpen className="h-4 w-4" />,
  storytelling: <Film className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
  healthcare: <Stethoscope className="h-4 w-4" />,
  entertainment: <Heart className="h-4 w-4" />,
  corporate: <Globe2 className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  marketing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  educational: 'bg-green-500/20 text-green-400 border-green-500/30',
  storytelling: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  announcement: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  healthcare: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  entertainment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  corporate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

// Category gradient backgrounds for cards without thumbnails
const categoryGradients: Record<string, string> = {
  marketing: 'bg-gradient-to-br from-blue-600/30 via-blue-500/20 to-indigo-600/30',
  educational: 'bg-gradient-to-br from-green-600/30 via-emerald-500/20 to-teal-600/30',
  storytelling: 'bg-gradient-to-br from-purple-600/30 via-violet-500/20 to-fuchsia-600/30',
  announcement: 'bg-gradient-to-br from-orange-600/30 via-amber-500/20 to-yellow-600/30',
  healthcare: 'bg-gradient-to-br from-cyan-600/30 via-sky-500/20 to-blue-600/30',
  entertainment: 'bg-gradient-to-br from-pink-600/30 via-rose-500/20 to-red-600/30',
  corporate: 'bg-gradient-to-br from-slate-600/30 via-gray-500/20 to-zinc-600/30',
};

export function BlueprintTemplatesGrid({
  onSelectBlueprint,
  selectedBlueprintId,
}: BlueprintTemplatesGridProps) {
  const { toast } = useToast();
  const {
    blueprints,
    blueprintsByCategory,
    categoryLabels,
    isLoading,
    error,
    refetch,
    useBlueprintWithScenes,
    seedBlueprints,
    isSeeding,
  } = useVideoBlueprints();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewBlueprintId, setPreviewBlueprintId] = useState<string | null>(null);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Fetch blueprint with scenes for preview
  const { data: previewBlueprint } = useBlueprintWithScenes(previewBlueprintId);

  // Generate thumbnail for a single blueprint
  const generateThumbnail = async (blueprintId: string) => {
    setGeneratingId(blueprintId);
    try {
      const { data, error } = await supabase.functions.invoke('generate-template-thumbnails', {
        body: { blueprintId, region: 'global' },
      });
      if (error) throw error;
      toast({
        title: 'Thumbnail Generated',
        description: data.generated === 1 ? 'AI thumbnail created successfully' : 'Generation completed',
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Generation Failed',
        description: err.message || 'Could not generate thumbnail',
        variant: 'destructive',
      });
    } finally {
      setGeneratingId(null);
    }
  };

  // Generate all missing thumbnails
  const generateAllThumbnails = async () => {
    setIsGeneratingThumbnails(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-template-thumbnails', {
        body: { generateAll: false, region: 'global' },
      });
      if (error) throw error;
      toast({
        title: 'Thumbnails Generated',
        description: `Created ${data.generated} thumbnails, ${data.failed} failed`,
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Generation Failed',
        description: err.message || 'Could not generate thumbnails',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingThumbnails(false);
    }
  };

  // Seed expanded templates
  const seedExpandedTemplates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seed-blueprints-expanded');
      if (error) throw error;
      toast({
        title: 'Templates Expanded',
        description: `Added ${data.created} new templates (${data.skipped} already existed)`,
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Seeding Failed',
        description: err.message || 'Could not seed templates',
        variant: 'destructive',
      });
    }
  };

  // Filter blueprints
  const filteredBlueprints = useMemo(() => {
    let filtered = blueprints;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(bp => bp.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bp =>
        bp.name.toLowerCase().includes(query) ||
        bp.description?.toLowerCase().includes(query) ||
        bp.industry_tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [blueprints, activeCategory, searchQuery]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleSelectBlueprint = (blueprint: VideoBlueprint) => {
    setPreviewBlueprintId(null);
    onSelectBlueprint?.(blueprint);
  };

  // Empty state - need to seed
  if (!isLoading && blueprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="p-4 rounded-full bg-primary/10">
          <Database className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium">No Templates Found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Seed the database with starter templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => seedBlueprints()} 
            disabled={isSeeding}
            variant="outline"
            className="gap-2"
          >
            {isSeeding ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Basic Templates
              </>
            )}
          </Button>
          <Button 
            onClick={seedExpandedTemplates}
            className="gap-2"
          >
            <Globe2 className="h-4 w-4" />
            Full Library (50+)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search, Category Tabs, and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-card/50 flex-wrap h-auto">
              <TabsTrigger value="all" className="text-xs">All ({blueprints.length})</TabsTrigger>
              {Object.keys(categoryLabels).map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-xs gap-1">
                  {categoryIcons[cat]}
                  {categoryLabels[cat]}
                  <span className="text-muted-foreground">
                    ({blueprintsByCategory[cat]?.length || 0})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateAllThumbnails}
              disabled={isGeneratingThumbnails}
              className="gap-2"
            >
              {isGeneratingThumbnails ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generate Thumbnails
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={seedExpandedTemplates}
              className="gap-2"
            >
              <Globe2 className="h-4 w-4" />
              Add More
            </Button>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-destructive">
          <p>Failed to load templates</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlueprints.map((blueprint) => (
            <Card
              key={blueprint.id}
              className={cn(
                "overflow-hidden transition-all cursor-pointer hover:border-primary/50 hover:shadow-lg group",
                selectedBlueprintId === blueprint.id && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setPreviewBlueprintId(blueprint.id)}
            >
              {/* Thumbnail Area - AI Generated or Gradient Fallback */}
              <div className={cn(
                "h-36 flex items-center justify-center relative overflow-hidden",
                !blueprint.thumbnail_url && (categoryGradients[blueprint.category] || categoryGradients.marketing)
              )}>
                {blueprint.thumbnail_url ? (
                  <img 
                    src={blueprint.thumbnail_url} 
                    alt={blueprint.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
                    <div className="relative z-10 p-4 text-center">
                      <div className="text-4xl mb-2 opacity-80">
                        {categoryIcons[blueprint.category] || <Target className="h-10 w-10 mx-auto" />}
                      </div>
                    </div>
                  </>
                )}

                {/* Regional badge if applicable */}
                {(blueprint.style_preset as any)?.region && (
                  <Badge className="absolute top-2 left-2 bg-background/90 text-foreground text-xs">
                    <Globe2 className="h-3 w-3 mr-1" />
                    {(blueprint.style_preset as any).region.toUpperCase()}
                  </Badge>
                )}

                {/* System badge */}
                {blueprint.is_system_default && (
                  <Badge className="absolute top-2 right-2 bg-background/90 text-foreground text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    System
                  </Badge>
                )}

                {/* Preview/Generate Button on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Play className="h-4 w-4" />
                    Preview
                  </Button>
                  {!blueprint.thumbnail_url && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2 bg-background/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateThumbnail(blueprint.id);
                      }}
                      disabled={generatingId === blueprint.id}
                    >
                      {generatingId === blueprint.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      Generate
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate flex-1">{blueprint.name}</h3>
                    {blueprint.thumbnail_url && (
                      <span title="Has AI thumbnail">
                        <ImageIcon className="h-3 w-3 text-primary" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {blueprint.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(blueprint.estimated_duration_seconds)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {blueprint.target_platform?.length || 0} platforms
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(blueprint.industry_tags || []).slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs capitalize">
                      {tag.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {(blueprint.industry_tags?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(blueprint.industry_tags?.length || 0) - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && filteredBlueprints.length === 0 && blueprints.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No templates match your search</p>
          <Button variant="ghost" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="mt-2">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      <BlueprintPreviewModal
        blueprint={previewBlueprint || null}
        scenes={previewBlueprint?.scenes || []}
        isOpen={!!previewBlueprintId && !!previewBlueprint}
        onClose={() => setPreviewBlueprintId(null)}
        onSelect={handleSelectBlueprint}
      />
    </div>
  );
}

export default BlueprintTemplatesGrid;
