/**
 * Output Type Multi-Select Dropdown
 * Clean dropdown for selecting output types with sub-options
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutputType, OUTPUT_TYPE_CONFIGS } from '../types';

// Icon mapping
const OUTPUT_ICONS: Record<string, React.ElementType> = {
  'Image': ImageIcon,
  'Sparkles': Sparkles,
  'Box': Box,
  'Orbit': Orbit,
  'Video': Video,
  'Film': Film,
  'MousePointerClick': MousePointerClick,
  'Layers': Layers,
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
  value: OutputType;
  onChange: (type: OutputType) => void;
  allowMultiple?: boolean;
  multiValue?: OutputType[];
  onMultiChange?: (types: OutputType[]) => void;
  className?: string;
}

export function OutputTypeDropdown({
  value,
  onChange,
  allowMultiple = false,
  multiValue = [],
  onMultiChange,
  className,
}: OutputTypeDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: OutputType) => {
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

  const selectedConfig = OUTPUT_TYPE_CONFIGS.find(c => c.id === value);
  const SelectedIcon = selectedConfig ? OUTPUT_ICONS[selectedConfig.icon] : ImageIcon;

  const getDisplayText = () => {
    if (allowMultiple) {
      if (multiValue.length === 0) return 'Select output types...';
      if (multiValue.length === 1) {
        const config = OUTPUT_TYPE_CONFIGS.find(c => c.id === multiValue[0]);
        return config?.name || multiValue[0];
      }
      return `${multiValue.length} types selected`;
    }
    return selectedConfig?.name || 'Select output type...';
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
        <ScrollArea className="h-[320px]">
          <div className="p-2 space-y-1">
            {OUTPUT_TYPE_CONFIGS.map(config => {
              const Icon = OUTPUT_ICONS[config.icon];
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
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Multi-select summary */}
        {allowMultiple && multiValue.length > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1">
              {multiValue.map(type => {
                const config = OUTPUT_TYPE_CONFIGS.find(c => c.id === type);
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
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
