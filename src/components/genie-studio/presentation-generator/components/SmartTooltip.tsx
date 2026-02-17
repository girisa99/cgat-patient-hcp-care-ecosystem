/**
 * Smart Tooltip Component
 * Context-aware tooltip that explains features, functions, and flows
 */

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Lightbulb,
  ExternalLink,
  Keyboard,
  Sparkles,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGenieTooltip, type TooltipDefinition } from '../context/TooltipContext';

interface SmartTooltipProps {
  tooltipId: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  showIcon?: boolean;
  iconSize?: 'sm' | 'md' | 'lg';
  className?: string;
  triggerClassName?: string;
  delayDuration?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  wizard: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  generation: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  output: 'bg-green-500/10 text-green-600 border-green-500/30',
  credits: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  models: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  languages: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
  templates: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
  review: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  export: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
  navigation: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
};

const ICON_SIZES = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function SmartTooltip({
  tooltipId,
  children,
  side = 'top',
  align = 'center',
  showIcon = true,
  iconSize = 'sm',
  className,
  triggerClassName,
  delayDuration = 300,
}: SmartTooltipProps) {
  // Safely try to use context - return children if not available
  let tooltip: TooltipDefinition | undefined;
  let isTooltipEnabled = false;
  
  try {
    const context = useGenieTooltip();
    tooltip = context.getTooltip(tooltipId);
    isTooltipEnabled = context.isTooltipEnabled;
  } catch {
    // Context not available, render children only
    return <>{children}</>;
  }

  if (!tooltip || !isTooltipEnabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center gap-1 cursor-help", triggerClassName)}>
            {children}
            {showIcon && (
              <HelpCircle className={cn(ICON_SIZES[iconSize], "text-muted-foreground/60 hover:text-primary transition-colors")} />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className={cn("max-w-[320px] p-0", className)}
        >
          <SmartTooltipContent tooltip={tooltip} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SmartTooltipContent({ tooltip }: { tooltip: TooltipDefinition }) {
  return (
    <div className="p-3 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-sm">{tooltip.title}</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-[10px] h-5 px-1.5 capitalize", CATEGORY_COLORS[tooltip.category])}
        >
          {tooltip.category}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {tooltip.description}
      </p>

      {/* Tips */}
      {tooltip.tips && tooltip.tips.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
            <Lightbulb className="h-3 w-3" />
            Tips
          </div>
          <ul className="space-y-0.5">
            {tooltip.tips.slice(0, 3).map((tip, idx) => (
              <li key={idx} className="text-[10px] text-muted-foreground flex items-start gap-1">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keyboard Shortcut */}
      {tooltip.keyboardShortcut && (
        <div className="flex items-center gap-1 pt-1 text-[10px] text-muted-foreground">
          <Keyboard className="h-3 w-3" />
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
            {tooltip.keyboardShortcut}
          </kbd>
        </div>
      )}

      {/* Learn More */}
      {tooltip.learnMoreUrl && (
        <Button 
          variant="link" 
          size="sm" 
          className="h-auto p-0 text-[10px]"
          asChild
        >
          <a href={tooltip.learnMoreUrl} target="_blank" rel="noopener noreferrer">
            Learn more
            <ExternalLink className="h-2.5 w-2.5 ml-1" />
          </a>
        </Button>
      )}
    </div>
  );
}

/**
 * Inline help icon that shows tooltip on hover
 */
export function HelpTooltip({
  tooltipId,
  size = 'sm',
  className,
}: {
  tooltipId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  // Safely try to use context - return null if not available
  let tooltip: TooltipDefinition | undefined;
  let isTooltipEnabled = false;
  
  try {
    const context = useGenieTooltip();
    tooltip = context.getTooltip(tooltipId);
    isTooltipEnabled = context.isTooltipEnabled;
  } catch {
    // Context not available, don't render tooltip
    return null;
  }

  if (!tooltip || !isTooltipEnabled) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
              size === 'sm' && 'p-0.5',
              size === 'md' && 'p-1',
              size === 'lg' && 'p-1.5',
              className
            )}
          >
            <Info className={cn(ICON_SIZES[size], "text-muted-foreground hover:text-primary")} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[320px] p-0">
          <SmartTooltipContent tooltip={tooltip} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SmartTooltip;
