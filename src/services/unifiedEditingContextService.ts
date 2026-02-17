/**
 * Unified Editing Context Service
 * 
 * Tracks generation settings per element for targeted regeneration.
 * Enables partial updates while maintaining consistency with original generation.
 * 
 * Supports: Slides, Video Clips, 3D Elements, AI Avatars, Animations
 */

import { GlobalTierLevel, GenerationContext } from './flexibleAgentConfigService';

// ============================================
// TYPES & INTERFACES
// ============================================

export type ElementType = 
  | 'slide' 
  | 'video-clip' 
  | 'video-scene'
  | '3d-object' 
  | '3d-scene'
  | 'ai-avatar' 
  | 'animation' 
  | 'audio-segment'
  | 'image'
  | 'infographic'
  | 'chart'
  | 'diagram';

export type EditAction = 
  | 'regenerate'      // Full regeneration with same settings
  | 'enhance'         // AI enhancement pass
  | 'refine'          // Minor adjustments
  | 'replace'         // Replace with new content
  | 'update-style'    // Change visual style only
  | 'update-content'  // Change content only (text, script)
  | 'update-model'    // Change AI model for regeneration
  | 'revert';         // Revert to original

export interface ElementGenerationContext {
  // Core identification
  elementId: string;
  elementType: ElementType;
  parentId?: string;          // Parent presentation/video ID
  parentType?: 'presentation' | 'video' | 'scene' | 'chapter';
  
  // Position in sequence
  sequenceIndex?: number;     // Slide number, clip index, etc.
  sequenceTotal?: number;     // Total elements in sequence
  
  // Original generation settings
  originalContext: GenerationContext;
  
  // Model/Provider used for generation
  generationSettings: {
    textModel?: string;
    textProvider?: string;
    imageModel?: string;
    imageProvider?: string;
    videoModel?: string;
    videoProvider?: string;
    voiceModel?: string;
    voiceProvider?: string;
    mesh3dModel?: string;
    mesh3dProvider?: string;
    avatarModel?: string;
    avatarProvider?: string;
  };
  
  // Timestamps
  createdAt: string;
  lastModifiedAt: string;
  lastRegeneratedAt?: string;
  
  // Version tracking
  version: number;
  previousVersions?: string[];  // IDs of previous versions for revert
  
  // Content snapshot for revert
  originalContent?: Record<string, unknown>;
  currentContent?: Record<string, unknown>;
  
  // Edit history
  editHistory: ElementEditRecord[];
  
  // Tier used for generation (affects credit cost)
  tier: GlobalTierLevel;
  creditsUsed: number;
}

export interface ElementEditRecord {
  id: string;
  action: EditAction;
  timestamp: string;
  userId?: string;
  
  // What changed
  changes: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  
  // AI-assisted edit details
  aiAssisted: boolean;
  modelUsed?: string;
  promptUsed?: string;
  
  // Credits consumed for this edit
  creditsConsumed: number;
}

export interface RegenerationRequest {
  elementId: string;
  action: EditAction;
  
  // Override options (optional - defaults to original settings)
  overrides?: {
    model?: string;
    provider?: string;
    tier?: GlobalTierLevel;
    customPrompt?: string;
    styleOverrides?: Record<string, unknown>;
  };
  
  // Scope of regeneration
  scope: 'element-only' | 'with-dependencies' | 'cascade-children';
  
  // For partial content updates
  contentUpdates?: {
    field: string;
    newValue: unknown;
  }[];
}

export interface RegenerationResult {
  success: boolean;
  elementId: string;
  newVersion: number;
  
  // Updated content
  updatedContent?: Record<string, unknown>;
  
  // Credits and cost
  creditsConsumed: number;
  estimatedVsActual: { estimated: number; actual: number };
  
  // Timing
  duration: number;
  
  // Errors if any
  error?: string;
  warnings?: string[];
}

// ============================================
// ELEMENT CONTEXT STORE (In-memory + Persistence)
// ============================================

class UnifiedEditingContextService {
  private contextStore: Map<string, ElementGenerationContext> = new Map();
  private parentChildMap: Map<string, string[]> = new Map();
  
  // ============================================
  // CONTEXT MANAGEMENT
  // ============================================
  
  /**
   * Store generation context for an element
   */
  storeElementContext(context: ElementGenerationContext): void {
    this.contextStore.set(context.elementId, context);
    
    // Track parent-child relationships
    if (context.parentId) {
      const children = this.parentChildMap.get(context.parentId) || [];
      if (!children.includes(context.elementId)) {
        children.push(context.elementId);
        this.parentChildMap.set(context.parentId, children);
      }
    }
  }
  
  /**
   * Get context for an element
   */
  getElementContext(elementId: string): ElementGenerationContext | undefined {
    return this.contextStore.get(elementId);
  }
  
  /**
   * Get all child elements of a parent
   */
  getChildElements(parentId: string): ElementGenerationContext[] {
    const childIds = this.parentChildMap.get(parentId) || [];
    return childIds
      .map(id => this.contextStore.get(id))
      .filter((ctx): ctx is ElementGenerationContext => ctx !== undefined);
  }
  
  /**
   * Bulk store contexts for a generated presentation/video
   */
  storeGenerationResult(
    parentId: string,
    parentType: 'presentation' | 'video',
    elements: Array<{
      id: string;
      type: ElementType;
      content: Record<string, unknown>;
      sequenceIndex: number;
    }>,
    generationContext: GenerationContext,
    generationSettings: ElementGenerationContext['generationSettings']
  ): void {
    const timestamp = new Date().toISOString();
    
    elements.forEach((element, index) => {
      const context: ElementGenerationContext = {
        elementId: element.id,
        elementType: element.type,
        parentId,
        parentType,
        sequenceIndex: element.sequenceIndex,
        sequenceTotal: elements.length,
        originalContext: generationContext,
        generationSettings,
        createdAt: timestamp,
        lastModifiedAt: timestamp,
        version: 1,
        originalContent: { ...element.content },
        currentContent: { ...element.content },
        editHistory: [],
        tier: generationContext.globalTier || 'standard',
        creditsUsed: 0, // Will be updated after generation
      };
      
      this.storeElementContext(context);
    });
  }
  
  // ============================================
  // REGENERATION & EDITING
  // ============================================
  
  /**
   * Prepare regeneration request with original settings
   */
  prepareRegeneration(
    elementId: string,
    action: EditAction,
    overrides?: RegenerationRequest['overrides']
  ): RegenerationRequest | null {
    const context = this.getElementContext(elementId);
    if (!context) return null;
    
    return {
      elementId,
      action,
      overrides,
      scope: 'element-only',
    };
  }
  
  /**
   * Get regeneration settings (merged original + overrides)
   */
  getRegenerationSettings(
    elementId: string,
    overrides?: RegenerationRequest['overrides']
  ): {
    context: GenerationContext;
    settings: ElementGenerationContext['generationSettings'];
    tier: GlobalTierLevel;
  } | null {
    const elementContext = this.getElementContext(elementId);
    if (!elementContext) return null;
    
    // Start with original settings
    const context = { ...elementContext.originalContext };
    const settings = { ...elementContext.generationSettings };
    let tier = elementContext.tier;
    
    // Apply overrides
    if (overrides) {
      if (overrides.tier) {
        tier = overrides.tier;
        context.globalTier = tier;
      }
      
      if (overrides.model) {
        // Determine model type and apply
        const modelType = this.detectModelType(overrides.model);
        if (modelType === 'text') settings.textModel = overrides.model;
        if (modelType === 'image') settings.imageModel = overrides.model;
        if (modelType === 'video') settings.videoModel = overrides.model;
        if (modelType === 'voice') settings.voiceModel = overrides.model;
        if (modelType === '3d') settings.mesh3dModel = overrides.model;
      }
      
      if (overrides.provider) {
        const providerType = this.detectProviderType(overrides.provider);
        if (providerType === 'text') settings.textProvider = overrides.provider;
        if (providerType === 'image') settings.imageProvider = overrides.provider;
        if (providerType === 'video') settings.videoProvider = overrides.provider;
        if (providerType === 'voice') settings.voiceProvider = overrides.provider;
        if (providerType === '3d') settings.mesh3dProvider = overrides.provider;
      }
    }
    
    return { context, settings, tier };
  }
  
  /**
   * Record an edit action
   */
  recordEdit(
    elementId: string,
    action: EditAction,
    changes: ElementEditRecord['changes'],
    aiDetails?: {
      modelUsed?: string;
      promptUsed?: string;
    },
    creditsConsumed: number = 0
  ): void {
    const context = this.getElementContext(elementId);
    if (!context) return;
    
    const editRecord: ElementEditRecord = {
      id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      timestamp: new Date().toISOString(),
      changes,
      aiAssisted: !!aiDetails?.modelUsed,
      modelUsed: aiDetails?.modelUsed,
      promptUsed: aiDetails?.promptUsed,
      creditsConsumed,
    };
    
    context.editHistory.push(editRecord);
    context.lastModifiedAt = editRecord.timestamp;
    context.version += 1;
    
    if (action === 'regenerate') {
      context.lastRegeneratedAt = editRecord.timestamp;
    }
    
    this.contextStore.set(elementId, context);
  }
  
  /**
   * Update element content after edit
   */
  updateElementContent(
    elementId: string,
    newContent: Record<string, unknown>
  ): void {
    const context = this.getElementContext(elementId);
    if (!context) return;
    
    // Store previous version reference if needed
    if (!context.previousVersions) {
      context.previousVersions = [];
    }
    context.previousVersions.push(`${elementId}-v${context.version}`);
    
    context.currentContent = { ...newContent };
    context.lastModifiedAt = new Date().toISOString();
    
    this.contextStore.set(elementId, context);
  }
  
  /**
   * Revert element to original content
   */
  revertToOriginal(elementId: string): Record<string, unknown> | null {
    const context = this.getElementContext(elementId);
    if (!context || !context.originalContent) return null;
    
    context.currentContent = { ...context.originalContent };
    context.lastModifiedAt = new Date().toISOString();
    
    this.recordEdit(
      elementId,
      'revert',
      [{ field: 'content', oldValue: 'modified', newValue: 'original' }],
      undefined,
      0
    );
    
    this.contextStore.set(elementId, context);
    return context.currentContent;
  }
  
  // ============================================
  // CREDIT ESTIMATION
  // ============================================
  
  /**
   * Estimate credits for a regeneration action
   */
  estimateRegenerationCredits(
    elementId: string,
    action: EditAction,
    overrides?: RegenerationRequest['overrides']
  ): number {
    const context = this.getElementContext(elementId);
    if (!context) return 0;
    
    const tier = overrides?.tier || context.tier;
    const tierMultiplier = { standard: 1.0, advanced: 2.5, premium: 5.0 }[tier];
    
    // Base credits per element type
    const baseCredits: Record<ElementType, number> = {
      'slide': 10,
      'video-clip': 50,
      'video-scene': 100,
      '3d-object': 75,
      '3d-scene': 150,
      'ai-avatar': 200,
      'animation': 30,
      'audio-segment': 25,
      'image': 20,
      'infographic': 40,
      'chart': 15,
      'diagram': 25,
    };
    
    // Action multiplier
    const actionMultiplier: Record<EditAction, number> = {
      'regenerate': 1.0,
      'enhance': 0.5,
      'refine': 0.25,
      'replace': 1.0,
      'update-style': 0.3,
      'update-content': 0.2,
      'update-model': 1.0,
      'revert': 0,
    };
    
    const base = baseCredits[context.elementType] || 10;
    const actionMult = actionMultiplier[action] || 1.0;
    
    return Math.ceil(base * actionMult * tierMultiplier);
  }
  
  // ============================================
  // BATCH OPERATIONS
  // ============================================
  
  /**
   * Get all elements needing regeneration (e.g., after model change)
   */
  getElementsForBatchRegeneration(
    parentId: string,
    filter?: {
      types?: ElementType[];
      modifiedAfter?: string;
      hasErrors?: boolean;
    }
  ): ElementGenerationContext[] {
    const children = this.getChildElements(parentId);
    
    return children.filter(ctx => {
      if (filter?.types && !filter.types.includes(ctx.elementType)) {
        return false;
      }
      if (filter?.modifiedAfter && ctx.lastModifiedAt < filter.modifiedAfter) {
        return false;
      }
      return true;
    });
  }
  
  /**
   * Estimate total credits for batch regeneration
   */
  estimateBatchCredits(
    elementIds: string[],
    action: EditAction,
    overrides?: RegenerationRequest['overrides']
  ): { total: number; breakdown: Array<{ id: string; type: ElementType; credits: number }> } {
    const breakdown = elementIds.map(id => {
      const ctx = this.getElementContext(id);
      return {
        id,
        type: ctx?.elementType || 'slide' as ElementType,
        credits: this.estimateRegenerationCredits(id, action, overrides),
      };
    });
    
    return {
      total: breakdown.reduce((sum, item) => sum + item.credits, 0),
      breakdown,
    };
  }
  
  // ============================================
  // HELPER METHODS
  // ============================================
  
  private detectModelType(modelId: string): 'text' | 'image' | 'video' | 'voice' | '3d' | 'unknown' {
    const textModels = ['gemini', 'gpt', 'claude', 'qwen', 'deepseek'];
    const imageModels = ['flux', 'dall-e', 'stability', 'modelslab', 'midjourney'];
    const videoModels = ['sora', 'runway', 'animatediff', 'pika', 'kling'];
    const voiceModels = ['elevenlabs', 'openai-tts', 'azure-neural', 'google-tts'];
    const mesh3dModels = ['meshy', 'triposr', 'rodin', 'shap-e', 'luma'];
    
    if (textModels.some(m => modelId.toLowerCase().includes(m))) return 'text';
    if (imageModels.some(m => modelId.toLowerCase().includes(m))) return 'image';
    if (videoModels.some(m => modelId.toLowerCase().includes(m))) return 'video';
    if (voiceModels.some(m => modelId.toLowerCase().includes(m))) return 'voice';
    if (mesh3dModels.some(m => modelId.toLowerCase().includes(m))) return '3d';
    return 'unknown';
  }
  
  private detectProviderType(providerId: string): 'text' | 'image' | 'video' | 'voice' | '3d' | 'unknown' {
    const textProviders = ['openai', 'anthropic', 'google', 'alibaba', 'deepseek'];
    const imageProviders = ['modelslab', 'stability', 'openai', 'replicate'];
    const videoProviders = ['runway', 'pika', 'luma', 'modelslab'];
    const voiceProviders = ['elevenlabs', 'azure', 'google', 'openai'];
    const mesh3dProviders = ['meshy', 'rodin', 'luma', 'modelslab'];
    
    if (voiceProviders.some(p => providerId.toLowerCase().includes(p))) return 'voice';
    if (mesh3dProviders.some(p => providerId.toLowerCase().includes(p))) return '3d';
    if (videoProviders.some(p => providerId.toLowerCase().includes(p))) return 'video';
    if (imageProviders.some(p => providerId.toLowerCase().includes(p))) return 'image';
    if (textProviders.some(p => providerId.toLowerCase().includes(p))) return 'text';
    return 'unknown';
  }
  
  // ============================================
  // PERSISTENCE (Optional - for Supabase integration)
  // ============================================
  
  /**
   * Export all contexts for persistence
   */
  exportContexts(): ElementGenerationContext[] {
    return Array.from(this.contextStore.values());
  }
  
  /**
   * Import contexts from persistence
   */
  importContexts(contexts: ElementGenerationContext[]): void {
    contexts.forEach(ctx => this.storeElementContext(ctx));
  }
  
  /**
   * Clear all contexts (e.g., on new session)
   */
  clearAll(): void {
    this.contextStore.clear();
    this.parentChildMap.clear();
  }
}

// Export singleton instance
export const unifiedEditingContextService = new UnifiedEditingContextService();

// Export types and service
export default UnifiedEditingContextService;
