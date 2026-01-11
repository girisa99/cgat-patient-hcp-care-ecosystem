import React, { useState } from 'react';
import { EnhancedPricingCard } from './EnhancedPricingCard';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useSubscriptionContext } from './SubscriptionProvider';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Sparkles } from 'lucide-react';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

export const EnhancedPricingSection = () => {
  const { subscription, createCheckout, isLoading } = useSubscriptionContext();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const handleSelectTier = async (tier: SubscriptionTier) => {
    setLoadingTier(tier);
    try {
      const url = await createCheckout(tier);
      if (url) {
        window.open(url, '_blank');
        toast({
          title: "Redirecting to checkout",
          description: "Complete your subscription in the new tab"
        });
      }
    } finally {
      setLoadingTier(null);
    }
  };

  const paidTiers: SubscriptionTier[] = ['starter', 'business', 'pro'];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <img 
            src={genieSuiteLogo} 
            alt="Genie Suite" 
            className="h-16 w-auto object-contain"
          />
        </div>
        
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
          Choose Your Genie Suite Plan
        </h2>
        
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
          Unlock the power of AI-driven content creation with the right plan for your needs.
          All plans include core Genie Studio features.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>14-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>Secure payment via Stripe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {paidTiers.map((tier) => (
          <EnhancedPricingCard
            key={tier}
            tier={tier}
            isCurrentPlan={subscription.tier === tier}
            onSelect={handleSelectTier}
            isLoading={isLoading || loadingTier === tier}
          />
        ))}
      </div>

      {/* Beta Access Banner */}
      {subscription.tier === 'beta' && (
        <div className="mt-10 p-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-violet-500/30 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <span className="font-semibold text-lg">Beta Access Activated</span>
            <Sparkles className="h-5 w-5 text-violet-500" />
          </div>
          <p className="text-muted-foreground">
            You have full access to all Genie Suite features. Thank you for being an early adopter!
          </p>
        </div>
      )}

      {/* Comparison Table Toggle */}
      <div className="mt-16">
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="features">Feature Comparison</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="mt-8">
            <ComparisonTable />
          </TabsContent>
          
          <TabsContent value="faq" className="mt-8">
            <FAQ />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Comparison Table Component
const ComparisonTable = () => {
  const tiers = ['starter', 'business', 'pro'] as const;
  const features = [
    { name: 'AI Agents', starter: '5', business: '25', pro: 'Unlimited' },
    { name: 'API Calls/month', starter: '1,000', business: '10,000', pro: 'Unlimited' },
    { name: 'Storage', starter: '5 GB', business: '50 GB', pro: '500 GB' },
    { name: 'Team Members', starter: '1', business: '5', pro: 'Unlimited' },
    { name: 'Genie Studio', starter: 'Core', business: 'Full', pro: 'Full' },
    { name: 'Genie Spark', starter: 'Basic', business: 'Pro', pro: 'Enterprise' },
    { name: 'Genie Vibe', starter: '—', business: '✓', pro: '✓' },
    { name: 'Genie Arc', starter: '—', business: '—', pro: '✓' },
    { name: 'Genie Mind', starter: '—', business: '✓', pro: '✓' },
    { name: 'Production Hub', starter: '—', business: '—', pro: '✓' },
    { name: 'RAG Documents', starter: '1,000', business: '10,000', pro: 'Unlimited' },
    { name: 'Custom Branding', starter: '—', business: '✓', pro: '✓' },
    { name: 'White Label', starter: '—', business: '—', pro: '✓' },
    { name: 'SSO & SAML', starter: '—', business: '—', pro: '✓' },
    { name: 'Support', starter: 'Community', business: 'Priority', pro: '24/7 Dedicated' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 font-medium">Feature</th>
            {tiers.map((tier) => (
              <th key={tier} className="text-center py-4 px-4 font-medium">
                {SUBSCRIPTION_TIERS[tier].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, idx) => (
            <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
              <td className="py-3 px-4 text-muted-foreground">{feature.name}</td>
              <td className="text-center py-3 px-4">{feature.starter}</td>
              <td className="text-center py-3 px-4 bg-blue-500/5">{feature.business}</td>
              <td className="text-center py-3 px-4">{feature.pro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// FAQ Component
const FAQ = () => {
  const faqs = [
    {
      q: "Can I upgrade or downgrade my plan?",
      a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards (Visa, MasterCard, American Express) through our secure Stripe payment system."
    },
    {
      q: "Is there a free trial?",
      a: "We offer a 14-day money-back guarantee on all plans. Try risk-free and get a full refund if it's not right for you."
    },
    {
      q: "What happens if I exceed my limits?",
      a: "We'll notify you when you're approaching your limits. You can upgrade at any time to increase your capacity."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We're HIPAA compliant and use enterprise-grade encryption for all data at rest and in transit."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription at any time with no penalties. Your access continues until the end of your billing period."
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {faqs.map((faq, idx) => (
        <div key={idx} className="p-4 rounded-lg border border-border/50 bg-card">
          <h4 className="font-medium mb-2">{faq.q}</h4>
          <p className="text-sm text-muted-foreground">{faq.a}</p>
        </div>
      ))}
    </div>
  );
};

export default EnhancedPricingSection;