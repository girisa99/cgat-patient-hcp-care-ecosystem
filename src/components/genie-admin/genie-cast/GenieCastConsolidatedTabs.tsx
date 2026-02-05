/**
 * GENIE CAST CONSOLIDATED 4-TAB STRUCTURE
 * 
 * Consolidates 10+ scattered tabs into unified workflow:
 * - CREATE: Styles, Screenshots, Messaging, Assets
 * - PRODUCE: Generate, Matrix, Studio Editor, Review
 * - MANAGE: Library, Analytics, Flow, Content Repurposing
 * - PUBLISH: Scheduler, Distribution, SEO, A/B Testing
 * 
 * This is the SINGLE interface for all Genie Cast functionality.
 * Removes redundancy from separate Library/Studio/Review/Assets/Scheduler pages.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Play,
  BarChart3,
  FileText,
  Globe,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import unified authoring system
import { useUnifiedAuthoring } from '@/hooks/useUnifiedAuthoring';
import { AuthoringStageIndicator } from '@/components/shared/AuthoringStageIndicator';
import { RegionalDialectSelector } from '@/components/shared/RegionalDialectSelector';
import { ScriptTemplateMapper } from '@/components/shared/ScriptTemplateMapper';
import type { StyleIntent, RegionZone } from '@/services/styleIntentResolver';

// Import sub-components from parent panel
import { GenieCastOverview, VideoStyleCards, AIProviderShowcase, type VideoStyleType } from './index';
import { MultiScreenshotGallery, type ProductGallery } from '../MultiScreenshotGallery';
import { VideoGenerationMatrix } from '../VideoGenerationMatrix';
import { MessagingGeneratorPanel } from '../MessagingGeneratorPanel';
import { ProductChangeAlertPanel } from '../ProductChangeAlertPanel';
import { GenieCastFlowDiagram } from '../GenieCastFlowDiagram';
import { GenieCastHubMockup } from './mockups';
import { BrandAssetsPanel } from './BrandAssetsPanel';

// Import master registry for metrics
import { 
  MASTER_AI_PROVIDERS, 
  MASTER_VIDEO_STYLES, 
  MASTER_MARKETING_PIPELINES,
  getPipelinesByTab,
  calculateEcosystemMetrics,
} from '@/config/master-ecosystem-registry';

export type ConsolidatedTab = 'create' | 'produce' | 'manage' | 'publish';
export type CreateSubTab = 'styles' | 'screenshots' | 'messaging' | 'assets';
export type ProduceSubTab = 'generate' | 'matrix' | 'studio' | 'review';
export type ManageSubTab = 'library' | 'analytics' | 'flow' | 'repurpose';
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

const TAB_DEFINITIONS = {
  create: {
    label: 'CREATE',
    icon: Sparkles,
    description: 'Styles, Assets & Messaging',
    // Separate active/inactive colors for proper contrast
    activeColor: 'bg-orange-600 text-white border-orange-600',
    inactiveColor: 'border-orange-300 text-orange-700 hover:bg-orange-50',
    subTabs: [
      { id: 'styles', label: 'Styles', icon: Palette, description: 'Video style selection (43+ options)' },
      { id: 'assets', label: 'Assets', icon: Upload, description: 'Logos, Screenshots, Colors, Templates' },
      { id: 'messaging', label: 'Messaging', icon: TrendingUp, description: 'Marketing copy generation' },
    ],
  },
  produce: {
    label: 'PRODUCE',
    icon: Video,
    description: 'Generate & Edit Videos',
    activeColor: 'bg-blue-600 text-white border-blue-600',
    inactiveColor: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    subTabs: [
      { id: 'generate', label: 'Quick Gen', icon: Play, description: 'Single video generation' },
      { id: 'matrix', label: 'Matrix', icon: Grid3X3, description: 'Batch production matrix' },
      { id: 'studio', label: 'Studio', icon: Film, description: 'Timeline editor' },
      { id: 'review', label: 'Review', icon: Eye, description: 'Quality review & enhance' },
    ],
  },
  manage: {
    label: 'MANAGE',
    icon: Layers,
    description: 'Library & Analytics',
    activeColor: 'bg-green-600 text-white border-green-600',
    inactiveColor: 'border-green-300 text-green-700 hover:bg-green-50',
    subTabs: [
      { id: 'library', label: 'Library', icon: Layers, description: 'Video content library' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance metrics' },
      { id: 'flow', label: 'Flow', icon: GitBranch, description: 'Pipeline visualization' },
      { id: 'repurpose', label: 'Repurpose', icon: FileText, description: 'Content repurposing' },
    ],
  },
  publish: {
    label: 'PUBLISH',
    icon: Share2,
    description: 'Distribution & Scheduling',
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
    create: defaultSubTab || 'styles',
    produce: 'generate',
    manage: 'library',
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

  // Regional dialect selection state
  const [selectedDialectCodes, setSelectedDialectCodes] = useState<string[]>(['en-US']);

  const metrics = calculateEcosystemMetrics();

  const setSubTab = useCallback((mainTab: ConsolidatedTab, subTab: string) => {
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

  return (
    <div className="space-y-4">
      {/* Main 4-Tab Navigation */}
      <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as ConsolidatedTab)}>
        <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-card border rounded-lg shadow-sm">
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

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CREATE TAB CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="create" className="mt-4 space-y-6">
          <AnimatePresence mode="wait">
            {currentSubTab === 'styles' && (
              <motion.div
                key="styles"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <GenieCastOverview
                  selectedStyles={selectedVideoStyles}
                  onStylesChange={onStylesChange}
                  onNavigate={(tab) => {
                    if (tab === 'screenshots') {
                      setSubTab('create', 'screenshots');
                    } else if (tab === 'messaging') {
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
                <Card className="mt-6 border-primary/20">
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
                        <div className="text-[10px] text-green-600">{metrics.providers.wiredToGenieCast} wired</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{metrics.videoStyles.total}</div>
                        <div className="text-xs text-muted-foreground">Video Styles</div>
                        <div className="text-[10px] text-green-600">{metrics.videoStyles.popular} popular</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{metrics.pipelines.active}</div>
                        <div className="text-xs text-muted-foreground">Active Pipelines</div>
                        <div className="text-[10px] text-muted-foreground">of {metrics.pipelines.total}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{metrics.zones}</div>
                        <div className="text-xs text-muted-foreground">Regional Zones</div>
                        <div className="text-[10px] text-green-600">4-zone routing</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Screenshots tab removed - now consolidated into Assets */}
            
            {currentSubTab === 'messaging' && (
              <motion.div
                key="messaging"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Cross-functional Authoring Stage Indicator */}
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
                
                {/* Regional Dialect Selector for multi-regional output */}
                <Card className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Regional Output Configuration
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Select target regions and dialects for transcreation (One Template → Many Videos)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegionalDialectSelector
                      onDialectsChange={handleDialectChange}
                      selectedDialects={selectedDialectCodes}
                    />
                  </CardContent>
                </Card>
                
                <MessagingGeneratorPanel />
              </motion.div>
            )}
            
            {currentSubTab === 'assets' && (
              <motion.div
                key="assets"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <BrandAssetsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PRODUCE TAB CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="produce" className="mt-4 space-y-6">
          <AnimatePresence mode="wait">
            {currentSubTab === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Quick Generate UI - imported from parent */}
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
                    setSubTab('create', 'screenshots');
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
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Film className="w-5 h-5" />
                      Composition Studio
                    </CardTitle>
                    <CardDescription>
                      Timeline-based video editing and chapter management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Timeline editor consolidates from /composition-studio</p>
                      <p className="text-sm">Chapter reordering, transitions, audio mixing</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {currentSubTab === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Review & Enhance
                    </CardTitle>
                    <CardDescription>
                      Quality check and AI-powered enhancements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Review consolidates from /review-enhance</p>
                      <p className="text-sm">Quality scoring, enhancement suggestions</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MANAGE TAB CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="manage" className="mt-4 space-y-6">
          <AnimatePresence mode="wait">
            {currentSubTab === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Content Library
                    </CardTitle>
                    <CardDescription>
                      All generated videos and marketing content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Library consolidates from /content-library</p>
                      <p className="text-sm">Video grid, search, filters, status tracking</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {currentSubTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analytics Dashboard
                    </CardTitle>
                    <CardDescription>
                      Performance metrics and usage statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px]">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <Card className="bg-primary/5">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-xs text-muted-foreground">Videos Generated</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-500/5">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-500/5">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-xs text-muted-foreground">Languages</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-500/5">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">$0</div>
                          <div className="text-xs text-muted-foreground">Cost Saved</div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="text-center text-muted-foreground py-8">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics consolidates from multiple sources</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
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
            
            {currentSubTab === 'repurpose' && (
              <motion.div
                key="repurpose"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Content Repurposing
                    </CardTitle>
                    <CardDescription>
                      Transform videos into shorts, clips, and other formats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Pipelines: video-shorts, video-thumbnail, video-captioning</p>
                      <p className="text-sm">Currently {inactivePipelines.length} dormant pipelines available</p>
                    </div>
                  </CardContent>
                </Card>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Content Scheduler
                    </CardTitle>
                    <CardDescription>
                      Plan and schedule content distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Scheduler consolidates from /scheduler</p>
                      <p className="text-sm">Calendar view, smart timing, batch scheduling</p>
                    </div>
                  </CardContent>
                </Card>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Multi-Platform Distribution
                    </CardTitle>
                    <CardDescription>
                      Publish to YouTube, TikTok, LinkedIn, Instagram, and more
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                      {['YouTube', 'TikTok', 'LinkedIn', 'Instagram', 'Twitter'].map(platform => (
                        <Card key={platform} className="border-dashed hover:border-primary/50 cursor-pointer transition-colors">
                          <CardContent className="p-4 text-center">
                            <Globe className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                            <p className="text-xs font-medium">{platform}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      SEO Optimizer
                    </CardTitle>
                    <CardDescription>
                      Optimize video titles, descriptions, and tags for search
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Pipeline: seo-optimizer</p>
                      <p className="text-sm">Keyword research, meta generation, tag suggestions</p>
                    </div>
                  </CardContent>
                </Card>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      A/B Testing
                    </CardTitle>
                    <CardDescription>
                      Create and test content variations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Pipeline: ab-test-generator (dormant)</p>
                      <p className="text-sm">Thumbnail variants, title testing, CTA optimization</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenieCastConsolidatedTabs;
