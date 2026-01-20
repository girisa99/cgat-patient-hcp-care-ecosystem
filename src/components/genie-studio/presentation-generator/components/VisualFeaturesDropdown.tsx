/**
 * Visual Features Multi-Select Dropdown
 * Clean dropdown with sub-options for each visual feature category
 */

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Visual feature definitions with sub-options
export const VISUAL_FEATURES = [
  {
    id: 'infographics',
    name: 'Infographics',
    icon: BarChart3,
    description: 'Data visualizations and info graphics',
    subOptions: [
      { id: 'comparison', name: 'Comparison Charts' },
      { id: 'process-flow', name: 'Process Flow' },
      { id: 'statistics', name: 'Statistics Display' },
      { id: 'icon-grid', name: 'Icon Grid' },
    ],
  },
  {
    id: 'journey-maps',
    name: 'Journey Maps',
    icon: Map,
    description: 'User journey and experience maps',
    subOptions: [
      { id: 'customer-journey', name: 'Customer Journey' },
      { id: 'user-flow', name: 'User Flow' },
      { id: 'roadmap', name: 'Product Roadmap' },
      { id: 'milestone', name: 'Milestone Map' },
    ],
  },
  {
    id: 'data-tables',
    name: 'Data Tables',
    icon: Table2,
    description: 'Structured data presentations',
    subOptions: [
      { id: 'comparison-table', name: 'Comparison Table' },
      { id: 'pricing-table', name: 'Pricing Table' },
      { id: 'feature-matrix', name: 'Feature Matrix' },
      { id: 'data-grid', name: 'Data Grid' },
    ],
  },
  {
    id: 'charts',
    name: 'Charts',
    icon: PieChart,
    description: 'Various chart types for data',
    subOptions: [
      { id: 'bar-chart', name: 'Bar Chart' },
      { id: 'line-chart', name: 'Line Chart' },
      { id: 'pie-chart', name: 'Pie Chart' },
      { id: 'area-chart', name: 'Area Chart' },
      { id: 'donut-chart', name: 'Donut Chart' },
    ],
  },
  {
    id: 'timelines',
    name: 'Timelines',
    icon: Clock,
    description: 'Chronological presentations',
    subOptions: [
      { id: 'horizontal', name: 'Horizontal Timeline' },
      { id: 'vertical', name: 'Vertical Timeline' },
      { id: 'milestone-timeline', name: 'Milestone Timeline' },
      { id: 'gantt', name: 'Gantt Chart' },
    ],
  },
  {
    id: 'diagrams',
    name: 'Diagrams',
    icon: Network,
    description: 'Structural and flow diagrams',
    subOptions: [
      { id: 'flowchart', name: 'Flowchart' },
      { id: 'org-chart', name: 'Org Chart' },
      { id: 'mind-map', name: 'Mind Map' },
      { id: 'venn', name: 'Venn Diagram' },
      { id: 'hierarchy', name: 'Hierarchy' },
    ],
  },
  {
    id: 'quote-blocks',
    name: 'Quote Blocks',
    icon: Quote,
    description: 'Testimonials and callouts',
    subOptions: [
      { id: 'testimonial', name: 'Testimonial' },
      { id: 'pull-quote', name: 'Pull Quote' },
      { id: 'callout', name: 'Callout Box' },
      { id: 'highlight', name: 'Highlight Block' },
    ],
  },
  {
    id: 'icon-sets',
    name: 'Icon Sets',
    icon: Shapes,
    description: 'Icon-based visual elements',
    subOptions: [
      { id: 'feature-icons', name: 'Feature Icons' },
      { id: 'step-icons', name: 'Step Icons' },
      { id: 'category-icons', name: 'Category Icons' },
      { id: 'status-icons', name: 'Status Icons' },
    ],
  },
];

export interface VisualFeatureSelection {
  featureId: string;
  subOptions: string[];
}

interface VisualFeaturesDropdownProps {
  value: VisualFeatureSelection[];
  onChange: (selections: VisualFeatureSelection[]) => void;
  className?: string;
}

export function VisualFeaturesDropdown({
  value,
  onChange,
  className,
}: VisualFeaturesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<string[]>([]);

  const toggleFeature = (featureId: string) => {
    const existing = value.find(v => v.featureId === featureId);
    if (existing) {
      onChange(value.filter(v => v.featureId !== featureId));
      // Collapse when deselecting
      setExpandedFeatures(prev => prev.filter(f => f !== featureId));
    } else {
      onChange([...value, { featureId, subOptions: [] }]);
      // Auto-expand when selecting to show sub-options
      if (!expandedFeatures.includes(featureId)) {
        setExpandedFeatures(prev => [...prev, featureId]);
      }
    }
  };

  const toggleSubOption = (featureId: string, subOptionId: string) => {
    const existing = value.find(v => v.featureId === featureId);
    if (existing) {
      const hasSubOption = existing.subOptions.includes(subOptionId);
      const newSubOptions = hasSubOption
        ? existing.subOptions.filter(s => s !== subOptionId)
        : [...existing.subOptions, subOptionId];
      onChange(
        value.map(v =>
          v.featureId === featureId ? { ...v, subOptions: newSubOptions } : v
        )
      );
    } else {
      onChange([...value, { featureId, subOptions: [subOptionId] }]);
    }
  };

  const toggleExpandFeature = (featureId: string) => {
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
    return value.reduce((acc, v) => acc + (v.subOptions.length || 1), 0);
  };

  const clearAll = () => {
    onChange([]);
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
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-sm font-medium">Visual Features</span>
          {value.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground"
              onClick={clearAll}
            >
              Clear All
            </Button>
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

              return (
                <div key={feature.id} className="space-y-1">
                  <div
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md transition-colors',
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted border border-transparent'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleFeature(feature.id)}
                      className="pointer-events-auto"
                    />
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleFeature(feature.id)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandFeature(feature.id);
                      }}
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
                      {feature.subOptions.map(subOption => (
                        <div
                          key={subOption.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                            isSubOptionSelected(feature.id, subOption.id)
                              ? 'bg-primary/5'
                              : 'hover:bg-muted/50'
                          )}
                          onClick={() => toggleSubOption(feature.id, subOption.id)}
                        >
                          <Checkbox
                            checked={isSubOptionSelected(feature.id, subOption.id)}
                            className="pointer-events-none"
                          />
                          <span className="text-sm">{subOption.name}</span>
                        </div>
                      ))}
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
