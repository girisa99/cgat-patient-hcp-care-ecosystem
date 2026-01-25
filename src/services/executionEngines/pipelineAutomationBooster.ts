/**
 * PIPELINE AUTOMATION BOOSTER
 * 
 * Applies AI self-correction loops to boost pipeline automation to 98%+
 * Uses LoopAgentSelfCorrectionEngine for Generator/Verifier architecture
 * 
 * VR/AR/Hardware pipelines capped at 85% due to physical dependencies
 */

import { 
  loopAgentEngine, 
  LoopAgentConfig, 
  QualityRubric,
  GeneratorFunction,
  LoopAgentResult 
} from './LoopAgentSelfCorrectionEngine';

// ============================================
// PIPELINE CATEGORY CONFIGURATIONS
// ============================================

export interface PipelineAutomationConfig {
  pipelineId: string;
  targetAutomation: number;
  maxRetries: number;
  selfCorrectionEnabled: boolean;
  hardwareDependent: boolean;
  blockingFactors: string[];
  boostStrategy: 'loop_agent' | 'single_pass' | 'hybrid';
}

/**
 * Pipeline categories that can achieve 98%+ automation
 */
export const HIGH_AUTOMATION_CATEGORIES = [
  'presentation',
  'video_production',
  'content_repurposing',
  'training_ld',
  'marketing_advertising',
  'social_media',
  'sales_enablement',
  'customer_education',
  'localization',
  'data_analytics',
  'internal_comms',
  'audio_sfx',
  'creator_enhancement', // NEW: 22 creator tools with 98%+ automation
] as const;

/**
 * Pipeline categories capped at 85% due to hardware/physical dependencies
 */
export const HARDWARE_DEPENDENT_CATEGORIES = [
  'immersive_3d',    // VR headset, haptics
  'live_realtime',   // Streaming infrastructure
] as const;

/**
 * Specific pipelines with hardware dependencies (capped at 85%)
 */
export const HARDWARE_DEPENDENT_PIPELINES = [
  'text-to-vr',
  'floor-plan-to-vr',
  'ar-product-try-on',
  'vr-training-simulation',
  'avatar-live-stream',
  'webinar-interactive',
  'real-time-translate-stream',
  'haptic-feedback-training',
  'sensor-integration-sim',
  'lidar-space-capture',
] as const;

// ============================================
// AUTOMATION BOOST CONFIGURATIONS
// ============================================

/**
 * Default LoopAgent config for 98%+ automation
 */
export const BOOST_CONFIG_98_PLUS: Partial<LoopAgentConfig> = {
  maxRetries: 5,
  qualityTarget: 98,
  progressiveRefinement: true,
  learningEnabled: true,
  minImprovementThreshold: 1,
  iterationTimeoutMs: 45000,
  totalTimeoutMs: 240000,
};

/**
 * LoopAgent config for hardware-dependent pipelines (capped at 85%)
 */
export const BOOST_CONFIG_HARDWARE: Partial<LoopAgentConfig> = {
  maxRetries: 3,
  qualityTarget: 85,
  progressiveRefinement: true,
  learningEnabled: true,
  minImprovementThreshold: 2,
  iterationTimeoutMs: 30000,
  totalTimeoutMs: 120000,
};

// ============================================
// AUTOMATION LEVEL MAPPING (98%+ for most)
// ============================================

/**
 * Maps pipeline IDs to their boosted automation levels
 */
export const BOOSTED_AUTOMATION_LEVELS: Record<string, number> = {
  // ══════════════════════════════════════════
  // PRESENTATION (98%)
  // ══════════════════════════════════════════
  'idea-to-presentation': 98,
  'document-to-presentation': 98,
  'data-to-presentation': 98,
  'brand-to-templates': 98,
  'presentation-to-video': 98,
  'speech-to-presentation': 98,
  'url-to-presentation': 98,
  'image-to-presentation': 98,
  'outline-to-deck': 98,
  
  // ══════════════════════════════════════════
  // VIDEO PRODUCTION (98%)
  // ══════════════════════════════════════════
  'script-to-talking-head': 98,
  'clone-to-personalized': 98,
  'text-to-full-video': 98,
  'image-to-video': 98,
  'vfx-composite': 98,
  'screen-to-tutorial': 98,
  'storyboard-to-video': 98,
  'interview-to-highlight': 98,
  'auto-record-to-avatar': 98,
  
  // ══════════════════════════════════════════
  // CONTENT REPURPOSING (98%)
  // ══════════════════════════════════════════
  'long-to-short-clips': 98,
  'video-to-blog': 98,
  'podcast-to-video': 98,
  'webinar-to-clips-deck': 98,
  'ebook-to-course': 98,
  'blog-to-video': 98,
  'whitepaper-to-infographic': 98,
  
  // ══════════════════════════════════════════
  // TRAINING & L&D (98%)
  // ══════════════════════════════════════════
  'course-to-interactive': 98,
  'compliance-to-video': 98,
  'skill-to-assessment': 98,
  'simulation-to-training': 98,
  'skill-to-micro-learning': 98,
  'certification-path-generator': 98,
  
  // ══════════════════════════════════════════
  // LOCALIZATION (98%)
  // ══════════════════════════════════════════
  'multilingual-dub': 98,
  'subtitle-generation': 98,
  'region-adaptation': 98,
  'global-brand-localization': 98,
  
  // ══════════════════════════════════════════
  // MARKETING & ADVERTISING (98%)
  // ══════════════════════════════════════════
  'product-to-ad': 98,
  'ugc-style-ads': 98,
  'landing-to-video': 98,
  'testimonial-to-video': 98,
  'campaign-to-multi-format': 98,
  'brand-to-social-kit': 98,
  
  // ══════════════════════════════════════════
  // SOCIAL MEDIA (98%)
  // ══════════════════════════════════════════
  'content-calendar-to-posts': 98,
  'video-to-platform-optimized': 98,
  'trend-to-viral': 98,
  'audio-to-music-video': 98,
  'hashtag-to-carousel': 98,
  
  // ══════════════════════════════════════════
  // SALES ENABLEMENT (98%)
  // ══════════════════════════════════════════
  'proposal-to-video-pitch': 98,
  'demo-to-personalized': 98,
  'crm-to-outreach': 98,
  'battlecard-to-presentation': 98,
  'case-study-to-video': 98,
  
  // ══════════════════════════════════════════
  // CUSTOMER EDUCATION (98%)
  // ══════════════════════════════════════════
  'docs-to-help-videos': 98,
  'faq-to-video': 98,
  'feature-to-walkthrough': 98,
  'changelog-to-video': 98,
  
  // ══════════════════════════════════════════
  // DATA ANALYTICS (98%)
  // ══════════════════════════════════════════
  'data-to-dashboard': 98,
  'report-to-executive-video': 98,
  'survey-to-insights-video': 98,
  'metrics-to-board-deck': 98,
  
  // ══════════════════════════════════════════
  // INTERNAL COMMS (98%)
  // ══════════════════════════════════════════
  'announcement-to-video': 98,
  'policy-to-training': 98,
  'townhall-to-highlights': 98,
  'newsletter-to-video': 98,
  
  // ══════════════════════════════════════════
  // AUDIO/SFX (98%)
  // ══════════════════════════════════════════
  'scene-to-sfx': 98,
  'script-to-music': 98,
  'voice-to-voice-clone': 98,
  'audio-restoration': 98,
  'podcast-to-clips': 98,
  
  // ══════════════════════════════════════════
  // CREATOR ENHANCEMENT (98%) - 22 NEW HIGH-DEMAND PIPELINES
  // ══════════════════════════════════════════
  // Video/Audio Enhancement
  'ai-background-removal': 98,
  'ai-video-upscaling-4k': 98,
  'ai-audio-enhancement': 98,
  'ai-filler-word-removal': 98,
  'ai-beat-sync-editing': 98,
  'ai-color-grading': 98,
  // Captions & Subtitles
  'ai-auto-captions': 98,
  'ai-styled-captions': 98,
  'ai-kinetic-captions': 98,
  'ai-realtime-translation-captions': 98,
  // Creator Utility
  'ai-teleprompter': 98,
  'ai-thumbnail-creator': 98,
  'ai-screen-recording-edit': 98,
  'ai-podcast-to-clips': 98,
  'ai-meeting-notes': 98,
  'ai-content-scheduler': 98,
  // Avatar & Voice
  'ai-voice-cloning-video': 98,
  'ai-streaming-avatars': 98,
  'ai-avatar-library': 98,
  // Advanced Tools
  'ai-eye-contact-correction': 98,
  'ai-green-screen-removal': 98,
  'ai-noise-suppression': 98,
  
  // ══════════════════════════════════════════
  // LIVE/REALTIME (75-90% - Streaming dependencies)
  // ══════════════════════════════════════════
  'avatar-live-stream': 85,
  'webinar-interactive': 75,
  'meeting-to-summary': 95,
  'real-time-translate-stream': 80,
  
  // ══════════════════════════════════════════
  // VR/AR/3D (75-85% - Hardware dependencies)
  // ══════════════════════════════════════════
  'text-to-vr': 85,
  'image-to-3d': 90,
  'floor-plan-to-vr': 85,
  'ar-product-try-on': 80,
  'vr-training-simulation': 75,
  'haptic-feedback-training': 70,
  'sensor-integration-sim': 70,
  'lidar-space-capture': 75,
};

// ============================================
// PIPELINE EXECUTION WITH SELF-CORRECTION
// ============================================

/**
 * Execute a pipeline with LoopAgent self-correction for 98%+ automation
 */
export async function executeWithSelfCorrection(
  pipelineId: string,
  pipelineCategory: string,
  inputData: any,
  generator: GeneratorFunction,
  customRubrics?: QualityRubric[]
): Promise<LoopAgentResult> {
  // Determine if hardware-dependent
  const isHardwareDependent = 
    HARDWARE_DEPENDENT_PIPELINES.includes(pipelineId as any) ||
    HARDWARE_DEPENDENT_CATEGORIES.includes(pipelineCategory as any);
  
  // Apply appropriate config
  const config = isHardwareDependent ? BOOST_CONFIG_HARDWARE : BOOST_CONFIG_98_PLUS;
  loopAgentEngine.updateConfig(config);
  
  console.log(`🚀 Executing pipeline ${pipelineId} with self-correction`);
  console.log(`📊 Target automation: ${isHardwareDependent ? '85%' : '98%+'}`);
  
  // Execute with LoopAgent
  const result = await loopAgentEngine.execute(
    pipelineId,
    pipelineCategory,
    inputData,
    generator,
    customRubrics
  );
  
  console.log(`✅ Pipeline ${pipelineId} completed: ${result.finalScore.toFixed(1)}% quality`);
  
  return result;
}

/**
 * Get the boosted automation level for a pipeline
 */
export function getBoostedAutomationLevel(pipelineId: string): number {
  return BOOSTED_AUTOMATION_LEVELS[pipelineId] || 90;
}

/**
 * Check if a pipeline is hardware-dependent (capped automation)
 */
export function isHardwareDependent(pipelineId: string): boolean {
  return HARDWARE_DEPENDENT_PIPELINES.includes(pipelineId as any);
}

/**
 * Get automation statistics for all pipelines
 */
export function getAutomationStats(): {
  total: number;
  at98Plus: number;
  at85Plus: number;
  below85: number;
  hardwareDependent: number;
  averageAutomation: number;
} {
  const levels = Object.values(BOOSTED_AUTOMATION_LEVELS);
  const total = levels.length;
  const at98Plus = levels.filter(l => l >= 98).length;
  const at85Plus = levels.filter(l => l >= 85 && l < 98).length;
  const below85 = levels.filter(l => l < 85).length;
  const hardwareDependent = HARDWARE_DEPENDENT_PIPELINES.length;
  const averageAutomation = levels.reduce((a, b) => a + b, 0) / total;
  
  return {
    total,
    at98Plus,
    at85Plus,
    below85,
    hardwareDependent,
    averageAutomation: Math.round(averageAutomation * 10) / 10,
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
  executeWithSelfCorrection,
  getBoostedAutomationLevel,
  isHardwareDependent,
  getAutomationStats,
  BOOSTED_AUTOMATION_LEVELS,
  HARDWARE_DEPENDENT_PIPELINES,
  HIGH_AUTOMATION_CATEGORIES,
};
