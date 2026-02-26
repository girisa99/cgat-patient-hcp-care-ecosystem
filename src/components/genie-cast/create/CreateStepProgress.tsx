import React from 'react';
import type { CreateStep } from './index';

interface CreateStepProgressProps {
  currentStep: CreateStep;
  completedSteps?: CreateStep[];
  className?: string;
}

const STEPS: { key: CreateStep; label: string }[] = [
  { key: 'intent', label: 'Intent' },
  { key: 'template', label: 'Template' },
  { key: 'script', label: 'Script' },
  { key: 'style', label: 'Style' },
  { key: 'review', label: 'Review' },
];

export const CreateStepProgress: React.FC<CreateStepProgressProps> = ({
  currentStep,
  completedSteps = [],
  className,
}) => {
  const currentIdx = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      {STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.key);
        const isCurrent = step.key === currentStep;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                isCompleted ? 'bg-emerald-400' : isCurrent ? 'bg-primary' : 'bg-white/10'
              }`}
            />
            <span className={`text-[10px] ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-white/10" />}
          </div>
        );
      })}
    </div>
  );
};
