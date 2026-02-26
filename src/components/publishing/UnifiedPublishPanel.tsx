/**
 * UnifiedPublishPanel — Main publishing container.
 * Mounts in any product page. Orchestrates platform selection, captions,
 * delivery modes, and the publish action across all 17 platform variants.
 */

import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Loader2,
  Check,
  X,
  RefreshCw,
  Calendar,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import type {
  PublishingContentPackage,
  PublishingOperationResult,
  GenieProduct,
  SocialPlatformId,
} from '@/types/publishing';
import { usePublishingSession } from '@/hooks/publishing/usePublishingSession';
import { PlatformPicker } from './PlatformPicker';
import { CaptionEditor } from './CaptionEditor';
import { DeliveryModeSelector } from './DeliveryModeSelector';
import { ContentFormatSelector } from './ContentFormatSelector';
import { PLATFORM_REGISTRY } from '@/services/publishing/platformRegistry';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface UnifiedPublishPanelProps {
  sourceProduct: GenieProduct;
  content: PublishingContentPackage;
  region?: string;
  subRegion?: string;
  language?: string;
  showDerivatives?: boolean;
  showScheduler?: boolean;
  compact?: boolean;
  onPublishComplete?: (results: PublishingOperationResult[]) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const UnifiedPublishPanel: React.FC<UnifiedPublishPanelProps> = ({
  sourceProduct,
  content,
  region,
  subRegion,
  language,
  showScheduler = true,
  compact = false,
  onPublishComplete,
}) => {
  const pub = usePublishingSession({
    sourceProduct,
    initialContent: content,
    region,
    subRegion,
    language,
  });

  // Update content when props change
  useEffect(() => {
    pub.setContent(content);
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-generate captions when platforms change
  useEffect(() => {
    if (pub.selectedPlatforms.size > 0 && pub.content) {
      pub.regenerateCaptions();
    }
  }, [pub.selectedPlatforms.size]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedArr = useMemo(
    () => Array.from(pub.selectedPlatforms),
    [pub.selectedPlatforms],
  );

  const handlePublish = async () => {
    const results = await pub.publish();
    onPublishComplete?.(results);
  };

  return (
    <Card className={cn('w-full', compact && 'border-0 shadow-none')}>
      {!compact && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" />
            Publish Everywhere
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={cn(compact && 'p-0')}>
        <Tabs defaultValue="publish" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-8">
            <TabsTrigger value="publish" className="text-xs">Publish</TabsTrigger>
            <TabsTrigger value="captions" className="text-xs">
              Captions ({selectedArr.length})
            </TabsTrigger>
          </TabsList>

          {/* ── PUBLISH TAB ──────────────────────────────────── */}
          <TabsContent value="publish" className="space-y-4 mt-3">
            {/* Platform Picker */}
            <PlatformPicker
              platforms={pub.availablePlatformsForRegion}
              selected={pub.selectedPlatforms}
              connectedPlatforms={pub.connectedPlatforms}
              onToggle={pub.togglePlatform}
              onSelectAll={pub.selectAll}
              onClearAll={pub.clearAll}
              compact={compact}
            />

            {selectedArr.length > 0 && (
              <>
                <Separator />

                {/* Global delivery mode */}
                <div className="space-y-2">
                  <span className="text-xs font-medium">Delivery Mode</span>
                  <DeliveryModeSelector
                    mode={pub.deliveryModes[selectedArr[0]] || 'direct_publish'}
                    onSelect={(mode) => {
                      selectedArr.forEach(id => pub.setDeliveryMode(id, mode));
                    }}
                    compact={compact}
                  />
                </div>

                {/* Global content format */}
                <div className="space-y-2">
                  <span className="text-xs font-medium">Content Format</span>
                  <ContentFormatSelector
                    format={pub.selectedFormats[selectedArr[0]] || 'short_video'}
                    onSelect={(format) => {
                      selectedArr.forEach(id => pub.setFormat(id, format));
                    }}
                    compact={compact}
                  />
                </div>

                {/* Schedule datetime */}
                {showScheduler && pub.deliveryModes[selectedArr[0]] === 'scheduled' && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium">Schedule For</span>
                    <Input
                      type="datetime-local"
                      value={pub.scheduledAt || ''}
                      onChange={e => pub.setScheduledAt(e.target.value || null)}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                <Separator />

                {/* Publish Results */}
                {pub.publishResults.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium">Results</span>
                    {pub.publishResults.map((r, i) => {
                      const reg = PLATFORM_REGISTRY[r.platformId];
                      const Icon = reg?.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {Icon && <Icon className={cn('h-3 w-3', reg.colorClass)} />}
                          <span className="flex-1">{reg?.name || r.platformId}</span>
                          {r.success ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <span className="text-red-500 text-[10px]">{r.error || 'Failed'}</span>
                          )}
                          {r.postUrl && (
                            <a href={r.postUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-[10px] hover:underline">
                              View
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Publish Button */}
                <Button
                  className="w-full gap-2"
                  onClick={handlePublish}
                  disabled={pub.isPublishing || selectedArr.length === 0}
                >
                  {pub.isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Publish to {selectedArr.length} Platform{selectedArr.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          {/* ── CAPTIONS TAB ─────────────────────────────────── */}
          <TabsContent value="captions" className="mt-3">
            {selectedArr.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Select platforms first to generate captions.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Per-Platform Captions</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={pub.regenerateCaptions}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                </div>

                <ScrollArea className={compact ? 'max-h-[300px]' : 'max-h-[400px]'}>
                  <div className="space-y-2 pr-2">
                    {selectedArr.map(platformId => {
                      const caption = pub.captions[platformId];
                      if (!caption) return null;
                      return (
                        <CaptionEditor
                          key={platformId}
                          platformId={platformId}
                          caption={caption}
                          onUpdate={(updates) => pub.updateCaption(platformId, updates)}
                          compact={compact}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
