
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { ComprehensiveSecurityPerformanceSummary } from '@/utils/verification/EnhancedSecurityPerformanceOrchestrator';

interface AutomatedFixesBannerProps {
  comprehensiveSummary: ComprehensiveSecurityPerformanceSummary;
  onExecuteAutomatedFixes: () => void;
}

const AutomatedFixesBanner: React.FC<AutomatedFixesBannerProps> = ({
  comprehensiveSummary,
  onExecuteAutomatedFixes
}) => {
  const availableFixes = comprehensiveSummary.automatedFixes.filter(f => f.canAutoFix && f.riskLevel === 'low');

  if (availableFixes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-green-500" />
          Automated Fixes Available
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {availableFixes.length} automated fixes ready
            </p>
            <p className="text-sm text-muted-foreground">
              Low-risk fixes that can be applied automatically
            </p>
          </div>
          <Button onClick={onExecuteAutomatedFixes} className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Apply Automated Fixes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomatedFixesBanner;
