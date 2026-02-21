/**
 * GenieMascot — Animated contextual helper character
 * 
 * A floating AI assistant mascot that:
 * - Appears at the edge of the wizard with contextual tips
 * - Has walking/floating/waving animations
 * - Changes pose based on the current step
 * - Can be dismissed/minimized
 * - RTL-aware positioning
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MascotHint {
  /** Step ID or index this hint applies to */
  stepId: string;
  /** Main tip message */
  message: string;
  /** Localized message (RTL/transcreated) */
  localMessage?: string;
  /** Emoji/icon for the tip */
  icon?: string;
  /** Mascot pose: idle, pointing, celebrating, thinking */
  pose?: 'idle' | 'pointing' | 'celebrating' | 'thinking' | 'waving';
}

interface GenieMascotProps {
  /** Current step ID to show relevant hint */
  currentStepId: string;
  /** Array of hints keyed by step */
  hints: MascotHint[];
  /** Direction for RTL positioning */
  direction?: 'ltr' | 'rtl';
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  /** Custom class */
  className?: string;
}

// Mascot face expressions per pose
const MASCOT_FACES: Record<string, { face: string; color: string }> = {
  idle: { face: '🧞', color: 'from-indigo-500/20 to-purple-500/20' },
  pointing: { face: '🧞‍♂️', color: 'from-blue-500/20 to-cyan-500/20' },
  celebrating: { face: '🎉', color: 'from-amber-500/20 to-orange-500/20' },
  thinking: { face: '🤔', color: 'from-emerald-500/20 to-teal-500/20' },
  waving: { face: '👋', color: 'from-pink-500/20 to-rose-500/20' },
};

// Floating animation variants - use `as const` for literal types
const floatingVariants = {
  idle: {
    y: [0, -6, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      y: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
      rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
    },
  },
  pointing: {
    y: [0, -4, 0],
    x: [0, 5, 0],
    transition: {
      y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
      x: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
  },
  celebrating: {
    y: [0, -12, 0],
    scale: [1, 1.1, 1],
    rotate: [0, -5, 5, 0],
    transition: {
      y: { duration: 0.8, repeat: Infinity, ease: 'easeOut' as const },
      scale: { duration: 0.8, repeat: Infinity },
      rotate: { duration: 0.6, repeat: Infinity },
    },
  },
  thinking: {
    y: [0, -3, 0],
    rotate: [-5, 0, -5],
    transition: {
      y: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
      rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
    },
  },
  waving: {
    y: [0, -4, 0],
    rotate: [0, 10, -10, 0],
    transition: {
      y: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
      rotate: { duration: 0.8, repeat: 3, ease: 'easeInOut' as const },
    },
  },
};

// Speech bubble appear/disappear
const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 10,
    transition: { duration: 0.2 } 
  },
};

export const GenieMascot: React.FC<GenieMascotProps> = ({
  currentStepId,
  hints,
  direction = 'ltr',
  position = 'inline',
  className,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  // Find current hint
  const currentHint = useMemo(
    () => hints.find(h => h.stepId === currentStepId),
    [hints, currentStepId]
  );

  const pose = currentHint?.pose || 'idle';
  const mascotConfig = MASCOT_FACES[pose] || MASCOT_FACES.idle;

  // Auto-show bubble on step change
  useEffect(() => {
    setShowBubble(true);
    setIsMinimized(false);
  }, [currentStepId]);

  // Auto-hide bubble after 8 seconds
  useEffect(() => {
    if (!showBubble || !currentHint) return;
    const timer = setTimeout(() => setShowBubble(false), 8000);
    return () => clearTimeout(timer);
  }, [showBubble, currentHint]);

  if (!currentHint || isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-xl',
          'bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1]',
          'text-xs text-muted-foreground transition-colors cursor-pointer',
          className,
        )}
        onClick={() => {
          setIsMinimized(false);
          setShowBubble(true);
        }}
      >
        <span className="text-base">🧞</span>
        <Sparkles className="w-3 h-3" />
      </motion.button>
    );
  }

  if (position === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative flex items-start gap-3 p-3 rounded-xl backdrop-blur-xl',
          'bg-gradient-to-r', mascotConfig.color,
          'border border-white/[0.08]',
          direction === 'rtl' && 'flex-row-reverse text-right',
          className,
        )}
        dir={direction}
      >
        {/* Mascot avatar */}
        <motion.div
          className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-xl"
          variants={floatingVariants}
          animate={pose}
        >
          {currentHint.icon || mascotConfig.face}
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.1] via-transparent to-transparent pointer-events-none" />
        </motion.div>

        {/* Message */}
        <AnimatePresence mode="wait">
          {showBubble && (
            <motion.div
              key={currentStepId}
              variants={bubbleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 min-w-0"
            >
              <p className="text-xs text-foreground/90 leading-relaxed">
                {currentHint.message}
              </p>
              {currentHint.localMessage && (
                <p className="text-[10px] text-muted-foreground/60 mt-1 leading-relaxed">
                  {currentHint.localMessage}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close/minimize */}
        <button
          onClick={() => setIsMinimized(true)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/[0.08] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </motion.div>
    );
  }

  // Fixed position (bottom-right / bottom-left)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn(
        'fixed z-50',
        position === 'bottom-right' && (direction === 'rtl' ? 'bottom-6 left-6' : 'bottom-6 right-6'),
        position === 'bottom-left' && (direction === 'rtl' ? 'bottom-6 right-6' : 'bottom-6 left-6'),
        className,
      )}
    >
      <div className="flex flex-col items-end gap-2">
        {/* Speech bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              variants={bubbleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'max-w-[240px] p-3 rounded-xl backdrop-blur-xl',
                'bg-white/[0.06] border border-white/[0.1]',
                'shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {currentHint.message}
                </p>
                <button onClick={() => setShowBubble(false)} className="p-0.5 hover:bg-white/10 rounded">
                  <X className="w-3 h-3 text-muted-foreground/50" />
                </button>
              </div>
              {currentHint.localMessage && (
                <p className="text-[10px] text-muted-foreground/60 mt-1">{currentHint.localMessage}</p>
              )}
              {/* Bubble tail */}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/[0.06] border-r border-b border-white/[0.1] rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot character */}
        <motion.button
          variants={floatingVariants}
          animate={pose}
          onClick={() => setShowBubble(!showBubble)}
          className={cn(
            'w-14 h-14 rounded-2xl backdrop-blur-xl flex items-center justify-center text-2xl cursor-pointer',
            'bg-gradient-to-br', mascotConfig.color,
            'border border-white/[0.1]',
            'shadow-[0_8px_32px_rgba(0,0,0,0.15)]',
            'hover:shadow-[0_8px_40px_rgba(0,0,0,0.25)] transition-shadow',
          )}
        >
          {currentHint.icon || mascotConfig.face}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default GenieMascot;
