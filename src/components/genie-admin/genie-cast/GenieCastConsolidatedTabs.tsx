/**
 * GENIE CAST CONSOLIDATED 4-TAB STRUCTURE
 *
 * Consolidates 10+ scattered tabs into unified workflow:
 * - CREATE: Intent, Messaging, Templates, Production Setup (Styles + Assets + Regional)
 * - PRODUCE: Generate, Matrix, Studio Editor, Review
 * - MANAGE: Library, Analytics, Flow, Content Repurposing
 * - PUBLISH: Scheduler, Distribution, SEO, A/B Testing
 *
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
  Settings,
  Settings2,
  Play,
  BarChart3,
  FileText,
  Globe,
  LayoutTemplate,
  MessageSquare,
  Image,
  Volume2,
  ChevronDown,
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
import { QuickStartCard, CreateStepProgress, CreateModeToggle, IntentSelector, type CreateStep } from './create';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { AuthoringStageIndicator } from '@/components/shared/AuthoringStageIndicator';
import { RegionalDialectSelector } from '@/components/shared/RegionalDialectSelector';
import { ScriptTemplateMapper } from '@/components/shared/ScriptTemplateMapper';
import { SceneScriptAIPanel } from '@/components/shared/SceneScriptAIPanel';
import { AVSyncPreview } from '@/components/shared/AVSyncPreview';
import { ApprovalDashboard } from '@/components/shared/ApprovalDashboard';
import type { StyleIntent, RegionZone } from '@/services/styleIntentResolver';

// Import Phase 2 Routing Transparency
import { RoutingDecisionCard } from '@/components/ai/RoutingDecisionCard';
import { useAIRoutingIntelligence } from '@/hooks/useAIRoutingIntelligence';

// Import P2 Live Generation Preview component (uses internal hooks)
import { LiveGenerationPreview } from './LiveGenerationPreview';

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
import { AlibabaMeetingPrepDoc } from './AlibabaMeetingPrepDoc';
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
import { GenieCastFlowDiagram } from '../GenieCastFlowDiagram';
import { GenieCastHubMockup } from './mockups';
import { BrandAssetsPanel } from './BrandAssetsPanel';
import { BlueprintTemplatesGrid } from './BlueprintTemplatesGrid';
import { WorkflowContextBanner } from './WorkflowContextBanner';
import { StyleDrivenProductionConfig, deriveProductionRequirements, estimateGenerationTime } from './StyleDrivenProductionConfig';
import { type ProductionCapability } from '@/services/marketing/aiMessagingGeneratorService';
import { ScriptPreviewPanel } from './ScriptPreviewPanel';
import { TranslationTranscreationToggle } from './TranslationTranscreationToggle';

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

// STAGE 1: 3-Tab Consolidated Structure (CREATE, PRODUCE, PUBLISH)
// MANAGE and LANDING have been consolidated into PRODUCE and CREATE respectively
export type ConsolidatedTab = 'create' | 'produce' | 'publish';
export type CreateSubTab = 'intent' | 'configure' | 'templates' | 'assets';
export type ProduceSubTab = 'generate' | 'matrix' | 'studio' | 'review' | 'library' | 'analytics' | 'flow';
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
}

// STAGE 1: Consolidated 3-Tab Structure
// CREATE → PRODUCE → PUBLISH (MANAGE & LANDING consolidated into these)
const TAB_DEFINITIONS = {
  create: {
    label: 'CREATE',
    icon: Sparkles,
    description: 'Intent, Templates & Assets',
    activeColor: 'bg-orange-600 text-white border-orange-600',
    inactiveColor: 'border-orange-300 text-orange-700 hover:bg-orange-50',
    subTabs: [
      { id: 'intent', label: 'Intent', icon: Sparkles, description: 'What are you creating?' },
      { id: 'configure', label: 'Style & Enrichment', icon: Palette, description: 'Visual style, enrichment & resolution' },
      { id: 'templates', label: 'Templates', icon: LayoutTemplate, description: 'Select a blueprint' },
      { id: 'assets', label: 'Assets', icon: Image, description: 'Hero Banners, Assets Lab, Brand Assets' },
    ],
  },
  produce: {
    label: 'PRODUCE',
    icon: Video,
    description: 'Generate, Edit, Review & Manage',
    activeColor: 'bg-blue-600 text-white border-blue-600',
    inactiveColor: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    subTabs: [
      { id: 'generate', label: 'Generate', icon: Play, description: 'Single or batch video generation' },
      { id: 'matrix', label: 'Matrix', icon: Grid3X3, description: 'Batch production matrix' },
      { id: 'studio', label: 'Studio', icon: Film, description: 'Timeline editor' },
      { id: 'review', label: 'Review', icon: Eye, description: 'Quality review & enhance' },
      { id: 'library', label: 'Library', icon: Layers, description: 'Video content library' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance metrics & insights' },
      { id: 'flow', label: 'Flow', icon: GitBranch, description: 'Pipeline visualization' },
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
}) => {
  const [activeMainTab, setActiveMainTab] = useState<ConsolidatedTab>(defaultTab);
  
  // Smart sub-tab init: if session already has progress, skip past intent
  const [subTabs, setSubTabs] = useState<Record<ConsolidatedTab, string>>(() => {
    try {
      const stored = localStorage.getItem('genie-cast-session');
      if (stored) {
        const parsed = JSON.parse(stored);
        // If template already selected, go to templates; if intent set, go to configure; otherwise start at intent
        const createSub = (parsed.selectedTemplate || parsed.approvedMessaging) ? 'templates' : parsed.selectedIntent ? 'configure' : 'intent';
        return { create: createSub, produce: 'generate', publish: 'scheduler' };
      }
    } catch {}
    return { create: defaultSubTab || 'intent', produce: 'generate', publish: 'scheduler' };
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [selectedSubFormatId, setSelectedSubFormatId] = useState<string | null>(null);
  // Enrichment prompt for AI context injection
  const [enrichmentPrompt, setEnrichmentPrompt] = useState<string>('');
  // Resolution / aspect ratio selection
  const [selectedResolution, setSelectedResolution] = useState<string>('1920x1080');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('16:9');
  // Visual style from cast_visual_styles (DB-driven)
  const [selectedVisualStyleId, setSelectedVisualStyleId] = useState<string | null>(null);
  // Production capabilities selection
  const [selectedCapabilityIds, setSelectedCapabilityIds] = useState<string[]>([]);
  // Asset source type
  const [selectedAssetSource, setSelectedAssetSource] = useState<string>('generate');
  // Lip-sync and dubbing toggles
  const [lipSyncEnabled, setLipSyncEnabled] = useState(true);
  const [dubbingEnabled, setDubbingEnabled] = useState(true);
  // Platform + Languages
  const [primaryPlatform, setPrimaryPlatform] = useState<string>('youtube');
  const [outputLanguages, setOutputLanguages] = useState<string[]>(['en']);
  const [dubbingSubtitleLanguages, setDubbingSubtitleLanguages] = useState<string[]>(['en']);
  // Regional detection for auto-region context
  const regionalDetection = useRegionalDetection();

  // Global persistent multi-region selection (header-level context)
  const genieCastRegions = useGenieCastRegions();

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


  const [selectedDialectCodes, setSelectedDialectCodes] = useState<string[]>(['en-US']);
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('female');
  const [productionQuality, setProductionQuality] = useState<'preview' | 'production' | 'cinematic'>('production');

  // Phase 2: AI Routing Intelligence for Studio transparency
  const routing = useAIRoutingIntelligence();

  // Production Setup internal section state
  const [productionSection, setProductionSection] = useState<'styles' | 'assets' | 'regional'>('styles');

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
    <div className="space-y-4">
      {/* Compact navigation bar - back to Genie Suite */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/genie-studio'}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Genie Suite
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Genie Cast</span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/genie-admin?tab=subscriber-admin'}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="w-4 h-4" />
          Admin
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <ProductSelector
          products={pool?.products || []}
          selectedProductId={castSession.session.selectedProductId}
          onProductChange={handleProductSelect}
          isLoading={isPoolLoading}
        />
        <Separator orientation="vertical" className="h-5" />
        <GlobalRegionSelector regions={genieCastRegions} />
        <Separator orientation="vertical" className="h-5" />
        <CastProjectDropdown
          projects={castProjects.projects}
          isLoading={castProjects.isLoading}
          selectedProjectId={castSession.session.projectId}
          onProjectSelect={async (project) => {
            const restored = await castProjects.restoreToSession(project.id);
            if (restored) {
              // Ensure intent is set so the templates tab guard passes
              const intentValue = restored.selectedIntent || (project as any).content_type || 'video';
              castSession.updateSession({ ...restored, projectId: project.id, selectedIntent: intentValue });
              setActiveContentType((project as any).content_type || 'video');
              
              // Restore category/format/sub-format selections from DB
              if ((restored as any)._categoryId) setSelectedCategoryId((restored as any)._categoryId);
              if ((restored as any)._formatId) setSelectedFormatId((restored as any)._formatId);
              if ((restored as any)._subFormatId) setSelectedSubFormatId((restored as any)._subFormatId);
              
              // Navigate to templates tab so user can see the project content
              setActiveMainTab('create');
              setSubTab('create', 'templates');
              // Load token breakdown for this project
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
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-medium border-primary/30 hover:bg-primary/10"
          onClick={async () => {
            const seed = createEP04SessionSeed();
            
            // Create a cast_project for token/cost tracking
            const { createCastProject } = await import('@/services/productionCostAccumulator');
            const projectId = await createCastProject({
              title: 'EP04 — Genie Reel Episode 2',
              description: 'AI-powered cinematic product demo',
              estimatedTokens: 850000,
              productContext: 'genie-reel-ep04',
              quality: 'cinematic',
              metadata: { episodeId: 'ep04', scenes: Object.keys(seed.templateMapping?.scenes || {}).length },
            });
            
            castSession.updateSession({ ...seed, projectId });
            const stats = getEP04Stats();
            toast.success(`EP04 loaded: ${stats.scenes} scenes, ${stats.scriptLines} lines, ${stats.formattedDuration}`);
            if (projectId) {
              toast.success(`📊 Project created — token tracking active`);
            }

            // ═══ MAP EP04 TO ALL 7 CREATE STEPS (local UI state) ═══
            // Step 1: Category → Technology
            const techCategory = contentRegistry.categories.find(c => c.name === 'technology');
            if (techCategory) setSelectedCategoryId(techCategory.id);
            // Step 2: Format → Video
            const videoFormat = contentRegistry.formats.find(f => f.name === 'video');
            if (videoFormat) {
              setSelectedFormatId(videoFormat.id);
              setActiveContentType(videoFormat.name);
            }
            // Step 4: Platform → YouTube, Language → en-US
            setPrimaryPlatform('youtube');
            setOutputLanguages(['en']);
            setSelectedDialectCodes(['en-US']);
            // Step 5: Visual Style → Cinematic
            const cinematicStyle = contentRegistry.visualStyles.find(s => s.name === 'cinematic');
            if (cinematicStyle) setSelectedVisualStyleId(cinematicStyle.id);
            // Step 5: Capabilities → avatar, lip_sync, scene_voiceover, screen_recording
            const ep04Caps = ['avatar_talking_head', 'lip_sync', 'scene_voiceover', 'screen_recording', 'text_to_video'];
            const matchedCapIds = contentRegistry.productionCapabilities
              .filter(c => ep04Caps.includes(c.name))
              .map(c => c.id);
            if (matchedCapIds.length > 0) setSelectedCapabilityIds(matchedCapIds);
            // Step 5: Asset Source → screen_capture (EP04 uses dashboard screenshots)
            setSelectedAssetSource('screen_capture');
            // Step 5: Lip-sync ON, Dubbing OFF (single language)
            setLipSyncEnabled(true);
            setDubbingEnabled(false);
            // Resolution & Quality
            setSelectedResolution('1920x1080');
            setSelectedAspectRatio('16:9');
            setProductionQuality('cinematic');

            // Step D: Resolve screen capture assets from storage
            if (seed.templateMapping) {
              const { mapping, stats: screenStats } = await enrichWithScreenAssets(seed.templateMapping);
              castSession.updateSession({ templateMapping: mapping });
              if (screenStats.found > 0) {
                toast.success(`📸 ${screenStats.found}/${screenStats.total} screenshots resolved`);
              }
              if (screenStats.missing.length > 0) {
                toast.info(`⚠️ ${screenStats.missing.length} screenshots pending capture`, { description: screenStats.missing.slice(0, 3).join(', ') + (screenStats.missing.length > 3 ? '...' : '') });
              }
            }

            // Navigate to CREATE → configure to show all pre-populated steps
            setActiveMainTab('create');
            setSubTab('create', 'configure');
          }}
        >
          <Film className="w-3.5 h-3.5" />
          Load EP04
        </Button>
      </div>

      {/* Main 3-Tab Navigation */}
      <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as ConsolidatedTab)}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-card border rounded-lg shadow-sm">
          {(Object.entries(TAB_DEFINITIONS) as [ConsolidatedTab, typeof TAB_DEFINITIONS.create][]).map(([key, def]) => (
            <TabsTrigger 
              key={key}
              value={key}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 transition-all rounded-md",
                "text-foreground font-semibold",
                "data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-muted/50"
              )}
            >
              <def.icon className="w-5 h-5" />
              <span className="text-xs font-bold tracking-wide">{def.label}</span>
              <span className="text-[10px] opacity-70 hidden sm:block">{def.description}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Workflow Context Banner - Only show on PRODUCE/PUBLISH (CREATE uses guided wizard instead) */}
        {activeMainTab !== 'create' && (
          <WorkflowContextBanner
            session={castSession.session}
            currentSubTab={currentSubTab}
            onNavigate={handleBannerNavigate}
            onResetSession={castSession.resetSession}
            className="mt-4"
          />
        )}

        {/* Sub-Tab Navigation — GUIDED for CREATE (no tabs shown), normal for PRODUCE/PUBLISH */}
        {activeMainTab !== 'create' && (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            {currentMainDef.subTabs.map((sub) => {
              const isActive = currentSubTab === sub.id;
              return (
                <Button
                  key={sub.id}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-shrink-0 gap-1.5 text-xs font-medium",
                    isActive 
                      ? currentMainDef.activeColor 
                      : currentMainDef.inactiveColor
                  )}
                  onClick={() => setSubTab(activeMainTab, sub.id)}
                >
                  <sub.icon className="w-3.5 h-3.5" />
                  {sub.label}
                </Button>
              );
            })}
            
            {/* Pipeline indicator */}
            <Separator orientation="vertical" className="h-6 mx-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{activePipelines.length} active</span>
              {inactivePipelines.length > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  +{inactivePipelines.length} available
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CREATE TAB CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="create" className="mt-4 space-y-4">
          {/* GUIDED WIZARD: Show only the current step based on session state */}

          {/* STEP 1: Dynamic Category + Format selector (DB-driven) */}
          {!castSession.session.selectedIntent && !castSession.session.selectedTemplate && (
            <motion.div
              key="content-selector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
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
                  // Persist to DB if project exists
                  if (castSession.session.projectId) {
                    castProjects.updateProject(castSession.session.projectId, { category_id: cat.id, format_id: null, sub_format_id: null } as any).catch(() => {});
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
            {/* ── STEP 2: CONFIGURE — Full 7-step production flow ── */}
            {/* Steps 4-6 of the 7-step flow: Platform+Languages → Visual & Asset Config → Enrichment */}
            {currentSubTab === 'configure' && (castSession.session.selectedIntent || castSession.session.selectedTemplate) && (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Back to Content Selection */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 mb-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    castSession.selectIntent(null as any);
                    setSubTab('create', 'intent');
                  }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Content Selection
                </Button>

                {/* ════════════════════════════════════════════════════════ */}
                {/* STEP 4: Platform + Languages                           */}
                {/* ════════════════════════════════════════════════════════ */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 font-mono">Step 4</Badge>
                        Platform & Languages
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Select your primary platform and output languages for regional distribution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Primary Platform</Label>
                        <Select value={primaryPlatform} onValueChange={setPrimaryPlatform}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="instagram_reels">Instagram Reels</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="twitter">X (Twitter)</SelectItem>
                            <SelectItem value="landing_page">Landing Page</SelectItem>
                            <SelectItem value="product_page">Product Page</SelectItem>
                            <SelectItem value="ott_ctv">OTT / CTV</SelectItem>
                            <SelectItem value="webinar">Webinar</SelectItem>
                            <SelectItem value="digital_signage">Digital Signage</SelectItem>
                            <SelectItem value="presentation_slides">Presentation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Input Language <span className="text-muted-foreground">(Transcreation: DeepL)</span></Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs font-normal">
                              <span className="truncate">
                                {selectedDialectCodes[0]
                                  ? (() => {
                                      // Find region name from hierarchy
                                      for (const g of REGION_HIERARCHY) {
                                        for (const c of g.children) {
                                          if (c.code === selectedDialectCodes[0]) return `${c.flag} ${c.name}`;
                                          if (c.children) {
                                            for (const gc of c.children) {
                                              if (gc.code === selectedDialectCodes[0]) return `${gc.flag} ${gc.name}`;
                                            }
                                          }
                                        }
                                      }
                                      return selectedDialectCodes[0];
                                    })()
                                  : 'Select input language…'}
                              </span>
                              <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[420px] p-0 z-50 bg-popover" align="start">
                            <ScrollArea className="h-[380px]">
                              <div className="p-2 space-y-1">
                                {REGION_HIERARCHY.map(group => (
                                  <div key={group.groupCode} className="mb-1">
                                    {/* Parent region header */}
                                    <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                      <span>{group.groupFlag}</span>
                                      <span>{group.groupName}</span>
                                    </div>
                                    {/* Zones and leaves */}
                                    <div className="ml-2 space-y-0.5">
                                      {group.children.map(zone => {
                                        if (zone.children && zone.children.length > 0) {
                                          return (
                                            <div key={zone.code}>
                                              <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                {zone.flag} {zone.name}
                                              </div>
                                              <div className="ml-4 space-y-0.5">
                                                {zone.children.map(leaf => (
                                                  <button
                                                    key={leaf.code}
                                                    type="button"
                                                    className={cn(
                                                      "w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-[10px] transition-colors",
                                                      selectedDialectCodes[0] === leaf.code
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "hover:bg-muted/50"
                                                    )}
                                                    onClick={() => { handleDialectChange([leaf.code]); }}
                                                  >
                                                    <span>{leaf.flag}</span>
                                                    <span className="flex-1">{leaf.name}</span>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        }
                                        // Flat leaf
                                        return (
                                          <button
                                            key={zone.code}
                                            type="button"
                                            className={cn(
                                              "w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-[10px] transition-colors",
                                              selectedDialectCodes[0] === zone.code
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "hover:bg-muted/50"
                                            )}
                                            onClick={() => { handleDialectChange([zone.code]); }}
                                          >
                                            <span>{zone.flag}</span>
                                            <span className="flex-1">{zone.name}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* ── Script Transcreation Languages ── */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">📝 Script Transcreation Languages <span className="text-muted-foreground">(LLM transcreation per zone)</span></Label>
                      {renderRegionHierarchySelector(outputLanguages, setOutputLanguages, 'script')}
                    </div>

                    {/* ── Dubbing & Subtitle Languages ── */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">🎙️ Dubbing & Subtitle Languages <span className="text-muted-foreground">(TTS + subtitles per zone)</span></Label>
                      {renderRegionHierarchySelector(dubbingSubtitleLanguages, setDubbingSubtitleLanguages, 'dubbing')}
                    </div>
                  </CardContent>
                </Card>

                {/* ════════════════════════════════════════════════════════ */}
                {/* STEP 5: Visual & Asset Configuration                   */}
                {/* ════════════════════════════════════════════════════════ */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 font-mono">Step 5</Badge>
                        Visual & Asset Configuration
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Generation style, capabilities, asset source, lip-sync & dubbing settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 5a: Generation Style with Accordion Sub-Styles */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Generation Style</Label>
                      {/* Parent styles (no parent_style_id) */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {contentRegistry.visualStyles
                          .filter(s => !s.parent_style_id)
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map(style => {
                            const subStyles = contentRegistry.visualStyles
                              .filter(s => s.parent_style_id === style.id)
                              .sort((a, b) => a.sub_sort_order - b.sub_sort_order);
                            const isParentSelected = selectedVisualStyleId === style.id;
                            const hasSubSelected = subStyles.some(s => s.id === selectedVisualStyleId);
                            const isExpanded = isParentSelected || hasSubSelected;

                            return (
                              <React.Fragment key={style.id}>
                                <button
                                  onClick={() => setSelectedVisualStyleId(isParentSelected ? null : style.id)}
                                  className={cn(
                                    "relative flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all",
                                    isExpanded
                                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                                  )}
                                >
                                  <span className="text-base">
                                    {style.icon === 'Box' ? '📦' : style.icon === 'Smile' ? '😊' : style.icon === 'Star' ? '⭐' : style.icon === 'Camera' ? '📷' : style.icon === 'Film' ? '🎬' : style.icon === 'Palette' ? '🎨' : style.icon === 'Droplets' ? '💧' : style.icon === 'Minus' ? '➖' : style.icon === 'BarChart3' ? '📊' : style.icon === 'PenTool' ? '✏️' : style.icon === 'BookOpen' ? '📚' : '🎭'}
                                  </span>
                                  <span className="font-medium text-center leading-tight">{style.label}</span>
                                  {subStyles.length > 0 && (
                                    <ChevronDown className={cn(
                                      "w-3 h-3 transition-transform absolute top-1 right-1 text-muted-foreground",
                                      isExpanded && "rotate-180 text-primary"
                                    )} />
                                  )}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      {/* Sub-style accordion for the selected parent */}
                      {(() => {
                        // Find which parent is expanded
                        const selectedStyle = contentRegistry.visualStyles.find(s => s.id === selectedVisualStyleId);
                        const expandedParentId = selectedStyle?.parent_style_id || 
                          (selectedStyle && !selectedStyle.parent_style_id 
                            ? selectedStyle.id 
                            : null);
                        
                        if (!expandedParentId) return null;
                        
                        const subStyles = contentRegistry.visualStyles
                          .filter(s => s.parent_style_id === expandedParentId)
                          .sort((a, b) => a.sub_sort_order - b.sub_sort_order);
                        
                        if (subStyles.length === 0) return null;
                        
                        const parentStyle = contentRegistry.visualStyles.find(s => s.id === expandedParentId);
                        
                        return (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                              <p className="text-[10px] font-medium text-primary flex items-center gap-1">
                                <ChevronDown className="w-3 h-3" />
                                {parentStyle?.label} — Choose a sub-style
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {subStyles.map(sub => (
                                  <button
                                    key={sub.id}
                                    onClick={() => setSelectedVisualStyleId(sub.id)}
                                    className={cn(
                                      "flex flex-col gap-1 p-2 rounded-lg border text-xs transition-all text-left",
                                      selectedVisualStyleId === sub.id
                                        ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/40"
                                        : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
                                    )}
                                  >
                                    <span className="font-medium">{sub.label}</span>
                                    {sub.description && (
                                      <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{sub.description}</span>
                                    )}
                                    {sub.character_type && (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 w-fit mt-0.5">
                                        {sub.character_type}
                                      </Badge>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}

                      {selectedVisualStyleId && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          🛡️ IP-safe style — prevents photorealistic deepfakes
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* 5b: Production Capabilities (from cast_production_capabilities, filtered by format) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Production Capabilities</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {(selectedFormatId
                          ? contentRegistry.getCapabilitiesForFormat(selectedFormatId)
                          : contentRegistry.productionCapabilities
                        ).map(cap => (
                          <button
                            key={cap.id}
                            onClick={() => setSelectedCapabilityIds(prev =>
                              prev.includes(cap.id) ? prev.filter(c => c !== cap.id) : [...prev, cap.id]
                            )}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg border text-xs transition-all text-left",
                              selectedCapabilityIds.includes(cap.id)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/40 hover:bg-muted/50"
                            )}
                          >
                            <span className="text-sm">
                              {cap.name === 'lip_sync' ? '👄' : cap.name === 'dubbing' ? '🌍' : cap.name === 'avatar_talking_head' ? '🧑' : cap.name === 'avatar_full_body' ? '🕺' : cap.name === 'text_to_video' ? '🎬' : cap.name === 'text_to_image' ? '🖼️' : cap.name === 'image_to_image' ? '🔄' : cap.name === 'vr_ar_immersive' ? '🥽' : cap.name === 'pixar_3d' ? '📦' : cap.name === 'cartoon_animation' ? '🎨' : cap.name === 'ar_filters' ? '✨' : cap.name === 'music_sfx_gen' ? '🎵' : cap.name === 'multi_camera' ? '📐' : cap.name === 'green_screen' ? '🟩' : cap.name === 'voice_clone' ? '🎙️' : cap.name === 'motion_capture' ? '🏃' : cap.name === 'brand_watermark' ? '🛡️' : cap.name === '3d_scene_gen' ? '🏔️' : cap.name === 'style_transfer' ? '🎨' : cap.name === 'subtitle_burn' ? '💬' : '⚡'}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">{cap.label}</span>
                              {cap.description && (
                                <span className="text-[9px] text-muted-foreground leading-tight line-clamp-1">{cap.description}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* 5c: Asset Source */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Asset Source</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {contentRegistry.assetSourceTypes.map(src => (
                          <button
                            key={src.id}
                            onClick={() => setSelectedAssetSource(src.name)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs transition-all",
                              selectedAssetSource === src.name
                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                                : "border-border hover:border-primary/40 hover:bg-muted/50"
                            )}
                          >
                            <span className="text-base">
                              {src.name === 'generate' ? '✨' : src.name === 'pre_uploaded' ? '📁' : src.name === 'upload_new' ? '📤' : src.name === 'stock' ? '🏪' : src.name === 'screen_capture' ? '📸' : '📎'}
                            </span>
                            <span className="font-medium text-center">{src.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* 5d: Lip-sync & Dubbing */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-medium">👄 Lip-sync</Label>
                          <p className="text-[10px] text-muted-foreground">Auto-sync per scene</p>
                        </div>
                        <Button
                          variant={lipSyncEnabled ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setLipSyncEnabled(!lipSyncEnabled)}
                        >
                          {lipSyncEnabled ? 'ON' : 'OFF'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-medium">🌍 Dubbing</Label>
                          <p className="text-[10px] text-muted-foreground">Auto transcreation for output regions</p>
                        </div>
                        <Button
                          variant={dubbingEnabled ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setDubbingEnabled(!dubbingEnabled)}
                        >
                          {dubbingEnabled ? 'ON' : 'OFF'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ════════════════════════════════════════════════════════ */}
                {/* Resolution & Quality (extends Step 5)                  */}
                {/* ════════════════════════════════════════════════════════ */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-primary" />
                      Resolution & Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Aspect Ratio</Label>
                        <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                            <SelectItem value="9:16">9:16 (Portrait / Reels)</SelectItem>
                            <SelectItem value="1:1">1:1 (Square)</SelectItem>
                            <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                            <SelectItem value="21:9">21:9 (Cinematic)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Resolution</Label>
                        <Select value={selectedResolution} onValueChange={setSelectedResolution}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3840x2160">4K (3840×2160)</SelectItem>
                            <SelectItem value="1920x1080">Full HD (1920×1080)</SelectItem>
                            <SelectItem value="1280x720">HD (1280×720)</SelectItem>
                            <SelectItem value="1080x1920">Full HD Portrait (1080×1920)</SelectItem>
                            <SelectItem value="1080x1080">Square HD (1080×1080)</SelectItem>
                            <SelectItem value="720x1280">HD Portrait (720×1280)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <Label className="text-xs">Quality Preset</Label>
                      <div className="flex gap-2">
                        {(['preview', 'production', 'cinematic'] as const).map(q => (
                          <Button
                            key={q}
                            variant={productionQuality === q ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs capitalize flex-1"
                            onClick={() => setProductionQuality(q)}
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ════════════════════════════════════════════════════════ */}
                {/* STEP 6: Universal Enrichment Prompt                    */}
                {/* ════════════════════════════════════════════════════════ */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-primary" />
                      <span className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 font-mono">Step 6</Badge>
                        Universal Enrichment Prompt
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Describe your vision in any language. AI generates scenes/templates scoped by ALL above selections.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                      placeholder="e.g. Create a cinematic product demo for our AI platform. Focus on enterprise decision-makers. Tone: professional yet innovative. Highlight ROI metrics and competitive advantages..."
                      value={enrichmentPrompt}
                      onChange={(e) => setEnrichmentPrompt(e.target.value)}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {['Patient Services', 'ROI Focus', 'Brand Story', 'Product Demo', 'Competitive Edge', 'Thought Leadership'].map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => setEnrichmentPrompt(prev => prev ? `${prev}. ${tag}` : tag)}
                        >
                          <Sparkles className="w-2.5 h-2.5 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ════════════════════════════════════════════════════════ */}
                {/* STEP 7 Preview: Safety Pipeline (info only)            */}
                {/* ════════════════════════════════════════════════════════ */}
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 font-mono">Step 7</Badge>
                        Production & Safety Pipeline
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Automated safety checks run during production.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { icon: '🔍', label: 'Upload Scan', desc: 'Face & trademark detection' },
                        { icon: '🎨', label: 'Style Enforcement', desc: 'No photorealistic deepfakes' },
                        { icon: '💧', label: 'Watermark + C2PA', desc: 'Provenance metadata' },
                        { icon: '📋', label: 'Legal Consent', desc: 'Face consent workflow' },
                      ].map(item => (
                        <div key={item.label} className="p-2 rounded-lg bg-muted/50 text-center space-y-1">
                          <span className="text-lg">{item.icon}</span>
                          <p className="text-[10px] font-medium">{item.label}</p>
                          <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Continue to Templates */}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {selectedVisualStyleId && <span className="mr-2">✅ Style</span>}
                    {selectedCapabilityIds.length > 0 && <span className="mr-2">✅ {selectedCapabilityIds.length} capabilities</span>}
                    {enrichmentPrompt && <span>✅ Enrichment</span>}
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setSubTab('create', 'templates')}
                  >
                    Continue to Templates
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
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
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PRODUCE TAB CONTENT (includes former MANAGE) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="produce" className="mt-4 space-y-4">
          {/* WorkflowContextBanner already shown at top level for non-create tabs */}
          
          <AnimatePresence mode="wait">
            {currentSubTab === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Quick Generate UI */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      Quick Generate
                    </CardTitle>
                    <CardDescription>
                      Generate a single video with selected styles ({selectedVideoStyles.length} selected)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={onGenerate} 
                        disabled={isGenerating}
                        className="gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                              <Settings className="w-4 h-4" />
                            </motion.div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Generate Video
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setSubTab('produce', 'matrix')}
                        className="gap-2"
                      >
                        <Grid3X3 className="w-4 h-4" />
                        Batch Matrix
                      </Button>
                    </div>
                    
                    {selectedVideoStyles.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground">Styles:</span>
                        {selectedVideoStyles.map(style => (
                          <Badge key={style} variant="outline" className="text-xs">
                            {style.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Style-Driven Production Config */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />
                      Production Configuration
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Auto-configured based on selected styles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StyleDrivenProductionConfig
                      selectedStyles={selectedVideoStyles}
                      selectedLanguage={selectedDialectCodes[0]?.split('-')[0] || 'en'}
                      onNavigateToOverview={() => {
                        setActiveMainTab('create');
                        setSubTab('create', 'assets');
                      }}
                      avatarGender={avatarGender}
                      onAvatarGenderChange={setAvatarGender}
                      quality={productionQuality}
                      disabled={isGenerating}
                    />
                  </CardContent>
                </Card>

                {/* Session Summary */}
                {(castSession.session.selectedTemplate || castSession.session.approvedMessaging) && (
                  <Card className="mt-4 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Session Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {castSession.session.selectedTemplate && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Template:</span>
                          <Badge variant="outline">{castSession.session.selectedTemplate.name}</Badge>
                        </div>
                      )}
                      {castSession.session.approvedMessaging && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Messaging:</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Approved</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Stages Complete:</span>
                        <span>{castSession.session.completedStages.length}/8</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
            
            {currentSubTab === 'matrix' && (
              <motion.div
                key="matrix"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <VideoGenerationMatrix 
                  onNavigateToScreenshots={() => {
                    setActiveMainTab('create');
                    setSubTab('create', 'assets');
                    setProductionSection('assets');
                  }}
                />
              </motion.div>
            )}
            
            {currentSubTab === 'studio' && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Authoring Stage Progress - belongs here in Studio */}
                <div className="mb-4">
                  <AuthoringStageIndicator
                    currentStage={authoring.state.currentStage}
                    enabledStages={authoring.state.config.enabledStages}
                    variant="compact"
                    onStageClick={(stage) => authoring.goToStage(stage)}
                    isStageComplete={(stage) => {
                      const stageIndex = authoring.state.config.enabledStages.indexOf(stage);
                      const currentIndex = authoring.state.config.enabledStages.indexOf(authoring.state.currentStage);
                      return stageIndex < currentIndex;
                    }}
                    progress={{
                      current: authoring.state.config.enabledStages.indexOf(authoring.state.currentStage) + 1,
                      total: authoring.state.config.enabledStages.length,
                      percentage: ((authoring.state.config.enabledStages.indexOf(authoring.state.currentStage) + 1) / authoring.state.config.enabledStages.length) * 100,
                    }}
                  />
                </div>

                {/* Phase 2: AI Routing Transparency Card */}
                <RoutingDecisionCard
                  decision={routing.routingDecision || (() => {
                    // Auto-analyze based on current session context for immediate visibility
                    const contextQuery = castSession.session.approvedMessaging?.hook 
                      || castSession.session.selectedTemplate?.name 
                      || 'Generate marketing video content';
                    try {
                      return routing.analyzeQuery(contextQuery);
                    } catch {
                      return null;
                    }
                  })()}
                  selectedModel={routing.selectedModel}
                  onModelSelect={routing.selectModel}
                  onOptimizationSelect={(type) => {
                    if (type === 'cost') routing.selectCostOptimized();
                    else if (type === 'quality') routing.selectQualityOptimized();
                    else routing.selectSpeedOptimized();
                  }}
                  taskType="video"
                  zone={detectTranscreationZone(selectedDialectCodes[0] || 'en-US')}
                  showFallbackChain={true}
                  compact={false}
                />

                {/* Messaging Context Banner */}
                {castSession.session.approvedMessaging ? (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Messaging Context Active</span>
                          <Badge variant="outline" className="text-[10px]">Approved</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setSubTab('create', 'messaging')}
                        >
                          View / Edit
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        Hook: {castSession.session.approvedMessaging.hook?.slice(0, 100)}...
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-amber-300/30 bg-amber-50/20 dark:bg-amber-950/10">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium">No Messaging Generated</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 gap-1"
                          onClick={() => setSubTab('create', 'messaging')}
                        >
                          <Sparkles className="h-3 w-3" />
                          Generate Messaging
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generate marketing messaging first for AI to auto-fill scene scripts with hooks, CTAs, and benefits
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* AI Scene Script Generator — Suggest → Approve per scene */}
                <SceneScriptAIPanel
                  mapping={authoring.state.templateMapping || null}
                  messaging={castSession.session.approvedMessaging}
                  capabilities={castSession.session.selectedStyles}
                  product={selectedProductId || undefined}
                  region={castSession.session.selectedRegion}
                  language={castSession.session.selectedDialects?.[0]}
                  onSceneUpdate={(sceneId, updates) => {
                    authoring.updateSceneScript(sceneId, updates);
                  }}
                />

                {/* Script-to-Template Mapper */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Film className="w-5 h-5" />
                      Scene-to-Script Mapping
                    </CardTitle>
                    <CardDescription>
                      Align your scripts to template scenes with duration estimation and variable injection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScriptTemplateMapper
                      mapping={authoring.state.templateMapping || {
                        templateId: 'demo-template',
                        templateName: 'Product Demo Template',
                        scenes: [
                          { sceneId: 'scene-1', sceneKey: 'opening', title: 'Opening Hook', orderIndex: 0, scriptText: 'Discover the solution you\'ve been waiting for.', sourceType: 'template', durationSeconds: 15, minDuration: 10, maxDuration: 30, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'pending' },
                          { sceneId: 'scene-2', sceneKey: 'problem', title: 'Problem Statement', orderIndex: 1, scriptText: 'Are you struggling with manual processes? You\'re not alone.', sourceType: 'template', durationSeconds: 20, minDuration: 15, maxDuration: 40, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'pending' },
                          { sceneId: 'scene-3', sceneKey: 'solution', title: 'Solution Intro', orderIndex: 2, scriptText: 'Our platform uses AI-powered automation to transform your workflow.', sourceType: 'messaging', durationSeconds: 25, minDuration: 15, maxDuration: 45, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'draft' },
                          { sceneId: 'scene-4', sceneKey: 'benefits', title: 'Key Benefits', orderIndex: 3, scriptText: 'Experience faster workflows, reduced errors, and cost savings.', sourceType: 'messaging', durationSeconds: 30, minDuration: 20, maxDuration: 50, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'draft' },
                          { sceneId: 'scene-5', sceneKey: 'proof', title: 'Social Proof', orderIndex: 4, scriptText: 'Join thousands of satisfied customers who trust our platform.', sourceType: 'template', durationSeconds: 20, minDuration: 10, maxDuration: 35, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'pending' },
                          { sceneId: 'scene-6', sceneKey: 'cta', title: 'Call to Action', orderIndex: 5, scriptText: 'Get started today! Visit our website for a free trial.', sourceType: 'custom', durationSeconds: 15, minDuration: 10, maxDuration: 25, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                        ],
                        totalDuration: 125,
                        styleIntent: 'product-hero',
                        resolvedProviders: {
                          image: 'Gemini 3 Pro',
                          video: 'Vertex Veo 3',
                          tts: 'Azure Neural',
                          llm: 'Gemini 3.0',
                        },
                      }}
                      onSceneUpdate={(sceneId, updates) => {
                        console.log('[Studio] Scene updated:', sceneId, updates);
                        authoring.updateSceneScript(sceneId, updates);
                      }}
                      onApproveAll={() => {
                        console.log('[Studio] Approve all scenes');
                        authoring.approveTemplateMapping();
                        toast.success('All scenes approved');
                      }}
                      onGenerateTTS={async (sceneId) => {
                        console.log('[Studio] TTS Preview requested:', sceneId);
                        toast.info(`Generating TTS preview...`);
                        return authoring.generateTTSForScene(sceneId);
                      }}
                      isProcessing={authoring.state.isProcessing}
                    />
                  </CardContent>
                </Card>

                {/* Script Preview Panel — connected to session */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Script Composition & TTS
                    </CardTitle>
                    <CardDescription>
                      Generate scripts from approved messaging, preview with regional TTS
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScriptPreviewPanel
                      selectedProduct={selectedProductId as any}
                      approvedMessaging={castSession.session.approvedMessaging ? {
                        hook: castSession.session.approvedMessaging.hook,
                        valueProposition: castSession.session.approvedMessaging.valueProposition,
                        painPoints: castSession.session.approvedMessaging.painPoints,
                        benefits: castSession.session.approvedMessaging.benefits,
                        differentiators: castSession.session.approvedMessaging.differentiators,
                        cta: castSession.session.approvedMessaging.cta,
                        shortScript: castSession.session.approvedMessaging.shortScript,
                        mediumScript: castSession.session.approvedMessaging.mediumScript,
                        longScript: castSession.session.approvedMessaging.longScript,
                        closingLine: (castSession.session.approvedMessaging as any)?.closingLine,
                        openingLine: (castSession.session.approvedMessaging as any)?.openingLine,
                      } : undefined}
                      onScriptApproved={(script) => {
                        console.log('[Studio] Script approved:', script.productId);
                        castSession.goToStage('template_mapping');
                        authoring.goToStage('template_mapping');
                        toast.success('Scripts approved — proceed to scene mapping');
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Translation vs Transcreation Toggle */}
                <TranslationTranscreationToggle
                  sourceText={castSession.session.approvedMessaging?.mediumScript || ''}
                  sourceLanguage="en"
                  region={detectTranscreationZone(selectedDialectCodes[0] || '')}
                  onResult={(result) => {
                    console.log('[Studio] Translation/Transcreation result:', result.mode, result.targetLanguage);
                    toast.success(`${result.mode === 'translate' ? 'Translation' : 'Transcreation'} complete: ${result.targetLanguage}`);
                  }}
                  compact
                />

                {/* A/V Sync Preview */}
                <AVSyncPreview
                  mapping={authoring.state.templateMapping || {
                    templateId: 'demo-template',
                    templateName: 'Product Demo Template',
                    scenes: [
                      { sceneId: 'scene-1', sceneKey: 'opening', title: 'Opening Hook', orderIndex: 0, scriptText: 'Discover the solution you\'ve been waiting for.', sourceType: 'template', durationSeconds: 15, minDuration: 10, maxDuration: 30, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-2', sceneKey: 'problem', title: 'Problem Statement', orderIndex: 1, scriptText: 'Are you struggling with manual processes? You\'re not alone.', sourceType: 'template', durationSeconds: 20, minDuration: 15, maxDuration: 40, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-3', sceneKey: 'solution', title: 'Solution Intro', orderIndex: 2, scriptText: 'Our platform uses AI-powered automation to transform your workflow.', sourceType: 'messaging', durationSeconds: 25, minDuration: 15, maxDuration: 45, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-4', sceneKey: 'benefits', title: 'Key Benefits', orderIndex: 3, scriptText: 'Experience faster workflows, reduced errors, and cost savings.', sourceType: 'messaging', durationSeconds: 30, minDuration: 20, maxDuration: 50, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-5', sceneKey: 'proof', title: 'Social Proof', orderIndex: 4, scriptText: 'Join thousands of satisfied customers who trust our platform.', sourceType: 'template', durationSeconds: 20, minDuration: 10, maxDuration: 35, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-6', sceneKey: 'cta', title: 'Call to Action', orderIndex: 5, scriptText: 'Get started today! Visit our website for a free trial.', sourceType: 'custom', durationSeconds: 15, minDuration: 10, maxDuration: 25, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                    ],
                    totalDuration: 125,
                    styleIntent: 'product-hero',
                    resolvedProviders: {
                      image: 'Gemini 3 Pro',
                      video: 'Vertex Veo 3',
                      tts: 'Azure Neural',
                      llm: 'Gemini 3.0',
                    },
                  }}
                  onPlayScene={(sceneId) => {
                    console.log('[Studio] Play scene:', sceneId);
                    toast.info(`Playing scene preview for ${sceneId}...`);
                  }}
                  onSeek={(time) => {
                    console.log('[Studio] Seek to:', time);
                  }}
                  onSyncFix={(sceneId, action) => {
                    console.log('[Studio] Sync fix:', sceneId, action);
                    toast.info(`Applying ${action} to fix sync...`);
                  }}
                />

                {/* P2: Live Generation Preview */}
                <LiveGenerationPreview
                  mapping={authoring.state.templateMapping || {
                    templateId: 'demo-template',
                    templateName: 'Product Demo Template',
                    scenes: [
                      { sceneId: 'scene-1', sceneKey: 'opening', title: 'Opening Hook', orderIndex: 0, scriptText: 'Discover the solution you\'ve been waiting for.', sourceType: 'template', durationSeconds: 15, minDuration: 10, maxDuration: 30, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-2', sceneKey: 'problem', title: 'Problem Statement', orderIndex: 1, scriptText: 'Are you struggling with manual processes? You\'re not alone.', sourceType: 'template', durationSeconds: 20, minDuration: 15, maxDuration: 40, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-3', sceneKey: 'solution', title: 'Solution Intro', orderIndex: 2, scriptText: 'Our platform uses AI-powered automation to transform your workflow.', sourceType: 'messaging', durationSeconds: 25, minDuration: 15, maxDuration: 45, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-4', sceneKey: 'benefits', title: 'Key Benefits', orderIndex: 3, scriptText: 'Experience faster workflows, reduced errors, and cost savings.', sourceType: 'messaging', durationSeconds: 30, minDuration: 20, maxDuration: 50, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-5', sceneKey: 'proof', title: 'Social Proof', orderIndex: 4, scriptText: 'Join thousands of satisfied customers who trust our platform.', sourceType: 'template', durationSeconds: 20, minDuration: 10, maxDuration: 35, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                      { sceneId: 'scene-6', sceneKey: 'cta', title: 'Call to Action', orderIndex: 5, scriptText: 'Get started today! Visit our website for a free trial.', sourceType: 'custom', durationSeconds: 15, minDuration: 10, maxDuration: 25, ttsConfig: { provider: 'Azure Neural', speed: 1.0, pitch: 1.0 }, approvalStatus: 'approved' },
                    ],
                    totalDuration: 125,
                    styleIntent: 'product-hero',
                    resolvedProviders: {
                      image: 'Gemini 3 Pro',
                      video: 'Vertex Veo 3',
                      tts: 'Azure Neural',
                      llm: 'Gemini 3.0',
                    },
                  }}
                  styleIntent="product-hero"
                  region={selectedDialectCodes[0]?.startsWith('ar-') ? 'mena' : 
                          ['zh-CN', 'ja-JP', 'ko-KR'].includes(selectedDialectCodes[0] || '') ? 'cjk' : 
                          ['hi-IN', 'te-IN'].includes(selectedDialectCodes[0] || '') ? 'india' : 'global'}
                  language={selectedDialectCodes[0] || 'en-US'}
                  onTTSComplete={(results) => {
                    console.log('[Studio] TTS generation complete:', results.length, 'scenes');
                    toast.success(`TTS complete for ${results.length} scenes`);
                  }}
                  onVideoComplete={(results) => {
                    console.log('[Studio] Video preview complete:', results.length, 'thumbnails');
                    toast.success(`Video previews generated: ${results.length}`);
                  }}
                  onAssemblyComplete={(videoUrl) => {
                    console.log('[Studio] Video assembly complete:', videoUrl);
                    castSession.goToStage('approval');
                    toast.success('Full production complete! Ready for review.');
                    setSubTab('produce', 'review');
                  }}
                  showAdvancedControls={true}
                />
              </motion.div>
            )}
            
            {currentSubTab === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Approval Dashboard */}
                <ApprovalDashboard
                  session={castSession.session}
                  onNavigateToStage={handleNavigateToStage}
                  onResetSession={castSession.resetSession}
                />

                {/* Session Handoff Summary — full state from CREATE */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Production State Handoff
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Complete pipeline state from CREATE → PRODUCE
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-background rounded-lg border text-center">
                        <div className="text-lg font-bold text-primary">
                          {castSession.session.completedStages.length}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Stages Complete</div>
                      </div>
                      <div className="p-3 bg-background rounded-lg border text-center">
                        <div className="text-lg font-bold text-primary">
                          {castSession.session.approvalItems.filter(i => i.status === 'approved').length}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Items Approved</div>
                      </div>
                      <div className="p-3 bg-background rounded-lg border text-center">
                        <div className="text-lg font-bold text-primary">
                          {castSession.session.selectedDialects.length}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Languages</div>
                      </div>
                    </div>
                    
                    {castSession.session.selectedTemplate && (
                      <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">Template: {castSession.session.selectedTemplate.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {castSession.session.selectedTemplate.sceneCount} scenes • Style: {castSession.session.selectedTemplate.styleIntent}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px]">Selected</Badge>
                      </div>
                    )}

                    {castSession.session.approvedMessaging && (
                      <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">Messaging: Approved</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[250px]">
                            Hook: "{castSession.session.approvedMessaging.hook?.substring(0, 60)}..."
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600">✓</Badge>
                      </div>
                    )}

                    {castSession.session.templateMapping && (
                      <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">Script Mapping</p>
                          <p className="text-[10px] text-muted-foreground">
                            {castSession.session.templateMapping.scenes.length} scenes • {Math.round(castSession.session.templateMapping.totalDuration / 60)}min
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600">✓</Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Regional:</span>
                      <div className="flex gap-1">
                        {castSession.session.selectedDialects.map(d => (
                          <Badge key={d} variant="outline" className="text-[9px]">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Check Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Quality Check
                    </CardTitle>
                    <CardDescription>
                      AI-powered quality scoring and enhancement suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {castSession.session.selectedTemplate && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Selected Template</p>
                        <p className="text-xs text-muted-foreground">
                          {castSession.session.selectedTemplate.name} • {castSession.session.selectedTemplate.sceneCount} scenes
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
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
            
            {/* ── FLOW (from MANAGE) ── */}
            {currentSubTab === 'flow' && (
              <motion.div
                key="flow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <GenieCastFlowDiagram />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PUBLISH TAB CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="publish" className="mt-4 space-y-6">
          <AnimatePresence mode="wait">
            {currentSubTab === 'scheduler' && (
              <motion.div
                key="scheduler"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <SmartSchedulerPanel />
              </motion.div>
            )}
            
            {currentSubTab === 'distribution' && (
              <motion.div
                key="distribution"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Left: Scene character visualizer */}
                  <div>
                    <SceneCharacterVisualizer autoPlay={false} />
                  </div>
                  {/* Right: EP04 full publish hub */}
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
              >
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
              >
                <ABTestingPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* LANDING FEATURES NOW IN CREATE → ASSETS */}
      </Tabs>
    </div>
  );
};

export default GenieCastConsolidatedTabs;
