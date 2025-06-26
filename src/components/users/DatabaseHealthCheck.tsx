
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

const DatabaseHealthCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<HealthCheckResult[]>([]);

  const runHealthCheck = async () => {
    setIsChecking(true);
    const checkResults: HealthCheckResult[] = [];

    try {
      // Check 1: Roles table
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id, name')
        .order('name');

      if (rolesError) {
        checkResults.push({
          component: 'Roles Table',
          status: 'error',
          message: `Cannot access roles table: ${rolesError.message}`,
          details: rolesError
        });
      } else {
        const expectedRoles = ['superAdmin', 'healthcareProvider', 'nurse', 'caseManager', 'onboardingTeam', 'patientCaregiver'];
        const existingRoles = roles?.map(r => r.name) || [];
        const missingRoles = expectedRoles.filter(role => !existingRoles.includes(role));
        
        if (missingRoles.length > 0) {
          checkResults.push({
            component: 'Roles Table',
            status: 'warning',
            message: `Missing roles: ${missingRoles.join(', ')}`,
            details: { existing: existingRoles, missing: missingRoles }
          });
        } else {
          checkResults.push({
            component: 'Roles Table',
            status: 'healthy',
            message: `All ${roles.length} expected roles present`,
            details: existingRoles
          });
        }
      }

      // Check 2: User Roles assignments
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role_id,
          roles!inner(name)
        `);

      if (userRolesError) {
        checkResults.push({
          component: 'User Roles',
          status: 'error',
          message: `Cannot access user_roles table: ${userRolesError.message}`,
          details: userRolesError
        });
      } else {
        checkResults.push({
          component: 'User Roles',
          status: 'healthy',
          message: `${userRoles?.length || 0} role assignments found`,
          details: userRoles
        });
      }

      // Check 3: Profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(10);

      if (profilesError) {
        checkResults.push({
          component: 'Profiles Table',
          status: 'error',
          message: `Cannot access profiles table: ${profilesError.message}`,
          details: profilesError
        });
      } else {
        checkResults.push({
          component: 'Profiles Table',
          status: 'healthy',
          message: `Profiles table accessible (showing first ${profiles?.length || 0} records)`,
          details: profiles
        });
      }

      // Check 4: Current user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        checkResults.push({
          component: 'Authentication',
          status: 'error',
          message: 'User not authenticated or auth error',
          details: authError
        });
      } else {
        checkResults.push({
          component: 'Authentication',
          status: 'healthy',
          message: `Authenticated as: ${user.email}`,
          details: { id: user.id, email: user.email }
        });
      }

    } catch (error: any) {
      checkResults.push({
        component: 'General',
        status: 'error',
        message: `Health check failed: ${error.message}`,
        details: error
      });
    }

    setResults(checkResults);
    setIsChecking(false);
  };

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default">OK</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Health Check
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runHealthCheck} disabled={isChecking} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            Run Health Check
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.component}</span>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Show details</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseHealthCheck;
