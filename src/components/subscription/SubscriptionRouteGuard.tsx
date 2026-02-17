/**
 * SUBSCRIPTION ROUTE GUARD
 * Tier-based route protection for Genie Suite
 * Prevents access to routes that require higher subscription tiers
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSubscription, SubscriptionTier, SUBSCRIPTION_TIERS, GENIE_PRODUCTS } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SubscriptionRouteGuardProps {
  children: React.ReactNode;
  requiredTier?: SubscriptionTier;
  requiredProduct?: keyof typeof GENIE_PRODUCTS;
  fallbackPath?: string;
  showUpgradeUI?: boolean;
}

// Tier hierarchy for comparison
const TIER_HIERARCHY: SubscriptionTier[] = ['free', 'starter', 'business', 'pro', 'enterprise', 'beta'];

/**
 * Check if user's tier meets or exceeds required tier
 */
const meetsMinimumTier = (userTier: SubscriptionTier | null, requiredTier: SubscriptionTier): boolean => {
  if (!userTier) return false;
  if (userTier === 'beta') return true; // Beta has full access
  
  const userIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
  
  return userIndex >= requiredIndex;
};

/**
 * SubscriptionRouteGuard - Protects routes based on subscription tier
 */
export const SubscriptionRouteGuard: React.FC<SubscriptionRouteGuardProps> = ({
  children,
  requiredTier = 'starter',
  requiredProduct,
  fallbackPath = '/genie-studio-pricing',
  showUpgradeUI = true
}) => {
  const { subscription, isLoading, hasModuleAccess } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check if user has required tier
  const hasTierAccess = meetsMinimumTier(subscription.tier, requiredTier);
  
  // Check if user has required product access (if specified)
  const hasProductAccess = !requiredProduct || hasModuleAccess(requiredProduct);
  
  // Combined access check
  const hasAccess = hasTierAccess && hasProductAccess;

  // Check trial status
  const isTrialExpired = subscription.tier === 'free' && 
    subscription.trialEndsAt && 
    new Date(subscription.trialEndsAt) < new Date();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Set redirect flag if no access and not showing upgrade UI
    if (!hasAccess && !showUpgradeUI) {
      setShouldRedirect(true);
    }
  }, [isLoading, hasAccess, showUpgradeUI]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate(fallbackPath, { 
        replace: true,
        state: { 
          from: location.pathname,
          requiredTier,
          requiredProduct
        }
      });
    }
  }, [shouldRedirect, fallbackPath, navigate, location.pathname, requiredTier, requiredProduct]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Checking subscription...</span>
      </div>
    );
  }

  // User has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show upgrade UI or redirect
  if (!showUpgradeUI) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Redirecting...</span>
      </div>
    );
  }

  const requiredTierConfig = SUBSCRIPTION_TIERS[requiredTier];
  const productInfo = requiredProduct ? GENIE_PRODUCTS[requiredProduct] : null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full border-2 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${productInfo?.bgColor || 'bg-primary/10'}`}>
            {isTrialExpired ? (
              <Clock className="h-10 w-10 text-orange-500" />
            ) : (
              <Lock className="h-10 w-10 text-primary" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {isTrialExpired ? 'Trial Expired' : 'Upgrade Required'}
          </CardTitle>
          
          <CardDescription className="text-base mt-2">
            {isTrialExpired ? (
              'Your free trial has ended. Upgrade to continue using premium features.'
            ) : (
              <>
                This feature requires a{' '}
                <span className="font-semibold text-foreground">{requiredTierConfig.name}</span>
                {' '}subscription or higher.
              </>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current vs Required Tier */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <Badge variant="outline" className="text-sm">
                {subscription.tier ? SUBSCRIPTION_TIERS[subscription.tier]?.name || 'Free' : 'Free'}
              </Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Required</p>
              <Badge className="bg-primary text-primary-foreground text-sm">
                <Crown className="h-3 w-3 mr-1" />
                {requiredTierConfig.name}
              </Badge>
            </div>
          </div>

          {/* Trial expiration warning */}
          {isTrialExpired && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-700 dark:text-orange-300">Trial ended on {new Date(subscription.trialEndsAt!).toLocaleDateString()}</p>
                <p className="text-orange-600 dark:text-orange-400 mt-1">
                  Upgrade now to keep your data and unlock all features.
                </p>
              </div>
            </div>
          )}

          {/* Features preview */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <p className="text-sm font-medium mb-3">With {requiredTierConfig.name}, you get:</p>
            <ul className="space-y-2">
              {requiredTierConfig.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="text-center">
            <span className="text-3xl font-bold">${requiredTierConfig.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/genie-studio-pricing', { state: { highlightTier: requiredTier } })}
              className="w-full gap-2"
              size="lg"
            >
              <Crown className="h-4 w-4" />
              Upgrade to {requiredTierConfig.name}
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Hook for programmatic route guard checks
 */
export const useSubscriptionRouteGuard = (requiredTier: SubscriptionTier = 'starter') => {
  const { subscription, isLoading } = useSubscription();
  
  const hasAccess = meetsMinimumTier(subscription.tier, requiredTier);
  const isTrialExpired = subscription.tier === 'free' && 
    subscription.trialEndsAt && 
    new Date(subscription.trialEndsAt) < new Date();
  
  return {
    hasAccess,
    isLoading,
    isTrialExpired,
    currentTier: subscription.tier,
    requiredTier,
    daysRemaining: subscription.trialEndsAt 
      ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null
  };
};

export default SubscriptionRouteGuard;
