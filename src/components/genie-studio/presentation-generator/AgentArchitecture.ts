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
 * API PATTERN - MULTI-PROVIDER ROUTING
 * ============================================
 * 
 * All agents use the Universal AI Hub with intelligent multi-provider routing:
 * 
 * | Task Type     | Primary Provider  | Fallbacks                    | Selection Logic      |
 * |---------------|-------------------|------------------------------|---------------------|
 * | Text (CJK)    | Alibaba/DeepSeek  | Gemini → Claude → OpenAI     | Language-based       |
 * | Text (EU)     | Claude            | Gemini → OpenAI              | Language-based       |
 * | Text (RTL)    | Azure             | Gemini → OpenAI              | Language-based       |
 * | Text (Default)| Gemini            | OpenAI → Claude              | Speed-optimized      |
 * | Images        | Gemini/Stability  | Replicate → OpenAI           | Content-type based   |
 * | Translation   | DeepL/Alibaba     | Gemini → Google → Azure      | Language-pair based  |
 * | Voice         | ElevenLabs        | Azure → Google → OpenAI      | Language-based       |
 * 
 * Per-language model selection allows:
 *   - Specialized models for specific language families
 *   - Premium models for primary language
 *   - Cost optimization with intelligent fallbacks
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

// Architecture types for agent classification
export type AgentArchitectureType = 'single' | 'agentic' | 'a2a';

export const ARCHITECTURE_TYPE_INFO: Record<AgentArchitectureType, {
  label: string;
  description: string;
  color: string;
  icon: string;
}> = {
  single: {
    label: 'Single Agent',
    description: 'Simple task execution without complex reasoning',
    color: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    icon: 'bot',
  },
  agentic: {
    label: 'Agentic AI',
    description: 'Autonomous reasoning with tool use capabilities',
    color: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
    icon: 'brain',
  },
  a2a: {
    label: 'A2A Protocol',
    description: 'Agent-to-Agent communication and orchestration',
    color: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
    icon: 'network',
  },
};

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  defaultModel: string;
  supportsStreaming: boolean;
  architectureType: AgentArchitectureType;
  providers?: string[]; // Which AI providers this agent can use
}

export const AGENT_CATALOG: Record<AgentType, AgentConfig> = {
  [AGENT_TYPES.COORDINATOR]: {
    type: 'coordinator',
    name: 'Coordinator Agent',
    description: 'Orchestrates all other agents and manages parallel execution',
    capabilities: ['task_distribution', 'progress_tracking', 'error_recovery', 'parallel_execution'],
    defaultModel: 'gemini-2.5-flash',
    supportsStreaming: false,
    architectureType: 'a2a',
    providers: ['gemini', 'openai', 'claude', 'azure'],
  },
  [AGENT_TYPES.CONTENT_GENERATOR]: {
    type: 'slide_generator',
    name: 'Content Generator Agent',
    description: 'Generates slide text, bullets, structure, and speaker notes',
    capabilities: ['text_generation', 'slide_structure', 'speaker_notes', 'topic_segmentation'],
    defaultModel: 'gemini-2.5-flash',
    supportsStreaming: true,
    architectureType: 'agentic',
    providers: ['gemini', 'openai', 'claude', 'deepseek', 'alibaba', 'azure'],
  },
  [AGENT_TYPES.IMAGE_GENERATOR]: {
    type: 'image_generator',
    name: 'Image Generator Agent',
    description: 'Creates AI images, infographics, charts, and journey maps',
    capabilities: ['ai_images', 'infographics', 'charts', 'journey_maps', 'content_type_decision'],
    defaultModel: 'gemini-2.5-flash-image',
    supportsStreaming: false,
    architectureType: 'agentic',
    providers: ['gemini', 'openai', 'stability', 'replicate', 'alibaba'],
  },
  [AGENT_TYPES.TRANSLATOR]: {
    type: 'translator',
    name: 'Translator Agent',
    description: 'Translates content to target languages with cultural adaptation',
    capabilities: ['translation', 'cultural_adaptation', 'rtl_support', 'terminology_consistency'],
    defaultModel: 'deepl-pro',
    supportsStreaming: true,
    architectureType: 'agentic',
    providers: ['deepl', 'alibaba', 'gemini', 'azure', 'google', 'openai', 'claude'],
  },
  [AGENT_TYPES.ANALYZER]: {
    type: 'content_analyzer',
    name: 'Analyzer Agent',
    description: 'Calculates quality scores and compares against primary language',
    capabilities: ['quality_scoring', 'confidence_calculation', 'comparison_analysis', 'issue_detection'],
    defaultModel: 'gemini-2.5-flash',
    supportsStreaming: false,
    architectureType: 'single',
    providers: ['gemini', 'openai', 'claude'],
  },
  [AGENT_TYPES.ENHANCER]: {
    type: 'enhancer',
    name: 'Enhancer Agent',
    description: 'Applies AI enhancements: rewrite, expand, summarize, polish',
    capabilities: ['rewrite', 'expand', 'summarize', 'polish', 'transitions', 'brand_voice'],
    defaultModel: 'claude-sonnet-4-6',
    supportsStreaming: true,
    architectureType: 'agentic',
    providers: ['claude', 'gemini', 'openai', 'deepseek'],
  },
  [AGENT_TYPES.VOICEOVER]: {
    type: 'voiceover',
    name: 'Voiceover Agent',
    description: 'Generates AI voiceovers for presentations',
    capabilities: ['tts_generation', 'voice_selection', 'pacing_control', 'multi_language'],
    defaultModel: 'eleven-multilingual-v2',
    supportsStreaming: false,
    architectureType: 'single',
    providers: ['elevenlabs', 'azure', 'google', 'openai', 'alibaba', 'aws'],
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
