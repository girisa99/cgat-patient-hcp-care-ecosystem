import React, { useState } from 'react';
import { EnhancedPricingCard } from './EnhancedPricingCard';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useSubscriptionContext } from './SubscriptionProvider';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Sparkles, X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

export const EnhancedPricingSection = () => {
  const { subscription, createCheckout, isLoading, startFreeTrial } = useSubscriptionContext();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const handleSelectTier = async (tier: SubscriptionTier) => {
    setLoadingTier(tier);
    try {
      if (tier === 'free') {
        await startFreeTrial();
        toast({
          title: "Welcome to Genie Suite! 🎉",
          description: "Your 14-day free trial has started. Explore all features!"
        });
      } else {
        const url = await createCheckout(tier);
        if (url) {
          window.open(url, '_blank');
          toast({
            title: "Redirecting to checkout",
            description: "Complete your subscription in the new tab"
          });
        }
      }
    } finally {
      setLoadingTier(null);
    }
  };

  const displayTiers: SubscriptionTier[] = ['free', 'starter', 'business', 'pro'];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <img 
            src={genieSuiteLogo} 
            alt="Genie Suite" 
            className="h-14 w-auto object-contain"
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
            Choose Your Genie Suite Plan
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start with a free trial, then scale as you grow. All plans include core Genie Studio features.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-500" />
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayTiers.map((tier) => (
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
        <div className="p-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-violet-500/30 text-center">
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

      {/* Feature Comparison & FAQ - Simple flat layout */}
      <div className="pt-8 space-y-6">
        {/* Section Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">Compare Plans</h3>
          <p className="text-sm text-muted-foreground mt-1">See what's included in each plan</p>
        </div>
        
        {/* Simple Tab Navigation - No nested frames */}
        <Tabs defaultValue="features" className="w-full">
          <div className="flex justify-center">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1">
              <TabsTrigger 
                value="features" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Check className="h-4 w-4" />
                Feature Comparison
              </TabsTrigger>
              <TabsTrigger 
                value="faq" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Feature Comparison Table - Direct, no card wrapper */}
          <TabsContent value="features" className="mt-6">
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <ComparisonTable />
            </div>
          </TabsContent>
          
          {/* FAQ - Direct grid, no extra wrapping */}
          <TabsContent value="faq" className="mt-6">
            <FAQ />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Comparison Table Component
const ComparisonTable = () => {
  const tiers = ['free', 'starter', 'business', 'pro'] as const;
  
  const featureGroups = [
    {
      name: 'Core Limits',
      features: [
        { name: 'AI Agents', free: '1', starter: '5', business: '25', pro: 'Unlimited' },
        { name: 'API Calls/month', free: '100', starter: '1,000', business: '10,000', pro: 'Unlimited' },
        { name: 'Storage', free: '500 MB', starter: '5 GB', business: '50 GB', pro: '500 GB' },
        { name: 'Team Members', free: '1', starter: '1', business: '5', pro: 'Unlimited' },
      ]
    },
    {
      name: 'Products',
      features: [
        { name: 'Genie Studio', free: 'Basic', starter: 'Core', business: 'Full', pro: 'Enterprise' },
        { name: 'Genie Spark', free: '5 protos', starter: '20 protos', business: '100 protos', pro: 'Unlimited' },
        { name: 'Genie Vibe', free: '—', starter: '—', business: '✓', pro: '✓ + Voice Clone' },
        { name: 'Genie Arc', free: '—', starter: '—', business: '—', pro: '✓' },
        { name: 'Genie Mind', free: '—', starter: '—', business: '10K docs', pro: 'Unlimited' },
        { name: 'Production Hub', free: '—', starter: '—', business: '—', pro: '✓' },
      ]
    },
    {
      name: 'Features',
      features: [
        { name: 'RAG Documents', free: '—', starter: '1,000', business: '10,000', pro: 'Unlimited' },
        { name: 'Custom Branding', free: '—', starter: '—', business: '✓', pro: '✓' },
        { name: 'White Label', free: '—', starter: '—', business: '—', pro: '✓' },
        { name: 'Watermarks', free: 'Yes', starter: 'No', business: 'No', pro: 'No' },
        { name: 'SSO & SAML', free: '—', starter: '—', business: '—', pro: '✓' },
        { name: 'Support', free: 'Community', starter: 'Email', business: 'Priority', pro: '24/7 Dedicated' },
      ]
    }
  ];

  const renderCell = (value: string) => {
    if (value === '✓') return <Check className="h-4 w-4 text-green-500 mx-auto" />;
    if (value === '—') return <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />;
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left py-4 px-4 font-semibold text-foreground w-1/5">Feature</th>
            {tiers.map((tier) => (
              <th key={tier} className={cn(
                "text-center py-4 px-3 font-semibold",
                tier === 'business' && "bg-blue-500/10"
              )}>
                <div className="space-y-1">
                  <div className="text-foreground">{SUBSCRIPTION_TIERS[tier].name}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    {SUBSCRIPTION_TIERS[tier].price === 0 
                      ? 'Free' 
                      : `$${SUBSCRIPTION_TIERS[tier].price}/mo`}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featureGroups.map((group, groupIdx) => (
            <React.Fragment key={group.name}>
              <tr className="bg-muted/30">
                <td colSpan={5} className="py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.name}
                </td>
              </tr>
              {group.features.map((feature, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 text-foreground">{feature.name}</td>
                  <td className="text-center py-3 px-3 text-foreground">{renderCell(feature.free)}</td>
                  <td className="text-center py-3 px-3 text-foreground">{renderCell(feature.starter)}</td>
                  <td className={cn("text-center py-3 px-3 text-foreground", "bg-blue-500/5")}>{renderCell(feature.business)}</td>
                  <td className="text-center py-3 px-3 text-foreground">{renderCell(feature.pro)}</td>
                </tr>
              ))}
            </React.Fragment>
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
      q: "What's included in the free trial?",
      a: "The 14-day free trial includes Genie Studio Basic and Genie Spark with 5 prototypes. You can build 1 agent, make 100 API calls, and explore the platform. Exports will have watermarks during the trial."
    },
    {
      q: "Can I upgrade or downgrade my plan?",
      a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remaining time. When downgrading, changes take effect at the start of your next billing cycle."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards (Visa, MasterCard, American Express) through our secure Stripe payment system. Enterprise customers can also pay via invoice."
    },
    {
      q: "Do I need a credit card for the free trial?",
      a: "No! Start your free trial without any payment information. We'll only ask for payment details when you decide to upgrade to a paid plan."
    },
    {
      q: "What happens when my trial ends?",
      a: "When your trial ends, you can continue using the free tier with limitations, or upgrade to a paid plan to unlock all features. Your data and work are preserved either way."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription at any time with no penalties. Your access continues until the end of your billing period, and you can downgrade to the free tier."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We're HIPAA compliant and use enterprise-grade encryption for all data at rest and in transit. Your data is never shared with third parties."
    },
    {
      q: "What's the difference between Genie Studio and Genie Spark?",
      a: "Genie Studio is the full visual agent builder for complex workflows. Genie Spark is for rapid prototyping - describe what you need in plain English and get a working agent in seconds."
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {faqs.map((faq, idx) => (
        <Card key={idx} className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-foreground">{faq.q}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnhancedPricingSection;
