/**
 * GENIE STUDIO PRICING PAGE
 * Dedicated pricing page for beta testers who sign in via Google
 * Shows all subscription options without full app navigation
 */
import React from 'react';
import { SubscriptionProvider } from '@/components/subscription';
import { EnhancedPricingSection } from '@/components/subscription/EnhancedPricingSection';
import { HorizontalProductShowcase } from '@/components/subscription/HorizontalProductShowcase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, TestTube, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import GenieStudioAuthLayout from '@/components/auth/GenieStudioAuthLayout';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

const GenieStudioPricing: React.FC = () => {
  const { user, profile, isAuthenticated, signOut } = useMasterAuth();

  // If not authenticated, show auth prompt
  if (!isAuthenticated) {
    return (
      <GenieStudioAuthLayout>
        <div className="w-full max-w-md mx-auto text-center p-8">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view subscription plans
          </p>
          <Link to="/genie-studio-auth">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </GenieStudioAuthLayout>
    );
  }

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        {/* Beta Tester Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-2 rounded-lg">
                  <img 
                    src={genieSuiteLogo} 
                    alt="Genie Suite" 
                    className="h-8 w-auto"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Genie Studio</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-xs">
                      <TestTube className="h-3 w-3 mr-1" />
                      Beta Tester Access
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-white/80">
                    {user?.email || 'Beta Tester'}
                  </p>
                  <p className="text-xs text-white/50">
                    {profile?.first_name ? `Welcome, ${profile.first_name}` : 'Welcome!'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => signOut()}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-10">
          {/* Welcome Section */}
          <section className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-6">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                You're a Beta Tester!
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              As a beta tester, you get early access to all features. 
              Select a subscription plan to unlock the full power of Genie Studio.
            </p>
          </section>

          {/* Products Showcase */}
          <section className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <HorizontalProductShowcase />
          </section>

          {/* Pricing Plans */}
          <section className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Subscription Plans</h2>
              </div>
              <p className="text-white/60">
                Select the plan that fits your needs. Upgrade or downgrade anytime.
              </p>
            </div>
            <EnhancedPricingSection />
          </section>

          {/* Beta Tester Benefits */}
          <section className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl border border-purple-500/20 p-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Beta Tester Benefits
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="font-medium text-white mb-1">Early Access</h4>
                <p className="text-sm text-white/60">Try new features before anyone else</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                  <TestTube className="h-6 w-6 text-indigo-400" />
                </div>
                <h4 className="font-medium text-white mb-1">Shape the Product</h4>
                <p className="text-sm text-white/60">Your feedback directly influences development</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="font-medium text-white mb-1">Special Pricing</h4>
                <p className="text-sm text-white/60">Exclusive discounts for early adopters</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-12 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-white/50">
              Questions? Contact us at{' '}
              <a href="mailto:support@geniecellgene.com" className="text-purple-400 hover:text-purple-300">
                support@geniecellgene.com
              </a>
            </p>
          </div>
        </footer>
      </div>
    </SubscriptionProvider>
  );
};

export default GenieStudioPricing;
