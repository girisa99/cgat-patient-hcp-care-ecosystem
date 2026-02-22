/**
 * GUIDE DOCK STORE — Zustand global store
 * 
 * Manages the Ori (creative) + Arc (systems) character guide dock.
 * This is the GLOBAL baseline for all 7 Genie Suite products.
 * 
 * NOW REGIONALIZED: Messages are pulled from guideMessageCatalog.ts
 * using the same regional-routing-registry hierarchy (82+ regions).
 * 
 * HANDOFF MACHINE: Character transitions now route through the XState-compatible
 * handoff state machine for contextual motion (crossfade, tag-team, split-morph, instant).
 * 
 * Architecture:
 *   Zustand → global state (guide dock, character, preferences)
 *   Handoff Machine → orchestrated character transitions with motion variants
 *   useReducer → isolated component forms
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  resolveGuideRegion,
  getGuideMessage,
  type RegionalGuideContext,
  type GuideMessageKey,
} from '@/config/guideMessageCatalog';
import {
  type HandoffContext,
  type HandoffStyle,
  type HandoffTrigger,
  INITIAL_HANDOFF_CONTEXT,
  handoffTransition,
  resolveHandoffStyle,
} from '@/machines/guideHandoffMachine';

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

  // Regional context (IP/browser/manual detection)
  regionalContext: RegionalGuideContext;

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

  // Handoff machine state — drives character transition animations
  handoff: HandoffContext;

  // Actions
  dispatch: (signal: ContextSignal) => void;
  setMode: (mode: CastMode) => void;
  dismissGuide: () => void;
  clearQueue: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  touchInteraction: () => void;
  setRegionalContext: (ctx: RegionalGuideContext) => void;
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

/** Localized message helper — resolves from catalog using current region */
function msg(key: GuideMessageKey, lang: string): string {
  return getGuideMessage(key, lang);
}

/** Map context signal to handoff trigger for motion style resolution */
function signalToTrigger(signal: ContextSignal): HandoffTrigger {
  switch (signal.type) {
    case 'PAGE_LOAD': return 'page_load';
    case 'SWITCH_MODE': return 'mode_switch';
    case 'SELECT_CATEGORY': return 'category_select';
    case 'STEP_COMPLETED': return 'step_completed';
    case 'PUBLISH_READY': return 'publish_ready';
    case 'IDLE_TIMEOUT': return 'idle_timeout';
    case 'CLICK_HELP_ME_DECIDE': return 'help_me_decide';
    default: return 'user_click';
  }
}

/** Initiate a handoff transition from current agent to target agent */
function startHandoff(
  currentHandoff: HandoffContext,
  fromAgent: GuideAgent,
  toAgent: GuideAgent,
  trigger: HandoffTrigger,
): HandoffContext {
  if (fromAgent === toAgent) return currentHandoff;
  const style = resolveHandoffStyle(trigger);
  return handoffTransition(currentHandoff, {
    type: 'START_HANDOFF',
    from: fromAgent,
    to: toAgent,
    style,
  });
}

// ── Initial region detection ─────────────────────────────────────────────────

function getInitialRegion(): RegionalGuideContext {
  if (typeof window === 'undefined') {
    return { zone: 'western', languageCode: 'en-US', shortLang: 'en', isRTL: false };
  }
  const browserLang = navigator.languages?.[0] || navigator.language;
  return resolveGuideRegion(browserLang);
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      mode: 'create',
      regionalContext: getInitialRegion(),
      lastInteractionAt: Date.now(),
      agent: 'ori',
      surface: 'collapsed',
      queue: [],
      seenOnboarding: false,
      voiceEnabled: false,
      handoff: INITIAL_HANDOFF_CONTEXT,

      touchInteraction: () => set({ lastInteractionAt: Date.now() }),

      setRegionalContext: (ctx) => set({ regionalContext: ctx }),

      setMode: (mode) => {
        const state = get();
        const newAgent: GuideAgent = mode === 'produce' || mode === 'publish' ? 'arc' : 'ori';
        const newHandoff = startHandoff(state.handoff, state.agent, newAgent, 'mode_switch');
        set({
          mode,
          agent: newAgent,
          surface: 'collapsed',
          queue: [],
          handoff: newHandoff,
        });
      },

      dismissGuide: () => set({ surface: 'collapsed', queue: [] }),

      clearQueue: () => set({ queue: [] }),

      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),

      dispatch: (signal) => {
        const state = get();
        const lang = state.regionalContext.shortLang;
        const trigger = signalToTrigger(signal);

        switch (signal.type) {
          case 'PAGE_LOAD': {
            if (!state.seenOnboarding) {
              set({
                agent: 'ori',
                surface: 'peek',
                seenOnboarding: true,
                handoff: startHandoff(state.handoff, state.agent, 'ori', trigger),
                queue: [
                  buildMsg(
                    'ori',
                    msg('PAGE_LOAD_WELCOME', lang),
                    [
                      { label: msg('PAGE_LOAD_CTA_START', lang), signal: { type: 'CLICK_HELP_ME_DECIDE' } },
                      { label: msg('PAGE_LOAD_CTA_EXPLORE', lang), signal: { type: 'DISMISS_GUIDE' } },
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
              handoff: startHandoff(state.handoff, state.agent, 'ori', trigger),
              queue: [
                buildMsg('ori', msg('HOVER_CATEGORY', lang), undefined, undefined, 'neutral', 3000),
              ],
              lastInteractionAt: Date.now(),
            });
            break;
          }

          case 'SELECT_CATEGORY': {
            // Tag-team handoff: Ori → Arc with baton-pass
            const newHandoff = startHandoff(state.handoff, state.agent, 'arc', trigger);
            set({
              selectedCategoryId: signal.categoryId,
              hoveredCategoryId: undefined,
              agent: 'arc',
              surface: 'peek',
              handoff: newHandoff,
              queue: [
                buildMsg(
                  'arc',
                  msg('SELECT_CATEGORY', lang),
                  [{ label: '→', signal: { type: 'SWITCH_MODE', mode: 'create' } }],
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
              handoff: startHandoff(state.handoff, state.agent, 'ori', trigger),
              queue: [
                buildMsg(
                  'ori',
                  msg('IDLE_TIMEOUT', lang),
                  [
                    { label: msg('IDLE_CTA_HELP', lang), signal: { type: 'CLICK_HELP_ME_DECIDE' } },
                    { label: msg('IDLE_CTA_GOT_IT', lang), signal: { type: 'DISMISS_GUIDE' } },
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
              handoff: startHandoff(state.handoff, state.agent, 'ori', trigger),
              queue: [
                buildMsg(
                  'ori',
                  msg('HELP_ME_DECIDE', lang),
                  [
                    { label: msg('HELP_CTA_PRODUCT', lang), signal: { type: 'DISMISS_GUIDE' } },
                    { label: msg('HELP_CTA_WORKFLOW', lang), signal: { type: 'DISMISS_GUIDE' } },
                    { label: msg('HELP_CTA_PUBLIC', lang), signal: { type: 'DISMISS_GUIDE' } },
                  ],
                ),
              ],
              lastInteractionAt: Date.now(),
            });
            break;
          }

          case 'SWITCH_MODE': {
            const newAgent: GuideAgent = signal.mode === 'produce' || signal.mode === 'publish' ? 'arc' : 'ori';
            set({
              mode: signal.mode,
              agent: newAgent,
              surface: 'collapsed',
              queue: [],
              handoff: startHandoff(state.handoff, state.agent, newAgent, trigger),
              lastInteractionAt: Date.now(),
            });
            break;
          }

          case 'DISMISS_GUIDE': {
            set({
              surface: 'collapsed',
              queue: [],
              handoff: handoffTransition(state.handoff, { type: 'CANCEL' }),
            });
            break;
          }

          case 'STEP_COMPLETED': {
            // Tag-team: current → Arc with encouraging tone
            set({
              agent: 'arc',
              surface: 'peek',
              handoff: startHandoff(state.handoff, state.agent, 'arc', trigger),
              queue: [
                buildMsg('arc', msg('STEP_COMPLETED', lang), undefined, undefined, 'encouraging', 2500),
              ],
            });
            break;
          }

          case 'PUBLISH_READY': {
            // Split-morph: dramatic handoff for milestone
            set({
              agent: 'arc',
              surface: 'peek',
              handoff: startHandoff(state.handoff, state.agent, 'arc', trigger),
              queue: [
                buildMsg(
                  'arc',
                  msg('PUBLISH_READY', lang),
                  [{ label: msg('PUBLISH_CTA', lang), signal: { type: 'SWITCH_MODE', mode: 'publish' } }],
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
