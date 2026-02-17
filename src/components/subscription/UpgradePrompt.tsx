/**
 * UpgradePrompt - P1 #73: Upgrade Prompts UI
 * 
 * Various upgrade prompt components: banners, modals, tooltips
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Crown, 
  Sparkles, 
  ArrowRight, 
  X, 
  Zap, 
  Star,
  TrendingUp,
  Gift,
  Check
} from 'lucide-react';
import { useSubscription, SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  targetTier?: SubscriptionTier;
  feature?: string;
  message?: string;
  onDismiss?: () => void;
  onUpgrade?: () => void;
  className?: string;
}

/**
 * UpgradeBanner - Sticky banner for upgrade prompts
 */
export const UpgradeBanner: React.FC<UpgradePromptProps & { dismissible?: boolean }> = ({
  targetTier = 'business',
  feature,
  message,
  onDismiss,
  onUpgrade,
  dismissible = true,
  className
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();
  const tierInfo = SUBSCRIPTION_TIERS[targetTier];

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <Alert className={cn(
      "border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10",
      className
    )}>
      <Sparkles className="h-4 w-4 text-primary" />
      <AlertTitle className="flex items-center gap-2">
        Unlock {feature || 'Premium Features'}
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {tierInfo.name}
        </Badge>
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between mt-2">
        <span className="text-sm text-muted-foreground">
          {message || `Upgrade to ${tierInfo.name} for advanced features and higher limits.`}
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleUpgrade} className="gap-1">
            Upgrade
            <ArrowRight className="h-3 w-3" />
          </Button>
          {dismissible && (
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * UpgradeModal - Full upgrade modal with tier comparison
 */
export const UpgradeModal: React.FC<UpgradePromptProps & { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}> = ({
  targetTier = 'business',
  feature,
  message,
  open,
  onOpenChange,
  onUpgrade
}) => {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const currentTierInfo = SUBSCRIPTION_TIERS[subscription.tier];
  const targetTierInfo = SUBSCRIPTION_TIERS[targetTier];

  const handleUpgrade = () => {
    onOpenChange(false);
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  // Key features for comparison - using only properties that exist
  const comparisonFeatures = [
    { name: 'Monthly Credits', current: String(currentTierInfo.monthlyCredits), target: String(targetTierInfo.monthlyCredits) },
    { name: 'Price', current: `$${currentTierInfo.price}`, target: `$${targetTierInfo.price}` },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Upgrade to {targetTierInfo.name}
          </DialogTitle>
          <DialogDescription>
            {message || `Unlock ${feature || 'premium features'} with our ${targetTierInfo.name} plan.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price comparison */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Current</div>
              <div className="font-bold text-lg">{currentTierInfo.name}</div>
              <div className="text-sm">${currentTierInfo.price}/mo</div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
            <div className="text-center">
              <div className="text-sm text-primary">Upgrade to</div>
              <div className="font-bold text-lg text-primary">{targetTierInfo.name}</div>
              <div className="text-sm text-primary">${targetTierInfo.price}/mo</div>
            </div>
          </div>

          {/* Feature comparison */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">What you'll get:</h4>
            <div className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">Monthly Credits</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through">{currentTierInfo.monthlyCredits}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-primary">{targetTierInfo.monthlyCredits}</span>
              </div>
            </div>
            {comparisonFeatures.map(({ name, current, target }) => (
              <div key={name} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">{name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through">{String(current)}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium text-primary">{String(target)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits list */}
          <div className="space-y-2">
            {targetTierInfo.features.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="sm:flex-1 gap-2">
            <Sparkles className="h-4 w-4" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * UpgradeCard - Inline card for upgrade prompts
 */
export const UpgradeCard: React.FC<UpgradePromptProps & { compact?: boolean }> = ({
  targetTier = 'business',
  feature,
  message,
  onUpgrade,
  compact = false,
  className
}) => {
  const navigate = useNavigate();
  const tierInfo = SUBSCRIPTION_TIERS[targetTier];

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5",
        className
      )}>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            Upgrade to {tierInfo.name} for {feature || 'more features'}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={handleUpgrade}>
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("border-primary/30 overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Unlock {feature || 'Premium Features'}
        </CardTitle>
        <CardDescription>
          {message || `Upgrade to ${tierInfo.name} for advanced capabilities.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-bold text-xl">${tierInfo.price}/mo</div>
            <div className="text-sm text-muted-foreground">{tierInfo.name} Plan</div>
          </div>
        </div>
        <Button onClick={handleUpgrade} className="w-full gap-2">
          <Gift className="h-4 w-4" />
          Start {tierInfo.name} Trial
        </Button>
      </CardContent>
    </Card>
  );
};

/**
 * useUpgradePrompt hook for programmatic upgrade prompts
 */
export const useUpgradePrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UpgradePromptProps>({});

  const showUpgradePrompt = (props: UpgradePromptProps) => {
    setConfig(props);
    setIsOpen(true);
  };

  const hideUpgradePrompt = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    config,
    showUpgradePrompt,
    hideUpgradePrompt,
    UpgradeModal: (props: Omit<Parameters<typeof UpgradeModal>[0], 'open' | 'onOpenChange'>) => (
      <UpgradeModal {...config} {...props} open={isOpen} onOpenChange={setIsOpen} />
    )
  };
};

export default { UpgradeBanner, UpgradeModal, UpgradeCard, useUpgradePrompt };
