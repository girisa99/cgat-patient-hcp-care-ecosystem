/**
 * useGenieCastSession - Persistent Session State for Genie Cast Workflow
 *
 * THE SINGLE SOURCE OF TRUTH for all CREATE → PRODUCE → PUBLISH state.
 * Every user selection in CREATE persists here and flows 1:1 into PRODUCE.
 *
 * Bridges:
 * - Selected template (from Assets)
 * - Approved messaging (from Messaging)
 * - Selected styles, formats, capabilities (from Configure)
 * - Script mapping (from Studio)
 * - Production artifacts (from PRODUCE)
 * - Approval status per stage
 *
 * Uses localStorage for persistence across tab changes and refreshes.
 * Database sync available for multi-device support.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AuthoringStage, MessagingContent, TemplateMapping, ApprovalStatus } from '@/hooks/useUnifiedAuthoring';
import type { StyleIntent, RegionZone } from '@/services/styleIntentResolver';

// ============================================
// TYPES
// ============================================

export interface SelectedTemplate {
  id: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
  sceneCount: number;
  estimatedDuration: number;
  styleIntent: StyleIntent;
  // P1: Full context from blueprint
  targetPlatforms?: string[];
  capabilities?: {
    avatar?: boolean;
    '3d'?: boolean;
    animation?: boolean;
    arVr?: boolean;
    lipsync?: boolean;
  };
  industryTags?: string[];
  targetRegions?: string[];
}

export interface ApprovalItem {
  id: string;
  stage: AuthoringStage;
  title: string;
  description: string;
  status: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
  data?: any; // Stage-specific data
}

/** Multi-speaker config for podcast/dialogue formats */
export interface SpeakerConfig {
  id: string;
  name: string;
  role: 'host' | 'guest' | 'narrator' | 'moderator' | 'character';
  voiceProvider: string;       // 'azure' | 'elevenlabs' | 'alibaba' | 'openai'
  voiceId: string;             // provider-specific voice ID
  voiceFallbackChain: string[];
  avatarStyle: '3d-pixar' | 'disney-2d' | 'realistic' | 'none';
  avatarPrompt: string;
  motionStyle: string;         // 'energetic' | 'measured' | 'calm'
  colorPalette: string[];
}

/** Scene-to-chapter grouping config */
export interface ChapterConfig {
  id: string;
  title: string;
  sceneIds: string[];
  description?: string;
}

/** Production artifacts produced by PRODUCE phase */
export interface ProductionArtifacts {
  assembledVideoUrl: string | null;
  sceneVideoUrls: string[];
  audioUrl: string | null;
  captionFiles: { lang: string; srtUrl: string }[];
  thumbnailUrls: string[];
  exportPresets: string[];
  speakerTracks: { speakerId: string; audioUrl: string }[];
}

export interface GenieCastSessionState {
  // Session metadata
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;

  // Project linking (DB-backed tracking)
  projectId: string | null; // cast_projects.id for token/cost tracking

  // Product-first context (unified flow)
  selectedProductId: string | null;
  selectedIntent: string | null; // e.g., 'product-demo', 'hero-banner', 'educational'
  detectedRegion: string; // Auto-detected region from browser
  selectedRegion: string; // User-selected region (may override detection)

  // CREATE stage selections
  selectedStyles: string[];
  selectedTemplate: SelectedTemplate | null;
  approvedMessaging: MessagingContent | null;

  // PRODUCE stage data
  templateMapping: TemplateMapping | null;
  ttsGenerated: boolean;
  avSyncVerified: boolean;

  // Regional config
  targetRegions: RegionZone[];
  selectedDialects: string[];

  // Approval queue
  approvalItems: ApprovalItem[];

  // Current stage tracking
  currentStage: AuthoringStage;
  completedStages: AuthoringStage[];

  // Phase 3: Dynamic discovery state (persists across CREATE/PRODUCE/PUBLISH)
  selectedIndustryCategory: string | null;  // cast_content_categories.id
  selectedFormats: string[];                // cast_content_formats.id[]
  selectedContentTypes: string[];           // cast_content_sub_formats.id[]

  // ============================================
  // CREATE → PRODUCE: Full configuration state
  // (Previously orphaned as local useState in GenieCastConsolidatedTabs)
  // ============================================

  // Content discovery selections
  selectedCategoryId: string | null;        // cast_content_categories.id
  selectedFormatId: string | null;          // cast_content_formats.id
  selectedSubFormatId: string | null;       // cast_content_sub_formats.id
  discoveryChainId: string | null;          // selected pipeline chain

  // Platform & language targeting
  primaryPlatform: string;                  // 'youtube' | 'tiktok' | 'instagram' | etc.
  outputLanguages: string[];                // ['en', 'hi', 'ar', ...]
  dubbingSubtitleLanguages: string[];       // languages for dubbing/subtitles
  selectedDialectCodes: string[];           // full dialect codes like 'en-US', 'hi-IN'

  // Visual configuration
  selectedVisualStyleIds: string[];         // cast_visual_styles.id[] (DB UUIDs)
  selectedCapabilityIds: string[];          // cast_production_capabilities.id[]
  autoSelectedCapIds: string[];             // auto-selected from style rules (user can override)
  selectedCharacterIds: string[];           // cast_style_characters.id[]
  characterFramePercent: number;            // 10-100
  avatarGender: 'male' | 'female' | 'neutral';

  // Production settings
  targetDuration: number;                   // seconds
  selectedAssetSource: string;              // 'generate' | 'upload' | 'pre-uploaded'
  lipSyncEnabled: boolean;
  dubbingEnabled: boolean;
  selectedResolution: string;               // '1920x1080' | '3840x2160' etc.
  selectedAspectRatio: string;              // '16:9' | '9:16' | '1:1' | '4:5'
  productionQuality: 'preview' | 'production' | 'cinematic';
  enrichmentPrompt: string;                 // user's vision/prompt text

  // Multi-output selection (user picks which outputs per format)
  selectedOutputPresets: string[];           // output preset IDs to generate

  // Podcast / dialogue format config
  speakerConfig: SpeakerConfig[] | null;

  // Scene-to-chapter mapping
  chapterGrouping: ChapterConfig[] | null;

  // PRODUCE artifacts (filled during production)
  productionArtifacts: ProductionArtifacts | null;

  // Production mode settings (Phase 6E — multi-mode: avatar, 3D, animation, cinematic)
  productionSettings?: Record<string, unknown>;
}

const STORAGE_KEY = 'genie-cast-session';

const createDefaultSession = (): GenieCastSessionState => ({
  projectId: null,
  sessionId: crypto.randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
  selectedProductId: null,
  selectedIntent: null,
  detectedRegion: 'en',
  selectedRegion: 'en',
  selectedStyles: [],
  selectedTemplate: null,
  approvedMessaging: null,
  templateMapping: null,
  ttsGenerated: false,
  avSyncVerified: false,
  targetRegions: ['global'],
  selectedDialects: ['en-US'],
  approvalItems: [],
  currentStage: 'template_selection',
  completedStages: [],
  selectedIndustryCategory: null,
  selectedFormats: [],
  selectedContentTypes: [],
  // CREATE → PRODUCE config defaults
  selectedCategoryId: null,
  selectedFormatId: null,
  selectedSubFormatId: null,
  discoveryChainId: null,
  primaryPlatform: 'youtube',
  outputLanguages: ['en'],
  dubbingSubtitleLanguages: ['en'],
  selectedDialectCodes: ['en-US'],
  selectedVisualStyleIds: [],
  selectedCapabilityIds: [],
  autoSelectedCapIds: [],
  selectedCharacterIds: [],
  characterFramePercent: 50,
  avatarGender: 'female',
  targetDuration: 60,
  selectedAssetSource: 'generate',
  lipSyncEnabled: true,
  dubbingEnabled: true,
  selectedResolution: '1920x1080',
  selectedAspectRatio: '16:9',
  productionQuality: 'production',
  enrichmentPrompt: '',
  selectedOutputPresets: [],
  speakerConfig: null,
  chapterGrouping: null,
  productionArtifacts: null,
});

// ============================================
// HOOK
// ============================================

export function useGenieCastSession() {
  const [session, setSession] = useState<GenieCastSessionState>(() => {
    // Load from localStorage on init
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...createDefaultSession(),
          ...parsed,
          // Preserve selectedIntent across refreshes so user doesn't lose progress
          selectedIntent: parsed.selectedIntent || null,
          selectedProductId: parsed.selectedProductId || null,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(),
        };
      }
    } catch (e) {
      console.warn('[useGenieCastSession] Failed to load session:', e);
    }
    return createDefaultSession();
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('[useGenieCastSession] Failed to save session:', e);
    }
  }, [session]);

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  const resetSession = useCallback(() => {
    const newSession = createDefaultSession();
    setSession(newSession);
    toast.success('Session reset');
    return newSession;
  }, []);

  const updateSession = useCallback((updates: Partial<GenieCastSessionState>) => {
    setSession(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================
  // PRODUCT & INTENT SELECTION (Product-First Flow)
  // ============================================

  const selectProduct = useCallback((productId: string | null) => {
    setSession(prev => ({
      ...prev,
      selectedProductId: productId,
      updatedAt: new Date(),
    }));
  }, []);

  const selectIntent = useCallback((intent: string | null) => {
    setSession(prev => ({
      ...prev,
      selectedIntent: intent,
      updatedAt: new Date(),
    }));
  }, []);

  const setRegionalContext = useCallback((detectedRegion: string, selectedRegion: string) => {
    setSession(prev => ({
      ...prev,
      detectedRegion,
      selectedRegion,
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================
  // TEMPLATE SELECTION (CREATE > Assets)
  // ============================================

  const selectTemplate = useCallback((template: SelectedTemplate) => {
    setSession(prev => {
      const newApprovalItems = prev.approvalItems.filter(
        item => item.stage !== 'template_selection'
      );
      
      newApprovalItems.push({
        id: template.id,
        stage: 'template_selection',
        title: template.name,
        description: `${template.sceneCount} scenes • ${Math.floor(template.estimatedDuration / 60)}:${String(template.estimatedDuration % 60).padStart(2, '0')}`,
        status: 'approved', // Template selection is auto-approved
        createdAt: new Date(),
        updatedAt: new Date(),
        data: template,
      });

      return {
        ...prev,
        selectedTemplate: template,
        approvalItems: newApprovalItems,
        currentStage: 'messaging_generation',
        completedStages: [...new Set([...prev.completedStages, 'template_selection' as AuthoringStage])],
        updatedAt: new Date(),
      };
    });
    
    toast.success(`Template "${template.name}" selected`);
  }, []);

  const clearTemplate = useCallback(() => {
    setSession(prev => ({
      ...prev,
      selectedTemplate: null,
      approvalItems: prev.approvalItems.filter(item => item.stage !== 'template_selection'),
      currentStage: 'template_selection',
      updatedAt: new Date(),
    }));
    toast.info('Template cleared — select a new one');
  }, []);


  // ============================================
  // STYLES SELECTION (CREATE > Styles)
  // ============================================

  const setSelectedStyles = useCallback((styles: string[]) => {
    setSession(prev => ({
      ...prev,
      selectedStyles: styles,
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================
  // MESSAGING APPROVAL (CREATE > Messaging)
  // ============================================

  const approveMessaging = useCallback((messaging: MessagingContent) => {
    setSession(prev => {
      const newApprovalItems = prev.approvalItems.filter(
        item => item.stage !== 'messaging_generation'
      );
      
      newApprovalItems.push({
        id: messaging.id,
        stage: 'messaging_generation',
        title: 'Marketing Messaging',
        description: `Hook: "${messaging.hook?.substring(0, 50)}..."`,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        data: messaging,
      });

      return {
        ...prev,
        approvedMessaging: { ...messaging, approvalStatus: 'approved' },
        approvalItems: newApprovalItems,
        currentStage: 'script_composition',
        completedStages: [...new Set([...prev.completedStages, 'messaging_generation' as AuthoringStage])],
        updatedAt: new Date(),
      };
    });
    
    toast.success('Messaging approved - ready for script composition');
  }, []);

  const rejectMessaging = useCallback((messagingId: string, reason?: string) => {
    setSession(prev => ({
      ...prev,
      approvalItems: prev.approvalItems.map(item =>
        item.id === messagingId
          ? { ...item, status: 'rejected' as ApprovalStatus, updatedAt: new Date() }
          : item
      ),
      updatedAt: new Date(),
    }));
    
    toast.info('Messaging rejected - revision needed');
  }, []);

  // ============================================
  // TEMPLATE MAPPING (PRODUCE > Studio)
  // ============================================

  const approveTemplateMapping = useCallback((mapping: TemplateMapping) => {
    setSession(prev => {
      const newApprovalItems = prev.approvalItems.filter(
        item => item.stage !== 'template_mapping'
      );
      
      newApprovalItems.push({
        id: mapping.templateId,
        stage: 'template_mapping',
        title: 'Script Mapping',
        description: `${mapping.scenes.length} scenes mapped • ${Math.floor(mapping.totalDuration / 60)}:${String(mapping.totalDuration % 60).padStart(2, '0')}`,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        data: mapping,
      });

      return {
        ...prev,
        templateMapping: mapping,
        approvalItems: newApprovalItems,
        currentStage: 'tts_generation',
        completedStages: [...new Set([...prev.completedStages, 'template_mapping' as AuthoringStage])],
        updatedAt: new Date(),
      };
    });
    
    toast.success('Script mapping approved - ready for TTS generation');
  }, []);

  // ============================================
  // TTS GENERATION (PRODUCE > Studio)
  // ============================================

  const markTTSGenerated = useCallback(() => {
    setSession(prev => {
      const newApprovalItems = prev.approvalItems.filter(
        item => item.stage !== 'tts_generation'
      );
      
      newApprovalItems.push({
        id: 'tts-' + Date.now(),
        stage: 'tts_generation',
        title: 'TTS Audio',
        description: `Generated for ${prev.selectedDialects.length} dialect(s)`,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        ...prev,
        ttsGenerated: true,
        approvalItems: newApprovalItems,
        currentStage: 'av_sync',
        completedStages: [...new Set([...prev.completedStages, 'tts_generation' as AuthoringStage])],
        updatedAt: new Date(),
      };
    });
    
    toast.success('TTS generation complete - verify A/V sync');
  }, []);

  // ============================================
  // A/V SYNC (PRODUCE > Studio)
  // ============================================

  const markAVSyncVerified = useCallback(() => {
    setSession(prev => {
      const newApprovalItems = prev.approvalItems.filter(
        item => item.stage !== 'av_sync'
      );
      
      newApprovalItems.push({
        id: 'avsync-' + Date.now(),
        stage: 'av_sync',
        title: 'A/V Synchronization',
        description: 'All scenes aligned',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        ...prev,
        avSyncVerified: true,
        approvalItems: newApprovalItems,
        currentStage: 'approval',
        completedStages: [...new Set([...prev.completedStages, 'av_sync' as AuthoringStage])],
        updatedAt: new Date(),
      };
    });
    
    toast.success('A/V sync verified - ready for final approval');
  }, []);

  // ============================================
  // REGIONAL CONFIG
  // ============================================

  const setRegionalConfig = useCallback((regions: RegionZone[], dialects: string[]) => {
    setSession(prev => ({
      ...prev,
      targetRegions: regions,
      selectedDialects: dialects,
      updatedAt: new Date(),
    }));
  }, []);

  // ============================================
  // CREATE → PRODUCE CONFIG SETTERS
  // Each setter persists to localStorage automatically via the useEffect.
  // These replace orphaned useState in GenieCastConsolidatedTabs.
  // ============================================

  const setSelectedCategoryId = useCallback((id: string | null) => {
    setSession(prev => ({ ...prev, selectedCategoryId: id, updatedAt: new Date() }));
  }, []);

  const setSelectedFormatId = useCallback((id: string | null) => {
    setSession(prev => ({ ...prev, selectedFormatId: id, updatedAt: new Date() }));
  }, []);

  const setSelectedSubFormatId = useCallback((id: string | null) => {
    setSession(prev => ({ ...prev, selectedSubFormatId: id, updatedAt: new Date() }));
  }, []);

  const setDiscoveryChainId = useCallback((id: string | null) => {
    setSession(prev => ({ ...prev, discoveryChainId: id, updatedAt: new Date() }));
  }, []);

  const setPrimaryPlatform = useCallback((platform: string) => {
    setSession(prev => ({ ...prev, primaryPlatform: platform, updatedAt: new Date() }));
  }, []);

  const setOutputLanguages = useCallback((langs: string[]) => {
    setSession(prev => ({ ...prev, outputLanguages: langs, updatedAt: new Date() }));
  }, []);

  const setDubbingSubtitleLanguages = useCallback((langs: string[]) => {
    setSession(prev => ({ ...prev, dubbingSubtitleLanguages: langs, updatedAt: new Date() }));
  }, []);

  const setSelectedDialectCodes = useCallback((codes: string[]) => {
    setSession(prev => ({ ...prev, selectedDialectCodes: codes, updatedAt: new Date() }));
  }, []);

  const setSelectedVisualStyleIds = useCallback((ids: string[]) => {
    setSession(prev => ({ ...prev, selectedVisualStyleIds: ids, updatedAt: new Date() }));
  }, []);

  const setSelectedCapabilityIds = useCallback((ids: string[]) => {
    setSession(prev => ({ ...prev, selectedCapabilityIds: ids, updatedAt: new Date() }));
  }, []);

  const setAutoSelectedCapIds = useCallback((ids: string[]) => {
    setSession(prev => ({ ...prev, autoSelectedCapIds: ids, updatedAt: new Date() }));
  }, []);

  const setSelectedCharacterIds = useCallback((ids: string[]) => {
    setSession(prev => ({ ...prev, selectedCharacterIds: ids, updatedAt: new Date() }));
  }, []);

  const setCharacterFramePercent = useCallback((pct: number) => {
    setSession(prev => ({ ...prev, characterFramePercent: pct, updatedAt: new Date() }));
  }, []);

  const setAvatarGender = useCallback((gender: 'male' | 'female' | 'neutral') => {
    setSession(prev => ({ ...prev, avatarGender: gender, updatedAt: new Date() }));
  }, []);

  const setTargetDuration = useCallback((seconds: number) => {
    setSession(prev => ({ ...prev, targetDuration: seconds, updatedAt: new Date() }));
  }, []);

  const setSelectedAssetSource = useCallback((source: string) => {
    setSession(prev => ({ ...prev, selectedAssetSource: source, updatedAt: new Date() }));
  }, []);

  const setLipSyncEnabled = useCallback((enabled: boolean) => {
    setSession(prev => ({ ...prev, lipSyncEnabled: enabled, updatedAt: new Date() }));
  }, []);

  const setDubbingEnabled = useCallback((enabled: boolean) => {
    setSession(prev => ({ ...prev, dubbingEnabled: enabled, updatedAt: new Date() }));
  }, []);

  const setSelectedResolution = useCallback((resolution: string) => {
    setSession(prev => ({ ...prev, selectedResolution: resolution, updatedAt: new Date() }));
  }, []);

  const setSelectedAspectRatio = useCallback((ratio: string) => {
    setSession(prev => ({ ...prev, selectedAspectRatio: ratio, updatedAt: new Date() }));
  }, []);

  const setProductionQuality = useCallback((quality: 'preview' | 'production' | 'cinematic') => {
    setSession(prev => ({ ...prev, productionQuality: quality, updatedAt: new Date() }));
  }, []);

  const setEnrichmentPrompt = useCallback((prompt: string) => {
    setSession(prev => ({ ...prev, enrichmentPrompt: prompt, updatedAt: new Date() }));
  }, []);

  const setSelectedOutputPresets = useCallback((presets: string[]) => {
    setSession(prev => ({ ...prev, selectedOutputPresets: presets, updatedAt: new Date() }));
  }, []);

  const setSpeakerConfig = useCallback((config: SpeakerConfig[] | null) => {
    setSession(prev => ({ ...prev, speakerConfig: config, updatedAt: new Date() }));
  }, []);

  const setChapterGrouping = useCallback((chapters: ChapterConfig[] | null) => {
    setSession(prev => ({ ...prev, chapterGrouping: chapters, updatedAt: new Date() }));
  }, []);

  const setProductionArtifacts = useCallback((artifacts: ProductionArtifacts | null) => {
    setSession(prev => ({ ...prev, productionArtifacts: artifacts, updatedAt: new Date() }));
  }, []);

  // ============================================
  // NAVIGATION HELPERS
  // ============================================

  const goToStage = useCallback((stage: AuthoringStage) => {
    setSession(prev => ({
      ...prev,
      currentStage: stage,
      updatedAt: new Date(),
    }));
  }, []);

  const getNextIncompleteStage = useCallback((): AuthoringStage | null => {
    const stageOrder: AuthoringStage[] = [
      'template_selection',
      'messaging_generation',
      'script_composition',
      'template_mapping',
      'tts_generation',
      'av_sync',
      'approval',
      'publishing',
    ];

    for (const stage of stageOrder) {
      if (!session.completedStages.includes(stage)) {
        return stage;
      }
    }
    return null;
  }, [session.completedStages]);

  const isStageComplete = useCallback((stage: AuthoringStage): boolean => {
    return session.completedStages.includes(stage);
  }, [session.completedStages]);

  const canProceedToStage = useCallback((stage: AuthoringStage): boolean => {
    const stageOrder: AuthoringStage[] = [
      'template_selection',
      'messaging_generation',
      'script_composition',
      'template_mapping',
      'tts_generation',
      'av_sync',
      'approval',
      'publishing',
    ];

    const targetIndex = stageOrder.indexOf(stage);
    if (targetIndex === 0) return true;

    // Check if previous stage is complete
    const previousStage = stageOrder[targetIndex - 1];
    return session.completedStages.includes(previousStage);
  }, [session.completedStages]);

  // ============================================
  // APPROVAL QUEUE HELPERS
  // ============================================

  const getPendingApprovals = useCallback((): ApprovalItem[] => {
    return session.approvalItems.filter(item => item.status === 'pending');
  }, [session.approvalItems]);

  const getApprovedItems = useCallback((): ApprovalItem[] => {
    return session.approvalItems.filter(item => item.status === 'approved');
  }, [session.approvalItems]);

  const getApprovalProgress = useCallback(() => {
    const total = 6; // Total approval stages
    const completed = session.completedStages.length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }, [session.completedStages]);

  return {
    session,

    // Session management
    resetSession,
    updateSession,

    // Product & Intent
    selectProduct,
    selectIntent,
    setRegionalContext,

    // Template
    selectTemplate,
    clearTemplate,

    // Styles
    setSelectedStyles,

    // Messaging
    approveMessaging,
    rejectMessaging,

    // Template mapping
    approveTemplateMapping,

    // TTS
    markTTSGenerated,

    // A/V Sync
    markAVSyncVerified,

    // Regional
    setRegionalConfig,

    // CREATE → PRODUCE config setters
    setSelectedCategoryId,
    setSelectedFormatId,
    setSelectedSubFormatId,
    setDiscoveryChainId,
    setPrimaryPlatform,
    setOutputLanguages,
    setDubbingSubtitleLanguages,
    setSelectedDialectCodes,
    setSelectedVisualStyleIds,
    setSelectedCapabilityIds,
    setAutoSelectedCapIds,
    setSelectedCharacterIds,
    setCharacterFramePercent,
    setAvatarGender,
    setTargetDuration,
    setSelectedAssetSource,
    setLipSyncEnabled,
    setDubbingEnabled,
    setSelectedResolution,
    setSelectedAspectRatio,
    setProductionQuality,
    setEnrichmentPrompt,
    setSelectedOutputPresets,
    setSpeakerConfig,
    setChapterGrouping,
    setProductionArtifacts,

    // Navigation
    goToStage,
    getNextIncompleteStage,
    isStageComplete,
    canProceedToStage,

    // Approval queue
    getPendingApprovals,
    getApprovedItems,
    getApprovalProgress,
  };
}

export type GenieCastSessionHook = ReturnType<typeof useGenieCastSession>;
