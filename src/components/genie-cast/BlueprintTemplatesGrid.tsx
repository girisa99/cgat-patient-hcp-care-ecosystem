/**
 * Blueprint Templates Grid
 * "Create Custom" hero card at top + flow-aligned starters as "Starting Points"
 * Features: hero CTA, search filtering, comparison, preview, style-based sorting
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useContentIntents } from '@/hooks/useContentIntents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  formatFilter?: string | null;
  selectedVideoStyles?: any[];
  createContext?: import('./CreateTemplateDialog').CreateTemplateInitialContext | null;
}

const CATEGORY_PLACEHOLDER_THUMBNAILS: Record<string, string> = {
  healthcare: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&h=360&fit=crop',
  retail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop',
  education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=360&fit=crop',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&h=360&fit=crop',
  finance: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&h=360&fit=crop',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=640&h=360&fit=crop',
  celebrations: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=640&h=360&fit=crop',
  entertainment: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640&h=360&fit=crop',
  corporate: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=360&fit=crop',
  marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop',
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
  formatFilter,
  selectedVideoStyles,
  createContext,
}: BlueprintTemplatesGridProps) {
  const { toast } = useToast();
  const { blueprints, flowAlignedTemplates, isLoading, refetch, deleteBlueprint, isDeleting } = useVideoBlueprints();
  const { intents } = useContentIntents();

  // Resolve full intent data for richer context passing
  const selectedIntentData = useMemo(() => {
    if (!intentFilter) return null;
    return intents.find(i => i.intent_key === intentFilter) || null;
  }, [intentFilter, intents]);

  const [searchQuery, setSearchQuery] = useState('');
  const [previewBlueprint, setPreviewBlueprint] = useState<VideoBlueprint | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filter flow-aligned starters by category + format, then apply style-based sorting
  const starterTemplates = useMemo(() => {
    let filtered = flowAlignedTemplates;

    // Apply category filter
    if (categoryFilter) {
      const catFiltered = filtered.filter(
        bp => bp.category.toLowerCase() === categoryFilter.toLowerCase()
      );
      if (catFiltered.length > 0) filtered = catFiltered;
    }

    // Apply format filter (match against tags or name)
    if (formatFilter && filtered.length > 0) {
      const fmtLower = formatFilter.toLowerCase();
      const fmtFiltered = filtered.filter(bp =>
        bp.industry_tags?.some(tag => tag.toLowerCase().includes(fmtLower)) ||
        bp.name.toLowerCase().includes(fmtLower) ||
        bp.description?.toLowerCase().includes(fmtLower)
      );
      if (fmtFiltered.length > 0) filtered = fmtFiltered;
    }

    // Apply intent scoring if intent filter is provided
    if (intentFilter) {
      filtered = getIntentRecommendations(filtered, intentFilter, 9);
    }

    // Sort by matching styles (weighted: style_intent > industry_tags > aesthetic_keywords)
    if (selectedVideoStyles && selectedVideoStyles.length > 0) {
      const styleNames = new Set(selectedVideoStyles.map((s: any) => (s.name || s.label || '').toLowerCase()));
      return [...filtered].sort((a, b) => {
        const scoreMatch = (bp: VideoBlueprint) => {
          let score = 0;
          if (bp.industry_tags?.some(t => styleNames.has(t.toLowerCase()))) score += 2;
          if (bp.style_intent && styleNames.has(bp.style_intent.toLowerCase())) score += 3;
          if ((bp as any).aesthetic_keywords?.some((k: string) => styleNames.has(k.toLowerCase()))) score += 1;
          return score;
        };
        return scoreMatch(b) - scoreMatch(a);
      });
    }

    return filtered;
  }, [flowAlignedTemplates, categoryFilter, formatFilter, intentFilter, selectedVideoStyles]);

  // Search across starters
  const filteredStarters = useMemo(() => {
    if (!searchQuery) return starterTemplates;
    const query = searchQuery.toLowerCase().trim();
    return starterTemplates.filter(bp =>
      bp.name.toLowerCase().includes(query) ||
      bp.description?.toLowerCase().includes(query) ||
      bp.category.toLowerCase().includes(query) ||
      bp.industry_tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [starterTemplates, searchQuery]);

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
      <div className="space-y-4">
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Context badges for the hero card
  const contextBadges: { label: string; value: string }[] = [];
  if (categoryFilter) contextBadges.push({ label: 'Category', value: categoryFilter });
  if (formatFilter) contextBadges.push({ label: 'Format', value: formatFilter });
  if (intentFilter) contextBadges.push({ label: 'Intent', value: intentFilter });
  if (selectedVideoStyles && selectedVideoStyles.length > 0) {
    contextBadges.push({
      label: 'Styles',
      value: selectedVideoStyles.map((s: any) => s.name || s.label).join(', '),
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Hero Card: Create Custom Template ── */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-xl font-bold">Create Custom Template</h2>
            <p className="text-sm text-muted-foreground">
              Build a template tailored to your exact needs. Your CREATE flow context
              (category, format, enrichment) will be pre-filled automatically.
            </p>
            {contextBadges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {contextBadges.map((badge) => (
                  <Badge key={badge.label} variant="secondary" className="text-xs">
                    {badge.label}: {badge.value}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="gap-2 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Create Custom
          </Button>
        </CardContent>
      </Card>

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search starting point templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* ── Starting Points Section ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Starting Points
          </h3>
          {categoryFilter && (
            <Badge variant="outline" className="text-xs">
              {categoryFilter}
            </Badge>
          )}
        </div>

        {filteredStarters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStarters.map((blueprint) => {
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
                  <div className="relative h-36 bg-muted overflow-hidden">
                    <img
                      src={getEffectiveThumbnail(blueprint)!}
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
                      {blueprint.style_intent && (
                        <Badge variant="outline" className="text-xs">
                          {blueprint.style_intent}
                        </Badge>
                      )}
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
          <div className="text-center py-8 space-y-2">
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? `No starter templates matching "${searchQuery}".`
                : categoryFilter
                  ? `No starter templates for "${categoryFilter}". Create one above.`
                  : 'No starter templates available. Create one above.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Custom Template
            </Button>
          </div>
        )}
      </div>

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
        initialContext={createContext || (selectedIntentData ? {
          goal: `${selectedIntentData.label} — ${selectedIntentData.description}`,
          product: selectedIntentData.category,
        } : intentFilter ? { goal: intentFilter } : undefined)}
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
