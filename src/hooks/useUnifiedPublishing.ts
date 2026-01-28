/**
 * useUnifiedPublishing - Ecosystem-wide publishing hook
 * 
 * Shared hook for publishing content across ALL Genie products:
 * - Spark, Mind, Vibe, Deck, Arc, Cast, Hub
 * 
 * Features:
 * - Multi-platform publishing
 * - Company page support (LinkedIn Company, Facebook Pages)
 * - Website/Blog integration
 * - Industry & Segment filtering
 * - Zapier/n8n webhook support
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  unifiedEcosystemPublishingService,
  type GenieProduct,
  type PublishingPlatform,
  type PublishingRequest,
  type PublishingResult,
  type PublishingTarget,
  type UserPublishingAccounts,
  type CompanyPage,
  type IndustrySegment,
  INDUSTRY_SEGMENTS,
} from '@/services/unifiedEcosystemPublishingService';

interface UseUnifiedPublishingOptions {
  sourceProduct: GenieProduct;
  industryContext?: IndustrySegment;
}

interface UseUnifiedPublishingReturn {
  // Account state
  accounts: UserPublishingAccounts | null;
  isLoadingAccounts: boolean;
  refreshAccounts: () => Promise<void>;
  
  // Publishing state
  isPublishing: boolean;
  publishProgress: number;
  publishResults: PublishingResult[];
  
  // Actions
  publishToMultiple: (request: Omit<PublishingRequest, 'sourceProduct'>) => Promise<PublishingResult[]>;
  publishToCompanyPages: (request: Omit<PublishingRequest, 'sourceProduct' | 'targets'>, pages: CompanyPage[]) => Promise<PublishingResult[]>;
  publishViaWebhook: (webhookId: string, content: any) => Promise<boolean>;
  
  // Helpers
  getIndustryHashtags: (industry: string, segment?: string) => string[];
  getOptimalTimes: (industry: string, platform: PublishingPlatform) => { day: number; hour: number }[];
  industries: typeof INDUSTRY_SEGMENTS;
  
  // Platform utilities
  connectedPlatforms: PublishingPlatform[];
  companyPages: CompanyPage[];
  hasCompanyPageAccess: boolean;
}

export const useUnifiedPublishing = (options: UseUnifiedPublishingOptions): UseUnifiedPublishingReturn => {
  const { sourceProduct, industryContext } = options;
  
  // State
  const [accounts, setAccounts] = useState<UserPublishingAccounts | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishResults, setPublishResults] = useState<PublishingResult[]>([]);

  // Load accounts on mount
  const refreshAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoadingAccounts(false);
        return;
      }

      const userAccounts = await unifiedEcosystemPublishingService.getUserPublishingAccounts(session.user.id);
      setAccounts(userAccounts);
    } catch (error) {
      console.error('[useUnifiedPublishing] Failed to load accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  // Publish to multiple platforms
  const publishToMultiple = useCallback(async (
    request: Omit<PublishingRequest, 'sourceProduct'>
  ): Promise<PublishingResult[]> => {
    setIsPublishing(true);
    setPublishProgress(0);
    setPublishResults([]);

    try {
      const fullRequest: PublishingRequest = {
        ...request,
        sourceProduct,
        industryContext: request.industryContext || industryContext,
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setPublishProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const results = await unifiedEcosystemPublishingService.publishToMultiple(fullRequest);
      
      clearInterval(progressInterval);
      setPublishProgress(100);
      setPublishResults(results);

      // Show results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0 && failCount === 0) {
        toast.success(`Published to ${successCount} platform${successCount > 1 ? 's' : ''}!`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`Published to ${successCount} platforms, ${failCount} failed`);
      } else {
        toast.error('Publishing failed to all platforms');
      }

      return results;
    } catch (error) {
      console.error('[useUnifiedPublishing] Publishing failed:', error);
      toast.error('Publishing failed');
      return [];
    } finally {
      setIsPublishing(false);
    }
  }, [sourceProduct, industryContext]);

  // Publish to all company pages (admin function)
  const publishToCompanyPages = useCallback(async (
    request: Omit<PublishingRequest, 'sourceProduct' | 'targets'>,
    pages: CompanyPage[]
  ): Promise<PublishingResult[]> => {
    setIsPublishing(true);
    setPublishProgress(0);

    try {
      const fullRequest: PublishingRequest = {
        ...request,
        sourceProduct,
        industryContext: request.industryContext || industryContext,
        targets: [], // Will be generated from pages
        companyPages: pages,
        publishAsCompanyAdmin: true
      };

      const progressInterval = setInterval(() => {
        setPublishProgress(prev => Math.min(prev + 5, 90));
      }, 300);

      const results = await unifiedEcosystemPublishingService.adminPublishToAllCompanyPages(fullRequest, pages);
      
      clearInterval(progressInterval);
      setPublishProgress(100);
      setPublishResults(results);

      const successCount = results.filter(r => r.success).length;
      toast.success(`Published to ${successCount} company page${successCount > 1 ? 's' : ''}!`);

      return results;
    } catch (error) {
      console.error('[useUnifiedPublishing] Company page publishing failed:', error);
      toast.error('Failed to publish to company pages');
      return [];
    } finally {
      setIsPublishing(false);
    }
  }, [sourceProduct, industryContext]);

  // Publish via webhook (Zapier/n8n)
  const publishViaWebhook = useCallback(async (webhookId: string, content: any): Promise<boolean> => {
    try {
      const webhook = accounts?.webhooks.find(w => w.id === webhookId);
      if (!webhook) {
        toast.error('Webhook not found');
        return false;
      }

      await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          ...content,
          sourceProduct,
          industryContext,
          timestamp: new Date().toISOString()
        })
      });

      toast.success(`Sent to ${webhook.name}`);
      return true;
    } catch (error) {
      console.error('[useUnifiedPublishing] Webhook failed:', error);
      toast.error('Webhook request failed');
      return false;
    }
  }, [accounts, sourceProduct, industryContext]);

  // Helper functions
  const getIndustryHashtags = useCallback((industry: string, segment?: string) => {
    return unifiedEcosystemPublishingService.getIndustryHashtags(industry, segment);
  }, []);

  const getOptimalTimes = useCallback((industry: string, platform: PublishingPlatform) => {
    return unifiedEcosystemPublishingService.getOptimalPostingTimes(industry, platform);
  }, []);

  // Derived state
  const connectedPlatforms: PublishingPlatform[] = accounts?.personalAccounts
    .filter(a => a.connected)
    .map(a => a.platform) || [];

  const companyPages: CompanyPage[] = accounts?.companyPages || [];
  const hasCompanyPageAccess = companyPages.length > 0;

  return {
    // Account state
    accounts,
    isLoadingAccounts,
    refreshAccounts,
    
    // Publishing state
    isPublishing,
    publishProgress,
    publishResults,
    
    // Actions
    publishToMultiple,
    publishToCompanyPages,
    publishViaWebhook,
    
    // Helpers
    getIndustryHashtags,
    getOptimalTimes,
    industries: INDUSTRY_SEGMENTS,
    
    // Platform utilities
    connectedPlatforms,
    companyPages,
    hasCompanyPageAccess,
  };
};

export default useUnifiedPublishing;
