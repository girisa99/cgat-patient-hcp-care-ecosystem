/**
 * GENIE ADMIN PAGE
 * Admin page for managing internal Genie Studio users
 * Restricted to internal users with super_admin role
 */
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import InternalUserAdminPanel from '@/components/genie-admin/InternalUserAdminPanel';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GenieAdminPage: React.FC = () => {
  const { genieUser, isAuthenticated, isInternalUser } = useGenieStudioAuth();
  const navigate = useNavigate();
  
  // Check if user is internal (admin access handled by isInternalUser flag)
  const isInternalAdmin = isInternalUser;
  
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
                Please sign in to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/genie-studio-auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  if (!isInternalAdmin) {
    return (
      <AppLayout>
        <div className="container max-w-4xl py-8">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Access Denied
              </CardTitle>
              <CardDescription>
                This page is restricted to internal administrators only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You must be an internal team member with super_admin or marketing_lead role to access this page.
              </p>
              <Button variant="outline" onClick={() => navigate('/genie-studio')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container py-8">
        <InternalUserAdminPanel />
      </div>
    </AppLayout>
  );
};

export default GenieAdminPage;
