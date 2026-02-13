/**
 * Blueprint Templates Grid
 * Displays templates with intent-driven recommendations, comparison, and creation
 * Features: hybrid intent scoring, "Create Custom" always visible, search filtering
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Sparkles,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useVideoBlueprints, type VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { BlueprintPreviewModal } from './BlueprintPreviewModal';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { TemplateComparisonView } from './TemplateComparisonView';
import { getIntentRecommendations } from './intentScoringUtils';
import { useToast } from '@/hooks/use-toast';

interface BlueprintTemplatesGridProps {
  onSelectBlueprint?: (blueprint: VideoBlueprint) => void;
  selectedBlueprintId?: string;
  intentFilter?: string | null;
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

const getEffectiveThumbnail = (blueprint: VideoBlueprint): string | null => {
  if (blueprint.thumbnail_url) return blueprint.thumbnail_url;
  return CATEGORY_PLACEHOLDER_THUMBNAILS[blueprint.category] || CATEGORY_PLACEHOLDER_THUMBNAILS.marketing;
};

export function BlueprintTemplatesGrid({
  onSelectBlueprint,
  selectedBlueprintId,
  intentFilter,
}: BlueprintTemplatesGridProps) {
  const { toast } = useToast();
  const { blueprints, isLoading } = useVideoBlueprints();

  const [searchQuery, setSearchQuery] = useState('');
  const [previewBlueprint, setPreviewBlueprint] = useState<VideoBlueprint | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBrowseAll, setShowBrowseAll] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Get recommendations based on intent
  const recommendedTemplates = useMemo(() => {
    if (!intentFilter) return blueprints.slice(0, 12);
    return getIntentRecommendations(blueprints, intentFilter, 8);
  }, [blueprints, intentFilter]);

  // Filter by search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return recommendedTemplates;
    const query = searchQuery.toLowerCase();
    return recommendedTemplates.filter(bp =>
      bp.name.toLowerCase().includes(query) ||
      bp.description?.toLowerCase().includes(query) ||
      bp.category.toLowerCase().includes(query)
    );
  }, [recommendedTemplates, searchQuery]);

  const handleSelectTemplate = (blueprint: VideoBlueprint) => {
    onSelectBlueprint?.(blueprint);
    toast({ title: `Selected: ${blueprint.name}` });
  };

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
      {intentFilter && (
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-lg border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            Showing {filteredTemplates.length} templates matched to your intent
          </span>
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

        {/* Create Custom Button - Always Visible */}
        <Button
          onClick={() => setShowCreateDialog(true)}
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create
        </Button>

        {/* Browse All Button - When Intent Filtered */}
        {intentFilter && (
          <Button
            onClick={() => setShowBrowseAll(true)}
            variant="secondary"
            size="sm"
            className="gap-2 shrink-0"
          >
            Browse All
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((blueprint) => (
            <Card
              key={blueprint.id}
              className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden"
              onClick={() => handleSelectTemplate(blueprint)}
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-muted overflow-hidden">
                <img
                  src={getEffectiveThumbnail(blueprint)}
                  alt={blueprint.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {intentFilter && (
                  <Checkbox
                    checked={selectedForComparison.includes(blueprint.id)}
                    onCheckedChange={() => toggleComparison(blueprint.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2"
                  />
                )}
              </div>

              <CardContent className="p-3 space-y-2">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{blueprint.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {blueprint.description || 'No description'}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {blueprint.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(blueprint.estimated_duration_seconds / 60)}m
                  </Badge>
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewBlueprint(blueprint);
                  }}
                >
                  Preview
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No templates match your search</p>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Custom Template Instead
          </Button>
        </div>
      )}

      {/* Comparison Bar */}
      {selectedForComparison.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-4 space-y-3">
          <p className="text-sm font-medium">
            {selectedForComparison.length} selected for comparison
          </p>
          <Button
            onClick={() => setShowComparison(true)}
            className="w-full gap-2"
          >
            Compare
            <ArrowRight className="w-4 h-4" />
          </Button>
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
        />
      )}

      {showCreateDialog && (
        <CreateTemplateDialog onCreated={() => setShowCreateDialog(false)} />
      )}

      {showComparison && selectedForComparison.length > 0 && (
        <TemplateComparisonView
          isOpen={true}
          blueprints={blueprints.filter(b => selectedForComparison.includes(b.id))}
          onClose={() => setShowComparison(false)}
          onSelect={handleSelectTemplate}
        />
      )}
    </div>
  );
}

// Fix: Add Checkbox import
import { Checkbox } from '@/components/ui/checkbox';
