
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Activity, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ComprehensiveSingleSourceAssessment, 
  SingleSourceAssessmentResult 
} from '@/utils/assessment/ComprehensiveSingleSourceAssessment';
import { SingleSourceAssessmentReport } from './SingleSourceAssessmentReport';

export const SingleSourceAssessmentDashboard: React.FC = () => {
  const [assessmentResult, setAssessmentResult] = useState<SingleSourceAssessmentResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runAssessment = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      console.log('🚀 Starting comprehensive single source assessment...');
      
      const result = await ComprehensiveSingleSourceAssessment.runCompleteAssessment();
      
      setAssessmentResult(result);
      
      toast({
        title: "✅ Assessment Complete",
        description: `System scored ${result.overallScore}/100 - ${result.systemStatus}`,
      });
      
      console.log('✅ Assessment completed successfully:', {
        score: result.overallScore,
        status: result.systemStatus,
        compliantSystems: result.assessmentSummary.compliantSystems,
        totalSystems: result.assessmentSummary.totalSystems
      });
      
    } catch (err) {
      console.error('❌ Assessment failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Assessment failed';
      setError(errorMessage);
      
      toast({
        title: "❌ Assessment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run assessment on component mount
  useEffect(() => {
    runAssessment();
  }, []);

  if (isRunning) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Running Comprehensive Assessment</h3>
          <p className="text-muted-foreground">
            Analyzing all systems for single source compliance...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Assessment failed: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={runAssessment} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Assessment
        </Button>
      </div>
    );
  }

  if (!assessmentResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Single Source Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Ready to run comprehensive single source assessment
            </p>
            <Button onClick={runAssessment}>
              <Activity className="h-4 w-4 mr-2" />
              Run Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Single Source Assessment Results</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of system consolidation and data integrity
          </p>
        </div>
        <Button onClick={runAssessment} disabled={isRunning}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          Refresh Assessment
        </Button>
      </div>

      <SingleSourceAssessmentReport assessmentResult={assessmentResult} />
    </div>
  );
};
