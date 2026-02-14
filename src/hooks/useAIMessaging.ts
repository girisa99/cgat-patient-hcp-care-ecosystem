/**
 * useAIMessaging Hook
 * 
 * React hook for generating and managing AI-powered marketing messaging
 * with approval workflow integration and multi-variant support.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  aiMessagingGeneratorService,
  type MessagingRequest,
  type GeneratedMessaging,
  type CompetitorAnalysis,
  type CreativeAngle,
  type ProductionCapability,
  TARGET_AUDIENCES,
  COMPETITOR_DATABASE,
  MESSAGING_FRAMEWORKS,
  CREATIVE_ANGLES,
  PRODUCTION_CONTEXT_TONES,
  getCreativeAnglesForCount,
} from '@/services/marketing/aiMessagingGeneratorService';
import { type GenieProductId, GENIE_PRODUCTS } from '@/services/marketing/productVersionTrackingService';
import { toast } from 'sonner';

interface UseAIMessagingOptions {
  /** Show toast notifications */
  showNotifications?: boolean;
}

interface UseAIMessagingReturn {
  /** Create and generate messaging for a product/feature */
  generateMessaging: (
    productId: GenieProductId,
    options: {
      featureId?: string;
      featureName?: string;
      type: 'product' | 'feature' | 'comparison' | 'tutorial';
      targetAudience: string[];
      competitors?: string[];
      regionCode?: string;
      subRegionCode?: string;
      productionCapability?: ProductionCapability;
      secondaryProductionCapability?: ProductionCapability;
      isEnglishBase?: boolean;
      parentMessagingId?: string;
      routingZone?: string;
    }
  ) => Promise<GeneratedMessaging | null>;
  
  /** Generate multiple messaging variants with different creative angles */
  generateVariants: (
    productId: GenieProductId,
    options: {
      featureId?: string;
      featureName?: string;
      type: 'product' | 'feature' | 'comparison' | 'tutorial';
      targetAudience: string[];
      competitors?: string[];
      variantCount: number;
      regionCode?: string;
      subRegionCode?: string;
      productionCapability?: ProductionCapability;
      secondaryProductionCapability?: ProductionCapability;
      isEnglishBase?: boolean;
      parentMessagingId?: string;
      routingZone?: string;
    }
  ) => Promise<GeneratedMessaging[]>;
  
  /** Get pending approval requests */
  pendingApprovals: MessagingRequest[];
  
  /** Approve messaging (persists to database) */
  approveMessaging: (requestId: string, approvedBy: string) => Promise<void>;
  
  /** Reject messaging */
  rejectMessaging: (requestId: string, reason: string) => void;
  
  /** Get approved messaging for product/feature */
  getApprovedMessaging: (productId: string, featureId?: string) => GeneratedMessaging | null;
  
  /** Get generated messaging by request ID */
  getMessagingForRequest: (requestId: string) => GeneratedMessaging | null;
  
  /** Generate battle card vs competitor */
  generateBattleCard: (productId: GenieProductId, competitorId: string) => CompetitorAnalysis | null;
  
  /** Available target audiences */
  targetAudiences: typeof TARGET_AUDIENCES;
  
  /** Available competitors */
  competitors: typeof COMPETITOR_DATABASE;
  
  /** Messaging frameworks */
  frameworks: typeof MESSAGING_FRAMEWORKS;
  
  /** Creative angles */
  creativeAngles: typeof CREATIVE_ANGLES;
  
  /** Production context tones */
  productionTones: typeof PRODUCTION_CONTEXT_TONES;
  
  /** Available products */
  products: typeof GENIE_PRODUCTS;
  
  /** Current generation state */
  isGenerating: boolean;
  
  /** Latest generated messaging */
  latestMessaging: GeneratedMessaging | null;
  
  /** All generated variants from last batch */
  latestVariants: GeneratedMessaging[];
  
  /** Generation progress for variants */
  variantProgress: { current: number; total: number };
}

export function useAIMessaging(options: UseAIMessagingOptions = {}): UseAIMessagingReturn {
  const { showNotifications = true } = options;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestMessaging, setLatestMessaging] = useState<GeneratedMessaging | null>(null);
  const [latestVariants, setLatestVariants] = useState<GeneratedMessaging[]>([]);
  const [variantProgress, setVariantProgress] = useState({ current: 0, total: 0 });
  const [pendingApprovals, setPendingApprovals] = useState<MessagingRequest[]>(
    aiMessagingGeneratorService.getPendingApprovals()
  );

  // Load persisted messaging from DB on mount (both approved and pending)
  useEffect(() => {
    aiMessagingGeneratorService.loadPersistedMessaging().then(loaded => {
      if (loaded.length > 0 && !latestMessaging) {
        const approved = loaded.filter(m => m.isApproved);
        const pending = loaded.filter(m => m.status === 'pending');
        if (approved.length > 0) {
          setLatestMessaging(approved[0]);
          setLatestVariants(approved);
        }
        console.log(`[useAIMessaging] Loaded ${loaded.length} entries (${approved.length} approved, ${pending.length} pending)`);
      }
      // Refresh pending from hydrated cache
      setPendingApprovals(aiMessagingGeneratorService.getPendingApprovals());
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshPendingApprovals = useCallback(async () => {
    // Refresh from DB to stay in sync (end-to-end DB-backed like scripts/TTS)
    const { requests } = await aiMessagingGeneratorService.loadPendingFromDb();
    setPendingApprovals(requests);
  }, []);

  // Generate single messaging
  const generateMessaging = useCallback(async (
    productId: GenieProductId,
    opts: {
      featureId?: string;
      featureName?: string;
      type: 'product' | 'feature' | 'comparison' | 'tutorial';
      targetAudience: string[];
      competitors?: string[];
      regionCode?: string;
      subRegionCode?: string;
      productionCapability?: ProductionCapability;
      secondaryProductionCapability?: ProductionCapability;
      isEnglishBase?: boolean;
      parentMessagingId?: string;
      routingZone?: string;
    }
  ): Promise<GeneratedMessaging | null> => {
    setIsGenerating(true);
    
    try {
      const request = aiMessagingGeneratorService.createRequest(productId, opts);
      
      if (showNotifications) {
        toast.info(`Generating messaging for ${GENIE_PRODUCTS[productId].name}...`);
      }
      
      const messaging = await aiMessagingGeneratorService.generateMessaging(request.id);
      
      setLatestMessaging(messaging);
      setLatestVariants([messaging]);
      await refreshPendingApprovals();
      
      if (showNotifications) {
        toast.success('Messaging generated! Awaiting approval.', {
          description: `Headline: "${messaging.headline.slice(0, 50)}..."`,
        });
      }
      
      return messaging;
    } catch (error) {
      console.error('[useAIMessaging] Generation failed:', error);
      if (showNotifications) {
        toast.error('Failed to generate messaging');
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [showNotifications, refreshPendingApprovals]);

  // Generate multiple variants
  const generateVariants = useCallback(async (
    productId: GenieProductId,
    opts: {
      featureId?: string;
      featureName?: string;
      type: 'product' | 'feature' | 'comparison' | 'tutorial';
      targetAudience: string[];
      competitors?: string[];
      variantCount: number;
      regionCode?: string;
      subRegionCode?: string;
      productionCapability?: ProductionCapability;
      isEnglishBase?: boolean;
      parentMessagingId?: string;
      routingZone?: string;
    }
  ): Promise<GeneratedMessaging[]> => {
    setIsGenerating(true);
    setVariantProgress({ current: 0, total: opts.variantCount });
    setLatestVariants([]);
    
    try {
      if (showNotifications) {
        const angles = getCreativeAnglesForCount(opts.variantCount);
        toast.info(`Generating ${opts.variantCount} variants for ${GENIE_PRODUCTS[productId].name}`, {
          description: `Angles: ${angles.map(a => CREATIVE_ANGLES[a].name).join(', ')}`,
        });
      }
      
      const variants = await aiMessagingGeneratorService.generateMessagingVariants(productId, opts);
      
      setLatestVariants(variants);
      setLatestMessaging(variants[0] || null);
      setVariantProgress({ current: variants.length, total: opts.variantCount });
      await refreshPendingApprovals();
      
      if (showNotifications) {
        toast.success(`${variants.length} variants generated! Awaiting approval.`);
      }
      
      return variants;
    } catch (error) {
      console.error('[useAIMessaging] Variant generation failed:', error);
      if (showNotifications) {
        toast.error('Failed to generate variants');
      }
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [showNotifications, refreshPendingApprovals]);

  // Approve messaging (now async - persists to DB)
  const approveMessaging = useCallback(async (requestId: string, approvedBy: string) => {
    try {
      await aiMessagingGeneratorService.approveMessaging(requestId, approvedBy);
      await refreshPendingApprovals();
      if (showNotifications) toast.success('Messaging approved & saved!');
    } catch (error) {
      console.error('[useAIMessaging] Approval failed:', error);
      if (showNotifications) toast.error('Failed to approve messaging');
    }
  }, [showNotifications, refreshPendingApprovals]);

  // Reject messaging
  const rejectMessaging = useCallback(async (requestId: string, reason: string) => {
    try {
      aiMessagingGeneratorService.rejectMessaging(requestId, reason);
      await refreshPendingApprovals();
      if (showNotifications) toast.info('Messaging rejected. Regenerate with feedback.');
    } catch (error) {
      console.error('[useAIMessaging] Rejection failed:', error);
    }
  }, [showNotifications, refreshPendingApprovals]);

  const getApprovedMessaging = useCallback((productId: string, featureId?: string) => {
    return aiMessagingGeneratorService.getApprovedMessaging(productId, featureId);
  }, []);

  const getMessagingForRequest = useCallback((requestId: string) => {
    return aiMessagingGeneratorService.getMessaging(requestId);
  }, []);

  const generateBattleCard = useCallback((productId: GenieProductId, competitorId: string) => {
    return aiMessagingGeneratorService.generateBattleCard(productId, competitorId);
  }, []);

  return {
    generateMessaging,
    generateVariants,
    pendingApprovals,
    approveMessaging,
    rejectMessaging,
    getApprovedMessaging,
    getMessagingForRequest,
    generateBattleCard,
    targetAudiences: TARGET_AUDIENCES,
    competitors: COMPETITOR_DATABASE,
    frameworks: MESSAGING_FRAMEWORKS,
    creativeAngles: CREATIVE_ANGLES,
    productionTones: PRODUCTION_CONTEXT_TONES,
    products: GENIE_PRODUCTS,
    isGenerating,
    latestMessaging,
    latestVariants,
    variantProgress,
  };
}

export default useAIMessaging;
