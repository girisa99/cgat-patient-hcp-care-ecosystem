
import React from 'react';
import { FixedIssue } from '@/hooks/useFixedIssuesTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Shield, RefreshCw } from 'lucide-react';
import FixedIssuesTracker from '@/components/security/FixedIssuesTracker';

interface FixedTabContentProps {
  fixedIssues: FixedIssue[];
  totalFixesApplied: number;
  backendFixedCount?: number;
  realFixesApplied?: number;
}

const FixedTabContent: React.FC<FixedTabContentProps> = ({
  fixedIssues,
  totalFixesApplied,
  backendFixedCount = 0,
  realFixesApplied = 0
}) => {
  return (
    <div className="space-y-6">
      {/* Synchronized Fix Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="h-5 w-5" />
            Comprehensive Fix Tracking (Synchronized)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl font-bold text-green-600">{totalFixesApplied}</div>
              <div className="text-sm text-gray-600 mt-1">Total Fixes Applied</div>
              <Badge variant="outline" className="mt-2 text-xs">All Types</Badge>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{realFixesApplied}</div>
              <div className="text-sm text-gray-600 mt-1">Manual Real Fixes</div>
              <Badge variant="outline" className="mt-2 text-xs bg-purple-50">User Applied</Badge>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{backendFixedCount}</div>
              <div className="text-sm text-gray-600 mt-1">Auto-Detected Fixes</div>
              <Badge variant="outline" className="mt-2 text-xs bg-blue-50">Backend</Badge>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl font-bold text-orange-600">{fixedIssues.length}</div>
              <div className="text-sm text-gray-600 mt-1">Tracked Issues</div>
              <Badge variant="outline" className="mt-2 text-xs bg-orange-50">In Tracker</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fix Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fix Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            <div className="text-center p-2 bg-gray-50 rounded border">
              <div className="text-lg font-bold text-green-600">
                {localStorage.getItem('mfa_enforcement_implemented') === 'true' ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-700">MFA Security</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded border">
              <div className="text-lg font-bold text-green-600">
                {localStorage.getItem('rbac_implementation_active') === 'true' ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-700">RBAC Access</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded border">
              <div className="text-lg font-bold text-green-600">
                {localStorage.getItem('log_sanitization_active') === 'true' ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-700">Log Security</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded border">
              <div className="text-lg font-bold text-green-600">
                {localStorage.getItem('debug_security_implemented') === 'true' ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-700">Debug Security</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded border">
              <div className="text-lg font-bold text-green-600">
                {localStorage.getItem('api_authorization_implemented') === 'true' ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-700">API Auth</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded border">
              <div className="text-lg font-bold text-green-600">
                {localStorage.getItem('uiux_improvements_applied') === 'true' ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-700">UI/UX</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded border">
              <div className="text-lg font-bold text-green-600">
                {localStorage.getItem('code_quality_improved') === 'true' ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-700">Code Quality</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Synchronized Fix Tracking Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <RefreshCw className="h-4 w-4" />
            Real-time Synchronization Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            This tab automatically synchronizes with backend changes and manual fixes. 
            Counts update in real-time across all tabs without requiring page refresh.
          </p>
        </CardContent>
      </Card>

      {/* Main Fixed Issues Tracker */}
      <FixedIssuesTracker 
        fixedIssues={fixedIssues} 
        totalFixesApplied={totalFixesApplied}
      />
    </div>
  );
};

export default FixedTabContent;
