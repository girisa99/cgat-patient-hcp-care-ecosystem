
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContentProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className,
  maxWidth = 'full',
  padding = 'md',
  spacing = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl mx-auto',
    md: 'max-w-4xl mx-auto',
    lg: 'max-w-6xl mx-auto',
    xl: 'max-w-7xl mx-auto',
    full: 'w-full max-w-none'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const spacingClasses = {
    none: 'space-y-0',
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8'
  };

  return (
    <div className={cn(
      'h-full w-full overflow-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      <div className={cn('w-full', spacingClasses[spacing])}>
        {/* Page Header */}
        {(title || subtitle || headerActions) && (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
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
        )}

        {/* Main Content */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
