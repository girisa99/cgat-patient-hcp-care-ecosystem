/**
 * Glass Morphism Primitives — Genie Cast Design System v1.0
 *
 * Thin wrappers around shadcn/ui components that apply the glass design tokens.
 * Every Cast component should use these instead of raw Card/Dialog/Tabs/etc.
 *
 * Usage:
 *   import { GlassCard, GlassPanel, GlassTabs, GlassModal, GlassBadge } from '@/components/ui/glass-primitives';
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// ============================================
// GLASS CARD
// ============================================
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'azure' | 'alibaba' | 'gemini' | 'none';
  elevated?: boolean;
  animate?: 'shimmer' | 'glow' | 'border' | 'none';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = 'none', elevated = false, animate = 'none', children, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        elevated ? 'glass-elevated' : 'glass-card',
        glow !== 'none' && `glass-glow-${glow}`,
        animate !== 'none' && `glass-animate-${animate}`,
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  ),
);
GlassCard.displayName = 'GlassCard';

// Re-export Card sub-components for convenience
const GlassCardHeader = CardHeader;
const GlassCardTitle = CardTitle;
const GlassCardDescription = CardDescription;
const GlassCardContent = CardContent;
const GlassCardFooter = CardFooter;

// ============================================
// GLASS PANEL (non-Card container)
// ============================================
interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'sidebar';
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === 'elevated' ? 'glass-elevated' :
        variant === 'sidebar' ? 'glass-sidebar' :
        'glass-panel',
        'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
GlassPanel.displayName = 'GlassPanel';

// ============================================
// GLASS TABS
// ============================================
const GlassTabs = React.forwardRef<
  React.ComponentRef<typeof Tabs>,
  React.ComponentPropsWithoutRef<typeof Tabs>
>(({ className, ...props }, ref) => (
  <Tabs ref={ref} className={cn(className)} {...props} />
));
GlassTabs.displayName = 'GlassTabs';

const GlassTabsList = React.forwardRef<
  React.ComponentRef<typeof TabsList>,
  React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => (
  <TabsList
    ref={ref}
    className={cn('glass-tabs glass-tabs-list', className)}
    {...props}
  />
));
GlassTabsList.displayName = 'GlassTabsList';

const GlassTabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof TabsTrigger>
>(({ className, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    className={cn(
      'data-[state=active]:glass-tab-active',
      'glass-touch-target',
      'transition-all duration-200',
      className,
    )}
    {...props}
  />
));
GlassTabsTrigger.displayName = 'GlassTabsTrigger';

const GlassTabsContent = TabsContent;

// ============================================
// GLASS MODAL (Dialog wrapper)
// ============================================
const GlassModal = Dialog;
const GlassModalTrigger = DialogTrigger;

const GlassModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn('glass-modal', className)}
    {...props}
  />
));
GlassModalContent.displayName = 'GlassModalContent';

const GlassModalHeader = DialogHeader;
const GlassModalTitle = DialogTitle;
const GlassModalDescription = DialogDescription;
const GlassModalFooter = DialogFooter;

// ============================================
// GLASS BADGE
// ============================================
interface GlassBadgeProps extends React.ComponentPropsWithoutRef<typeof Badge> {
  provider?: string;
}

const GlassBadge = React.forwardRef<HTMLDivElement, GlassBadgeProps>(
  ({ className, provider, ...props }, ref) => (
    <Badge
      ref={ref}
      className={cn(
        'glass-badge',
        provider && `border-provider-${provider}/30 text-provider-${provider}`,
        className,
      )}
      {...props}
    />
  ),
);
GlassBadge.displayName = 'GlassBadge';

// ============================================
// GLASS INPUT
// ============================================
const GlassInput = React.forwardRef<
  React.ComponentRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn('glass-input', 'glass-touch-target', className)}
    {...props}
  />
));
GlassInput.displayName = 'GlassInput';

// ============================================
// GLASS BUTTON (CTA with glow)
// ============================================
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'glass-touch-target inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
        variant === 'primary' && 'glass-card glass-glow-primary text-primary-foreground bg-primary/90 hover:bg-primary',
        variant === 'secondary' && 'glass-card text-foreground',
        variant === 'ghost' && 'hover:glass-panel text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
GlassButton.displayName = 'GlassButton';

// ============================================
// EXPORTS
// ============================================
export {
  GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter,
  GlassPanel,
  GlassTabs, GlassTabsList, GlassTabsTrigger, GlassTabsContent,
  GlassModal, GlassModalTrigger, GlassModalContent, GlassModalHeader, GlassModalTitle, GlassModalDescription, GlassModalFooter,
  GlassBadge,
  GlassInput,
  GlassButton,
};
