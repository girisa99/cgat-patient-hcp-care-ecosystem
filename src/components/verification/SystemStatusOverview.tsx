
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Clock, Zap, RefreshCw } from 'lucide-react';
import { useSystemStatusCheck } from '@/hooks/useSystemStatusCheck';

const SystemStatusOverview: React.FC = () => {
  const { systemStatus, isChecking, recheckStatus } = useSystemStatusCheck();

  if (isChecking) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Checking System Status...
          </CardTitle>
          <CardDescription>
            Verifying all verification system components and backend automation
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!systemStatus) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-gray-600" />
            System Status Unknown
          </CardTitle>
          <CardDescription>
            Unable to determine system status
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = (isWorking: boolean) => 
    isWorking ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200";

  const getAutomationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-100 text-green-800 border-green-200";
      case 'inactive': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              System Status Overview
            </CardTitle>
            <CardDescription>
              Complete verification system functionality check
            </CardDescription>
          </div>
          <Button onClick={recheckStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recheck
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Components Status */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Core Verification Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg border ${getStatusColor(systemStatus.comprehensiveVerificationActive)}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Comprehensive Verification</span>
              </div>
              <Badge className="text-xs mt-1">
                {systemStatus.comprehensiveVerificationActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className={`p-3 rounded-lg border ${getStatusColor(systemStatus.databaseValidationActive)}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Database Validation</span>
              </div>
              <Badge className="text-xs mt-1">
                {systemStatus.databaseValidationActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className={`p-3 rounded-lg border ${getStatusColor(systemStatus.syncVerificationActive)}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Sync Verification</span>
              </div>
              <Badge className="text-xs mt-1">
                {systemStatus.syncVerificationActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className={`p-3 rounded-lg border ${getAutomationStatusColor(systemStatus.backendAutomationStatus)}`}>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Backend Automation</span>
              </div>
              <Badge className="text-xs mt-1">
                {systemStatus.backendAutomationStatus.toUpperCase()}
              </Badge>
              {systemStatus.lastAutomatedRun && (
                <div className="text-xs text-gray-600 mt-1">
                  Last: {new Date(systemStatus.lastAutomatedRun).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Working Components */}
        {systemStatus.workingComponents.length > 0 && (
          <div>
            <h3 className="font-medium text-green-900 mb-2">✅ Working Components ({systemStatus.workingComponents.length})</h3>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {systemStatus.workingComponents.map((component, index) => (
                  <div key={index} className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    {component}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Issues Found */}
        {systemStatus.issuesFound.length > 0 && (
          <div>
            <h3 className="font-medium text-red-900 mb-2">⚠️ Issues Found ({systemStatus.issuesFound.length})</h3>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="space-y-1">
                {systemStatus.issuesFound.map((issue, index) => (
                  <div key={index} className="text-sm text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">📊 System Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Total Components:</span>
              <div className="text-blue-800 text-lg font-bold">{systemStatus.totalComponentsChecked}</div>
            </div>
            <div>
              <span className="text-green-700 font-medium">Working:</span>
              <div className="text-green-800 text-lg font-bold">{systemStatus.workingComponents.length}</div>
            </div>
            <div>
              <span className="text-red-700 font-medium">Issues:</span>
              <div className="text-red-800 text-lg font-bold">{systemStatus.issuesFound.length}</div>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Automation:</span>
              <div className="text-purple-800 text-lg font-bold">
                {systemStatus.backendAutomationStatus === 'active' ? '✅' : '❌'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusOverview;
