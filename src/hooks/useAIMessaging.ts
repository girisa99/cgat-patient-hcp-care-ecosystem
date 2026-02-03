/**
 * useAIMessaging Hook
 * 
 * React hook for generating and managing AI-powered marketing messaging
 * with approval workflow integration.
 */

import { useState, useCallback } from 'react';
import {
  aiMessagingGeneratorService,
  type MessagingRequest,
  type GeneratedMessaging,
  type CompetitorAnalysis,
  TARGET_AUDIENCES,
  COMPETITOR_DATABASE,
  MESSAGING_FRAMEWORKS,
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
    }
  ) => Promise<GeneratedMessaging | null>;
  
  /** Get pending approval requests */
  pendingApprovals: MessagingRequest[];
  
  /** Approve messaging */
  approveMessaging: (requestId: string, approvedBy: string) => void;
  
  /** Reject messaging */
  rejectMessaging: (requestId: string, reason: string) => void;
  
  /** Get approved messaging for product/feature */
  getApprovedMessaging: (productId: string, featureId?: string) => GeneratedMessaging | null;
  
  /** Generate battle card vs competitor */
  generateBattleCard: (productId: GenieProductId, competitorId: string) => CompetitorAnalysis | null;
  
  /** Available target audiences */
  targetAudiences: typeof TARGET_AUDIENCES;
  
  /** Available competitors */
  competitors: typeof COMPETITOR_DATABASE;
  
  /** Messaging frameworks */
  frameworks: typeof MESSAGING_FRAMEWORKS;
  
  /** Available products */
  products: typeof GENIE_PRODUCTS;
  
  /** Current generation state */
  isGenerating: boolean;
  
  /** Latest generated messaging */
  latestMessaging: GeneratedMessaging | null;
}

export function useAIMessaging(options: UseAIMessagingOptions = {}): UseAIMessagingReturn {
  const { showNotifications = true } = options;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestMessaging, setLatestMessaging] = useState<GeneratedMessaging | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<MessagingRequest[]>(
    aiMessagingGeneratorService.getPendingApprovals()
  );

  // Refresh pending approvals
  const refreshPendingApprovals = useCallback(() => {
    setPendingApprovals(aiMessagingGeneratorService.getPendingApprovals());
  }, []);

  // Generate messaging
  const generateMessaging = useCallback(async (
    productId: GenieProductId,
    opts: {
      featureId?: string;
      featureName?: string;
      type: 'product' | 'feature' | 'comparison' | 'tutorial';
      targetAudience: string[];
      competitors?: string[];
    }
  ): Promise<GeneratedMessaging | null> => {
    setIsGenerating(true);
    
    try {
      // Create request
      const request = aiMessagingGeneratorService.createRequest(productId, opts);
      
      if (showNotifications) {
        toast.info(`Generating messaging for ${GENIE_PRODUCTS[productId].name}...`);
      }
      
      // Generate messaging
      const messaging = await aiMessagingGeneratorService.generateMessaging(request.id);
      
      setLatestMessaging(messaging);
      refreshPendingApprovals();
      
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

  // Approve messaging
  const approveMessaging = useCallback((requestId: string, approvedBy: string) => {
    try {
      aiMessagingGeneratorService.approveMessaging(requestId, approvedBy);
      refreshPendingApprovals();
      
      if (showNotifications) {
        toast.success('Messaging approved!');
      }
    } catch (error) {
      console.error('[useAIMessaging] Approval failed:', error);
      if (showNotifications) {
        toast.error('Failed to approve messaging');
      }
    }
  }, [showNotifications, refreshPendingApprovals]);

  // Reject messaging
  const rejectMessaging = useCallback((requestId: string, reason: string) => {
    try {
      aiMessagingGeneratorService.rejectMessaging(requestId, reason);
      refreshPendingApprovals();
      
      if (showNotifications) {
        toast.info('Messaging rejected. Regenerate with feedback.');
      }
    } catch (error) {
      console.error('[useAIMessaging] Rejection failed:', error);
    }
  }, [showNotifications, refreshPendingApprovals]);

  // Get approved messaging
  const getApprovedMessaging = useCallback((productId: string, featureId?: string) => {
    return aiMessagingGeneratorService.getApprovedMessaging(productId, featureId);
  }, []);

  // Generate battle card
  const generateBattleCard = useCallback((productId: GenieProductId, competitorId: string) => {
    return aiMessagingGeneratorService.generateBattleCard(productId, competitorId);
  }, []);

  return {
    generateMessaging,
    pendingApprovals,
    approveMessaging,
    rejectMessaging,
    getApprovedMessaging,
    generateBattleCard,
    targetAudiences: TARGET_AUDIENCES,
    competitors: COMPETITOR_DATABASE,
    frameworks: MESSAGING_FRAMEWORKS,
    products: GENIE_PRODUCTS,
    isGenerating,
    latestMessaging,
  };
}

export default useAIMessaging;
