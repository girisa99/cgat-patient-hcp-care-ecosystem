
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { ImplementationProgressStats } from './types/implementationTypes';

interface ImplementationProgressCardProps {
  stats: ImplementationProgressStats;
}

const ImplementationProgressCard: React.FC<ImplementationProgressCardProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Implementation Progress
        </CardTitle>
        <CardDescription>
          Track your progress implementing verification recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{stats.progressPercentage}% Complete</span>
          </div>
          <Progress value={stats.progressPercentage} className="w-full" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.criticalCount}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.highPriorityCount}</div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImplementationProgressCard;
