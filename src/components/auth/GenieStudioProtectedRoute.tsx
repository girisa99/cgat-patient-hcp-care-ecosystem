/**
 * GENIE STUDIO PROTECTED ROUTE
 * Uses useGenieStudioAuth instead of useMasterAuth for Genie Studio routes
 * This separates Genie Studio auth from the healthcare platform auth
 */

import { ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenieStudioAuth, GenieStudioRole } from '@/hooks/useGenieStudioAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface GenieStudioProtectedRouteProps {
  children: ReactNode;
  /** Required Genie Studio roles (e.g., 'super_admin', 'subscriber_enterprise') */
  requiredRoles?: GenieStudioRole[];
  /** Minimum subscription tier required */
  minTier?: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
  /** Require internal user status */
  requireInternal?: boolean;
  /** Custom redirect path on access denied */
  redirectTo?: string;
}

const GenieStudioProtectedRoute = ({
  children,
  requiredRoles,
  minTier,
  requireInternal = false,
  redirectTo = '/genie-studio-auth'
}: GenieStudioProtectedRouteProps) => {
  const { 
    isLoading, 
    isAuthenticated, 
    genieUser, 
    hasAnyRole, 
    hasSubscriptionTier,
    isInternalUser 
  } = useGenieStudioAuth();
  
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hadAuthenticatedRef = useRef<boolean>(false);

  // Track if user was authenticated before (grace period on token refresh)
  useEffect(() => {
    if (isAuthenticated) {
      hadAuthenticatedRef.current = true;
    }
  }, [isAuthenticated]);

  // Check role-based access
  const hasRequiredRole = !requiredRoles || requiredRoles.length === 0 || 
    hasAnyRole(requiredRoles);

  // Check subscription tier access
  const hasTierAccess = !minTier || hasSubscriptionTier(minTier);

  // Check internal user requirement
  const hasInternalAccess = !requireInternal || isInternalUser;

  // Combined access check
  const hasAccess = hasRequiredRole && hasTierAccess && hasInternalAccess;

  useEffect(() => {
    const clearTimer = () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };

    // While loading, never redirect
    if (isLoading) {
      clearTimer();
      return;
    }

    // If not authenticated
    if (!isAuthenticated) {
      const delay = hadAuthenticatedRef.current ? 2500 : 0;
      clearTimer();
      if (delay === 0) {
        navigate(redirectTo, { replace: true });
      } else {
        redirectTimeoutRef.current = setTimeout(() => {
          if (!isAuthenticated) {
            navigate(redirectTo, { replace: true });
          }
        }, delay);
      }
      return;
    }

    // If authenticated but user profile not yet loaded, wait
    if (!genieUser) {
      // Wait a bit longer for profile to load
      clearTimer();
      redirectTimeoutRef.current = setTimeout(() => {
        // After timeout, if still no user profile, redirect to auth
        if (!genieUser) {
          console.log('🔄 No Genie Studio profile found, redirecting to auth...');
          navigate(redirectTo, { replace: true });
        }
      }, 3000);
      return;
    }

    // If authenticated but lacks required access
    if (!hasAccess) {
      clearTimer();
      redirectTimeoutRef.current = setTimeout(() => {
        if (!hasAccess) {
          console.log('🚫 Insufficient Genie Studio access, redirecting...');
          navigate('/genie-landing', { replace: true });
        }
      }, 1500);
      return;
    }

    // All good
    clearTimer();

    return () => clearTimer();
  }, [isLoading, isAuthenticated, genieUser, hasAccess, navigate, redirectTo]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Verifying access...</span>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Redirecting to login...</span>
      </div>
    );
  }

  // Authenticated but no Genie Studio profile yet
  if (!genieUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Loading your profile...</span>
      </div>
    );
  }

  // Authenticated but lacks access
  if (!hasAccess) {
    const reason = !hasRequiredRole ? 'role' : (!hasTierAccess ? 'subscription tier' : 'internal access');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Insufficient {reason}...</span>
      </div>
    );
  }

  console.log('✅ GenieStudioProtectedRoute allowing access for:', genieUser.email);
  return <>{children}</>;
};

export default GenieStudioProtectedRoute;
