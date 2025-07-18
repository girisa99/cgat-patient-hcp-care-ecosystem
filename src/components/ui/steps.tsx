import React from 'react';
import { cn } from '@/lib/utils';

interface StepsProps {
  children: React.ReactNode;
  className?: string;
  currentStep?: number;
  onStepClick?: (stepIndex: number) => void;
}

interface StepProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

export const Steps: React.FC<StepsProps> = ({ children, className, currentStep, onStepClick }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isActive: currentStep === index,
            isCompleted: currentStep !== undefined && index < currentStep,
            onClick: onStepClick ? () => onStepClick(index) : undefined,
            ...child.props
          });
        }
        return child;
      })}
    </div>
  );
};

export const Step: React.FC<StepProps> = ({ 
  title, 
  description, 
  children, 
  className, 
  isActive = false, 
  isCompleted = false,
  onClick
}) => {
  return (
    <div 
      className={cn(
        "border rounded-lg p-4",
        onClick && "cursor-pointer hover:bg-muted/50",
        isActive && "border-primary bg-primary/5",
        isCompleted && "border-green-500 bg-green-50",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
          isActive && "bg-primary text-primary-foreground",
          isCompleted && "bg-green-500 text-white",
          !isActive && !isCompleted && "bg-muted text-muted-foreground"
        )}>
          {isCompleted ? '✓' : '•'}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-3 ml-9">{description}</p>
      )}
      {children && (
        <div className="ml-9">{children}</div>
      )}
    </div>
  );
};