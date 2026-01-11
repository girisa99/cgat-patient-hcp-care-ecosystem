import React from 'react';
import { SubscriptionProvider, SubscriptionStatus } from '@/components/subscription';
import { EnhancedPricingSection } from '@/components/subscription/EnhancedPricingSection';
import { ProductsOverview } from '@/components/subscription/ProductsOverview';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, LayoutGrid, Clock, Package, Sparkles, TrendingUp, Users, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

const SubscriptionPage = () => {
  return (
    <SubscriptionProvider>
      <AppLayout>
        <div className="min-h-screen">
          {/* Hero Header - Cleaner design */}
          <div className="relative border-b border-border/50 bg-gradient-to-b from-muted/30 to-background">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            
            <div className="relative container mx-auto py-10 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={genieSuiteLogo} 
                    alt="Genie Suite" 
                    className="h-10 sm:h-12 w-auto"
                  />
                  <Badge variant="secondary" className="hidden sm:flex gap-1">
                    <Sparkles className="h-3 w-3" />
                    Complete Suite
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                  Genie Suite Plans
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                  AI-powered content creation, agent building & knowledge management
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Better spacing and alignment */}
          <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="plans" className="space-y-6">
              {/* Centered, responsive tab list */}
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-4 w-full max-w-xl h-12 p-1 bg-muted/50">
                  <TabsTrigger value="plans" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden xs:inline">Plans</span>
                  </TabsTrigger>
                  <TabsTrigger value="products" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                    <Package className="h-4 w-4" />
                    <span className="hidden xs:inline">Products</span>
                  </TabsTrigger>
                  <TabsTrigger value="current" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden xs:inline">My Plan</span>
                  </TabsTrigger>
                  <TabsTrigger value="usage" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="hidden xs:inline">Usage</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Plans Tab */}
              <TabsContent value="plans" className="mt-6">
                <EnhancedPricingSection />
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                <ProductsOverview />
              </TabsContent>

              {/* Current Plan Tab - Improved layout */}
              <TabsContent value="current" className="mt-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  <SubscriptionStatus />
                  
                  {/* User segment info */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Your Account Segment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                        Your subscription tier determines feature access. Segments help us customize your experience.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Usage Tab - Enhanced layout */}
              <TabsContent value="usage" className="mt-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Usage Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <UsageMetric 
                      title="API Calls" 
                      used={2847} 
                      limit={10000} 
                      icon={<Zap className="h-5 w-5" />}
                      color="blue"
                    />
                    <UsageMetric 
                      title="Storage" 
                      used={12.5} 
                      limit={50} 
                      icon={<Package className="h-5 w-5" />}
                      unit="GB"
                      color="purple"
                    />
                    <UsageMetric 
                      title="Active Agents" 
                      used={8} 
                      limit={25} 
                      icon={<Users className="h-5 w-5" />}
                      color="amber"
                    />
                    <UsageMetric 
                      title="RAG Documents" 
                      used={1250} 
                      limit={10000}
                      icon={<TrendingUp className="h-5 w-5" />}
                      color="emerald"
                    />
                  </div>

                  {/* Detailed Usage Card */}
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Usage Trends
                      </CardTitle>
                      <CardDescription>
                        Track your monthly consumption and optimize your plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg border border-dashed border-border">
                        <p className="text-sm text-muted-foreground text-center px-4">
                          📊 Detailed usage charts coming soon<br/>
                          <span className="text-xs">Track patterns, set alerts, and get optimization tips</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
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
  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className="text-sm font-medium">{value}</p>
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
    <Card className="border-border/50">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("p-2 rounded-lg", colorClasses[color])}>
            {icon}
          </div>
          <Badge variant="outline" className="text-xs">
            {percentage}%
          </Badge>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{title}</h4>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
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
