/**
 * PlatformSelector - Template suggests platforms, user can override
 * Used inside OverviewTab to show and edit target platforms
 */

import React, { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  TARGET_PLATFORMS,
  getPlatformsByCategory,
  getPlatformCategories,
  type TargetPlatformDef,
} from '@/config/target-platforms-registry';

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  suggestedPlatforms: string[]; // from template
  onPlatformsChange: (platforms: string[]) => void;
  readOnly?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  social: 'Social Media',
  web: 'Web & Marketing',
  messaging: 'Messaging',
  broadcast: 'Broadcast & Display',
  presentation: 'Presentations',
};

export function PlatformSelector({
  selectedPlatforms,
  suggestedPlatforms,
  onPlatformsChange,
  readOnly = false,
}: PlatformSelectorProps) {
  const [open, setOpen] = useState(false);

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== id));
    } else {
      onPlatformsChange([...selectedPlatforms, id]);
    }
  };

  const categories = getPlatformCategories();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Target Platforms</h3>
        {!readOnly && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Add Platform
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0 bg-popover border-border shadow-lg z-[100000]" 
              align="end"
            >
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-3">
                {categories.map(cat => {
                  const platforms = getPlatformsByCategory(cat);
                  return (
                    <div key={cat}>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
                        {CATEGORY_LABELS[cat] || cat}
                      </p>
                      <div className="space-y-0.5">
                        {platforms.map(p => {
                          const isSelected = selectedPlatforms.includes(p.id);
                          const isSuggested = suggestedPlatforms.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              className={cn(
                                "w-full flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-accent/50 transition-colors",
                                isSelected && "bg-primary/10"
                              )}
                              onClick={() => togglePlatform(p.id)}
                            >
                              <div className="flex items-center gap-2">
                                <span>{p.label}</span>
                                {isSuggested && !isSelected && (
                                  <Badge variant="outline" className="text-[8px] h-3.5 px-1">suggested</Badge>
                                )}
                              </div>
                              {isSelected && <Check className="h-3 w-3 text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {selectedPlatforms.map(id => {
          const platform = TARGET_PLATFORMS.find(p => p.id === id);
          const isSuggested = suggestedPlatforms.includes(id);
          return (
            <Badge
              key={id}
              variant="secondary"
              className={cn(
                "capitalize gap-1 pr-1",
                isSuggested && "border border-primary/30"
              )}
            >
              {platform?.label || id.replace(/_/g, ' ')}
              {isSuggested && (
                <span className="text-[8px] text-primary ml-0.5">★</span>
              )}
              {!readOnly && (
                <button
                  className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5"
                  onClick={() => togglePlatform(id)}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </Badge>
          );
        })}
        {selectedPlatforms.length === 0 && (
          <span className="text-xs text-muted-foreground">No platforms selected — click "Add Platform" to target outputs</span>
        )}
      </div>
    </div>
  );
}
