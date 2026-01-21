/**
 * Output Type Multi-Select Dropdown
 * Clean dropdown for selecting output types with sub-options
 * Now uses expanded output types with clear tiering
 */

import React, { useState } from 'react';
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
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
  Box,
  Orbit,
  Video,
  Film,
  MousePointerClick,
  Layers,
  Check,
  X,
  FileText,
  Presentation,
  Printer,
  Code,
  Share2,
  Glasses,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  EXPANDED_OUTPUT_CONFIGS, 
  ExpandedOutputType, 
  ExpandedOutputConfig,
  OUTPUT_TIERS,
  OUTPUT_CATEGORIES 
} from '../constants/expandedOutputTypes';
import { OutputType as LegacyOutputType } from '../types';

// Support both old and new output types
type AnyOutputType = ExpandedOutputType | LegacyOutputType;

// Icon mapping - expanded for all output types
const OUTPUT_ICONS: Record<string, React.ElementType> = {
  'Image': ImageIcon,
  'Sparkles': Sparkles,
  'Box': Box,
  'Orbit': Orbit,
  'Video': Video,
  'Film': Film,
  'MousePointerClick': MousePointerClick,
  'Layers': Layers,
  'FileText': FileText,
  'Presentation': Presentation,
  'Printer': Printer,
  'Code': Code,
  'Share2': Share2,
  'Glasses': Glasses,
  'Smartphone': Smartphone,
};

// Tier configuration with proper visibility
const TIER_CONFIG: Record<number, { label: string; description: string; className: string }> = {
  1: { 
    label: 'Standard', 
    description: 'Fast generation, lower resource usage',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
  },
  2: { 
    label: 'Advanced', 
    description: 'Balanced quality and speed',
    className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
  },
  3: { 
    label: 'Premium', 
    description: 'Highest quality, more processing time',
    className: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
  },
};

interface OutputTypeDropdownProps {
  value: AnyOutputType;
  onChange: (type: AnyOutputType) => void;
  allowMultiple?: boolean;
  multiValue?: AnyOutputType[];
  onMultiChange?: (types: AnyOutputType[]) => void;
  className?: string;
  showCategories?: boolean;
  tierFilter?: 1 | 2 | 3 | 'all'; // External tier filter
}

export function OutputTypeDropdown({
  value,
  onChange,
  allowMultiple = false,
  multiValue = [],
  onMultiChange,
  className,
  showCategories = false,
  tierFilter = 'all',
}: OutputTypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'tier' | 'category'>(tierFilter !== 'all' ? 'tier' : 'tier');

  const handleSelect = (type: AnyOutputType) => {
    if (allowMultiple && onMultiChange) {
      if (multiValue.includes(type)) {
        onMultiChange(multiValue.filter(t => t !== type));
      } else {
        onMultiChange([...multiValue, type]);
      }
    } else {
      onChange(type);
      setOpen(false);
    }
  };

  const selectedConfig = EXPANDED_OUTPUT_CONFIGS.find(c => c.id === value as ExpandedOutputType);
  const SelectedIcon = selectedConfig ? OUTPUT_ICONS[selectedConfig.icon] : ImageIcon;

  const getDisplayText = () => {
    if (allowMultiple) {
      if (multiValue.length === 0) return 'Select output types...';
      if (multiValue.length === 1) {
        const config = EXPANDED_OUTPUT_CONFIGS.find(c => c.id === multiValue[0] as ExpandedOutputType);
        return config?.name || multiValue[0];
      }
      return `${multiValue.length} types selected`;
    }
    return selectedConfig?.name || 'Select output type...';
  };

  // Filter configs based on external tier filter
  const getFilteredConfigs = () => {
    if (tierFilter === 'all') return EXPANDED_OUTPUT_CONFIGS;
    return EXPANDED_OUTPUT_CONFIGS.filter(c => c.tier === tierFilter);
  };

  // Get grouped outputs based on active tab
  const getGroupedOutputs = () => {
    const baseConfigs = getFilteredConfigs();
    
    if (activeTab === 'tier') {
      // If tier filter is applied, show only that tier
      if (tierFilter !== 'all') {
        return [{ 
          label: `${TIER_CONFIG[tierFilter]?.label || 'Tier ' + tierFilter} Outputs`, 
          items: baseConfigs 
        }];
      }
      return [
        { label: 'Standard (Tier 1)', items: baseConfigs.filter(c => c.tier === 1) },
        { label: 'Advanced (Tier 2)', items: baseConfigs.filter(c => c.tier === 2) },
        { label: 'Premium (Tier 3)', items: baseConfigs.filter(c => c.tier === 3) },
      ].filter(g => g.items.length > 0);
    } else if (activeTab === 'category') {
      const categoryGroups = [
        { label: 'Documents', category: 'document' },
        { label: 'Static', category: 'static' },
        { label: 'Animated', category: 'animated' },
        { label: 'Video', category: 'video' },
        { label: '3D', category: 'threeD' },
        { label: 'Interactive', category: 'interactive' },
        { label: 'Immersive', category: 'immersive' },
      ];
      return categoryGroups
        .map(g => ({
          label: g.label,
          items: baseConfigs.filter(c => OUTPUT_CATEGORIES[g.category as keyof typeof OUTPUT_CATEGORIES]?.some(oc => oc.id === c.id))
        }))
        .filter(g => g.items.length > 0);
    }
    return [{ label: 'All Outputs', items: baseConfigs }];
  };

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
          <div className="flex items-center gap-2 truncate">
            {!allowMultiple && selectedConfig && (
              <SelectedIcon className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className="truncate">{getDisplayText()}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0 z-50 bg-popover border shadow-lg"
        align="start"
      >
        <div className="p-3 border-b space-y-2">
          <div>
            <span className="text-sm font-medium">Output Type</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose the format for your generated content
            </p>
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {(['tier', 'category', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-2 py-1 text-[10px] rounded-md transition-colors flex-1',
                  activeTab === tab 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab === 'tier' ? 'By Tier' : tab === 'category' ? 'By Category' : 'All'}
              </button>
            ))}
          </div>
          {/* Tier Legend */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-muted-foreground">Tiers:</span>
            {Object.entries(TIER_CONFIG).map(([tier, config]) => (
              <Badge
                key={tier}
                variant="outline"
                className={cn('text-[9px] px-1.5 py-0', config.className)}
                title={config.description}
              >
                {config.label}
              </Badge>
            ))}
          </div>
        </div>
        <ScrollArea className="h-[380px]">
          <div className="p-2 space-y-3">
            {getGroupedOutputs().map((group, groupIdx) => (
              <div key={groupIdx}>
                <div className="px-2 py-1 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {group.label}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.items.map(config => {
                    const Icon = OUTPUT_ICONS[config.icon] || ImageIcon;
                    const isSelected = allowMultiple
                      ? multiValue.includes(config.id)
                      : value === config.id;

                    return (
                      <div
                        key={config.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
                          isSelected
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted border border-transparent'
                        )}
                        onClick={() => handleSelect(config.id)}
                      >
                        {allowMultiple && (
                          <Checkbox
                            checked={isSelected}
                            className="mt-0.5 pointer-events-none"
                          />
                        )}
                        <div
                          className={cn(
                            'p-2 rounded-lg shrink-0',
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{config.name}</p>
                            <Badge
                              variant="outline"
                              className={cn('text-[9px] px-1.5', TIER_CONFIG[config.tier]?.className)}
                              title={TIER_CONFIG[config.tier]?.description}
                            >
                              {TIER_CONFIG[config.tier]?.label || `Tier ${config.tier}`}
                            </Badge>
                            {config.costMultiplier > 1 && (
                              <Badge variant="secondary" className="text-[9px] px-1">
                                {config.costMultiplier}x credits
                              </Badge>
                            )}
                            {isSelected && !allowMultiple && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {config.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {config.capabilities.slice(0, 3).map(cap => (
                              <Badge
                                key={cap}
                                variant="secondary"
                                className="text-[9px] px-1"
                              >
                                {cap}
                              </Badge>
                            ))}
                            {config.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-[9px] px-1">
                                +{config.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                          {/* Export formats */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[9px] text-muted-foreground">Exports:</span>
                            {config.exportFormats.slice(0, 4).map(fmt => (
                              <span key={fmt} className="text-[9px] text-muted-foreground uppercase">
                                {fmt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Multi-select summary */}
        {allowMultiple && multiValue.length > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1">
              {multiValue.map(type => {
                const config = EXPANDED_OUTPUT_CONFIGS.find(c => c.id === type as ExpandedOutputType);
                if (!config) return null;
                return (
                  <Badge key={type} variant="secondary" className="text-xs gap-1">
                    {config.name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(type);
                      }}
                    />
                  </Badge>
                );
              })}
            </div>
            {/* Cost summary */}
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Est. Credit Multiplier:</span>
                <span className="font-medium">
                  {Math.max(...multiValue.map(t => {
                    const c = EXPANDED_OUTPUT_CONFIGS.find(cfg => cfg.id === t as ExpandedOutputType);
                    return c?.costMultiplier || 1;
                  }))}x
                </span>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
