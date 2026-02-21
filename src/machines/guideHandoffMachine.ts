/**
 * XSTATE CHARACTER HANDOFF MACHINE
 * 
 * Orchestrates Ori ↔ Arc transitions with situational motion styles:
 * - Crossfade: Default smooth transition (page load, mode switch)
 * - Tag-team: Both briefly visible, baton-pass gesture (category select → workflow)
 * - Split-screen morph: Dramatic split for publish readiness
 * 
 * Framer Motion variants are exported for GuideDock to consume.
 * Uses pure state machine pattern (no xstate dependency - zustand-compatible).
 */

import type { GuideAgent } from '@/stores/guideStore';

// ═══════════════════════════════════════════════════════════════════════════
// MOTION STYLES — Situational animation variants
// ═══════════════════════════════════════════════════════════════════════════

export type HandoffStyle = 'crossfade' | 'tag_team' | 'split_morph' | 'instant';

export interface HandoffMotionConfig {
  /** Outgoing character animation */
  exit: {
    opacity: number[];
    x?: number[];
    y?: number[];
    scale?: number[];
    rotate?: number[];
    duration: number;
    ease: string;
  };
  /** Incoming character animation */
  enter: {
    opacity: number[];
    x?: number[];
    y?: number[];
    scale?: number[];
    rotate?: number[];
    duration: number;
    ease: string;
    delay: number;
  };
  /** Overlap duration where both are visible (0 = sequential) */
  overlapMs: number;
  /** Optional glow/highlight effect on incoming */
  glowPulse: boolean;
}

export const HANDOFF_MOTIONS: Record<HandoffStyle, HandoffMotionConfig> = {
  // Smooth cinematic crossfade — default for most transitions
  crossfade: {
    exit: { opacity: [1, 0], y: [0, 6], scale: [1, 0.95], duration: 0.22, ease: 'easeOut' },
    enter: { opacity: [0, 1], y: [8, 0], scale: [0.95, 1], duration: 0.28, ease: 'easeOut', delay: 0.12 },
    overlapMs: 120,
    glowPulse: false,
  },

  // Tag-team: outgoing gestures toward incoming, both briefly visible
  tag_team: {
    exit: { opacity: [1, 0.6, 0], x: [-0, -12], rotate: [-3, 0], scale: [1, 0.92], duration: 0.32, ease: 'easeInOut' },
    enter: { opacity: [0, 0.8, 1], x: [16, 0], rotate: [3, 0], scale: [0.9, 1.02, 1], duration: 0.36, ease: 'easeOut', delay: 0.08 },
    overlapMs: 280,
    glowPulse: true,
  },

  // Split-screen morph: dramatic for milestone moments
  split_morph: {
    exit: { opacity: [1, 0.8, 0], x: [0, -24], scale: [1, 0.85], duration: 0.4, ease: 'easeInOut' },
    enter: { opacity: [0, 0.5, 1], x: [24, 0], scale: [0.85, 1.04, 1], duration: 0.44, ease: 'easeOut', delay: 0.2 },
    overlapMs: 400,
    glowPulse: true,
  },

  // Instant — no animation (used for programmatic switches)
  instant: {
    exit: { opacity: [1, 0], duration: 0, ease: 'linear' },
    enter: { opacity: [0, 1], duration: 0, ease: 'linear', delay: 0 },
    overlapMs: 0,
    glowPulse: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HANDOFF STATE MACHINE
// ═══════════════════════════════════════════════════════════════════════════

export type HandoffState = 'idle' | 'exiting' | 'overlap' | 'entering' | 'complete';

export interface HandoffContext {
  state: HandoffState;
  fromAgent: GuideAgent | null;
  toAgent: GuideAgent | null;
  style: HandoffStyle;
  startedAt: number;
}

export type HandoffEvent =
  | { type: 'START_HANDOFF'; from: GuideAgent; to: GuideAgent; style: HandoffStyle }
  | { type: 'EXIT_COMPLETE' }
  | { type: 'OVERLAP_COMPLETE' }
  | { type: 'ENTER_COMPLETE' }
  | { type: 'CANCEL' };

/**
 * Pure state machine transition function.
 * Returns new context based on current state + event.
 */
export function handoffTransition(ctx: HandoffContext, event: HandoffEvent): HandoffContext {
  switch (event.type) {
    case 'START_HANDOFF':
      if (event.from === event.to) return ctx; // No-op same agent
      return { state: 'exiting', fromAgent: event.from, toAgent: event.to, style: event.style, startedAt: Date.now() };

    case 'EXIT_COMPLETE':
      if (ctx.state !== 'exiting') return ctx;
      return { ...ctx, state: ctx.style === 'instant' ? 'complete' : 'overlap' };

    case 'OVERLAP_COMPLETE':
      if (ctx.state !== 'overlap') return ctx;
      return { ...ctx, state: 'entering' };

    case 'ENTER_COMPLETE':
      if (ctx.state !== 'entering') return ctx;
      return { ...ctx, state: 'complete' };

    case 'CANCEL':
      return { state: 'idle', fromAgent: null, toAgent: null, style: 'instant', startedAt: 0 };

    default:
      return ctx;
  }
}

export const INITIAL_HANDOFF_CONTEXT: HandoffContext = {
  state: 'idle',
  fromAgent: null,
  toAgent: null,
  style: 'crossfade',
  startedAt: 0,
};

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL → STYLE MAPPING — determines which motion for each context
// ═══════════════════════════════════════════════════════════════════════════

export type HandoffTrigger =
  | 'page_load'
  | 'mode_switch'
  | 'category_select'
  | 'step_completed'
  | 'publish_ready'
  | 'idle_timeout'
  | 'help_me_decide'
  | 'user_click';

/**
 * Resolve which handoff style to use based on the trigger context.
 * Different situations get different motion treatments.
 */
export function resolveHandoffStyle(trigger: HandoffTrigger): HandoffStyle {
  switch (trigger) {
    // Dramatic moments — split morph
    case 'publish_ready':
      return 'split_morph';

    // Collaborative moments — tag team (both characters briefly visible)
    case 'category_select':
    case 'step_completed':
    case 'help_me_decide':
      return 'tag_team';

    // Smooth transitions — crossfade
    case 'mode_switch':
    case 'idle_timeout':
    case 'page_load':
      return 'crossfade';

    // User-initiated — instant
    case 'user_click':
      return 'instant';

    default:
      return 'crossfade';
  }
}

/**
 * Get framer-motion compatible variants for exit/enter animations
 */
export function getHandoffVariants(style: HandoffStyle) {
  const config = HANDOFF_MOTIONS[style];

  return {
    exitVariant: {
      opacity: config.exit.opacity[config.exit.opacity.length - 1],
      x: config.exit.x?.[config.exit.x.length - 1] ?? 0,
      y: config.exit.y?.[config.exit.y.length - 1] ?? 0,
      scale: config.exit.scale?.[config.exit.scale.length - 1] ?? 1,
      rotate: config.exit.rotate?.[config.exit.rotate.length - 1] ?? 0,
      transition: { duration: config.exit.duration, ease: config.exit.ease },
    },
    enterInitial: {
      opacity: config.enter.opacity[0],
      x: config.enter.x?.[0] ?? 0,
      y: config.enter.y?.[0] ?? 0,
      scale: config.enter.scale?.[0] ?? 1,
      rotate: config.enter.rotate?.[0] ?? 0,
    },
    enterAnimate: {
      opacity: config.enter.opacity[config.enter.opacity.length - 1],
      x: config.enter.x?.[config.enter.x.length - 1] ?? 0,
      y: config.enter.y?.[config.enter.y.length - 1] ?? 0,
      scale: config.enter.scale?.[config.enter.scale.length - 1] ?? 1,
      rotate: config.enter.rotate?.[config.enter.rotate.length - 1] ?? 0,
      transition: { duration: config.enter.duration, ease: config.enter.ease, delay: config.enter.delay },
    },
    glowPulse: config.glowPulse,
    overlapMs: config.overlapMs,
  };
}
