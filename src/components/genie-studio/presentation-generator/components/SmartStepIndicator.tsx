/**
 * Smart Step Indicator Component
 * Visual progress indicator that shows skippable and completed steps
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, ChevronRight, SkipForward, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlowShortcut, generateStepIndicators } from '../utils/flowShortcuts';

interface SmartStepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  stepLabels: string[];
  shortcut?: FlowShortcut | null;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function SmartStepIndicator({
  totalSteps,
  currentStep,
  stepLabels,
  shortcut = null,
  onStepClick,
  className
}: SmartStepIndicatorProps) {
  const indicators = generateStepIndicators(totalSteps, currentStep, shortcut);
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Shortcut Banner */}
      {shortcut && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-lg">{shortcut.icon || '⚡'}</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-primary">{shortcut.name}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {shortcut.skipsSteps.length} step{shortcut.skipsSteps.length > 1 ? 's' : ''} auto-configured
            </span>
          </div>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
            Quick Mode
          </Badge>
        </div>
      )}
      
      {/* Step Indicators */}
      <div className="flex items-center gap-1">
        {indicators.map((indicator, idx) => {
          const label = stepLabels[idx] || `Step ${indicator.step}`;
          const isClickable = onStepClick && indicator.status === 'completed';
          
          return (
            <React.Fragment key={indicator.step}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => isClickable && onStepClick(indicator.step)}
                      disabled={!isClickable}
                      className={cn(
                        "relative flex items-center justify-center transition-all",
                        "w-8 h-8 rounded-full text-xs font-medium",
                        indicator.status === 'completed' && "bg-primary text-primary-foreground",
                        indicator.status === 'current' && "bg-primary/20 text-primary border-2 border-primary",
                        indicator.status === 'upcoming' && "bg-muted text-muted-foreground",
                        indicator.status === 'skipped' && "bg-muted/50 text-muted-foreground/50",
                        isClickable && "cursor-pointer hover:ring-2 hover:ring-primary/30",
                        !isClickable && "cursor-default"
                      )}
                    >
                      {indicator.status === 'completed' && <Check className="h-4 w-4" />}
                      {indicator.status === 'skipped' && <SkipForward className="h-3.5 w-3.5" />}
                      {indicator.status === 'current' && indicator.step}
                      {indicator.status === 'upcoming' && indicator.step}
                      
                      {/* Skippable indicator dot */}
                      {indicator.isSkippable && indicator.status === 'upcoming' && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="text-xs">
                      <p className="font-medium">{label}</p>
                      {indicator.status === 'skipped' && (
                        <p className="text-muted-foreground">Auto-configured by shortcut</p>
                      )}
                      {indicator.isSkippable && indicator.status === 'upcoming' && (
                        <p className="text-yellow-600">Will be auto-configured</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Connector */}
              {idx < indicators.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 min-w-[16px] max-w-[32px]",
                  indicator.status === 'completed' || indicator.status === 'skipped'
                    ? "bg-primary/50"
                    : "bg-muted"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Current Step Label */}
      <div className="text-center">
        <span className="text-sm font-medium">
          {stepLabels[currentStep - 1] || `Step ${currentStep}`}
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          ({currentStep} of {totalSteps - (shortcut?.skipsSteps.length || 0)})
        </span>
      </div>
    </div>
  );
}

export default SmartStepIndicator;
