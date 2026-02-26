/**
 * PlatformPicker — Grid of 12+ platform cards with connected/enabled badges + region filter.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SocialPlatformId } from '@/types/publishing';
import type { UnifiedPlatformDef } from '@/services/publishing/platformRegistry';

interface PlatformPickerProps {
  platforms: UnifiedPlatformDef[];
  selected: Set<SocialPlatformId>;
  connectedPlatforms: SocialPlatformId[];
  onToggle: (id: SocialPlatformId) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  compact?: boolean;
}

export const PlatformPicker: React.FC<PlatformPickerProps> = ({
  platforms,
  selected,
  connectedPlatforms,
  onToggle,
  onSelectAll,
  onClearAll,
  compact = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Platforms ({selected.size} selected)</span>
        <div className="flex gap-2">
          {onSelectAll && (
            <button
              onClick={onSelectAll}
              className="text-xs text-primary hover:underline"
            >
              Select All
            </button>
          )}
          {onClearAll && selected.size > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className={cn(
        'grid gap-2',
        compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
      )}>
        {platforms.map(platform => {
          const isSelected = selected.has(platform.id);
          const isConnected = connectedPlatforms.includes(platform.id);
          const Icon = platform.icon;

          return (
            <button
              key={platform.id}
              onClick={() => onToggle(platform.id)}
              className={cn(
                'relative flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30',
              )}
            >
              <div className={cn('shrink-0 rounded-md p-1.5', platform.bgColor)}>
                <Icon className={cn('h-4 w-4', platform.colorClass)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{platform.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {isConnected && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  )}
                  <span className="text-[10px] text-muted-foreground">{platform.tier}</span>
                </div>
              </div>
              {isSelected && (
                <Badge variant="default" className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[8px]">
                  &#10003;
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
