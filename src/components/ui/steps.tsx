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
  stepIndex?: number;
}

export const Steps: React.FC<StepsProps> = ({ children, className, currentStep, onStepClick }) => {
  return (
    <div className={cn("flex items-center justify-between space-x-2 overflow-x-auto", className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isLast = index === React.Children.count(children) - 1;
          return (
            <div key={index} className="flex items-center flex-shrink-0">
              {React.cloneElement(child, {
                isActive: currentStep === index,
                isCompleted: currentStep !== undefined && index < currentStep,
                onClick: onStepClick ? () => onStepClick(index) : undefined,
                stepIndex: index + 1,
                ...child.props
              })}
              {!isLast && (
                <div className={cn(
                  "h-px w-8 mx-3 transition-colors",
                  currentStep !== undefined && index < currentStep 
                    ? "bg-primary" 
                    : "bg-muted-foreground/30"
                )} />
              )}
            </div>
          );
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
  onClick,
  stepIndex
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center text-center p-3 rounded-lg transition-all min-w-[120px]",
        onClick && "cursor-pointer hover:bg-muted/30",
        isActive && "bg-primary/10",
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all",
        isActive && "bg-primary text-primary-foreground ring-2 ring-primary/30",
        isCompleted && "bg-green-500 text-white",
        !isActive && !isCompleted && "bg-muted text-muted-foreground"
      )}>
        {isCompleted ? '✓' : stepIndex || '•'}
      </div>
      <h3 className={cn(
        "font-semibold text-sm mb-1",
        isActive && "text-primary",
        isCompleted && "text-green-600",
        !isActive && !isCompleted && "text-muted-foreground"
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          "text-xs",
          isActive && "text-primary/70",
          isCompleted && "text-green-600/70", 
          !isActive && !isCompleted && "text-muted-foreground/70"
        )}>
          {description}
        </p>
      )}
      {children && (
        <div className="mt-2">{children}</div>
      )}
    </div>
  );
};