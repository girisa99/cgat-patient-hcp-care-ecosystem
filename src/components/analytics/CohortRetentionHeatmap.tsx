/**
 * Cohort Retention Heatmap Component
 * P4 Analytics Suite - Retention visualization
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { useCohortAnalysis, AnalyticsRegion, REGIONAL_DISPLAY_NAMES } from '@/hooks/useAdvancedAnalytics';

interface CohortRetentionHeatmapProps {
  region?: AnalyticsRegion;
  weeks?: number;
}

export const CohortRetentionHeatmap: React.FC<CohortRetentionHeatmapProps> = ({
  region,
  weeks = 12
}) => {
  const [cohortType, setCohortType] = React.useState<'signup_week' | 'signup_month'>('signup_week');
  
  const { 
    cohorts, 
    cohortsLoading, 
    retentionMatrix, 
    retentionMatrixLoading 
  } = useCohortAnalysis(cohortType, region);

  // Generate mock data for visualization
  const generateMockMatrix = (): number[][] => {
    return Array(weeks).fill(null).map((_, i) => 
      Array(weeks).fill(null).map((_, j) => {
        if (j > i) return 0;
        // Simulate retention decay
        const baseRetention = 100 - (j * 8);
        const variance = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, baseRetention + variance));
      })
    );
  };

  const matrix = retentionMatrix || generateMockMatrix();

  // Color scale for retention
  const getRetentionColor = (value: number): string => {
    if (value === 0) return 'bg-muted';
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-green-400';
    if (value >= 40) return 'bg-yellow-400';
    if (value >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getRetentionTextColor = (value: number): string => {
    if (value === 0) return 'text-muted-foreground';
    if (value >= 40) return 'text-white';
    return 'text-gray-900';
  };

  if (cohortsLoading || retentionMatrixLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>
            {region ? `${REGIONAL_DISPLAY_NAMES[region]} market` : 'Global'} user retention by cohort
          </CardDescription>
        </div>
        <Select value={cohortType} onValueChange={(v) => setCohortType(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="signup_week">Weekly</SelectItem>
            <SelectItem value="signup_month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="text-muted-foreground">Retention:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-400 rounded" />
            <span>&lt;20%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-400 rounded" />
            <span>20-40%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded" />
            <span>40-60%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-400 rounded" />
            <span>60-80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>&gt;80%</span>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-1 text-left font-medium text-muted-foreground">Cohort</th>
                {Array(Math.min(weeks, 8)).fill(null).map((_, i) => (
                  <th key={i} className="p-1 text-center font-medium text-muted-foreground">
                    W{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.slice(0, Math.min(weeks, 8)).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-1 font-medium text-muted-foreground whitespace-nowrap">
                    Cohort {rowIndex + 1}
                  </td>
                  {row.slice(0, Math.min(weeks, 8)).map((value, colIndex) => (
                    <td key={colIndex} className="p-1">
                      <div
                        className={`
                          w-10 h-8 flex items-center justify-center rounded text-xs font-medium
                          ${getRetentionColor(value)} ${getRetentionTextColor(value)}
                          ${colIndex > rowIndex ? 'invisible' : ''}
                        `}
                      >
                        {colIndex <= rowIndex ? `${Math.round(value)}%` : ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Week 1 Retention</p>
            <p className="text-lg font-bold">
              {matrix[0] && matrix[0][0] ? `${Math.round(matrix[0][0])}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Week 4 Retention</p>
            <p className="text-lg font-bold">
              {matrix[0] && matrix[0][3] ? `${Math.round(matrix[0][3])}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Week 8 Retention</p>
            <p className="text-lg font-bold">
              {matrix[0] && matrix[0][7] ? `${Math.round(matrix[0][7])}%` : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortRetentionHeatmap;
