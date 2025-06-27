
import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className }) => {
  return (
    <a
      href={href}
      className={cn(
        // Position off-screen by default
        'absolute -top-40 left-6 z-50',
        // Show when focused
        'focus:top-6',
        // Styling
        'bg-primary text-primary-foreground',
        'px-4 py-2 rounded-md text-sm font-medium',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-foreground',
        'shadow-lg',
        className
      )}
    >
      {children}
    </a>
  );
};
