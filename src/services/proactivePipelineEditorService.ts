/**
 * PROACTIVE PIPELINE EDITOR SERVICE
 * 
 * Ecosystem-wide service that:
 * - Analyzes content to suggest relevant editing pipelines
 * - Triggers appropriate editors (video, audio, image, document)
 * - Integrates with Ask Genie, Support, and Confidence Loop
 * - Works across all Genie Suite products (Spark, Mind, Vibe, Deck, Arc, Cast)
 * 
 * PRODUCT-AWARE FILTERING:
 * - Each pipeline is now mapped to its primary product owner
 * - Editor mode automatically switches based on product context
 * - Capabilities are filtered by product compatibility
 * 
 * Based on PIPELINE_EDITOR_REQUIREMENTS.md:
 * - 125 out of 181 pipelines (69%) need post-generation editing
 * - 67 CRITICAL pipelines always show editor
 * - 35 HIGH pipelines usually show editor
 * - 23 MEDIUM pipelines optional editor
 */

import type { PipelineIOCategory, PipelineIOEntry } from '@/components/ai-hub/provider-matrix/pipelineIORegistry';
import { GenieProduct } from '@/constants/genie-products';
import { 
  getPrimaryProductForCategory, 
  getEditorModeForCategory,
  PIPELINE_CATEGORY_MAPPING 
} from '@/constants/pipelineProductMapping';
import { getCapabilitiesByProduct } from '@/constants/crossFunctionalCapabilities';

// ==================== TYPES ====================

export type EditorType = 'video' | 'audio' | 'image' | 'document' | '3d' | 'none';
export type EditorPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DeviceContext = 'mobile' | 'tablet' | 'desktop';

export interface EditCapability {
  id: string;
  name: string;
  icon: string;
  category: 'trim' | 'voice' | 'music' | 'captions' | 'overlay' | 'effects' | 'export';
  description: string;
  requiresOnline: boolean;
  tier: 'Starter' | 'Pro' | 'Enterprise';
  compatibleProducts?: GenieProduct[]; // NEW: Product filtering
}

export interface ProactiveEditSuggestion {
  pipelineId: string;
  pipelineName: string;
  editorType: EditorType;
  priority: EditorPriority;
  reason: string;
  editCapabilities: EditCapability[];
  estimatedTime: string;
  creditCost: number;
  confidence: number;
  triggerAction: () => void;
  primaryProduct?: GenieProduct; // NEW: Product context
}

export interface PipelineEditorConfig {
  pipelineId: string;
  editorType: EditorType;
  priority: EditorPriority;
  capabilities: string[];
  commonIssues: string[];
  suggestedActions: string[];
  primaryProduct: GenieProduct; // NEW: Required product assignment
  sharedProducts?: GenieProduct[]; // NEW: Cross-functional sharing
  categoryId?: string; // NEW: Link to category mapping
}

// ==================== EDIT CAPABILITIES ====================

export const EDIT_CAPABILITIES: Record<string, EditCapability> = {
  trim: {
    id: 'trim',
    name: 'Trim/Cut',
    icon: '✂️',
    category: 'trim',
    description: 'Remove unwanted sections',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe', 'cast'],
  },
  addVoiceTTS: {
    id: 'addVoiceTTS',
    name: 'Add AI Voice',
    icon: '🎤',
    category: 'voice',
    description: 'Generate voiceover with TTS',
    requiresOnline: true,
    tier: 'Pro',
    compatibleProducts: ['mind', 'vibe', 'deck', 'cast'],
  },
  addVoiceRecord: {
    id: 'addVoiceRecord',
    name: 'Record Voice',
    icon: '🔴',
    category: 'voice',
    description: 'Record your own voiceover',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe'],
  },
  replaceVoice: {
    id: 'replaceVoice',
    name: 'Replace Voice',
    icon: '🔄',
    category: 'voice',
    description: 'Replace existing voiceover',
    requiresOnline: true,
    tier: 'Pro',
    compatibleProducts: ['vibe', 'cast'],
  },
  addMusic: {
    id: 'addMusic',
    name: 'Add Music',
    icon: '🎵',
    category: 'music',
    description: 'Add background music',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['mind', 'vibe', 'deck'],
  },
  audioDucking: {
    id: 'audioDucking',
    name: 'Auto-Duck',
    icon: '🔊',
    category: 'music',
    description: 'Lower music during speech',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe'],
  },
  addCaptions: {
    id: 'addCaptions',
    name: 'Add Captions',
    icon: '📝',
    category: 'captions',
    description: 'Generate auto-captions',
    requiresOnline: true,
    tier: 'Starter',
    compatibleProducts: ['vibe', 'cast'],
  },
  styleCaptions: {
    id: 'styleCaptions',
    name: 'Style Captions',
    icon: '🎨',
    category: 'captions',
    description: 'TikTok, Hormozi style captions',
    requiresOnline: false,
    tier: 'Pro',
    compatibleProducts: ['vibe', 'cast'],
  },
  textOverlay: {
    id: 'textOverlay',
    name: 'Text Overlay',
    icon: '🔤',
    category: 'overlay',
    description: 'Add text on video',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe', 'deck', 'cast'],
  },
  imageOverlay: {
    id: 'imageOverlay',
    name: 'Image Overlay',
    icon: '🖼️',
    category: 'overlay',
    description: 'Add logo, images',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe', 'deck', 'cast'],
  },
  speedControl: {
    id: 'speedControl',
    name: 'Speed Control',
    icon: '⚡',
    category: 'effects',
    description: 'Speed up or slow down',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe'],
  },
  cropResize: {
    id: 'cropResize',
    name: 'Crop/Resize',
    icon: '📐',
    category: 'effects',
    description: 'Platform formats (9:16, 16:9)',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe', 'deck', 'cast'],
  },
  transitions: {
    id: 'transitions',
    name: 'Transitions',
    icon: '🔀',
    category: 'effects',
    description: 'Add video transitions',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe', 'deck'],
  },
  lipSyncFix: {
    id: 'lipSyncFix',
    name: 'Lip Sync Fix',
    icon: '💄',
    category: 'effects',
    description: 'Adjust avatar lip sync',
    requiresOnline: true,
    tier: 'Pro',
    compatibleProducts: ['vibe', 'cast'],
  },
  mergeVideos: {
    id: 'mergeVideos',
    name: 'Merge Videos',
    icon: '🔗',
    category: 'trim',
    description: 'Combine multiple clips',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['vibe'],
  },
  batchExport: {
    id: 'batchExport',
    name: 'Batch Export',
    icon: '📤',
    category: 'export',
    description: 'Export to multiple platforms',
    requiresOnline: false,
    tier: 'Pro',
    compatibleProducts: ['cast', 'deck'],
  },
  scriptEdit: {
    id: 'scriptEdit',
    name: 'Script Editing',
    icon: '📝',
    category: 'effects',
    description: 'Edit and enhance scripts',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['spark', 'mind'],
  },
  slideDesign: {
    id: 'slideDesign',
    name: 'Slide Design',
    icon: '🎨',
    category: 'overlay',
    description: 'Adjust slide layouts and visuals',
    requiresOnline: false,
    tier: 'Starter',
    compatibleProducts: ['deck'],
  },
};

// ==================== PIPELINE EDITOR MAPPINGS (PRODUCT-AWARE) ====================

export const PIPELINE_EDITOR_CONFIGS: PipelineEditorConfig[] = [
  // ============================================
  // SPARK - Script Generation Pipelines
  // ============================================
  { pipelineId: 'doc-to-script', editorType: 'document', priority: 'MEDIUM', primaryProduct: 'spark', capabilities: ['scriptEdit'], commonIssues: ['Script structure unclear'], suggestedActions: ['Review structure', 'Enhance sections'], categoryId: 'script-generation' },
  { pipelineId: 'ppt-to-script', editorType: 'document', priority: 'MEDIUM', primaryProduct: 'spark', capabilities: ['scriptEdit'], commonIssues: ['Missing context'], suggestedActions: ['Add context', 'Expand points'], categoryId: 'script-generation' },
  { pipelineId: 'video-to-script', editorType: 'document', priority: 'MEDIUM', primaryProduct: 'spark', sharedProducts: ['vibe'], capabilities: ['scriptEdit'], commonIssues: ['Transcription errors'], suggestedActions: ['Review transcript', 'Fix errors'], categoryId: 'script-generation' },
  
  // ============================================
  // MIND - Enhancement Pipelines
  // ============================================
  { pipelineId: 'text-to-speech', editorType: 'audio', priority: 'HIGH', primaryProduct: 'mind', sharedProducts: ['vibe', 'deck'], capabilities: ['addVoiceTTS', 'speedControl'], commonIssues: ['Voice tone off', 'Pacing issues'], suggestedActions: ['Adjust speed', 'Try different voice'], categoryId: 'tts-generation' },
  { pipelineId: 'voice-clone', editorType: 'audio', priority: 'CRITICAL', primaryProduct: 'mind', sharedProducts: ['vibe'], capabilities: ['replaceVoice'], commonIssues: ['Clone not accurate'], suggestedActions: ['Provide cleaner sample', 'Adjust settings'], categoryId: 'tts-generation' },
  { pipelineId: 'text-to-music', editorType: 'audio', priority: 'MEDIUM', primaryProduct: 'mind', sharedProducts: ['vibe'], capabilities: ['addMusic', 'audioDucking'], commonIssues: ['Music doesn\'t fit mood'], suggestedActions: ['Try different genre', 'Adjust tempo'], categoryId: 'music-generation' },
  { pipelineId: 'script-translation', editorType: 'document', priority: 'HIGH', primaryProduct: 'mind', sharedProducts: ['cast'], capabilities: ['scriptEdit'], commonIssues: ['Translation context lost'], suggestedActions: ['Review context', 'Manual adjustments'], categoryId: 'translation' },
  
  // ============================================
  // VIBE - Video/Audio Production Pipelines (CRITICAL)
  // ============================================
  { pipelineId: 'text-to-video', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['deck', 'cast'], capabilities: ['trim', 'addVoiceTTS', 'addMusic', 'addCaptions'], commonIssues: ['Voice sounds robotic', 'Too long'], suggestedActions: ['Replace voice', 'Trim to 30s'], categoryId: 'video-generation' },
  { pipelineId: 'ppt-to-video', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['deck'], capabilities: ['trim', 'replaceVoice', 'addMusic', 'addCaptions'], commonIssues: ['Slide timing off', 'Voice mismatch'], suggestedActions: ['Adjust timing', 'Replace voiceover'], categoryId: 'video-generation' },
  { pipelineId: 'text-to-avatar', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['deck', 'cast'], capabilities: ['trim', 'lipSyncFix', 'addMusic'], commonIssues: ['Lip sync issues', 'Avatar expression'], suggestedActions: ['Fix lip sync', 'Adjust timing'], categoryId: 'avatar-lipsync' },
  { pipelineId: 'image-to-video', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', capabilities: ['trim', 'addVoiceTTS', 'addMusic'], commonIssues: ['No voiceover', 'Timing'], suggestedActions: ['Add AI voice', 'Add music'], categoryId: 'video-generation' },
  { pipelineId: 'script-to-video', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', capabilities: ['trim', 'replaceVoice', 'addMusic', 'addCaptions'], commonIssues: ['Voice doesn\'t match script'], suggestedActions: ['Regenerate voice', 'Fine-tune'], categoryId: 'video-generation' },
  { pipelineId: 'dub-video', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['cast'], capabilities: ['lipSyncFix', 'audioDucking'], commonIssues: ['Lip sync off by 200ms'], suggestedActions: ['Shift audio', 'Fine-tune words'], categoryId: 'dubbing' },
  
  // PODCAST/WEBCAST (Vibe)
  { pipelineId: 'audio-to-podcast', editorType: 'audio', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['cast'], capabilities: ['trim', 'addMusic', 'audioDucking'], commonIssues: ['Dead air', 'Volume inconsistent'], suggestedActions: ['Trim silence', 'Normalize audio'], categoryId: 'podcast-webcast' },
  { pipelineId: 'text-to-podcast', editorType: 'audio', priority: 'CRITICAL', primaryProduct: 'vibe', capabilities: ['trim', 'addMusic', 'speedControl'], commonIssues: ['AI artifacts', 'Pacing off'], suggestedActions: ['Remove artifacts', 'Adjust pacing'], categoryId: 'podcast-webcast' },
  { pipelineId: 'interview-to-podcast', editorType: 'audio', priority: 'HIGH', primaryProduct: 'vibe', capabilities: ['trim', 'audioDucking'], commonIssues: ['Long pauses', 'Cross-talk'], suggestedActions: ['Remove silence', 'Clean audio'], categoryId: 'podcast-webcast' },
  { pipelineId: 'podcast-to-video', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['cast'], capabilities: ['trim', 'addCaptions', 'textOverlay'], commonIssues: ['Visuals don\'t match audio'], suggestedActions: ['Add captions', 'Trim segments'], categoryId: 'podcast-webcast' },
  { pipelineId: 'podcast-to-clips', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['cast'], capabilities: ['trim', 'addCaptions'], commonIssues: ['Clip boundaries wrong'], suggestedActions: ['Fine-tune cuts', 'Add captions'], categoryId: 'podcast-webcast' },
  { pipelineId: 'webinar-to-clips', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['cast'], capabilities: ['trim', 'addCaptions', 'cropResize'], commonIssues: ['Cuts too abrupt'], suggestedActions: ['Fine-tune cuts', 'Add transitions'], categoryId: 'podcast-webcast' },
  { pipelineId: 'long-to-shorts', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['cast'], capabilities: ['trim', 'addCaptions', 'cropResize'], commonIssues: ['Missing key moments'], suggestedActions: ['Adjust cuts', 'Add hook text'], categoryId: 'video-editing' },
  
  // EDITING PIPELINES (Vibe)
  { pipelineId: 'video-trim-split', editorType: 'video', priority: 'HIGH', primaryProduct: 'vibe', capabilities: ['trim', 'mergeVideos'], commonIssues: ['Need precise cuts'], suggestedActions: ['Use timeline', 'Set in/out points'], categoryId: 'video-editing' },
  { pipelineId: 'video-stitch-merge', editorType: 'video', priority: 'HIGH', primaryProduct: 'vibe', capabilities: ['mergeVideos', 'transitions'], commonIssues: ['Transitions jarring'], suggestedActions: ['Add crossfade', 'Match audio levels'], categoryId: 'video-editing' },
  { pipelineId: 'audio-replace-track', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', capabilities: ['replaceVoice', 'audioDucking'], commonIssues: ['Audio sync lost'], suggestedActions: ['Realign tracks', 'Adjust ducking'], categoryId: 'video-editing' },
  { pipelineId: 'add-tts-voiceover', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', sharedProducts: ['mind'], capabilities: ['addVoiceTTS', 'audioDucking'], commonIssues: ['Voice doesn\'t fit'], suggestedActions: ['Try different voice', 'Adjust speed'], categoryId: 'video-editing' },
  { pipelineId: 'add-stt-captions', editorType: 'video', priority: 'HIGH', primaryProduct: 'vibe', capabilities: ['addCaptions', 'styleCaptions'], commonIssues: ['Transcription errors'], suggestedActions: ['Edit text', 'Adjust timing'], categoryId: 'video-editing' },
  
  // MOBILE PIPELINES (Vibe)
  { pipelineId: 'mobile-record-to-reel', editorType: 'video', priority: 'HIGH', primaryProduct: 'vibe', sharedProducts: ['cast'], capabilities: ['trim', 'addMusic', 'addCaptions', 'cropResize'], commonIssues: ['Need quick polish'], suggestedActions: ['Add music', 'Trim to 60s'], categoryId: 'video-editing' },
  { pipelineId: 'mobile-quick-edit', editorType: 'video', priority: 'MEDIUM', primaryProduct: 'vibe', capabilities: ['trim', 'addCaptions'], commonIssues: ['Basic editing needed'], suggestedActions: ['Quick trim', 'Add filter'], categoryId: 'video-editing' },
  { pipelineId: 'mobile-voice-memo-to-video', editorType: 'video', priority: 'CRITICAL', primaryProduct: 'vibe', capabilities: ['addVoiceTTS', 'addMusic', 'addCaptions'], commonIssues: ['Need visuals'], suggestedActions: ['Add AI visuals', 'Add captions'], categoryId: 'video-editing' },
  
  // ============================================
  // DECK - Presentation Pipelines
  // ============================================
  { pipelineId: 'text-to-slides', editorType: 'document', priority: 'HIGH', primaryProduct: 'deck', capabilities: ['slideDesign', 'textOverlay', 'imageOverlay'], commonIssues: ['Layout doesn\'t fit content'], suggestedActions: ['Adjust layout', 'Resize elements'], categoryId: 'presentation' },
  { pipelineId: 'doc-to-ppt', editorType: 'document', priority: 'HIGH', primaryProduct: 'deck', capabilities: ['slideDesign'], commonIssues: ['Too much text per slide'], suggestedActions: ['Split slides', 'Summarize content'], categoryId: 'presentation' },
  { pipelineId: 'text-to-3d', editorType: '3d', priority: 'HIGH', primaryProduct: 'deck', sharedProducts: ['vibe'], capabilities: ['slideDesign'], commonIssues: ['3D model quality'], suggestedActions: ['Adjust mesh', 'Change angle'], categoryId: '3d-immersive' },
  { pipelineId: 'image-to-3d', editorType: '3d', priority: 'HIGH', primaryProduct: 'deck', sharedProducts: ['vibe'], capabilities: [], commonIssues: ['Mesh artifacts'], suggestedActions: ['Provide cleaner image', 'Adjust depth'], categoryId: '3d-immersive' },
  
  // ============================================
  // CAST - Distribution Pipelines
  // ============================================
  { pipelineId: 'youtube-publish', editorType: 'video', priority: 'MEDIUM', primaryProduct: 'cast', capabilities: ['cropResize', 'batchExport'], commonIssues: ['Thumbnail not generated'], suggestedActions: ['Generate thumbnail', 'Add end screen'], categoryId: 'distribution' },
  { pipelineId: 'linkedin-publish', editorType: 'video', priority: 'MEDIUM', primaryProduct: 'cast', capabilities: ['cropResize', 'batchExport', 'addCaptions'], commonIssues: ['Video too long for feed'], suggestedActions: ['Create shorter version', 'Add captions'], categoryId: 'distribution' },
  { pipelineId: 'tiktok-publish', editorType: 'video', priority: 'MEDIUM', primaryProduct: 'cast', capabilities: ['cropResize', 'styleCaptions'], commonIssues: ['Wrong aspect ratio'], suggestedActions: ['Convert to 9:16', 'Add trending captions'], categoryId: 'distribution' },
  { pipelineId: 'multi-platform-publish', editorType: 'video', priority: 'HIGH', primaryProduct: 'cast', capabilities: ['cropResize', 'batchExport'], commonIssues: ['Platform requirements differ'], suggestedActions: ['Generate variants', 'Review each platform'], categoryId: 'distribution' },
  
  // ============================================
  // ARC - Scheduling/Workflow (No direct editing)
  // ============================================
  { pipelineId: 'project-schedule', editorType: 'none', priority: 'LOW', primaryProduct: 'arc', capabilities: [], commonIssues: ['Schedule conflicts'], suggestedActions: ['Review calendar', 'Adjust timeline'], categoryId: 'scheduling' },
];

// ==================== PROACTIVE SUGGESTION ENGINE ====================

class ProactivePipelineEditorService {
  /**
   * Get editor type based on pipeline output
   */
  getEditorType(pipelineId: string): EditorType {
    const config = PIPELINE_EDITOR_CONFIGS.find(c => c.pipelineId === pipelineId);
    if (config) return config.editorType;
    
    // Fallback detection
    if (pipelineId.includes('video') || pipelineId.includes('avatar') || pipelineId.includes('animation')) return 'video';
    if (pipelineId.includes('audio') || pipelineId.includes('podcast') || pipelineId.includes('voice')) return 'audio';
    if (pipelineId.includes('image') || pipelineId.includes('photo')) return 'image';
    if (pipelineId.includes('3d') || pipelineId.includes('vr') || pipelineId.includes('ar')) return '3d';
    if (pipelineId.includes('ppt') || pipelineId.includes('doc') || pipelineId.includes('pdf') || pipelineId.includes('slide')) return 'document';
    return 'none';
  }

  /**
   * Get primary product for a pipeline
   */
  getPrimaryProduct(pipelineId: string): GenieProduct | null {
    const config = PIPELINE_EDITOR_CONFIGS.find(c => c.pipelineId === pipelineId);
    return config?.primaryProduct || null;
  }

  /**
   * Get pipelines filtered by product
   */
  getPipelinesByProduct(product: GenieProduct): PipelineEditorConfig[] {
    return PIPELINE_EDITOR_CONFIGS.filter(
      c => c.primaryProduct === product || c.sharedProducts?.includes(product)
    );
  }

  /**
   * Get capabilities filtered by product
   */
  getCapabilitiesByProduct(product: GenieProduct): EditCapability[] {
    return Object.values(EDIT_CAPABILITIES).filter(
      cap => !cap.compatibleProducts || cap.compatibleProducts.includes(product)
    );
  }

  /**
   * Get proactive edit suggestions based on content analysis
   */
  getProactiveSuggestions(
    pipelineId: string,
    outputContent: any,
    deviceContext: DeviceContext = 'desktop',
    productContext?: GenieProduct
  ): ProactiveEditSuggestion[] {
    const suggestions: ProactiveEditSuggestion[] = [];
    const config = PIPELINE_EDITOR_CONFIGS.find(c => c.pipelineId === pipelineId);
    
    if (!config) return suggestions;

    // Get capabilities, filtering by product context if provided
    let capabilities = config.capabilities.map(c => EDIT_CAPABILITIES[c]).filter(Boolean);
    
    // Filter by product context
    if (productContext) {
      capabilities = capabilities.filter(
        cap => !cap.compatibleProducts || cap.compatibleProducts.includes(productContext)
      );
    }
    
    // Filter for mobile if needed
    const filteredCapabilities = deviceContext === 'mobile' 
      ? capabilities.filter(c => !c.requiresOnline || c.tier === 'Starter')
      : capabilities;

    // Build primary suggestion
    suggestions.push({
      pipelineId,
      pipelineName: this.getPipelineName(pipelineId),
      editorType: config.editorType,
      priority: config.priority,
      reason: `Recommended for ${config.editorType} content: ${config.suggestedActions[0]}`,
      editCapabilities: filteredCapabilities,
      estimatedTime: this.estimateEditTime(config.capabilities.length),
      creditCost: this.estimateCreditCost(config.capabilities),
      confidence: config.priority === 'CRITICAL' ? 95 : config.priority === 'HIGH' ? 85 : 70,
      triggerAction: () => this.openEditor(pipelineId, config.editorType),
      primaryProduct: config.primaryProduct,
    });

    // Add related suggestions (same product)
    const relatedPipelines = this.getRelatedPipelines(pipelineId, config.primaryProduct);
    relatedPipelines.forEach(related => {
      suggestions.push({
        pipelineId: related.pipelineId,
        pipelineName: this.getPipelineName(related.pipelineId),
        editorType: related.editorType,
        priority: related.priority,
        reason: `Also try: ${related.suggestedActions[0]}`,
        editCapabilities: related.capabilities.map(c => EDIT_CAPABILITIES[c]).filter(Boolean),
        estimatedTime: this.estimateEditTime(related.capabilities.length),
        creditCost: this.estimateCreditCost(related.capabilities),
        confidence: 70,
        triggerAction: () => this.openEditor(related.pipelineId, related.editorType),
        primaryProduct: related.primaryProduct,
      });
    });

    return suggestions;
  }

  /**
   * Analyze content and suggest beneficial editing pipelines
   */
  suggestEditingPipelines(
    contentType: 'video' | 'audio' | 'image' | 'document' | '3d',
    userIntent?: string,
    productContext?: GenieProduct
  ): string[] {
    let suggestions: string[] = [];

    if (contentType === 'video') {
      suggestions.push('video-trim-split', 'add-tts-voiceover', 'add-stt-captions', 'video-stitch-merge');
      if (userIntent?.includes('social')) {
        suggestions.push('mobile-record-to-reel', 'long-to-shorts');
      }
      if (userIntent?.includes('dub') || userIntent?.includes('translate')) {
        suggestions.push('dub-video', 'audio-replace-track');
      }
    }

    if (contentType === 'audio') {
      suggestions.push('audio-to-podcast', 'podcast-to-clips', 'podcast-to-video');
    }

    if (contentType === 'document') {
      suggestions.push('text-to-slides', 'doc-to-ppt');
    }

    // Filter by product context if provided
    if (productContext) {
      const productPipelines = this.getPipelinesByProduct(productContext);
      const productPipelineIds = productPipelines.map(p => p.pipelineId);
      suggestions = suggestions.filter(s => productPipelineIds.includes(s));
    }

    return suggestions;
  }

  /**
   * Get related pipelines for cross-suggestions (filtered by product)
   */
  private getRelatedPipelines(pipelineId: string, product?: GenieProduct): PipelineEditorConfig[] {
    const config = PIPELINE_EDITOR_CONFIGS.find(c => c.pipelineId === pipelineId);
    if (!config) return [];

    return PIPELINE_EDITOR_CONFIGS
      .filter(c => {
        if (c.pipelineId === pipelineId) return false;
        if (c.editorType !== config.editorType) return false;
        // Prioritize same product
        if (product && c.primaryProduct !== product && !c.sharedProducts?.includes(product)) {
          return false;
        }
        return true;
      })
      .slice(0, 3);
  }

  private getPipelineName(pipelineId: string): string {
    return pipelineId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private estimateEditTime(capabilityCount: number): string {
    if (capabilityCount <= 2) return '1-2 min';
    if (capabilityCount <= 4) return '3-5 min';
    return '5-10 min';
  }

  private estimateCreditCost(capabilities: string[]): number {
    let cost = 0;
    capabilities.forEach(cap => {
      const capability = EDIT_CAPABILITIES[cap];
      if (capability?.requiresOnline) cost += 5;
      else cost += 1;
    });
    return cost;
  }

  private openEditor(pipelineId: string, editorType: EditorType): void {
    console.log(`[ProactiveEditor] Opening ${editorType} editor for ${pipelineId}`);
    // This would trigger the actual editor opening via router or state
  }

  /**
   * Check if pipeline output should auto-show editor
   */
  shouldAutoShowEditor(pipelineId: string): boolean {
    const config = PIPELINE_EDITOR_CONFIGS.find(c => c.pipelineId === pipelineId);
    return config?.priority === 'CRITICAL';
  }

  /**
   * Get all editing-related pipelines for Ask Genie
   */
  getAllEditingPipelines(): PipelineEditorConfig[] {
    return PIPELINE_EDITOR_CONFIGS;
  }

  /**
   * Get pipelines by category
   */
  getPipelinesByCategory(categoryId: string): PipelineEditorConfig[] {
    return PIPELINE_EDITOR_CONFIGS.filter(c => c.categoryId === categoryId);
  }

  /**
   * For Ask Genie: Get troubleshooting for common issues
   */
  getTroubleshooting(pipelineId: string, issue: string): string[] {
    const config = PIPELINE_EDITOR_CONFIGS.find(c => c.pipelineId === pipelineId);
    if (!config) return ['Contact support for assistance'];

    const matchingIssue = config.commonIssues.find(i => 
      i.toLowerCase().includes(issue.toLowerCase())
    );

    if (matchingIssue) {
      return config.suggestedActions;
    }

    return config.suggestedActions;
  }

  /**
   * Get editor mode for product context
   */
  getEditorModeForProduct(product: GenieProduct): 'canvas' | 'timeline' | 'document' | 'hybrid' {
    switch (product) {
      case 'vibe':
        return 'timeline';
      case 'deck':
        return 'canvas';
      case 'spark':
      case 'mind':
        return 'document';
      case 'cast':
        return 'canvas'; // Distribution uses canvas for scheduling view
      case 'arc':
        return 'canvas'; // Kanban/scheduling
      default:
        return 'hybrid';
    }
  }
}

export const proactivePipelineEditorService = new ProactivePipelineEditorService();
export default proactivePipelineEditorService;
