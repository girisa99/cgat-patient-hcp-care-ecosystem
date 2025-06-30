
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Users,
  Building2,
  Settings,
  Shield,
  Database,
  Server,
  Refresh
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useUsers } from '@/hooks/useUsers';
import { useFacilities } from '@/hooks/useFacilities';
import { useModules } from '@/hooks/useModules';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';

interface VerificationResult {
  component: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string[];
  lastChecked?: Date;
}

export const SystemVerificationDashboard: React.FC = () => {
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);

  // Hook instances for testing
  const { user, isAuthenticated, userRoles, loading: authLoading } = useAuthContext();
  const { users, isLoading: usersLoading, error: usersError } = useUsers();
  const { facilities, isLoading: facilitiesLoading, error: facilitiesError } = useFacilities();
  const { modules, isLoading: modulesLoading, error: modulesError } = useModules();
  const { integrations, isLoading: apiLoading, error: apiError } = useApiIntegrations();

  const runVerificationTests = async () => {
    setIsRunningTests(true);
    const results: VerificationResult[] = [];

    // Test Authentication
    console.log('🔍 Testing Authentication System...');
    try {
      if (authLoading) {
        results.push({
          component: 'Authentication',
          status: 'loading',
          message: 'Authentication system is initializing...',
          lastChecked: new Date()
        });
      } else if (isAuthenticated && user) {
        const authDetails = [
          `✅ User authenticated: ${user.email}`,
          `✅ User ID: ${user.id}`,
          `✅ Roles loaded: ${userRoles.length > 0 ? userRoles.join(', ') : 'No roles assigned'}`,
          `✅ Session active: ${isAuthenticated ? 'Yes' : 'No'}`
        ];
        
        results.push({
          component: 'Authentication',
          status: userRoles.length > 0 ? 'success' : 'warning',
          message: userRoles.length > 0 ? 'Authentication system working correctly' : 'User authenticated but no roles assigned',
          details: authDetails,
          lastChecked: new Date()
        });
      } else {
        results.push({
          component: 'Authentication',
          status: 'error',
          message: 'User not authenticated or authentication failed',
          details: ['❌ Please check login functionality'],
          lastChecked: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'Authentication',
        status: 'error',
        message: 'Authentication system error',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date()
      });
    }

    // Test User Management
    console.log('🔍 Testing User Management System...');
    try {
      if (usersLoading) {
        results.push({
          component: 'User Management',
          status: 'loading',
          message: 'Loading user data...',
          lastChecked: new Date()
        });
      } else if (usersError) {
        results.push({
          component: 'User Management',
          status: 'error',
          message: 'User management system error',
          details: [`❌ Error: ${usersError.message}`],
          lastChecked: new Date()
        });
      } else if (users && users.length > 0) {
        const userDetails = [
          `✅ Total users loaded: ${users.length}`,
          `✅ Users with roles: ${users.filter(u => u.user_roles?.length > 0).length}`,
          `✅ Users without roles: ${users.filter(u => !u.user_roles || u.user_roles.length === 0).length}`,
          `✅ Users with facilities: ${users.filter(u => u.facilities).length}`
        ];
        
        results.push({
          component: 'User Management',
          status: 'success',
          message: 'User management system working correctly',
          details: userDetails,
          lastChecked: new Date()
        });
      } else {
        results.push({
          component: 'User Management',
          status: 'warning',
          message: 'No users found in system',
          details: ['⚠️ System may be empty or users not loading'],
          lastChecked: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'User Management',
        status: 'error',
        message: 'User management system error',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date()
      });
    }

    // Test Facilities Management
    console.log('🔍 Testing Facilities Management System...');
    try {
      if (facilitiesLoading) {
        results.push({
          component: 'Facilities Management',
          status: 'loading',
          message: 'Loading facilities data...',
          lastChecked: new Date()
        });
      } else if (facilitiesError) {
        results.push({
          component: 'Facilities Management',
          status: 'error',
          message: 'Facilities management system error',
          details: [`❌ Error: ${facilitiesError.message}`],
          lastChecked: new Date()
        });
      } else if (facilities && facilities.length > 0) {
        const facilityDetails = [
          `✅ Total facilities loaded: ${facilities.length}`,
          `✅ Active facilities: ${facilities.filter(f => f.is_active).length}`,
          `✅ Facility types: ${[...new Set(facilities.map(f => f.facility_type))].join(', ')}`
        ];
        
        results.push({
          component: 'Facilities Management',
          status: 'success',
          message: 'Facilities management system working correctly',
          details: facilityDetails,
          lastChecked: new Date()
        });
      } else {
        results.push({
          component: 'Facilities Management',
          status: 'warning',
          message: 'No facilities found in system',
          details: ['⚠️ System may be empty or facilities not loading'],
          lastChecked: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'Facilities Management',
        status: 'error',
        message: 'Facilities management system error',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date()
      });
    }

    // Test Modules System
    console.log('🔍 Testing Modules Management System...');
    try {
      if (modulesLoading) {
        results.push({
          component: 'Modules Management',
          status: 'loading',
          message: 'Loading modules data...',
          lastChecked: new Date()
        });
      } else if (modulesError) {
        results.push({
          component: 'Modules Management',
          status: 'error',
          message: 'Modules management system error',
          details: [`❌ Error: ${modulesError.message}`],
          lastChecked: new Date()
        });
      } else if (modules && modules.length > 0) {
        const moduleDetails = [
          `✅ Total modules loaded: ${modules.length}`,
          `✅ Active modules: ${modules.filter(m => m.is_active).length}`,
          `✅ Module names: ${modules.map(m => m.name).join(', ')}`
        ];
        
        results.push({
          component: 'Modules Management',
          status: 'success',
          message: 'Modules management system working correctly',
          details: moduleDetails,
          lastChecked: new Date()
        });
      } else {
        results.push({
          component: 'Modules Management',
          status: 'warning',
          message: 'No modules found in system',
          details: ['⚠️ System may be empty or modules not loading'],
          lastChecked: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'Modules Management',
        status: 'error',
        message: 'Modules management system error',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date()
      });
    }

    // Test API Services
    console.log('🔍 Testing API Services System...');
    try {
      if (apiLoading) {
        results.push({
          component: 'API Services',
          status: 'loading',
          message: 'Loading API integrations...',
          lastChecked: new Date()
        });
      } else if (apiError) {
        results.push({
          component: 'API Services',
          status: 'error',
          message: 'API services system error',
          details: [`❌ Error: ${apiError.message}`],
          lastChecked: new Date()
        });
      } else if (integrations && integrations.length > 0) {
        const apiDetails = [
          `✅ Total integrations: ${integrations.length}`,
          `✅ Internal APIs: ${integrations.filter(i => i.type === 'internal').length}`,
          `✅ External APIs: ${integrations.filter(i => i.type === 'external').length}`,
          `✅ Active integrations: ${integrations.filter(i => i.status === 'active').length}`
        ];
        
        results.push({
          component: 'API Services',
          status: 'success',
          message: 'API services system working correctly',
          details: apiDetails,
          lastChecked: new Date()
        });
      } else {
        results.push({
          component: 'API Services',
          status: 'warning',
          message: 'No API integrations found',
          details: ['⚠️ API integrations may not be loading correctly'],
          lastChecked: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'API Services',
        status: 'error',
        message: 'API services system error',
        details: [`❌ Error: ${error.message}`],
        lastChecked: new Date()
      });
    }

    setVerificationResults(results);
    setLastFullCheck(new Date());
    setIsRunningTests(false);
    
    console.log('✅ System verification completed:', results);
  };

  useEffect(() => {
    // Run initial verification
    runVerificationTests();
  }, []);

  const getStatusIcon = (status: VerificationResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'loading': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: VerificationResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      loading: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const successCount = verificationResults.filter(r => r.status === 'success').length;
  const errorCount = verificationResults.filter(r => r.status === 'error').length;
  const warningCount = verificationResults.filter(r => r.status === 'warning').length;
  const loadingCount = verificationResults.filter(r => r.status === 'loading').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Verification Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of all core application components
          </p>
        </div>
        <Button 
          onClick={runVerificationTests}
          disabled={isRunningTests}
          className="flex items-center gap-2"
        >
          <Refresh className={`h-4 w-4 ${isRunningTests ? 'animate-spin' : ''}`} />
          {isRunningTests ? 'Running Tests...' : 'Re-run Tests'}
        </Button>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{successCount}</p>
                <p className="text-sm text-muted-foreground">Passing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{warningCount}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{loadingCount}</p>
                <p className="text-sm text-muted-foreground">Loading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Component Status
          </CardTitle>
          {lastFullCheck && (
            <p className="text-sm text-muted-foreground">
              Last checked: {lastFullCheck.toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-medium">{result.component}</h3>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                
                {result.details && result.details.length > 0 && (
                  <div className="mt-3 pl-8">
                    <div className="space-y-1">
                      {result.details.map((detail, idx) => (
                        <p key={idx} className="text-sm font-mono bg-muted p-2 rounded">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.lastChecked && (
                  <div className="mt-2 pl-8">
                    <p className="text-xs text-muted-foreground">
                      Checked: {result.lastChecked.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Test User Management
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Test Facilities
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Test Modules
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
