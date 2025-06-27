
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  className?: string;
  fluid?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className,
  fluid = false
}) => {
  return (
    <div className={cn(
      "w-full h-full",
      fluid ? "p-0" : "p-6",
      className
    )}>
      {/* Page Header */}
      {(title || subtitle || headerActions) && (
        <div className="mb-6">
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
