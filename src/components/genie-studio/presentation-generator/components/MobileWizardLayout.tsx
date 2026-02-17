/**
 * Mobile Wizard Layout - Responsive Step Navigation
 * 
 * Optimized for mobile with:
 * - Bottom navigation for step switching
 * - Collapsible step content
 * - Lite mode for 3-step flow
 * - Offline indicators
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, ArrowRight, Check, Circle, Loader2, 
  WifiOff, ChevronUp, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepConfig, StepId } from '../registry/stepRegistry';
import type { UseWizardStepsReturn } from '../hooks/useWizardSteps';

// ==========================================
// TYPES
// ==========================================

export interface MobileWizardLayoutProps {
  wizard: UseWizardStepsReturn;
  children: React.ReactNode;
  onGenerate?: () => void;
  isGenerating?: boolean;
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export const MobileWizardLayout: React.FC<MobileWizardLayoutProps> = ({
  wizard,
  children,
  onGenerate,
  isGenerating = false,
  className
}) => {
  const [isStepsExpanded, setIsStepsExpanded] = React.useState(false);
  
  const {
    currentStep,
    visibleSteps,
    progress,
    totalSteps,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoPrev,
    isStepValid,
    context,
  } = wizard;

  const currentStepIndex = visibleSteps.findIndex(s => s.metadata.id === currentStep);
  const isLastStep = currentStepIndex === visibleSteps.length - 1;
  const isGenerateStep = currentStep === 'generate';

  // Render step indicator pill
  const renderStepPill = (step: StepConfig, index: number) => {
    const isActive = step.metadata.id === currentStep;
    const isCompleted = isStepValid(step.metadata.id) && index < currentStepIndex;
    const Icon = step.metadata.icon;

    return (
      <button
        key={step.metadata.id}
        onClick={() => goToStep(step.metadata.id)}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
          isActive && "bg-primary text-primary-foreground",
          isCompleted && !isActive && "bg-green-500/20 text-green-600",
          !isActive && !isCompleted && "bg-muted text-muted-foreground"
        )}
      >
        {isCompleted ? (
          <Check className="h-3 w-3" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">
          {step.metadata.shortLabel || step.metadata.label}
        </span>
      </button>
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header with Progress */}
      <div className="flex-shrink-0 p-3 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Step {currentStepIndex + 1}/{totalSteps}
            </Badge>
            {context.isOffline && (
              <Badge variant="destructive" className="text-xs">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {completedSteps} completed
          </span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Expandable Step Navigator */}
      <div className="flex-shrink-0 border-b">
        <button
          onClick={() => setIsStepsExpanded(!isStepsExpanded)}
          className="w-full flex items-center justify-between p-3 text-sm hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            {React.createElement(visibleSteps[currentStepIndex]?.metadata.icon || Circle, {
              className: "h-4 w-4"
            })}
            <span className="font-medium">
              {visibleSteps[currentStepIndex]?.metadata.label}
            </span>
          </div>
          {isStepsExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {isStepsExpanded && (
          <div className="px-3 pb-3">
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {visibleSteps.map((step, index) => renderStepPill(step, index))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {children}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 p-3 border-t bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={!canGoPrev}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {isGenerateStep || isLastStep ? (
            <Button
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating || !canGoNext}
              className="flex-1 bg-primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={nextStep}
              disabled={!canGoNext}
              className="flex-1"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileWizardLayout;
