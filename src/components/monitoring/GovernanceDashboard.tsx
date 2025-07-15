/**
 * GOVERNANCE DASHBOARD
 * Real-time visualization of prompt governance and compliance monitoring
 * Integrates with PromptGovernanceInterceptor and FrameworkComplianceMonitor
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Eye,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useComplianceMonitoring } from '@/hooks/useComplianceMonitoring';

interface PromptViolation {
  type: string;
  severity: string;
  check: string;
  pattern: string;
  recommendation: string;
}

export const GovernanceDashboard: React.FC = () => {
  const {
    isMonitoring,
    complianceScore,
    violations,
    promptStats,
    startMonitoring,
    stopMonitoring,
    getPromptHistory,
    interceptPrompt
  } = useComplianceMonitoring();

  const [promptHistory, setPromptHistory] = useState<any[]>([]);
  const [selectedViolation, setSelectedViolation] = useState<PromptViolation | null>(null);
  const [testPrompt, setTestPrompt] = useState('');

  useEffect(() => {
    const history = getPromptHistory();
    setPromptHistory(history);
  }, [getPromptHistory]);

  const handleTestPrompt = async () => {
    if (!testPrompt.trim()) return;
    
    const result = await interceptPrompt({
      content: testPrompt,
      timestamp: new Date()
    });
    
    console.log('Prompt Interception Result:', result);
    
    // Refresh history
    const history = getPromptHistory();
    setPromptHistory(history);
    setTestPrompt('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'hsl(var(--success))';
    if (score >= 70) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Governance Dashboard</h1>
          <p className="text-muted-foreground">Monitor prompt compliance and framework violations</p>
        </div>
        <div className="flex gap-2">
          {isMonitoring ? (
            <Button onClick={stopMonitoring} variant="destructive">
              <Shield className="w-4 h-4 mr-2" />
              Stop Monitoring
            </Button>
          ) : (
            <Button onClick={startMonitoring}>
              <Shield className="w-4 h-4 mr-2" />
              Start Monitoring
            </Button>
          )}
          <Button variant="outline" onClick={() => setPromptHistory(getPromptHistory())}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getComplianceColor(complianceScore) }}>
              {complianceScore}%
            </div>
            <Progress 
              value={complianceScore} 
              className="mt-2"
              style={{ '--progress-foreground': getComplianceColor(complianceScore) } as any}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{violations.length}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring: {isMonitoring ? 'Active' : 'Inactive'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompts Analyzed</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promptStats.totalPrompts}</div>
            <p className="text-xs text-muted-foreground">
              {promptStats.violationsFound} with violations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {promptStats.averageComplianceScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all prompts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Prompt Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Prompt Governance</CardTitle>
          <CardDescription>
            Test how the governance interceptor analyzes and enhances prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Prompt</label>
            <textarea
              className="w-full p-3 border rounded-md resize-none"
              rows={4}
              placeholder="Enter a prompt to test governance rules..."
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
            />
          </div>
          <Button onClick={handleTestPrompt} disabled={!testPrompt.trim()}>
            Test Prompt
          </Button>
        </CardContent>
      </Card>

      {/* Prompt History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Prompt Analysis</CardTitle>
          <CardDescription>
            History of analyzed prompts and their compliance results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promptHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No prompts analyzed yet. Start monitoring to see results.
              </p>
            ) : (
              promptHistory.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <Badge variant={entry.analysis.complianceScore >= 90 ? 'default' : 'destructive'}>
                      Score: {entry.analysis.complianceScore}%
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {entry.prompt.content?.substring(0, 150) || entry.prompt.message?.substring(0, 150)}...
                  </div>
                  
                  {entry.analysis.violations.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">Violations:</p>
                      {entry.analysis.violations.map((violation: PromptViolation, vIndex: number) => (
                        <Badge 
                          key={vIndex} 
                          variant={getSeverityColor(violation.severity)}
                          className="mr-2 cursor-pointer"
                          onClick={() => setSelectedViolation(violation)}
                        >
                          {violation.type}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {entry.analysis.enhancements.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-primary">Enhancements:</p>
                      <div className="text-xs text-muted-foreground">
                        {entry.analysis.enhancements.slice(0, 2).map((enhancement: string, eIndex: number) => (
                          <div key={eIndex}>• {enhancement}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Violations */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Active Compliance Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {violations.slice(-10).map((violation: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{violation.type}</p>
                    <p className="text-sm text-muted-foreground">{violation.message}</p>
                  </div>
                  <Badge variant={getSeverityColor(violation.severity)}>
                    {violation.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Violation Detail Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Violation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">Type:</p>
                <p className="text-sm text-muted-foreground">{selectedViolation.type}</p>
              </div>
              <div>
                <p className="font-medium">Severity:</p>
                <Badge variant={getSeverityColor(selectedViolation.severity)}>
                  {selectedViolation.severity}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Check:</p>
                <p className="text-sm text-muted-foreground">{selectedViolation.check}</p>
              </div>
              <div>
                <p className="font-medium">Recommendation:</p>
                <p className="text-sm text-muted-foreground">{selectedViolation.recommendation}</p>
              </div>
              <Button 
                onClick={() => setSelectedViolation(null)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GovernanceDashboard;