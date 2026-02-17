import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface ArizeIntegrationProps {
  nodeId: string;
  nodeType: string;
  testingMode?: 'build' | 'generate' | 'test' | 'deploy' | 'configure';
  onTestResults?: (results: any) => void;
}

export const ArizeIntegration: React.FC<ArizeIntegrationProps> = ({
  nodeId,
  nodeType,
  testingMode = 'test',
  onTestResults,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runArizeTest = async () => {
    setIsRunning(true);
    try {
      // Simulate Arize testing integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = {
        nodeId,
        status: 'passed',
        metrics: {
          latency: Math.random() * 100 + 50,
          accuracy: Math.random() * 0.1 + 0.9,
          throughput: Math.random() * 100 + 200,
        },
        timestamp: new Date().toISOString(),
        mode: testingMode,
      };
      
      setTestResults(mockResults);
      onTestResults?.(mockResults);
      toast.success('Arize test completed successfully');
    } catch (error) {
      toast.error('Arize test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Arize Testing Integration
          <Badge variant="outline" className="text-xs">
            {nodeType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runArizeTest} 
            disabled={isRunning}
            size="sm"
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Running Test...
              </>
            ) : (
              'Run Arize Test'
            )}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.status)}
              <span className="text-sm font-medium">Test Results</span>
              <Badge variant={testResults.status === 'passed' ? 'default' : 'destructive'}>
                {testResults.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-slate-500">Latency</div>
                <div className="font-medium">{testResults.metrics.latency.toFixed(1)}ms</div>
              </div>
              <div>
                <div className="text-slate-500">Accuracy</div>
                <div className="font-medium">{(testResults.metrics.accuracy * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-slate-500">Throughput</div>
                <div className="font-medium">{testResults.metrics.throughput.toFixed(0)}/s</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};