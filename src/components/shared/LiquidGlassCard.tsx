/**
 * LiquidGlassCard — Reusable frosted-glass card component
 * 
 * Modern SaaS "Liquid Glass" aesthetic:
 * - Translucent frosted background with backdrop-blur
 * - Gradient border that catches light
 * - Subtle inner glow/shine
 * - Smooth hover lift animation
 * - RTL-aware
 */

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type GlassVariant = 'default' | 'elevated' | 'accent' | 'success' | 'warning' | 'subtle';

interface LiquidGlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: GlassVariant;
  /** Disable hover lift animation */
  noHover?: boolean;
  /** Show a soft glow ring around the card */
  glow?: boolean;
  /** Optional header area */
  header?: React.ReactNode;
  /** Optional footer area */
  footer?: React.ReactNode;
  /** Add step indicator badge */
  stepBadge?: string | number;
  /** Whether this step/card is active */
  isActive?: boolean;
  /** Whether this step/card is completed */
  isCompleted?: boolean;
}

const variantStyles: Record<GlassVariant, string> = {
  default: 'bg-white/[0.04] border-white/[0.08]',
  elevated: 'bg-white/[0.06] border-white/[0.12] shadow-lg',
  accent: 'bg-primary/[0.06] border-primary/[0.15]',
  success: 'bg-emerald-500/[0.06] border-emerald-500/[0.15]',
  warning: 'bg-amber-500/[0.06] border-amber-500/[0.15]',
  subtle: 'bg-white/[0.02] border-white/[0.05]',
};

const glowStyles: Record<GlassVariant, string> = {
  default: 'shadow-[0_0_30px_rgba(255,255,255,0.03)]',
  elevated: 'shadow-[0_8px_40px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)]',
  accent: 'shadow-[0_0_30px_rgba(var(--primary-rgb,99,102,241),0.15)]',
  success: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  warning: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  subtle: 'shadow-none',
};

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  variant = 'default',
  noHover = false,
  glow = false,
  header,
  footer,
  stepBadge,
  isActive,
  isCompleted,
  className,
  ...motionProps
}) => {
  return (
    <motion.div
      className={cn(
        // Base glass
        'relative rounded-2xl border backdrop-blur-xl overflow-hidden transition-colors duration-300',
        variantStyles[variant],
        glow && glowStyles[variant],
        // Active state
        isActive && 'ring-2 ring-primary/30 border-primary/20',
        isCompleted && 'border-emerald-500/20',
        className,
      )}
      whileHover={noHover ? undefined : { 
        y: -2, 
        transition: { duration: 0.2, ease: 'easeOut' } 
      }}
      style={{
        boxShadow: isActive 
          ? '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 0 rgba(255,255,255,0.08)'
          : '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 0 rgba(255,255,255,0.04)',
      }}
      {...motionProps}
    >
      {/* Inner glass shine */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />
      
      {/* Step badge */}
      {stepBadge !== undefined && (
        <div className={cn(
          'absolute top-3 left-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
          isCompleted 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : isActive 
              ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_12px_rgba(var(--primary-rgb,99,102,241),0.3)]'
              : 'bg-white/[0.06] text-muted-foreground border border-white/10',
        )}>
          {isCompleted ? '✓' : stepBadge}
        </div>
      )}

      {/* Content */}
      {header && (
        <div className="relative z-[1] px-5 pt-5 pb-2">
          {header}
        </div>
      )}
      <div className="relative z-[1] px-5 py-4">
        {children}
      </div>
      {footer && (
        <div className="relative z-[1] px-5 pb-4 pt-2 border-t border-white/[0.06]">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

/**
 * LiquidGlassSeparator — Themed separator for glass layouts
 */
export const LiquidGlassSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-4', className)} />
);

/**
 * LiquidGlassBadge — Small badge with glass effect
 */
export const LiquidGlassBadge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}> = ({ children, variant = 'default', className }) => {
  const badgeVariants = {
    default: 'bg-white/[0.06] text-foreground/80 border-white/10',
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border backdrop-blur-sm',
      badgeVariants[variant],
      className,
    )}>
      {children}
    </span>
  );
};

export default LiquidGlassCard;
