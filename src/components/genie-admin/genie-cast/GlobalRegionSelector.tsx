/**
 * GlobalRegionSelector - Persistent multi-region picker for Genie Cast header
 * 
 * 3-level hierarchy matching LandingPageScriptsPanel:
 *   Parent Group → Zone → Country/Language
 * 
 * Supports batch select-all, expandable groups, and scrollable dropdown.
 */

import React, { useState } from 'react';
import { Globe, ChevronDown, ChevronRight, X, Minus } from 'lucide-react';
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
import { getGroupSelectedCount, getGroupLeafCount, type RegionChild } from '@/config/regionHierarchy';
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());

  const toggleExpandGroup = (code: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const toggleExpandZone = (code: string) => {
    setExpandedZones(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const renderZoneChildren = (zone: RegionChild, depth: number) => {
    if (!zone.children || zone.children.length === 0) return null;
    return (
      <div className={cn("pb-0.5", depth === 2 ? "pl-6" : "pl-4")}>
        {zone.children.map(leaf => (
          <div
            key={leaf.code}
            className="flex items-center gap-2 px-2 py-0.5 hover:bg-muted/30 rounded-sm cursor-pointer"
            onClick={() => regions.toggleLeaf(leaf.code)}
          >
            <Checkbox
              checked={regions.selectedCodes.includes(leaf.code)}
              onCheckedChange={() => regions.toggleLeaf(leaf.code)}
              className="h-3 w-3"
            />
            <span className="text-[10px]">{leaf.flag}</span>
            <span className="text-[10px] truncate flex-1">{leaf.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe className="w-4 h-4 text-primary flex-shrink-0" />
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 min-w-[160px] max-w-[260px] justify-between text-xs bg-background border-border"
          >
            <span className="truncate">
              {regions.resolved.hasSelection ? regions.summaryLabel : 'Select regions…'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[360px] p-0 z-[100000] bg-popover border-border shadow-lg"
          align="start"
          side="bottom"
          sideOffset={4}
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 sticky top-0 z-10">
            <span className="text-xs font-semibold text-foreground">
              🌍 Target Regions
              {regions.resolved.hasSelection && (
                <span className="ml-2 text-muted-foreground font-normal">
                  ({regions.resolved.totalSelected}/{regions.resolved.totalAvailable})
                </span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={regions.selectAll}>
                All
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={regions.clearAll}>
                Clear
              </Button>
            </div>
          </div>

          {/* Scrollable region list */}
          <ScrollArea className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
            <div className="py-1">
              {regions.hierarchy.map((group) => {
                const groupStatus = regions.getGroupStatus(group);
                const isExpanded = expandedGroups.has(group.groupCode);
                const selCount = getGroupSelectedCount(group, regions.selectedCodes);
                const leafCount = getGroupLeafCount(group);
                const isSingleNode = group.children.length === 0;

                return (
                  <div key={group.groupCode} className="border-b border-border/30 last:border-b-0">
                    {/* Parent group row */}
                    <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-muted/40 cursor-pointer">
                      {!isSingleNode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 flex-shrink-0"
                          onClick={(e) => { e.stopPropagation(); toggleExpandGroup(group.groupCode); }}
                        >
                          <ChevronRight className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-90")} />
                        </Button>
                      )}
                      {isSingleNode && <div className="w-5" />}
                      <Checkbox
                        checked={groupStatus === 'all' ? true : groupStatus === 'partial' ? 'indeterminate' : false}
                        onCheckedChange={() => regions.toggleGroup(group)}
                        className="h-3.5 w-3.5 flex-shrink-0"
                      />
                      <span className="text-xs mr-0.5">{group.groupFlag}</span>
                      <span className="text-xs font-medium flex-1 truncate">{group.groupName}</span>
                      {!isSingleNode && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 flex-shrink-0">
                          {selCount}/{leafCount}
                        </Badge>
                      )}
                    </div>

                    {/* Expanded zones */}
                    {isExpanded && group.children.length > 0 && (
                      <div className="pl-5 pb-1">
                        {group.children.map((zone) => {
                          const hasGrandchildren = zone.children && zone.children.length > 0;
                          const zoneStatus = regions.getZoneStatus(zone);
                          const isZoneExpanded = expandedZones.has(zone.code);

                          return (
                            <div key={zone.code}>
                              <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-muted/30 rounded-sm cursor-pointer">
                                {hasGrandchildren ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 flex-shrink-0"
                                    onClick={(e) => { e.stopPropagation(); toggleExpandZone(zone.code); }}
                                  >
                                    <ChevronRight className={cn("w-2.5 h-2.5 transition-transform", isZoneExpanded && "rotate-90")} />
                                  </Button>
                                ) : (
                                  <div className="w-4" />
                                )}
                                <Checkbox
                                  checked={zoneStatus === 'all' ? true : zoneStatus === 'partial' ? 'indeterminate' : false}
                                  onCheckedChange={() => regions.toggleZone(zone)}
                                  className="h-3 w-3 flex-shrink-0"
                                />
                                <span className="text-[10px] mr-0.5">{zone.flag}</span>
                                <span className="text-[11px] flex-1 truncate">{zone.name}</span>
                                {hasGrandchildren && (
                                  <span className="text-[9px] text-muted-foreground flex-shrink-0">
                                    {zone.children!.filter(c => regions.selectedCodes.includes(c.code)).length}/{zone.children!.length}
                                  </span>
                                )}
                              </div>

                              {/* Grandchildren (country/language level) */}
                              {isZoneExpanded && hasGrandchildren && renderZoneChildren(zone, 2)}
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

          {/* Footer */}
          <div className="px-3 py-2 border-t bg-muted/20 flex items-center justify-between sticky bottom-0">
            <span className="text-[10px] text-muted-foreground">
              {regions.resolved.totalSelected} of {regions.resolved.totalAvailable} selected
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
        </PopoverContent>
      </Popover>

      {/* Quick badges for selected parents (max 3) */}
      {regions.resolved.selectedParents.length > 0 && regions.resolved.selectedParents.length <= 3 && (
        <div className="hidden lg:flex items-center gap-1">
          {regions.resolved.selectedParents.map(p => {
            const group = regions.hierarchy.find(g => g.groupCode === p);
            return (
              <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 h-5 gap-0.5">
                {group?.groupFlag} {group?.groupName || p}
                <X
                  className="w-2.5 h-2.5 ml-0.5 cursor-pointer opacity-60 hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); regions.toggleGroup(group!); }}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
