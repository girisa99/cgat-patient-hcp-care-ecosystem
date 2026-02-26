/**
 * GENIE ANALYTICS PAGE
 * Tiered analytics view for subscribers
 * - Business: Basic metrics
 * - Enterprise: Full analytics
 * Internal admins should use /genie-hub?tab=enterprise-analytics
 */
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { TieredAnalyticsDashboard, type AnalyticsAccessLevel } from '@/components/analytics/TieredAnalyticsDashboard';
import { GenieAnalyticsDashboard } from '@/components/genie-analytics/GenieAnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageLoading } from '@/components/ui/LoadingStates';

export const GenieAnalyticsPage: React.FC = () => {
  const { genieId } = useParams<{ genieId: string }>();
  const [searchParams] = useSearchParams();
  const [instanceData, setInstanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState<AnalyticsAccessLevel>('business');

  // Determine access level from user's subscription tier
  useEffect(() => {
    const checkAccessLevel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check for internal admin or enterprise tier
        const { data: genieUser } = await supabase
          .from('genie_studio_users')
          .select('is_internal, current_subscription_tier')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        
        if (genieUser?.is_internal) {
          setAccessLevel('internal');
        } else if (genieUser?.current_subscription_tier === 'enterprise') {
          setAccessLevel('enterprise');
        } else if (genieUser?.current_subscription_tier === 'business') {
          setAccessLevel('business');
        }
      }
    };
    checkAccessLevel();
  }, []);

  useEffect(() => {
    const fetchInstanceData = async () => {
      if (!genieId) {
        setIsLoading(false);
        return;
      }
      
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

  // If viewing a specific Genie instance, show instance analytics
  if (genieId && instanceData) {
    return (
      <GenieStudioLayout variant="topbar">
        <div className="space-y-4">
          <Link to="/genie-hub">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <GenieAnalyticsDashboard 
            genieId={genieId} 
            brandConfigId={genieId}
            deploymentType={instanceData?.deployment_type}
            instanceName={instanceData?.brand_name || 'Genie Instance'}
          />
        </div>
      </GenieStudioLayout>
    );
  }

  // Otherwise show tiered analytics dashboard
  return (
    <GenieStudioLayout variant="topbar">
      <div className="p-6">
        <TieredAnalyticsDashboard accessLevel={accessLevel} />
      </div>
    </GenieStudioLayout>
  );
};

export default GenieAnalyticsPage;
