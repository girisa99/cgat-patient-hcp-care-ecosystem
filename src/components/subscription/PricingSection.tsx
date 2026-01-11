import React, { useState } from 'react';
import { PricingCard } from './PricingCard';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useSubscriptionContext } from './SubscriptionProvider';
import { useToast } from '@/hooks/use-toast';

export const PricingSection = () => {
  const { subscription, createCheckout, isLoading } = useSubscriptionContext();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

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
          All plans include core Genie Studio features.
        </p>
      </div>

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
