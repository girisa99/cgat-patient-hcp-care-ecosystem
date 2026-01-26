/**
 * PROACTIVE PIPELINE EDITOR SERVICE
 * 
 * Ecosystem-wide service that:
 * - Analyzes content to suggest relevant editing pipelines
 * - Triggers appropriate editors (video, audio, image, document)
 * - Integrates with Ask Genie, Support, and Confidence Loop
 * - Works across all Genie Studio products (Deck, Vibe, Spark, Mind, Arc, Hub)
 * 
 * Based on PIPELINE_EDITOR_REQUIREMENTS.md:
 * - 125 out of 180 pipelines (69%) need post-generation editing
 * - 67 CRITICAL pipelines always show editor
 * - 35 HIGH pipelines usually show editor
 * - 23 MEDIUM pipelines optional editor
 */

import type { PipelineIOCategory, PipelineIOEntry } from '@/components/ai-hub/provider-matrix/pipelineIORegistry';

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
}

export interface PipelineEditorConfig {
  pipelineId: string;
  editorType: EditorType;
  priority: EditorPriority;
  capabilities: string[];
  commonIssues: string[];
  suggestedActions: string[];
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
    tier: 'Starter'
  },
  addVoiceTTS: {
    id: 'addVoiceTTS',
    name: 'Add AI Voice',
    icon: '🎤',
    category: 'voice',
    description: 'Generate voiceover with TTS',
    requiresOnline: true,
    tier: 'Pro'
  },
  addVoiceRecord: {
    id: 'addVoiceRecord',
    name: 'Record Voice',
    icon: '🔴',
    category: 'voice',
    description: 'Record your own voiceover',
    requiresOnline: false,
    tier: 'Starter'
  },
  replaceVoice: {
    id: 'replaceVoice',
    name: 'Replace Voice',
    icon: '🔄',
    category: 'voice',
    description: 'Replace existing voiceover',
    requiresOnline: true,
    tier: 'Pro'
  },
  addMusic: {
    id: 'addMusic',
    name: 'Add Music',
    icon: '🎵',
    category: 'music',
    description: 'Add background music',
    requiresOnline: false,
    tier: 'Starter'
  },
  audioDucking: {
    id: 'audioDucking',
    name: 'Auto-Duck',
    icon: '🔊',
    category: 'music',
    description: 'Lower music during speech',
    requiresOnline: false,
    tier: 'Starter'
  },
  addCaptions: {
    id: 'addCaptions',
    name: 'Add Captions',
    icon: '📝',
    category: 'captions',
    description: 'Generate auto-captions',
    requiresOnline: true,
    tier: 'Starter'
  },
  styleCaptions: {
    id: 'styleCaptions',
    name: 'Style Captions',
    icon: '🎨',
    category: 'captions',
    description: 'TikTok, Hormozi style captions',
    requiresOnline: false,
    tier: 'Pro'
  },
  textOverlay: {
    id: 'textOverlay',
    name: 'Text Overlay',
    icon: '🔤',
    category: 'overlay',
    description: 'Add text on video',
    requiresOnline: false,
    tier: 'Starter'
  },
  imageOverlay: {
    id: 'imageOverlay',
    name: 'Image Overlay',
    icon: '🖼️',
    category: 'overlay',
    description: 'Add logo, images',
    requiresOnline: false,
    tier: 'Starter'
  },
  speedControl: {
    id: 'speedControl',
    name: 'Speed Control',
    icon: '⚡',
    category: 'effects',
    description: 'Speed up or slow down',
    requiresOnline: false,
    tier: 'Starter'
  },
  cropResize: {
    id: 'cropResize',
    name: 'Crop/Resize',
    icon: '📐',
    category: 'effects',
    description: 'Platform formats (9:16, 16:9)',
    requiresOnline: false,
    tier: 'Starter'
  },
  transitions: {
    id: 'transitions',
    name: 'Transitions',
    icon: '🔀',
    category: 'effects',
    description: 'Add video transitions',
    requiresOnline: false,
    tier: 'Starter'
  },
  lipSyncFix: {
    id: 'lipSyncFix',
    name: 'Lip Sync Fix',
    icon: '💄',
    category: 'effects',
    description: 'Adjust avatar lip sync',
    requiresOnline: true,
    tier: 'Pro'
  },
  mergeVideos: {
    id: 'mergeVideos',
    name: 'Merge Videos',
    icon: '🔗',
    category: 'trim',
    description: 'Combine multiple clips',
    requiresOnline: false,
    tier: 'Starter'
  },
  batchExport: {
    id: 'batchExport',
    name: 'Batch Export',
    icon: '📤',
    category: 'export',
    description: 'Export to multiple platforms',
    requiresOnline: false,
    tier: 'Pro'
  }
};

// ==================== PIPELINE EDITOR MAPPINGS ====================

export const PIPELINE_EDITOR_CONFIGS: PipelineEditorConfig[] = [
  // CRITICAL VIDEO PIPELINES (Always show editor)
  { pipelineId: 'text-to-video', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'addVoiceTTS', 'addMusic', 'addCaptions'], commonIssues: ['Voice sounds robotic', 'Too long'], suggestedActions: ['Replace voice', 'Trim to 30s'] },
  { pipelineId: 'ppt-to-video', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'replaceVoice', 'addMusic', 'addCaptions'], commonIssues: ['Slide timing off', 'Voice mismatch'], suggestedActions: ['Adjust timing', 'Replace voiceover'] },
  { pipelineId: 'text-to-avatar', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'lipSyncFix', 'addMusic'], commonIssues: ['Lip sync issues', 'Avatar expression'], suggestedActions: ['Fix lip sync', 'Adjust timing'] },
  { pipelineId: 'image-to-video', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'addVoiceTTS', 'addMusic'], commonIssues: ['No voiceover', 'Timing'], suggestedActions: ['Add AI voice', 'Add music'] },
  { pipelineId: 'script-to-video', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'replaceVoice', 'addMusic', 'addCaptions'], commonIssues: ['Voice doesn\'t match script'], suggestedActions: ['Regenerate voice', 'Fine-tune'] },
  { pipelineId: 'podcast-to-video', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'addCaptions', 'textOverlay'], commonIssues: ['Visuals don\'t match audio'], suggestedActions: ['Add captions', 'Trim segments'] },
  { pipelineId: 'webinar-to-clips', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'addCaptions', 'cropResize'], commonIssues: ['Cuts too abrupt'], suggestedActions: ['Fine-tune cuts', 'Add transitions'] },
  { pipelineId: 'long-to-shorts', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'addCaptions', 'cropResize'], commonIssues: ['Missing key moments'], suggestedActions: ['Adjust cuts', 'Add hook text'] },
  { pipelineId: 'dub-video', editorType: 'video', priority: 'CRITICAL', capabilities: ['lipSyncFix', 'audioDucking'], commonIssues: ['Lip sync off by 200ms'], suggestedActions: ['Shift audio', 'Fine-tune words'] },
  
  // PODCAST/WEBCAST PIPELINES (NEW)
  { pipelineId: 'audio-to-podcast', editorType: 'audio', priority: 'CRITICAL', capabilities: ['trim', 'addMusic', 'audioDucking'], commonIssues: ['Dead air', 'Volume inconsistent'], suggestedActions: ['Trim silence', 'Normalize audio'] },
  { pipelineId: 'text-to-podcast', editorType: 'audio', priority: 'CRITICAL', capabilities: ['trim', 'addMusic', 'speedControl'], commonIssues: ['AI artifacts', 'Pacing off'], suggestedActions: ['Remove artifacts', 'Adjust pacing'] },
  { pipelineId: 'interview-to-podcast', editorType: 'audio', priority: 'HIGH', capabilities: ['trim', 'audioDucking'], commonIssues: ['Long pauses', 'Cross-talk'], suggestedActions: ['Remove silence', 'Clean audio'] },
  { pipelineId: 'podcast-to-clips', editorType: 'video', priority: 'CRITICAL', capabilities: ['trim', 'addCaptions'], commonIssues: ['Clip boundaries wrong'], suggestedActions: ['Fine-tune cuts', 'Add captions'] },
  
  // EDITING PIPELINES (NEW)
  { pipelineId: 'video-trim-split', editorType: 'video', priority: 'HIGH', capabilities: ['trim', 'mergeVideos'], commonIssues: ['Need precise cuts'], suggestedActions: ['Use timeline', 'Set in/out points'] },
  { pipelineId: 'video-stitch-merge', editorType: 'video', priority: 'HIGH', capabilities: ['mergeVideos', 'transitions'], commonIssues: ['Transitions jarring'], suggestedActions: ['Add crossfade', 'Match audio levels'] },
  { pipelineId: 'audio-replace-track', editorType: 'video', priority: 'CRITICAL', capabilities: ['replaceVoice', 'audioDucking'], commonIssues: ['Audio sync lost'], suggestedActions: ['Realign tracks', 'Adjust ducking'] },
  { pipelineId: 'add-tts-voiceover', editorType: 'video', priority: 'CRITICAL', capabilities: ['addVoiceTTS', 'audioDucking'], commonIssues: ['Voice doesn\'t fit'], suggestedActions: ['Try different voice', 'Adjust speed'] },
  { pipelineId: 'add-stt-captions', editorType: 'video', priority: 'HIGH', capabilities: ['addCaptions', 'styleCaptions'], commonIssues: ['Transcription errors'], suggestedActions: ['Edit text', 'Adjust timing'] },
  
  // MOBILE PIPELINES (NEW)
  { pipelineId: 'mobile-record-to-reel', editorType: 'video', priority: 'HIGH', capabilities: ['trim', 'addMusic', 'addCaptions', 'cropResize'], commonIssues: ['Need quick polish'], suggestedActions: ['Add music', 'Trim to 60s'] },
  { pipelineId: 'mobile-quick-edit', editorType: 'video', priority: 'MEDIUM', capabilities: ['trim', 'addCaptions'], commonIssues: ['Basic editing needed'], suggestedActions: ['Quick trim', 'Add filter'] },
  { pipelineId: 'mobile-voice-memo-to-video', editorType: 'video', priority: 'CRITICAL', capabilities: ['addVoiceTTS', 'addMusic', 'addCaptions'], commonIssues: ['Need visuals'], suggestedActions: ['Add AI visuals', 'Add captions'] },
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
    if (pipelineId.includes('ppt') || pipelineId.includes('doc') || pipelineId.includes('pdf')) return 'document';
    return 'none';
  }

  /**
   * Get proactive edit suggestions based on content analysis
   */
  getProactiveSuggestions(
    pipelineId: string,
    outputContent: any,
    deviceContext: DeviceContext = 'desktop'
  ): ProactiveEditSuggestion[] {
    const suggestions: ProactiveEditSuggestion[] = [];
    const config = PIPELINE_EDITOR_CONFIGS.find(c => c.pipelineId === pipelineId);
    
    if (!config) return suggestions;

    const capabilities = config.capabilities.map(c => EDIT_CAPABILITIES[c]).filter(Boolean);
    
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
      triggerAction: () => this.openEditor(pipelineId, config.editorType)
    });

    // Add related suggestions
    const relatedPipelines = this.getRelatedPipelines(pipelineId);
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
        triggerAction: () => this.openEditor(related.pipelineId, related.editorType)
      });
    });

    return suggestions;
  }

  /**
   * Analyze content and suggest beneficial editing pipelines
   */
  suggestEditingPipelines(
    contentType: 'video' | 'audio' | 'image' | 'document' | '3d',
    userIntent?: string
  ): string[] {
    const suggestions: string[] = [];

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

    return suggestions;
  }

  /**
   * Get related pipelines for cross-suggestions
   */
  private getRelatedPipelines(pipelineId: string): PipelineEditorConfig[] {
    const config = PIPELINE_EDITOR_CONFIGS.find(c => c.pipelineId === pipelineId);
    if (!config) return [];

    return PIPELINE_EDITOR_CONFIGS
      .filter(c => c.pipelineId !== pipelineId && c.editorType === config.editorType)
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
}

export const proactivePipelineEditorService = new ProactivePipelineEditorService();
export default proactivePipelineEditorService;
