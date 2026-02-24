/**
 * PreviewPopout — Full-screen zoom-in preview dialog for Cast create flow
 *
 * Shows real-time preview of the user's configuration:
 * - Style preview images (zoom in)
 * - Scene estimation visualization
 * - Configuration summary
 *
 * Triggered from any step via a "Preview" button.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Maximize2, Sparkles, Check, Clock, Film, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { useCastContentRegistry } from '@/hooks/useCastContentRegistry';

interface PreviewPopoutProps {
  open: boolean;
  onClose: () => void;
  // Selection state
  selectedCategoryId: string | null;
  selectedFormatId: string | null;
  selectedSubFormatId: string | null;
  selectedVisualStyleIds: string[];
  selectedCapabilityIds: string[];
  selectedCharacterIds: string[];
  targetDuration: number;
  selectedResolution: string;
  selectedAspectRatio: string;
  productionQuality: string;
  enrichmentPrompt: string;
  primaryPlatform: string;
  lipSyncEnabled: boolean;
  dubbingEnabled: boolean;
  // Registry
  contentRegistry: ReturnType<typeof useCastContentRegistry>;
}

export function PreviewPopout({
  open,
  onClose,
  selectedCategoryId,
  selectedFormatId,
  selectedSubFormatId,
  selectedVisualStyleIds,
  selectedCapabilityIds,
  selectedCharacterIds,
  targetDuration,
  selectedResolution,
  selectedAspectRatio,
  productionQuality,
  enrichmentPrompt,
  primaryPlatform,
  lipSyncEnabled,
  dubbingEnabled,
  contentRegistry,
}: PreviewPopoutProps) {
  if (!open) return null;

  const selectedCategory = contentRegistry.categories.find(c => c.id === selectedCategoryId);
  const selectedFormat = contentRegistry.formats.find(f => f.id === selectedFormatId);
  const selectedSubFormat = contentRegistry.subFormats.find(sf => sf.id === selectedSubFormatId);
  const selectedStyles = selectedVisualStyleIds
    .map(id => contentRegistry.visualStyles.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const selectedCaps = selectedCapabilityIds
    .map(id => contentRegistry.productionCapabilities.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const selectedChars = selectedCharacterIds
    .map(id => {
      for (const styleId of selectedVisualStyleIds) {
        const chars = contentRegistry.getCharactersForStyle(styleId);
        const ch = chars.find(c => c.id === id);
        if (ch) return ch;
      }
      return null;
    })
    .filter((c): c is NonNullable<typeof c> => !!c);

  const sceneEst = contentRegistry.estimateScenes(targetDuration, selectedVisualStyleIds[0] || null);

  // Count completed sections
  const completed = [
    selectedCategoryId,
    selectedFormatId,
    selectedVisualStyleIds.length > 0,
    targetDuration > 0,
    primaryPlatform,
    enrichmentPrompt,
  ].filter(Boolean).length;
  const total = 6;
  const completionPercent = Math.round((completed / total) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] rounded-xl border bg-card shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ZoomIn className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Production Preview</h2>
                <p className="text-xs text-muted-foreground">
                  {completionPercent}% configured — {completed}/{total} sections complete
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              {/* Content Selection Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    Category
                  </div>
                  <p className="font-semibold text-sm">
                    {selectedCategory?.label || <span className="text-muted-foreground">Not selected</span>}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Film className="h-3.5 w-3.5" />
                    Format
                  </div>
                  <p className="font-semibold text-sm">
                    {selectedFormat?.label || <span className="text-muted-foreground">Not selected</span>}
                  </p>
                  {selectedSubFormat && (
                    <Badge variant="secondary" className="text-[10px]">{selectedSubFormat.label}</Badge>
                  )}
                </div>
                <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Duration
                  </div>
                  <p className="font-semibold text-sm">
                    {targetDuration > 0 ? `${targetDuration}s (${sceneEst.scenes} scenes)` : <span className="text-muted-foreground">Not set</span>}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Style Preview — Large zoom-in images */}
              {selectedStyles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Visual Styles
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedStyles.map(style => (
                      <div key={style.id} className="rounded-lg border overflow-hidden bg-muted/20">
                        {style.preview_image_url ? (
                          <img
                            src={style.preview_image_url}
                            alt={style.label}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-primary/30" />
                          </div>
                        )}
                        <div className="p-3">
                          <p className="font-medium text-sm">{style.label}</p>
                          {style.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{style.description}</p>
                          )}
                          <div className="flex gap-1 mt-2">
                            <Badge variant="secondary" className="text-[9px]">{style.category}</Badge>
                            {style.parent_style_id && <Badge variant="outline" className="text-[9px]">Sub-style</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Character Preview */}
              {selectedChars.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Characters ({selectedChars.length})</h3>
                  <div className="flex gap-3">
                    {selectedChars.map(ch => (
                      <div key={ch.id} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/20">
                        {ch.thumbnail_url ? (
                          <img src={ch.thumbnail_url} alt={ch.label} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                            {ch.icon || '🎭'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium">{ch.label}</p>
                          <p className="text-[10px] text-muted-foreground">{ch.character_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Technical Specs */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Technical Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border bg-muted/20 text-center">
                    <p className="text-lg font-bold">{selectedResolution.replace('x', '×')}</p>
                    <p className="text-[10px] text-muted-foreground">Resolution</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20 text-center">
                    <p className="text-lg font-bold">{selectedAspectRatio}</p>
                    <p className="text-[10px] text-muted-foreground">Aspect Ratio</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20 text-center">
                    <p className="text-lg font-bold capitalize">{productionQuality}</p>
                    <p className="text-[10px] text-muted-foreground">Quality</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20 text-center">
                    <p className="text-lg font-bold capitalize">{primaryPlatform.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-muted-foreground">Platform</p>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              {selectedCaps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">
                    Production Capabilities ({selectedCaps.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCaps.map(cap => (
                      <Badge key={cap.id} variant="secondary" className="text-xs gap-1">
                        <Check className="h-3 w-3" />
                        {cap.label}
                      </Badge>
                    ))}
                    {lipSyncEnabled && (
                      <Badge variant="secondary" className="text-xs gap-1 bg-blue-500/10 text-blue-600">
                        <Check className="h-3 w-3" />
                        Lip-sync
                      </Badge>
                    )}
                    {dubbingEnabled && (
                      <Badge variant="secondary" className="text-xs gap-1 bg-green-500/10 text-green-600">
                        <Check className="h-3 w-3" />
                        Dubbing
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Enrichment Prompt */}
              {enrichmentPrompt && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Enrichment Prompt</h3>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <p className="text-sm">{enrichmentPrompt}</p>
                  </div>
                </div>
              )}

              {/* Scene Estimation */}
              <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-sm mb-3">Estimated Production</h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{sceneEst.scenes}</p>
                    <p className="text-[10px] text-muted-foreground">Scenes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sceneEst.perSceneDuration}s</p>
                    <p className="text-[10px] text-muted-foreground">Per scene</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {sceneEst.totalSizeMb < 1000
                        ? `${sceneEst.totalSizeMb}MB`
                        : `${(sceneEst.totalSizeMb / 1000).toFixed(1)}GB`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Est. Size</p>
                  </div>
                  <div>
                    <p className={cn(
                      "text-2xl font-bold capitalize",
                      sceneEst.renderTime === 'high' ? 'text-red-500' :
                      sceneEst.renderTime === 'low' ? 'text-green-500' : ''
                    )}>
                      {sceneEst.renderTime}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Render Load</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
