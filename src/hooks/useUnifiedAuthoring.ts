 /**
  * useUnifiedAuthoring - Cross-Product Unified Authoring Hook
  * 
  * Shared authoring workflow for Spark, Mind, Deck, Vibe, and Cast
  * Handles: Messaging → Script → Template Mapping → TTS → A/V Sync → Approval → Publish
  * 
  * Design Principles:
  * - Zero hardcoding - all config is dynamic/database-driven
  * - Cross-functional - works across all 7 Genie products
  * - Extensible - new stages/providers added via config
  */
 
 import { useState, useCallback, useMemo } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { styleIntentResolver, type StyleIntent, type RegionZone } from '@/services/styleIntentResolver';
 import { REGIONAL_CONFIG } from '@/components/shared/RegionalDialectSelector';
 
 // ============================================
 // TYPES - All configurable, no hardcoding
 // ============================================
 
 export type AuthoringStage = 
   | 'template_selection'
   | 'messaging_generation'
   | 'transcreation'
   | 'script_composition'
   | 'template_mapping'
   | 'tts_generation'
   | 'av_sync'
   | 'approval'
   | 'publishing';
 
 export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'revision_requested';
 
 export interface AuthoringConfig {
   // Which product is using this hook
   productContext: 'spark' | 'mind' | 'deck' | 'vibe' | 'cast' | 'arc' | 'ask_genie' | 'studio';
   
   // Which stages are enabled for this product
   enabledStages: AuthoringStage[];
   
   // Style intent for provider routing
   styleIntent: StyleIntent;
   
   // Target regions for multi-regional output
   targetRegions: RegionZone[];
   
   // Selected dialects for TTS
   selectedDialects: string[];
   
   // Template/Blueprint ID if applicable
   templateId?: string;
   
   // Custom overrides
   customConfig?: Record<string, any>;
 }
 
 export interface MessagingContent {
   id: string;
   productId: string;
   hook: string;
   valueProposition: string;
   painPoints: string[];
   benefits: string[];
   differentiators: string[];
   cta: string;
   shortScript: string;
   mediumScript: string;
   longScript: string;
   approvalStatus: ApprovalStatus;
   language: string;
   transcreations?: Record<string, MessagingContent>;
   createdAt: Date;
   updatedAt: Date;
 }
 
 export interface SceneScript {
   sceneId: string;
   sceneKey: string;
   title: string;
   orderIndex: number;
   scriptText: string;
   editedText?: string;
   sourceType: 'messaging' | 'template' | 'custom';
   durationSeconds: number;
   minDuration: number;
   maxDuration: number;
   ttsConfig: {
     provider: string;
     voiceId?: string;
     speed: number;
     pitch: number;
   };
   approvalStatus: ApprovalStatus;
 }
 
 export interface TemplateMapping {
   templateId: string;
   templateName: string;
   scenes: SceneScript[];
   totalDuration: number;
   styleIntent: StyleIntent;
   resolvedProviders: {
     image: string;
     video: string;
     tts: string;
     llm: string;
   };
 }
 
 export interface AuthoringState {
   currentStage: AuthoringStage;
   config: AuthoringConfig;
   messaging: MessagingContent | null;
   templateMapping: TemplateMapping | null;
   isProcessing: boolean;
   errors: string[];
   stageHistory: AuthoringStage[];
 }
 
 // ============================================
 // DEFAULT CONFIGURATIONS PER PRODUCT
 // ============================================
 
 const PRODUCT_STAGE_DEFAULTS: Record<string, AuthoringStage[]> = {
   // Cast needs full pipeline with transcreation
   cast: ['template_selection', 'messaging_generation', 'transcreation', 'script_composition', 'template_mapping', 'tts_generation', 'av_sync', 'approval', 'publishing'],
   
   // Spark is about quick content - with transcreation for multi-region
   spark: ['messaging_generation', 'transcreation', 'script_composition', 'tts_generation', 'approval'],
   
   // Mind focuses on script/audio with transcreation
   mind: ['messaging_generation', 'transcreation', 'script_composition', 'tts_generation', 'approval'],
   
   // Deck focuses on visual template + script with transcreation
   deck: ['template_selection', 'messaging_generation', 'transcreation', 'script_composition', 'template_mapping', 'approval', 'publishing'],
   
   // Vibe is about video editing with transcreation for regional versions
   vibe: ['messaging_generation', 'transcreation', 'template_mapping', 'av_sync', 'approval', 'publishing'],
   
   // Arc is workflow automation
   arc: ['approval', 'publishing'],
   
   // Hub orchestrates — full pipeline
   hub: ['template_selection', 'messaging_generation', 'transcreation', 'script_composition', 'template_mapping', 'tts_generation', 'av_sync', 'approval', 'publishing'],
   
   // Ask Genie is conversational
   ask_genie: ['messaging_generation', 'approval'],
   
   // Studio is the hub - all stages
   studio: ['template_selection', 'messaging_generation', 'transcreation', 'script_composition', 'template_mapping', 'tts_generation', 'av_sync', 'approval', 'publishing'],
 };
 
 // ============================================
 // HOOK IMPLEMENTATION
 // ============================================
 
 export interface UseUnifiedAuthoringOptions {
   productContext: AuthoringConfig['productContext'];
   initialStyleIntent?: StyleIntent;
   initialRegions?: RegionZone[];
   initialDialects?: string[];
   templateId?: string;
   onStageChange?: (stage: AuthoringStage) => void;
   onMessagingApproved?: (messaging: MessagingContent) => void;
   onScriptApproved?: (mapping: TemplateMapping) => void;
   onPublishReady?: (data: any) => void;
 }
 
 export function useUnifiedAuthoring(options: UseUnifiedAuthoringOptions) {
   const {
     productContext,
     initialStyleIntent = 'corporate',
     initialRegions = ['global'],
     initialDialects = ['en-US'],
     templateId,
     onStageChange,
     onMessagingApproved,
     onScriptApproved,
     onPublishReady,
   } = options;
 
   // Initialize config based on product context
   const initialConfig: AuthoringConfig = useMemo(() => ({
     productContext,
     enabledStages: PRODUCT_STAGE_DEFAULTS[productContext] || PRODUCT_STAGE_DEFAULTS.studio,
     styleIntent: initialStyleIntent,
     targetRegions: initialRegions,
     selectedDialects: initialDialects,
     templateId,
   }), [productContext, initialStyleIntent, initialRegions, initialDialects, templateId]);
 
   // State
   const [state, setState] = useState<AuthoringState>({
     currentStage: initialConfig.enabledStages[0] || 'template_selection',
     config: initialConfig,
     messaging: null,
     templateMapping: null,
     isProcessing: false,
     errors: [],
     stageHistory: [],
   });
 
   // ============================================
   // STAGE NAVIGATION
   // ============================================
 
   const goToStage = useCallback((stage: AuthoringStage) => {
     if (!state.config.enabledStages.includes(stage)) {
       console.warn(`Stage ${stage} is not enabled for ${state.config.productContext}`);
       return;
     }
 
     setState(prev => ({
       ...prev,
       currentStage: stage,
       stageHistory: [...prev.stageHistory, prev.currentStage],
     }));
 
     onStageChange?.(stage);
   }, [state.config, onStageChange]);
 
   const goToNextStage = useCallback(() => {
     const currentIndex = state.config.enabledStages.indexOf(state.currentStage);
     const nextStage = state.config.enabledStages[currentIndex + 1];
     
     if (nextStage) {
       goToStage(nextStage);
     }
   }, [state.config.enabledStages, state.currentStage, goToStage]);
 
   const goToPreviousStage = useCallback(() => {
     const lastStage = state.stageHistory[state.stageHistory.length - 1];
     if (lastStage) {
       setState(prev => ({
         ...prev,
         currentStage: lastStage,
         stageHistory: prev.stageHistory.slice(0, -1),
       }));
       onStageChange?.(lastStage);
     }
   }, [state.stageHistory, onStageChange]);
 
   // ============================================
   // CONFIG UPDATES
   // ============================================
 
   const updateConfig = useCallback((updates: Partial<AuthoringConfig>) => {
     setState(prev => ({
       ...prev,
       config: { ...prev.config, ...updates },
     }));
   }, []);
 
   const setStyleIntent = useCallback((intent: StyleIntent) => {
     updateConfig({ styleIntent: intent });
   }, [updateConfig]);
 
   const setTargetRegions = useCallback((regions: RegionZone[]) => {
     updateConfig({ targetRegions: regions });
   }, [updateConfig]);
 
   const setSelectedDialects = useCallback((dialects: string[]) => {
     updateConfig({ selectedDialects: dialects });
   }, [updateConfig]);
 
   // ============================================
   // MESSAGING OPERATIONS
   // ============================================
 
   const setMessaging = useCallback((messaging: MessagingContent) => {
     setState(prev => ({
       ...prev,
       messaging,
     }));
   }, []);
 
   const approveMessaging = useCallback((messaging: MessagingContent) => {
     const approved: MessagingContent = {
       ...messaging,
       approvalStatus: 'approved',
       updatedAt: new Date(),
     };
     
     setMessaging(approved);
     onMessagingApproved?.(approved);
     toast.success('Messaging approved');
     
     // Auto-advance to next stage
     goToNextStage();
   }, [setMessaging, onMessagingApproved, goToNextStage]);
 
   // ============================================
   // TEMPLATE MAPPING OPERATIONS
   // ============================================
 
   const createTemplateMapping = useCallback(async (
     templateId: string,
     messaging?: MessagingContent
   ): Promise<TemplateMapping | null> => {
     setState(prev => ({ ...prev, isProcessing: true }));
 
     try {
       // Fetch template with scenes
       const { data: template, error: templateError } = await supabase
         .from('video_blueprints')
         .select('*')
         .eq('id', templateId)
         .single();
 
       if (templateError) throw templateError;
 
       const { data: scenes, error: scenesError } = await supabase
         .from('blueprint_scenes')
         .select('*')
         .eq('blueprint_id', templateId)
         .order('order_index', { ascending: true });
 
       if (scenesError) throw scenesError;
 
       // Resolve style intent to providers
       const styleIntent = (template.style_intent || state.config.styleIntent) as StyleIntent;
       const region = state.config.targetRegions[0] || 'global';
       const resolved = styleIntentResolver.resolve(styleIntent, region);
 
       // Map scenes to scripts
       const sceneScripts: SceneScript[] = (scenes || []).map((scene: any) => {
         // Compose script from messaging if available
         let scriptText = scene.script_template || '';
         
         if (messaging && scriptText) {
           // Replace template variables with messaging content
           scriptText = scriptText
             .replace(/\{\{hook\}\}/g, messaging.hook || '')
             .replace(/\{\{cta\}\}/g, messaging.cta || '')
             .replace(/\{\{value_proposition\}\}/g, messaging.valueProposition || '')
             .replace(/\{\{product_name\}\}/g, messaging.productId || '')
             .replace(/\{\{benefits\}\}/g, (messaging.benefits || []).join('. '))
             .replace(/\{\{pain_points\}\}/g, (messaging.painPoints || []).join('. '));
         }
 
         return {
           sceneId: scene.id,
           sceneKey: scene.scene_key,
           title: scene.title,
           orderIndex: scene.order_index,
           scriptText,
           sourceType: messaging ? 'messaging' : 'template',
           durationSeconds: scene.duration_seconds,
           minDuration: scene.min_duration_seconds,
           maxDuration: scene.max_duration_seconds,
           ttsConfig: {
             provider: resolved.ttsProvider,
             speed: 1.0,
             pitch: 1.0,
           },
           approvalStatus: 'draft',
         };
       });
 
       const mapping: TemplateMapping = {
         templateId,
         templateName: template.name,
         scenes: sceneScripts,
         totalDuration: sceneScripts.reduce((sum, s) => sum + s.durationSeconds, 0),
         styleIntent,
         resolvedProviders: {
           image: resolved.imageProvider.primary,
           video: resolved.videoProvider.primary,
           tts: resolved.ttsProvider,
           llm: resolved.llmProvider,
         },
       };
 
       setState(prev => ({
         ...prev,
         templateMapping: mapping,
         isProcessing: false,
       }));
 
       return mapping;
     } catch (error: any) {
       console.error('[useUnifiedAuthoring] Template mapping failed:', error);
       setState(prev => ({
         ...prev,
         isProcessing: false,
         errors: [...prev.errors, error.message],
       }));
       toast.error('Failed to create template mapping');
       return null;
     }
   }, [state.config]);
 
   const updateSceneScript = useCallback((sceneId: string, updates: Partial<SceneScript>) => {
     setState(prev => {
       if (!prev.templateMapping) return prev;
 
       const updatedScenes = prev.templateMapping.scenes.map(scene =>
         scene.sceneId === sceneId ? { ...scene, ...updates } : scene
       );
 
       return {
         ...prev,
         templateMapping: {
           ...prev.templateMapping,
           scenes: updatedScenes,
           totalDuration: updatedScenes.reduce((sum, s) => sum + s.durationSeconds, 0),
         },
       };
     });
    }, []);

    // Direct setter for templateMapping (used when loading from customization drafts)
    const setTemplateMapping = useCallback((mapping: TemplateMapping | null) => {
      setState(prev => ({
        ...prev,
        templateMapping: mapping,
      }));
    }, []);
 
   const approveTemplateMapping = useCallback(() => {
     if (!state.templateMapping) return;
 
     const approved: TemplateMapping = {
       ...state.templateMapping,
       scenes: state.templateMapping.scenes.map(s => ({
         ...s,
         approvalStatus: 'approved' as ApprovalStatus,
       })),
     };
 
     setState(prev => ({ ...prev, templateMapping: approved }));
     onScriptApproved?.(approved);
     toast.success('Script mapping approved');
     goToNextStage();
   }, [state.templateMapping, onScriptApproved, goToNextStage]);
 
   // ============================================
   // TTS GENERATION
   // ============================================
 
   const generateTTSForScene = useCallback(async (sceneId: string): Promise<string | null> => {
     const scene = state.templateMapping?.scenes.find(s => s.sceneId === sceneId);
     if (!scene) return null;
 
     setState(prev => ({ ...prev, isProcessing: true }));
 
     try {
       const text = scene.editedText || scene.scriptText;
       const dialect = state.config.selectedDialects[0] || 'en-US';
 
       const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
         body: {
           text,
           languageCode: dialect,
           provider: scene.ttsConfig.provider,
           voiceId: scene.ttsConfig.voiceId,
           speed: scene.ttsConfig.speed,
         },
       });
 
       if (error) throw error;
 
       // Update scene with audio URL
       updateSceneScript(sceneId, { 
         // Store TTS result - would need to extend SceneScript type
       });
 
       setState(prev => ({ ...prev, isProcessing: false }));
       return data?.audioUrl || null;
     } catch (error: any) {
       console.error('[useUnifiedAuthoring] TTS generation failed:', error);
       setState(prev => ({
         ...prev,
         isProcessing: false,
         errors: [...prev.errors, error.message],
       }));
       return null;
     }
   }, [state.templateMapping, state.config.selectedDialects, updateSceneScript]);
 
   const generateTTSForAllScenes = useCallback(async (): Promise<boolean> => {
     if (!state.templateMapping) return false;
 
     setState(prev => ({ ...prev, isProcessing: true }));
 
     try {
       for (const scene of state.templateMapping.scenes) {
         await generateTTSForScene(scene.sceneId);
       }
       
       toast.success('TTS generation complete');
       goToNextStage();
       return true;
     } catch (error) {
       toast.error('TTS generation failed');
       return false;
     } finally {
       setState(prev => ({ ...prev, isProcessing: false }));
     }
   }, [state.templateMapping, generateTTSForScene, goToNextStage]);
 
   // ============================================
   // PUBLISHING
   // ============================================
 
   const prepareForPublishing = useCallback(() => {
     if (!state.templateMapping) return null;
 
     const publishData = {
       config: state.config,
       messaging: state.messaging,
       templateMapping: state.templateMapping,
       resolvedProviders: state.templateMapping.resolvedProviders,
       dialects: state.config.selectedDialects,
       regions: state.config.targetRegions,
     };
 
     onPublishReady?.(publishData);
     return publishData;
   }, [state, onPublishReady]);
 
   // ============================================
   // COMPUTED VALUES
   // ============================================
 
   const stageProgress = useMemo(() => {
     const currentIndex = state.config.enabledStages.indexOf(state.currentStage);
     return {
       current: currentIndex + 1,
       total: state.config.enabledStages.length,
       percentage: ((currentIndex + 1) / state.config.enabledStages.length) * 100,
     };
   }, [state.config.enabledStages, state.currentStage]);
 
   const isStageComplete = useCallback((stage: AuthoringStage): boolean => {
     switch (stage) {
       case 'messaging_generation':
         return state.messaging?.approvalStatus === 'approved';
       case 'script_composition':
       case 'template_mapping':
         return state.templateMapping?.scenes.every(s => s.approvalStatus === 'approved') || false;
       default:
         return state.stageHistory.includes(stage);
     }
   }, [state]);
 
   const canProceed = useMemo(() => {
     switch (state.currentStage) {
       case 'messaging_generation':
         return state.messaging !== null;
       case 'template_selection':
         return state.config.templateId !== undefined;
       case 'script_composition':
       case 'template_mapping':
         return state.templateMapping !== null;
       default:
         return true;
     }
   }, [state]);
 
   // ============================================
   // RETURN API
   // ============================================
 
   return {
     // State
     state,
     currentStage: state.currentStage,
     config: state.config,
     messaging: state.messaging,
     templateMapping: state.templateMapping,
     isProcessing: state.isProcessing,
     errors: state.errors,
 
     // Navigation
     goToStage,
     goToNextStage,
     goToPreviousStage,
     stageProgress,
     isStageComplete,
     canProceed,
 
     // Config
     updateConfig,
     setStyleIntent,
     setTargetRegions,
     setSelectedDialects,
 
     // Messaging
     setMessaging,
     approveMessaging,
 
      // Template Mapping
      createTemplateMapping,
      setTemplateMapping,
      updateSceneScript,
      approveTemplateMapping,
 
     // TTS
     generateTTSForScene,
     generateTTSForAllScenes,
 
     // Publishing
     prepareForPublishing,
 
     // Utilities
     resolveStyleIntent: styleIntentResolver.resolve,
     getStyleLabel: styleIntentResolver.getLabel,
     availableStyleIntents: styleIntentResolver.getAvailable(),
     regionalConfig: REGIONAL_CONFIG,

     // Transcreation (NEW — wired to Universal Script Schema)
     transcreation: {
       /** Get cultural traits for a region */
       getTraits: (regionCode: string) => {
         const { getTranscreationTraits } = require('@/services/regionalTranscreationService');
         return getTranscreationTraits(regionCode);
       },
       /** Get full transcreation profile for a region */
       getProfile: (regionCode: string) => {
         const { getTranscreationProfile } = require('@/services/regionalTranscreationService');
         return getTranscreationProfile(regionCode);
       },
       /** Get direction prompt enriched with cultural context */
       getDirectionPrompt: (regionCode: string, tone: string) => {
         const { getTranscreationDirectionPrompt } = require('@/services/regionalTranscreationService');
         return getTranscreationDirectionPrompt(regionCode, tone as any, productContext as any);
       },
       /** Get all available regions for picker UI */
       getAvailableRegions: () => {
         const { getAllAvailableRegions } = require('@/services/regionalTranscreationService');
         return getAllAvailableRegions();
       },
     },
   };
 }
 
 export default useUnifiedAuthoring;