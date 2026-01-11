import React from 'react';
import { SubscriptionProvider, SubscriptionStatus } from '@/components/subscription';
import { EnhancedPricingSection } from '@/components/subscription/EnhancedPricingSection';
import { ProductsOverview } from '@/components/subscription/ProductsOverview';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, LayoutGrid, Clock, Package, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

const SubscriptionPage = () => {
  return (
    <SubscriptionProvider>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-amber-500/5" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative container mx-auto py-12 px-4">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={genieSuiteLogo} 
                    alt="Genie Suite" 
                    className="h-12 w-auto"
                  />
                  <Badge variant="outline" className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Complete Suite
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                  Genie Suite Subscription
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Unlock the full power of AI-driven content creation, agent building, and enterprise knowledge management
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto py-8 px-4">
            <Tabs defaultValue="plans" className="space-y-8">
              <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-4 h-auto p-1">
                <TabsTrigger value="plans" className="flex items-center gap-2 py-3">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Plans</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2 py-3">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Products</span>
                </TabsTrigger>
                <TabsTrigger value="current" className="flex items-center gap-2 py-3">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">My Plan</span>
                </TabsTrigger>
                <TabsTrigger value="usage" className="flex items-center gap-2 py-3">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Usage</span>
                </TabsTrigger>
              </TabsList>

              {/* Plans Tab */}
              <TabsContent value="plans">
                <EnhancedPricingSection />
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products">
                <ProductsOverview />
              </TabsContent>

              {/* Current Plan Tab */}
              <TabsContent value="current">
                <div className="max-w-lg mx-auto">
                  <SubscriptionStatus />
                </div>
              </TabsContent>

              {/* Usage Tab */}
              <TabsContent value="usage">
                <div className="max-w-4xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Usage Statistics
                      </CardTitle>
                      <CardDescription>
                        Track your API calls, agent usage, and resource consumption
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <UsageCard 
                          title="API Calls" 
                          used={2847} 
                          limit={10000} 
                          unit="calls"
                          color="blue"
                        />
                        <UsageCard 
                          title="Storage" 
                          used={12.5} 
                          limit={50} 
                          unit="GB"
                          color="purple"
                        />
                        <UsageCard 
                          title="Active Agents" 
                          used={8} 
                          limit={25} 
                          unit="agents"
                          color="amber"
                        />
                      </div>
                      
                      <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">
                          Detailed usage analytics coming soon. Track your consumption patterns, 
                          optimize costs, and get recommendations for your usage.
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

// Usage Card Component
interface UsageCardProps {
  title: string;
  used: number;
  limit: number;
  unit: string;
  color: 'blue' | 'purple' | 'amber';
}

const UsageCard = ({ title, used, limit, unit, color }: UsageCardProps) => {
  const percentage = Math.round((used / limit) * 100);
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500'
  };

  return (
    <div className="p-4 rounded-lg border border-border/50 bg-card">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{used.toLocaleString()} {unit}</span>
        <span>{limit.toLocaleString()} {unit}</span>
      </div>
    </div>
  );
};

export default SubscriptionPage;