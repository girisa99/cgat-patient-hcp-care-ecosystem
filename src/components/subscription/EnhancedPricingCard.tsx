import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Star, Crown, Zap, Users, Database, Cpu, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionTier, SUBSCRIPTION_TIERS, GENIE_PRODUCTS, GenieProduct } from '@/hooks/useSubscription';
import { ProductShowcase } from './ProductShowcase';

interface EnhancedPricingCardProps {
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

const tierGradients: Record<SubscriptionTier, string> = {
  starter: 'from-slate-500 to-zinc-600',
  business: 'from-blue-500 to-indigo-600',
  pro: 'from-amber-500 to-orange-600',
  beta: 'from-violet-500 to-purple-600'
};

const tierBorders: Record<SubscriptionTier, string> = {
  starter: 'border-muted-foreground/20 hover:border-muted-foreground/40',
  business: 'border-blue-500/50 hover:border-blue-500 ring-1 ring-blue-500/20',
  pro: 'border-amber-500/50 hover:border-amber-500',
  beta: 'border-violet-500/30 bg-violet-500/5'
};

export const EnhancedPricingCard = ({ tier, isCurrentPlan, onSelect, isLoading }: EnhancedPricingCardProps) => {
  const config = SUBSCRIPTION_TIERS[tier];
  const isPaid = config.price_id !== null;
  const isRecommended = config.recommended;

  return (
    <Card className={cn(
      'relative flex flex-col transition-all duration-300 hover:shadow-xl overflow-hidden',
      tierBorders[tier],
      isCurrentPlan && 'ring-2 ring-primary',
      isRecommended && 'scale-[1.02] shadow-lg'
    )}>
      {/* Gradient Header */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-2 bg-gradient-to-r",
        tierGradients[tier]
      )} />
      
      {isRecommended && (
        <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
          ⭐ Most Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute top-4 right-4 bg-green-500 text-white">
          Your Plan
        </Badge>
      )}

      <CardHeader className={cn("text-center pb-2 pt-8", isRecommended && "pt-10")}>
        <div className={cn(
          "mx-auto mb-3 rounded-full p-3 w-fit bg-gradient-to-br",
          tierGradients[tier]
        )}>
          <div className="text-white">
            {tierIcons[tier]}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{config.name}</CardTitle>
        <CardDescription className="text-lg mt-2">
          {config.price === 0 ? (
            <span className="text-2xl font-bold text-foreground">Free</span>
          ) : (
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">${config.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          )}
        </CardDescription>
        
        {/* Highlights */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {config.highlights?.map((highlight, idx) => (
            <Badge key={idx} variant="outline" className="text-xs font-normal">
              {highlight}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 pt-4">
        {/* Products Included */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Products Included:</h4>
          <ProductShowcase 
            includedProducts={config.products} 
            variant="compact"
          />
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs">
              <div className="font-medium">
                {config.limits.agents === -1 ? 'Unlimited' : config.limits.agents}
              </div>
              <div className="text-muted-foreground">Agents</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Database className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs">
              <div className="font-medium">
                {config.limits.apiCalls === -1 ? 'Unlimited' : config.limits.apiCalls.toLocaleString()}
              </div>
              <div className="text-muted-foreground">API calls/mo</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs">
              <div className="font-medium">{config.limits.storage}</div>
              <div className="text-muted-foreground">Storage</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs">
              <div className="font-medium">
                {config.limits.teamMembers === -1 ? 'Unlimited' : config.limits.teamMembers}
              </div>
              <div className="text-muted-foreground">Team</div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">All Features:</h4>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {config.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          className={cn(
            "w-full",
            isRecommended && "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          )}
          variant={isCurrentPlan ? "outline" : tier === 'pro' ? "default" : "secondary"}
          size="lg"
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

export default EnhancedPricingCard;