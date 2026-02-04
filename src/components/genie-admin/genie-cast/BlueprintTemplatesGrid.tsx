/**
 * Blueprint Templates Grid
 * Displays all available templates with category filtering and preview
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideoBlueprints, type VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { BlueprintPreviewModal } from './BlueprintPreviewModal';

interface BlueprintTemplatesGridProps {
  onSelectBlueprint?: (blueprint: VideoBlueprint) => void;
  selectedBlueprintId?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  marketing: <Target className="h-4 w-4" />,
  educational: <BookOpen className="h-4 w-4" />,
  storytelling: <Film className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  marketing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  educational: 'bg-green-500/20 text-green-400 border-green-500/30',
  storytelling: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  announcement: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export function BlueprintTemplatesGrid({
  onSelectBlueprint,
  selectedBlueprintId,
}: BlueprintTemplatesGridProps) {
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

  // Fetch blueprint with scenes for preview
  const { data: previewBlueprint } = useBlueprintWithScenes(previewBlueprintId);

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
        <Button 
          onClick={() => seedBlueprints()} 
          disabled={isSeeding}
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
              Seed Templates
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Category Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="bg-card/50">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {Object.keys(categoryLabels).map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs gap-1">
                {categoryIcons[cat]}
                {categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
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
              {/* Thumbnail Area */}
              <div className={cn(
                "h-24 flex items-center justify-center relative",
                categoryColors[blueprint.category] || categoryColors.marketing
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                <div className="relative z-10 p-4 text-center">
                  <div className="text-3xl mb-1">
                    {categoryIcons[blueprint.category] || <Target className="h-8 w-8 mx-auto" />}
                  </div>
                  {blueprint.is_system_default && (
                    <Badge className="bg-background/90 text-foreground text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      System
                    </Badge>
                  )}
                </div>

                {/* Preview Button on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Play className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium truncate">{blueprint.name}</h3>
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
                      {tag.replace('_', ' ')}
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
