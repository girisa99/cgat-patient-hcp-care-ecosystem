/**
 * GENIE CAST CONSOLIDATED 3-TAB STRUCTURE
 *
 * Consolidates scattered tabs into a unified linear workflow:
 * - CREATE: Discover → Intent (Category/Format) → Configure (Style/Platform/Enrichment) → Templates → Assets
 * - PRODUCE: Generate (FormatStudioRouter) → Edit (Script/Timeline/Post-Production) → Review (Approve Gate) + Library + Analytics
 * - PUBLISH: Scheduler, Distribution, SEO, A/B Testing (locked until approval)
 *
 * All brand/product context comes via Universal Enrichment (not separate messaging step).
 * This is the SINGLE interface for all Genie Cast functionality.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Camera,
  Video,
  Grid3X3,
  Layers,
  AlertTriangle,
  TrendingUp,
  Eye,
  GitBranch,
  Palette,
  Upload,
  Calendar,
  Share2,
  Search,
  Wand2,
  Film,
  Settings2,
  Play,
  BarChart3,
  FileText,
  Globe,
  LayoutTemplate,
  MessageSquare,
  Image,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateMode } from '@/hooks/useCreateMode';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { useProductContext } from '@/hooks/useProductContext';
import { useContentPool } from '@/hooks/useContentPool';
import { ProductSelector } from './ProductSelector';
import { GlobalRegionSelector } from './GlobalRegionSelector';
import { useGenieCastRegions } from '@/hooks/useGenieCastRegions';
import { REGION_HIERARCHY } from '@/config/regionHierarchy';
import { ZONE_PROVIDER_DISPLAY, getZoneFromRegion } from '@/config/regional-routing-registry';
import { useGuideStore } from '@/stores/guideStore';
import { QuickStartCard, CreateStepProgress, CreateModeToggle, IntentSelector, CreateConfigureStep, CreateSessionSummary, DocumentImportPanel, type CreateStep } from './create';
import { ProduceEditStep, ProduceReviewStep } from './produce';
import { CreateHeroBanner } from './create/CreateHeroBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
// Select components now used in CreateConfigureStep
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import unified authoring system
import { useUnifiedAuthoring, type AuthoringStage, type TemplateMapping, type SceneScript } from '@/hooks/useUnifiedAuthoring';
import { useBlueprintDraft } from '@/hooks/useBlueprintDraft';
import { styleIntentResolver } from '@/services/styleIntentResolver';
import { useGenieCastSession } from '@/hooks/useGenieCastSession';
import { useCastProjects } from '@/hooks/useCastProjects';
import { CastProjectDropdown } from './CastProjectDropdown';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
import { useCastContentRegistry } from '@/hooks/useCastContentRegistry';
import { DynamicContentSelector } from './DynamicContentSelector';
import { RegionalDialectSelector } from '@/components/shared/RegionalDialectSelector';
import type { StyleIntent, RegionZone } from '@/services/styleIntentResolver';

// Import Phase 2 Routing Transparency
import { useAIRoutingIntelligence } from '@/hooks/useAIRoutingIntelligence';

// Import Holiday Awareness
import { useHolidayAwareness } from '@/hooks/useHolidayAwareness';

// Production pipeline hook
import { useCastProduction } from '@/hooks/useCastProduction';

// Import Content Library component
import { ContentLibraryGrid } from './ContentLibraryGrid';

// Import new fully-implemented tab components
import { SmartSchedulerPanel } from './SmartSchedulerPanel';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ContentRepurposingPanel } from './ContentRepurposingPanel';
import { DistributionPanel } from './DistributionPanel';
import { EP04PublishHub } from './EP04PublishHub';
import { SceneCharacterVisualizer } from './SceneCharacterVisualizer';
import { SEOOptimizerPanel } from './SEOOptimizerPanel';
import { ABTestingPanel } from './ABTestingPanel';
import { createEP04SessionSeed, getEP04Stats, enrichWithScreenAssets } from '@/utils/ep04-session-seed';

// Import Landing Page Scripts
import { LandingPageScriptsPanel } from './LandingPageScriptsPanel';
import { RegionalAssetsLab } from './RegionalAssetsLab';
import { HeroBannerCarouselMode } from './HeroBannerCarouselMode';

// Import sub-components DIRECTLY to avoid circular dependency (index.ts re-exports this file)
import { GenieCastOverview } from './GenieCastOverview';
import { VideoStyleCards, type VideoStyleType } from './VideoStyleCards';
import { CreateContextSelector } from './CreateContextSelector';
import { AIProviderShowcase } from './AIProviderShowcase';
import { MultiScreenshotGallery, type ProductGallery } from '../MultiScreenshotGallery';
import { VideoGenerationMatrix } from '../VideoGenerationMatrix';
// MessagingGeneratorPanel removed — enrichment handles brand/product context
import { ProductChangeAlertPanel } from '../ProductChangeAlertPanel';
// GenieCastFlowDiagram: available via admin panel, not embedded in PRODUCE flow
import { GenieCastHubMockup } from './mockups';
import { BrandAssetsPanel } from './BrandAssetsPanel';
import { BlueprintTemplatesGrid } from './BlueprintTemplatesGrid';
import { WorkflowContextBanner } from './WorkflowContextBanner';
// StyleDrivenProductionConfig: config now handled in CREATE > Configure step
import { type ProductionCapability } from '@/services/marketing/aiMessagingGeneratorService';
// ScriptPreviewPanel: consolidated into SceneScriptAIPanel + ScriptTemplateMapper
import { CreateSubWizard } from './CreateSubWizard';

// Phase 5: Multi-format production routing
import { FormatStudioRouter } from './FormatStudioRouter';
// Phase 7: Regional coverage dashboard — now in ProduceReviewStep

// Phase 5E: Podcast-to-Video production
import { PodcastToVideoConverter } from '@/components/production';

// P1: Universal Video Editing + Distribution
import { ExportDistributionPanel } from './editing';
import { useVideoTimeline } from '@/hooks/video-editing/useVideoTimeline';
import { useClipOperations } from '@/hooks/video-editing/useClipOperations';
import { usePlatformExport } from '@/hooks/video-editing/usePlatformExport';
import { useAVSync } from '@/hooks/video-editing/useAVSync';
import { useProductionSession } from '@/hooks/video-editing/useProductionSession';

// Architecture B: Unified Create flow (Discovery + 8-step wizard)
import { CreateDiscovery, CreateFlowWizard } from '@/components/create-flow';

/**
 * Detect transcreation zone from dialect code.
 * Aligned with master-provider-routing-registry.ts:
 * - Claude Zone (Western/EU/LATAM) → claude
 * - Alibaba Zone (CJK/MENA) → qwen-max
 * - Gemini Zone (India/SEA/Africa) → gemini
 * - GPT-4o → FALLBACK only
 */
function detectTranscreationZone(dialectCode: string): string {
  if (!dialectCode) return 'global';
  const prefix = dialectCode.split('-')[0]?.toLowerCase();
  // MENA / RTL → Alibaba Zone
  if (['ar', 'he', 'fa', 'tr'].includes(prefix) || dialectCode.startsWith('ar-')) return 'mena';
  // CJK → Alibaba Zone
  if (['zh', 'ja', 'ko'].includes(prefix)) return 'cjk';
  // India / South Asia → Gemini Zone
  if (['hi', 'te', 'ta', 'bn', 'ur', 'mr', 'gu', 'pa', 'ml', 'kn'].includes(prefix)) return 'india';
  // SEA → Gemini Zone
  if (['id', 'ms', 'th', 'vi', 'tl', 'my'].includes(prefix)) return 'sea';
  // Africa → Gemini Zone
  if (['sw', 'yo', 'am', 'ha', 'ig'].includes(prefix)) return 'africa';
  // Europe → Claude Zone
  if (['fr', 'de', 'it', 'nl', 'pl', 'ru', 'uk', 'sv', 'da', 'no', 'fi', 'el', 'ro', 'cs'].includes(prefix)) return 'europe';
  // LATAM → Claude Zone
  if (['es', 'pt'].includes(prefix)) return 'latam';
  // Western English → Claude Zone
  if (['en'].includes(prefix)) return 'western';
  return 'global';
}

// Import master registry for metrics
import { 
  MASTER_AI_PROVIDERS, 
  MASTER_VIDEO_STYLES, 
  MASTER_MARKETING_PIPELINES,
  getPipelinesByTab,
  calculateEcosystemMetrics,
} from '@/config/master-ecosystem-registry';

// STAGE 2: 3-Tab Consolidated Structure (CREATE, PRODUCE, PUBLISH)
// PRODUCE now has clear linear steps: Generate → Edit → Review  (+ secondary: Library, Analytics)
export type ConsolidatedTab = 'create' | 'produce' | 'publish';
export type CreateSubTab = 'discover' | 'intent' | 'configure' | 'templates' | 'assets';
export type ProduceSubTab = 'generate' | 'edit' | 'review' | 'library' | 'analytics';
export type PublishSubTab = 'scheduler' | 'distribution' | 'seo' | 'testing';

interface GenieCastConsolidatedTabsProps {
  // State from parent
  selectedVideoStyles: VideoStyleType[];
  onStylesChange: (styles: VideoStyleType[]) => void;
  screenshotGalleries: ProductGallery[];
  onGalleriesUpdated: (galleries: ProductGallery[]) => void;
  totalScreenshots: number;
  
  // Generation callbacks
  onGenerate: () => void;
  isGenerating: boolean;
  
  // Unified authoring callbacks (optional - for cross-product use)
  onAuthoringStageChange?: (stage: string) => void;
  onMessagingApproved?: (messaging: any) => void;
  onScriptApproved?: (mapping: any) => void;
  
  // Optional: For navigation from other components
  defaultTab?: ConsolidatedTab;
  defaultSubTab?: string;

  /** When true, hides the main 3-tab navigation (wizard sidebar controls it instead) */
  wizardMode?: boolean;
  /** Externally controlled active main tab (used by wizard) */
  activeMainTabOverride?: ConsolidatedTab;
  /** Called when consolidated tabs wants to change the main tab (so wizard can sync) */
  onMainTabChange?: (tab: ConsolidatedTab) => void;
}

// STAGE 1: Consolidated 3-Tab Structure
// CREATE → PRODUCE → PUBLISH (MANAGE & LANDING consolidated into these)
const TAB_DEFINITIONS = {
  create: {
    label: 'CREATE',
    icon: Sparkles,
    description: 'Discover, Configure & Build',
    activeColor: 'bg-orange-600 text-white border-orange-600',
    inactiveColor: 'border-orange-300 text-orange-700 hover:bg-orange-50',
    subTabs: [
      { id: 'discover', label: 'Discover', icon: Globe, description: '9 categories, 42 pipelines — what do you want to create?' },
      { id: 'intent', label: 'Intent', icon: Sparkles, description: 'What are you creating?' },
      { id: 'configure', label: 'Style & Enrichment', icon: Palette, description: 'Visual style, enrichment & resolution' },
      { id: 'templates', label: 'Templates', icon: LayoutTemplate, description: 'Select a blueprint' },
      { id: 'assets', label: 'Assets', icon: Image, description: 'Hero Banners, Assets Lab, Brand Assets' },
    ],
  },
  produce: {
    label: 'PRODUCE',
    icon: Video,
    description: 'Generate → Edit → Review',
    activeColor: 'bg-blue-600 text-white border-blue-600',
    inactiveColor: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    subTabs: [
      { id: 'generate', label: '1. Generate', icon: Play, description: 'Format-specific content generation' },
      { id: 'edit', label: '2. Edit', icon: Film, description: 'Script editing, timeline & post-production' },
      { id: 'review', label: '3. Review', icon: Eye, description: 'Quality review & approval gate' },
      { id: 'library', label: 'Library', icon: Layers, description: 'Content library' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance metrics' },
    ],
  },
  publish: {
    label: 'PUBLISH',
    icon: Share2,
    description: 'Schedule, Distribute & Optimize',
    activeColor: 'bg-purple-600 text-white border-purple-600',
    inactiveColor: 'border-purple-300 text-purple-700 hover:bg-purple-50',
    subTabs: [
      { id: 'scheduler', label: 'Schedule', icon: Calendar, description: 'Content calendar' },
      { id: 'distribution', label: 'Distribute', icon: Share2, description: 'Multi-platform publishing' },
      { id: 'seo', label: 'SEO', icon: Search, description: 'Search optimization' },
      { id: 'testing', label: 'A/B Test', icon: Wand2, description: 'Variation testing' },
    ],
  },
};

export const GenieCastConsolidatedTabs: React.FC<GenieCastConsolidatedTabsProps> = ({
  selectedVideoStyles,
  onStylesChange,
  screenshotGalleries,
  onGalleriesUpdated,
  totalScreenshots,
  onGenerate,
  isGenerating,
  defaultTab = 'create',
  defaultSubTab,
  onAuthoringStageChange,
  onMessagingApproved,
  onScriptApproved,
  wizardMode = false,
  activeMainTabOverride,
  onMainTabChange,
}) => {
  const [activeMainTabInternal, setActiveMainTabInternal] = useState<ConsolidatedTab>(defaultTab);
  
  // Use override when in wizard mode
  const activeMainTab = wizardMode && activeMainTabOverride ? activeMainTabOverride : activeMainTabInternal;
  const setActiveMainTab = useCallback((tab: ConsolidatedTab) => {
    setActiveMainTabInternal(tab);
    onMainTabChange?.(tab);
  }, [onMainTabChange]);
  
  // Smart sub-tab init: if session already has progress, skip past intent
  const [subTabs, setSubTabs] = useState<Record<ConsolidatedTab, string>>(() => {
    try {
      const stored = localStorage.getItem('genie-cast-session');
      if (stored) {
        const parsed = JSON.parse(stored);
        // If template already selected, go to templates; if intent set, go to configure; otherwise start at intent
        const createSub = (parsed.selectedTemplate || parsed.approvedMessaging) ? 'templates' : parsed.selectedIntent ? 'configure' : 'discover';
        return { create: createSub, produce: 'generate', publish: 'scheduler' };
      }
    } catch {}
    return { create: defaultSubTab || 'discover', produce: 'generate', publish: 'scheduler' };
  });

  // Initialize unified authoring hook for cross-functional workflow
  const authoring = useUnifiedAuthoring({
    productContext: 'cast',
    initialStyleIntent: 'product-hero',
    initialRegions: ['global'],
    initialDialects: ['en-US'],
    onStageChange: (stage) => {
      onAuthoringStageChange?.(stage);
      console.log('[GenieCastConsolidatedTabs] Authoring stage:', stage);
    },
    onMessagingApproved,
    onScriptApproved,
  });

  // Initialize session state for CREATE → PRODUCE data handoff
  const castSession = useGenieCastSession();

  // Cast projects for dropdown
  const castProjects = useCastProjects();
  const persistence = useCastProjectPersistence();
  const [activeContentType, setActiveContentType] = useState<string>('video');

  // Dynamic content registry (DB-driven categories + formats)
  const contentRegistry = useCastContentRegistry();

  // P1: Universal Video Timeline + Export hooks
  const videoTimeline = useVideoTimeline();
  const clipOps = useClipOperations(videoTimeline);
  const platformExport = usePlatformExport();

  // P2: A/V Sync engine (audio-video alignment, pre-render validation, teleprompter)
  const avSync = useAVSync(videoTimeline);

  // P3: Unified Production Session — bridges script→TTS→video→timeline for all formats
  const productionSession = useProductionSession(videoTimeline);

  // Production pipeline — real generation (replaces console.log stubs)
  const production = useCastProduction();

  const guideDispatch = useGuideStore((s) => s.dispatch);

  // All CREATE config state now lives in castSession (persistent).
  // Destructure for convenience — these read from session and write via setters.
  const selectedCategoryId = castSession.session.selectedCategoryId;
  const setSelectedCategoryId = castSession.setSelectedCategoryId;
  const selectedFormatId = castSession.session.selectedFormatId;
  const setSelectedFormatId = castSession.setSelectedFormatId;
  const selectedSubFormatId = castSession.session.selectedSubFormatId;
  const setSelectedSubFormatId = castSession.setSelectedSubFormatId;
  const enrichmentPrompt = castSession.session.enrichmentPrompt;
  const setEnrichmentPrompt = castSession.setEnrichmentPrompt;
  const selectedResolution = castSession.session.selectedResolution;
  const setSelectedResolution = castSession.setSelectedResolution;
  const selectedAspectRatio = castSession.session.selectedAspectRatio;
  const setSelectedAspectRatio = castSession.setSelectedAspectRatio;
  const selectedVisualStyleIds = castSession.session.selectedVisualStyleIds;
  const setSelectedVisualStyleIds = castSession.setSelectedVisualStyleIds;
  const selectedCapabilityIds = castSession.session.selectedCapabilityIds;
  const setSelectedCapabilityIds = castSession.setSelectedCapabilityIds;
  const autoSelectedCapIds = castSession.session.autoSelectedCapIds;
  const setAutoSelectedCapIds = castSession.setAutoSelectedCapIds;
  const selectedCharacterIds = castSession.session.selectedCharacterIds;
  const setSelectedCharacterIds = castSession.setSelectedCharacterIds;
  // Character picker popup state (UI-only, no persistence needed)
  const [characterPickerOpen, setCharacterPickerOpen] = useState(false);
  const characterFramePercent = castSession.session.characterFramePercent;
  const setCharacterFramePercent = castSession.setCharacterFramePercent;
  const targetDuration = castSession.session.targetDuration;
  const setTargetDuration = castSession.setTargetDuration;
  const selectedAssetSource = castSession.session.selectedAssetSource;
  const setSelectedAssetSource = castSession.setSelectedAssetSource;
  const lipSyncEnabled = castSession.session.lipSyncEnabled;
  const setLipSyncEnabled = castSession.setLipSyncEnabled;
  const dubbingEnabled = castSession.session.dubbingEnabled;
  const setDubbingEnabled = castSession.setDubbingEnabled;
  const primaryPlatform = castSession.session.primaryPlatform;
  const setPrimaryPlatform = castSession.setPrimaryPlatform;
  const outputLanguages = castSession.session.outputLanguages;
  const setOutputLanguages = castSession.setOutputLanguages;
  const dubbingSubtitleLanguages = castSession.session.dubbingSubtitleLanguages;
  const setDubbingSubtitleLanguages = castSession.setDubbingSubtitleLanguages;
  // Regional detection for auto-region context
  const regionalDetection = useRegionalDetection();

  // Global persistent multi-region selection (header-level context)
  const genieCastRegions = useGenieCastRegions();

  // Holiday awareness for seasonal content suggestions
  const holidayAwareness = useHolidayAwareness(
    regionalDetection.selectedRegion,
    genieCastRegions.selectedCodes?.[0]
  );

  // Content Pool - unified data layer for all tabs
  const { pool, isLoading: isPoolLoading } = useContentPool();

  // Product context for loading associated assets
  const productContext = useProductContext(castSession.session.selectedProductId);

  // Handle product selection from the top-bar picker
  const handleProductSelect = useCallback((productId: string) => {
    castSession.selectProduct(productId);
  }, [castSession]);

  // Auto-select first product if none selected and products are loaded
  const selectProduct = castSession.selectProduct;
  React.useEffect(() => {
    if (!isPoolLoading && pool?.products?.length && !castSession.session.selectedProductId) {
      selectProduct(pool.products[0].id);
    }
  }, [isPoolLoading, pool?.products, castSession.session.selectedProductId, selectProduct]);

  // Initialize regional context on mount or when detection completes
  // NOTE: castSession.setRegionalContext is stable (useCallback), but castSession object
  // itself changes on every state update. Use only the setter in deps to avoid infinite loop.
  const setRegionalCtx = castSession.setRegionalContext;
  React.useEffect(() => {
    if (!regionalDetection.isLoading) {
      setRegionalCtx(
        regionalDetection.detectedRegion,
        regionalDetection.selectedRegion
      );
    }
  }, [regionalDetection.detectedRegion, regionalDetection.selectedRegion, regionalDetection.isLoading, setRegionalCtx]);

  // Load blueprint draft scenes for customization
  const blueprintDraft = useBlueprintDraft(
    castSession.session.selectedTemplate?.id ?? null,
    [] // original scenes — draft will override if available
  );

  // Auto-populate authoring.templateMapping from draft scenes when template selected
  const setTemplateMappingRef = authoring.setTemplateMapping;
  React.useEffect(() => {
    const template = castSession.session.selectedTemplate;
    if (!template || authoring.state.templateMapping) return;

    const draftScenes = blueprintDraft.scenes;
    if (draftScenes && draftScenes.length > 0) {
      const region = castSession.session.selectedRegion || 'global';
      const resolved = styleIntentResolver.resolve(
        template.styleIntent || 'corporate',
        region as any
      );

      const sceneScripts: SceneScript[] = draftScenes.map((scene: any) => {
        let scriptText = scene.script_template || '';
        const messaging = castSession.session.approvedMessaging;
        if (messaging && scriptText) {
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
          sourceType: messaging ? 'messaging' as const : 'template' as const,
          durationSeconds: scene.duration_seconds,
          minDuration: scene.min_duration_seconds,
          maxDuration: scene.max_duration_seconds,
          ttsConfig: {
            provider: resolved.ttsProvider,
            speed: 1.0,
            pitch: 1.0,
          },
          approvalStatus: 'draft' as const,
        };
      });

      const mapping: TemplateMapping = {
        templateId: template.id,
        templateName: template.name,
        scenes: sceneScripts,
        totalDuration: sceneScripts.reduce((sum, s) => sum + s.durationSeconds, 0),
        styleIntent: template.styleIntent || 'corporate',
        resolvedProviders: {
          image: resolved.imageProvider.primary,
          video: resolved.videoProvider.primary,
          tts: resolved.ttsProvider,
          llm: resolved.llmProvider,
        },
      };

      setTemplateMappingRef(mapping);
      console.log('[GenieCast] Auto-populated templateMapping from draft scenes:', sceneScripts.length, 'scenes');
    }
  }, [
    castSession.session.selectedTemplate?.id,
    blueprintDraft.scenes,
    authoring.state.templateMapping,
    castSession.session.approvedMessaging,
    castSession.session.selectedRegion,
    setTemplateMappingRef,
  ]);

  // ── Auto-save-as-you-go: persist scenes/lines to DB when template mapping changes ──
  const autoSaveRef = persistence.autoSave;
  React.useEffect(() => {
    const projectId = castSession.session.projectId;
    const mapping = authoring.state.templateMapping;
    if (!projectId || !mapping || !mapping.scenes?.length) return;

    // Convert templateMapping scenes → DB persistence format
    const scenes = mapping.scenes.map((scene, idx) => ({
      project_id: projectId,
      scene_key: scene.sceneKey,
      title: scene.title,
      scene_index: idx,
      duration_seconds: scene.durationSeconds,
      scene_config: {
        sourceType: scene.sourceType,
        ttsConfig: scene.ttsConfig,
        minDuration: scene.minDuration,
        maxDuration: scene.maxDuration,
      } as Record<string, unknown>,
    }));

    const scriptLines = mapping.scenes.flatMap((scene, _sIdx) => 
      // Each scene has a single script block — persist as one line per scene
      [{
        project_id: projectId,
        scene_id: scene.sceneKey, // Resolved to UUID by hook
        line_key: `${scene.sceneKey}-script`,
        line_index: scene.orderIndex,
        character_id: 'narrator', // Default; overridden when characters are assigned
        dialogue: scene.scriptText || '',
        direction: null,
        motion: null,
        duration_hint: `${scene.durationSeconds}s`,
        line_config: {
          approvalStatus: scene.approvalStatus,
          sourceType: scene.sourceType,
        } as Record<string, unknown>,
      }]
    );

    autoSaveRef(projectId, { scenes, scriptLines, characters: [] });
  }, [
    castSession.session.projectId,
    authoring.state.templateMapping,
    autoSaveRef,
  ]);


  // These now read/write from persistent session state
  const selectedDialectCodes = castSession.session.selectedDialectCodes;
  const setSelectedDialectCodes = castSession.setSelectedDialectCodes;
  const avatarGender = castSession.session.avatarGender;
  const setAvatarGender = castSession.setAvatarGender;
  const productionQuality = castSession.session.productionQuality;
  const setProductionQuality = castSession.setProductionQuality;

  // Phase 2: AI Routing Intelligence for Studio transparency
  const routing = useAIRoutingIntelligence();

  // Production Setup internal section state (UI-only, no persistence needed)
  const [productionSection, setProductionSection] = useState<'styles' | 'assets' | 'regional'>('styles');

  // Discovery chain from persistent session
  const discoveryChainId = castSession.session.discoveryChainId;
  const setDiscoveryChainId = castSession.setDiscoveryChainId;

  // Simple/Advanced mode for CREATE tab
  const createMode = useCreateMode();

  const metrics = calculateEcosystemMetrics();

  const handleNavigateToStage = useCallback((
    stage: AuthoringStage, 
    tab: 'create' | 'produce' | 'publish', 
    subTab: string
  ) => {
    setActiveMainTab(tab as ConsolidatedTab);
    setSubTabs(prev => ({ ...prev, [tab]: subTab }));
    authoring.goToStage(stage);
    castSession.goToStage(stage);
  }, [authoring, castSession]);

  const setSubTab = useCallback((mainTab: ConsolidatedTab, subTab: string) => {
    setSubTabs(prev => ({ ...prev, [mainTab]: subTab }));
  }, []);

  // Unified navigation for WorkflowContextBanner
  const handleBannerNavigate = useCallback((mainTab: string, subTab: string) => {
    setActiveMainTab(mainTab as ConsolidatedTab);
    setSubTabs(prev => ({ ...prev, [mainTab]: subTab }));
  }, []);

  // Handle dialect selection change
  const handleDialectChange = useCallback((dialectCodes: string[]) => {
    setSelectedDialectCodes(dialectCodes);
    authoring.setSelectedDialects(dialectCodes);
    
    // Infer regions from dialects
    const regions = new Set<RegionZone>();
    dialectCodes.forEach(code => {
      if (code.startsWith('ar-')) regions.add('mena');
      else if (['zh-CN', 'ja-JP', 'ko-KR'].includes(code)) regions.add('cjk');
      else if (['hi-IN', 'te-IN', 'ta-IN', 'kn-IN', 'bn-IN'].includes(code)) regions.add('india');
      else if (['es-MX', 'pt-BR', 'es-ES'].includes(code)) regions.add('latam');
      else regions.add('global');
    });
    authoring.setTargetRegions(Array.from(regions) as RegionZone[]);
  }, [authoring]);

  // ============================================
  // CRITICAL BRIDGE: Initialize production session from template mapping.
  // When authoring completes template mapping (CREATE), production session
  // needs to be populated so PRODUCE sub-tabs (teleprompter, timeline, etc.)
  // have scene data to work with.
  // ============================================
  const initFromMappingRef = productionSession.initializeFromMapping;
  React.useEffect(() => {
    const mapping = authoring.state.templateMapping;
    if (mapping && productionSession.session.totalScenes === 0) {
      const formatName = castSession.session.selectedFormatId || 'video';
      initFromMappingRef(mapping, formatName);
      console.log('[GenieCast] Initialized production session from template mapping:', mapping.scenes.length, 'scenes');
    }
  }, [authoring.state.templateMapping, productionSession.session.totalScenes, castSession.session.selectedFormatId, initFromMappingRef]);

  const currentMainDef = TAB_DEFINITIONS[activeMainTab];
  const currentSubTab = subTabs[activeMainTab];

  // Get active pipelines for current tab
  const activePipelines = getPipelinesByTab(activeMainTab.toUpperCase() as any).filter(p => p.isActive);
  const inactivePipelines = getPipelinesByTab(activeMainTab.toUpperCase() as any).filter(p => !p.isActive);

  // Derive product context from session for auto-populating assets
  const selectedProductId = castSession.session.approvedMessaging?.productId || 
    castSession.session.selectedTemplate?.category || undefined;

  // Derive production capability from template capabilities
  const derivedProductionCapability = useMemo((): ProductionCapability | undefined => {
    const caps = castSession.session.selectedTemplate?.capabilities;
    if (!caps) return undefined;
    if (caps.avatar || caps.lipsync) return 'avatar_lipsync';
    if (caps['3d'] || caps.arVr) return '3d_vr';
    if (caps.animation) return 'motion_graphics';
    return undefined;
  }, [castSession.session.selectedTemplate?.capabilities]);

  // ─── Reusable region hierarchy selector for Script / Dubbing splits ───
  const renderRegionHierarchySelector = useCallback((
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    variant: 'script' | 'dubbing'
  ) => {
    const triggerLabel = selected.length === 0
      ? `Select ${variant === 'script' ? 'script' : 'dubbing/subtitle'} languages…`
      : `${selected.length} language${selected.length > 1 ? 's' : ''} selected`;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs font-normal">
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0 z-50 bg-popover" align="start">
          <ScrollArea className="h-[360px]">
            <div className="p-2 space-y-1">
              {/* Selected summary */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1 pb-2 border-b border-border mb-2">
                  {selected.map(code => (
                    <Badge key={code} variant="default" className="text-[10px] gap-1 cursor-pointer" onClick={() => setSelected(prev => prev.filter(l => l !== code))}>
                      {code.toUpperCase()} ×
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-[10px] cursor-pointer text-destructive" onClick={() => setSelected([])}>
                    Clear all ×
                  </Badge>
                </div>
              )}

              {/* Region hierarchy */}
              {REGION_HIERARCHY.map(group => {
                const zone = getZoneFromRegion(group.groupCode);
                const zd = ZONE_PROVIDER_DISPLAY[zone] || ZONE_PROVIDER_DISPLAY.fallback;
                const provLabel = variant === 'script'
                  ? `${zd.llmModel} · ${zd.translationProvider === 'deepl' ? 'DeepL' : zd.translationProvider === 'qwen_mt' ? 'Qwen-MT' : zd.translationProvider === 'azure_translator' ? 'Azure Translator' : 'Google Translate'}`
                  : `${zd.ttsProvider === 'alibaba_qwen3_tts' ? 'Qwen3-TTS' : zd.ttsProvider === 'azure' ? 'Azure Neural' : zd.ttsProvider} · ${zd.translationProvider === 'deepl' ? 'DeepL' : zd.translationProvider === 'qwen_mt' ? 'Qwen-MT' : zd.translationProvider === 'azure_translator' ? 'Azure Translator' : 'Google Translate'}`;

                const groupLeafCodes: string[] = group.children.flatMap(c =>
                  c.children && c.children.length > 0 ? c.children.map(gc => gc.code) : [c.code]
                );
                const allSel = groupLeafCodes.length > 0 && groupLeafCodes.every(c => selected.includes(c));
                const someSel = groupLeafCodes.some(c => selected.includes(c));

                return (
                  <div key={group.groupCode} className="mb-1">
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-[11px] font-semibold transition-colors",
                        allSel ? "bg-primary/10 text-primary" : someSel ? "bg-muted" : "hover:bg-muted/50"
                      )}
                      onClick={() => {
                        setSelected(prev => allSel
                          ? prev.filter(c => !groupLeafCodes.includes(c))
                          : [...new Set([...prev, ...groupLeafCodes])]
                        );
                      }}
                    >
                      <span>{group.groupFlag}</span>
                      <span className="flex-1">{group.groupName}</span>
                      <span className="text-[9px] text-muted-foreground font-normal truncate max-w-[160px]">{provLabel}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {groupLeafCodes.filter(c => selected.includes(c)).length}/{groupLeafCodes.length}
                      </span>
                    </button>

                    <div className="ml-3 mt-0.5 space-y-0.5">
                      {group.children.map(zoneItem => {
                        if (zoneItem.children && zoneItem.children.length > 0) {
                          const zoneCodes = zoneItem.children.map(gc => gc.code);
                          const zAllSel = zoneCodes.every(c => selected.includes(c));
                          const zSomeSel = zoneCodes.some(c => selected.includes(c));
                          return (
                            <div key={zoneItem.code}>
                              <button
                                type="button"
                                className={cn(
                                  "w-full flex items-center gap-1.5 px-2 py-0.5 rounded text-left text-[10px] transition-colors",
                                  zAllSel ? "bg-primary/5 font-medium" : zSomeSel ? "bg-muted/40" : "hover:bg-muted/30"
                                )}
                                onClick={() => {
                                  setSelected(prev => zAllSel
                                    ? prev.filter(c => !zoneCodes.includes(c))
                                    : [...new Set([...prev, ...zoneCodes])]
                                  );
                                }}
                              >
                                <span>{zoneItem.flag}</span>
                                <span className="flex-1">{zoneItem.name}</span>
                                <span className="text-[9px] text-muted-foreground font-mono">{zoneCodes.filter(c => selected.includes(c)).length}/{zoneCodes.length}</span>
                              </button>
                              <div className="ml-4 flex flex-wrap gap-1 py-0.5">
                                {zoneItem.children.map(leaf => (
                                  <Badge
                                    key={leaf.code}
                                    variant={selected.includes(leaf.code) ? 'default' : 'outline'}
                                    className="text-[9px] cursor-pointer transition-colors"
                                    onClick={() => setSelected(prev =>
                                      prev.includes(leaf.code) ? prev.filter(l => l !== leaf.code) : [...prev, leaf.code]
                                    )}
                                  >
                                    {leaf.flag} {leaf.name.split('(')[0].trim()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <Badge
                            key={zoneItem.code}
                            variant={selected.includes(zoneItem.code) ? 'default' : 'outline'}
                            className="text-[9px] cursor-pointer transition-colors mr-1 mb-0.5"
                            onClick={() => setSelected(prev =>
                              prev.includes(zoneItem.code) ? prev.filter(l => l !== zoneItem.code) : [...prev, zoneItem.code]
                            )}
                          >
                            {zoneItem.flag} {zoneItem.name.split('(')[0].trim()}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  }, []);

  return (
    <div className="space-y-0 h-full flex flex-col">
      {/* ── Modern SaaS Top Bar ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border/15 bg-background/95 backdrop-blur-xl sticky top-0 z-20">
        {/* Region context */}
        <GlobalRegionSelector regions={genieCastRegions} />
        
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 h-8 px-3 rounded-lg bg-muted/30 border border-border/20 text-muted-foreground">
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search projects, assets, AI...</span>
          </div>
        </div>
        
        {/* Spacer */}
        <div className="flex-1" />

        {/* Product selector */}
        <ProductSelector
          products={pool?.products || []}
          selectedProductId={castSession.session.selectedProductId}
          onProductChange={handleProductSelect}
          isLoading={isPoolLoading}
        />

        {/* EP04 loader */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-medium border-border/30 h-8 rounded-lg"
          onClick={async () => {
            try {
              toast.info('Loading EP04 project...');
              const seed = createEP04SessionSeed();
              let projectId: string | null = null;
              try {
                const { createCastProject } = await import('@/services/productionCostAccumulator');
                projectId = await createCastProject({
                  title: 'EP04 — Genie Reel Episode 2',
                  description: 'AI-powered cinematic product demo',
                  estimatedTokens: 850000,
                  productContext: 'genie-reel-ep04',
                  quality: 'cinematic',
                  metadata: { episodeId: 'ep04', scenes: Object.keys(seed.templateMapping?.scenes || {}).length },
                });
              } catch (projErr) {
                console.warn('EP04: Could not create project tracker, continuing without:', projErr);
              }
              castSession.updateSession({ ...seed, projectId: projectId || undefined });
              const stats = getEP04Stats();
              toast.success(`EP04 loaded: ${stats.scenes} scenes, ${stats.scriptLines} lines, ${stats.formattedDuration}`);
              if (projectId) toast.success('Project created — token tracking active');
              const techCategory = contentRegistry.categories.find(c => c.name === 'technology');
              if (techCategory) setSelectedCategoryId(techCategory.id);
              const videoFormat = contentRegistry.formats.find(f => f.name === 'video');
              if (videoFormat) {
                setSelectedFormatId(videoFormat.id);
                setActiveContentType(videoFormat.name);
              }
              setPrimaryPlatform('youtube');
              setOutputLanguages(['en']);
              setSelectedDialectCodes(['en-US']);
              const cinematicStyle = contentRegistry.visualStyles.find(s => s.name === 'cinematic');
              if (cinematicStyle) setSelectedVisualStyleIds([cinematicStyle.id]);
              const ep04Caps = ['avatar_talking_head', 'lip_sync', 'scene_voiceover', 'screen_recording', 'text_to_video'];
              const matchedCapIds = contentRegistry.productionCapabilities
                .filter(c => ep04Caps.includes(c.name))
                .map(c => c.id);
              if (matchedCapIds.length > 0) setSelectedCapabilityIds(matchedCapIds);
              setSelectedAssetSource('screen_capture');
              setLipSyncEnabled(true);
              setDubbingEnabled(false);
              setSelectedResolution('1920x1080');
              setSelectedAspectRatio('16:9');
              setProductionQuality('cinematic');
              if (seed.templateMapping) {
                try {
                  const { mapping, stats: screenStats } = await enrichWithScreenAssets(seed.templateMapping);
                  castSession.updateSession({ templateMapping: mapping });
                  if (screenStats.found > 0) toast.success(`${screenStats.found}/${screenStats.total} screenshots resolved`);
                  if (screenStats.missing.length > 0) toast.info(`${screenStats.missing.length} screenshots pending capture`, { description: screenStats.missing.slice(0, 3).join(', ') + (screenStats.missing.length > 3 ? '...' : '') });
                } catch (enrichErr) {
                  console.warn('EP04: Screen asset enrichment failed, using raw template:', enrichErr);
                }
              }
              // Navigate to configure after loading — use selectIntent to mark session as having a selection
              castSession.selectIntent('video' as any);
              setActiveMainTab('create');
              setSubTab('create', 'configure');
            } catch (err: any) {
              console.error('EP04 load error:', err);
              toast.error(`Failed to load EP04: ${err.message || 'Unknown error'}`);
            }
          }}
        >
          <Film className="w-3.5 h-3.5" />
          Load EP04
        </Button>

        {/* Cast project dropdown */}
        <CastProjectDropdown
          projects={castProjects.projects}
          isLoading={castProjects.isLoading}
          selectedProjectId={castSession.session.projectId}
          onProjectSelect={async (project) => {
            const restored = await castProjects.restoreToSession(project.id);
            if (restored) {
              const intentValue = restored.selectedIntent || (project as any).content_type || 'video';
              castSession.updateSession({ ...restored, projectId: project.id, selectedIntent: intentValue });
              setActiveContentType((project as any).content_type || 'video');
              if ((restored as any)._categoryId) setSelectedCategoryId((restored as any)._categoryId);
              if ((restored as any)._formatId) setSelectedFormatId((restored as any)._formatId);
              if ((restored as any)._subFormatId) setSelectedSubFormatId((restored as any)._subFormatId);
              setActiveMainTab('create');
              setSubTab('create', 'templates');
              persistence.fetchTokenBreakdown(project.id);
              toast.success(`Loaded: ${project.title}`);
            }
          }}
          onNewProject={async (title, contentType) => {
            try {
              const project = await castProjects.createProject({ title, content_type: contentType });
              if (project) {
                castSession.updateSession({ projectId: project.id });
                setActiveContentType(contentType);
              }
            } catch {}
          }}
          onContentTypeChange={setActiveContentType}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/genie-admin?tab=subscriber-admin'}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-4">
      <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as ConsolidatedTab)}>
        {!wizardMode && (
        <TabsList className="inline-flex h-10 p-1 bg-muted/20 border border-border/15 rounded-xl">
          {(Object.entries(TAB_DEFINITIONS) as [ConsolidatedTab, typeof TAB_DEFINITIONS.create][]).map(([key, def]) => (
            <TabsTrigger 
              key={key}
              value={key}
              className={cn(
                "relative flex items-center justify-center gap-2 px-5 py-2 transition-all rounded-lg",
                "text-sm font-semibold",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                "data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground/70",
              )}
            >
              <def.icon className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wide">{def.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        )}

        {/* Workflow Context Banner */}
        {activeMainTab !== 'create' && (
          <WorkflowContextBanner
            session={castSession.session}
            currentSubTab={currentSubTab}
            onNavigate={handleBannerNavigate}
            onResetSession={castSession.resetSession}
            className="mt-3"
          />
        )}

        {/* ── Sub-Tab Navigation (Redesigned pill buttons) ── */}
        {activeMainTab !== 'create' && (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
            {currentMainDef.subTabs.map((sub) => {
              const isActive = currentSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent",
                  )}
                  onClick={() => setSubTab(activeMainTab, sub.id)}
                >
                  <sub.icon className="w-3.5 h-3.5" />
                  {sub.label}
                </button>
              );
            })}
            
            {/* Pipeline indicator */}
            <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground/60 pl-3">
              <span className="font-medium">{activePipelines.length} active</span>
              {inactivePipelines.length > 0 && (
                <Badge variant="outline" className="text-[9px] h-4 border-border/20">
                  +{inactivePipelines.length}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CREATE TAB CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="create" className="mt-4 space-y-4">
          <CreateSubWizard
            activeSubTab={subTabs.create}
            onSubTabChange={(sub) => setSubTab('create', sub)}
            direction={wizardMode ? (activeMainTabOverride ? 'ltr' : 'ltr') : 'ltr'}
          >
          {/* ── DISCOVER SUB-TAB: Capability Discovery + Create Flow Wizard ── */}
          {currentSubTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <CreateHeroBanner pageId="discover" />
              {discoveryChainId ? (
                <CreateFlowWizard
                  onBack={() => setDiscoveryChainId(null)}
                  initialChainId={discoveryChainId}
                />
              ) : (
                <CreateDiscovery
                  onChainSelect={(chainId) => setDiscoveryChainId(chainId)}
                />
              )}
            </motion.div>
          )}

          {/* GUIDED WIZARD: Show only the current step based on session state */}

          {/* STEP 1: Dynamic Category + Format selector (DB-driven) */}
          {/* Guard: Only show when on intent subtab AND no selection made yet — prevents flash during transitions */}
          {(currentSubTab === 'intent' || currentSubTab === 'discover') && !castSession.session.selectedIntent && !castSession.session.selectedTemplate && (
            <motion.div
              key="content-selector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <CreateHeroBanner pageId="intent" />
              <DynamicContentSelector
                categories={contentRegistry.categories}
                formats={contentRegistry.formats}
                subFormats={contentRegistry.subFormats}
                getFormatsForCategory={contentRegistry.getFormatsForCategory}
                getSubFormatsForFormat={contentRegistry.getSubFormatsForFormat}
                selectedCategoryId={selectedCategoryId}
                selectedFormatId={selectedFormatId}
                selectedSubFormatId={selectedSubFormatId}
                onCategorySelect={(cat) => {
                  setSelectedCategoryId(cat.id);
                  setSelectedFormatId(null);
                  setSelectedSubFormatId(null);
                  // Dispatch guide signal
                  guideDispatch({ type: 'SELECT_CATEGORY', categoryId: cat.id });
                  // Persist to DB if project exists
                  if (castSession.session.projectId) {
                    castProjects.updateProject(castSession.session.projectId, { category_id: cat.id, format_id: null, sub_format_id: null } as any).catch(() => {});
                  }
                }}
                onCategoryHover={(cat) => {
                  if (cat) {
                    guideDispatch({ type: 'HOVER_CATEGORY', categoryId: cat.id });
                  }
                }}
                onFormatSelect={(fmt) => {
                  setSelectedFormatId(fmt.id);
                  setSelectedSubFormatId(null);
                  setActiveContentType(fmt.name);
                  // Persist to DB
                  if (castSession.session.projectId) {
                    castProjects.updateProject(castSession.session.projectId, { format_id: fmt.id, sub_format_id: null } as any).catch(() => {});
                  }
                  // Check if sub-formats exist for this format — if not, advance
                  const subs = contentRegistry.getSubFormatsForFormat(fmt.id);
                  if (subs.length === 0) {
                    const needsMessaging = contentRegistry.requiresMessaging(fmt.id, selectedCategoryId || undefined);
                    castSession.selectIntent(fmt.name as any);
                    setSubTab('create', 'configure');
                  }
                  // If sub-formats exist, stay on step — user picks sub-format next
                }}
                onSubFormatSelect={(sf) => {
                  setSelectedSubFormatId(sf.id);
                  // Persist to DB
                  if (castSession.session.projectId) {
                    castProjects.updateProject(castSession.session.projectId, { sub_format_id: sf.id } as any).catch(() => {});
                  }
                  // After sub-format selection, advance to templates
                  const needsMessaging = contentRegistry.requiresMessaging(selectedFormatId || '', selectedCategoryId || undefined);
                  castSession.selectIntent((sf.name || selectedFormatId) as any);
                  setSubTab('create', 'configure');
                }}
                onAddCategory={contentRegistry.addCategory}
                onAddFormat={contentRegistry.addFormat}
                onAddSubFormat={contentRegistry.addSubFormat}
                isLoading={contentRegistry.isLoading}
              />
            </motion.div>
          )}

          {/* STEP 1 DONE: Show selection as completed inline, allow change */}
          {(castSession.session.selectedIntent || castSession.session.selectedTemplate) && (
            <div className="flex items-center gap-3 text-sm px-1 flex-wrap">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">✓</div>
              <span className="text-muted-foreground">Content:</span>
              {selectedCategoryId && (
                <Badge variant="secondary" className="text-xs">
                  {contentRegistry.categories.find(c => c.id === selectedCategoryId)?.label || 'Category'}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {contentRegistry.formats.find(f => f.id === selectedFormatId)?.label || 
                 castSession.session.selectedIntent || 
                 castSession.session.selectedTemplate?.category || 'Format'}
              </Badge>
              {selectedSubFormatId && (
                <Badge variant="secondary" className="text-xs">
                  {contentRegistry.subFormats.find(sf => sf.id === selectedSubFormatId)?.label || 'Sub-Format'}
                </Badge>
              )}
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-primary"
                onClick={() => {
                  castSession.selectIntent(null as any);
                  castSession.resetSession();
                  setSelectedCategoryId(null);
                  setSelectedFormatId(null);
                  setSelectedSubFormatId(null);
                  setSubTab('create', 'intent');
                }}
              >
                Change
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── STEP 2: CONFIGURE — Extracted to CreateConfigureStep ── */}
            {currentSubTab === 'configure' && (castSession.session.selectedIntent || castSession.session.selectedTemplate) && (
              <CreateConfigureStep
                selectedCategoryId={selectedCategoryId}
                selectedFormatId={selectedFormatId}
                selectedSubFormatId={selectedSubFormatId}
                primaryPlatform={primaryPlatform}
                selectedDialectCodes={selectedDialectCodes}
                outputLanguages={outputLanguages}
                dubbingSubtitleLanguages={dubbingSubtitleLanguages}
                selectedVisualStyleIds={selectedVisualStyleIds}
                selectedCapabilityIds={selectedCapabilityIds}
                autoSelectedCapIds={autoSelectedCapIds}
                selectedCharacterIds={selectedCharacterIds}
                characterFramePercent={characterFramePercent}
                targetDuration={targetDuration}
                selectedAssetSource={selectedAssetSource}
                lipSyncEnabled={lipSyncEnabled}
                dubbingEnabled={dubbingEnabled}
                selectedResolution={selectedResolution}
                selectedAspectRatio={selectedAspectRatio}
                productionQuality={productionQuality}
                enrichmentPrompt={enrichmentPrompt}
                setPrimaryPlatform={setPrimaryPlatform}
                setOutputLanguages={setOutputLanguages}
                setDubbingSubtitleLanguages={setDubbingSubtitleLanguages}
                setSelectedVisualStyleIds={setSelectedVisualStyleIds}
                setSelectedCapabilityIds={setSelectedCapabilityIds}
                setAutoSelectedCapIds={setAutoSelectedCapIds}
                setSelectedCharacterIds={setSelectedCharacterIds}
                setCharacterFramePercent={setCharacterFramePercent}
                setTargetDuration={setTargetDuration}
                setSelectedAssetSource={setSelectedAssetSource}
                setLipSyncEnabled={setLipSyncEnabled}
                setDubbingEnabled={setDubbingEnabled}
                setSelectedResolution={setSelectedResolution}
                setSelectedAspectRatio={setSelectedAspectRatio}
                setProductionQuality={setProductionQuality}
                setEnrichmentPrompt={setEnrichmentPrompt}
                contentRegistry={contentRegistry}
                holidayAwareness={holidayAwareness}
                onDialectChange={handleDialectChange}
                onBackToIntent={() => {
                  castSession.selectIntent(null as any);
                  setSubTab('create', 'intent');
                }}
                onContinueToTemplates={() => setSubTab('create', 'templates')}
                renderRegionHierarchySelector={renderRegionHierarchySelector}
              />
            )}


            {/* ── STEP 3: TEMPLATES ── Visible after messaging approved OR if template already exists */}
            {currentSubTab === 'templates' && (castSession.session.selectedIntent || castSession.session.selectedTemplate || castSession.session.approvedMessaging || castSession.session.projectId) && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <CreateHeroBanner pageId="templates" />
                {/* Back to Configure */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 mb-3 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSubTab('create', 'configure');
                  }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Style & Enrichment
                </Button>
                {/* Selected Template Confirmation Card */}
                {castSession.session.selectedTemplate && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="py-4 flex items-center gap-4">
                      {castSession.session.selectedTemplate.thumbnailUrl && (
                        <img
                          src={castSession.session.selectedTemplate.thumbnailUrl}
                          alt={castSession.session.selectedTemplate.name}
                          className="w-16 h-10 rounded object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{castSession.session.selectedTemplate.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">{castSession.session.selectedTemplate.category}</Badge>
                          {castSession.session.selectedTemplate.sceneCount > 0 && (
                            <Badge variant="outline" className="text-[10px]">{castSession.session.selectedTemplate.sceneCount} scenes</Badge>
                          )}
                          {castSession.session.selectedTemplate.estimatedDuration > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {castSession.session.selectedTemplate.estimatedDuration >= 60
                                ? `${Math.round(castSession.session.selectedTemplate.estimatedDuration / 60)}m`
                                : `${castSession.session.selectedTemplate.estimatedDuration}s`}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => castSession.clearTemplate()}
                        >
                          Change
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setSubTab('create', 'assets')}
                        >
                          Continue to Assets
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <BlueprintTemplatesGrid 
                  onSelectBlueprint={async (blueprint) => {
                    console.log('[GenieCast] Template selected:', blueprint.name);

                    // ═══ EP04 SPECIAL HANDLING ═══
                    // Navigate directly to the original EP04 production page — it already has
                    // all scenes, characters, thumbnails, TTS, animations, and metadata.
                    const EP04_BLUEPRINT_ID = 'cafcd78a-7957-4021-ba8f-c20daba331b2';
                    if (blueprint.id === EP04_BLUEPRINT_ID) {
                      console.log('[GenieCast] EP04 detected — navigating to original production page');
                      // Pass projectId if available so EP04 page can save/load from DB
                      const pid = castSession.session.projectId || '';
                      window.location.href = pid ? `/ep04-production?projectId=${pid}` : '/ep04-production';
                      return;
                    }

                    // ═══ GENERIC TEMPLATE SELECTION ═══
                    const defaults = blueprint.default_settings as any || {};
                    castSession.selectTemplate({
                      id: blueprint.id,
                      name: blueprint.name,
                      category: blueprint.category,
                      thumbnailUrl: blueprint.thumbnail_url || undefined,
                      sceneCount: blueprint.scenes?.length || 0,
                      estimatedDuration: blueprint.estimated_duration_seconds,
                      styleIntent: defaults?.style_intent || 'corporate' as StyleIntent,
                      targetPlatforms: blueprint.target_platform || [],
                      capabilities: {
                        avatar: defaults?.avatarEnabled || false,
                        '3d': defaults?.['3dEnabled'] || false,
                        animation: defaults?.animationEnabled || false,
                        arVr: defaults?.arvrEnabled || false,
                        lipsync: defaults?.lipsyncEnabled || false,
                      },
                      industryTags: blueprint.industry_tags || [],
                      targetRegions: blueprint.target_regions || [],
                    });
                    // Stay on templates — user confirms with "Continue to Assets"
                  }}
                  selectedBlueprintId={castSession.session.selectedTemplate?.id}
                  simpleMode={createMode.isSimple}
                  intentFilter={castSession.session.selectedIntent}
                  categoryFilter={selectedCategoryId ? contentRegistry.categories.find(c => c.id === selectedCategoryId)?.name || null : null}
                  selectedVideoStyles={selectedVideoStyles}
                />
              </motion.div>
            )}

            {/* MESSAGING removed — enrichment handles all brand/product context */}

            {/* ── ASSETS ── Step 4: Hero Banners, Assets Lab, Brand Assets, Regional (consolidated from LANDING + PRODUCTION) */}
            {currentSubTab === 'assets' && (
              <motion.div
                key="assets"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <CreateHeroBanner pageId="assets" />
                {/* Back to Templates */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 mb-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setSubTab('create', 'templates')}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Templates
                </Button>
                {/* Asset section navigation */}
                <div className="flex items-center gap-2 border-b pb-2 overflow-x-auto">
                  <Button
                    variant={productionSection === 'styles' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProductionSection('styles')}
                    className="gap-1.5 text-xs flex-shrink-0"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    Video Styles
                    {selectedVideoStyles.length > 0 && (
                      <Badge variant="secondary" className="text-[9px] px-1 h-4 ml-1">{selectedVideoStyles.length}</Badge>
                    )}
                  </Button>
                  <Button
                    variant={productionSection === 'assets' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProductionSection('assets')}
                    className="gap-1.5 text-xs flex-shrink-0"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Brand Assets
                  </Button>
                  <Button
                    variant={productionSection === 'regional' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProductionSection('regional')}
                    className="gap-1.5 text-xs flex-shrink-0"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Regional Config
                    {selectedDialectCodes.length > 1 && (
                      <Badge variant="secondary" className="text-[9px] px-1 h-4 ml-1">{selectedDialectCodes.length} lang</Badge>
                    )}
                  </Button>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Button
                    variant={productionSection === 'hero-banners' as any ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProductionSection('hero-banners' as any)}
                    className="gap-1.5 text-xs flex-shrink-0"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Hero Banners
                  </Button>
                  <Button
                    variant={productionSection === 'assets-lab' as any ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProductionSection('assets-lab' as any)}
                    className="gap-1.5 text-xs flex-shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Assets Lab
                  </Button>
                  <Button
                    variant={productionSection === 'landing-scripts' as any ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProductionSection('landing-scripts' as any)}
                    className="gap-1.5 text-xs flex-shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Landing Scripts
                  </Button>

                  {/* Ready to produce */}
                  <div className="ml-auto flex-shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setActiveMainTab('produce');
                        setSubTab('produce', 'generate');
                      }}
                      className="gap-1.5 text-xs"
                      disabled={!castSession.session.selectedTemplate}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Go to Produce
                    </Button>
                  </div>
                </div>

                {/* ─── STYLES SECTION ─── */}
                {productionSection === 'styles' && (
                  <div className="space-y-4">
                    <GenieCastOverview
                      selectedStyles={selectedVideoStyles}
                      onStylesChange={onStylesChange}
                      onNavigate={(tab) => {
                      if (tab === 'generate') {
                          setActiveMainTab('produce');
                          setSubTab('produce', 'generate');
                        } else if (tab === 'matrix') {
                          setActiveMainTab('produce');
                          setSubTab('produce', 'matrix');
                        }
                      }}
                    />
                    
                    {/* Ecosystem Metrics Card */}
                    <Card className="border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Ecosystem Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-primary">{metrics.providers.total}</div>
                            <div className="text-xs text-muted-foreground">AI Providers</div>
                            <div className="text-[10px] text-muted-foreground">{metrics.providers.wiredToGenieCast} wired</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-primary">{metrics.videoStyles.total}</div>
                            <div className="text-xs text-muted-foreground">Video Styles</div>
                            <div className="text-[10px] text-muted-foreground">{metrics.videoStyles.popular} popular</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-primary">{metrics.pipelines.active}</div>
                            <div className="text-xs text-muted-foreground">Active Pipelines</div>
                            <div className="text-[10px] text-muted-foreground">of {metrics.pipelines.total}</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-primary">{metrics.zones}</div>
                            <div className="text-xs text-muted-foreground">Regional Zones</div>
                            <div className="text-[10px] text-muted-foreground">4-zone routing</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ─── BRAND ASSETS SECTION ─── */}
                {productionSection === 'assets' && (
                  <BrandAssetsPanel 
                    selectedProductId={selectedProductId}
                  />
                )}

                {/* ─── REGIONAL CONFIG SECTION ─── */}
                {productionSection === 'regional' && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Regional Output Configuration
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Select target regions and dialects for transcreation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RegionalDialectSelector
                        onDialectsChange={handleDialectChange}
                        selectedDialects={selectedDialectCodes}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* ─── HERO BANNERS (from LANDING) ─── */}
                {(productionSection as string) === 'hero-banners' && (
                  <HeroBannerCarouselMode />
                )}

                {/* ─── ASSETS LAB (from LANDING) ─── */}
                {(productionSection as string) === 'assets-lab' && (
                  <RegionalAssetsLab />
                )}

                {/* ─── LANDING SCRIPTS (from LANDING) ─── */}
                {(productionSection as string) === 'landing-scripts' && (
                  <LandingPageScriptsPanel />
                )}
              </motion.div>
            )}

            {/* Old intent placeholder removed — guided wizard handles this */}
          </AnimatePresence>
          </CreateSubWizard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PRODUCE TAB CONTENT (includes former MANAGE) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="produce" className="mt-4 space-y-4">
          {/* Produce hero banner — dogfooding messaging */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-border/20 h-32 bg-gradient-to-r from-blue-900/40 via-background to-cyan-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
            <div className="relative z-10 h-full flex items-end p-4 md:p-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Produce & Orchestrate 🎬</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Same pipelines we used for EP01–EP04 · Universal Enrichment routes to optimal AI models per region</p>
              </div>
            </div>
          </motion.div>

          {/* Session Summary — persistent breadcrumb from CREATE */}
          <CreateSessionSummary
            session={castSession.session}
            categories={contentRegistry.categories}
            formats={contentRegistry.formats}
            subFormats={contentRegistry.subFormats}
            compact
            onNavigateToStep={(step) => {
              setActiveMainTab('create');
              setSubTab('create', step);
            }}
          />

          <AnimatePresence mode="wait">
            {currentSubTab === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Phase 4B: Document Import — source material for generation */}
                <DocumentImportPanel
                  compact
                  onImportComplete={(text, metadata) => {
                    castSession.updateSession({ importedContent: text, importMetadata: metadata });
                    toast.success('Source material imported — will be used during generation');
                  }}
                />

                {/* Format-Specific Production Router (replaces old Quick Generate) */}
                <FormatStudioRouter
                  selectedFormats={castSession.session.selectedFormats.length > 0
                    ? castSession.session.selectedFormats
                    : ['video']}
                  projectId={castSession.session.projectId || undefined}
                  onGenerate={(formatName) => {
                    toast.info(`Generating ${formatName} content...`);
                    if (formatName === 'video' || formatName === 'ugc') {
                      onGenerate?.();
                    }
                  }}
                />

                {/* Phase 5E: Podcast-to-Video Converter (shown when podcast format selected) */}
                {(castSession.session.selectedFormats.includes('audio_podcast') ||
                  castSession.session.selectedFormats.includes('video_podcast') ||
                  castSession.session.selectedFormatId?.includes('podcast')) && (
                  <PodcastToVideoConverter
                    onConversionComplete={(videoUrl) => {
                      toast.success('Podcast video ready!');
                      console.log('[GenieCast] Podcast-to-video complete:', videoUrl);
                    }}
                  />
                )}

                {/* Batch Matrix (expanded inline instead of separate sub-tab) */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4 text-primary" />
                      Batch Production Matrix
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Generate multiple variations across styles, languages, and platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VideoGenerationMatrix
                      onNavigateToScreenshots={() => {
                        setActiveMainTab('create');
                        setSubTab('create', 'assets');
                        setProductionSection('assets');
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Next Step */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setSubTab('produce', 'edit')}
                  >
                    Continue to Edit
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* ── PRODUCE EDIT — Extracted to ProduceEditStep ── */}
            {currentSubTab === 'edit' && (
              <ProduceEditStep
                authoring={authoring}
                routing={routing}
                castSession={castSession}
                production={production}
                productionSession={productionSession}
                videoTimeline={videoTimeline}
                avSync={avSync}
                clipOps={clipOps}
                selectedDialectCodes={selectedDialectCodes}
                selectedProductId={selectedProductId}
                productionQuality={productionQuality}
                setSubTab={setSubTab}
                setActiveMainTab={setActiveMainTab}
                setProductionSection={setProductionSection}
              />
            )}

            
            {/* ── PRODUCE REVIEW — Extracted to ProduceReviewStep ── */}
            {currentSubTab === 'review' && (
              <ProduceReviewStep
                castSession={castSession}
                authoring={authoring}
                setSubTab={setSubTab}
                setActiveMainTab={setActiveMainTab}
                handleNavigateToStage={handleNavigateToStage}
              />
            )}

            {/* ── LIBRARY (from MANAGE) ── */}
            {currentSubTab === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <ContentLibraryGrid
                  onSelectVideo={(video) => {
                    console.log('[Library] Selected video:', video.id);
                    toast.info(`Opening: ${video.title}`);
                  }}
                  onDistribute={(video) => {
                    console.log('[Library] Distribute video:', video.id);
                    setActiveMainTab('publish');
                    setSubTab('publish', 'distribution');
                    toast.info('Navigate to distribution...');
                  }}
                />
              </motion.div>
            )}
            
            {/* ── ANALYTICS (from MANAGE) ── */}
            {currentSubTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <AnalyticsDashboard />
              </motion.div>
            )}
            
            {/* Flow diagram accessible from Library tab footer or admin panel */}
          </AnimatePresence>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PUBLISH TAB CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="publish" className="mt-4 space-y-6">
          {/* Phase 6B: Publish Guard — require approval before publishing */}
          {!castSession.session.completedStages.includes('approval' as AuthoringStage) ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold">Publishing Locked</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Content must be approved before publishing. Go to <strong>PRODUCE &rarr; Review</strong> and
                click "Approve for Publish" after reviewing all items.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveMainTab('produce');
                  setSubTab('produce', 'review');
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Go to Review
              </Button>
            </motion.div>
          ) : (
          <>
          {/* Publish hero banner — dogfooding messaging */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-border/20 h-32 bg-gradient-to-r from-emerald-900/40 via-background to-purple-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
            <div className="relative z-10 h-full flex items-end p-4 md:p-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Publish & Scale</h2>
                <p className="text-xs text-muted-foreground mt-0.5">14 regions x 40+ sub-regions x 6 platforms - Make it once, scale it everywhere</p>
              </div>
            </div>
          </motion.div>

          {/* Session Summary — persistent breadcrumb from CREATE */}
          <CreateSessionSummary
            session={castSession.session}
            categories={contentRegistry.categories}
            formats={contentRegistry.formats}
            subFormats={contentRegistry.subFormats}
            compact
            onNavigateToStep={(step) => {
              setActiveMainTab('create');
              setSubTab('create', step);
            }}
          />

          <AnimatePresence mode="wait">
            {currentSubTab === 'scheduler' && (
              <motion.div
                key="scheduler"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <SmartSchedulerPanel />
                <div className="flex justify-end">
                  <Button size="sm" className="gap-1.5" onClick={() => setSubTab('publish', 'distribution')}>
                    Continue to Distribution <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentSubTab === 'distribution' && (
              <motion.div
                key="distribution"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setSubTab('publish', 'scheduler')}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Schedule
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => setSubTab('publish', 'seo')}>
                    Continue to SEO <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* P1: Multi-Platform Export & Distribution */}
                <ExportDistributionPanel
                  exportHook={platformExport}
                  timelineDurationMs={videoTimeline.state.totalDurationMs}
                />

                {/* Auto-Derivatives: Shorts, Clips, Thumbnails, Captions, Square — all from real pipeline */}
                <ContentRepurposingPanel />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <SceneCharacterVisualizer autoPlay={false} />
                  </div>
                  <div>
                    <EP04PublishHub />
                  </div>
                </div>
              </motion.div>
            )}

            {currentSubTab === 'seo' && (
              <motion.div
                key="seo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setSubTab('publish', 'distribution')}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Distribution
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => setSubTab('publish', 'testing')}>
                    Continue to A/B Testing <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <SEOOptimizerPanel />
              </motion.div>
            )}

            {currentSubTab === 'testing' && (
              <motion.div
                key="testing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center mb-2">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setSubTab('publish', 'seo')}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to SEO
                  </Button>
                </div>
                <ABTestingPanel />
              </motion.div>
            )}
          </AnimatePresence>
          </>
          )}
        </TabsContent>

        {/* LANDING FEATURES NOW IN CREATE → ASSETS */}
      </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GenieCastConsolidatedTabs;
