
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Container } from './Container';
import { useDesignSystem } from '../design-system/DesignSystemProvider';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showHeader?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className,
  containerSize = 'full',
  showHeader = true,
}) => {
  const { spacing } = useDesignSystem();

  return (
    <div className={cn('min-h-full w-full', className)}>
      <div className="w-full px-6 py-6">
        {showHeader && (title || subtitle || headerActions) && (
          <div className="mb-8 w-full">
            <div className="flex items-start justify-between w-full">
              <div className="flex-1 text-left">
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 text-left">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-muted-foreground text-lg text-left">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center gap-3 ml-6">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
