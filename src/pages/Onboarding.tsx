
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, UserPlus, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import CreateFacilityDialog from '@/components/facilities/CreateFacilityDialog';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import ModuleGuard from '@/components/modules/ModuleGuard';

const Onboarding = () => {
  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  return (
    <StandardizedDashboardLayout
      showPageHeader={true}
      pageTitle="Onboarding Management"
      pageSubtitle="Streamlined workflow for onboarding new facilities and users"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Facility Onboarding - Protected by module access */}
        <ModuleGuard moduleName="onboarding_workflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Facility Onboarding
                <Shield className="h-4 w-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Complete facility setup including registration, licensing, and initial configuration.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Register facility details
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Set facility type and licensing
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Configure facility settings
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => setFacilityDialogOpen(true)}
              >
                Start New Facility Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </ModuleGuard>

        {/* User Onboarding - Protected by module access */}
        <ModuleGuard moduleName="onboarding_workflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                User Onboarding
                <Shield className="h-4 w-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Onboard new users with role assignment and facility access setup.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Create user accounts
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Assign appropriate roles
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Grant facility access
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => setUserDialogOpen(true)}
              >
                Start User Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </ModuleGuard>
      </div>

      {/* Overview section - always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              The onboarding tab provides streamlined workflows for:
            </p>
            <div className="grid gap-4 md:grid-cols-3 text-left">
              <div className="space-y-2">
                <h4 className="font-medium">Complete Facility Setup</h4>
                <p className="text-sm text-muted-foreground">
                  Register new healthcare facilities with all required information, licensing, and configuration.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">User Account Creation</h4>
                <p className="text-sm text-muted-foreground">
                  Create user accounts with proper role assignment and facility access permissions.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Access Management</h4>
                <p className="text-sm text-muted-foreground">
                  Manage user-facility relationships and access levels for comprehensive security.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module-protected dialogs */}
      <ModuleGuard moduleName="onboarding_workflow" showAccessDenied={false}>
        <CreateFacilityDialog 
          open={facilityDialogOpen}
          onOpenChange={setFacilityDialogOpen}
        />
        
        <CreateUserDialog 
          open={userDialogOpen}
          onOpenChange={setUserDialogOpen}
        />
      </ModuleGuard>
    </StandardizedDashboardLayout>
  );
};

export default Onboarding;
