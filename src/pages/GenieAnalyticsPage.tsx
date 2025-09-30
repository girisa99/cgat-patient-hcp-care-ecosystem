/**
 * GENIE ANALYTICS PAGE
 * Displays detailed analytics for a specific Genie deployment
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { GenieAnalyticsDashboard } from '@/components/genie-analytics/GenieAnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageLoading } from '@/components/ui/LoadingStates';

export const GenieAnalyticsPage: React.FC = () => {
  const { genieId } = useParams<{ genieId: string }>();
  const [instanceData, setInstanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstanceData = async () => {
      if (!genieId) return;
      
      const { data, error } = await supabase
        .from('genie_brand_configs')
        .select('*')
        .eq('id', genieId)
        .maybeSingle();

      if (!error && data) {
        setInstanceData(data);
      }
      setIsLoading(false);
    };

    fetchInstanceData();
  }, [genieId]);

  if (isLoading) {
    return <PageLoading message="Loading analytics..." />;
  }

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
          deploymentType={instanceData?.deployment_type}
          instanceName={instanceData?.brand_name || 'Genie Instance'}
        />
      </div>
    </AppLayout>
  );
};

export default GenieAnalyticsPage;
