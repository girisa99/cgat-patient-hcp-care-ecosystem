import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Stripe product/price mappings for Genie Studio tiers
export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    price_id: 'price_1RcuqjLkMzXLFD6lgODL8TGA',
    product_id: 'prod_STVvS8axANDSwJ',
    price: 29.99,
    features: ['5 AI Agents', 'Basic RAG', 'Community Support', '1,000 API calls/month']
  },
  business: {
    name: 'Business',
    price_id: 'price_1Rcur3LkMzXLFD6l7sIFDyHE',
    product_id: 'prod_STVwMyqVuPDe6J',
    price: 49.99,
    features: ['25 AI Agents', 'Advanced RAG', 'Priority Support', '10,000 API calls/month', 'Custom Branding']
  },
  pro: {
    name: 'Pro',
    price_id: 'price_1RcurPLkMzXLFD6lHlz7yLLy',
    product_id: 'prod_STVwrfRNQCBILz',
    price: 79.99,
    features: ['Unlimited Agents', 'Enterprise RAG', '24/7 Support', 'Unlimited API calls', 'White Label', 'Custom Integrations']
  },
  beta: {
    name: 'Beta',
    price_id: null,
    product_id: null,
    price: 0,
    features: ['Full Access', 'All Features', 'Beta Tester Perks', 'Lifetime Benefits']
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export interface SubscriptionStatus {
  subscribed: boolean;
  tier: SubscriptionTier | null;
  product_id: string | null;
  price_id: string | null;
  subscription_end: string | null;
  source: 'stripe' | 'database' | null;
}

export interface UseSubscriptionReturn {
  subscription: SubscriptionStatus;
  isLoading: boolean;
  error: string | null;
  checkSubscription: () => Promise<void>;
  createCheckout: (tier: SubscriptionTier) => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
  hasModuleAccess: (moduleKey: string) => boolean;
  getTierFeatures: (tier: SubscriptionTier) => string[];
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: null,
    product_id: null,
    price_id: null,
    subscription_end: null,
    source: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscription({
          subscribed: false,
          tier: null,
          product_id: null,
          price_id: null,
          subscription_end: null,
          source: null
        });
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('check-subscription');
      
      if (fnError) {
        console.error('Error checking subscription:', fnError);
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Map tier name from response
      let tierKey: SubscriptionTier | null = null;
      if (data.tier) {
        const tierName = data.tier.toLowerCase();
        if (tierName in SUBSCRIPTION_TIERS) {
          tierKey = tierName as SubscriptionTier;
        }
      }

      setSubscription({
        subscribed: data.subscribed || false,
        tier: tierKey,
        product_id: data.product_id || null,
        price_id: data.price_id || null,
        subscription_end: data.subscription_end || null,
        source: data.source || null
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check subscription';
      console.error('Subscription check error:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCheckout = useCallback(async (tier: SubscriptionTier): Promise<string | null> => {
    try {
      const tierConfig = SUBSCRIPTION_TIERS[tier];
      if (!tierConfig.price_id) {
        toast({
          title: "Cannot checkout",
          description: "This tier does not require payment",
          variant: "destructive"
        });
        return null;
      }

      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tierConfig.price_id }
      });

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      return data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout';
      toast({
        title: "Checkout Error",
        description: message,
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const openCustomerPortal = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('customer-portal');

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      return data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open customer portal';
      toast({
        title: "Portal Error",
        description: message,
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const hasModuleAccess = useCallback((moduleKey: string): boolean => {
    // Beta users have full access
    if (subscription.tier === 'beta') return true;
    
    // If not subscribed, no access
    if (!subscription.subscribed) return false;

    // For now, all paid tiers have access to all modules
    // This can be extended with the subscription_modules table
    return true;
  }, [subscription]);

  const getTierFeatures = useCallback((tier: SubscriptionTier): string[] => {
    return [...(SUBSCRIPTION_TIERS[tier]?.features || [])];
  }, []);

  // Check subscription on mount and when auth changes
  useEffect(() => {
    checkSubscription();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkSubscription();
        } else if (event === 'SIGNED_OUT') {
          setSubscription({
            subscribed: false,
            tier: null,
            product_id: null,
            price_id: null,
            subscription_end: null,
            source: null
          });
        }
      }
    );

    // Auto-refresh every 60 seconds
    const interval = setInterval(checkSubscription, 60000);

    return () => {
      authSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSubscription]);

  return {
    subscription,
    isLoading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    hasModuleAccess,
    getTierFeatures
  };
};
