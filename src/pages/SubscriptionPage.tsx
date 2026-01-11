import React from 'react';
import { SubscriptionProvider, SubscriptionStatus } from '@/components/subscription';
import { EnhancedPricingSection } from '@/components/subscription/EnhancedPricingSection';
import { HorizontalProductShowcase } from '@/components/subscription/HorizontalProductShowcase';
import AppLayout from '@/components/layout/AppLayout';
import { CreditCard, TrendingUp, Users, Zap, Shield, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

const SubscriptionPage = () => {
  return (
    <SubscriptionProvider>
      <AppLayout>
        <div className="min-h-screen">
          {/* Hero Header - Compact */}
          <div className="relative border-b border-border/50 bg-gradient-to-b from-muted/30 to-background">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={genieSuiteLogo} 
                    alt="Genie Suite" 
                    className="h-10 w-auto"
                  />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      Genie Suite
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      AI-powered content creation & agent building
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="flex gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Subscription & Plans
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content - Sequential Layout */}
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-10">
            
            {/* Section 1: Complete Genie Suite - Horizontal Scroll */}
            <section>
              <HorizontalProductShowcase />
            </section>

            {/* Section 2: Subscription Plans */}
            <section>
              <EnhancedPricingSection />
            </section>

            {/* Section 3: Current Status & Usage */}
            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Your Subscription</h2>
                <p className="text-sm text-muted-foreground">Current plan status and usage metrics</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {/* Subscription Status */}
                <div>
                  <SubscriptionStatus />
                </div>
                
                {/* Account Segment */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <SegmentBadge 
                        label="Account Type" 
                        value="Healthcare Professional" 
                        icon={<Shield className="h-4 w-4" />}
                      />
                      <SegmentBadge 
                        label="Organization" 
                        value="Individual" 
                        icon={<Users className="h-4 w-4" />}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subscription tier determines feature access. Segments customize your experience.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Usage Metrics */}
              <div className="max-w-5xl mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-4">Usage Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <UsageMetric 
                    title="API Calls" 
                    used={2847} 
                    limit={10000} 
                    icon={<Zap className="h-4 w-4" />}
                    color="blue"
                  />
                  <UsageMetric 
                    title="Storage" 
                    used={12.5} 
                    limit={50} 
                    icon={<Package className="h-4 w-4" />}
                    unit="GB"
                    color="purple"
                  />
                  <UsageMetric 
                    title="Agents" 
                    used={8} 
                    limit={25} 
                    icon={<Users className="h-4 w-4" />}
                    color="amber"
                  />
                  <UsageMetric 
                    title="Documents" 
                    used={1250} 
                    limit={10000}
                    icon={<TrendingUp className="h-4 w-4" />}
                    color="emerald"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </AppLayout>
    </SubscriptionProvider>
  );
};

// Segment Badge Component
interface SegmentBadgeProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const SegmentBadge = ({ label, value, icon }: SegmentBadgeProps) => (
  <div className="p-3 rounded-lg bg-muted/50 border border-border">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

// Usage Metric Component
interface UsageMetricProps {
  title: string;
  used: number;
  limit: number;
  icon: React.ReactNode;
  unit?: string;
  color: 'blue' | 'purple' | 'amber' | 'emerald';
}

const UsageMetric = ({ title, used, limit, icon, unit = '', color }: UsageMetricProps) => {
  const percentage = Math.round((used / limit) * 100);
  
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10'
  };

  const progressColors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <Card className="border-border">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className={cn("p-1.5 rounded-md", colorClasses[color])}>
            {icon}
          </div>
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", progressColors[color])}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{used.toLocaleString()}{unit ? ` ${unit}` : ''}</span>
            <span>{limit.toLocaleString()}{unit ? ` ${unit}` : ''}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPage;
