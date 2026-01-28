import React, { useState } from 'react';
import { EnhancedPricingCard } from './EnhancedPricingCard';
import { SubscriptionTier, SUBSCRIPTION_TIERS, USER_SEGMENTS, UserSegment } from '@/hooks/useSubscription';
import { useSubscriptionContext } from './SubscriptionProvider';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Sparkles, X, HelpCircle, Users, Briefcase, GraduationCap, Heart, Building2, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

// Segment icons mapping
const segmentIcons: Record<UserSegment, React.ReactNode> = {
  creator: <Users className="h-4 w-4" />,
  traveler: <Plane className="h-4 w-4" />,
  smallBusiness: <Briefcase className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  healthcare: <Heart className="h-4 w-4" />,
  enterprise: <Building2 className="h-4 w-4" />
};

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

      {/* User Segments - Who is each plan for? */}
      <div className="pt-8 space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">Find Your Perfect Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">Recommended plans based on your use case</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.entries(USER_SEGMENTS) as [UserSegment, typeof USER_SEGMENTS[UserSegment]][]).map(([key, segment]) => (
            <Card 
              key={key}
              className={cn(
                "p-3 cursor-pointer transition-all hover:scale-[1.02]",
                SUBSCRIPTION_TIERS[segment.recommendedTier].recommended 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border"
              )}
              onClick={() => {
                // Scroll to recommended tier card
                const tierElement = document.getElementById(`tier-${segment.recommendedTier}`);
                tierElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-muted">
                  {segmentIcons[key]}
                </div>
                <span className="font-medium text-sm text-foreground">{segment.name}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{segment.description}</p>
              <Badge variant="outline" className="text-xs">
                {SUBSCRIPTION_TIERS[segment.recommendedTier].name} - ${segment.monthlyPrice}/mo
              </Badge>
            </Card>
          ))}
        </div>
      </div>

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

// Comparison Table Component - Enhanced with tier feature gating integration
const ComparisonTable = () => {
  const tiers = ['free', 'starter', 'business', 'pro'] as const;
  
  const featureGroups = [
    {
      name: 'Core Limits',
      features: [
        { name: 'AI Agents', free: '1', starter: '5', business: '25', pro: 'Unlimited' },
        { name: 'API Calls/month', free: '100', starter: '1,000', business: '10,000', pro: 'Unlimited' },
        { name: 'Storage', free: '500 MB', starter: '5 GB', business: '50 GB', pro: '500 GB' },
        { name: 'Team Members', free: '1', starter: '1', business: '3', pro: '10' },
      ]
    },
    {
      name: 'Genie Products',
      features: [
        { name: 'Genie Studio', free: 'Basic', starter: 'Core', business: 'Full', pro: 'Enterprise' },
        { name: 'Genie Spark (Scripts)', free: '5', starter: '100', business: '500', pro: 'Unlimited' },
        { name: 'Genie Vibe (Recording)', free: '—', starter: '5 hrs', business: '25 hrs', pro: 'Unlimited' },
        { name: 'Genie Mind (RAG)', free: '—', starter: '1K docs', business: '10K docs', pro: 'Unlimited' },
        { name: 'Production Hub', free: '—', starter: '—', business: '5 shows', pro: 'Unlimited' },
        { name: 'Genie Arc (Collaboration)', free: '—', starter: '—', business: '—', pro: '✓' },
      ]
    },
    {
      name: '🎬 Mix & Match Features',
      isPremium: true,
      features: [
        { name: 'AI Avatar', free: '1 preview', starter: '5/mo', business: '30/mo', pro: '100/mo', highlight: true },
        { name: '3D Content', free: '1 preview', starter: '3/mo', business: '20/mo', pro: '75/mo', highlight: true },
        { name: 'Animation', free: '2 clips', starter: '10 clips', business: '50 clips', pro: '200 clips' },
        { name: 'Mix Combinations', free: '1', starter: '3', business: '10', pro: '25' },
      ]
    },
    {
      name: '🎙️ Lipsync & Dubbing',
      isPremium: true,
      features: [
        { name: 'Lip-Sync', free: '1 min preview', starter: '5 min', business: '30 min', pro: '120 min', highlight: true },
        { name: 'Dubbing', free: '1 min preview', starter: '5 min', business: '30 min', pro: '120 min', highlight: true },
        { name: 'Voice Cloning', free: '—', starter: '2 voices', business: '5 voices', pro: '15 voices' },
        { name: 'Languages', free: '2', starter: '5', business: '15', pro: '40' },
      ]
    },
    {
      name: '🔬 Innovation Lab',
      isPremium: true,
      features: [
        { name: 'VR/AR Experiences', free: '—', starter: '—', business: '—', pro: '10/mo', highlight: true },
        { name: 'Immersive Content', free: '—', starter: '—', business: '—', pro: '10/mo' },
        { name: 'Music Generation', free: '3 tracks', starter: '10 tracks', business: '50 tracks', pro: '200 tracks' },
      ]
    },
    {
      name: 'AI Capabilities',
      features: [
        { name: 'AI Voice Generation', free: '—', starter: 'Basic TTS', business: 'Premium', pro: 'Voice Clone' },
        { name: 'Multi-Model AI', free: '—', starter: '—', business: '✓', pro: '✓' },
        { name: 'Custom Embeddings', free: '—', starter: '—', business: '—', pro: '✓' },
        { name: 'Knowledge Graphs', free: '—', starter: '—', business: '—', pro: '✓' },
      ]
    },
    {
      name: 'Business Features',
      features: [
        { name: 'Watermark-Free', free: '—', starter: '✓', business: '✓', pro: '✓' },
        { name: 'Custom Branding', free: '—', starter: '—', business: '✓', pro: '✓' },
        { name: 'White Label', free: '—', starter: '—', business: '—', pro: '✓' },
        { name: 'Approval Workflows', free: '—', starter: '—', business: '—', pro: '✓' },
        { name: 'SSO & SAML', free: '—', starter: '—', business: '—', pro: '✓' },
      ]
    },
    {
      name: 'Compliance & Security',
      features: [
        { name: 'HIPAA Compliance', free: '—', starter: '—', business: '—', pro: '✓' },
        { name: 'SOC 2 Type II', free: '✓', starter: '✓', business: '✓', pro: '✓' },
        { name: 'Data Encryption', free: '✓', starter: '✓', business: '✓', pro: '✓' },
        { name: 'Audit Logs', free: '—', starter: '—', business: '✓', pro: '✓' },
      ]
    },
    {
      name: 'Support',
      features: [
        { name: 'Support Level', free: 'Community', starter: 'Email (48h)', business: 'Priority (24h)', pro: '24/7 Dedicated' },
        { name: 'Onboarding', free: 'Self-serve', starter: 'Docs', business: 'Guided', pro: 'White-glove' },
        { name: 'Account Manager', free: '—', starter: '—', business: '—', pro: '✓' },
      ]
    }
  ];

  const renderCell = (value: string) => {
    if (value === '✓') return <Check className="h-4 w-4 text-green-500 mx-auto" />;
    if (value === '—') return <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />;
    return <span className="text-xs">{value}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left py-3 px-3 font-semibold text-foreground w-1/5 text-xs">Feature</th>
            {tiers.map((tier) => (
              <th key={tier} className={cn(
                "text-center py-3 px-2 font-semibold",
                tier === 'business' && "bg-primary/10"
              )}>
                <div className="space-y-0.5">
                  <div className="text-xs text-foreground">{SUBSCRIPTION_TIERS[tier].name}</div>
                  <div className="text-[10px] font-normal text-muted-foreground">
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
          {featureGroups.map((group: any) => (
            <React.Fragment key={group.name}>
              <tr className={cn("bg-muted/30", group.isPremium && "bg-gradient-to-r from-primary/10 to-purple-500/10")}>
                <td colSpan={5} className={cn(
                  "py-2 px-3 text-[10px] font-semibold uppercase tracking-wider",
                  group.isPremium ? "text-primary" : "text-muted-foreground"
                )}>
                  {group.name}
                </td>
              </tr>
              {group.features.map((feature: any, idx: number) => (
                <tr key={idx} className={cn(
                  "border-b border-border/50 hover:bg-muted/20 transition-colors",
                  feature.highlight && "bg-primary/5"
                )}>
                  <td className={cn(
                    "py-2 px-3 text-xs text-foreground",
                    feature.highlight && "font-medium"
                  )}>
                    {feature.name}
                  </td>
                  <td className="text-center py-2 px-2 text-foreground">{renderCell(feature.free)}</td>
                  <td className="text-center py-2 px-2 text-foreground">{renderCell(feature.starter)}</td>
                  <td className={cn("text-center py-2 px-2 text-foreground", "bg-primary/5")}>{renderCell(feature.business)}</td>
                  <td className="text-center py-2 px-2 text-foreground">{renderCell(feature.pro)}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// FAQ Component - Comprehensive FAQs aligned with investor dashboard
const FAQ = () => {
  const faqCategories = [
    {
      category: 'Getting Started',
      faqs: [
        {
          q: "What's included in the free trial?",
          a: "14-day trial with Genie Studio Basic and Genie Spark (5 prototypes). Build 1 agent, 100 API calls, explore all features. Exports have watermarks during trial."
        },
        {
          q: "Do I need a credit card for the free trial?",
          a: "No! Start your free trial without any payment info. We only ask for payment when you upgrade to a paid plan."
        },
        {
          q: "What happens when my trial ends?",
          a: "Continue using the free tier with limitations, or upgrade to unlock all features. Your work is preserved either way."
        }
      ]
    },
    {
      category: 'Products & Features',
      faqs: [
        {
          q: "What's the difference between Genie products?",
          a: "Genie Mind = AI knowledge & document processing. Genie Spark = rapid script generation. Genie Vibe = recording studio with AI voices. Genie Studio = unified workflow. Production Hub = team collaboration."
        },
        {
          q: "Which plan includes Genie Vibe recording?",
          a: "Genie Vibe is available on Business ($29.99/mo) and Pro ($79.99/mo) plans. Business includes 25 hours/month, Pro includes unlimited recording with voice cloning."
        },
        {
          q: "Can I use AI voice generation?",
          a: "Yes! Genie Vibe includes ElevenLabs integration. Starter gets basic TTS, Business gets premium AI voices, Pro includes voice cloning capabilities."
        },
        {
          q: "What is Genie Mind's RAG capability?",
          a: "RAG (Retrieval-Augmented Generation) lets your AI agents search and reference your documents. Starter: 1,000 docs, Business: 10,000 docs, Pro: Unlimited."
        }
      ]
    },
    {
      category: 'For Your Industry',
      faqs: [
        {
          q: "Is Genie HIPAA compliant for healthcare?",
          a: "Yes! Pro and Enterprise plans include HIPAA compliance, BAA agreements, and healthcare-specific templates. We're the only AI video platform under $100/mo with full HIPAA compliance."
        },
        {
          q: "Can educators use Genie for training content?",
          a: "Absolutely! Our Pro plan includes curriculum-aligned templates, LMS integration, and unlimited lesson creation. Popular with K-12, corporate training, and higher ed."
        },
        {
          q: "Do you support enterprise deployments?",
          a: "Yes! Enterprise includes white-label options, SSO/SAML, approval workflows, custom SLAs, and dedicated support. Contact sales for custom pricing."
        }
      ]
    },
    {
      category: 'Pricing & Billing',
      faqs: [
        {
          q: "Can I upgrade or downgrade my plan?",
          a: "Yes! Upgrade anytime (prorated). Downgrade takes effect at your next billing cycle. No penalties or hidden fees."
        },
        {
          q: "What payment methods do you accept?",
          a: "All major credit cards via Stripe. Enterprise customers can pay via invoice with NET-30 terms."
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes, cancel with no penalties. Access continues until billing period ends. You can always downgrade to free tier."
        },
        {
          q: "Do you offer annual billing discounts?",
          a: "Yes! Annual billing saves 20%. Starter: $95.90/year, Business: $287.90/year, Pro: $767.90/year."
        }
      ]
    },
    {
      category: 'Security & Support',
      faqs: [
        {
          q: "Is my data secure?",
          a: "Absolutely. Enterprise-grade encryption (AES-256), SOC 2 Type II compliant, HIPAA ready. Your data is never shared with third parties or used for AI training."
        },
        {
          q: "What support is included?",
          a: "Free: Community. Starter: Email (48h). Business: Priority (24h). Pro: 24/7 dedicated support with account manager."
        },
        {
          q: "Do you offer onboarding help?",
          a: "Business and Pro plans include guided onboarding. Pro customers get a dedicated success manager and custom training sessions."
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {faqCategories.map((category, catIdx) => (
        <div key={catIdx} className="space-y-3">
          <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
            {category.category}
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            {category.faqs.map((faq, idx) => (
              <Card key={idx} className="border-border bg-card hover:bg-muted/30 transition-colors">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm font-medium text-foreground leading-tight">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedPricingSection;
