import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSubscriptionContext } from './SubscriptionProvider';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckoutButtonProps {
  tier: SubscriptionTier;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const CheckoutButton = ({ 
  tier, 
  variant = 'default', 
  size = 'default',
  className,
  children 
}: CheckoutButtonProps) => {
  const { createCheckout, subscription } = useSubscriptionContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const isCurrentPlan = subscription.tier === tier;
  const isPaid = tierConfig.price_id !== null;

  const handleCheckout = async () => {
    if (!isPaid) {
      toast({
        title: "Not available",
        description: "This tier does not require payment",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = await createCheckout(tier);
      if (url) {
        window.open(url, '_blank');
        toast({
          title: "Checkout opened",
          description: "Complete your purchase in the new tab"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCheckout}
      disabled={isLoading || isCurrentPlan || !isPaid}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {isCurrentPlan ? 'Current Plan' : `Upgrade to ${tierConfig.name}`}
        </>
      )}
    </Button>
  );
};
