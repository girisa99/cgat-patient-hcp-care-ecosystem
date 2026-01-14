/**
 * Loading Spinner Component
 * Provides consistent loading feedback across the application
 * Addresses Ralph Wiggum findings: Loading State Feedback
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  inline?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className,
  inline = false
}) => {
  if (inline) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </span>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2 py-8",
      className
    )}>
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  label = 'Loading...',
  children,
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner label={label} />
        </div>
      )}
    </div>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
}

export const LoadingButtonContent: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingLabel = 'Processing...',
  children
}) => {
  if (isLoading) {
    return (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {loadingLabel}
      </>
    );
  }
  return <>{children}</>;
};

export default LoadingSpinner;
