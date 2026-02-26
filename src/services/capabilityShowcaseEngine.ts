/**
 * Capability Showcase Engine
 *
 * Drives on-screen demonstrations of GenieSuite capabilities:
 * - Atlas (Backend Bear) ↔ Nova (Frontend Fox) handoff motions
 * - Ori (Creative Guide) ↔ Arc (Systems Guide) dock handoffs
 * - Scenario previews across CREATE → PRODUCE → PUBLISH flow
 * - Live capability cards showing what the system can do
 * - Sample content generation previews
 * - Character animations for each flow step
 *
 * This engine produces showcase configurations that UI components render.
 * It does NOT own the UI — it provides data + animation tokens.
 *
 * @see src/machines/guideHandoffMachine.ts — handoff motions (crossfade, tag_team, split_morph)
 * @see src/stores/guideStore.ts — Ori/Arc guide dock
 * @see src/components/genie-cast/SceneCharacterVisualizer.tsx — Atlas/Nova/Host
 * @see src/services/createFlowOrchestrator.ts — CREATE flow pipeline
 */

import type { ContentFormat, ContentIntent } from './pipelineOrchestrator';
import type { ScriptGenerationMode, OutputFormatConfig } from './createFlowOrchestrator';
import { SCRIPT_GEN_MODES, OUTPUT_FORMAT_CONFIGS } from './createFlowOrchestrator';
import type { ContentScenario } from '@/components/genie-hub/composition-studio/types';

// ─── Character References ────────────────────────────────────────────────────

export type ShowcaseCharacter = 'atlas' | 'nova' | 'ori' | 'arc' | 'host' | 'allaudin' | 'mascot';

export interface CharacterAppearance {
  character: ShowcaseCharacter;
  name: string;
  emoji: string;
  role: string;
  color: string;
  /** Which flow steps this character appears in */
  activeInSteps: FlowPhase[];
  /** What this character does at each step */
  stepActions: Record<FlowPhase, string>;
  /** Animation variant for this step */
  animationVariant: 'idle' | 'pointing' | 'celebrating' | 'thinking' | 'waving';
}

export const CHARACTER_SHOWCASE: Record<ShowcaseCharacter, CharacterAppearance> = {
  atlas: {
    character: 'atlas',
    name: 'Atlas',
    emoji: '🤖',
    role: 'Backend Engineer — builds pipelines, wires data, orchestrates AI',
    color: '#3B82F6',
    activeInSteps: ['create_input', 'create_enrichment', 'create_script', 'produce_pipeline', 'produce_quality'],
    stepActions: {
      create_input: 'Analyzing input source and selecting optimal extraction pipeline...',
      create_enrichment: 'Fetching Google Places data, brand intelligence, competitive analysis...',
      create_script: 'Generating script with STORM framework, zone-routed LLM...',
      create_language: '',
      create_format: '',
      create_style: '',
      create_review: '',
      produce_pipeline: 'Orchestrating pipeline chain: TTS → Avatar → Lip-Sync → Assembly...',
      produce_video: '',
      produce_audio: '',
      produce_quality: 'Running AI quality assessment, compliance checks, brand guidelines...',
      publish_platforms: '',
      publish_schedule: '',
      publish_analytics: '',
    },
    animationVariant: 'thinking',
  },
  nova: {
    character: 'nova',
    name: 'Nova',
    emoji: '✨',
    role: 'Frontend Creative — designs UI, picks styles, crafts visual experience',
    color: '#22C55E',
    activeInSteps: ['create_style', 'create_format', 'create_review', 'produce_video', 'publish_platforms'],
    stepActions: {
      create_input: '',
      create_enrichment: '',
      create_script: '',
      create_language: '',
      create_format: 'Recommending optimal formats based on your content and audience...',
      create_style: 'Applying visual style, selecting scene templates, setting character design...',
      create_review: 'Previewing final composition with live thumbnails and scene cards...',
      produce_pipeline: '',
      produce_video: 'Generating video scenes with cinematic transitions and B-roll...',
      produce_audio: '',
      produce_quality: '',
      publish_platforms: 'Adapting aspect ratios and formatting for each platform...',
      publish_schedule: '',
      publish_analytics: '',
    },
    animationVariant: 'pointing',
  },
  ori: {
    character: 'ori',
    name: 'Ori',
    emoji: '🎨',
    role: 'Creative Guide — helps with intent, storytelling, and category selection',
    color: '#06B6D4',
    activeInSteps: ['create_input', 'create_script', 'create_style', 'create_language'],
    stepActions: {
      create_input: 'What story do you want to tell? Let me help you choose the right starting point.',
      create_enrichment: '',
      create_script: 'Your script has great structure! Consider adding a stronger hook in the first 3 seconds.',
      create_language: 'I see your audience includes MENA regions — shall I enable Arabic transcreation?',
      create_format: '',
      create_style: 'Based on your brand, I recommend a cinematic style with warm color tones.',
      create_review: '',
      produce_pipeline: '',
      produce_video: '',
      produce_audio: '',
      produce_quality: '',
      publish_platforms: '',
      publish_schedule: '',
      publish_analytics: '',
    },
    animationVariant: 'idle',
  },
  arc: {
    character: 'arc',
    name: 'Arc',
    emoji: '⚙️',
    role: 'Systems Guide — handles workflow, consistency, and publish readiness',
    color: '#6366F1',
    activeInSteps: ['create_enrichment', 'create_format', 'create_review', 'produce_quality', 'publish_platforms', 'publish_schedule'],
    stepActions: {
      create_input: '',
      create_enrichment: 'Enrichment score: 75/100. Adding Google Places would boost it to 100.',
      create_script: '',
      create_language: '',
      create_format: 'Your selected formats are compatible. Estimated credits: 4.5.',
      create_style: '',
      create_review: 'All checks passed. 0 warnings. Ready to produce.',
      produce_pipeline: '',
      produce_video: '',
      produce_audio: '',
      produce_quality: 'Quality score: 92/100. One suggestion: increase contrast on slide 3.',
      publish_platforms: 'All platform requirements met. Aspect ratios auto-adapted.',
      publish_schedule: 'Optimal posting times: Tue 10am (LinkedIn), Thu 7pm (Instagram).',
      publish_analytics: '',
    },
    animationVariant: 'pointing',
  },
  host: {
    character: 'host',
    name: 'Host',
    emoji: '🎬',
    role: 'Product Owner — guides the overall journey',
    color: '#D97706',
    activeInSteps: ['create_input', 'create_review', 'publish_analytics'],
    stepActions: {
      create_input: 'Welcome! Let\'s create something amazing. Start with your content or business name.',
      create_enrichment: '',
      create_script: '',
      create_language: '',
      create_format: '',
      create_style: '',
      create_review: 'Everything looks great. Here\'s your production summary before we start.',
      produce_pipeline: '',
      produce_video: '',
      produce_audio: '',
      produce_quality: '',
      publish_platforms: '',
      publish_schedule: '',
      publish_analytics: 'Your content reached 12K views in the first 24 hours!',
    },
    animationVariant: 'waving',
  },
  allaudin: {
    character: 'allaudin',
    name: 'Allaudin',
    emoji: '🧞',
    role: 'Genie Narrator — magical voice for cinematic moments',
    color: '#7C3AED',
    activeInSteps: ['produce_video', 'publish_analytics'],
    stepActions: {
      create_input: '',
      create_enrichment: '',
      create_script: '',
      create_language: '',
      create_format: '',
      create_style: '',
      create_review: '',
      produce_pipeline: '',
      produce_video: 'And now, your story comes to life...',
      produce_audio: '',
      produce_quality: '',
      publish_platforms: '',
      publish_schedule: '',
      publish_analytics: 'Your content journey is complete. The world awaits.',
    },
    animationVariant: 'celebrating',
  },
  mascot: {
    character: 'mascot',
    name: 'Genie',
    emoji: '🧞',
    role: 'Contextual Helper — tips, guidance, shortcuts',
    color: '#8B5CF6',
    activeInSteps: ['create_input', 'create_enrichment', 'create_script', 'create_language', 'create_format', 'create_style', 'create_review'],
    stepActions: {
      create_input: 'Tip: Upload a PDF or paste a URL for the fastest results!',
      create_enrichment: 'Tip: Toggle enrichment fields on/off to control what AI sees.',
      create_script: 'Tip: Click any sentence to edit inline. Use ⌘Z to undo.',
      create_language: 'Tip: Add up to 5 output languages. English is always included.',
      create_format: 'Tip: Select multiple formats for cross-format conversion.',
      create_style: 'Tip: Each scene can have a different style — click a scene card to override.',
      create_review: 'Tip: Review estimated credits before producing.',
      produce_pipeline: '',
      produce_video: '',
      produce_audio: '',
      produce_quality: '',
      publish_platforms: '',
      publish_schedule: '',
      publish_analytics: '',
    },
    animationVariant: 'idle',
  },
};

// ─── Flow Phases (CREATE → PRODUCE → PUBLISH) ───────────────────────────────

export type FlowPhase =
  // CREATE phases
  | 'create_input'
  | 'create_enrichment'
  | 'create_script'
  | 'create_language'
  | 'create_format'
  | 'create_style'
  | 'create_review'
  // PRODUCE phases
  | 'produce_pipeline'
  | 'produce_video'
  | 'produce_audio'
  | 'produce_quality'
  // PUBLISH phases
  | 'publish_platforms'
  | 'publish_schedule'
  | 'publish_analytics';

export interface FlowPhaseConfig {
  phase: FlowPhase;
  tab: 'create' | 'produce' | 'publish';
  label: string;
  description: string;
  icon: string;
  /** Characters active in this phase */
  activeCharacters: ShowcaseCharacter[];
  /** Handoff that occurs when entering this phase */
  handoff?: {
    from: ShowcaseCharacter;
    to: ShowcaseCharacter;
    style: 'crossfade' | 'tag_team' | 'split_morph' | 'instant';
    message: string;
  };
  /** Capabilities demonstrated in this phase */
  capabilities: string[];
}

export const FLOW_PHASES: FlowPhaseConfig[] = [
  // ─── CREATE ─────────────────────────────────────────────────────────────
  {
    phase: 'create_input',
    tab: 'create',
    label: 'Input',
    description: 'Choose how to start — text, URL, file, business name, recording, or template',
    icon: 'Upload',
    activeCharacters: ['host', 'ori', 'atlas', 'mascot'],
    handoff: {
      from: 'host',
      to: 'ori',
      style: 'crossfade',
      message: 'Host introduces the journey, Ori helps choose the right input mode',
    },
    capabilities: [
      '16 input modes (text, URL, PDF, PPTX, audio, video, image, recording, topic, template, competitor, data, blog, email, social, Google Places)',
      'Auto-detect input language',
      'Google Places auto-enrichment for business inputs',
      'Drag-and-drop file upload',
      'Live recording with real-time transcription',
    ],
  },
  {
    phase: 'create_enrichment',
    tab: 'create',
    label: 'Enrichment',
    description: 'See exactly what data feeds your AI — toggle fields on/off',
    icon: 'Sparkles',
    activeCharacters: ['atlas', 'arc', 'mascot'],
    handoff: {
      from: 'ori',
      to: 'atlas',
      style: 'tag_team',
      message: 'Ori hands off to Atlas for data enrichment and pipeline assembly',
    },
    capabilities: [
      'Google Places live data (rating, reviews, hours, competitors)',
      'Brand intelligence (value prop, positioning, differentiators)',
      'Economy archetype matching (nano bakery → enterprise pharma)',
      'Competitive intelligence (USPs, gaps, positioning)',
      'Regional cultural context (wardrobe, companion, music, setting)',
      'Product knowledge from content pool',
      'Enrichment score (0-100) showing data quality',
      'Prompt preview: see exactly what the AI receives',
      'Toggle individual data points on/off',
    ],
  },
  {
    phase: 'create_script',
    tab: 'create',
    label: 'Script',
    description: 'Review and edit the AI-generated script — inline editing at every level',
    icon: 'FileText',
    activeCharacters: ['atlas', 'ori', 'mascot'],
    handoff: {
      from: 'atlas',
      to: 'ori',
      style: 'tag_team',
      message: 'Atlas generates the script, Ori helps refine storytelling and hooks',
    },
    capabilities: [
      'AI-generated structured script with STORM framework',
      'Inline editing: accept / reject / update / enhance / analyze / regenerate',
      'Statement-level editing (edit individual sentences)',
      'AI suggestions for structure, tone, pacing, hooks, CTAs',
      'Undo/redo per field (50 levels)',
      'Data source tracking and citation for every claim',
      'Verification status for statistics and quotes',
      'Side-by-side transcreation preview',
      'Auto-save every 2 seconds',
    ],
  },
  {
    phase: 'create_language',
    tab: 'create',
    label: 'Languages',
    description: 'Input language → up to 5 output languages with transcreation',
    icon: 'Languages',
    activeCharacters: ['ori', 'mascot'],
    capabilities: [
      'Single input language (auto-detected or selected)',
      'Up to 5 output languages simultaneously',
      'Default English always included',
      'Translation (DeepL) vs Transcreation (LLM) toggle',
      'Adaptation depth per language: light / moderate / deep',
      'Cultural adaptation preview (wardrobe, companion, music, setting)',
      'RTL support for Arabic, Hebrew, Farsi, Urdu',
      '120+ sub-regions across 7 zones',
      'Quality score per language',
      '4-zone provider routing (Western/CJK/MENA/SEA)',
    ],
  },
  {
    phase: 'create_format',
    tab: 'create',
    label: 'Format',
    description: 'Select one or more output formats with cross-format conversion',
    icon: 'Layout',
    activeCharacters: ['nova', 'arc', 'mascot'],
    handoff: {
      from: 'ori',
      to: 'nova',
      style: 'tag_team',
      message: 'Ori hands off to Nova for visual format selection and design',
    },
    capabilities: [
      '13 output formats: Short Video, Long Video, Audio Podcast, Video Podcast, Webcast, Live Stream, Presentation, Script Only, Audiogram, Social Carousel, Newsletter, Blog Post, Investor Deck',
      'Multi-format simultaneous output',
      'Cross-format conversion (slides→cinematic, video→podcast, blog→carousel, etc.)',
      'Per-format aspect ratio, duration, quality settings',
      'Credit cost estimation per format',
      'Format compatibility checking',
    ],
  },
  {
    phase: 'create_style',
    tab: 'create',
    label: 'Style',
    description: 'Visual style, scenario, and per-scene creative freedom',
    icon: 'Palette',
    activeCharacters: ['nova', 'mascot'],
    capabilities: [
      '120+ content scenarios across 15+ industries',
      '13 visual styles (cinematic, corporate, playful, documentary, etc.)',
      '150+ slide frameworks (consulting, storytelling, data, healthcare, etc.)',
      'Per-scene style overrides (each scene can be different)',
      '30+ character styles (Pixar 3D, anime, realistic, etc.)',
      'Scene template library (70+ templates)',
      'AI recommends but NEVER restricts',
    ],
  },
  {
    phase: 'create_review',
    tab: 'create',
    label: 'Review',
    description: 'Final review before production — credits, warnings, pipeline preview',
    icon: 'CheckCircle',
    activeCharacters: ['host', 'nova', 'arc', 'mascot'],
    handoff: {
      from: 'nova',
      to: 'arc',
      style: 'split_morph',
      message: 'Nova presents the design, Arc validates everything is ready to produce',
    },
    capabilities: [
      'Estimated credit cost breakdown',
      'Pipeline chain preview (which steps will run)',
      'Warning detection (missing content, tier limits, etc.)',
      'One-click "Produce" to start pipeline',
      'Session save for later',
    ],
  },

  // ─── PRODUCE ────────────────────────────────────────────────────────────
  {
    phase: 'produce_pipeline',
    tab: 'produce',
    label: 'Pipeline',
    description: 'Watch the production pipeline execute step by step',
    icon: 'Workflow',
    activeCharacters: ['atlas'],
    handoff: {
      from: 'arc',
      to: 'atlas',
      style: 'split_morph',
      message: 'Arc confirms readiness, Atlas takes over pipeline orchestration',
    },
    capabilities: [
      'Real-time pipeline progress with step-by-step visualization',
      'Checkpoint/restore on failures (never lose progress)',
      'Parallel execution where possible',
      'Credit consumption tracking in real-time',
      'Skip/re-run individual steps',
      '4-zone AI provider routing per step',
    ],
  },
  {
    phase: 'produce_video',
    tab: 'produce',
    label: 'Video',
    description: 'Video generation with avatar, lip-sync, B-roll, transitions',
    icon: 'Film',
    activeCharacters: ['nova', 'allaudin'],
    handoff: {
      from: 'atlas',
      to: 'nova',
      style: 'tag_team',
      message: 'Atlas feeds generated assets to Nova for visual composition',
    },
    capabilities: [
      'AI video generation (Veo3, Wan2.6, ModelsLab)',
      'Avatar generation with regional wardrobe',
      'Lip-sync (Alibaba Wan2.2 phoneme-level)',
      'B-roll overlay and stock footage',
      'Cinematic transitions between scenes',
      'Multi-resolution: 720p / 1080p / 4K',
      'Scene-by-scene preview during generation',
    ],
  },
  {
    phase: 'produce_audio',
    tab: 'produce',
    label: 'Audio',
    description: 'TTS, music generation, audio mixing, and enhancement',
    icon: 'Headphones',
    activeCharacters: ['atlas'],
    capabilities: [
      'Multi-provider TTS (ElevenLabs, Azure, Qwen3, Google)',
      'Voice cloning from sample audio',
      'Background music generation (ElevenLabs Music)',
      'Audio mixing with ducking and normalization',
      'Noise reduction and de-essing',
      'Multi-language dubbing with lip-sync',
      'Auto-captions in 35+ languages',
    ],
  },
  {
    phase: 'produce_quality',
    tab: 'produce',
    label: 'Quality',
    description: 'AI quality assessment, compliance, and brand guidelines check',
    icon: 'ShieldCheck',
    activeCharacters: ['atlas', 'arc'],
    capabilities: [
      'AI quality scoring (content, visual, audio, engagement)',
      'Brand guidelines compliance check',
      'Geo-compliance verification (MENA, healthcare, etc.)',
      'Readability and clarity scoring',
      'Spell check and grammar verification',
      'Fact-checking for statistics and claims',
      'Viral score prediction',
    ],
  },

  // ─── PUBLISH ────────────────────────────────────────────────────────────
  {
    phase: 'publish_platforms',
    tab: 'publish',
    label: 'Platforms',
    description: 'Publish to multiple platforms with auto-adapted formats',
    icon: 'Share2',
    activeCharacters: ['nova', 'arc'],
    handoff: {
      from: 'atlas',
      to: 'arc',
      style: 'tag_team',
      message: 'Atlas hands final assets to Arc for platform-specific formatting',
    },
    capabilities: [
      'Multi-platform publish (YouTube, TikTok, Instagram, LinkedIn, etc.)',
      'Auto-adapt aspect ratios per platform',
      'Platform-specific thumbnail generation',
      'Description and hashtag generation',
      'SEO optimization for web platforms',
      'Email embed with fallback GIF',
    ],
  },
  {
    phase: 'publish_schedule',
    tab: 'publish',
    label: 'Schedule',
    description: 'Schedule posts at optimal times per platform and region',
    icon: 'Calendar',
    activeCharacters: ['arc'],
    capabilities: [
      'AI-recommended posting times per platform',
      'Timezone-aware scheduling across regions',
      'Recurring content series scheduling',
      'A/B testing of post timing',
      'Queue management for bulk content',
    ],
  },
  {
    phase: 'publish_analytics',
    tab: 'publish',
    label: 'Analytics',
    description: 'Track performance across all platforms in one dashboard',
    icon: 'BarChart3',
    activeCharacters: ['host', 'allaudin'],
    handoff: {
      from: 'arc',
      to: 'host',
      style: 'split_morph',
      message: 'Arc reports final metrics, Host celebrates the completed journey',
    },
    capabilities: [
      'Cross-platform analytics dashboard',
      'View count, engagement rate, click-through rate',
      'Regional performance breakdown',
      'Content performance comparison',
      'ROI tracking and credit efficiency metrics',
      'AI recommendations for next content',
    ],
  },
];

// ─── Scenario Showcase Configs ───────────────────────────────────────────────

export interface ScenarioShowcase {
  scenario: ContentScenario;
  title: string;
  description: string;
  icon: string;
  industry: string;
  /** Sample flow: what happens at each phase */
  sampleFlow: Array<{
    phase: FlowPhase;
    action: string;
    character: ShowcaseCharacter;
    preview: string;
  }>;
  /** Sample output formats this scenario typically produces */
  typicalFormats: ContentFormat[];
  /** Sample enrichment data shown */
  sampleEnrichment: string[];
  /** Estimated time for the full flow */
  estimatedMinutes: number;
  /** Credit cost estimate */
  estimatedCredits: number;
}

/** Pre-built scenario showcases for on-screen demonstration */
export const SCENARIO_SHOWCASES: ScenarioShowcase[] = [
  {
    scenario: 'social_promo',
    title: 'Social Media Promo',
    description: 'Business name → 60s promo video for TikTok/Reels/Shorts',
    icon: 'Zap',
    industry: 'Any Business',
    sampleFlow: [
      { phase: 'create_input', action: 'Enter business name: "Sam\'s Chai Stall, Bangalore"', character: 'host', preview: 'Google Places auto-fetching...' },
      { phase: 'create_enrichment', action: '4.8★ rating, 523 reviews, competitors found', character: 'atlas', preview: 'Enrichment score: 95/100' },
      { phase: 'create_script', action: '"Meet Sam — 4.8 stars, 523 happy customers..."', character: 'ori', preview: '6-scene script with hook + CTA' },
      { phase: 'create_language', action: 'Output: English + Tamil + Hindi', character: 'ori', preview: 'Transcreation: wardrobe → silk lungi, music → Carnatic fusion' },
      { phase: 'create_format', action: 'Short Video (9:16) + Social Carousel', character: 'nova', preview: 'TikTok + Instagram optimized' },
      { phase: 'produce_pipeline', action: 'TTS → Avatar → Lip-Sync → Assembly', character: 'atlas', preview: '6 pipeline steps running...' },
      { phase: 'publish_platforms', action: 'Published to TikTok, Instagram, YouTube Shorts', character: 'arc', preview: '3 platforms, auto-adapted' },
    ],
    typicalFormats: ['short_video', 'social_carousel'],
    sampleEnrichment: ['Google Places: 4.8★, 523 reviews', 'Competitors: 3 nearby chai shops', 'Economy: Micro-business tier'],
    estimatedMinutes: 5,
    estimatedCredits: 3,
  },
  {
    scenario: 'patient_education',
    title: 'Patient Education Video',
    description: 'Medical topic → accessible patient education video with compliance',
    icon: 'Heart',
    industry: 'Healthcare',
    sampleFlow: [
      { phase: 'create_input', action: 'Topic: "Managing Type 2 Diabetes"', character: 'host', preview: 'Medical knowledge base activated' },
      { phase: 'create_enrichment', action: 'Clinical guidelines, patient-friendly terminology loaded', character: 'atlas', preview: 'Healthcare compliance enabled' },
      { phase: 'create_script', action: '"Understanding your blood sugar levels..."', character: 'ori', preview: '8-scene script with medical illustrations' },
      { phase: 'create_language', action: 'Output: English + Spanish + Arabic', character: 'ori', preview: 'Medical terminology localized per region' },
      { phase: 'create_format', action: 'Long Video (16:9) + Presentation slides', character: 'nova', preview: 'Patient-friendly, ADA compliant' },
      { phase: 'produce_quality', action: 'Medical compliance check passed', character: 'arc', preview: 'No unverified claims, sources cited' },
    ],
    typicalFormats: ['long_video', 'presentation'],
    sampleEnrichment: ['Clinical guidelines loaded', 'Patient reading level: Grade 6', 'Compliance: HIPAA, ADA'],
    estimatedMinutes: 12,
    estimatedCredits: 6,
  },
  {
    scenario: 'investor_pitch',
    title: 'Investor Pitch Deck',
    description: 'Business data → investor deck with live data and narrated walkthrough',
    icon: 'TrendingUp',
    industry: 'Startup / Enterprise',
    sampleFlow: [
      { phase: 'create_input', action: 'Upload pitch document + business name', character: 'host', preview: 'PDF extracted + Google Places enriching' },
      { phase: 'create_enrichment', action: 'Market data, TAM/SAM/SOM, competitor landscape', character: 'atlas', preview: 'Enrichment score: 88/100' },
      { phase: 'create_script', action: '"Our market opportunity is $2.4B..."', character: 'ori', preview: '12-slide deck with financial charts' },
      { phase: 'create_format', action: 'Investor Deck + Short Video teaser', character: 'nova', preview: 'PPTX export + 60s pitch video' },
      { phase: 'produce_video', action: 'Avatar CEO presenting with slides PiP', character: 'nova', preview: 'Professional avatar + slide transitions' },
      { phase: 'produce_quality', action: 'Financial data verified, brand consistent', character: 'arc', preview: 'All claims sourced' },
    ],
    typicalFormats: ['investor_deck', 'presentation', 'short_video'],
    sampleEnrichment: ['Google Places: verified business data', 'Economy: Growth-stage startup', 'Competitive: 5 competitors mapped'],
    estimatedMinutes: 15,
    estimatedCredits: 8,
  },
  {
    scenario: 'ppt_to_cinematic',
    title: 'PPT → Cinematic Video',
    description: 'Upload slides → 3D rendering → cinematic storytelling video',
    icon: 'Presentation',
    industry: 'Corporate / Education',
    sampleFlow: [
      { phase: 'create_input', action: 'Upload quarterly_results.pptx (24 slides)', character: 'host', preview: 'Extracting slides, speaker notes, charts...' },
      { phase: 'create_script', action: '"This quarter, we achieved 127% of target..."', character: 'atlas', preview: 'Slide-by-slide narration script' },
      { phase: 'create_style', action: 'Style: Cinematic + 3D rendering on charts', character: 'nova', preview: 'Each slide becomes a cinematic scene' },
      { phase: 'create_format', action: 'Long Video (cinematic) + Short Video (highlights)', character: 'nova', preview: '5-min full + 60s highlight reel' },
      { phase: 'produce_video', action: 'Slides → 3D → cinematic transitions → assembled', character: 'nova', preview: '24 scenes with dramatic lighting' },
    ],
    typicalFormats: ['long_video', 'short_video', 'presentation'],
    sampleEnrichment: ['24 slides extracted', 'Charts detected: 8', 'Speaker notes: 18 slides'],
    estimatedMinutes: 20,
    estimatedCredits: 10,
  },
  {
    scenario: 'destination_showcase',
    title: 'Travel Destination Video',
    description: 'Destination name → drone footage + itinerary + booking CTA video',
    icon: 'Plane',
    industry: 'Travel & Hospitality',
    sampleFlow: [
      { phase: 'create_input', action: 'Business: "Maldives Beach Resort, Male"', character: 'host', preview: 'Google Places + travel data enriching' },
      { phase: 'create_enrichment', action: '4.9★ resort, seasonal pricing, flight connections', character: 'atlas', preview: 'Enrichment: resort amenities, local attractions' },
      { phase: 'create_script', action: '"Crystal waters, overwater villas, sunset dining..."', character: 'ori', preview: '8 scenes: arrival → room → dining → activities → booking' },
      { phase: 'create_language', action: 'English + Arabic + Chinese + Japanese + Russian', character: 'ori', preview: '5 languages, deep transcreation for each' },
      { phase: 'produce_video', action: 'Drone B-roll + room walkthrough + food close-ups', character: 'nova', preview: 'Cinematic travel video with booking CTA' },
    ],
    typicalFormats: ['long_video', 'short_video', 'social_carousel'],
    sampleEnrichment: ['Resort: 4.9★, 1.2K reviews', 'Best season: Nov-Apr', '12 amenities listed'],
    estimatedMinutes: 15,
    estimatedCredits: 7,
  },
  {
    scenario: 'course_lecture',
    title: 'E-Learning Course Lecture',
    description: 'Course material → interactive lecture with avatar + slides + quizzes',
    icon: 'GraduationCap',
    industry: 'Education',
    sampleFlow: [
      { phase: 'create_input', action: 'Upload: machine_learning_chapter3.pdf', character: 'host', preview: 'Extracting course material...' },
      { phase: 'create_script', action: '"Today we\'ll learn about neural networks..."', character: 'atlas', preview: '12-scene lecture with quiz checkpoints' },
      { phase: 'create_style', action: 'Style: Educational + whiteboard + quiz cards', character: 'nova', preview: 'Avatar professor + animated diagrams' },
      { phase: 'create_format', action: 'Long Video (lecture) + Presentation (review slides)', character: 'nova', preview: '45-min lecture + study deck' },
      { phase: 'produce_video', action: 'Avatar teacher + whiteboard animations + quizzes', character: 'nova', preview: 'Interactive learning experience' },
    ],
    typicalFormats: ['long_video', 'presentation', 'blog_post'],
    sampleEnrichment: ['Course: ML Chapter 3', 'Level: Intermediate', 'Prerequisites: Linear algebra'],
    estimatedMinutes: 25,
    estimatedCredits: 12,
  },
];

// ─── Handoff Motion Sequences ────────────────────────────────────────────────

export interface HandoffSequence {
  id: string;
  name: string;
  description: string;
  /** The flow phases this handoff spans */
  fromPhase: FlowPhase;
  toPhase: FlowPhase;
  /** Characters involved */
  from: ShowcaseCharacter;
  to: ShowcaseCharacter;
  /** Motion style */
  style: 'crossfade' | 'tag_team' | 'split_morph' | 'instant';
  /** Dialogue during handoff */
  dialogue: {
    exitLine: string;   // What the exiting character says
    enterLine: string;  // What the entering character says
  };
  /** Duration in ms */
  durationMs: number;
}

export const HANDOFF_SEQUENCES: HandoffSequence[] = [
  {
    id: 'host_to_ori_start',
    name: 'Journey Begins',
    description: 'Host welcomes, Ori takes over creative guidance',
    fromPhase: 'create_input',
    toPhase: 'create_input',
    from: 'host',
    to: 'ori',
    style: 'crossfade',
    dialogue: {
      exitLine: 'Welcome to GenieSuite! Let\'s create something amazing.',
      enterLine: 'I\'m Ori, your creative guide. What story do you want to tell?',
    },
    durationMs: 800,
  },
  {
    id: 'ori_to_atlas_enrich',
    name: 'Data Enrichment',
    description: 'Ori hands to Atlas for data fetching and enrichment',
    fromPhase: 'create_input',
    toPhase: 'create_enrichment',
    from: 'ori',
    to: 'atlas',
    style: 'tag_team',
    dialogue: {
      exitLine: 'Great choice! Let me get Atlas to pull in the real data.',
      enterLine: 'I\'m fetching Google Places data, brand intelligence, and competitive insights...',
    },
    durationMs: 1200,
  },
  {
    id: 'atlas_to_ori_script',
    name: 'Script Review',
    description: 'Atlas generates script, Ori helps refine creative elements',
    fromPhase: 'create_enrichment',
    toPhase: 'create_script',
    from: 'atlas',
    to: 'ori',
    style: 'tag_team',
    dialogue: {
      exitLine: 'Script generated with all enrichment data embedded.',
      enterLine: 'Nice script! I see a few places where we can strengthen the storytelling...',
    },
    durationMs: 1200,
  },
  {
    id: 'ori_to_nova_design',
    name: 'Visual Design',
    description: 'Ori finishes language setup, Nova takes over visual design',
    fromPhase: 'create_language',
    toPhase: 'create_format',
    from: 'ori',
    to: 'nova',
    style: 'tag_team',
    dialogue: {
      exitLine: 'Languages and transcreation configured. Over to you, Nova!',
      enterLine: 'Time to make it look amazing! Let me recommend the perfect format...',
    },
    durationMs: 1200,
  },
  {
    id: 'nova_to_arc_review',
    name: 'Pre-Production Review',
    description: 'Nova finishes design, Arc validates everything',
    fromPhase: 'create_style',
    toPhase: 'create_review',
    from: 'nova',
    to: 'arc',
    style: 'split_morph',
    dialogue: {
      exitLine: 'Design is locked in. Let Arc check everything before we produce.',
      enterLine: 'Running final checks... formats compatible, credits estimated, pipeline ready.',
    },
    durationMs: 1600,
  },
  {
    id: 'arc_to_atlas_produce',
    name: 'Production Start',
    description: 'Arc approves, Atlas starts pipeline orchestration',
    fromPhase: 'create_review',
    toPhase: 'produce_pipeline',
    from: 'arc',
    to: 'atlas',
    style: 'split_morph',
    dialogue: {
      exitLine: 'All checks passed. Handing off to Atlas for production.',
      enterLine: 'Initiating pipeline chain. TTS first, then avatar generation...',
    },
    durationMs: 1600,
  },
  {
    id: 'atlas_to_nova_video',
    name: 'Visual Assembly',
    description: 'Atlas generates assets, Nova assembles video',
    fromPhase: 'produce_pipeline',
    toPhase: 'produce_video',
    from: 'atlas',
    to: 'nova',
    style: 'tag_team',
    dialogue: {
      exitLine: 'All assets generated. Nova, assemble the final video.',
      enterLine: 'Compositing scenes, adding transitions, overlaying captions...',
    },
    durationMs: 1200,
  },
  {
    id: 'nova_to_arc_publish',
    name: 'Platform Publishing',
    description: 'Nova finishes video, Arc handles platform distribution',
    fromPhase: 'produce_video',
    toPhase: 'publish_platforms',
    from: 'nova',
    to: 'arc',
    style: 'tag_team',
    dialogue: {
      exitLine: 'Video rendered. Let Arc format it for each platform.',
      enterLine: 'Adapting for TikTok (9:16), YouTube (16:9), Instagram (1:1)...',
    },
    durationMs: 1200,
  },
  {
    id: 'arc_to_host_complete',
    name: 'Journey Complete',
    description: 'Arc publishes, Host celebrates the completed journey',
    fromPhase: 'publish_platforms',
    toPhase: 'publish_analytics',
    from: 'arc',
    to: 'host',
    style: 'split_morph',
    dialogue: {
      exitLine: 'Published to all platforms. Tracking analytics...',
      enterLine: 'Congratulations! Your content is live. Let\'s see how it performs!',
    },
    durationMs: 1600,
  },
];

// ─── Capability Card Definitions ─────────────────────────────────────────────

export interface CapabilityCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  /** Which tab this capability belongs to */
  tab: 'create' | 'produce' | 'publish';
  /** Phase where this shows */
  phase: FlowPhase;
  /** Stats to display */
  stats: Array<{ label: string; value: string; highlight?: boolean }>;
  /** Quick demo action label */
  demoAction?: string;
  /** Color theme */
  color: string;
}

export const CAPABILITY_CARDS: CapabilityCard[] = [
  // CREATE capabilities
  { id: 'input_modes', title: '16 Input Modes', subtitle: 'Text, URL, PDF, PPTX, Audio, Video, Image, Recording, Topic, Template, Competitor, Data, Blog, Email, Social, Google Places', icon: 'Upload', tab: 'create', phase: 'create_input', stats: [{ label: 'Input Types', value: '16', highlight: true }, { label: 'Auto-detect', value: 'Language + Format' }, { label: 'File Limit', value: '100MB' }], demoAction: 'Try Business-to-Script', color: '#3B82F6' },
  { id: 'enrichment', title: 'Universal Enrichment', subtitle: 'Google Places + Brand Intelligence + Competitive Analysis + Regional Context', icon: 'Sparkles', tab: 'create', phase: 'create_enrichment', stats: [{ label: 'Data Sources', value: '6', highlight: true }, { label: 'Toggle Fields', value: 'Per-field on/off' }, { label: 'Prompt Preview', value: 'Live' }], demoAction: 'See Enrichment Score', color: '#F59E0B' },
  { id: 'inline_edit', title: 'Inline Editing', subtitle: 'Accept / Reject / Update / Enhance / Analyze / Regenerate per field and statement', icon: 'Edit3', tab: 'create', phase: 'create_script', stats: [{ label: 'Edit Actions', value: '10', highlight: true }, { label: 'Undo/Redo', value: '50 levels' }, { label: 'Auto-save', value: '2s debounce' }], color: '#8B5CF6' },
  { id: 'languages', title: 'Language I/O', subtitle: '1 input → 5 output languages with transcreation (cultural adaptation, not just translation)', icon: 'Languages', tab: 'create', phase: 'create_language', stats: [{ label: 'Output Languages', value: 'Max 5', highlight: true }, { label: 'Sub-regions', value: '120+' }, { label: 'Zones', value: '7' }], color: '#06B6D4' },
  { id: 'formats', title: '13 Output Formats', subtitle: 'Video, Podcast, Webcast, PPT, Live Stream, Audiogram, Carousel, Newsletter, Blog, Investor Deck', icon: 'Layout', tab: 'create', phase: 'create_format', stats: [{ label: 'Formats', value: '13', highlight: true }, { label: 'Cross-convert', value: '15+ types' }, { label: 'Multi-select', value: 'Yes' }], color: '#22C55E' },
  { id: 'scenarios', title: '120+ Scenarios', subtitle: 'Product, Marketing, Education, Healthcare, Real Estate, E-commerce, Travel, Entertainment + more', icon: 'Blocks', tab: 'create', phase: 'create_style', stats: [{ label: 'Scenarios', value: '120+', highlight: true }, { label: 'Industries', value: '15+' }, { label: 'Styles', value: '13' }], color: '#EC4899' },

  // PRODUCE capabilities
  { id: 'pipeline', title: 'Pipeline Orchestrator', subtitle: 'Auto-chains 5-15 atomic pipelines with checkpoint/restore and parallel execution', icon: 'Workflow', tab: 'produce', phase: 'produce_pipeline', stats: [{ label: 'Atomic Steps', value: '35+', highlight: true }, { label: 'Chains', value: '12 pre-built' }, { label: 'Checkpoint', value: 'Auto-restore' }], color: '#3B82F6' },
  { id: 'video_gen', title: 'Video Generation', subtitle: 'AI video (Veo3/Wan2.6), avatar, lip-sync, B-roll, transitions, 720p-4K', icon: 'Film', tab: 'produce', phase: 'produce_video', stats: [{ label: 'Providers', value: '4', highlight: true }, { label: 'Lip-Sync', value: 'Phoneme-level' }, { label: 'Resolution', value: 'Up to 4K' }], color: '#EF4444' },
  { id: 'audio_gen', title: 'Audio Production', subtitle: 'TTS, voice cloning, music generation, mixing, enhancement, dubbing', icon: 'Headphones', tab: 'produce', phase: 'produce_audio', stats: [{ label: 'TTS Voices', value: '82+ regions', highlight: true }, { label: 'Music Gen', value: 'ElevenLabs' }, { label: 'Dub Languages', value: '35+' }], color: '#F97316' },
  { id: 'quality', title: 'Quality Assurance', subtitle: 'AI quality scoring, compliance, brand guidelines, fact-checking, viral score', icon: 'ShieldCheck', tab: 'produce', phase: 'produce_quality', stats: [{ label: 'Checks', value: '7 types', highlight: true }, { label: 'Compliance', value: 'HIPAA, Geo' }, { label: 'Viral Score', value: 'Pre-publish' }], color: '#14B8A6' },

  // PUBLISH capabilities
  { id: 'platforms', title: 'Multi-Platform Publish', subtitle: 'YouTube, TikTok, Instagram, LinkedIn, Facebook, Twitter, Blog, Email + more', icon: 'Share2', tab: 'publish', phase: 'publish_platforms', stats: [{ label: 'Platforms', value: '21', highlight: true }, { label: 'Auto-adapt', value: 'Aspect ratios' }, { label: 'Thumbnails', value: 'Per-platform' }], color: '#6366F1' },
  { id: 'schedule', title: 'Smart Scheduling', subtitle: 'AI-recommended posting times, timezone-aware, recurring series, A/B testing', icon: 'Calendar', tab: 'publish', phase: 'publish_schedule', stats: [{ label: 'AI Timing', value: 'Per platform', highlight: true }, { label: 'Timezones', value: 'Global' }, { label: 'A/B Test', value: 'Built-in' }], color: '#D97706' },
  { id: 'analytics', title: 'Cross-Platform Analytics', subtitle: 'Unified dashboard: views, engagement, clicks, regional breakdown, ROI tracking', icon: 'BarChart3', tab: 'publish', phase: 'publish_analytics', stats: [{ label: 'Metrics', value: '12+', highlight: true }, { label: 'Breakdown', value: 'By region' }, { label: 'ROI', value: 'Per credit' }], color: '#059669' },
];

// ─── Query Functions ─────────────────────────────────────────────────────────

/** Get the active characters for a given flow phase */
export function getActiveCharacters(phase: FlowPhase): CharacterAppearance[] {
  return Object.values(CHARACTER_SHOWCASE).filter(c => c.activeInSteps.includes(phase));
}

/** Get the handoff that occurs when transitioning between phases */
export function getHandoffForTransition(fromPhase: FlowPhase, toPhase: FlowPhase): HandoffSequence | undefined {
  return HANDOFF_SEQUENCES.find(h => h.fromPhase === fromPhase && h.toPhase === toPhase);
}

/** Get capability cards for a specific tab */
export function getCapabilityCardsForTab(tab: 'create' | 'produce' | 'publish'): CapabilityCard[] {
  return CAPABILITY_CARDS.filter(c => c.tab === tab);
}

/** Get capability cards for a specific phase */
export function getCapabilityCardsForPhase(phase: FlowPhase): CapabilityCard[] {
  return CAPABILITY_CARDS.filter(c => c.phase === phase);
}

/** Get the character action text for a given phase */
export function getCharacterAction(character: ShowcaseCharacter, phase: FlowPhase): string {
  return CHARACTER_SHOWCASE[character]?.stepActions[phase] || '';
}

/** Get all handoffs in order for a full flow animation */
export function getFullFlowHandoffs(): HandoffSequence[] {
  return HANDOFF_SEQUENCES;
}

/** Get showcase scenarios grouped by industry */
export function getShowcasesByIndustry(): Record<string, ScenarioShowcase[]> {
  const grouped: Record<string, ScenarioShowcase[]> = {};
  SCENARIO_SHOWCASES.forEach(s => {
    if (!grouped[s.industry]) grouped[s.industry] = [];
    grouped[s.industry].push(s);
  });
  return grouped;
}

/** Get the full flow phase configs for a tab */
export function getFlowPhasesForTab(tab: 'create' | 'produce' | 'publish'): FlowPhaseConfig[] {
  return FLOW_PHASES.filter(p => p.tab === tab);
}
