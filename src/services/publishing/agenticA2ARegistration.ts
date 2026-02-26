/**
 * Agentic Content Orchestrator — A2A Agent Registration & REST Wrapper
 *
 * Registers the 8-agent content pipeline as a discoverable A2A agent
 * per Google A2A spec (https://google.github.io/A2A/). Any external agent
 * or service can discover and invoke the orchestrator via tasks/send.
 *
 * Also provides a REST-callable wrapper around `orchestrateBatch()` for
 * direct HTTP consumption (edge functions, webhooks, external APIs).
 */

import type { AgentCard, AgentCapability, AgentSkill, AgentEndpoint } from '@/hooks/useA2AProtocol';
import type { AgenticOrchestratorConfig, AgenticBatchResult } from './agenticContentOrchestrator';
import { orchestrateBatch, getDefaultConfig, AGENT_PIPELINE_ORDER, AGENT_LABELS } from './agenticContentOrchestrator';

// ─── Agent Card Definition ──────────────────────────────────────────────────
// JSON-LD compliant agent card for discovery by other A2A agents.

export const AGENTIC_ORCHESTRATOR_AGENT_CARD: AgentCard = {
  id: 'genie-agentic-content-orchestrator',
  name: 'Genie Agentic Content Orchestrator',
  description:
    'An 8-agent pipeline that generates production-ready content from a single prompt. ' +
    'Agents: CreativeDirector → Scriptwriter → VisualDesigner → QualityReviewer → ' +
    'VoiceoverAgent → AudioMixAgent → TranscreationAgent → PublishCoordinator. ' +
    'Supports 16 regions, 62 subregions, 85+ languages, and all GenieSuite products.',
  version: '1.0.0',
  capabilities: buildOrchestratorCapabilities(),
  skills: buildOrchestratorSkills(),
  endpoints: buildOrchestratorEndpoints(),
  authentication: { type: 'api_key' },
  metadata: {
    agentType: 'multi-agent-pipeline',
    pipelineAgents: AGENT_PIPELINE_ORDER.map(role => ({
      role,
      label: AGENT_LABELS[role],
    })),
    supportedProducts: ['cast', 'spark', 'mind', 'deck', 'vibe', 'hub'],
    supportedRegions: 16,
    supportedSubRegions: 62,
    supportedLanguages: 85,
    outputFormats: [
      'short_video', 'long_video', 'carousel', 'social_card',
      'text_post', 'audio_podcast', 'audiogram',
    ],
  },
};

function buildOrchestratorCapabilities(): AgentCapability[] {
  return [
    {
      id: 'orchestrate-batch',
      name: 'Orchestrate Content Batch',
      description:
        'Generate a batch of content items through the 8-agent pipeline. ' +
        'Each item passes through all agents: creative direction, scriptwriting, ' +
        'visual design, quality review, voiceover, audio mix, transcreation, publishing.',
      inputSchema: {
        type: 'object',
        properties: {
          batchSize: { type: 'number', description: 'Number of items to generate (1-20)' },
          targetRegion: { type: 'string', description: 'Target parent region code (e.g. NAM, EU, MENA)' },
          targetSubRegion: { type: 'string', description: 'Optional subregion code (e.g. INDIA_SOUTH)' },
          language: { type: 'string', description: 'ISO language code (e.g. en, ar, hi)' },
          qualityTarget: { type: 'number', description: 'Minimum quality score 0-100' },
          sourceProduct: { type: 'string', description: 'Source product (cast, spark, mind, deck, vibe)' },
          enableProduction: { type: 'boolean', description: 'Build full production plan with blueprint/timeline' },
          quality: { type: 'string', enum: ['preview', 'standard', 'production', 'cinematic'] },
        },
        required: ['batchSize'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          batchId: { type: 'string' },
          items: { type: 'array' },
          totalDurationMs: { type: 'number' },
          agentTimings: { type: 'object' },
        },
      },
    },
    {
      id: 'execute-production',
      name: 'Execute Production Rendering',
      description:
        'Render a production plan into final media. Routes to format-specific pipelines: ' +
        'video (TTS→avatar→assembly→transcode), audio (TTS→stitch), image, presentation.',
      inputSchema: {
        type: 'object',
        properties: {
          productionPlanId: { type: 'string' },
          quality: { type: 'string', enum: ['preview', 'standard', 'production', 'cinematic'] },
          outputPresets: { type: 'array', items: { type: 'string' } },
        },
        required: ['productionPlanId'],
      },
    },
    {
      id: 'transcreate',
      name: 'Transcreate Content',
      description:
        'Adapt content for 16 regions × 62 subregions with cultural tone adjustment, ' +
        'RTL detection, and hashtag localization. Uses canonical region/subregion config.',
    },
  ];
}

function buildOrchestratorSkills(): AgentSkill[] {
  return [
    {
      id: 'content-generation',
      name: 'AI Content Generation',
      description: 'Generate structured 5-part scripts (hook/problem/transformation/solution/CTA)',
      tags: ['content', 'script', 'generation', 'ai'],
      examples: [
        'Generate a healthcare content batch for MENA region',
        'Create 6 educational videos for India market',
        'Produce a carousel about pet wellness for EU',
      ],
    },
    {
      id: 'multi-format-production',
      name: 'Multi-Format Production',
      description: 'Produce content in video, audio, carousel, infographic, and text formats',
      tags: ['video', 'audio', 'carousel', 'production', 'rendering'],
      examples: [
        'Render a 60s mini-doc with avatar and voiceover',
        'Create an audiogram podcast clip',
        'Generate a social carousel with 5 slides',
      ],
    },
    {
      id: 'regional-transcreation',
      name: 'Regional Transcreation',
      description: 'Adapt content across 16 regions, 62 subregions, 85+ languages',
      tags: ['translation', 'localization', 'regional', 'cultural-adaptation'],
      examples: [
        'Transcreate English content for Gulf States (Khaleeji dialect)',
        'Adapt marketing copy for South India (Tamil/Telugu/Kannada)',
        'Localize hashtags for LATAM Spanish and Portuguese',
      ],
    },
  ];
}

function buildOrchestratorEndpoints(): AgentEndpoint[] {
  return [
    {
      type: 'http',
      url: '/api/a2a/agentic-orchestrator',
      methods: ['POST'],
    },
    {
      type: 'sse',
      url: '/api/a2a/agentic-orchestrator/stream',
    },
  ];
}

// ─── REST Wrapper — callable from edge functions, webhooks, external APIs ────

export interface OrchestrateRequest {
  action: 'orchestrate-batch' | 'execute-production' | 'transcreate';
  config?: Partial<AgenticOrchestratorConfig>;
  payload?: Record<string, any>;
}

export interface OrchestrateResponse {
  success: boolean;
  batchId?: string;
  result?: AgenticBatchResult;
  error?: string;
  durationMs?: number;
}

/**
 * REST-callable wrapper around the agentic orchestrator.
 * Designed for consumption by edge functions, A2A agents, webhooks, and external APIs.
 * Stateless — each call is independent (no session state).
 */
export async function handleOrchestrateRequest(
  request: OrchestrateRequest,
): Promise<OrchestrateResponse> {
  const startMs = Date.now();

  try {
    if (request.action === 'orchestrate-batch') {
      const config = { ...getDefaultConfig(), ...request.config };
      const result = await orchestrateBatch(config);
      return {
        success: true,
        batchId: result.batchId,
        result,
        durationMs: Date.now() - startMs,
      };
    }

    if (request.action === 'transcreate') {
      // Transcreation is handled inline by the orchestrator
      // Invoke a single-item batch with transcreation enabled
      const config = {
        ...getDefaultConfig(),
        ...request.config,
        batchSize: 1,
        enableTranscreation: true,
      };
      const result = await orchestrateBatch(config);
      return {
        success: true,
        batchId: result.batchId,
        result,
        durationMs: Date.now() - startMs,
      };
    }

    return {
      success: false,
      error: `Unknown action: ${request.action}`,
      durationMs: Date.now() - startMs,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      durationMs: Date.now() - startMs,
    };
  }
}
