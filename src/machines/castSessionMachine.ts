/**
 * XState Machine — Genie Cast Session Workflow
 *
 * Replaces manual stage tracking in useGenieCastSession with a
 * declarative state machine. Prevents invalid state combinations
 * and provides clear transition guards.
 *
 * Stages: template_selection → messaging → script → template_mapping →
 *         tts_generation → av_sync → approval → publishing
 *
 * Usage:
 *   import { useMachine } from '@xstate/react';
 *   import { castSessionMachine } from '@/machines/castSessionMachine';
 *
 *   const [state, send] = useMachine(castSessionMachine, {
 *     input: { projectId: '...' }
 *   });
 *
 *   send({ type: 'SELECT_TEMPLATE', templateId: '...' });
 *   state.matches('messaging_generation'); // true
 */

import { setup, assign } from 'xstate';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CastSessionContext {
  sessionId: string;
  projectId: string | null;

  // Selections
  selectedProductId: string | null;
  selectedIntent: string | null;
  selectedStyles: string[];
  selectedTemplate: string | null;
  selectedCharacterIds: string[];

  // Region/dialect
  detectedRegion: string | null;
  selectedRegion: string | null;
  targetRegions: string[];
  selectedDialects: string[];

  // Approved artifacts
  approvedMessaging: Record<string, unknown> | null;
  templateMapping: Record<string, unknown> | null;
  ttsGenerated: boolean;
  avSyncVerified: boolean;

  // Approval
  approvalItems: Array<{ id: string; status: 'pending' | 'approved' | 'rejected' }>;

  // Metadata
  createdAt: string;
  updatedAt: string;
  error: string | null;
}

// ─── Events ─────────────────────────────────────────────────────────────────

type CastSessionEvent =
  | { type: 'SELECT_TEMPLATE'; templateId: string; styles?: string[] }
  | { type: 'SET_PRODUCT'; productId: string; intent?: string }
  | { type: 'SET_REGION'; region: string; dialects?: string[] }
  | { type: 'APPROVE_MESSAGING'; messaging: Record<string, unknown> }
  | { type: 'REJECT_MESSAGING' }
  | { type: 'APPROVE_SCRIPT'; templateMapping: Record<string, unknown> }
  | { type: 'REJECT_SCRIPT' }
  | { type: 'MARK_TTS_GENERATED' }
  | { type: 'TTS_FAILED'; error: string }
  | { type: 'VERIFY_AV_SYNC' }
  | { type: 'AV_SYNC_FAILED'; error: string }
  | { type: 'SUBMIT_FOR_APPROVAL' }
  | { type: 'APPROVE_FINAL' }
  | { type: 'REJECT_FINAL'; reason: string }
  | { type: 'PUBLISH' }
  | { type: 'GO_BACK' }
  | { type: 'RESET' };

// ─── Machine ────────────────────────────────────────────────────────────────

export const castSessionMachine = setup({
  types: {
    context: {} as CastSessionContext,
    events: {} as CastSessionEvent,
    input: {} as { projectId?: string; sessionId?: string },
  },
  guards: {
    hasTemplate: ({ context }) => !!context.selectedTemplate,
    hasMessaging: ({ context }) => !!context.approvedMessaging,
    hasScript: ({ context }) => !!context.templateMapping,
    hasTTS: ({ context }) => context.ttsGenerated,
    hasAVSync: ({ context }) => context.avSyncVerified,
    hasRegion: ({ context }) => !!context.selectedRegion || !!context.detectedRegion,
  },
}).createMachine({
  id: 'castSession',
  initial: 'template_selection',

  context: ({ input }) => ({
    sessionId: input?.sessionId || crypto.randomUUID(),
    projectId: input?.projectId || null,
    selectedProductId: null,
    selectedIntent: null,
    selectedStyles: [],
    selectedTemplate: null,
    selectedCharacterIds: [],
    detectedRegion: null,
    selectedRegion: null,
    targetRegions: [],
    selectedDialects: [],
    approvedMessaging: null,
    templateMapping: null,
    ttsGenerated: false,
    avSyncVerified: false,
    approvalItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    error: null,
  }),

  on: {
    RESET: {
      target: '.template_selection',
      actions: assign({
        selectedTemplate: null,
        selectedStyles: [],
        approvedMessaging: null,
        templateMapping: null,
        ttsGenerated: false,
        avSyncVerified: false,
        approvalItems: [],
        error: null,
        updatedAt: () => new Date().toISOString(),
      }),
    },
    SET_PRODUCT: {
      actions: assign({
        selectedProductId: ({ event }) => event.productId,
        selectedIntent: ({ event }) => event.intent || null,
        updatedAt: () => new Date().toISOString(),
      }),
    },
    SET_REGION: {
      actions: assign({
        selectedRegion: ({ event }) => event.region,
        selectedDialects: ({ event }) => event.dialects || [],
        updatedAt: () => new Date().toISOString(),
      }),
    },
  },

  states: {
    template_selection: {
      on: {
        SELECT_TEMPLATE: {
          target: 'messaging_generation',
          actions: assign({
            selectedTemplate: ({ event }) => event.templateId,
            selectedStyles: ({ event }) => event.styles || [],
            updatedAt: () => new Date().toISOString(),
          }),
        },
      },
    },

    messaging_generation: {
      on: {
        APPROVE_MESSAGING: {
          target: 'script_composition',
          actions: assign({
            approvedMessaging: ({ event }) => event.messaging,
            updatedAt: () => new Date().toISOString(),
          }),
        },
        REJECT_MESSAGING: {
          target: 'messaging_generation',
          actions: assign({
            approvedMessaging: null,
            error: 'Messaging rejected — please regenerate',
            updatedAt: () => new Date().toISOString(),
          }),
        },
        GO_BACK: 'template_selection',
      },
    },

    script_composition: {
      on: {
        APPROVE_SCRIPT: {
          target: 'template_mapping',
          actions: assign({
            templateMapping: ({ event }) => event.templateMapping,
            updatedAt: () => new Date().toISOString(),
          }),
        },
        REJECT_SCRIPT: {
          target: 'script_composition',
          actions: assign({
            templateMapping: null,
            error: 'Script rejected — please revise',
            updatedAt: () => new Date().toISOString(),
          }),
        },
        GO_BACK: 'messaging_generation',
      },
    },

    template_mapping: {
      on: {
        MARK_TTS_GENERATED: {
          target: 'tts_generation',
          actions: assign({
            ttsGenerated: true,
            error: null,
            updatedAt: () => new Date().toISOString(),
          }),
        },
        GO_BACK: 'script_composition',
      },
    },

    tts_generation: {
      on: {
        VERIFY_AV_SYNC: {
          target: 'av_sync',
          actions: assign({
            avSyncVerified: true,
            error: null,
            updatedAt: () => new Date().toISOString(),
          }),
        },
        TTS_FAILED: {
          target: 'template_mapping',
          actions: assign({
            ttsGenerated: false,
            error: ({ event }) => event.error,
            updatedAt: () => new Date().toISOString(),
          }),
        },
        GO_BACK: 'template_mapping',
      },
    },

    av_sync: {
      on: {
        SUBMIT_FOR_APPROVAL: {
          target: 'approval',
          actions: assign({
            updatedAt: () => new Date().toISOString(),
          }),
        },
        AV_SYNC_FAILED: {
          target: 'tts_generation',
          actions: assign({
            avSyncVerified: false,
            error: ({ event }) => event.error,
            updatedAt: () => new Date().toISOString(),
          }),
        },
        GO_BACK: 'tts_generation',
      },
    },

    approval: {
      on: {
        APPROVE_FINAL: {
          target: 'publishing',
          actions: assign({
            updatedAt: () => new Date().toISOString(),
          }),
        },
        REJECT_FINAL: {
          target: 'script_composition',
          actions: assign({
            error: ({ event }) => event.reason,
            updatedAt: () => new Date().toISOString(),
          }),
        },
        GO_BACK: 'av_sync',
      },
    },

    publishing: {
      on: {
        PUBLISH: {
          target: 'published',
          actions: assign({
            updatedAt: () => new Date().toISOString(),
          }),
        },
        GO_BACK: 'approval',
      },
    },

    published: {
      type: 'final',
    },
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Get human-readable stage label */
export function getStageLabel(stateValue: string): string {
  const labels: Record<string, string> = {
    template_selection: 'Template Selection',
    messaging_generation: 'Messaging',
    script_composition: 'Script',
    template_mapping: 'Template Mapping',
    tts_generation: 'Voice Generation',
    av_sync: 'A/V Sync',
    approval: 'Review & Approval',
    publishing: 'Publishing',
    published: 'Published',
  };
  return labels[stateValue] || stateValue;
}

/** Get completion percentage */
export function getStageProgress(stateValue: string): number {
  const order = [
    'template_selection',
    'messaging_generation',
    'script_composition',
    'template_mapping',
    'tts_generation',
    'av_sync',
    'approval',
    'publishing',
    'published',
  ];
  const idx = order.indexOf(stateValue);
  return idx >= 0 ? Math.round((idx / (order.length - 1)) * 100) : 0;
}

/** Get all stages with current/completed status */
export function getStageMap(currentState: string) {
  const stages = [
    'template_selection',
    'messaging_generation',
    'script_composition',
    'template_mapping',
    'tts_generation',
    'av_sync',
    'approval',
    'publishing',
  ];
  const currentIdx = stages.indexOf(currentState);

  return stages.map((stage, idx) => ({
    id: stage,
    label: getStageLabel(stage),
    status: idx < currentIdx ? 'completed' as const
          : idx === currentIdx ? 'current' as const
          : 'upcoming' as const,
  }));
}
