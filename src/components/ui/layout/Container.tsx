
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useDesignSystem } from '../design-system/DesignSystemProvider';

interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  padding = 'md',
  className,
}) => {
  const { spacing } = useDesignSystem();

  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
      style={{
        '--container-padding': spacing[padding === 'sm' ? 'sm' : padding === 'lg' ? 'lg' : 'md'],
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
