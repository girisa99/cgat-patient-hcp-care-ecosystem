/**
 * GENIE INSTANCE CARD
 * Displays detailed information about a single Genie instance
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  Shield, 
  Globe, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { GenieInstance } from '@/hooks/useGenieManagement';
import { Progress } from '@/components/ui/progress';

interface GenieInstanceCardProps {
  instance: GenieInstance;
  onViewDetails: (instance: GenieInstance) => void;
  onViewAnalytics?: (instance: GenieInstance) => void;
}

export const GenieInstanceCard: React.FC<GenieInstanceCardProps> = ({
  instance,
  onViewDetails,
  onViewAnalytics
}) => {
  const dailyUsagePercent = (instance.rate_limit_info.daily_usage / instance.daily_limit) * 100;
  const hourlyUsagePercent = (instance.rate_limit_info.hourly_usage / instance.hourly_limit) * 100;
  
  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-destructive';
    if (percent >= 75) return 'text-warning';
    return 'text-success';
  };

  const getDeploymentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      public: 'bg-blue-500',
      internal: 'bg-green-500',
      mcp: 'bg-purple-500',
      embedded: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <Card className="hover:shadow-lg transition-all border-l-4" style={{
      borderLeftColor: instance.is_active ? '#22c55e' : '#94a3b8'
    }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{instance.brand_name}</CardTitle>
              {onViewAnalytics && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onViewAnalytics(instance)}
                  title="View Analytics"
                >
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </Button>
              )}
            </div>
            {instance.product_name && (
              <p className="text-sm text-muted-foreground mt-1">{instance.product_name}</p>
            )}
            {instance.business_name && (
              <p className="text-xs text-muted-foreground">{instance.business_name}</p>
            )}
          </div>
          <Badge 
            variant={instance.is_active ? 'default' : 'secondary'}
            className={getDeploymentTypeBadge(instance.deployment_type)}
          >
            {instance.deployment_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Domain & Verification Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{instance.domain_name || 'No domain'}</span>
          </div>
          {instance.domain_verified ? (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>

        {/* Conversations & Users */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Conversations</span>
            </div>
            <p className="text-2xl font-bold">{instance.total_conversations}</p>
            <p className="text-xs text-muted-foreground">
              {instance.active_conversations} active
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Visitors</span>
            </div>
            <p className="text-2xl font-bold">{instance.ip_tracking.unique_ips}</p>
            <p className="text-xs text-muted-foreground">
              {instance.ip_tracking.blocked_ips} blocked
            </p>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Daily Usage</span>
              <span className={getUsageColor(dailyUsagePercent)}>
                {instance.rate_limit_info.daily_usage} / {instance.daily_limit}
              </span>
            </div>
            <Progress value={dailyUsagePercent} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hourly Usage</span>
              <span className={getUsageColor(hourlyUsagePercent)}>
                {instance.rate_limit_info.hourly_usage} / {instance.hourly_limit}
              </span>
            </div>
            <Progress value={hourlyUsagePercent} className="h-2" />
          </div>
        </div>

        {/* Deployment Options */}
        {instance.deployment_options.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {instance.deployment_options.map((option) => (
              <Badge key={option} variant="outline" className="text-xs">
                {option}
              </Badge>
            ))}
          </div>
        )}

        {/* Subscription Type */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant="secondary">{instance.subscription_type}</Badge>
          <div className="flex gap-2">
            {onViewAnalytics && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onViewAnalytics(instance)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Analytics
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(instance)}
            >
              Details
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        {instance.contact_person && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Contact: {instance.contact_person}
            {instance.contact_email && ` (${instance.contact_email})`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};