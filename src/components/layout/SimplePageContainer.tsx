
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SimplePageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
}

export const SimplePageContainer: React.FC<SimplePageContainerProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className,
  maxWidth = 'full',
  padding = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'w-full'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {/* Page Header */}
      {(title || subtitle || headerActions) && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-base text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
