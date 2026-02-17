/**
 * Visual Features Multi-Select Dropdown
 * Clean dropdown with sub-options for each visual feature category
 * Now uses EXPANDED_VISUAL_FEATURES for comprehensive coverage
 * ENHANCED: Includes compatibility badges from visualOutputCompatibilityMatrix
 */

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Map,
  Table2,
  PieChart,
  Clock,
  Network,
  Quote,
  Shapes,
  X,
  Check,
  ImagePlus,
  Video,
  AudioLines,
  Sparkles,
  Box,
  Orbit,
  Clapperboard,
  Smartphone,
  MousePointerClick,
  FormInput,
  HelpCircle,
  Filter,
  Activity,
  LayoutGrid,
  LayoutTemplate,
  LucideIcon,
  AlertTriangle,
  CheckCircle2,
  Star,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  EXPANDED_VISUAL_FEATURES, 
  VISUAL_FEATURE_CATEGORIES,
  type ExpandedVisualFeature 
} from '../constants/expandedVisualFeatures';
import {
  getCompatibility,
  getVisualFeaturesForOutput,
  CompatibilityLevel,
  CompatibilityLevelColors,
  CompatibilityLevelLabels,
} from '../services/visualOutputCompatibilityMatrix';
import type { ExpandedOutputType } from '../constants/expandedOutputTypes';

// Icon mapping for expanded visual features
const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3, Map, Table2, PieChart, Clock, Network, Quote, Shapes,
  ImagePlus, Video, AudioLines, Sparkles, Box, Orbit, Clapperboard,
  Smartphone, MousePointerClick, FormInput, HelpCircle, Filter,
  Activity, LayoutGrid, LayoutTemplate,
};

// Legacy export for backward compatibility
export const VISUAL_FEATURES = EXPANDED_VISUAL_FEATURES.map(f => ({
  id: f.id,
  name: f.name,
  icon: ICON_MAP[f.icon] || BarChart3,
  description: f.description,
  category: f.category,
  tier: f.tier,
  subOptions: f.subOptions.map(s => ({
    id: s.id,
    name: s.name,
    tier: s.tier,
  })),
}));

export interface VisualFeatureSelection {
  featureId: string;
  subOptions: string[];
  // NEW: Optional label for display
  label?: string;
}

interface VisualFeaturesDropdownProps {
  value: VisualFeatureSelection[];
  onChange: (selections: VisualFeatureSelection[]) => void;
  className?: string;
  // NEW: Output types for compatibility checking
  selectedOutputTypes?: ExpandedOutputType[];
  // NEW: Global tier filter
  globalTier?: 1 | 2 | 3;
  // NEW: Show compatibility badges
  showCompatibility?: boolean;
}

// Compatibility icon helper
const getCompatibilityIcon = (level: CompatibilityLevel) => {
  switch (level) {
    case 'optimal': return CheckCircle2;
    case 'compatible': return Check;
    case 'warning': return AlertTriangle;
    case 'incompatible': return X;
    default: return Info;
  }
};

export function VisualFeaturesDropdown({
  value,
  onChange,
  className,
  selectedOutputTypes = [],
  globalTier = 3,
  showCompatibility = true,
}: VisualFeaturesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<string[]>([]);

  const toggleFeature = (featureId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const existing = value.find(v => v.featureId === featureId);
    if (existing) {
      // Deselecting: remove from value and collapse
      const newValue = value.filter(v => v.featureId !== featureId);
      onChange(newValue);
      setExpandedFeatures(prev => prev.filter(f => f !== featureId));
    } else {
      // Selecting: add to value and auto-expand
      const newValue = [...value, { featureId, subOptions: [] }];
      onChange(newValue);
      if (!expandedFeatures.includes(featureId)) {
        setExpandedFeatures(prev => [...prev, featureId]);
      }
    }
  };

  const toggleSubOption = (featureId: string, subOptionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Create a new copy of value to avoid mutation
    const newValue = [...value];
    const existingIndex = newValue.findIndex(v => v.featureId === featureId);
    
    if (existingIndex >= 0) {
      // Feature already selected - toggle the sub-option
      const existing = newValue[existingIndex];
      const hasSubOption = existing.subOptions.includes(subOptionId);
      const newSubOptions = hasSubOption
        ? existing.subOptions.filter(s => s !== subOptionId)
        : [...existing.subOptions, subOptionId];
      
      newValue[existingIndex] = { ...existing, subOptions: newSubOptions };
      onChange(newValue);
    } else {
      // Feature not selected yet - add it with this sub-option
      onChange([...newValue, { featureId, subOptions: [subOptionId] }]);
      // Also expand the feature
      if (!expandedFeatures.includes(featureId)) {
        setExpandedFeatures(prev => [...prev, featureId]);
      }
    }
  };

  const toggleExpandFeature = (featureId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const isFeatureSelected = (featureId: string) =>
    value.some(v => v.featureId === featureId);

  const isSubOptionSelected = (featureId: string, subOptionId: string) => {
    const feature = value.find(v => v.featureId === featureId);
    return feature?.subOptions.includes(subOptionId) ?? false;
  };

  const getSelectionCount = () => {
    return value.reduce((acc, v) => acc + Math.max(v.subOptions.length, 1), 0);
  };

  const clearAll = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange([]);
    setExpandedFeatures([]);
  };

  const displayText =
    value.length === 0
      ? 'Select visual features...'
      : `${value.length} feature${value.length > 1 ? 's' : ''} (${getSelectionCount()} items)`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-10 text-sm font-normal bg-background',
            className
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0 z-50 bg-popover border shadow-lg"
        align="start"
      >
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Visual Features</span>
            {value.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground"
                onClick={(e) => clearAll(e)}
              >
                Clear All
              </Button>
            )}
          </div>
          
          {/* NEW: Compatibility Legend when output is selected */}
          {showCompatibility && selectedOutputTypes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-[10px]">
              <span className="text-muted-foreground">Compatibility:</span>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0">
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                Optimal
              </Badge>
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                Limited
              </Badge>
            </div>
          )}
        </div>
        <ScrollArea className="h-[320px]">
          <div className="p-2 space-y-1">
            {VISUAL_FEATURES.map(feature => {
              const Icon = feature.icon;
              const isSelected = isFeatureSelected(feature.id);
              const isExpanded = expandedFeatures.includes(feature.id);
              const selectedSubCount =
                value.find(v => v.featureId === feature.id)?.subOptions.length || 0;
              
              // NEW: Get compatibility for first selected output type
              const compatibility = showCompatibility && selectedOutputTypes.length > 0
                ? getCompatibility(selectedOutputTypes[0], feature.id)
                : null;
              const CompatIcon = compatibility ? getCompatibilityIcon(compatibility.level) : null;
              const isRecommended = compatibility?.level === 'optimal';
              const hasWarning = compatibility?.level === 'warning' || compatibility?.level === 'incompatible';

              return (
                <div key={feature.id} className="space-y-1">
                  <div
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : hasWarning
                        ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent'
                        : isRecommended
                        ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent'
                        : 'hover:bg-muted border border-transparent'
                    )}
                  >
                    <button
                      type="button"
                      className="shrink-0"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => toggleFeature(feature.id, e)}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-sm border flex items-center justify-center",
                        isSelected 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-input"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={(e) => toggleFeature(feature.id, e)}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{feature.name}</p>
                        {selectedSubCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1">
                            {selectedSubCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {feature.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={(e) => toggleExpandFeature(feature.id, e)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="ml-8 pl-2 border-l-2 border-muted space-y-1">
                      {feature.subOptions.map(subOption => {
                        const isChecked = isSubOptionSelected(feature.id, subOption.id);
                        return (
                          <button
                            type="button"
                            key={subOption.id}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors select-none w-full text-left',
                              isChecked
                                ? 'bg-primary/10 border border-primary/30'
                                : 'hover:bg-muted/50 border border-transparent'
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSubOption(feature.id, subOption.id);
                            }}
                          >
                            <div className={cn(
                              "h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center",
                              isChecked 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "border-input"
                            )}>
                              {isChecked && <Check className="h-3 w-3" />}
                            </div>
                            <span className="text-sm flex-1">{subOption.name}</span>
                            {isChecked && (
                              <Check className="h-3 w-3 text-primary shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Selected Summary */}
        {value.length > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1">
              {value.slice(0, 4).map(selection => {
                const feature = VISUAL_FEATURES.find(f => f.id === selection.featureId);
                if (!feature) return null;
                return (
                  <Badge
                    key={selection.featureId}
                    variant="secondary"
                    className="text-xs gap-1"
                  >
                    {feature.name}
                    {selection.subOptions.length > 0 && (
                      <span className="text-muted-foreground">
                        ({selection.subOptions.length})
                      </span>
                    )}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFeature(selection.featureId);
                      }}
                    />
                  </Badge>
                );
              })}
              {value.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{value.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
