/**
 * GENIE STUDIO PRICING PAGE
 * PUBLIC pricing page - users can view plans before signing in
 * Shows all subscription options and navigates to auth with selected tier
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, TestTube, CreditCard, Check, Crown, Zap, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

// Tier definitions
const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for exploring Genie Suite',
    features: [
      '5 AI generations per day',
      'Basic templates',
      'Standard quality exports',
      'Community support',
    ],
    cta: 'Get Started Free',
    popular: false,
    icon: Sparkles,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9.99',
    period: '/month',
    description: 'For individuals getting started',
    features: [
      '50 AI generations per month',
      'All basic templates',
      'HD quality exports',
      'Email support',
      '5 saved projects',
    ],
    cta: 'Start Starter',
    popular: false,
    icon: Zap,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: '$19.99',
    period: '/month',
    description: 'For content creators and freelancers',
    features: [
      '200 AI generations per month',
      'Premium templates',
      '4K quality exports',
      'Priority support',
      'Unlimited saved projects',
      'Voice cloning (5 voices)',
    ],
    cta: 'Start Creating',
    popular: true,
    icon: Crown,
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    description: 'For professionals and teams',
    features: [
      '500 AI generations per month',
      'All premium features',
      '4K+ quality exports',
      'Dedicated support',
      'Team collaboration (5 seats)',
      'Voice cloning (20 voices)',
      'API access',
    ],
    cta: 'Go Pro',
    popular: false,
    icon: Crown,
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    id: 'business',
    name: 'Business',
    price: '$79.99',
    period: '/month',
    description: 'For growing businesses',
    features: [
      '2000 AI generations per month',
      'White-label exports',
      'Priority rendering',
      '24/7 support',
      'Team collaboration (15 seats)',
      'Unlimited voice cloning',
      'Full API access',
      'Analytics dashboard',
    ],
    cta: 'Start Business',
    popular: false,
    icon: Building2,
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited AI generations',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Unlimited team seats',
      'Custom training',
      'On-premise option',
      'HIPAA compliance',
    ],
    cta: 'Contact Sales',
    popular: false,
    icon: Building2,
    gradient: 'from-purple-600 to-pink-600',
  },
];

const GenieStudioPricing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, genieUser } = useGenieStudioAuth();
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const handleSelectTier = (tierId: string) => {
    if (isAuthenticated) {
      // Already logged in - go to dashboard (payment integration later)
      navigate('/genie-studio');
    } else {
      // Not logged in - go to auth with selected tier
      navigate(`/genie-studio-auth?tier=${tierId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/genie-landing" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="bg-white/10 p-2 rounded-lg">
                  <img 
                    src={genieSuiteLogo} 
                    alt="Genie Suite" 
                    className="h-8 w-auto"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Genie Studio</h1>
                  <p className="text-xs text-white/50">AI-Powered Creative Suite</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-white/70">{genieUser?.email}</span>
                  <Link to="/genie-studio">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/genie-studio-auth">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-6">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">
              Simple, Transparent Pricing
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include access to our full suite of AI-powered tools.
          </p>
        </section>

        {/* Pricing Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            const isHovered = hoveredTier === tier.id;
            const isCurrentPlan = genieUser?.current_subscription_tier === tier.id;
            
            return (
              <Card 
                key={tier.id}
                className={`relative bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-300 ${
                  tier.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                } ${isHovered ? 'scale-[1.02] border-white/30' : ''} ${
                  isCurrentPlan ? 'ring-2 ring-green-500' : ''
                }`}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white border-0">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <CardDescription className="text-white/60">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-white/50">{tier.period}</span>
                  </div>
                  
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full bg-gradient-to-r ${tier.gradient} hover:opacity-90 text-white`}
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

        {/* FAQ or Trust Section */}
        <section className="text-center max-w-2xl mx-auto pt-8">
          <p className="text-white/50 text-sm">
            All plans include a 14-day free trial. No credit card required to start.
            <br />
            Questions? Contact us at{' '}
            <a href="mailto:support@geniecellgene.com" className="text-purple-400 hover:text-purple-300">
              support@geniecellgene.com
            </a>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-white/50">
            <Link to="/genie-landing" className="hover:text-white/80">Home</Link>
            <span>•</span>
            <a href="#" className="hover:text-white/80">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-white/80">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GenieStudioPricing;
