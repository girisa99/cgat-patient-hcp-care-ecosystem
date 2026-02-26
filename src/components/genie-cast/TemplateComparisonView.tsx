/**
 * Template Comparison View
 * Side-by-side comparison of 2-3 templates showing flow, duration, platforms, styles, and capabilities
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  Layers,
  Target,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Globe2,
  User,
  Box,
  Video,
  Palette,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';

interface TemplateComparisonViewProps {
  blueprints: VideoBlueprint[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (blueprint: VideoBlueprint) => void;
  onRemove?: (blueprintId: string) => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

// Comparison row component
function ComparisonRow({
  label,
  icon,
  values,
  type = 'text',
}: {
  label: string;
  icon: React.ReactNode;
  values: (string | boolean | string[] | React.ReactNode)[];
  type?: 'text' | 'boolean' | 'tags' | 'custom';
}) {
  return (
    <div className="grid items-start border-b border-border/30 py-3" style={{ gridTemplateColumns: `180px repeat(${values.length}, 1fr)` }}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground pr-3">
        {icon}
        {label}
      </div>
      {values.map((val, idx) => (
        <div key={idx} className="px-3 text-sm">
          {type === 'boolean' ? (
            val ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground/40" />
            )
          ) : type === 'tags' && Array.isArray(val) ? (
            <div className="flex flex-wrap gap-1">
              {(val as string[]).length > 0 ? (val as string[]).slice(0, 4).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[10px] h-4 capitalize">
                  {tag.replace(/_/g, ' ')}
                </Badge>
              )) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
              {(val as string[]).length > 4 && (
                <Badge variant="outline" className="text-[10px] h-4">
                  +{(val as string[]).length - 4}
                </Badge>
              )}
            </div>
          ) : type === 'custom' ? (
            val
          ) : (
            <span className="text-xs">{val as string || '—'}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function TemplateComparisonView({
  blueprints,
  isOpen,
  onClose,
  onSelect,
  onRemove,
}: TemplateComparisonViewProps) {
  if (blueprints.length === 0) return null;

  const getSettings = (bp: VideoBlueprint) => (bp.default_settings as any) || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl p-0 bg-background/95 backdrop-blur-xl border-border/50 !flex !flex-col overflow-hidden"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Compare Templates ({blueprints.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 pt-2">
            {/* Template Headers */}
            <div
              className="grid items-end border-b border-border/50 pb-4 mb-2"
              style={{ gridTemplateColumns: `180px repeat(${blueprints.length}, 1fr)` }}
            >
              <div /> {/* spacer for label column */}
              {blueprints.map(bp => (
                <div key={bp.id} className="px-3 space-y-2">
                  {/* Thumbnail */}
                  <div className="relative h-24 rounded-lg overflow-hidden bg-muted/30 border border-border/50">
                    {bp.thumbnail_url ? (
                      <img src={bp.thumbnail_url} alt={bp.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <Video className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {onRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-5 w-5 p-0 bg-background/80 hover:bg-background"
                        onClick={() => onRemove(bp.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold line-clamp-1">{bp.name}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{bp.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="space-y-0">
              <ComparisonRow
                label="Category"
                icon={<Target className="h-3 w-3" />}
                values={blueprints.map(bp => (
                  <Badge variant="outline" className="text-[10px] capitalize">{bp.category}</Badge>
                ))}
                type="custom"
              />

              <ComparisonRow
                label="Duration"
                icon={<Clock className="h-3 w-3" />}
                values={blueprints.map(bp => formatDuration(bp.estimated_duration_seconds))}
              />

              <ComparisonRow
                label="Template Type"
                icon={<Sparkles className="h-3 w-3" />}
                values={blueprints.map(bp => bp.is_system_default ? 'Built-in' : 'Custom')}
              />

              <ComparisonRow
                label="Usage Count"
                icon={<Target className="h-3 w-3" />}
                values={blueprints.map(bp => `${bp.usage_count} uses`)}
              />

              <ComparisonRow
                label="Style Intent"
                icon={<Palette className="h-3 w-3" />}
                values={blueprints.map(bp => (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {bp.style_intent || 'Default'}
                  </Badge>
                ))}
                type="custom"
              />

              <ComparisonRow
                label="Tone"
                icon={<Palette className="h-3 w-3" />}
                values={blueprints.map(bp => bp.tone_modifier || 'Default')}
              />

              <ComparisonRow
                label="Target Platforms"
                icon={<Layers className="h-3 w-3" />}
                values={blueprints.map(bp => bp.target_platform || [])}
                type="tags"
              />

              <ComparisonRow
                label="Industry Tags"
                icon={<Globe2 className="h-3 w-3" />}
                values={blueprints.map(bp => bp.industry_tags || [])}
                type="tags"
              />

              <ComparisonRow
                label="Target Regions"
                icon={<Globe2 className="h-3 w-3" />}
                values={blueprints.map(bp => bp.target_regions || [])}
                type="tags"
              />

              <ComparisonRow
                label="Aesthetic Keywords"
                icon={<Sparkles className="h-3 w-3" />}
                values={blueprints.map(bp => bp.aesthetic_keywords || [])}
                type="tags"
              />

              {/* Capability Matrix */}
              <ComparisonRow
                label="Avatar"
                icon={<User className="h-3 w-3" />}
                values={blueprints.map(bp => getSettings(bp).avatarEnabled || false)}
                type="boolean"
              />

              <ComparisonRow
                label="3D Generation"
                icon={<Box className="h-3 w-3" />}
                values={blueprints.map(bp => getSettings(bp)['3dEnabled'] || false)}
                type="boolean"
              />

              <ComparisonRow
                label="Animation"
                icon={<Video className="h-3 w-3" />}
                values={blueprints.map(bp => getSettings(bp).animationEnabled || false)}
                type="boolean"
              />

              <ComparisonRow
                label="AR/VR"
                icon={<Box className="h-3 w-3" />}
                values={blueprints.map(bp => getSettings(bp).arvrEnabled || false)}
                type="boolean"
              />

              <ComparisonRow
                label="Lipsync"
                icon={<User className="h-3 w-3" />}
                values={blueprints.map(bp => getSettings(bp).lipsyncEnabled || false)}
                type="boolean"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 flex justify-between items-center bg-background flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            Select a template to use it in your production
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {blueprints.map(bp => (
              <Button
                key={bp.id}
                size="sm"
                variant="outline"
                className="gap-1 text-xs"
                onClick={() => { onSelect(bp); onClose(); }}
              >
                <Play className="h-3 w-3" />
                Use "{bp.name.length > 15 ? bp.name.slice(0, 15) + '…' : bp.name}"
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateComparisonView;
