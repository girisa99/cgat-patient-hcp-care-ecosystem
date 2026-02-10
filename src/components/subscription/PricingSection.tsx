import React, { useState } from 'react';
import { PricingCard } from './PricingCard';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useSubscriptionContext } from './SubscriptionProvider';
import { useToast } from '@/hooks/use-toast';
import { useRegionalPricing } from '@/hooks/useRegionalPricing';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PricingSection = () => {
  const { subscription, createCheckout, isLoading } = useSubscriptionContext();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const { 
    region, 
    detectedCountry, 
    isLoading: isRegionLoading, 
    isRegionalEnabled,
    languageZone,
    paymentMethods,
    refreshRegion
  } = useRegionalPricing();

  const handleSelectTier = async (tier: SubscriptionTier) => {
    setLoadingTier(tier);
    try {
      const url = await createCheckout(tier);
      if (url) {
        window.open(url, '_blank');
        toast({
          title: "Redirecting to checkout",
          description: "Complete your subscription in the new tab"
        });
      }
    } finally {
      setLoadingTier(null);
    }
  };

  const paidTiers: SubscriptionTier[] = ['starter', 'business', 'pro'];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Scale your AI-powered solutions with the right plan for your needs. 
          All plans include core Genie Suite features.
        </p>
      </div>

      {/* Regional Pricing Info Banner */}
      {region && (
        <div className="mb-8 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {region.display_name}
                </span>
                {detectedCountry && (
                  <Badge variant="secondary" className="text-xs">
                    {detectedCountry}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{region.currency_code}</span>
              </div>

              {isRegionalEnabled && region.ppp_multiplier !== 1.00 && (
                <Badge variant="default" className="text-xs bg-accent text-accent-foreground">
                  Regional Pricing Active
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                Zone: <span className="font-medium">{languageZone}</span> | 
                Lang: <span className="font-medium">{region.default_language}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshRegion}
                disabled={isRegionLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isRegionLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {paymentMethods.length > 1 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Payment methods: {paymentMethods.join(', ')}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paidTiers.map((tier) => (
          <PricingCard
            key={tier}
            tier={tier}
            isCurrentPlan={subscription.tier === tier}
            onSelect={handleSelectTier}
            isLoading={isLoading || loadingTier === tier}
          />
        ))}
      </div>

      {subscription.tier === 'beta' && (
        <div className="mt-8 p-4 bg-primary/10 rounded-lg text-center">
          <p className="text-primary font-medium">
            🎉 You have Beta Access with full features! Thank you for being an early adopter.
          </p>
        </div>
      )}
    </div>
  );
};
