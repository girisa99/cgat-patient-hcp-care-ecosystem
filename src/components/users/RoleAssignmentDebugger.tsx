
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface RoleAssignmentDebuggerProps {
  userId: string;
  userName: string;
}

const RoleAssignmentDebugger: React.FC<RoleAssignmentDebuggerProps> = ({ userId, userName }) => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);

    try {
      const results: any = {
        userId,
        userName,
        timestamp: new Date().toISOString(),
        checks: {}
      };

      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      results.checks.profileExists = {
        success: !profileError && profile,
        data: profile,
        error: profileError
      };

      // Check user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          *,
          roles (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId);

      results.checks.currentRoles = {
        success: !userRolesError,
        data: userRoles,
        error: userRolesError
      };

      // Check available roles
      const { data: allRoles, error: allRolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      results.checks.availableRoles = {
        success: !allRolesError,
        data: allRoles,
        error: allRolesError
      };

      // Check current user permissions
      const { data: currentUser } = await supabase.auth.getUser();
      const { data: currentUserRoles, error: currentUserRolesError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', currentUser.user?.id);

      results.checks.currentUserPermissions = {
        success: !currentUserRolesError,
        data: currentUserRoles,
        error: currentUserRolesError,
        hasAdminRole: currentUserRoles?.some(ur => ur.roles?.name === 'superAdmin'),
        hasOnboardingRole: currentUserRoles?.some(ur => ur.roles?.name === 'onboardingTeam')
      };

      setDiagnostics(results);

    } catch (error) {
      setDiagnostics({
        error: 'Failed to run diagnostics',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      runDiagnostics();
    }
  }, [userId]);

  const renderCheckResult = (check: any, title: string) => {
    if (!check) return null;

    return (
      <div className="mb-4 p-3 border rounded-md">
        <div className="flex items-center gap-2 mb-2">
          {check.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium">{title}</span>
        </div>
        
        {check.error && (
          <div className="text-red-600 text-sm mb-2">
            Error: {check.error.message || JSON.stringify(check.error)}
          </div>
        )}
        
        {check.data && (
          <div className="text-sm">
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(check.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Role Assignment Diagnostics
        </CardTitle>
        <p className="text-sm text-gray-600">
          Diagnosing role assignment for: {userName} ({userId})
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={runDiagnostics} disabled={isLoading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Diagnostics
          </Button>
        </div>

        {diagnostics && (
          <div className="space-y-4">
            {diagnostics.error ? (
              <div className="text-red-600 p-3 border border-red-200 rounded-md">
                <p className="font-medium">Diagnostics Error:</p>
                <p className="text-sm">{diagnostics.error}</p>
              </div>
            ) : (
              <>
                {renderCheckResult(diagnostics.checks.profileExists, "Profile Exists")}
                {renderCheckResult(diagnostics.checks.currentRoles, "Current User Roles")}
                {renderCheckResult(diagnostics.checks.availableRoles, "Available Roles")}
                {renderCheckResult(diagnostics.checks.currentUserPermissions, "Current User Permissions")}

                {/* Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium mb-2">Summary:</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <Badge variant={diagnostics.checks.profileExists?.success ? "default" : "destructive"}>
                        {diagnostics.checks.profileExists?.success ? "Profile OK" : "Profile Missing"}
                      </Badge>
                    </p>
                    <p>
                      <Badge variant={diagnostics.checks.currentRoles?.success ? "default" : "destructive"}>
                        Roles: {diagnostics.checks.currentRoles?.data?.length || 0}
                      </Badge>
                    </p>
                    <p>
                      <Badge variant={diagnostics.checks.currentUserPermissions?.hasAdminRole ? "default" : "secondary"}>
                        {diagnostics.checks.currentUserPermissions?.hasAdminRole ? "Has Admin Rights" : "No Admin Rights"}
                      </Badge>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleAssignmentDebugger;
