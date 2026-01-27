/**
 * GENIE STUDIO LAYOUT
 * Dedicated layout for Genie Studio users
 * Shows only Genie-related navigation based on subscription
 */

import React, { Suspense, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GenieStudioNavigation } from '@/components/navigation/GenieStudioNavigation';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { useGenieStudioNavigation } from '@/hooks/useGenieStudioNavigation';
import { Loader2, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TIER_INFO } from '@/config/genieStudioNavItems';

interface GenieStudioLayoutProps {
  children: React.ReactNode;
  variant?: 'sidebar' | 'topbar' | 'none';
  requireAuth?: boolean;
}

/**
 * Loading fallback for lazy components
 */
const LoadingFallback = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

/**
 * Upgrade prompt for tier-locked features
 */
const UpgradePrompt: React.FC<{ requiredTier: string; tierName: string }> = ({ 
  requiredTier, 
  tierName 
}) => {
  const navigate = useNavigate();
  const tierKey = requiredTier as keyof typeof TIER_INFO;
  const TierIcon = TIER_INFO[tierKey]?.icon || Crown;
  
  return (
    <div className="flex h-[60vh] items-center justify-center p-8">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Upgrade Required</CardTitle>
          <CardDescription>
            This feature requires a <strong>{tierName}</strong> subscription or higher.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <TierIcon className={`h-4 w-4 ${TIER_INFO[tierKey]?.color || ''}`} />
            <span>Unlock with {tierName} plan</span>
          </div>
          <Button onClick={() => navigate('/subscription')} className="w-full">
            <Crown className="mr-2 h-4 w-4" />
            View Plans
          </Button>
          <Button variant="ghost" onClick={() => navigate('/genie-studio')} className="w-full">
            Return to Studio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Main Genie Studio Layout Component
 */
export const GenieStudioLayout: React.FC<GenieStudioLayoutProps> = ({ 
  children, 
  variant = 'sidebar',
  requireAuth = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, genieUser } = useGenieStudioAuth();
  const { canAccessRoute, getUpgradePromptForPath } = useGenieStudioNavigation();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/genie-studio-auth', { 
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate, location.pathname]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingFallback />
      </div>
    );
  }

  // Not authenticated
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  // Check tier access for current route
  const upgradePrompt = getUpgradePromptForPath(location.pathname);
  
  // No navigation variant
  if (variant === 'none') {
    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingFallback />}>
          {upgradePrompt ? (
            <UpgradePrompt 
              requiredTier={upgradePrompt.requiredTier} 
              tierName={upgradePrompt.tierName} 
            />
          ) : (
            children
          )}
        </Suspense>
      </div>
    );
  }

  // Topbar variant
  if (variant === 'topbar') {
    return (
      <div className="min-h-screen bg-background">
        <GenieStudioNavigation variant="topbar" />
        <main className="container py-6">
          <Suspense fallback={<LoadingFallback />}>
            {upgradePrompt ? (
              <UpgradePrompt 
                requiredTier={upgradePrompt.requiredTier} 
                tierName={upgradePrompt.tierName} 
              />
            ) : (
              children
            )}
          </Suspense>
        </main>
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <div className="min-h-screen bg-background">
      <GenieStudioNavigation variant="sidebar" />
      <main className="pl-64">
        <div className="container py-6">
          <Suspense fallback={<LoadingFallback />}>
            {upgradePrompt ? (
              <UpgradePrompt 
                requiredTier={upgradePrompt.requiredTier} 
                tierName={upgradePrompt.tierName} 
              />
            ) : (
              children
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default GenieStudioLayout;
