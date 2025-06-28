
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { Issue } from '@/types/issuesTypes';

interface SecurityTabProps {
  metrics: UnifiedMetrics;
  issues: Issue[];
  onUpdate: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ metrics, issues, onUpdate }) => {
  const securityFixes = [
    { name: 'Multi-Factor Authentication', key: 'mfa_enforcement_implemented', implemented: localStorage.getItem('mfa_enforcement_implemented') === 'true' },
    { name: 'Role-Based Access Control', key: 'rbac_implementation_active', implemented: localStorage.getItem('rbac_implementation_active') === 'true' },
    { name: 'Log Sanitization', key: 'log_sanitization_active', implemented: localStorage.getItem('log_sanitization_active') === 'true' },
    { name: 'Debug Security', key: 'debug_security_implemented', implemented: localStorage.getItem('debug_security_implemented') === 'true' },
    { name: 'API Authorization', key: 'api_authorization_implemented', implemented: localStorage.getItem('api_authorization_implemented') === 'true' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          Security Issues & Fixes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Security Issues */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Active Security Issues ({metrics.securityActive})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{issue.type}</span>
                      <Badge variant="destructive" className="text-xs">{issue.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">{issue.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {issue.source}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">No Active Security Issues</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Fixes Status */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Security Fixes Applied ({metrics.securityFixed}/5)
            </h4>
            <div className="space-y-2">
              {securityFixes.map((fix) => (
                <div key={fix.key} className={`p-3 rounded border ${
                  fix.implemented ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{fix.name}</span>
                    <Badge variant={fix.implemented ? "default" : "outline"} 
                           className={fix.implemented ? "bg-green-600" : ""}>
                      {fix.implemented ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Implemented
                        </>
                      ) : (
                        'Pending'
                      )}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 p-3 bg-blue-50 rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Security Implementation Progress</span>
                <span className="text-sm text-gray-600">{Math.round((metrics.securityFixed / 5) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(metrics.securityFixed / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityTab;
