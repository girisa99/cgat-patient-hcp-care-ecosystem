/**
 * TierNavigation - P1 #155: Role-Based Navigation
 * 
 * Filter navigation items based on user's subscription tier
 */

import React, { useMemo, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { useSubscription, SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
  requiredTier?: SubscriptionTier;
  badge?: string;
  children?: NavItem[];
  isNew?: boolean;
  isPremium?: boolean;
}

interface TierNavigationProps {
  items: NavItem[];
  showLocked?: boolean;
  showUpgradeBadge?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onItemClick?: (item: NavItem) => void;
  activeItemId?: string;
  className?: string;
}

/**
 * TierNavigation filters navigation items based on subscription tier.
 * Locked items can optionally be shown with lock icons.
 */
export const TierNavigation: React.FC<TierNavigationProps> = ({
  items,
  showLocked = true,
  showUpgradeBadge = true,
  orientation = 'vertical',
  onItemClick,
  activeItemId,
  className
}) => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  // Check if user has access to a tier
  const hasTierAccess = (requiredTier?: SubscriptionTier): boolean => {
    if (!requiredTier) return true;
    if (subscription.tier === 'beta') return true;
    
    const tierOrder: SubscriptionTier[] = ['free', 'starter', 'business', 'pro', 'enterprise', 'beta'];
    const userTierIndex = tierOrder.indexOf(subscription.tier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    
    return userTierIndex >= requiredTierIndex;
  };

  // Filter items based on tier access
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (showLocked) return true;
      return hasTierAccess(item.requiredTier);
    });
  }, [items, showLocked, subscription.tier]);

  const handleItemClick = (item: NavItem, hasAccess: boolean) => {
    if (hasAccess) {
      if (onItemClick) {
        onItemClick(item);
      } else {
        navigate(item.path);
      }
    } else {
      navigate('/pricing');
    }
  };

  return (
    <TooltipProvider>
      <nav className={cn(
        "flex gap-1",
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}>
        {filteredItems.map(item => {
          const hasAccess = hasTierAccess(item.requiredTier);
          const isActive = item.id === activeItemId;
          const tierInfo = item.requiredTier ? SUBSCRIPTION_TIERS[item.requiredTier] : null;

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    "justify-start gap-2 relative",
                    orientation === 'horizontal' ? 'flex-shrink-0' : 'w-full',
                    !hasAccess && 'opacity-60 cursor-pointer'
                  )}
                  onClick={() => handleItemClick(item, hasAccess)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  
                  {/* Lock icon for locked items */}
                  {!hasAccess && (
                    <Lock className="h-3 w-3 ml-auto text-muted-foreground" />
                  )}

                  {/* Premium badge */}
                  {item.isPremium && hasAccess && showUpgradeBadge && (
                    <Crown className="h-3 w-3 ml-auto text-primary" />
                  )}

                  {/* New badge */}
                  {item.isNew && (
                    <Badge variant="default" className="ml-auto text-[10px] px-1 py-0 h-4">
                      New
                    </Badge>
                  )}

                  {/* Custom badge */}
                  {item.badge && !item.isNew && hasAccess && (
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              
              {!hasAccess && (
                <TooltipContent side={orientation === 'vertical' ? 'right' : 'bottom'}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>Requires {tierInfo?.name} or higher</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
};

/**
 * TierLink - Individual tier-gated link component
 */
export const TierLink: React.FC<{
  to: string;
  requiredTier?: SubscriptionTier;
  children: ReactNode;
  className?: string;
  showLockIcon?: boolean;
}> = ({ to, requiredTier, children, className, showLockIcon = true }) => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const hasAccess = useMemo(() => {
    if (!requiredTier) return true;
    if (subscription.tier === 'beta') return true;
    
    const tierOrder: SubscriptionTier[] = ['free', 'starter', 'business', 'pro', 'enterprise', 'beta'];
    const userTierIndex = tierOrder.indexOf(subscription.tier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    
    return userTierIndex >= requiredTierIndex;
  }, [subscription.tier, requiredTier]);

  if (hasAccess) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn("cursor-pointer opacity-60 inline-flex items-center gap-1", className)}
            onClick={() => navigate('/pricing')}
          >
            {children}
            {showLockIcon && <Lock className="h-3 w-3" />}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <span>Upgrade to access this feature</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * useTierNavigation hook for filtering nav items programmatically
 */
export const useTierNavigation = (items: NavItem[]) => {
  const { subscription } = useSubscription();

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (!item.requiredTier) return true;
      if (subscription.tier === 'beta') return true;
      
      const tierOrder: SubscriptionTier[] = ['free', 'starter', 'business', 'pro', 'enterprise', 'beta'];
      const userTierIndex = tierOrder.indexOf(subscription.tier);
      const requiredTierIndex = tierOrder.indexOf(item.requiredTier);
      
      return userTierIndex >= requiredTierIndex;
    });
  }, [items, subscription.tier]);

  const lockedItems = useMemo(() => {
    return items.filter(item => {
      if (!item.requiredTier) return false;
      if (subscription.tier === 'beta') return false;
      
      const tierOrder: SubscriptionTier[] = ['free', 'starter', 'business', 'pro', 'enterprise', 'beta'];
      const userTierIndex = tierOrder.indexOf(subscription.tier);
      const requiredTierIndex = tierOrder.indexOf(item.requiredTier);
      
      return userTierIndex < requiredTierIndex;
    });
  }, [items, subscription.tier]);

  return {
    filteredItems,
    lockedItems,
    currentTier: subscription.tier
  };
};

export default TierNavigation;
