/**
 * GENIE ADMIN PAGE - UNIFIED PRODUCTION HUB
 * Consolidated admin page with:
 * - Production Hub (Kanban, Calendar, Library, Create, Scheduler)
 * - Arc features merged (Appointments, Schedule flow)
 * - User Management (internal users only)
 * 
 * Role-based access:
 * - Internal users: Full access
 * - superAdmin/admin: Full access
 * - Others: Access via /genie-studio card navigation
 */
import React, { Suspense, lazy } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Lazy load the heavy ProductionHubAdmin to fix loading issues
const ProductionHubAdmin = lazy(() => 
  import('@/components/genie-admin/ProductionHubAdmin').then(m => ({ default: m.ProductionHubAdmin }))
);

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
    <p className="text-muted-foreground">Loading Production Hub...</p>
  </div>
);

const GenieAdminPage: React.FC = () => {
  const { isAuthenticated: isGenieAuth, isInternalUser } = useGenieStudioAuth();
  const { isAuthenticated: isMasterAuth, userRoles } = useMasterAuth();
  const navigate = useNavigate();
  
  // Allow access if either auth system confirms user
  const isAuthenticated = isGenieAuth || isMasterAuth;
  
  // Check if user has admin-level roles in master auth
  const hasAdminRole = userRoles?.some(role => 
    ['superAdmin', 'admin', 'onboardingTeam'].includes(role)
  );
  
  // Allow access for internal users OR users with admin roles
  const hasAccess = isInternalUser || hasAdminRole;
  
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container max-w-4xl py-8">
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent-foreground" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                Please sign in to access the Production Hub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/genie-studio-auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  if (!hasAccess) {
    return (
      <AppLayout>
        <div className="container max-w-4xl py-8">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Access Restricted
              </CardTitle>
              <CardDescription>
                The Production Hub is available to administrators and internal team members
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/genie-studio')}>
                Go to Genie Studio
              </Button>
              <Button variant="outline" onClick={() => navigate('/genie-arc')}>
                Go to Genie Arc
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <Suspense fallback={<LoadingFallback />}>
        <ProductionHubAdmin />
      </Suspense>
    </AppLayout>
  );
};

export default GenieAdminPage;
