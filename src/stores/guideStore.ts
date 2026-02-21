/**
 * GUIDE DOCK STORE — Zustand global store
 * 
 * Manages the Ori (creative) + Arc (systems) character guide dock.
 * This is the GLOBAL baseline for all 7 Genie Suite products.
 * 
 * Architecture:
 *   Zustand → global state (guide dock, character, preferences)
 *   XState  → orchestration (generation pipeline, character handoffs) — added later
 *   useReducer → isolated component forms
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────────────────────

export type GuideAgent = 'ori' | 'arc';

export type GuideSurface = 'collapsed' | 'peek' | 'open';

export type GuideTone = 'neutral' | 'encouraging' | 'celebratory' | 'cautious';

export type CastMode = 'create' | 'produce' | 'publish';

export interface GuideMessage {
  id: string;
  agent: GuideAgent;
  tone?: GuideTone;
  text: string;
  ctas?: { label: string; signal: ContextSignal }[];
  highlight?: {
    selector: string;
    style?: 'ring' | 'spotlight';
  };
  /** Auto-dismiss after ms (0 = manual dismiss only) */
  autoDismissMs?: number;
}

export type ContextSignal =
  | { type: 'PAGE_LOAD' }
  | { type: 'HOVER_CATEGORY'; categoryId: string }
  | { type: 'SELECT_CATEGORY'; categoryId: string }
  | { type: 'IDLE_TIMEOUT' }
  | { type: 'CLICK_HELP_ME_DECIDE' }
  | { type: 'DISMISS_GUIDE' }
  | { type: 'SWITCH_MODE'; mode: CastMode }
  | { type: 'STEP_COMPLETED'; stepId: string }
  | { type: 'PUBLISH_READY' };

// ── Character Metadata ───────────────────────────────────────────────────────

export const GUIDE_CHARACTERS = {
  ori: {
    name: 'Ori',
    role: 'Creative Guide',
    description: 'Handles intent, storytelling, category selection, "help me decide" moments',
    color: '#06B6D4', // Cyan
    colorClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/20',
    glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    ringClass: 'ring-cyan-500/30',
  },
  arc: {
    name: 'Arc',
    role: 'Systems Guide',
    description: 'Handles workflow structure, consistency checks, publish readiness',
    color: '#6366F1', // Indigo
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/20',
    glowClass: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
    ringClass: 'ring-indigo-500/30',
  },
} as const;

// ── Animation Tokens ─────────────────────────────────────────────────────────

export const ANIM_TOKENS = {
  IDLE_BREATHE: {
    duration: 3.2,
    ease: 'easeInOut' as const,
    scale: [1, 1.02, 1],
  },
  FADE_SLIDE_IN: {
    duration: 0.24,
    ease: [0.4, 0, 0.2, 1] as number[],
    y: [8, 0],
    opacity: [0, 1],
  },
  HEAD_NOD: {
    duration: 0.18,
    rotate: [-3, 0],
  },
  GLOW_PULSE: {
    duration: 1.6,
    ease: 'easeInOut' as const,
    shadowBlur: [0, 12, 0],
  },
  FADE_OUT: {
    duration: 0.18,
    opacity: [1, 0],
    y: [0, 6],
  },
} as const;

// ── Store State ──────────────────────────────────────────────────────────────

interface GuideState {
  // Mode
  mode: CastMode;

  // User context
  selectedCategoryId?: string;
  hoveredCategoryId?: string;
  lastInteractionAt: number;

  // Guide dock
  agent: GuideAgent;
  surface: GuideSurface;
  queue: GuideMessage[];
  seenOnboarding: boolean;
  voiceEnabled: boolean;

  // Actions
  dispatch: (signal: ContextSignal) => void;
  setMode: (mode: CastMode) => void;
  dismissGuide: () => void;
  clearQueue: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  touchInteraction: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildMsg(
  agent: GuideAgent,
  text: string,
  ctas?: GuideMessage['ctas'],
  highlight?: GuideMessage['highlight'],
  tone: GuideTone = 'neutral',
  autoDismissMs = 0,
): GuideMessage {
  return {
    id: crypto.randomUUID(),
    agent,
    tone,
    text,
    ctas,
    highlight,
    autoDismissMs,
  };
}

function categoryHoverCopy(_categoryId: string): string {
  return 'Great choice. This category works well for quick wins and scalable content.';
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      mode: 'create',
      lastInteractionAt: Date.now(),
      agent: 'ori',
      surface: 'collapsed',
      queue: [],
      seenOnboarding: false,
      voiceEnabled: false,

      touchInteraction: () => set({ lastInteractionAt: Date.now() }),

      setMode: (mode) =>
        set({
          mode,
          agent: mode === 'produce' || mode === 'publish' ? 'arc' : 'ori',
          surface: 'collapsed',
          queue: [],
        }),

      dismissGuide: () => set({ surface: 'collapsed', queue: [] }),

      clearQueue: () => set({ queue: [] }),

      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),

      dispatch: (signal) => {
        const state = get();

        switch (signal.type) {
          case 'PAGE_LOAD': {
            if (!state.seenOnboarding) {
              set({
                agent: 'ori',
                surface: 'peek',
                seenOnboarding: true,
                queue: [
                  buildMsg(
                    'ori',
                    "Welcome. Tell me what you want to build — I'll help shape the story.",
                    [
                      { label: 'Start with an idea', signal: { type: 'CLICK_HELP_ME_DECIDE' } },
                      { label: 'Explore examples', signal: { type: 'DISMISS_GUIDE' } },
                    ],
                    { selector: '[data-intent-panel]', style: 'spotlight' },
                    'encouraging',
                  ),
                ],
              });
            }
            break;
          }

          case 'HOVER_CATEGORY': {
            set({
              hoveredCategoryId: signal.categoryId,
              agent: 'ori',
              surface: 'peek',
              queue: [
                buildMsg('ori', categoryHoverCopy(signal.categoryId), undefined, undefined, 'neutral', 3000),
              ],
              lastInteractionAt: Date.now(),
            });
            break;
          }

          case 'SELECT_CATEGORY': {
            set({
              selectedCategoryId: signal.categoryId,
              hoveredCategoryId: undefined,
              agent: 'arc',
              surface: 'peek',
              queue: [
                buildMsg(
                  'arc',
                  "I'll structure the workflow so this scales cleanly later.",
                  [{ label: 'Continue', signal: { type: 'SWITCH_MODE', mode: 'create' } }],
                  { selector: '[data-templates-panel]', style: 'ring' },
                ),
              ],
              lastInteractionAt: Date.now(),
            });
            break;
          }

          case 'IDLE_TIMEOUT': {
            if (state.surface === 'open') return;
            set({
              agent: 'ori',
              surface: 'peek',
              queue: [
                buildMsg(
                  'ori',
                  "Want help deciding, or do you already know what you're building?",
                  [
                    { label: 'Help me decide', signal: { type: 'CLICK_HELP_ME_DECIDE' } },
                    { label: "I've got it", signal: { type: 'DISMISS_GUIDE' } },
                  ],
                ),
              ],
            });
            break;
          }

          case 'CLICK_HELP_ME_DECIDE': {
            set({
              agent: 'ori',
              surface: 'open',
              queue: [
                buildMsg(
                  'ori',
                  'Quick question: are you creating content for a product, an internal workflow, or a public audience?',
                  [
                    { label: 'Product', signal: { type: 'DISMISS_GUIDE' } },
                    { label: 'Workflow', signal: { type: 'DISMISS_GUIDE' } },
                    { label: 'Public', signal: { type: 'DISMISS_GUIDE' } },
                  ],
                ),
              ],
              lastInteractionAt: Date.now(),
            });
            break;
          }

          case 'SWITCH_MODE': {
            set({
              mode: signal.mode,
              agent: signal.mode === 'produce' || signal.mode === 'publish' ? 'arc' : 'ori',
              surface: 'collapsed',
              queue: [],
              lastInteractionAt: Date.now(),
            });
            break;
          }

          case 'DISMISS_GUIDE': {
            set({ surface: 'collapsed', queue: [] });
            break;
          }

          case 'STEP_COMPLETED': {
            set({
              agent: 'arc',
              surface: 'peek',
              queue: [
                buildMsg('arc', 'Nice. Everything\'s consistent so far.', undefined, undefined, 'encouraging', 2500),
              ],
            });
            break;
          }

          case 'PUBLISH_READY': {
            set({
              agent: 'arc',
              surface: 'peek',
              queue: [
                buildMsg(
                  'arc',
                  'The system is ready. Nothing left dangling.',
                  [{ label: 'Publish', signal: { type: 'SWITCH_MODE', mode: 'publish' } }],
                  undefined,
                  'celebratory',
                ),
              ],
            });
            break;
          }
        }
      },
    }),
    {
      name: 'genie-guide-store',
      partialize: (state) => ({
        seenOnboarding: state.seenOnboarding,
        voiceEnabled: state.voiceEnabled,
        mode: state.mode,
      }),
    },
  ),
);
