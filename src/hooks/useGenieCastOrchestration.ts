/**
 * useGenieCastOrchestration Hook
 * 
 * React hook for unified Genie Cast video generation pipeline.
 * Ties together screenshots, messaging, scripts, and video assembly.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  genieCastOrchestrationService,
  type ProductScreenshot,
  type VideoGenerationRequest,
  type GenerationPipeline,
  type LocalizedScript,
  LANGUAGE_NAMES,
} from '@/services/marketing/genieCastOrchestrationService';
import { type GenieProductId, GENIE_PRODUCTS } from '@/services/marketing/productVersionTrackingService';
import { toast } from 'sonner';

interface UseGenieCastOrchestrationOptions {
  showNotifications?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ProductReadiness {
  id: GenieProductId;
  name: string;
  screenshotCount: number;
  hasApprovedMessaging: boolean;
  screenshots: ProductScreenshot[];
  readiness: {
    screenshotsReady: boolean;
    messagingReady: boolean;
    scriptsReady: boolean;
    issues: string[];
  };
}

interface UseGenieCastOrchestrationReturn {
  // Data
  products: ProductReadiness[];
  languages: string[];
  tiers: string[];
  activePipeline: GenerationPipeline | null;
  allPipelines: GenerationPipeline[];

  // Screenshots
  getScreenshots: (productId: GenieProductId) => Promise<ProductScreenshot[]>;
  refreshScreenshots: (productId?: GenieProductId) => Promise<void>;

  // Scripts
  buildScript: (productId: GenieProductId, languageCode: string) => Promise<LocalizedScript>;

  // Generation
  startQuickGenerate: (languages: string[], options?: Partial<VideoGenerationRequest>) => Promise<GenerationPipeline>;
  startMatrixGenerate: (request: VideoGenerationRequest) => Promise<GenerationPipeline>;
  startFeatureGenerate: (productId: GenieProductId, featureId: string, languages: string[]) => Promise<GenerationPipeline>;

  // Status
  isLoading: boolean;
  isGenerating: boolean;
  progress: number;
  getReadinessStatus: (productId: GenieProductId) => ProductReadiness['readiness'];
}

export function useGenieCastOrchestration(
  options: UseGenieCastOrchestrationOptions = {}
): UseGenieCastOrchestrationReturn {
  const { showNotifications = true, autoRefresh = false, refreshInterval = 30000 } = options;

  const [products, setProducts] = useState<ProductReadiness[]>([]);
  const [languages] = useState(Object.keys(LANGUAGE_NAMES));
  const [tiers] = useState(['free', 'starter', 'pro', 'enterprise']);
  const [activePipeline, setActivePipeline] = useState<GenerationPipeline | null>(null);
  const [allPipelines, setAllPipelines] = useState<GenerationPipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const matrixData = await genieCastOrchestrationService.getMatrixData();
      
      const productReadiness: ProductReadiness[] = matrixData.products.map(p => ({
        ...p,
        readiness: genieCastOrchestrationService.getReadinessStatus(p.id),
      }));

      setProducts(productReadiness);
    } catch (err) {
      console.error('[useGenieCastOrchestration] Load failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadData]);

  // Subscribe to pipeline updates
  useEffect(() => {
    const unsubscribe = genieCastOrchestrationService.onPipelineUpdate((pipeline) => {
      setActivePipeline(pipeline);
      setIsGenerating(pipeline.status === 'running');
      
      // Update all pipelines list
      setAllPipelines(prev => {
        const existing = prev.findIndex(p => p.requestId === pipeline.requestId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = pipeline;
          return updated;
        }
        return [...prev, pipeline];
      });

      // Show notifications
      if (showNotifications) {
        if (pipeline.status === 'complete') {
          const successCount = pipeline.results.filter(r => r.videoUrl).length;
          toast.success(`Generation complete: ${successCount}/${pipeline.totalJobs} videos created`);
        } else if (pipeline.status === 'error') {
          toast.error('Generation pipeline failed');
        }
      }
    });

    return unsubscribe;
  }, [showNotifications]);

  // Get screenshots for a product
  const getScreenshots = useCallback(async (productId: GenieProductId): Promise<ProductScreenshot[]> => {
    return genieCastOrchestrationService.getProductScreenshots(productId);
  }, []);

  // Refresh screenshots
  const refreshScreenshots = useCallback(async (productId?: GenieProductId): Promise<void> => {
    genieCastOrchestrationService.clearScreenshotCache(productId);
    await loadData();
    if (showNotifications) {
      toast.success('Screenshots refreshed');
    }
  }, [loadData, showNotifications]);

  // Build localized script
  const buildScript = useCallback(async (
    productId: GenieProductId,
    languageCode: string
  ): Promise<LocalizedScript> => {
    const context = await genieCastOrchestrationService.getMessagingContext(productId, languageCode);
    return genieCastOrchestrationService.buildLocalizedScript(context);
  }, []);

  // Quick generate (all products for selected languages)
  const startQuickGenerate = useCallback(async (
    selectedLanguages: string[],
    opts: Partial<VideoGenerationRequest> = {}
  ): Promise<GenerationPipeline> => {
    if (showNotifications) {
      toast.info(`Starting quick generation for ${selectedLanguages.length} language(s)...`);
    }

    const request: VideoGenerationRequest = {
      id: `quick_${Date.now()}`,
      mode: 'quick',
      languages: selectedLanguages,
      products: Object.keys(GENIE_PRODUCTS) as GenieProductId[],
      useApprovedMessaging: true,
      includeScreenshots: true,
      quality: 'production',
      ...opts,
    };

    return genieCastOrchestrationService.startGenerationPipeline(request);
  }, [showNotifications]);

  // Matrix generate (custom combinations)
  const startMatrixGenerate = useCallback(async (
    request: VideoGenerationRequest
  ): Promise<GenerationPipeline> => {
    if (showNotifications) {
      const totalJobs = request.languages.length * request.products.length * (request.tiers?.length || 1);
      toast.info(`Starting matrix generation: ${totalJobs} videos...`);
    }

    return genieCastOrchestrationService.startGenerationPipeline(request);
  }, [showNotifications]);

  // Feature-specific generate
  const startFeatureGenerate = useCallback(async (
    productId: GenieProductId,
    featureId: string,
    selectedLanguages: string[]
  ): Promise<GenerationPipeline> => {
    if (showNotifications) {
      toast.info(`Generating feature video for ${GENIE_PRODUCTS[productId].name}...`);
    }

    const request: VideoGenerationRequest = {
      id: `feature_${Date.now()}`,
      mode: 'feature',
      languages: selectedLanguages,
      products: [productId],
      useApprovedMessaging: true,
      includeScreenshots: true,
      quality: 'production',
    };

    return genieCastOrchestrationService.startGenerationPipeline(request);
  }, [showNotifications]);

  // Get readiness status
  const getReadinessStatus = useCallback((productId: GenieProductId) => {
    return genieCastOrchestrationService.getReadinessStatus(productId);
  }, []);

  // Calculate progress
  const progress = activePipeline
    ? Math.round((activePipeline.completedJobs / activePipeline.totalJobs) * 100)
    : 0;

  return {
    products,
    languages,
    tiers,
    activePipeline,
    allPipelines,
    getScreenshots,
    refreshScreenshots,
    buildScript,
    startQuickGenerate,
    startMatrixGenerate,
    startFeatureGenerate,
    isLoading,
    isGenerating,
    progress,
    getReadinessStatus,
  };
}

export default useGenieCastOrchestration;
