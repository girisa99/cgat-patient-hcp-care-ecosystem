import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Genie Product Suite - Architecture Finalized
// Based on docs/GENIE_SUITE_ARCHITECTURE_SUMMARY.md
export const GENIE_PRODUCTS = {
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    description: 'AI Intelligence Layer for pre-production. Semantic search, document processing, and intelligent content analysis.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: '🧠',
    features: [
      'Two-stage AI pipeline (Classification + OCR)',
      'Document type auto-detection',
      'Multi-model routing (Claude, Gemini, GPT)',
      'Vector-powered semantic search',
      'Knowledge graph visualization',
      'Source attribution & citations'
    ],
    capabilities: {
      free: ['Basic document analysis', '10 documents/month'],
      starter: ['50 documents/month', 'Basic AI routing'],
      business: ['500 documents/month', 'Advanced RAG', 'Multi-model support'],
      pro: ['Unlimited documents', 'Custom embeddings', 'Knowledge graphs']
    }
  },
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite Your Ideas',
    description: 'AI Content Generation Engine. Transform ideas into polished scripts with natural language prompts.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: '⚡',
    features: [
      'Text prompt to script generation',
      'Template-based content creation',
      'PPT/Slides to script conversion',
      'Document to video script',
      'Natural language configuration',
      'One-click script deployment'
    ],
    capabilities: {
      free: ['5 scripts/month', 'Basic templates'],
      starter: ['25 scripts/month', 'Full template library'],
      business: ['150 scripts/month', 'Custom templates', 'Team sharing'],
      pro: ['Unlimited scripts', 'Priority generation', 'API access']
    }
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Feel the Flow',
    description: 'Creative Production Layer. Professional recording studio with AI voice generation and video capture.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: '🎬',
    features: [
      'AI voice generation (ElevenLabs)',
      'Multi-source video capture',
      'Background blur & virtual sets',
      'Auto-captioning & subtitles',
      'Multi-track recording & editing',
      'Export to multiple formats'
    ],
    capabilities: {
      free: ['Not available'],
      starter: ['5 hours recording/month', 'Basic TTS'],
      business: ['25 hours recording/month', 'Premium AI voices', 'Background blur'],
      pro: ['Unlimited recording', 'Voice cloning', 'Virtual sets']
    }
  },
  studio: {
    id: 'studio',
    name: 'Genie Studio',
    tagline: 'Mind to Media',
    description: 'Complete AI-powered media production suite. Unified platform integrating Mind, Spark, Vibe, and Production Hub.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: '🎨',
    features: [
      'Unified Mind → Vibe pipeline',
      'Bidirectional content flow',
      'Multi-model AI orchestration',
      'Visual workflow builder',
      'Real-time collaboration',
      'Cross-platform publishing'
    ],
    capabilities: {
      free: ['Basic features', 'Watermarked exports'],
      starter: ['Core features', 'No watermarks', '5 projects'],
      business: ['Full suite access', '50 projects', 'Team features'],
      pro: ['Unlimited projects', 'White-label', 'Priority support']
    }
  },
  productionHub: {
    id: 'productionHub',
    name: 'Production Hub (Arc)',
    tagline: 'Orchestrate Excellence',
    description: 'Team Coordination & Arc Layer. Multi-person productions, content approvals, live streaming, and large-scale content series management.',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    icon: '🎯',
    features: [
      'Show & episode management',
      'Multi-guest coordination (Arc)',
      'Approval workflows',
      'Live streaming integration',
      'Production scheduling',
      'Asset & media sharing',
      'Analytics & reporting'
    ],
    capabilities: {
      free: ['Not available'],
      starter: ['Not available'],
      business: ['5 shows', 'Basic scheduling', '3 team members'],
      pro: ['Unlimited shows', '10 guests/session', 'Live streaming', 'Full dashboard']
    }
  }
} as const;

export type GenieProduct = keyof typeof GENIE_PRODUCTS;

// Stripe product/price mappings for Genie Studio tiers
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free Trial',
    price_id: null,
    product_id: null,
    price: 0,
    billing: null,
    recommended: false,
    trialDays: 14,
    products: ['studio', 'spark'] as GenieProduct[],
    limits: {
      agents: 1,
      apiCalls: 100,
      storage: '500 MB',
      teamMembers: 1
    },
    features: [
      '1 AI Agent',
      'Genie Studio Basic',
      'Genie Spark (5 prototypes)',
      '100 API calls/month',
      '500 MB Storage',
      'Community Support',
      'Watermarked exports'
    ],
    restrictions: [
      'Watermarks on exports',
      'Limited API calls',
      'Single user only',
      'No custom branding'
    ],
    highlights: ['14-day free trial', 'No credit card required', 'Get started instantly']
  },
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
      'Genie Spark (20 prototypes)',
      'Basic RAG (1,000 docs)',
      'Community Support',
      '1,000 API calls/month',
      '5 GB Storage',
      'No watermarks'
    ],
    restrictions: [],
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
      'Genie Spark Pro (100 prototypes)',
      'Genie Vibe Recording Studio',
      'Genie Mind Knowledge Base',
      'Advanced RAG (10,000 docs)',
      'Priority Support',
      '10,000 API calls/month',
      '50 GB Storage',
      'Custom Branding',
      '5 Team Members'
    ],
    restrictions: [],
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
    restrictions: [],
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
    restrictions: [],
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
  isTrialActive?: boolean;
  trialEndsAt?: string | null;
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
  startFreeTrial: () => Promise<boolean>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: null,
    product_id: null,
    price_id: null,
    subscription_end: null,
    source: null,
    isTrialActive: false,
    trialEndsAt: null
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
          tier: 'free',
          product_id: null,
          price_id: null,
          subscription_end: null,
          source: null,
          isTrialActive: false,
          trialEndsAt: null
        });
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('check-subscription');
      
      if (fnError) {
        console.error('Error checking subscription:', fnError);
        // Default to free tier on error
        setSubscription({
          subscribed: false,
          tier: 'free',
          product_id: null,
          price_id: null,
          subscription_end: null,
          source: null,
          isTrialActive: false,
          trialEndsAt: null
        });
        return;
      }

      if (data?.error) {
        console.error('Subscription check returned error:', data.error);
        setSubscription({
          subscribed: false,
          tier: 'free',
          product_id: null,
          price_id: null,
          subscription_end: null,
          source: null,
          isTrialActive: false,
          trialEndsAt: null
        });
        return;
      }

      // Map tier name from response
      let tierKey: SubscriptionTier = 'free';
      if (data?.tier) {
        const tierName = data.tier.toLowerCase();
        if (tierName in SUBSCRIPTION_TIERS) {
          tierKey = tierName as SubscriptionTier;
        }
      } else if (data?.subscribed) {
        // If subscribed but no tier, try to match by product_id
        if (data.product_id) {
          for (const [key, config] of Object.entries(SUBSCRIPTION_TIERS)) {
            if (config.product_id === data.product_id) {
              tierKey = key as SubscriptionTier;
              break;
            }
          }
        }
      }

      setSubscription({
        subscribed: data?.subscribed || false,
        tier: tierKey,
        product_id: data?.product_id || null,
        price_id: data?.price_id || null,
        subscription_end: data?.subscription_end || null,
        source: data?.source || null,
        isTrialActive: data?.isTrialActive || false,
        trialEndsAt: data?.trialEndsAt || null
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check subscription';
      console.error('Subscription check error:', message);
      setError(message);
      // Default to free tier on error
      setSubscription({
        subscribed: false,
        tier: 'free',
        product_id: null,
        price_id: null,
        subscription_end: null,
        source: null,
        isTrialActive: false,
        trialEndsAt: null
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCheckout = useCallback(async (tier: SubscriptionTier): Promise<string | null> => {
    try {
      const tierConfig = SUBSCRIPTION_TIERS[tier];
      if (!tierConfig.price_id) {
        if (tier === 'free') {
          toast({
            title: "Free Trial",
            description: "You're already on the free tier. Start exploring!",
          });
        } else {
          toast({
            title: "Cannot checkout",
            description: "This tier does not require payment",
            variant: "destructive"
          });
        }
        return null;
      }

      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tierConfig.price_id }
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      return data?.url || null;
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
      if (data?.error) throw new Error(data.error);

      return data?.url || null;
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

  const startFreeTrial = useCallback(async (): Promise<boolean> => {
    try {
      toast({
        title: "Free Trial Started!",
        description: "Welcome! Explore Genie Suite with your 14-day free trial.",
      });
      
      setSubscription(prev => ({
        ...prev,
        tier: 'free',
        isTrialActive: true,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start trial';
      toast({
        title: "Trial Error",
        description: message,
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const hasModuleAccess = useCallback((moduleKey: string): boolean => {
    // Beta users have full access
    if (subscription.tier === 'beta') return true;
    
    // Free trial has limited access
    if (subscription.tier === 'free') {
      return ['studio', 'spark'].includes(moduleKey);
    }
    
    // Check if subscribed tier includes the module
    if (subscription.tier && subscription.tier in SUBSCRIPTION_TIERS) {
      const tierProducts = SUBSCRIPTION_TIERS[subscription.tier].products;
      return tierProducts.includes(moduleKey as GenieProduct);
    }

    return false;
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
            tier: 'free',
            product_id: null,
            price_id: null,
            subscription_end: null,
            source: null,
            isTrialActive: false,
            trialEndsAt: null
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
    getTierFeatures,
    startFreeTrial
  };
};
