import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSubscriptionContext } from './SubscriptionProvider';
import { Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManageSubscriptionButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const ManageSubscriptionButton = ({ 
  variant = 'outline', 
  size = 'default',
  className,
  children 
}: ManageSubscriptionButtonProps) => {
  const { openCustomerPortal, subscription } = useSubscriptionContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenPortal = async () => {
    if (subscription.source !== 'stripe') {
      toast({
        title: "Not available",
        description: "Subscription management is only available for Stripe subscriptions",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = await openCustomerPortal();
      if (url) {
        window.open(url, '_blank');
        toast({
          title: "Portal opened",
          description: "Manage your subscription in the new tab"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || !subscription.subscribed || subscription.source !== 'stripe';

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleOpenPortal}
      disabled={isDisabled}
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
          <Settings className="mr-2 h-4 w-4" />
          Manage Subscription
        </>
      )}
    </Button>
  );
};
