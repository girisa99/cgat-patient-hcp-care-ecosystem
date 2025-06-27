
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: {
    mobile?: 1 | 2 | 3 | 4 | 6 | 12;
    tablet?: 1 | 2 | 3 | 4 | 6 | 12;
    laptop?: 1 | 2 | 3 | 4 | 6 | 12;
    desktop?: 1 | 2 | 3 | 4 | 6 | 12;
  };
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 12,
  gap = 'md',
  className,
  responsive,
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  const responsiveClasses = responsive ? [
    responsive.mobile && `grid-cols-${responsive.mobile}`,
    responsive.tablet && `md:grid-cols-${responsive.tablet}`,
    responsive.laptop && `lg:grid-cols-${responsive.laptop}`,
    responsive.desktop && `xl:grid-cols-${responsive.desktop}`,
  ].filter(Boolean).join(' ') : '';

  return (
    <div
      className={cn(
        'grid',
        colsClasses[cols],
        gapClasses[gap],
        responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  );
};

interface GridItemProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
  responsive?: {
    mobile?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    tablet?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    laptop?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    desktop?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  };
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span = 1,
  className,
  responsive,
}) => {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  };

  const responsiveClasses = responsive ? [
    responsive.mobile && `col-span-${responsive.mobile}`,
    responsive.tablet && `md:col-span-${responsive.tablet}`,
    responsive.laptop && `lg:col-span-${responsive.laptop}`,
    responsive.desktop && `xl:col-span-${responsive.desktop}`,
  ].filter(Boolean).join(' ') : '';

  return (
    <div
      className={cn(
        spanClasses[span],
        responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  );
};
