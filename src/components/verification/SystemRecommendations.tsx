
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';

interface SystemRecommendationsProps {
  verificationResult: ComprehensiveVerificationResult;
}

const SystemRecommendations: React.FC<SystemRecommendationsProps> = ({
  verificationResult
}) => {
  if (!verificationResult.recommendations.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-green-600" />
          System Recommendations
        </CardTitle>
        <CardDescription>
          Comprehensive recommendations based on verification results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {verificationResult.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-600 font-medium text-sm">{index + 1}.</span>
              <span className="text-blue-700 text-sm">{recommendation}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemRecommendations;
