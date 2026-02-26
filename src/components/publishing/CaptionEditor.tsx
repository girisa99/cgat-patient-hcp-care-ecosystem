/**
 * CaptionEditor — Per-platform caption editor with char counter, hashtags, language indicator.
 */

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SocialPlatformId, PlatformCaption } from '@/types/publishing';
import { PLATFORM_REGISTRY } from '@/services/publishing/platformRegistry';

interface CaptionEditorProps {
  platformId: SocialPlatformId;
  caption: PlatformCaption;
  onUpdate: (updates: Partial<PlatformCaption>) => void;
  compact?: boolean;
}

export const CaptionEditor: React.FC<CaptionEditorProps> = ({
  platformId,
  caption,
  onUpdate,
  compact = false,
}) => {
  const registry = PLATFORM_REGISTRY[platformId];
  if (!registry) return null;

  const limits = registry.captionLimits;
  const captionLen = caption.shortCaption?.length || 0;
  const descLen = caption.longDescription?.length || 0;
  const isOverLimit = limits.shortCaptionMax > 0 && captionLen > limits.shortCaptionMax;
  const Icon = registry.icon;

  return (
    <div className={cn(
      'rounded-lg border p-3 space-y-2',
      caption.isRTL ? 'text-right' : 'text-left',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-3.5 w-3.5', registry.colorClass)} />
          <span className="text-xs font-medium">{registry.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {caption.isRTL && (
            <Badge variant="outline" className="text-[9px] h-4 px-1">RTL</Badge>
          )}
          <Badge variant="secondary" className="text-[9px] h-4 px-1">
            {caption.language}
          </Badge>
        </div>
      </div>

      {/* Short Caption */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-muted-foreground">Caption</label>
          <span className={cn(
            'text-[10px]',
            isOverLimit ? 'text-red-500 font-medium' : 'text-muted-foreground',
          )}>
            {captionLen}/{limits.shortCaptionMax || limits.descriptionMax}
          </span>
        </div>
        <Input
          value={caption.shortCaption}
          onChange={e => onUpdate({ shortCaption: e.target.value })}
          className={cn('text-xs h-8', caption.isRTL && 'text-right dir-rtl')}
          dir={caption.isRTL ? 'rtl' : 'ltr'}
          placeholder={`Caption for ${registry.name}...`}
        />
      </div>

      {/* Long Description (if platform supports it) */}
      {!compact && limits.descriptionMax > 300 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-muted-foreground">Description</label>
            <span className="text-[10px] text-muted-foreground">
              {descLen}/{limits.descriptionMax}
            </span>
          </div>
          <Textarea
            value={caption.longDescription || ''}
            onChange={e => onUpdate({ longDescription: e.target.value })}
            className={cn('text-xs min-h-[60px]', caption.isRTL && 'text-right')}
            dir={caption.isRTL ? 'rtl' : 'ltr'}
            rows={2}
            placeholder="Detailed description..."
          />
        </div>
      )}

      {/* Hashtags */}
      {limits.hashtagMax > 0 && (
        <div>
          <label className="text-[10px] text-muted-foreground">
            Hashtags ({caption.hashtags?.length || 0}/{limits.hashtagMax})
          </label>
          <div className="flex flex-wrap gap-1 mt-1">
            {caption.hashtags?.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[9px] h-4 px-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => {
                  const next = [...caption.hashtags];
                  next.splice(i, 1);
                  onUpdate({ hashtags: next });
                }}
              >
                {tag} &times;
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
