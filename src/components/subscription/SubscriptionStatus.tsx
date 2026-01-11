import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionContext } from './SubscriptionProvider';
import { SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { Crown, RefreshCw, Settings, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const SubscriptionStatus = () => {
  const { subscription, isLoading, checkSubscription, openCustomerPortal } = useSubscriptionContext();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkSubscription();
    setIsRefreshing(false);
  };

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    const url = await openCustomerPortal();
    if (url) {
      window.open(url, '_blank');
    }
    setIsOpeningPortal(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tierConfig = subscription.tier ? SUBSCRIPTION_TIERS[subscription.tier] : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            Manage your Genie Studio subscription
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.subscribed && tierConfig ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Plan</span>
              <Badge variant="default" className="text-base">
                {tierConfig.name}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            </div>

            {subscription.subscription_end && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Renews
                </span>
                <span className="font-medium">
                  {format(new Date(subscription.subscription_end), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Source</span>
              <Badge variant="secondary">
                {subscription.source === 'stripe' ? 'Stripe' : 'Internal'}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Your Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {tierConfig.features.slice(0, 4).map((feature, i) => (
                  <li key={i}>• {feature}</li>
                ))}
              </ul>
            </div>

            {subscription.source === 'stripe' && (
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={handleManageSubscription}
                disabled={isOpeningPortal}
              >
                {isOpeningPortal ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="mr-2 h-4 w-4" />
                )}
                Manage Subscription
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription
            </p>
            <Button onClick={() => window.location.href = '/subscription'}>
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
