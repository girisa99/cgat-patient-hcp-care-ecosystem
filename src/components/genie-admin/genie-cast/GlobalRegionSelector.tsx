/**
 * GlobalRegionSelector - Persistent multi-region picker for Genie Cast header
 * 
 * Sits next to ProductSelector in the top bar.
 * Supports batch selection of parent regions (auto-selects all sub-regions).
 * All downstream tabs inherit the selected region context.
 */

import React, { useState } from 'react';
import { Globe, Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { UseGenieCastRegionsReturn } from '@/hooks/useGenieCastRegions';

interface GlobalRegionSelectorProps {
  regions: UseGenieCastRegionsReturn;
  className?: string;
}

export const GlobalRegionSelector: React.FC<GlobalRegionSelectorProps> = ({
  regions,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  const toggleExpand = (parent: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(parent)) next.delete(parent);
      else next.add(parent);
      return next;
    });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe className="w-4 h-4 text-primary flex-shrink-0" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 min-w-[160px] max-w-[240px] justify-between text-xs bg-background border-border"
          >
            <span className="truncate">
              {regions.resolved.hasSelection
                ? regions.summaryLabel
                : 'Select regions…'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[320px] p-0 z-[100000] bg-popover border-border shadow-lg"
          align="start"
        >
          {/* Header with actions */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-xs font-semibold text-foreground">
              Target Regions
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={regions.selectAll}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={regions.clearAll}
              >
                Clear
              </Button>
            </div>
          </div>

          <ScrollArea className="max-h-[360px]">
            <div className="py-1">
              {regions.regionGroups.map((group) => {
                const isFullySelected = regions.isParentFullySelected(group.parent);
                const isPartial = regions.isParentPartiallySelected(group.parent);
                const isExpanded = expandedParents.has(group.parent);

                return (
                  <div key={group.parent}>
                    {/* Parent row */}
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 cursor-pointer"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(group.parent);
                        }}
                      >
                        <ChevronRight
                          className={cn(
                            "w-3 h-3 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </Button>
                      <Checkbox
                        checked={isFullySelected ? true : isPartial ? 'indeterminate' : false}
                        onCheckedChange={() => regions.toggleParent(group.parent)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-xs mr-1">{group.icon}</span>
                      <span className="text-xs font-medium flex-1">{group.parent}</span>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-4"
                      >
                        {group.regions.filter(r =>
                          regions.selectedCodes.includes(r.code)
                        ).length}/{group.regions.length}
                      </Badge>
                    </div>

                    {/* Sub-regions (expandable) */}
                    {isExpanded && (
                      <div className="pl-10 pb-1">
                        {group.regions.map((sub) => {
                          const isSelected = regions.selectedCodes.includes(sub.code);
                          return (
                            <div
                              key={sub.code}
                              className="flex items-center gap-2 px-2 py-1 hover:bg-muted/30 rounded-sm cursor-pointer"
                              onClick={() => regions.toggleSubRegion(sub.code)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => regions.toggleSubRegion(sub.code)}
                                className="h-3 w-3"
                              />
                              <span className="text-[11px] flex-1 truncate">{sub.label}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {sub.llm}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer summary */}
          {regions.resolved.hasSelection && (
            <>
              <Separator />
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {regions.resolved.totalSubRegions} sub-regions • {regions.resolved.languages.length} languages
                </span>
                <Button
                  variant="default"
                  size="sm"
                  className="h-6 text-[10px] px-3"
                  onClick={() => setOpen(false)}
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* Quick badges for selected parents */}
      {regions.resolved.selectedParents.length > 0 && regions.resolved.selectedParents.length <= 3 && (
        <div className="hidden lg:flex items-center gap-1">
          {regions.resolved.selectedParents.map(p => {
            const group = regions.regionGroups.find(g => g.parent === p);
            return (
              <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 h-5 gap-0.5">
                {group?.icon} {p}
                <X
                  className="w-2.5 h-2.5 ml-0.5 cursor-pointer opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    regions.toggleParent(p);
                  }}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
