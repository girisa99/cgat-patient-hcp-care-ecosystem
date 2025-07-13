import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Loading spinner component
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  );
};

// Page-level loading state
export const PageLoading: React.FC<{
  message?: string;
  showCard?: boolean;
}> = ({ message = 'Loading...', showCard = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  if (showCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardContent className="p-0">
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div className="min-h-screen flex items-center justify-center">{content}</div>;
};

// Inline loading state for components
export const InlineLoading: React.FC<{
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ message, size = 'md', className }) => (
  <div className={cn('flex items-center justify-center space-x-2 p-4', className)}>
    <LoadingSpinner size={size} />
    {message && <span className="text-muted-foreground">{message}</span>}
  </div>
);

// Enhanced loading states with retry functionality
export const LoadingStateWithRetry: React.FC<{
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
}> = ({ isLoading, error, onRetry, children, loadingMessage = 'Loading...' }) => {
  if (isLoading) {
    return <InlineLoading message={loadingMessage} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive text-center">{error}</p>
        <Button variant="outline" onClick={onRetry} size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

// Skeleton loading for tables and lists
export const SkeletonRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <div className="flex space-x-4 p-4 border-b">
    {Array.from({ length: columns }, (_, i) => (
      <div key={i} className="flex-1">
        <div className="h-4 bg-muted rounded animate-pulse" />
      </div>
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 4, showHeader = true }) => (
  <div className="border rounded-md">
    {showHeader && (
      <div className="flex space-x-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="flex-1">
            <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )}
    {Array.from({ length: rows }, (_, i) => (
      <SkeletonRow key={i} columns={columns} />
    ))}
  </div>
);

// Success state component
export const SuccessState: React.FC<{
  message: string;
  onDismiss?: () => void;
}> = ({ message, onDismiss }) => (
  <div className="flex items-center justify-center space-x-2 p-4 text-green-600">
    <CheckCircle2 className="h-5 w-5" />
    <span>{message}</span>
    {onDismiss && (
      <Button variant="ghost" size="sm" onClick={onDismiss}>
        Dismiss
      </Button>
    )}
  </div>
);

// Progress indicator for multi-step operations
export const ProgressIndicator: React.FC<{
  current: number;
  total: number;
  message?: string;
}> = ({ current, total, message }) => (
  <div className="flex items-center space-x-4 p-4">
    <div className="flex items-center space-x-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Step {current} of {total}
      </span>
    </div>
    <div className="flex-1 bg-muted rounded-full h-2">
      <div 
        className="bg-primary rounded-full h-2 transition-all duration-300"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
    {message && <span className="text-sm text-muted-foreground">{message}</span>}
  </div>
);