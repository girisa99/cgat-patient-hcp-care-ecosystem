
import React from 'react';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, CheckCircle, AlertTriangle, Settings, Wrench } from 'lucide-react';

interface ImplementationTabContentProps {
  syncData: TabSyncData;
}

const ImplementationTabContent: React.FC<ImplementationTabContentProps> = ({
  syncData
}) => {
  // Get detailed implementation status
  const getImplementationDetails = () => {
    return {
      mfaImplemented: localStorage.getItem('mfa_enforcement_implemented') === 'true',
      rbacActive: localStorage.getItem('rbac_implementation_active') === 'true',
      logSanitizationActive: localStorage.getItem('log_sanitization_active') === 'true',
      debugSecurityActive: localStorage.getItem('debug_security_implemented') === 'true',
      apiAuthImplemented: localStorage.getItem('api_authorization_implemented') === 'true',
      uiuxFixed: localStorage.getItem('uiux_improvements_applied') === 'true',
      codeQualityFixed: localStorage.getItem('code_quality_improved') === 'true'
    };
  };

  const implementations = getImplementationDetails();
  const implementationList = [
    { key: 'mfaImplemented', name: 'Multi-Factor Authentication (MFA)', category: 'Security', status: implementations.mfaImplemented },
    { key: 'rbacActive', name: 'Role-Based Access Control (RBAC)', category: 'Security', status: implementations.rbacActive },
    { key: 'logSanitizationActive', name: 'Log Sanitization System', category: 'Security', status: implementations.logSanitizationActive },
    { key: 'debugSecurityActive', name: 'Debug Security Controls', category: 'Security', status: implementations.debugSecurityActive },
    { key: 'apiAuthImplemented', name: 'API Authorization Framework', category: 'Security', status: implementations.apiAuthImplemented },
    { key: 'uiuxFixed', name: 'UI/UX Improvements', category: 'Frontend', status: implementations.uiuxFixed },
    { key: 'codeQualityFixed', name: 'Code Quality Enhancements', category: 'Development', status: implementations.codeQualityFixed }
  ];

  const categories = ['Security', 'Frontend', 'Development'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Implementation Status & Applied Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Total Implementations</div>
              <Badge variant="default" className="mt-2 bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{syncData.realFixesApplied}</div>
              <div className="text-sm text-gray-600">Manual Fixes Applied</div>
              <Badge variant="outline" className="mt-2 border-blue-200 text-blue-700">
                <Wrench className="h-3 w-3 mr-1" />
                User Applied
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{syncData.backendFixedCount}</div>
              <div className="text-sm text-gray-600">Auto-Detected Fixes</div>
              <Badge variant="outline" className="mt-2 border-purple-200 text-purple-700">
                <Settings className="h-3 w-3 mr-1" />
                Backend
              </Badge>
            </div>
          </div>

          {/* Implementation Details by Category */}
          {categories.map(category => {
            const categoryItems = implementationList.filter(item => item.category === category);
            const categoryFixed = categoryItems.filter(item => item.status).length;
            const categoryTotal = categoryItems.length;

            return (
              <Card key={category} className="mb-4 bg-gray-50 border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{category} Implementations</span>
                    <Badge variant={categoryFixed === categoryTotal ? "default" : "destructive"} className={categoryFixed === categoryTotal ? "bg-green-600" : ""}>
                      {categoryFixed}/{categoryTotal}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryItems.map(item => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center gap-3">
                          {item.status ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-medium text-gray-700">{item.name}</span>
                        </div>
                        <Badge variant={item.status ? "default" : "destructive"} className={item.status ? "bg-green-600" : ""}>
                          {item.status ? "Implemented" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Fixed Issues Summary */}
          {syncData.fixedIssues && syncData.fixedIssues.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Recently Fixed Issues ({syncData.fixedIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {syncData.fixedIssues.slice(0, 10).map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{issue.type || issue.message}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {issue.fixMethod || 'Fixed'}
                      </Badge>
                    </div>
                  ))}
                  {syncData.fixedIssues.length > 10 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      ... and {syncData.fixedIssues.length - 10} more fixed issues
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationTabContent;
