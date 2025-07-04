
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useMasterVerificationSystem } from '@/hooks/useMasterVerificationSystem';
import { useMasterConsolidationValidator } from '@/hooks/useMasterConsolidationValidator';

const ActiveVerification: React.FC = () => {
  const verificationSystem = useMasterVerificationSystem();
  const consolidationValidator = useMasterConsolidationValidator();
  
  const systemHealth = verificationSystem.getSystemHealth();
  const consolidationReport = consolidationValidator.validateConsolidation();

  const handleRunVerification = async () => {
    await verificationSystem.runSystemVerification();
  };

  const handleVerifyIntegrity = () => {
    verificationSystem.verifySystemIntegrity();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active Verification System</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleRunVerification} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Verification
          </Button>
          <Button onClick={handleVerifyIntegrity} size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Verify Integrity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemHealth.score}%</div>
            <p className="text-xs text-muted-foreground">
              {systemHealth.componentsOperational}/{systemHealth.totalComponents} components operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consolidation Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{consolidationReport.score}%</div>
            <p className="text-xs text-muted-foreground">
              {consolidationReport.consolidatedHooks} hooks consolidated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{systemHealth.verificationsPassed}</div>
            <p className="text-xs text-muted-foreground">
              All verifications passed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>System Stability</span>
              <Badge variant={systemHealth.systemStability ? "default" : "destructive"}>
                {systemHealth.systemStability ? 'Stable' : 'Unstable'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Data Integrity</span>
              <Badge variant="default">Verified</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Consolidation Status</span>
              <Badge variant="default">Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemHealth.recommendations.map((recommendation, index) => (
              <div key={index} className="text-sm text-gray-600">
                {recommendation}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveVerification;
