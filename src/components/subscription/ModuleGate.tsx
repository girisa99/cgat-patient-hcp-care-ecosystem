/**
 * ModuleGate - P1 #72: Module-Level Access Gates
 * 
 * Wrapper component that checks module access based on subscription tier.
 * Shows upgrade prompt or locks feature if user doesn't have access.
 */

import React, { ReactNode, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useSubscription, SubscriptionTier, SUBSCRIPTION_TIERS, GENIE_PRODUCTS } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ModuleGateProps {
  children: ReactNode;
  moduleId: string;
  moduleName?: string;
  requiredTier?: SubscriptionTier;
  product?: keyof typeof GENIE_PRODUCTS;
  showUpgradePrompt?: boolean;
  fallback?: ReactNode;
  className?: string;
  onUpgradeClick?: () => void;
}

/**
 * ModuleGate checks if user has access to a specific module.
 * 
 * Usage:
 * <ModuleGate moduleId="vibe-voice-clone" requiredTier="pro">
 *   <VoiceCloningPanel />
 * </ModuleGate>
 */
export const ModuleGate: React.FC<ModuleGateProps> = ({
  children,
  moduleId,
  moduleName,
  requiredTier = 'starter',
  product,
  showUpgradePrompt = true,
  fallback,
  className,
  onUpgradeClick
}) => {
  const { subscription, hasModuleAccess, isLoading } = useSubscription();
  const navigate = useNavigate();

  // Check if user has access to this module
  const hasAccess = useMemo(() => {
    // Beta users have full access
    if (subscription.tier === 'beta') return true;
    
    // Check tier hierarchy
    const tierOrder: SubscriptionTier[] = ['free', 'starter', 'business', 'pro', 'enterprise', 'beta'];
    const userTierIndex = tierOrder.indexOf(subscription.tier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    
    return userTierIndex >= requiredTierIndex;
  }, [subscription.tier, requiredTier]);

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      navigate('/pricing');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-lg p-4", className)}>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-2" />
        <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
      </div>
    );
  }

  // User has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  // Get product info for styling
  const productInfo = product ? GENIE_PRODUCTS[product] : null;
  const tierInfo = SUBSCRIPTION_TIERS[requiredTier];

  return (
    <Card className={cn(
      "border-2 border-dashed relative overflow-hidden",
      productInfo?.borderColor || "border-primary/30",
      className
    )}>
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            productInfo?.bgColor || "bg-primary/10"
          )}>
            <Lock className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="font-semibold text-lg mb-2">
            {moduleName || moduleId} Locked
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            This feature requires a {tierInfo.name} subscription or higher.
          </p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="bg-primary/10">
              <Crown className="h-3 w-3 mr-1" />
              {tierInfo.name}
            </Badge>
            <span className="text-sm text-muted-foreground">
              ${tierInfo.price}/mo
            </span>
          </div>

          <Button onClick={handleUpgrade} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            Upgrade to {tierInfo.name}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Blurred preview of locked content */}
      <div className="blur-sm pointer-events-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {productInfo?.icon}
            {moduleName || moduleId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Feature Preview</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

/**
 * useModuleGate hook for programmatic access checks
 */
export const useModuleGate = (moduleId: string, requiredTier: SubscriptionTier = 'starter') => {
  const { subscription, isLoading } = useSubscription();

  const hasAccess = useMemo(() => {
    if (subscription.tier === 'beta') return true;
    
    const tierOrder: SubscriptionTier[] = ['free', 'starter', 'business', 'pro', 'enterprise', 'beta'];
    const userTierIndex = tierOrder.indexOf(subscription.tier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    
    return userTierIndex >= requiredTierIndex;
  }, [subscription.tier, requiredTier]);

  return {
    hasAccess,
    isLoading,
    currentTier: subscription.tier,
    requiredTier
  };
};

export default ModuleGate;
