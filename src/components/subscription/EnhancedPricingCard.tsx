import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Star, Crown, Zap, Users, Database, Cpu, HardDrive, Gift, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionTier, SUBSCRIPTION_TIERS, GenieProduct } from '@/hooks/useSubscription';
import { ProductShowcase } from './ProductShowcase';
import { FeaturesDialog } from './FeaturesDialog';

interface EnhancedPricingCardProps {
  tier: SubscriptionTier;
  isCurrentPlan: boolean;
  onSelect: (tier: SubscriptionTier) => void;
  isLoading: boolean;
}

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  free: <Gift className="h-6 w-6" />,
  starter: <Zap className="h-6 w-6" />,
  business: <Star className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />,
  enterprise: <Users className="h-6 w-6" />,
  beta: <Star className="h-6 w-6 text-primary" />
};

const tierGradients: Record<SubscriptionTier, string> = {
  free: 'from-emerald-500 to-green-600',
  starter: 'from-slate-500 to-zinc-600',
  business: 'from-blue-500 to-indigo-600',
  pro: 'from-amber-500 to-orange-600',
  enterprise: 'from-purple-500 to-pink-600',
  beta: 'from-violet-500 to-purple-600'
};

const tierBorders: Record<SubscriptionTier, string> = {
  free: 'border-emerald-500/30 hover:border-emerald-500/50',
  starter: 'border-muted-foreground/20 hover:border-muted-foreground/40',
  business: 'border-blue-500/50 hover:border-blue-500 ring-1 ring-blue-500/20',
  pro: 'border-amber-500/50 hover:border-amber-500',
  enterprise: 'border-purple-500/50 hover:border-purple-500',
  beta: 'border-violet-500/30 bg-violet-500/5'
};

export const EnhancedPricingCard = ({ tier, isCurrentPlan, onSelect, isLoading }: EnhancedPricingCardProps) => {
  const config = SUBSCRIPTION_TIERS[tier];
  const isPaid = config.price_id !== null;
  const isRecommended = config.recommended;
  const isFree = tier === 'free';
  const hasRestrictions = 'restrictions' in config && Array.isArray(config.restrictions) && config.restrictions.length > 0;
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);

  return (
    <Card 
      id={`tier-${tier}`}
      className={cn(
        'relative flex flex-col transition-all duration-300 hover:shadow-xl overflow-visible h-full',
        tierBorders[tier],
        isCurrentPlan && 'ring-2 ring-primary',
        isRecommended && 'scale-[1.02] shadow-lg z-10'
      )}
    >
      {/* Gradient Header */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-2 bg-gradient-to-r",
        tierGradients[tier]
      )} />
      
      {isRecommended && (
        <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg z-10">
          ⭐ Most Popular
        </Badge>
      )}

      {isFree && (
        <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg z-10">
          🎁 Free Trial
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute top-4 right-4 bg-green-500 text-white z-10">
          Your Plan
        </Badge>
      )}

      <CardHeader className={cn("text-center pb-2 pt-8", (isRecommended || isFree) && "pt-10")}>
        <div className={cn(
          "mx-auto mb-3 rounded-full p-3 w-fit bg-gradient-to-br",
          tierGradients[tier]
        )}>
          <div className="text-white">
            {tierIcons[tier]}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{config.name}</CardTitle>
        <div className="text-lg mt-2">
          {config.price === 0 ? (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">Free</span>
              {isFree && <span className="text-sm text-muted-foreground">14-day trial</span>}
            </div>
          ) : (
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">${config.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          )}
        </div>
        
        {/* Highlights */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {config.highlights?.map((highlight, idx) => (
            <Badge key={idx} variant="outline" className="text-xs font-normal">
              {highlight}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-4 pb-2">
        {/* Products Included */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Products Included:</h4>
          <ProductShowcase 
            includedProducts={config.products as GenieProduct[]} 
            variant="compact"
          />
        </div>

        {/* Limits - Compact 2x2 Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30">
            <Cpu className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-semibold">
                {config.limits.agents === -1 ? 'Unli...' : config.limits.agents}
              </span>
              <span className="text-muted-foreground ml-1">Agents</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30">
            <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-semibold">
                {config.limits.apiCalls === -1 ? 'Unli...' : config.limits.apiCalls >= 1000 ? `${config.limits.apiCalls/1000}K` : config.limits.apiCalls}
              </span>
              <span className="text-muted-foreground ml-1">API/mo</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30">
            <HardDrive className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-semibold truncate">{config.limits.storage}</span>
              <span className="text-muted-foreground ml-1">Storage</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30">
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-semibold">
                {config.limits.teamMembers === -1 ? 'Unli...' : config.limits.teamMembers}
              </span>
              <span className="text-muted-foreground ml-1">Team</span>
            </div>
          </div>
        </div>

        {/* Restrictions Warning for Free Tier */}
        {hasRestrictions && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Trial Limitations
            </div>
            <ul className="space-y-1">
              {(config.restrictions as string[]).slice(0, 3).map((restriction, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                  {restriction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features List - Fixed height, no scrolling */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Features:</h4>
          <ul className="space-y-1">
            {config.features.slice(0, 5).map((feature, index) => (
              <li key={index} className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground leading-tight line-clamp-1">{feature}</span>
              </li>
            ))}
            {config.features.length > 5 && (
              <li>
                <button
                  onClick={() => setShowFeaturesDialog(true)}
                  className="text-xs text-primary font-medium pl-5 cursor-pointer hover:text-primary/80 hover:underline"
                >
                  +{config.features.length - 5} more features...
                </button>
              </li>
            )}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          className={cn(
            "w-full",
            isRecommended && "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
            isFree && "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          )}
          variant={isCurrentPlan ? "outline" : tier === 'pro' ? "default" : "secondary"}
          size="lg"
          disabled={isCurrentPlan || isLoading}
          onClick={() => onSelect(tier)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : isFree ? (
            'Start Free Trial'
          ) : (
            `Get ${config.name}`
          )}
        </Button>
      </CardFooter>
      
      {/* Features Dialog */}
      <FeaturesDialog 
        open={showFeaturesDialog} 
        onOpenChange={setShowFeaturesDialog} 
        tier={tier} 
      />
    </Card>
  );
};

export default EnhancedPricingCard;
