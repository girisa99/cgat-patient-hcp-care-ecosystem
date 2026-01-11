import React from 'react';
import { SubscriptionProvider, PricingSection, SubscriptionStatus } from '@/components/subscription';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, LayoutGrid, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SubscriptionPage = () => {
  return (
    <SubscriptionProvider>
      <AppLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Subscription & Billing</h1>
            <p className="text-muted-foreground">
              Manage your Genie Studio subscription and billing details
            </p>
          </div>

          <Tabs defaultValue="plans" className="space-y-6">
            <TabsList>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="current" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Current Plan
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Usage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plans">
              <PricingSection />
            </TabsContent>

            <TabsContent value="current">
              <div className="max-w-md">
                <SubscriptionStatus />
              </div>
            </TabsContent>

            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>
                    Track your API calls and resource usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Usage tracking coming soon</p>
                    <p className="text-sm">
                      Monitor your API calls, agent usage, and storage consumption
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </SubscriptionProvider>
  );
};

export default SubscriptionPage;
