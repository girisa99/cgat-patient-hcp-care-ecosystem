import React from 'react';
import { cn } from '@/lib/utils';

interface StepProps {
  title: string;
  description?: string;
  isActive?: boolean;
  isComplete?: boolean;
  stepNumber?: number;
  onClick?: () => void;
}

interface StepsProps {
  children: React.ReactNode;
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function Step({
  title,
  description,
  isActive = false,
  isComplete = false,
  stepNumber,
  onClick
}: StepProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 cursor-pointer",
        isActive ? "opacity-100" : "opacity-70"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-center text-sm font-medium",
          isActive
            ? "bg-primary text-primary-foreground"
            : isComplete
            ? "bg-green-600 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isComplete ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          stepNumber
        )}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
}

export function Steps({ children, currentStep, onStepClick, className }: StepsProps) {
  // Count React children and clone them with props
  const stepsArray = React.Children.toArray(children);
  const totalSteps = stepsArray.length;

  return (
    <div className={cn("flex justify-between", className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<StepProps>, {
            isActive: currentStep === index,
            isComplete: currentStep > index,
            stepNumber: index + 1,
            onClick: () => onStepClick?.(index),
          });
        }
        return child;
      })}
    </div>
  );
}