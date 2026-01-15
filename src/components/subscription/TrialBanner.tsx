/**
 * TRIAL BANNER COMPONENT
 * Shows trial status, days remaining, and upgrade prompts
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Clock, Sparkles, AlertTriangle, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrialBannerProps {
  onDismiss?: () => void;
  variant?: 'compact' | 'full';
  className?: string;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  onDismiss,
  variant = 'full',
  className
}) => {
  const { subscription, isLoading } = useSubscription();
  const navigate = useNavigate();

  // Don't show for paid subscribers or beta users
  if (isLoading || !subscription.tier || subscription.tier === 'beta') {
    return null;
  }

  // Check if on paid tier
  if (['starter', 'business', 'pro', 'enterprise'].includes(subscription.tier)) {
    return null;
  }

  // Calculate trial days remaining
  const trialEndsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const now = new Date();
  const daysRemaining = trialEndsAt 
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = daysRemaining !== null && daysRemaining <= 0;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;

  // Determine banner style based on trial status
  const bannerStyles = isExpired
    ? 'bg-destructive/10 border-destructive/30 text-destructive'
    : isUrgent
    ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300'
    : 'bg-primary/10 border-primary/30 text-primary';

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center justify-between px-4 py-2 border-b',
        bannerStyles,
        className
      )}>
        <div className="flex items-center gap-2 text-sm">
          {isExpired ? (
            <>
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Trial expired</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              <span>
                <span className="font-medium">{daysRemaining} days</span> left in trial
              </span>
            </>
          )}
        </div>
        <Button 
          size="sm" 
          variant={isExpired ? "destructive" : "default"}
          onClick={() => navigate('/genie-studio-pricing')}
          className="h-7 text-xs"
        >
          <Crown className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      'relative border rounded-lg p-4',
      bannerStyles,
      className
    )}>
      {onDismiss && !isExpired && (
        <button 
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className={cn(
          'p-3 rounded-full',
          isExpired ? 'bg-destructive/20' : isUrgent ? 'bg-orange-500/20' : 'bg-primary/20'
        )}>
          {isExpired ? (
            <AlertTriangle className="h-6 w-6" />
          ) : (
            <Clock className="h-6 w-6" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">
              {isExpired ? 'Your Trial Has Expired' : 'Free Trial'}
            </h4>
            {!isExpired && daysRemaining !== null && (
              <Badge variant="secondary" className={cn(
                isUrgent ? 'bg-orange-500 text-white' : 'bg-primary/20'
              )}>
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
              </Badge>
            )}
          </div>
          
          <p className="text-sm opacity-90 mb-3">
            {isExpired ? (
              'Upgrade now to continue using Genie Studio and keep your work.'
            ) : isUrgent ? (
              'Your trial ends soon! Upgrade to keep all your projects and unlock premium features.'
            ) : (
              'Explore Genie Studio with full access. Upgrade anytime to unlock more features.'
            )}
          </p>

          <div className="flex items-center gap-3">
            <Button 
              size="sm"
              variant={isExpired ? "destructive" : "default"}
              onClick={() => navigate('/genie-studio-pricing')}
              className="gap-1"
            >
              <Sparkles className="h-3 w-3" />
              {isExpired ? 'Upgrade Now' : 'View Plans'}
            </Button>
            
            {!isExpired && (
              <span className="text-xs opacity-70">
                No credit card required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for trial */}
      {!isExpired && daysRemaining !== null && (
        <div className="mt-4">
          <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full transition-all',
                isUrgent ? 'bg-orange-500' : 'bg-primary'
              )}
              style={{ width: `${Math.max(0, ((14 - daysRemaining) / 14) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs opacity-70">
            <span>Trial started</span>
            <span>Trial ends</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialBanner;
