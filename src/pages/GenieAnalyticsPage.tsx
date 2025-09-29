/**
 * GENIE ANALYTICS PAGE
 * Displays detailed analytics for a specific Genie deployment
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { GenieAnalyticsDashboard } from '@/components/genie-analytics/GenieAnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GenieAnalyticsPage: React.FC = () => {
  const { genieId } = useParams<{ genieId: string }>();

  return (
    <AppLayout>
      <div className="space-y-4">
        <Link to="/genie-management">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Genie Management
          </Button>
        </Link>
        <GenieAnalyticsDashboard 
          genieId={genieId} 
          brandConfigId={genieId}
        />
      </div>
    </AppLayout>
  );
};

export default GenieAnalyticsPage;
