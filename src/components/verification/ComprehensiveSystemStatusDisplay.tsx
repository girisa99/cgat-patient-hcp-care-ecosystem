
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Shield, Database, Users, Settings, Zap } from 'lucide-react';
import { useComprehensiveSystemStatus } from '@/hooks/useComprehensiveSystemStatus';
import { useApiIntegrationStatus } from '@/hooks/useApiIntegrationStatus';

const ComprehensiveSystemStatusDisplay: React.FC = () => {
  const { systemStatus, isChecking, recheckStatus } = useComprehensiveSystemStatus();
  const { status: apiStatus, isChecking: isCheckingApi, recheckStatus: recheckApiStatus } = useApiIntegrationStatus();

  const getStatusIcon = (isWorking: boolean) => {
    if (isWorking) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (isWorking: boolean) => {
    return isWorking ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200";
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return "bg-green-100 text-green-800 border-green-200";
      case 'warning': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'critical': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const moduleIcons = {
    'User Management': Users,
    'Facilities': Shield,
    'Modules': Settings,
    'API Integrations': Zap,
    'Admin Verification': Database
  };

  if (isChecking || isCheckingApi) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Checking Comprehensive System Status...
          </CardTitle>
          <CardDescription>
            Verifying all modules, API integrations, and system health
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall System Health */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Comprehensive System Status
                </CardTitle>
                <CardDescription>
                  Complete system health across all modules and integrations
                </CardDescription>
              </div>
              <Button onClick={() => { recheckStatus(); recheckApiStatus(); }} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Health Summary */}
            <div className={`p-4 rounded-lg border ${getHealthColor(systemStatus.overallHealth)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Overall System Health</h3>
                  <p className="text-sm mt-1">
                    {systemStatus.workingModules}/5 core modules operational
                  </p>
                </div>
                <Badge className="text-lg font-bold">
                  {systemStatus.overallHealth.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Core Modules Status */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Core Modules Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  systemStatus.userManagement,
                  systemStatus.facilities,
                  systemStatus.modules,
                  systemStatus.apiIntegrations,
                  systemStatus.adminVerification
                ].map((module) => {
                  const IconComponent = moduleIcons[module.moduleName as keyof typeof moduleIcons];
                  return (
                    <div key={module.moduleName} className={`p-3 rounded-lg border ${getStatusColor(module.isWorking)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        {getStatusIcon(module.isWorking)}
                        <span className="text-sm font-medium">{module.moduleName}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Records: {module.dataCount}</div>
                        {module.lastActivity && (
                          <div>Last Activity: {new Date(module.lastActivity).toLocaleDateString()}</div>
                        )}
                        {module.issues.length > 0 && (
                          <div className="text-red-600">Issues: {module.issues.length}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* API Integration Status */}
            {apiStatus && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">API Integration Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg border ${getStatusColor(apiStatus.internalApisWorking)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(apiStatus.internalApisWorking)}
                      <span className="text-sm font-medium">Internal APIs</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${getStatusColor(apiStatus.externalApisWorking)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(apiStatus.externalApisWorking)}
                      <span className="text-sm font-medium">External APIs</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${getStatusColor(apiStatus.publishedApisWorking)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(apiStatus.publishedApisWorking)}
                      <span className="text-sm font-medium">Published APIs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Recommendations */}
            {systemStatus.recommendations.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">📊 System Recommendations</h3>
                <div className="space-y-1">
                  {systemStatus.recommendations.map((recommendation, index) => (
                    <div key={index} className="text-sm text-blue-700">
                      {recommendation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues Summary */}
            {systemStatus.totalIssues > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">⚠️ Issues Found ({systemStatus.totalIssues})</h3>
                <div className="space-y-2">
                  {[
                    systemStatus.userManagement,
                    systemStatus.facilities,
                    systemStatus.modules,
                    systemStatus.apiIntegrations,
                    systemStatus.adminVerification
                  ].filter(m => m.issues.length > 0).map((module) => (
                    <div key={module.moduleName} className="text-sm text-red-700">
                      <strong>{module.moduleName}:</strong>
                      <ul className="ml-4">
                        {module.issues.map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComprehensiveSystemStatusDisplay;
