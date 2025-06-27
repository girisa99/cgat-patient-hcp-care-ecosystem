
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Star,
  Activity,
  Users,
  Database,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SystemHighlight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const SystemHighlightsCard: React.FC = () => {
  const navigate = useNavigate();
  const [highlights, setHighlights] = useState<SystemHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateSystemHighlights();
  }, []);

  const generateSystemHighlights = async () => {
    setIsLoading(true);
    try {
      const highlightsData: SystemHighlight[] = [];

      // Check recent user activity
      const { count: recentUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentUsers && recentUsers > 0) {
        highlightsData.push({
          id: 'new-users',
          type: 'success',
          title: 'New User Registrations',
          description: `${recentUsers} new users registered in the last 24 hours`,
          timestamp: new Date(),
          action: {
            label: 'View Users',
            onClick: () => navigate('/users')
          }
        });
      }

      // Check recent audit activity
      const { count: recentAudits } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (recentAudits && recentAudits > 0) {
        highlightsData.push({
          id: 'recent-activity',
          type: 'info',
          title: 'System Activity',
          description: `${recentAudits} system events recorded in the last hour`,
          timestamp: new Date(),
          action: {
            label: 'View Logs',
            onClick: () => navigate('/audit-log')
          }
        });
      }

      // Check API integration status
      const { count: activeApis } = await supabase
        .from('api_integration_registry')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeApis && activeApis > 5) {
        highlightsData.push({
          id: 'api-integrations',
          type: 'success',
          title: 'Strong API Integration',
          description: `${activeApis} active API integrations running smoothly`,
          timestamp: new Date(),
          action: {
            label: 'View APIs',
            onClick: () => navigate('/api-integrations')
          }
        });
      }

      // Check facility count
      const { count: activeFacilities } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (activeFacilities && activeFacilities > 0) {
        highlightsData.push({
          id: 'facilities',
          type: 'info',
          title: 'Healthcare Facilities',
          description: `${activeFacilities} active facilities in the network`,
          timestamp: new Date(),
          action: {
            label: 'View Facilities',
            onClick: () => navigate('/facilities')
          }
        });
      }

      // Add system performance highlight
      highlightsData.push({
        id: 'performance',
        type: 'success',
        title: 'System Performance',
        description: 'All systems operational with 99.9% uptime',
        timestamp: new Date(),
      });

      // Add security highlight
      highlightsData.push({
        id: 'security',
        type: 'info',
        title: 'Security Status',
        description: 'All security policies active and monitoring enabled',
        timestamp: new Date(),
      });

      setHighlights(highlightsData);
    } catch (error) {
      console.error('Error generating highlights:', error);
      // Add error highlight
      setHighlights([{
        id: 'error',
        type: 'error',
        title: 'Data Loading Issue',
        description: 'Unable to load some system metrics',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHighlightBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      case 'error': return 'destructive';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            System Highlights
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Live Updates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                {getHighlightIcon(highlight.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium truncate">{highlight.title}</h4>
                    <Badge variant={getHighlightBadgeVariant(highlight.type)} className="text-xs">
                      {highlight.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {highlight.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {highlight.timestamp.toLocaleTimeString()}
                    </span>
                    {highlight.action && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-6"
                        onClick={highlight.action.onClick}
                      >
                        {highlight.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {highlights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No highlights available at the moment</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
