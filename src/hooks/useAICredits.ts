import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Credit Package Configuration
export interface CreditPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price_cents: number;
  bonus_credits: number;
  discount_percent: number;
  is_active: boolean;
}

// Feature Cost Configuration
export interface FeatureCost {
  id: string;
  feature_name: string;
  display_name: string;
  description: string | null;
  credits_per_unit: number;
  unit_type: string;
  category: string;
}

// Credit Transaction
export interface CreditTransaction {
  id: string;
  transaction_type: string;
  credits_amount: number;
  balance_after: number;
  feature_used: string | null;
  description: string | null;
  created_at: string;
}

// User Credits State
export interface UserCredits {
  credits_balance: number;
  credits_used_total: number;
  credits_purchased_total: number;
  subscription_credits_monthly: number;
  subscription_credits_used: number;
}

// Segment-specific pricing tiers
export const SEGMENT_CREDIT_TIERS = {
  traveler: {
    name: 'Traveler',
    description: 'Budget-conscious travel content creators',
    recommendedPackage: 'credits_50',
    maxMonthly: 150, // Limit monthly spending
    specialPricing: true,
    discount: 20, // 20% discount for travelers
  },
  creator: {
    name: 'Creator',
    description: 'Solo content creators and influencers',
    recommendedPackage: 'credits_150',
    maxMonthly: 500,
    specialPricing: false,
    discount: 0,
  },
  smallBusiness: {
    name: 'Small Business',
    description: 'Small business marketing teams',
    recommendedPackage: 'credits_500',
    maxMonthly: 2000,
    specialPricing: false,
    discount: 5,
  },
  education: {
    name: 'Education',
    description: 'Teachers and educational institutions',
    recommendedPackage: 'credits_500',
    maxMonthly: 1500,
    specialPricing: true,
    discount: 25, // Education discount
  },
  healthcare: {
    name: 'Healthcare',
    description: 'Healthcare providers and institutions',
    recommendedPackage: 'credits_1000',
    maxMonthly: 5000,
    specialPricing: false,
    discount: 0,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Large organizations and agencies',
    recommendedPackage: 'credits_2500',
    maxMonthly: -1, // Unlimited
    specialPricing: false,
    discount: 15,
  },
} as const;

export type SegmentType = keyof typeof SEGMENT_CREDIT_TIERS;

export interface UseAICreditsReturn {
  credits: UserCredits | null;
  packages: CreditPackage[];
  featureCosts: FeatureCost[];
  recentTransactions: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  purchaseCredits: (packageId: string) => Promise<string | null>;
  useCredits: (featureId: string, units?: number, metadata?: Record<string, any>) => Promise<{
    success: boolean;
    credits_deducted?: number;
    balance_after?: number;
    error?: string;
  }>;
  canAfford: (featureId: string, units?: number) => boolean;
  getFeatureCost: (featureId: string) => FeatureCost | undefined;
  formatPrice: (cents: number) => string;
  getPackageValue: (pkg: CreditPackage) => number; // Credits per dollar
}

export const useAICredits = (): UseAICreditsReturn => {
  const { toast } = useToast();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [featureCosts, setFeatureCosts] = useState<FeatureCost[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCredits(null);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('get-ai-credits');
      
      if (fnError) {
        console.error('Error fetching credits:', fnError);
        setError(fnError.message);
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      setCredits({
        credits_balance: data.credits_balance || 0,
        credits_used_total: data.credits_used_total || 0,
        credits_purchased_total: data.credits_purchased_total || 0,
        subscription_credits_monthly: data.subscription_credits_monthly || 0,
        subscription_credits_used: data.subscription_credits_used || 0,
      });
      setPackages(data.available_packages || []);
      setFeatureCosts(data.feature_costs || []);
      setRecentTransactions(data.recent_transactions || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch credits';
      console.error('Credits fetch error:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchaseCredits = useCallback(async (packageId: string): Promise<string | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('purchase-credits', {
        body: { packageId }
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      return data?.url || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout';
      toast({
        title: "Purchase Error",
        description: message,
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const useCredits = useCallback(async (
    featureId: string, 
    units: number = 1, 
    metadata: Record<string, any> = {}
  ) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('use-ai-credits', {
        body: { featureId, units, metadata }
      });

      if (fnError) throw new Error(fnError.message);
      
      if (!data?.success) {
        return {
          success: false,
          error: data?.error || 'Failed to use credits',
          balance_after: data?.balance
        };
      }

      // Update local state
      if (credits) {
        setCredits({
          ...credits,
          credits_balance: data.balance_after,
          credits_used_total: credits.credits_used_total + data.credits_deducted
        });
      }

      return {
        success: true,
        credits_deducted: data.credits_deducted,
        balance_after: data.balance_after
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to use credits';
      return { success: false, error: message };
    }
  }, [credits]);

  const canAfford = useCallback((featureId: string, units: number = 1): boolean => {
    if (!credits) return false;
    const feature = featureCosts.find(f => f.id === featureId);
    if (!feature) return false;
    return credits.credits_balance >= (feature.credits_per_unit * units);
  }, [credits, featureCosts]);

  const getFeatureCost = useCallback((featureId: string): FeatureCost | undefined => {
    return featureCosts.find(f => f.id === featureId);
  }, [featureCosts]);

  const formatPrice = useCallback((cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  }, []);

  const getPackageValue = useCallback((pkg: CreditPackage): number => {
    const totalCredits = pkg.credits + pkg.bonus_credits;
    const dollars = pkg.price_cents / 100;
    return Math.round(totalCredits / dollars);
  }, []);

  // Fetch credits on mount and auth changes
  useEffect(() => {
    refreshCredits();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshCredits();
      } else if (event === 'SIGNED_OUT') {
        setCredits(null);
        setPackages([]);
        setFeatureCosts([]);
        setRecentTransactions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshCredits]);

  return {
    credits,
    packages,
    featureCosts,
    recentTransactions,
    isLoading,
    error,
    refreshCredits,
    purchaseCredits,
    useCredits,
    canAfford,
    getFeatureCost,
    formatPrice,
    getPackageValue
  };
};
