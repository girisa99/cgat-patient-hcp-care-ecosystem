/**
 * QuadrantLayout - Unified Layout for 4-Quadrant Architecture
 * 
 * Replaces the fragmented GenieStudioLayout with a cleaner,
 * flow-oriented structure:
 * - Horizontal quadrant nav at top
 * - Ask Genie FAB always visible
 * - Progressive disclosure of features
 */

import React, { Suspense, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QuadrantNavigation, QUADRANT_CONFIG, type Quadrant } from './QuadrantNavigation';
import { AskGenieFAB } from '@/components/genie-support/AskGenieFAB';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { Loader2, Lock, Crown, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TIER_INFO } from '@/config/genieStudioNavItems';
import { LanguageSwitcher } from '@/components/localization/LanguageSwitcher';
import { DebugModeToggle, DebugPanel } from '@/components/resilience/DebugModeToggle';
import { UserErrorReporting } from '@/components/resilience/UserErrorReporting';
import { cn } from '@/lib/utils';

// Import Genie Studio logo
import genieStudioLogo from '@/assets/logos/genie-studio-banner.png';

interface QuadrantLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  requireAuth?: boolean;
  className?: string;
}

/**
 * Loading fallback
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
            <TierIcon className={cn('h-4 w-4', TIER_INFO[tierKey]?.color || '')} />
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
 * Header with logo, quadrant nav, and tools
 */
const QuadrantHeader: React.FC<{ showDebugTools: boolean }> = ({ showDebugTools }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <button
          onClick={() => navigate('/genie-studio')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={genieStudioLogo} alt="Genie Studio" className="h-8 w-auto" />
        </button>

        {/* Quadrant Navigation */}
        <div className="hidden md:block">
          <QuadrantNavigation variant="horizontal" showLabels={true} />
        </div>

        {/* Tools */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          {showDebugTools && <DebugModeToggle />}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/genie-studio')}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile quadrant nav */}
      <div className="md:hidden border-t">
        <QuadrantNavigation variant="horizontal" showLabels={false} />
      </div>
    </header>
  );
};

/**
 * Main Quadrant Layout Component
 */
export const QuadrantLayout: React.FC<QuadrantLayoutProps> = ({ 
  children, 
  showNav = true,
  requireAuth = true,
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, genieUser } = useGenieStudioAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/genie-studio-auth', { 
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate, location.pathname]);

  // Show loading
  if (isLoading && requireAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingFallback />
      </div>
    );
  }

  // Not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Check if user has debug access
  const showDebugTools = genieUser?.is_internal || 
    genieUser?.current_subscription_tier === 'enterprise' ||
    genieUser?.current_subscription_tier === 'business';

  // Don't show FAB on support page
  const showFAB = !location.pathname.includes('/genie-support');

  return (
    <div className="min-h-screen bg-background">
      {showNav && <QuadrantHeader showDebugTools={showDebugTools} />}
      
      <main className={cn('container py-6', className)}>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </main>

      {showFAB && <AskGenieFAB />}
      <UserErrorReporting position="bottom-left" />
      <DebugPanel />
    </div>
  );
};

export default QuadrantLayout;
