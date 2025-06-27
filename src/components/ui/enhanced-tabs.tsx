
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface EnhancedTabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'default' | 'lg';
}

interface EnhancedTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface EnhancedTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const EnhancedTabsRoot: React.FC<EnhancedTabsProps> = ({ 
  defaultValue, 
  className, 
  children, 
  variant = 'default',
  size = 'default'
}) => {
  return (
    <Tabs 
      defaultValue={defaultValue} 
      className={cn('w-full', className)}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </Tabs>
  );
};

const EnhancedTabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <TabsList 
      className={cn(
        'grid w-full auto-cols-fr grid-flow-col',
        'bg-muted/50 backdrop-blur-sm',
        'border border-border/50',
        'rounded-lg p-1',
        'shadow-sm',
        className
      )}
    >
      {children}
    </TabsList>
  );
};

const EnhancedTabsTrigger: React.FC<EnhancedTabsTriggerProps> = ({ 
  value, 
  children, 
  className,
  disabled = false,
  icon
}) => {
  return (
    <TabsTrigger 
      value={value}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center gap-2',
        'px-4 py-2.5 text-sm font-medium',
        'rounded-md transition-all duration-200',
        'hover:bg-background/80 hover:text-foreground',
        'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none',
        'data-[state=active]:bg-background data-[state=active]:text-foreground',
        'data-[state=active]:shadow-sm data-[state=active]:border',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'group',
        className
      )}
      aria-disabled={disabled}
    >
      {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
      <span>{children}</span>
    </TabsTrigger>
  );
};

const EnhancedTabsContent: React.FC<EnhancedTabsContentProps> = ({ 
  value, 
  children, 
  className 
}) => {
  return (
    <TabsContent 
      value={value}
      className={cn(
        'mt-4 p-4 rounded-lg',
        'bg-background/50 backdrop-blur-sm',
        'border border-border/50',
        'shadow-sm',
        'animate-in fade-in-50 slide-in-from-bottom-2 duration-300',
        className
      )}
    >
      {children}
    </TabsContent>
  );
};

export {
  EnhancedTabsRoot as EnhancedTabs,
  EnhancedTabsList,
  EnhancedTabsTrigger,
  EnhancedTabsContent
};
