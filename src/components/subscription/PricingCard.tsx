import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Star, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';

interface PricingCardProps {
  tier: SubscriptionTier;
  isCurrentPlan: boolean;
  onSelect: (tier: SubscriptionTier) => void;
  isLoading: boolean;
}

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  starter: <Zap className="h-6 w-6" />,
  business: <Star className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />,
  beta: <Star className="h-6 w-6 text-primary" />
};

const tierColors: Record<SubscriptionTier, string> = {
  starter: 'border-muted-foreground/20',
  business: 'border-primary/50',
  pro: 'border-primary ring-2 ring-primary/20',
  beta: 'border-primary/30 bg-primary/5'
};

export const PricingCard = ({ tier, isCurrentPlan, onSelect, isLoading }: PricingCardProps) => {
  const config = SUBSCRIPTION_TIERS[tier];
  const isPaid = config.price_id !== null;
  const isPopular = tier === 'business';

  return (
    <Card className={cn(
      'relative flex flex-col transition-all duration-300 hover:shadow-lg',
      tierColors[tier],
      isCurrentPlan && 'ring-2 ring-primary'
    )}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
          Your Plan
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 rounded-full bg-muted p-3 w-fit">
          {tierIcons[tier]}
        </div>
        <CardTitle className="text-2xl font-bold">{config.name}</CardTitle>
        <CardDescription className="text-lg">
          {config.price === 0 ? (
            <span className="text-2xl font-bold text-foreground">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-foreground">${config.price}</span>
              <span className="text-muted-foreground">/month</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {config.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          variant={isCurrentPlan ? "outline" : tier === 'pro' ? "default" : "secondary"}
          disabled={isCurrentPlan || isLoading || !isPaid}
          onClick={() => onSelect(tier)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : !isPaid ? (
            'Beta Access Only'
          ) : (
            `Get ${config.name}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
