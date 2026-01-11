import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Genie Product Suite
export const GENIE_PRODUCTS = {
  studio: {
    id: 'studio',
    name: 'Genie Studio',
    tagline: 'AI Agent Builder & Orchestrator',
    description: 'Build, deploy, and manage AI agents with visual workflows',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    features: ['Visual Agent Builder', 'Workflow Orchestration', 'Multi-Model Support', 'RAG Integration']
  },
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Instant AI Prototyping',
    description: 'Rapid AI agent prototyping with natural language',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    features: ['Prompt-to-Agent', 'Quick Deploy', 'Template Library', 'One-Click Testing']
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'AI Recording Studio',
    description: 'Professional AI-powered recording and production',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    features: ['AI Voice Generation', 'Script Enhancement', 'Background Blur', 'Multi-Track Recording']
  },
  arc: {
    id: 'arc',
    name: 'Genie Arc',
    tagline: 'Team Collaboration Hub',
    description: 'Collaborative production and show management',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    features: ['Show Management', 'Team Collaboration', 'Multi-Guest Support', 'Live Streaming']
  },
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'Knowledge & RAG Engine',
    description: 'Enterprise knowledge base with semantic search',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    features: ['Vector Search', 'Document Ingestion', 'Knowledge Graphs', 'Context Memory']
  },
  productionHub: {
    id: 'productionHub',
    name: 'Production Hub',
    tagline: 'Content Production Pipeline',
    description: 'End-to-end content production and distribution',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    features: ['Media Library', 'Video Processing', 'Asset Management', 'Distribution Channels']
  }
} as const;

export type GenieProduct = keyof typeof GENIE_PRODUCTS;

// Stripe product/price mappings for Genie Studio tiers
export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    price_id: 'price_1RcuqjLkMzXLFD6lgODL8TGA',
    product_id: 'prod_STVvS8axANDSwJ',
    price: 29.99,
    billing: 'month',
    recommended: false,
    products: ['studio', 'spark'] as GenieProduct[],
    limits: {
      agents: 5,
      apiCalls: 1000,
      storage: '5 GB',
      teamMembers: 1
    },
    features: [
      '5 AI Agents',
      'Genie Studio Core',
      'Genie Spark Basic',
      'Basic RAG (1,000 docs)',
      'Community Support',
      '1,000 API calls/month',
      '5 GB Storage'
    ],
    highlights: ['Perfect for individuals', 'Quick prototyping', 'Essential AI tools']
  },
  business: {
    name: 'Business',
    price_id: 'price_1Rcur3LkMzXLFD6l7sIFDyHE',
    product_id: 'prod_STVwMyqVuPDe6J',
    price: 49.99,
    billing: 'month',
    recommended: true,
    products: ['studio', 'spark', 'vibe', 'mind'] as GenieProduct[],
    limits: {
      agents: 25,
      apiCalls: 10000,
      storage: '50 GB',
      teamMembers: 5
    },
    features: [
      '25 AI Agents',
      'Genie Studio Full',
      'Genie Spark Pro',
      'Genie Vibe Recording',
      'Genie Mind Knowledge Base',
      'Advanced RAG (10,000 docs)',
      'Priority Support',
      '10,000 API calls/month',
      '50 GB Storage',
      'Custom Branding',
      '5 Team Members'
    ],
    highlights: ['Best for small teams', 'Full recording suite', 'Advanced knowledge base']
  },
  pro: {
    name: 'Pro',
    price_id: 'price_1RcurPLkMzXLFD6lHlz7yLLy',
    product_id: 'prod_STVwrfRNQCBILz',
    price: 79.99,
    billing: 'month',
    recommended: false,
    products: ['studio', 'spark', 'vibe', 'arc', 'mind', 'productionHub'] as GenieProduct[],
    limits: {
      agents: -1,
      apiCalls: -1,
      storage: '500 GB',
      teamMembers: -1
    },
    features: [
      'Unlimited AI Agents',
      'Full Genie Suite Access',
      'Genie Arc Team Collaboration',
      'Production Hub',
      'Enterprise RAG (Unlimited)',
      '24/7 Priority Support',
      'Unlimited API calls',
      '500 GB Storage',
      'White Label',
      'Custom Integrations',
      'Unlimited Team Members',
      'SSO & SAML',
      'Dedicated Account Manager'
    ],
    highlights: ['Enterprise-ready', 'Full team collaboration', 'Unlimited everything']
  },
  beta: {
    name: 'Beta',
    price_id: null,
    product_id: null,
    price: 0,
    billing: null,
    recommended: false,
    products: ['studio', 'spark', 'vibe', 'arc', 'mind', 'productionHub'] as GenieProduct[],
    limits: {
      agents: -1,
      apiCalls: -1,
      storage: 'Unlimited',
      teamMembers: -1
    },
    features: ['Full Access', 'All Features', 'Beta Tester Perks', 'Lifetime Benefits'],
    highlights: ['Early adopter benefits', 'Shape the product', 'Lifetime access']
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
