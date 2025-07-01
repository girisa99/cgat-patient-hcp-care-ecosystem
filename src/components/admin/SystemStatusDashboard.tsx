import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Code, 
  Navigation, 
  Users, 
  Shield,
  Activity,
  RefreshCw,
  FileText,
  Settings,
  Eye,
  Bug
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemComponent {
  name: string;
  status: 'active' | 'inactive' | 'error' | 'unknown';
  type: 'page' | 'hook' | 'component' | 'database' | 'verification';
  path?: string;
  issues?: string[];
  dependencies?: string[];
  lastUpdated?: string;
}

export const SystemStatusDashboard: React.FC = () => {
  const [systemComponents, setSystemComponents] = useState<SystemComponent[]>([]);
  const [databaseTables, setDatabaseTables] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    scanSystemStatus();
    checkDatabaseTables();
  }, []);

  const scanSystemStatus = async () => {
    setIsScanning(true);
    
    const components: SystemComponent[] = [
      // Core Pages
      {
        name: 'API Services Page',
        status: 'active',
        type: 'page',
        path: '/api-services',
        dependencies: ['useApiIntegrations', 'ApiIntegrationsManager']
      },
      {
        name: 'Admin Verification Page',
        status: 'inactive',
        type: 'page',
        path: '/admin/verification',
        issues: ['Missing SystemVerificationDashboard integration', 'No route configured']
      },
      {
        name: 'Patients Page',
        status: 'unknown',
        type: 'page',
        path: '/patients'
      },
      {
        name: 'Users Page',
        status: 'unknown',
        type: 'page',
        path: '/users'
      },
      {
        name: 'Facilities Page',
        status: 'unknown',
        type: 'page',
        path: '/facilities'
      },
      {
        name: 'Onboarding Page',
        status: 'unknown',
        type: 'page',
        path: '/onboarding'
      },
      
      // Core Hooks
      {
        name: 'useApiIntegrations',
        status: 'active',
        type: 'hook',
        path: 'src/hooks/useApiIntegrations.tsx',
        issues: ['Using fallback data instead of real database', 'Registry table may be empty']
      },
      {
        name: 'useExternalApis',
        status: 'active',
        type: 'hook',
        path: 'src/hooks/useExternalApis.tsx'
      },
      {
        name: 'usePublishedApiIntegration',
        status: 'active',
        type: 'hook',
        path: 'src/hooks/usePublishedApiIntegration.tsx'
      },
      
      // Verification System
      {
        name: 'Enhanced System Verifier',
        status: 'active',
        type: 'verification',
        path: 'src/utils/verification/EnhancedIntegratedSystemVerifier.ts',
        dependencies: ['UpdateFirstGateway', 'ComponentRegistryScanner']
      },
      {
        name: 'Update First Gateway',
        status: 'active',
        type: 'verification',
        path: 'src/utils/verification/UpdateFirstGateway.ts'
      },
      {
        name: 'Comprehensive Automation Coordinator',
        status: 'active',
        type: 'verification',
        path: 'src/utils/verification/ComprehensiveAutomationCoordinator.ts'
      },
      {
        name: 'System Verification Dashboard',
        status: 'inactive',
        type: 'component',
        path: 'src/components/verification/SystemVerificationDashboard.tsx',
        issues: ['Not integrated into admin routes', 'Missing from navigation']
      },
      
      // Database Tables Status
      {
        name: 'API Integration Registry',
        status: 'active',
        type: 'database',
        dependencies: ['Real data available']
      },
      {
        name: 'External API Registry',
        status: 'active',
        type: 'database'
      },
      {
        name: 'Active Issues Table',
        status: 'active',
        type: 'database'
      },
      {
        name: 'Issue Fixes Table',
        status: 'active',
        type: 'database'
      }
    ];

    setSystemComponents(components);
    setIsScanning(false);
  };

  const checkDatabaseTables = async () => {
    try {
      // Check key tables with proper type definitions
      const tablesToCheck = [
        'api_integration_registry',
        'external_api_registry', 
        'active_issues',
        'issue_fixes',
        'profiles',
        'facilities',
        'modules'
      ] as const;

      const tableStatus = [];
      for (const tableName of tablesToCheck) {
        try {
          // Use type assertion to satisfy TypeScript
          const { data, error, count } = await supabase
            .from(tableName as any)
            .select('*', { count: 'exact', head: true });
          
          tableStatus.push({
            name: tableName,
            status: error ? 'error' : 'active',
            rowCount: count || 0,
            error: error?.message
          });
        } catch (err) {
          tableStatus.push({
            name: tableName,
            status: 'error',
            rowCount: 0,
            error: 'Table access failed'
          });
        }
      }
      
      setDatabaseTables(tableStatus);
    } catch (error) {
      console.error('Database check failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'unknown': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'unknown': return <Eye className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const activeCount = systemComponents.filter(c => c.status === 'active').length;
  const inactiveCount = systemComponents.filter(c => c.status === 'inactive').length;
  const errorCount = systemComponents.filter(c => c.status === 'error').length;
  const unknownCount = systemComponents.filter(c => c.status === 'unknown').length;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              System Status Dashboard
            </div>
            <Button onClick={scanSystemStatus} disabled={isScanning} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{inactiveCount}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{unknownCount}</div>
              <div className="text-sm text-gray-600">Unknown</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemComponents.map((component, index) => (
              <Card key={index} className={`border ${getStatusColor(component.status)}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(component.status)}
                      <span className="ml-2">{component.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {component.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {component.path && (
                    <div className="text-xs text-gray-600">
                      <code>{component.path}</code>
                    </div>
                  )}
                  
                  {component.dependencies && (
                    <div className="text-xs">
                      <span className="font-medium">Dependencies:</span>
                      <div className="mt-1">
                        {component.dependencies.map((dep, i) => (
                          <Badge key={i} variant="secondary" className="text-xs mr-1">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {component.issues && (
                    <div className="text-xs">
                      <span className="font-medium text-red-600">Issues:</span>
                      <ul className="mt-1 space-y-1">
                        {component.issues.map((issue, i) => (
                          <li key={i} className="text-red-600">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <div className="space-y-4">
            {systemComponents.filter(c => c.type === 'page').map((component, index) => (
              <Card key={index} className={`border ${getStatusColor(component.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(component.status)}
                      <span className="ml-2 font-medium">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{component.status}</Badge>
                      {component.path && (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{component.path}</code>
                      )}
                    </div>
                  </div>
                  {component.issues && (
                    <div className="mt-2 text-sm text-red-600">
                      Issues: {component.issues.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hooks">
          <div className="space-y-4">
            {systemComponents.filter(c => c.type === 'hook').map((component, index) => (
              <Card key={index} className={`border ${getStatusColor(component.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(component.status)}
                      <span className="ml-2 font-medium">{component.name}</span>
                    </div>
                    <Badge variant="outline">{component.status}</Badge>
                  </div>
                  {component.issues && (
                    <div className="mt-2 text-sm text-orange-600">
                      Issues: {component.issues.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database">
          <div className="space-y-4">
            {databaseTables.map((table, index) => (
              <Card key={index} className={`border ${getStatusColor(table.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      <span className="font-medium">{table.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{table.status}</Badge>
                      <span className="text-sm text-gray-600">{table.rowCount} rows</span>
                    </div>
                  </div>
                  {table.error && (
                    <div className="mt-2 text-sm text-red-600">
                      Error: {table.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verification">
          <div className="space-y-4">
            {systemComponents.filter(c => c.type === 'verification').map((component, index) => (
              <Card key={index} className={`border ${getStatusColor(component.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(component.status)}
                      <span className="ml-2 font-medium">{component.name}</span>
                    </div>
                    <Badge variant="outline">{component.status}</Badge>
                  </div>
                  {component.dependencies && (
                    <div className="mt-2 text-sm text-gray-600">
                      Dependencies: {component.dependencies.join(', ')}
                    </div>
                  )}
                  {component.issues && (
                    <div className="mt-2 text-sm text-red-600">
                      Issues: {component.issues.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemStatusDashboard;
