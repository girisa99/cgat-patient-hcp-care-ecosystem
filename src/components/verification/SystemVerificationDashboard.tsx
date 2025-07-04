
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  Database,
  Code,
  Zap
} from 'lucide-react';
import { useMasterVerificationSystem } from '@/hooks/useMasterVerificationSystem';
import { useTypeScriptAlignment } from '@/hooks/useTypeScriptAlignment';

export const SystemVerificationDashboard: React.FC = () => {
  const verificationSystem = useMasterVerificationSystem();
  const typeAlignment = useTypeScriptAlignment();
  
  const systemHealth = verificationSystem.getSystemHealth();
  const validationSummary = verificationSystem.getValidationSummary();
  const registryStats = verificationSystem.getRegistryStats();
  const alignmentReport = typeAlignment.analyzeTypeAlignment();

  if (verificationSystem.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">{systemHealth.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Code className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">TypeScript Alignment</p>
                <p className="text-2xl font-bold">{alignmentReport.hookConsistency.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Single Source</p>
                <p className="text-2xl font-bold">{alignmentReport.singleSourceCompliance.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Consolidation Rate</p>
                <p className="text-2xl font-bold">{registryStats.consolidationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Hook Consolidation</span>
                <Badge variant={alignmentReport.hookConsistency.score === 100 ? "default" : "secondary"}>
                  {alignmentReport.hookConsistency.score}%
                </Badge>
              </div>
              <Progress value={alignmentReport.hookConsistency.score} />
              
              <div className="flex items-center justify-between">
                <span>Single Source Compliance</span>
                <Badge variant={alignmentReport.singleSourceCompliance.score === 100 ? "default" : "secondary"}>
                  {alignmentReport.singleSourceCompliance.score}%
                </Badge>
              </div>
              <Progress value={alignmentReport.singleSourceCompliance.score} />
              
              <div className="flex items-center justify-between">
                <span>Interface Alignment</span>
                <Badge variant={alignmentReport.interfaceAlignment.score >= 90 ? "default" : "secondary"}>
                  {alignmentReport.interfaceAlignment.score}%
                </Badge>
              </div>
              <Progress value={alignmentReport.interfaceAlignment.score} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Registry Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Entries</span>
                <span className="font-bold">{registryStats.totalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Entries</span>
                <span className="font-bold text-green-600">{registryStats.activeEntries}</span>
              </div>
              <div className="flex justify-between">
                <span>Consolidated Hooks</span>
                <span className="font-bold text-blue-600">{registryStats.consolidatedHooks}</span>
              </div>
              <div className="flex justify-between">
                <span>Consolidation Rate</span>
                <span className="font-bold">{registryStats.consolidationRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={() => verificationSystem.verifySystem('full_system_check')}
              disabled={verificationSystem.isVerifying}
            >
              {verificationSystem.isVerifying ? 'Verifying...' : 'Run Full Verification'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => verificationSystem.runValidation('typescript_alignment')}
              disabled={verificationSystem.isValidating}
            >
              {verificationSystem.isValidating ? 'Validating...' : 'Validate TypeScript'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const learnings = verificationSystem.learnFromSystem();
                console.log('System Learnings:', learnings);
              }}
            >
              Analyze System Patterns
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {alignmentReport.hookConsistency.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {typeAlignment.generateTypeScriptRecommendations().map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
