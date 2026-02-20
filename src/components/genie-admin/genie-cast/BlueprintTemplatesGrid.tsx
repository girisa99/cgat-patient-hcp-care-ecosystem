/**
 * Blueprint Templates Grid
 * Displays templates with intent-driven recommendations, comparison, and creation
 * Features: hybrid intent scoring, "Create Custom" always visible, search filtering
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useContentIntents } from '@/hooks/useContentIntents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Sparkles,
  Plus,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useVideoBlueprints, type VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { BlueprintPreviewModal } from './BlueprintPreviewModal';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { TemplateComparisonView } from './TemplateComparisonView';
import { getIntentRecommendations } from './intentScoringUtils';
import { useToast } from '@/hooks/use-toast';
import ep04Thumbnail from '@/assets/scenes/scene-0-title.png';

interface BlueprintTemplatesGridProps {
  onSelectBlueprint?: (blueprint: VideoBlueprint) => void;
  selectedBlueprintId?: string;
  intentFilter?: string | null;
  categoryFilter?: string | null;
  simpleMode?: boolean;
  selectedVideoStyles?: any[];
}

const CATEGORY_PLACEHOLDER_THUMBNAILS: Record<string, string> = {
  marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop',
  educational: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=360&fit=crop',
  storytelling: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640&h=360&fit=crop',
  corporate: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=360&fit=crop',
  animation: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop',
};

const EP04_BLUEPRINT_ID = 'cafcd78a-7957-4021-ba8f-c20daba331b2';

const getEffectiveThumbnail = (blueprint: VideoBlueprint): string | null => {
  if (blueprint.id === EP04_BLUEPRINT_ID) return ep04Thumbnail;
  if (blueprint.thumbnail_url) return blueprint.thumbnail_url;
  return CATEGORY_PLACEHOLDER_THUMBNAILS[blueprint.category] || CATEGORY_PLACEHOLDER_THUMBNAILS.marketing;
};

export function BlueprintTemplatesGrid({
  onSelectBlueprint,
  selectedBlueprintId,
  intentFilter,
  categoryFilter,
  selectedVideoStyles,
}: BlueprintTemplatesGridProps) {
  const { toast } = useToast();
  const { blueprints, isLoading, refetch, deleteBlueprint, isDeleting } = useVideoBlueprints();
  const { intents } = useContentIntents();

  // Resolve full intent data for richer context passing
  const selectedIntentData = useMemo(() => {
    if (!intentFilter) return null;
    return intents.find(i => i.intent_key === intentFilter) || null;
  }, [intentFilter, intents]);

  const [searchQuery, setSearchQuery] = useState('');
  const [previewBlueprint, setPreviewBlueprint] = useState<VideoBlueprint | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBrowseAll, setShowBrowseAll] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filter by category first, then apply intent scoring
  const recommendedTemplates = useMemo(() => {
    // Browse All shows ALL blueprints (ignores category filter)
    if (showBrowseAll) return blueprints;

    // Apply category filter if provided
    const categoryFiltered = categoryFilter
      ? blueprints.filter(bp => bp.category.toLowerCase() === categoryFilter.toLowerCase())
      : blueprints;

    const source = intentFilter 
      ? getIntentRecommendations(categoryFiltered, intentFilter, 8) 
      : categoryFiltered.slice(0, 12);
    
    // If category filter yielded no results, fall back to all blueprints
    if (source.length === 0 && categoryFilter) {
      return blueprints.slice(0, 12);
    }
    return source;
  }, [blueprints, intentFilter, categoryFilter, showBrowseAll]);

  // Filter by search query — searches across ALL blueprints when Browse All is active
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return recommendedTemplates;
    const query = searchQuery.toLowerCase().trim();
    // When searching, always search ALL blueprints (not just recommended subset)
    const searchPool = showBrowseAll ? blueprints : recommendedTemplates;
    const results = searchPool.filter(bp =>
      bp.name.toLowerCase().includes(query) ||
      bp.description?.toLowerCase().includes(query) ||
      bp.category.toLowerCase().includes(query) ||
      bp.industry_tags?.some(tag => tag.toLowerCase().includes(query))
    );
    console.log(`[TemplateSearch] query="${query}" pool=${searchPool.length} results=${results.length}`);
    return results;
  }, [recommendedTemplates, searchQuery, showBrowseAll, blueprints]);

  const handleSelectTemplate = useCallback((blueprint: VideoBlueprint, overrides?: { targetPlatforms?: string[] }) => {
    const enriched = overrides?.targetPlatforms 
      ? { ...blueprint, target_platform: overrides.targetPlatforms }
      : blueprint;
    onSelectBlueprint?.(enriched);
    toast({ title: `Template Selected`, description: `"${blueprint.name}" — proceeding to messaging` });
  }, [onSelectBlueprint, toast]);

  // When a new template is created via CreateTemplateDialog, refetch and select it
  const handleTemplateCreated = useCallback(async () => {
    setShowCreateDialog(false);
    const { data: updated } = await refetch();
    // Auto-select the most recently created template
    if (updated && updated.length > 0) {
      const sorted = [...updated].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      const newest = sorted[0];
      if (newest) {
        handleSelectTemplate(newest);
        return;
      }
    }
    toast({ title: 'Template Created', description: 'Your custom template is ready. Select it to continue.' });
  }, [refetch, toast, handleSelectTemplate]);

  const toggleComparison = (blueprintId: string) => {
    setSelectedForComparison(prev =>
      prev.includes(blueprintId)
        ? prev.filter(id => id !== blueprintId)
        : prev.length < 3
          ? [...prev, blueprintId]
          : prev
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Intent Context */}
      {intentFilter && !showBrowseAll && (
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-lg border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            Showing top {filteredTemplates.length} templates matched to your intent
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            (scored by category, style, keywords & duration fit)
          </span>
        </div>
      )}

      {/* Browse All Banner */}
      {showBrowseAll && (
        <div className="flex items-center justify-between px-4 py-3 bg-muted rounded-lg border">
          <span className="text-sm font-medium">
            Browsing all {filteredTemplates.length} templates
          </span>
          <Button variant="ghost" size="sm" onClick={() => setShowBrowseAll(false)}>
            ← Back to Recommendations
          </Button>
        </div>
      )}

      {/* Action Bar: Search + Create Custom + Browse All */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create Custom Template - Always Visible */}
        <Button
          onClick={() => setShowCreateDialog(true)}
          variant="default"
          size="sm"
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Custom
        </Button>

        {/* Browse All - When filtered by intent or category & not already browsing */}
        {(intentFilter || categoryFilter) && !showBrowseAll && (
          <Button
            onClick={() => setShowBrowseAll(true)}
            variant="secondary"
            size="sm"
            className="gap-2 shrink-0"
          >
            Browse All ({blueprints.length})
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((blueprint) => {
            const isSelected = selectedBlueprintId === blueprint.id;
            return (
              <Card
                key={blueprint.id}
                className={`group cursor-pointer hover:shadow-lg transition-all overflow-hidden ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectTemplate(blueprint)}
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-muted overflow-hidden">
                  <img
                    src={getEffectiveThumbnail(blueprint)}
                    alt={blueprint.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <Checkbox
                    checked={selectedForComparison.includes(blueprint.id)}
                    onCheckedChange={() => toggleComparison(blueprint.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2"
                  />
                </div>

                <CardContent className="p-3 space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{blueprint.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {blueprint.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {blueprint.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {blueprint.estimated_duration_seconds >= 60 
                        ? `${Math.round(blueprint.estimated_duration_seconds / 60)}m` 
                        : `${blueprint.estimated_duration_seconds}s`}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewBlueprint(blueprint);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(blueprint);
                      }}
                    >
                      Use This
                    </Button>
                    {!blueprint.is_system_default && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            disabled={isDeleting}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{blueprint.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteBlueprint(blueprint.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-1">No templates found</p>
            <p className="text-sm">Try a different search or create a custom template</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Custom Template
            </Button>
            {(intentFilter || categoryFilter) && !showBrowseAll && (
              <Button variant="outline" onClick={() => setShowBrowseAll(true)}>
                Browse All Templates ({blueprints.length})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Comparison Bar */}
      {selectedForComparison.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-4 space-y-3 z-50">
          <p className="text-sm font-medium">
            {selectedForComparison.length}/3 selected for comparison
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedForComparison([])}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setShowComparison(true)}
              disabled={selectedForComparison.length < 2}
              className="gap-1"
            >
              Compare
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {previewBlueprint && (
        <BlueprintPreviewModal
          isOpen={true}
          blueprint={previewBlueprint}
          scenes={previewBlueprint.scenes || []}
          onClose={() => setPreviewBlueprint(null)}
          onSelect={handleSelectTemplate}
          selectedVideoStyles={selectedVideoStyles}
        />
      )}

      <CreateTemplateDialog 
        onCreated={handleTemplateCreated}
        initialContext={selectedIntentData ? {
          goal: `${selectedIntentData.label} — ${selectedIntentData.description}`,
          product: selectedIntentData.category,
        } : intentFilter ? { goal: intentFilter } : undefined}
        externalOpen={showCreateDialog}
        onExternalOpenChange={setShowCreateDialog}
      />

      {showComparison && selectedForComparison.length >= 2 && (
        <TemplateComparisonView
          isOpen={true}
          blueprints={blueprints.filter(b => selectedForComparison.includes(b.id))}
          onClose={() => {
            setShowComparison(false);
            setSelectedForComparison([]);
          }}
          onSelect={handleSelectTemplate}
        />
      )}
    </div>
  );
}

import { Checkbox } from '@/components/ui/checkbox';
