
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface OnboardingStatsProps {
  applications: any[];
}

export const OnboardingStats: React.FC<OnboardingStatsProps> = ({ applications }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          <div className="text-2xl font-bold">{applications?.length || 0}</div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          <div className="text-2xl font-bold">
            {applications?.filter(app => app.status === 'draft').length || 0}
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
          <div className="text-2xl font-bold">
            {applications?.filter(app => app.status === 'under_review').length || 0}
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          <div className="text-2xl font-bold">
            {applications?.filter(app => app.status === 'approved').length || 0}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
