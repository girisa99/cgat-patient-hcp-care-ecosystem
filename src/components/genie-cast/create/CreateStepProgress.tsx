import React from 'react';
import type { CreateStep } from './index';

interface CreateStepProgressProps {
  currentStep: CreateStep;
  completedSteps?: CreateStep[];
  onStepClick?: (step: CreateStep) => void;
  className?: string;
}

const STEPS: { key: CreateStep; label: string }[] = [
  { key: 'discover', label: 'Discover' },
  { key: 'intent', label: 'Content Intent' },
  { key: 'configure', label: 'Style & Config' },
  { key: 'templates', label: 'Templates' },
  { key: 'assets', label: 'Assets' },
];

export const CreateStepProgress: React.FC<CreateStepProgressProps> = ({
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
}) => {
  const currentIdx = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      {STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.key);
        const isCurrent = step.key === currentStep;
        const isClickable = onStepClick && (isCompleted || i <= currentIdx);
        return (
          <div key={step.key} className="flex items-center gap-1">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step.key)}
              className={`flex items-center gap-1 transition-colors ${
                isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full transition-colors ${
                  isCompleted ? 'bg-emerald-400' : isCurrent ? 'bg-primary' : 'bg-white/10'
                }`}
              />
              <span className={`text-[10px] ${isCurrent ? 'text-foreground font-medium' : isCompleted ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </button>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-white/10" />}
          </div>
        );
      })}
    </div>
  );
};
