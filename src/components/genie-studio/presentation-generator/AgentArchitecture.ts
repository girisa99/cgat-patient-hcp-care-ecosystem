/**
 * Agent Architecture for Genie Deck Multi-Language Presentation Generation
 * 
 * This documents the agent system architecture used for real-time presentation generation.
 * 
 * ============================================
 * AGENT TYPES & ARCHITECTURE
 * ============================================
 * 
 * We use a **Hybrid Agentic AI Architecture** combining:
 * 
 * 1. **AGENTIC AI (Primary)**
 *    - Autonomous agents with reasoning capabilities
 *    - Each agent has specialized skills and can make decisions
 *    - Agents work independently but share context
 * 
 * 2. **A2A (Agent-to-Agent Communication)**
 *    - Agents communicate via event streams
 *    - Coordinator orchestrates agent execution
 *    - Results flow between agents in a pipeline
 * 
 * ============================================
 * AGENT CATALOG
 * ============================================
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    COORDINATOR AGENT                            │
 * │  Orchestrates all other agents, manages parallel execution      │
 * │  Handles: Task distribution, progress tracking, error recovery  │
 * └─────────────────────────────────────────────────────────────────┘
 *                              │
 *       ┌──────────────────────┼──────────────────────┐
 *       ▼                      ▼                      ▼
 * ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
 * │ CONTENT AGENT │     │  IMAGE AGENT  │     │ TRANSLATOR    │
 * │               │     │               │     │ AGENT         │
 * │ - Slide text  │     │ - AI images   │     │ - Per-language│
 * │ - Bullets     │     │ - Infographics│     │ - Cultural    │
 * │ - Structure   │     │ - Charts      │     │   adaptation  │
 * │ - Speaker     │     │ - Journey maps│     │ - RTL support │
 * │   notes       │     │               │     │               │
 * └───────────────┘     └───────────────┘     └───────────────┘
 *       │                      │                      │
 *       └──────────────────────┼──────────────────────┘
 *                              ▼
 *       ┌──────────────────────┴──────────────────────┐
 *       ▼                                             ▼
 * ┌───────────────┐                           ┌───────────────┐
 * │ ANALYZER AGENT│                           │ ENHANCER AGENT│
 * │               │                           │               │
 * │ - Quality     │                           │ - Rewrite     │
 * │   scoring     │                           │ - Expand      │
 * │ - Confidence  │                           │ - Summarize   │
 * │   calculation │                           │ - Polish      │
 * │ - Comparison  │                           │ - Brand voice │
 * │   vs primary  │                           │               │
 * └───────────────┘                           └───────────────┘
 * 
 * ============================================
 * EXECUTION FLOW
 * ============================================
 * 
 * 1. USER INPUT
 *    └─► User selects languages + model configs via popup
 * 
 * 2. COORDINATOR SPAWNS AGENTS
 *    ├─► Primary Language Agent (live preview)
 *    └─► Background Language Agents (parallel)
 * 
 * 3. CONTENT GENERATION (per language)
 *    ├─► Content Agent generates slide text
 *    ├─► Image Agent determines content type (image/infographic/etc)
 *    ├─► Image Agent generates visual
 *    └─► Real-time streaming to UI
 * 
 * 4. QUALITY ASSURANCE
 *    ├─► Analyzer Agent calculates confidence scores
 *    ├─► Compares against primary language
 *    └─► Flags low-confidence slides
 * 
 * 5. USER REVIEW
 *    ├─► Version dropdown per language (v1, v2...)
 *    ├─► Comparison mode (up to 3 languages)
 *    └─► Per-slide or whole presentation actions
 * 
 * 6. ENHANCEMENT (on demand)
 *    ├─► Enhancer Agent applies improvements
 *    ├─► Creates new version
 *    └─► Label Studio captures feedback
 * 
 * ============================================
 * LABEL STUDIO INTEGRATION
 * ============================================
 * 
 * The Label Studio background service captures:
 * 
 * - ✅ Slide accept/reject decisions
 * - ✅ Enhancement type selections
 * - ✅ Confidence score correlations
 * - ✅ User edits (inline changes)
 * - ✅ Language preference patterns
 * - ✅ Model performance by language
 * 
 * This data trains the AI to:
 * - Improve initial generation quality
 * - Better predict content types
 * - Optimize model selection per language
 * - Provide smarter inline suggestions
 * 
 * ============================================
 * DATABASE SCHEMA
 * ============================================
 * 
 * presentation_versions:
 *   - Stores all language versions
 *   - Tracks version history (v1, v2...)
 *   - Links to slides_data JSON
 *   - Confidence scores per slide
 * 
 * agent_generation_tasks:
 *   - Tracks each agent's execution
 *   - Content type decisions
 *   - Performance metrics
 *   - Error handling
 * 
 * ============================================
 * API PATTERN
 * ============================================
 * 
 * All agents use the Lovable AI Gateway:
 *   - Default: google/gemini-3-flash-preview
 *   - Premium: google/gemini-2.5-pro, openai/gpt-5
 *   - Images: google/gemini-2.5-flash-image-preview
 * 
 * Per-language model selection allows:
 *   - Faster models for bulk languages
 *   - Premium models for primary language
 *   - Cost optimization
 */

export const AGENT_TYPES = {
  COORDINATOR: 'coordinator',
  CONTENT_GENERATOR: 'slide_generator',
  IMAGE_GENERATOR: 'image_generator',
  TRANSLATOR: 'translator',
  ANALYZER: 'content_analyzer',
  ENHANCER: 'enhancer',
  VOICEOVER: 'voiceover',
} as const;

export type AgentType = typeof AGENT_TYPES[keyof typeof AGENT_TYPES];

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  defaultModel: string;
  supportsStreaming: boolean;
}

export const AGENT_CATALOG: Record<AgentType, AgentConfig> = {
  [AGENT_TYPES.COORDINATOR]: {
    type: 'coordinator',
    name: 'Coordinator Agent',
    description: 'Orchestrates all other agents and manages parallel execution',
    capabilities: ['task_distribution', 'progress_tracking', 'error_recovery', 'parallel_execution'],
    defaultModel: 'google/gemini-3-flash-preview',
    supportsStreaming: false,
  },
  [AGENT_TYPES.CONTENT_GENERATOR]: {
    type: 'slide_generator',
    name: 'Content Generator Agent',
    description: 'Generates slide text, bullets, structure, and speaker notes',
    capabilities: ['text_generation', 'slide_structure', 'speaker_notes', 'topic_segmentation'],
    defaultModel: 'google/gemini-3-flash-preview',
    supportsStreaming: true,
  },
  [AGENT_TYPES.IMAGE_GENERATOR]: {
    type: 'image_generator',
    name: 'Image Generator Agent',
    description: 'Creates AI images, infographics, charts, and journey maps',
    capabilities: ['ai_images', 'infographics', 'charts', 'journey_maps', 'content_type_decision'],
    defaultModel: 'google/gemini-2.5-flash-image-preview',
    supportsStreaming: false,
  },
  [AGENT_TYPES.TRANSLATOR]: {
    type: 'translator',
    name: 'Translator Agent',
    description: 'Translates content to target languages with cultural adaptation',
    capabilities: ['translation', 'cultural_adaptation', 'rtl_support', 'terminology_consistency'],
    defaultModel: 'google/gemini-3-flash-preview',
    supportsStreaming: true,
  },
  [AGENT_TYPES.ANALYZER]: {
    type: 'content_analyzer',
    name: 'Analyzer Agent',
    description: 'Calculates quality scores and compares against primary language',
    capabilities: ['quality_scoring', 'confidence_calculation', 'comparison_analysis', 'issue_detection'],
    defaultModel: 'google/gemini-3-flash-preview',
    supportsStreaming: false,
  },
  [AGENT_TYPES.ENHANCER]: {
    type: 'enhancer',
    name: 'Enhancer Agent',
    description: 'Applies AI enhancements: rewrite, expand, summarize, polish',
    capabilities: ['rewrite', 'expand', 'summarize', 'polish', 'transitions', 'brand_voice'],
    defaultModel: 'google/gemini-3-flash-preview',
    supportsStreaming: true,
  },
  [AGENT_TYPES.VOICEOVER]: {
    type: 'voiceover',
    name: 'Voiceover Agent',
    description: 'Generates AI voiceovers for presentations',
    capabilities: ['tts_generation', 'voice_selection', 'pacing_control', 'multi_language'],
    defaultModel: 'openai',
    supportsStreaming: false,
  },
};

// Agent communication message types
export type AgentMessageType = 
  | 'task_assigned'
  | 'progress_update'
  | 'slide_complete'
  | 'error_occurred'
  | 'request_assistance'
  | 'handoff';

export interface AgentMessage {
  id: string;
  fromAgent: AgentType;
  toAgent: AgentType | 'coordinator';
  messageType: AgentMessageType;
  payload: Record<string, any>;
  timestamp: Date;
}

// Agent execution context
export interface AgentExecutionContext {
  presentationId: string;
  versionId: string;
  languageCode: string;
  slideNumber?: number;
  userId: string;
  modelConfig: {
    textModel: string;
    imageModel: string;
    voiceModel?: string;
  };
  parentTraceId?: string;
}
