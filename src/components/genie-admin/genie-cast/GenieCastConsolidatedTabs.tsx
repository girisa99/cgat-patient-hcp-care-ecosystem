/**
 * GENIE CAST CONSOLIDATED 4-TAB STRUCTURE
 *
 * Consolidates 10+ scattered tabs into unified workflow:
 * - CREATE: Templates, Messaging, Production Setup (Styles + Assets + Regional)
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
} from 'lucide-react';
import { useCreateMode } from '@/hooks/useCreateMode';
import { QuickStartCard, CreateStepProgress, CreateModeToggle, type CreateStep } from './create';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import unified authoring system
import { useUnifiedAuthoring, type AuthoringStage } from '@/hooks/useUnifiedAuthoring';
import { useGenieCastSession } from '@/hooks/useGenieCastSession';
import { AuthoringStageIndicator } from '@/components/shared/AuthoringStageIndicator';
import { RegionalDialectSelector } from '@/components/shared/RegionalDialectSelector';
import { ScriptTemplateMapper } from '@/components/shared/ScriptTemplateMapper';
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
import { SEOOptimizerPanel } from './SEOOptimizerPanel';
import { ABTestingPanel } from './ABTestingPanel';

// Import Landing Page Scripts
import { LandingPageScriptsPanel } from './LandingPageScriptsPanel';
import { AlibabaMeetingPrepDoc } from './AlibabaMeetingPrepDoc';
import { RegionalAssetsLab } from './RegionalAssetsLab';
import { HeroBannerCarouselMode } from './HeroBannerCarouselMode';

// Import sub-components DIRECTLY to avoid circular dependency (index.ts re-exports this file)
import { GenieCastOverview } from './GenieCastOverview';
import { VideoStyleCards, type VideoStyleType } from './VideoStyleCards';
import { AIProviderShowcase } from './AIProviderShowcase';
import { MultiScreenshotGallery, type ProductGallery } from '../MultiScreenshotGallery';
import { VideoGenerationMatrix } from '../VideoGenerationMatrix';
import { MessagingGeneratorPanel } from '../MessagingGeneratorPanel';
import { ProductChangeAlertPanel } from '../ProductChangeAlertPanel';
import { GenieCastFlowDiagram } from '../GenieCastFlowDiagram';
import { GenieCastHubMockup } from './mockups';
import { BrandAssetsPanel } from './BrandAssetsPanel';
import { BlueprintTemplatesGrid } from './BlueprintTemplatesGrid';
import { WorkflowContextBanner } from './WorkflowContextBanner';
import { StyleDrivenProductionConfig, deriveProductionRequirements, estimateGenerationTime } from './StyleDrivenProductionConfig';
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
export type CreateSubTab = 'intent' | 'templates' | 'messaging' | 'assets';
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
    description: 'Intent, Templates, Messaging & Assets',
    activeColor: 'bg-orange-600 text-white border-orange-600',
    inactiveColor: 'border-orange-300 text-orange-700 hover:bg-orange-50',
    subTabs: [
      { id: 'intent', label: 'Intent', icon: Sparkles, description: 'What are you creating?' },
      { id: 'templates', label: 'Templates', icon: LayoutTemplate, description: 'Select a blueprint' },
      { id: 'messaging', label: 'Messaging', icon: MessageSquare, description: 'AI marketing copy & scripts' },
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
  const [subTabs, setSubTabs] = useState<Record<ConsolidatedTab, string>>({
    create: defaultSubTab || 'intent',
    produce: 'generate',
    publish: 'scheduler',
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

  // Regional dialect selection state
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

  return (
    <div className="space-y-4">
      {/* Compact navigation bar - back to Genie Studio */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/genie-studio'}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Genie Studio
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Genie Cast</span>
        </div>
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

        {/* Sub-Tab Navigation for Active Main Tab */}
        {activeMainTab === 'create' ? (
          /* CREATE uses step progress + mode toggle instead of generic sub-tabs */
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            <CreateStepProgress
              session={castSession.session}
              currentStep={currentSubTab as CreateStep}
              onStepClick={(step) => setSubTab('create', step)}
              onGoToProduce={() => {
                setActiveMainTab('produce');
                setSubTab('produce', 'generate');
              }}
              canProduce={!!castSession.session.selectedTemplate}
              className="flex-1"
            />
            <CreateModeToggle mode={createMode.mode} onToggle={createMode.toggleMode} />
          </div>
        ) : (
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
          {/* Quick Start Card - only shows when no session is active */}
          <QuickStartCard
            hasActiveSession={!!castSession.session.selectedTemplate}
            onQuickStart={(blueprint, styles) => {
              castSession.selectTemplate({
                id: blueprint.id,
                name: blueprint.name,
                category: blueprint.category,
                thumbnailUrl: blueprint.thumbnail_url || undefined,
                sceneCount: blueprint.scenes?.length || 0,
                estimatedDuration: blueprint.estimated_duration_seconds,
                styleIntent: (blueprint.default_settings as any)?.style_intent || 'corporate',
              });
              onStylesChange(styles);
              // Jump straight to produce
              setActiveMainTab('produce');
              setSubTab('produce', 'generate');
              toast.success('Quick start ready! Template & styles auto-selected.');
            }}
          />

          {/* Workflow Context Banner - persistent across all CREATE sub-tabs (Advanced only) */}
          {createMode.isAdvanced && (
            <WorkflowContextBanner
              session={castSession.session}
              currentSubTab={currentSubTab}
              onNavigate={handleBannerNavigate}
              onResetSession={castSession.resetSession}
            />
          )}

          <AnimatePresence mode="wait">
            {/* ── TEMPLATES ── First-class starting point */}
            {currentSubTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <BlueprintTemplatesGrid 
                  onSelectBlueprint={(blueprint) => {
                    console.log('[GenieCast] Template selected:', blueprint.name);
                    castSession.selectTemplate({
                      id: blueprint.id,
                      name: blueprint.name,
                      category: blueprint.category,
                      thumbnailUrl: blueprint.thumbnail_url || undefined,
                      sceneCount: blueprint.scenes?.length || 0,
                      estimatedDuration: blueprint.estimated_duration_seconds,
                      styleIntent: (blueprint.default_settings as any)?.style_intent || 'corporate' as StyleIntent,
                    });
                    // Navigate to Messaging after template selection
                    setSubTab('create', 'messaging');
                  }}
                  selectedBlueprintId={castSession.session.selectedTemplate?.id}
                  simpleMode={createMode.isSimple}
                  selectedVideoStyles={selectedVideoStyles}
                />
              </motion.div>
            )}

            {/* ── MESSAGING ── Step 2: Generate marketing copy ONLY */}
            {currentSubTab === 'messaging' && (
              <motion.div
                key="messaging"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Prompt to select template first if not selected */}
                {!castSession.session.selectedTemplate && (
                  <Card className="mb-4 border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/10">
                    <CardContent className="py-4 flex items-center gap-3">
                      <LayoutTemplate className="w-5 h-5 text-amber-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">No template selected yet</p>
                        <p className="text-xs text-muted-foreground">Select a template first for better messaging alignment</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSubTab('create', 'templates')}
                        className="gap-1"
                      >
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        Select Template
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* MessagingGeneratorPanel ONLY - no AuthoringStageIndicator or RegionalDialectSelector here */}
                <MessagingGeneratorPanel 
                  onMessagingApproved={(productId, messaging) => {
                    console.log('[GenieCast] Messaging approved for', productId);
                    if (messaging) {
                      castSession.approveMessaging({
                        id: `messaging-${productId}-${Date.now()}`,
                        productId: productId || 'cast',
                        hook: messaging.hook || '',
                        valueProposition: messaging.valueProposition || '',
                        painPoints: messaging.painPoints || [],
                        benefits: messaging.benefits || [],
                        differentiators: messaging.differentiators || [],
                        cta: messaging.cta || '',
                        shortScript: messaging.shortScript || '',
                        mediumScript: messaging.mediumScript || '',
                        longScript: messaging.longScript || '',
                        approvalStatus: 'approved',
                        language: 'en',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      });
                    }
                    // Navigate to Assets after messaging approval
                    setSubTab('create', 'assets');
                    toast.success('Messaging approved! Review assets next.');
                  }}
                />
              </motion.div>
            )}

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
                        if (tab === 'messaging') {
                          setSubTab('create', 'messaging');
                        } else if (tab === 'generate') {
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

            {/* ── INTENT ── What are you creating? (placeholder for Stage 2) */}
            {currentSubTab === 'intent' && (
              <motion.div
                key="intent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      What are you creating?
                    </CardTitle>
                    <CardDescription>
                      Select your intent to auto-filter templates, messaging, and assets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'product-video', label: 'Product Video', icon: Video, desc: 'Demo, explainer, or promo video' },
                        { id: 'hero-banner', label: 'Hero Banner', icon: Image, desc: 'Landing page hero carousel' },
                        { id: 'social-content', label: 'Social Content', icon: Share2, desc: 'Short-form social media assets' },
                        { id: 'landing-section', label: 'Landing Section', icon: Globe, desc: 'Regional landing page content' },
                      ].map((intent) => (
                        <Card 
                          key={intent.id}
                          className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                          onClick={() => {
                            toast.info(`Intent: ${intent.label} — filtering templates...`);
                            setSubTab('create', 'templates');
                          }}
                        >
                          <CardContent className="p-4 text-center space-y-2">
                            <intent.icon className="w-8 h-8 mx-auto text-primary" />
                            <p className="text-sm font-medium">{intent.label}</p>
                            <p className="text-[10px] text-muted-foreground">{intent.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PRODUCE TAB CONTENT (includes former MANAGE) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="produce" className="mt-4 space-y-4">
          {/* Workflow Context Banner - shows session context in PRODUCE */}
          <WorkflowContextBanner
            session={castSession.session}
            currentSubTab={currentSubTab}
            onNavigate={handleBannerNavigate}
            onResetSession={castSession.resetSession}
          />
          
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
                <DistributionPanel />
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
