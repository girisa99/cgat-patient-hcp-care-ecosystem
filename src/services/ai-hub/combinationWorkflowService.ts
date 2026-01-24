/**
 * Combination Workflow Service
 * 
 * Manages all possible combinations across wizard steps and recommends
 * the best workflows based on user context, tier, and use case.
 * 
 * Core 13 Ecosystem Providers:
 * - OpenAI, Claude, Gemini, DeepSeek, Alibaba, Azure
 * - ModelsLab, Meshy, Replicate, ElevenLabs, DeepL
 * - Supabase (Infrastructure), Stripe (Payments)
 */

import type { AIProviderKey } from './providerRegistry';

// ============================================
// COMBINATION TYPES
// ============================================

export type WizardStep = 
  | 'input'           // Step 0: UIG (Video/Audio/URL/Screen)
  | 'language'        // Step 1: Language selection
  | 'industry'        // Step 2: Industry/Segment
  | 'framework'       // Step 3: Framework/Category
  | 'design'          // Step 4: Design/Template
  | 'visual'          // Step 5: Visual Features
  | 'voice'           // Step 6: Agent & Voice
  | 'generation'      // Step 7: Generation
  | 'publishing';     // Step 8: Publishing & Distribution

export type OutputCategory = 
  | 'static'          // PDF, PPT, Images
  | 'animated'        // Animated slides, GIFs
  | 'video'           // Full video with narration
  | 'avatar'          // AI avatar presenter
  | 'immersive'       // 3D, VR, AR experiences
  | 'interactive';    // Web apps, quizzes

export type CombinationTier = 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';

export interface CombinationElement {
  id: string;
  name: string;
  category: OutputCategory;
  providers: AIProviderKey[];
  edgeFunctions: string[];
  tier: CombinationTier;
  creditCost: number;
  description: string;
}

export interface CombinationWorkflow {
  id: string;
  name: string;
  description: string;
  elements: CombinationElement[];
  totalCreditCost: number;
  requiredTier: CombinationTier;
  estimatedTime: number; // in seconds
  recommendedFor: string[];
  edgeFunctionChain: string[];
  providers: {
    llm: AIProviderKey;
    tts?: AIProviderKey;
    translation?: AIProviderKey;
    image?: AIProviderKey;
    video?: AIProviderKey;
    '3d'?: AIProviderKey;
    avatar?: AIProviderKey;
  };
}

export interface CombinationRecommendation {
  workflow: CombinationWorkflow;
  score: number; // 0-100
  matchReasons: string[];
  missingRequirements?: string[];
  tierUpgradeNeeded?: CombinationTier;
}

// ============================================
// COMBINATION ELEMENTS REGISTRY
// ============================================

export const COMBINATION_ELEMENTS: Record<string, CombinationElement> = {
  // Static Output Elements
  static_slides: {
    id: 'static_slides',
    name: 'Static Slides',
    category: 'static',
    providers: ['gemini', 'openai', 'claude'],
    edgeFunctions: ['ai-universal-processor'],
    tier: 'free',
    creditCost: 1,
    description: 'Generate static presentation slides with AI-powered content',
  },
  pdf_export: {
    id: 'pdf_export',
    name: 'PDF Export',
    category: 'static',
    providers: ['gemini'],
    edgeFunctions: ['share-presentation'],
    tier: 'free',
    creditCost: 0,
    description: 'Export presentation to high-quality PDF',
  },
  pptx_export: {
    id: 'pptx_export',
    name: 'PowerPoint Export',
    category: 'static',
    providers: ['gemini'],
    edgeFunctions: ['share-presentation'],
    tier: 'starter',
    creditCost: 1,
    description: 'Export to editable PowerPoint format',
  },
  
  // Animated Elements
  animated_charts: {
    id: 'animated_charts',
    name: 'Animated Charts',
    category: 'animated',
    providers: ['modelslab', 'gemini'],
    edgeFunctions: ['ai-video-generator'],
    tier: 'creator',
    creditCost: 3,
    description: 'Create animated data visualizations and charts',
  },
  kinetic_typography: {
    id: 'kinetic_typography',
    name: 'Kinetic Typography',
    category: 'animated',
    providers: ['modelslab', 'replicate'],
    edgeFunctions: ['ai-video-generator'],
    tier: 'creator',
    creditCost: 4,
    description: 'Animated text and typography effects',
  },
  slide_transitions: {
    id: 'slide_transitions',
    name: 'Animated Transitions',
    category: 'animated',
    providers: ['modelslab'],
    edgeFunctions: ['ai-video-generator'],
    tier: 'creator',
    creditCost: 2,
    description: 'Smooth animated transitions between slides',
  },
  
  // Video Elements
  ai_voiceover: {
    id: 'ai_voiceover',
    name: 'AI Voiceover',
    category: 'video',
    providers: ['elevenlabs', 'openai', 'azure', 'alibaba'],
    edgeFunctions: ['elevenlabs-voice', 'openai-tts', 'azure-tts', 'alibaba-tts'],
    tier: 'creator',
    creditCost: 5,
    description: 'Professional AI-generated voiceover narration',
  },
  voice_cloning: {
    id: 'voice_cloning',
    name: 'Voice Cloning',
    category: 'video',
    providers: ['elevenlabs', 'modelslab'],
    edgeFunctions: ['voice-clone-processor'],
    tier: 'pro',
    creditCost: 10,
    description: 'Clone your voice or brand voice for narration',
  },
  multilang_dubbing: {
    id: 'multilang_dubbing',
    name: 'Multi-Language Dubbing',
    category: 'video',
    providers: ['elevenlabs', 'azure', 'alibaba', 'deepl'],
    edgeFunctions: ['multi-language-audio-orchestrator', 'translation-service'],
    tier: 'pro',
    creditCost: 15,
    description: 'Dub your video into 70+ languages',
  },
  background_music: {
    id: 'background_music',
    name: 'AI Background Music',
    category: 'video',
    providers: ['elevenlabs', 'modelslab'],
    edgeFunctions: ['elevenlabs-music', 'music-composer-agent'],
    tier: 'creator',
    creditCost: 5,
    description: 'Generate custom background music',
  },
  sound_effects: {
    id: 'sound_effects',
    name: 'Sound Effects',
    category: 'video',
    providers: ['elevenlabs', 'modelslab'],
    edgeFunctions: ['elevenlabs-sfx'],
    tier: 'creator',
    creditCost: 2,
    description: 'AI-generated sound effects and foley',
  },
  
  // Avatar Elements
  talking_head_avatar: {
    id: 'talking_head_avatar',
    name: 'Talking Head Avatar',
    category: 'avatar',
    providers: ['alibaba', 'replicate'],
    edgeFunctions: ['ai-video-generator'],
    tier: 'pro',
    creditCost: 20,
    description: 'AI avatar presenter with lip-sync',
  },
  full_body_avatar: {
    id: 'full_body_avatar',
    name: 'Full Body Avatar',
    category: 'avatar',
    providers: ['alibaba'],
    edgeFunctions: ['ai-video-generator'],
    tier: 'business',
    creditCost: 40,
    description: 'Full-body AI avatar with gestures (OmniAvatar)',
  },
  talking_photo: {
    id: 'talking_photo',
    name: 'Talking Photo',
    category: 'avatar',
    providers: ['replicate', 'alibaba'],
    edgeFunctions: ['ai-video-generator'],
    tier: 'pro',
    creditCost: 15,
    description: 'Animate any photo to speak (EMO/V-Express)',
  },
  lip_sync: {
    id: 'lip_sync',
    name: 'Lip Sync',
    category: 'avatar',
    providers: ['azure', 'alibaba', 'replicate'],
    edgeFunctions: ['ai-video-generator'],
    tier: 'pro',
    creditCost: 10,
    description: 'Perfect lip-sync with Azure Visemes',
  },
  
  // 3D & Immersive Elements
  '3d_product': {
    id: '3d_product',
    name: '3D Product Visualization',
    category: 'immersive',
    providers: ['meshy', 'modelslab', 'replicate'],
    edgeFunctions: ['modelslab-media'],
    tier: 'pro',
    creditCost: 25,
    description: 'High-fidelity 3D product models with PBR',
  },
  image_to_3d: {
    id: 'image_to_3d',
    name: 'Image to 3D',
    category: 'immersive',
    providers: ['meshy', 'replicate'],
    edgeFunctions: ['modelslab-media'],
    tier: 'pro',
    creditCost: 20,
    description: 'Convert 2D images to 3D models (TripoSR)',
  },
  vr_experience: {
    id: 'vr_experience',
    name: 'VR Experience',
    category: 'immersive',
    providers: ['meshy', 'modelslab'],
    edgeFunctions: ['modelslab-media'],
    tier: 'business',
    creditCost: 50,
    description: 'Full VR presentation with WebXR export',
  },
  ar_overlay: {
    id: 'ar_overlay',
    name: 'AR Overlay',
    category: 'immersive',
    providers: ['meshy', 'modelslab'],
    edgeFunctions: ['modelslab-media'],
    tier: 'business',
    creditCost: 30,
    description: 'AR product placement and overlays',
  },
  '360_video': {
    id: '360_video',
    name: '360° Video',
    category: 'immersive',
    providers: ['modelslab', 'alibaba'],
    edgeFunctions: ['ai-video-generator'],
    tier: 'business',
    creditCost: 35,
    description: 'Immersive 360-degree video content',
  },
  
  // Interactive Elements
  interactive_quiz: {
    id: 'interactive_quiz',
    name: 'Interactive Quiz',
    category: 'interactive',
    providers: ['gemini', 'openai'],
    edgeFunctions: ['quiz-video-generator'],
    tier: 'creator',
    creditCost: 5,
    description: 'Generate interactive quizzes from content',
  },
  branching_narrative: {
    id: 'branching_narrative',
    name: 'Branching Narrative',
    category: 'interactive',
    providers: ['gemini', 'claude'],
    edgeFunctions: ['ai-universal-processor'],
    tier: 'pro',
    creditCost: 10,
    description: 'Create choose-your-own-adventure experiences',
  },
  microlearning: {
    id: 'microlearning',
    name: 'Microlearning Modules',
    category: 'interactive',
    providers: ['gemini', 'openai'],
    edgeFunctions: ['microlearning-generator'],
    tier: 'creator',
    creditCost: 8,
    description: 'Break content into bite-sized learning modules',
  },
};

// ============================================
// PRE-DEFINED COMBINATION WORKFLOWS
// ============================================

export const PRESET_WORKFLOWS: CombinationWorkflow[] = [
  // ===== BASIC WORKFLOWS (Free - Creator) =====
  {
    id: 'basic_presentation',
    name: 'Basic Presentation',
    description: 'Simple static slides with AI-generated content',
    elements: [COMBINATION_ELEMENTS.static_slides, COMBINATION_ELEMENTS.pdf_export],
    totalCreditCost: 1,
    requiredTier: 'free',
    estimatedTime: 30,
    recommendedFor: ['Quick presentations', 'Document sharing', 'Email attachments'],
    edgeFunctionChain: ['ai-universal-processor', 'share-presentation'],
    providers: { llm: 'gemini' },
  },
  {
    id: 'professional_deck',
    name: 'Professional Deck',
    description: 'Editable PowerPoint with professional design',
    elements: [COMBINATION_ELEMENTS.static_slides, COMBINATION_ELEMENTS.pptx_export],
    totalCreditCost: 2,
    requiredTier: 'starter',
    estimatedTime: 45,
    recommendedFor: ['Business meetings', 'Investor pitches', 'Sales decks'],
    edgeFunctionChain: ['ai-universal-processor', 'share-presentation'],
    providers: { llm: 'gemini' },
  },
  
  // ===== ANIMATED WORKFLOWS (Creator) =====
  {
    id: 'animated_presentation',
    name: 'Animated Presentation',
    description: 'Slides with animated charts and transitions',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.animated_charts,
      COMBINATION_ELEMENTS.slide_transitions,
    ],
    totalCreditCost: 6,
    requiredTier: 'creator',
    estimatedTime: 90,
    recommendedFor: ['Data presentations', 'Annual reports', 'Financial reviews'],
    edgeFunctionChain: ['ai-universal-processor', 'ai-video-generator'],
    providers: { llm: 'gemini', video: 'modelslab' },
  },
  {
    id: 'motion_graphics_video',
    name: 'Motion Graphics Video',
    description: 'Full video with kinetic typography and effects',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.kinetic_typography,
      COMBINATION_ELEMENTS.slide_transitions,
      COMBINATION_ELEMENTS.background_music,
    ],
    totalCreditCost: 13,
    requiredTier: 'creator',
    estimatedTime: 180,
    recommendedFor: ['Social media', 'Marketing videos', 'Brand content'],
    edgeFunctionChain: ['ai-universal-processor', 'ai-video-generator', 'music-composer-agent'],
    providers: { llm: 'gemini', video: 'modelslab' },
  },
  
  // ===== VIDEO + NARRATION WORKFLOWS (Creator - Pro) =====
  {
    id: 'narrated_presentation',
    name: 'Narrated Presentation',
    description: 'Video with professional AI voiceover',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.ai_voiceover,
      COMBINATION_ELEMENTS.slide_transitions,
    ],
    totalCreditCost: 8,
    requiredTier: 'creator',
    estimatedTime: 120,
    recommendedFor: ['Training videos', 'Tutorials', 'Course content'],
    edgeFunctionChain: ['ai-universal-processor', 'elevenlabs-voice', 'ai-video-generator'],
    providers: { llm: 'gemini', tts: 'elevenlabs', video: 'modelslab' },
  },
  {
    id: 'global_video',
    name: 'Global Multi-Language Video',
    description: 'Video dubbed in 70+ languages with localized voices',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.ai_voiceover,
      COMBINATION_ELEMENTS.multilang_dubbing,
      COMBINATION_ELEMENTS.slide_transitions,
    ],
    totalCreditCost: 25,
    requiredTier: 'pro',
    estimatedTime: 300,
    recommendedFor: ['Global marketing', 'International training', 'Localized content'],
    edgeFunctionChain: [
      'ai-universal-processor', 
      'translation-service', 
      'multi-language-audio-orchestrator',
      'ai-video-generator'
    ],
    providers: { llm: 'gemini', tts: 'elevenlabs', translation: 'deepl', video: 'modelslab' },
  },
  
  // ===== AVATAR WORKFLOWS (Pro - Business) =====
  {
    id: 'avatar_presenter',
    name: 'AI Avatar Presenter',
    description: 'Talking head avatar presenting your content',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.talking_head_avatar,
      COMBINATION_ELEMENTS.lip_sync,
    ],
    totalCreditCost: 31,
    requiredTier: 'pro',
    estimatedTime: 240,
    recommendedFor: ['Personal branding', 'Course instructors', 'News-style videos'],
    edgeFunctionChain: ['ai-universal-processor', 'ai-video-generator'],
    providers: { llm: 'gemini', avatar: 'alibaba', tts: 'elevenlabs' },
  },
  {
    id: 'full_body_presenter',
    name: 'Full-Body AI Presenter',
    description: 'Complete AI avatar with gestures and expressions',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.full_body_avatar,
      COMBINATION_ELEMENTS.lip_sync,
      COMBINATION_ELEMENTS.background_music,
    ],
    totalCreditCost: 55,
    requiredTier: 'business',
    estimatedTime: 360,
    recommendedFor: ['Premium courses', 'Virtual events', 'Corporate training'],
    edgeFunctionChain: ['ai-universal-processor', 'ai-video-generator', 'music-composer-agent'],
    providers: { llm: 'gemini', avatar: 'alibaba', tts: 'elevenlabs' },
  },
  {
    id: 'talking_photo_story',
    name: 'Talking Photo Story',
    description: 'Animate photos to tell your story',
    elements: [
      COMBINATION_ELEMENTS.talking_photo,
      COMBINATION_ELEMENTS.ai_voiceover,
      COMBINATION_ELEMENTS.background_music,
    ],
    totalCreditCost: 25,
    requiredTier: 'pro',
    estimatedTime: 180,
    recommendedFor: ['Memorial videos', 'Historical content', 'Creative storytelling'],
    edgeFunctionChain: ['ai-universal-processor', 'ai-video-generator', 'elevenlabs-voice'],
    providers: { llm: 'gemini', avatar: 'replicate', tts: 'elevenlabs' },
  },
  
  // ===== 3D & IMMERSIVE WORKFLOWS (Pro - Enterprise) =====
  {
    id: '3d_product_showcase',
    name: '3D Product Showcase',
    description: 'Interactive 3D product visualization',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS['3d_product'],
      COMBINATION_ELEMENTS.ai_voiceover,
    ],
    totalCreditCost: 31,
    requiredTier: 'pro',
    estimatedTime: 300,
    recommendedFor: ['E-commerce', 'Product launches', 'Sales demos'],
    edgeFunctionChain: ['ai-universal-processor', 'modelslab-media', 'elevenlabs-voice'],
    providers: { llm: 'gemini', '3d': 'meshy', tts: 'elevenlabs' },
  },
  {
    id: 'vr_presentation',
    name: 'VR Immersive Presentation',
    description: 'Full VR experience with WebXR export',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.vr_experience,
      COMBINATION_ELEMENTS['3d_product'],
      COMBINATION_ELEMENTS.ai_voiceover,
    ],
    totalCreditCost: 80,
    requiredTier: 'business',
    estimatedTime: 600,
    recommendedFor: ['Virtual showrooms', 'Real estate tours', 'Training simulations'],
    edgeFunctionChain: ['ai-universal-processor', 'modelslab-media', 'ai-video-generator'],
    providers: { llm: 'gemini', '3d': 'meshy', tts: 'elevenlabs', video: 'modelslab' },
  },
  {
    id: 'ar_product_experience',
    name: 'AR Product Experience',
    description: 'Augmented reality product placement',
    elements: [
      COMBINATION_ELEMENTS.image_to_3d,
      COMBINATION_ELEMENTS.ar_overlay,
      COMBINATION_ELEMENTS.ai_voiceover,
    ],
    totalCreditCost: 55,
    requiredTier: 'business',
    estimatedTime: 420,
    recommendedFor: ['Retail', 'Furniture visualization', 'Try-before-you-buy'],
    edgeFunctionChain: ['modelslab-media', 'elevenlabs-voice'],
    providers: { llm: 'gemini', '3d': 'meshy', tts: 'elevenlabs' },
  },
  
  // ===== INTERACTIVE & LEARNING WORKFLOWS (Creator - Pro) =====
  {
    id: 'interactive_course',
    name: 'Interactive Course',
    description: 'Video course with quizzes and microlearning',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.ai_voiceover,
      COMBINATION_ELEMENTS.interactive_quiz,
      COMBINATION_ELEMENTS.microlearning,
    ],
    totalCreditCost: 19,
    requiredTier: 'creator',
    estimatedTime: 240,
    recommendedFor: ['Online courses', 'Corporate training', 'EdTech'],
    edgeFunctionChain: [
      'ai-universal-processor', 
      'elevenlabs-voice', 
      'quiz-video-generator',
      'microlearning-generator'
    ],
    providers: { llm: 'gemini', tts: 'elevenlabs' },
  },
  {
    id: 'branching_training',
    name: 'Branching Scenario Training',
    description: 'Choose-your-own-adventure style training',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.talking_head_avatar,
      COMBINATION_ELEMENTS.branching_narrative,
      COMBINATION_ELEMENTS.interactive_quiz,
    ],
    totalCreditCost: 36,
    requiredTier: 'pro',
    estimatedTime: 360,
    recommendedFor: ['Compliance training', 'Sales training', 'Soft skills'],
    edgeFunctionChain: ['ai-universal-processor', 'ai-video-generator', 'quiz-video-generator'],
    providers: { llm: 'claude', avatar: 'alibaba', tts: 'elevenlabs' },
  },
  
  // ===== ULTIMATE COMBINATIONS (Enterprise) =====
  {
    id: 'ultimate_production',
    name: 'Ultimate Production Suite',
    description: 'Full video production with all premium features',
    elements: [
      COMBINATION_ELEMENTS.static_slides,
      COMBINATION_ELEMENTS.animated_charts,
      COMBINATION_ELEMENTS.kinetic_typography,
      COMBINATION_ELEMENTS.full_body_avatar,
      COMBINATION_ELEMENTS.voice_cloning,
      COMBINATION_ELEMENTS.multilang_dubbing,
      COMBINATION_ELEMENTS.background_music,
      COMBINATION_ELEMENTS.sound_effects,
    ],
    totalCreditCost: 90,
    requiredTier: 'enterprise',
    estimatedTime: 900,
    recommendedFor: ['Enterprise videos', 'Global campaigns', 'Premium productions'],
    edgeFunctionChain: [
      'ai-universal-processor',
      'voice-clone-processor',
      'ai-video-generator',
      'multi-language-audio-orchestrator',
      'music-composer-agent'
    ],
    providers: { 
      llm: 'claude', 
      avatar: 'alibaba', 
      tts: 'elevenlabs',
      translation: 'deepl',
      video: 'modelslab'
    },
  },
  {
    id: 'metaverse_experience',
    name: 'Metaverse Experience',
    description: 'Complete immersive 3D/VR experience',
    elements: [
      COMBINATION_ELEMENTS['3d_product'],
      COMBINATION_ELEMENTS.vr_experience,
      COMBINATION_ELEMENTS.full_body_avatar,
      COMBINATION_ELEMENTS['360_video'],
      COMBINATION_ELEMENTS.ai_voiceover,
    ],
    totalCreditCost: 150,
    requiredTier: 'enterprise',
    estimatedTime: 1200,
    recommendedFor: ['Metaverse events', 'Virtual conferences', 'Immersive showrooms'],
    edgeFunctionChain: ['modelslab-media', 'ai-video-generator', 'elevenlabs-voice'],
    providers: { 
      llm: 'claude',
      '3d': 'meshy',
      avatar: 'alibaba',
      tts: 'elevenlabs',
      video: 'modelslab'
    },
  },
];

// ============================================
// COMBINATION RECOMMENDATION ENGINE
// ============================================

export interface UserContext {
  tier: CombinationTier;
  industry?: string;
  segment?: string;
  language?: string;
  region?: 'west' | 'cjk' | 'mena' | 'india_sea' | 'fallback';
  outputPreferences?: OutputCategory[];
  budgetCredits?: number;
  timeConstraint?: number; // in seconds
  selectedElements?: string[];
}

const TIER_HIERARCHY: Record<CombinationTier, number> = {
  free: 0,
  starter: 1,
  creator: 2,
  pro: 3,
  business: 4,
  enterprise: 5,
};

/**
 * Check if user tier meets requirement
 */
export function tierMeetsRequirement(userTier: CombinationTier, requiredTier: CombinationTier): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

/**
 * Get recommended workflows based on user context
 */
export function getRecommendedWorkflows(context: UserContext): CombinationRecommendation[] {
  const recommendations: CombinationRecommendation[] = [];
  
  for (const workflow of PRESET_WORKFLOWS) {
    const score = calculateWorkflowScore(workflow, context);
    const matchReasons: string[] = [];
    let tierUpgradeNeeded: CombinationTier | undefined;
    
    // Check tier compatibility
    if (!tierMeetsRequirement(context.tier, workflow.requiredTier)) {
      tierUpgradeNeeded = workflow.requiredTier;
    }
    
    // Check budget
    if (context.budgetCredits && workflow.totalCreditCost <= context.budgetCredits) {
      matchReasons.push(`Within budget (${workflow.totalCreditCost} credits)`);
    }
    
    // Check time
    if (context.timeConstraint && workflow.estimatedTime <= context.timeConstraint) {
      matchReasons.push(`Quick generation (${Math.round(workflow.estimatedTime / 60)} min)`);
    }
    
    // Industry match
    if (context.industry) {
      const industryMatches = getIndustryMatches(workflow, context.industry);
      if (industryMatches.length > 0) {
        matchReasons.push(...industryMatches);
      }
    }
    
    // Output preference match
    if (context.outputPreferences) {
      const elementCategories = workflow.elements.map(e => e.category);
      const matchingCategories = context.outputPreferences.filter(p => elementCategories.includes(p));
      if (matchingCategories.length > 0) {
        matchReasons.push(`Matches output preferences: ${matchingCategories.join(', ')}`);
      }
    }
    
    recommendations.push({
      workflow,
      score,
      matchReasons,
      tierUpgradeNeeded,
    });
  }
  
  // Sort by score (descending), then by tier accessibility
  return recommendations.sort((a, b) => {
    // Prioritize accessible tiers
    const aAccessible = !a.tierUpgradeNeeded ? 1 : 0;
    const bAccessible = !b.tierUpgradeNeeded ? 1 : 0;
    if (aAccessible !== bAccessible) return bAccessible - aAccessible;
    
    return b.score - a.score;
  });
}

/**
 * Calculate workflow score based on context
 */
function calculateWorkflowScore(workflow: CombinationWorkflow, context: UserContext): number {
  let score = 50; // Base score
  
  // Tier match bonus
  if (tierMeetsRequirement(context.tier, workflow.requiredTier)) {
    score += 20;
  }
  
  // Budget fit
  if (context.budgetCredits) {
    if (workflow.totalCreditCost <= context.budgetCredits) {
      score += 15;
      // Bonus for efficient use of budget
      const efficiency = workflow.totalCreditCost / context.budgetCredits;
      if (efficiency > 0.5 && efficiency < 0.9) {
        score += 10;
      }
    } else {
      score -= 20;
    }
  }
  
  // Time constraint
  if (context.timeConstraint) {
    if (workflow.estimatedTime <= context.timeConstraint) {
      score += 10;
    } else {
      score -= 15;
    }
  }
  
  // Output preferences match
  if (context.outputPreferences) {
    const elementCategories = workflow.elements.map(e => e.category);
    const matchCount = context.outputPreferences.filter(p => elementCategories.includes(p)).length;
    score += matchCount * 10;
  }
  
  // Region-specific bonuses
  if (context.region === 'cjk') {
    if (workflow.providers.llm === 'alibaba' || workflow.providers.tts === 'alibaba') {
      score += 15;
    }
  }
  if (context.region === 'west') {
    if (workflow.providers.llm === 'claude') {
      score += 10;
    }
  }
  
  // Industry-specific bonuses
  if (context.industry) {
    const industryBonus = getIndustryBonus(workflow, context.industry);
    score += industryBonus;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Get industry-specific match reasons
 */
function getIndustryMatches(workflow: CombinationWorkflow, industry: string): string[] {
  const matches: string[] = [];
  const lowerIndustry = industry.toLowerCase();
  
  // Healthcare
  if (['healthcare', 'pharma', 'medical', 'hospital'].some(i => lowerIndustry.includes(i))) {
    if (workflow.id.includes('training') || workflow.id.includes('course')) {
      matches.push('Ideal for medical training');
    }
    if (workflow.elements.some(e => e.id === 'interactive_quiz')) {
      matches.push('Compliance quiz support');
    }
  }
  
  // E-commerce
  if (['ecommerce', 'retail', 'fashion', 'product'].some(i => lowerIndustry.includes(i))) {
    if (workflow.elements.some(e => e.id === '3d_product' || e.id === 'ar_overlay')) {
      matches.push('Perfect for product visualization');
    }
  }
  
  // Education
  if (['education', 'edtech', 'school', 'university'].some(i => lowerIndustry.includes(i))) {
    if (workflow.elements.some(e => e.id === 'microlearning' || e.id === 'interactive_quiz')) {
      matches.push('Optimized for learning outcomes');
    }
  }
  
  // Marketing
  if (['marketing', 'advertising', 'brand', 'agency'].some(i => lowerIndustry.includes(i))) {
    if (workflow.elements.some(e => e.category === 'animated' || e.id === 'kinetic_typography')) {
      matches.push('Great for brand content');
    }
  }
  
  // Global/International
  if (['global', 'international', 'multinational'].some(i => lowerIndustry.includes(i))) {
    if (workflow.elements.some(e => e.id === 'multilang_dubbing')) {
      matches.push('Multi-language support');
    }
  }
  
  return matches;
}

/**
 * Get industry bonus score
 */
function getIndustryBonus(workflow: CombinationWorkflow, industry: string): number {
  const matches = getIndustryMatches(workflow, industry);
  return matches.length * 8;
}

/**
 * Build custom workflow from selected elements
 */
export function buildCustomWorkflow(
  elementIds: string[],
  context: UserContext
): CombinationWorkflow | null {
  const elements = elementIds
    .map(id => COMBINATION_ELEMENTS[id])
    .filter(Boolean);
  
  if (elements.length === 0) return null;
  
  // Determine required tier (highest among elements)
  const requiredTier = elements.reduce((maxTier, element) => {
    return TIER_HIERARCHY[element.tier] > TIER_HIERARCHY[maxTier] 
      ? element.tier 
      : maxTier;
  }, 'free' as CombinationTier);
  
  // Calculate total cost
  const totalCreditCost = elements.reduce((sum, e) => sum + e.creditCost, 0);
  
  // Build edge function chain (deduplicated)
  const edgeFunctionChain = [...new Set(elements.flatMap(e => e.edgeFunctions))];
  
  // Estimate time based on elements
  const estimatedTime = elements.reduce((time, element) => {
    const baseTime = element.category === 'immersive' ? 180 :
                    element.category === 'avatar' ? 120 :
                    element.category === 'video' ? 60 :
                    element.category === 'animated' ? 45 : 30;
    return time + baseTime;
  }, 0);
  
  // Determine providers
  const providers: CombinationWorkflow['providers'] = { llm: 'gemini' };
  
  // Set providers based on region and elements
  if (elements.some(e => e.category === 'avatar')) {
    providers.avatar = 'alibaba';
  }
  if (elements.some(e => e.category === 'video')) {
    providers.tts = context.region === 'cjk' ? 'alibaba' : 'elevenlabs';
    providers.video = 'modelslab';
  }
  if (elements.some(e => e.category === 'immersive')) {
    providers['3d'] = 'meshy';
  }
  if (elements.some(e => e.id === 'multilang_dubbing')) {
    providers.translation = context.region === 'cjk' ? 'alibaba' : 'deepl';
  }
  
  // Set LLM based on region
  if (context.region === 'cjk') {
    providers.llm = 'alibaba';
  } else if (context.region === 'west') {
    providers.llm = 'claude';
  }
  
  return {
    id: `custom_${Date.now()}`,
    name: 'Custom Workflow',
    description: `Custom combination with ${elements.length} elements`,
    elements,
    totalCreditCost,
    requiredTier,
    estimatedTime,
    recommendedFor: ['Custom use case'],
    edgeFunctionChain,
    providers,
  };
}

/**
 * Get elements available for user tier
 */
export function getAvailableElements(userTier: CombinationTier): CombinationElement[] {
  return Object.values(COMBINATION_ELEMENTS).filter(element => 
    tierMeetsRequirement(userTier, element.tier)
  );
}

/**
 * Get elements by category
 */
export function getElementsByCategory(category: OutputCategory): CombinationElement[] {
  return Object.values(COMBINATION_ELEMENTS).filter(element => 
    element.category === category
  );
}

/**
 * Get all element categories with counts
 */
export function getCategorySummary(): Record<OutputCategory, { count: number; elements: CombinationElement[] }> {
  const categories: OutputCategory[] = ['static', 'animated', 'video', 'avatar', 'immersive', 'interactive'];
  const summary: Record<OutputCategory, { count: number; elements: CombinationElement[] }> = {} as any;
  
  for (const category of categories) {
    const elements = getElementsByCategory(category);
    summary[category] = { count: elements.length, elements };
  }
  
  return summary;
}
