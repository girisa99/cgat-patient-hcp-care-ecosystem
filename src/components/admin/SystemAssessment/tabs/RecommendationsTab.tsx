
/**
 * Recommendations Tab Component
 * Displays actionable recommendations organized by priority
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationsTabProps {
  actionableRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  actionableRecommendations
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Immediate Actions</CardTitle>
          <CardDescription>High priority - implement now</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {actionableRecommendations.immediate.map((action, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                {action}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">Short-term Actions</CardTitle>
          <CardDescription>Medium priority - plan for next sprint</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {actionableRecommendations.shortTerm.map((action, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                {action}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Long-term Actions</CardTitle>
          <CardDescription>Low priority - future roadmap</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {actionableRecommendations.longTerm.map((action, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {action}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
