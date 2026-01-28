/**
 * GENIE STUDIO PRICING PAGE
 * PUBLIC pricing page - matches landing page corporate styling
 * Shows all subscription options aligned with landing page tiers
 * UPDATED: Includes tier feature gating for Lipsync, Dubbing, Mix-and-Match
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Check, Crown, Zap, Building2, Globe, Video, Mic, User, Box, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { GenieNavbar } from '@/components/genie-studio/GenieNavbar';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';
import { cn } from '@/lib/utils';

// Premium feature access by tier - aligned with tierFeatureGating.ts
interface PremiumFeatures {
  lipsync: string;
  dubbing: string;
  avatar: string;
  threeD: string;
  vrAr: string;
  voiceClone: string;
}

const TIER_PREMIUM_FEATURES: Record<string, PremiumFeatures> = {
  free: { lipsync: '1 min preview', dubbing: '1 min preview', avatar: '1 preview', threeD: '1 preview', vrAr: '—', voiceClone: '—' },
  starter: { lipsync: '5 min', dubbing: '5 min', avatar: '5/mo', threeD: '3/mo', vrAr: '—', voiceClone: '2 voices' },
  creator: { lipsync: '30 min', dubbing: '30 min', avatar: '30/mo', threeD: '20/mo', vrAr: '—', voiceClone: '5 voices' },
  professional: { lipsync: '120 min', dubbing: '120 min', avatar: '100/mo', threeD: '75/mo', vrAr: '10/mo', voiceClone: '15 voices' },
  studio: { lipsync: 'Unlimited', dubbing: 'Unlimited', avatar: 'Unlimited', threeD: 'Unlimited', vrAr: '50/mo', voiceClone: '50 voices' },
  enterprise: { lipsync: 'Unlimited', dubbing: 'Unlimited', avatar: 'Unlimited', threeD: 'Unlimited', vrAr: 'Unlimited', voiceClone: 'Unlimited' },
};

// Aligned with landing page PRICING_TIERS
const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/forever',
    pipelines: 41,
    languages: 10,
    credits: 50,
    description: 'Perfect for exploring Genie Suite',
    features: [
      '720p video exports',
      '5 exports per month',
      'Watermark on exports',
      'Basic templates',
      'Community support',
    ],
    cta: 'Get Started Free',
    popular: false,
    icon: Sparkles,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$12',
    period: '/month',
    pipelines: 80,
    languages: 5,
    credits: 200,
    description: 'For hobbyists getting started',
    features: [
      '720p HD exports',
      '15 exports per month',
      'No watermarks',
      'Basic lip-sync preview',
      'Email support',
    ],
    cta: 'Start Now',
    popular: false,
    icon: Zap,
  },
  {
    id: 'creator',
    name: 'Creator',
    price: '$29',
    period: '/month',
    pipelines: 120,
    languages: 15,
    credits: 500,
    description: 'For content creators - Lipsync & Dubbing unlocked',
    features: [
      '1080p HD exports',
      '30 exports per month',
      '✨ 30 min Lip-Sync/Dubbing',
      'Premium templates',
      'Priority support',
    ],
    cta: 'Start Creating',
    popular: false,
    icon: Zap,
    unlocks: ['lipsync', 'dubbing'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$59',
    period: '/month',
    pipelines: 165,
    languages: 40,
    credits: 1500,
    description: 'For professionals - Full Mix & Match',
    features: [
      '4K quality exports',
      '100 exports per month',
      '✨ 120 min Lip-Sync/Dubbing',
      'VR/AR access (10/mo)',
      'Voice cloning (15 voices)',
    ],
    cta: 'Go Pro',
    popular: true,
    icon: Crown,
    unlocks: ['lipsync', 'dubbing', 'vrAr'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$299',
    period: '/month',
    pipelines: 206,
    languages: '140+',
    credits: '10K+',
    description: 'For large organizations',
    features: [
      '8K exports',
      'White-label branding',
      'SSO/SAML integration',
      '✨ Unlimited everything',
      'Custom training & SLA',
    ],
    cta: 'Contact Sales',
    popular: false,
    icon: Building2,
    unlocks: ['lipsync', 'dubbing', 'vrAr', 'voiceClone'],
  },
];

const GenieStudioPricing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, genieUser } = useGenieStudioAuth();
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const handleSelectTier = (tierId: string) => {
    if (isAuthenticated) {
      navigate('/genie-studio');
    } else {
      navigate(`/genie-studio-auth?tier=${tierId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <GenieNavbar 
        rightContent={
          isAuthenticated ? (
            <Link to="/genie-studio">
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                Dashboard
              </Button>
            </Link>
          ) : null
        }
      />

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include access to our full suite of 206 AI pipelines.
            </p>
          </section>

          {/* Pricing Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
            {PRICING_TIERS.map((tier) => {
              const Icon = tier.icon;
              const isHovered = hoveredTier === tier.id;
              const isCurrentPlan = genieUser?.current_subscription_tier === tier.id;
              
              return (
                <Card 
                  key={tier.id}
                  className={`relative bg-card border-2 transition-all duration-300 ${
                    tier.popular 
                      ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-xl' 
                      : 'border-border'
                  } ${isHovered ? 'scale-[1.02] shadow-lg border-primary/50' : ''} ${
                    isCurrentPlan ? 'ring-2 ring-green-500' : ''
                  }`}
                  onMouseEnter={() => setHoveredTier(tier.id)}
                  onMouseLeave={() => setHoveredTier(null)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4 z-10">
                      <Badge className="bg-green-500 text-white border-0">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4 pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{tier.name}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {tier.pipelines} pipelines
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {tier.languages} langs
                      </Badge>
                    </div>
                    
                    {/* Premium Feature Indicators */}
                    {TIER_PREMIUM_FEATURES[tier.id] && (
                      <div className="grid grid-cols-3 gap-1 mb-4 text-[9px]">
                        <div className={cn(
                          "p-1 rounded text-center border",
                          TIER_PREMIUM_FEATURES[tier.id].lipsync !== '—' && TIER_PREMIUM_FEATURES[tier.id].lipsync !== '1 min preview'
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-muted/30 text-muted-foreground border-muted"
                        )}>
                          <Video className="h-2.5 w-2.5 mx-auto mb-0.5" />
                          Lip-Sync
                        </div>
                        <div className={cn(
                          "p-1 rounded text-center border",
                          TIER_PREMIUM_FEATURES[tier.id].dubbing !== '—' && TIER_PREMIUM_FEATURES[tier.id].dubbing !== '1 min preview'
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-muted/30 text-muted-foreground border-muted"
                        )}>
                          <Mic className="h-2.5 w-2.5 mx-auto mb-0.5" />
                          Dubbing
                        </div>
                        <div className={cn(
                          "p-1 rounded text-center border",
                          TIER_PREMIUM_FEATURES[tier.id].vrAr !== '—'
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-muted/30 text-muted-foreground border-muted"
                        )}>
                          <Box className="h-2.5 w-2.5 mx-auto mb-0.5" />
                          VR/AR
                        </div>
                      </div>
                    )}
                    
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className={cn(
                            "text-xs text-muted-foreground",
                            feature.startsWith('✨') && "text-primary font-medium"
                          )}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      className={`w-full ${
                        tier.popular 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg' 
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                      onClick={() => handleSelectTier(tier.id)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </section>

          {/* Trust Section */}
          <section className="text-center max-w-2xl mx-auto">
            <p className="text-muted-foreground text-sm">
              All plans include a 14-day free trial. No credit card required to start.
              <br />
              Questions? Contact us at{' '}
              <a href="mailto:support@geniecellgene.com" className="text-primary hover:underline">
                support@geniecellgene.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={genieSuiteLogo} alt="Genie Suite" className="h-6 w-auto" />
            <span className="font-semibold text-foreground">Genie Studio</span>
          </div>
          <p className="text-sm text-muted-foreground">
            7 Products • 206 Pipelines • One Platform
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <Link to="/genie-landing" className="hover:text-foreground transition">Home</Link>
            <span>•</span>
            <Link to="/explore" className="hover:text-foreground transition">Explore</Link>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GenieStudioPricing;
