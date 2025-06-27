
import React from 'react';
import { cn } from '@/lib/utils';
import { useDesignSystem } from './DesignSystemProvider';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'warning' | 'success';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'primary',
  align = 'left',
  weight = 'normal',
  className,
  children,
}) => {
  const { colors } = useDesignSystem();

  const variantClasses = {
    h1: 'text-4xl lg:text-5xl font-bold leading-tight',
    h2: 'text-3xl lg:text-4xl font-bold leading-tight',
    h3: 'text-2xl lg:text-3xl font-semibold leading-snug',
    h4: 'text-xl lg:text-2xl font-semibold leading-snug',
    h5: 'text-lg lg:text-xl font-medium leading-normal',
    h6: 'text-base lg:text-lg font-medium leading-normal',
    body1: 'text-base leading-relaxed',
    body2: 'text-sm leading-relaxed',
    caption: 'text-xs leading-normal',
    overline: 'text-xs uppercase tracking-wider leading-normal',
  };

  const colorClasses = {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    muted: 'text-muted-foreground/70',
    error: 'text-destructive',
    warning: 'text-yellow-600',
    success: 'text-green-600',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  return React.createElement(
    Component,
    {
      className: cn(
        variantClasses[variant],
        colorClasses[color],
        alignClasses[align],
        weightClasses[weight],
        className
      ),
    },
    children
  );
};
