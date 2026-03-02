/**
 * WizardProgress — 4-step horizontal progress indicator
 * Aligned with CREATE flow: Describe → Category & Style → Platforms & Regions → Review
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  label: string;
  icon: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 'describe', label: 'Describe', icon: '✨' },
  { id: 'category-style', label: 'Category & Style', icon: '🎬' },
  { id: 'platforms-regions', label: 'Platforms & Regions', icon: '🌐' },
  { id: 'review', label: 'Review', icon: '✅' },
];

export type WizardStepId = typeof WIZARD_STEPS[number]['id'];

interface WizardProgressProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (stepIndex: number) => void;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto pb-1 px-1">
      {WIZARD_STEPS.map((step, idx) => {
        const isComplete = completedSteps.has(idx);
        const isCurrent = currentStep === idx;
        const isClickable = idx <= currentStep || completedSteps.has(idx) || completedSteps.has(idx - 1);

        return (
          <React.Fragment key={step.id}>
            {idx > 0 && (
              <div className={cn(
                "w-6 h-0.5 flex-shrink-0 rounded-full transition-colors",
                isComplete || idx <= currentStep ? "bg-primary/50" : "bg-muted"
              )} />
            )}
            <button
              onClick={() => isClickable && onStepClick(idx)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all flex-shrink-0",
                "border",
                isCurrent && "border-primary bg-primary/10 text-primary shadow-sm",
                !isCurrent && isComplete && "border-primary/30 bg-primary/5 text-primary/80 hover:bg-primary/10",
                !isCurrent && !isComplete && "border-muted text-muted-foreground",
                isClickable && !isCurrent && "hover:bg-muted/50 cursor-pointer",
                !isClickable && "opacity-50 cursor-not-allowed"
              )}
            >
              {isComplete ? (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              ) : (
                <span>{step.icon}</span>
              )}
              <span>{step.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
