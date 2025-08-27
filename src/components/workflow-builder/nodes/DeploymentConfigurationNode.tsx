import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Cloud, Settings, Activity } from 'lucide-react';

interface DeploymentConfigurationNodeProps {
  data: {
    label: string;
    config?: {
      environment_type?: string;
      cloud_provider?: string;
      region?: string;
      scaling_policy?: string;
      health_check_enabled?: boolean;
      auto_rollback?: boolean;
      deployment_strategy?: string;
    };
  };
}

export const DeploymentConfigurationNode: React.FC<DeploymentConfigurationNodeProps> = ({ data }) => {
  const config = data.config || {};

  const environmentColors = {
    development: 'bg-blue-500/10 text-blue-600',
    testing: 'bg-yellow-500/10 text-yellow-600',
    staging: 'bg-orange-500/10 text-orange-600',
    production: 'bg-red-500/10 text-red-600',
    default: 'bg-gray-500/10 text-gray-600'
  };

  const providerColors = {
    supabase: 'bg-green-500/10 text-green-600',
    aws: 'bg-orange-500/10 text-orange-600',
    gcp: 'bg-blue-500/10 text-blue-600',
    azure: 'bg-purple-500/10 text-purple-600',
    default: 'bg-gray-500/10 text-gray-600'
  };

  const environment = config.environment_type || 'development';
  const provider = config.cloud_provider || 'supabase';
  
  const envColorClass = environmentColors[environment as keyof typeof environmentColors] || environmentColors.default;
  const providerColorClass = providerColors[provider as keyof typeof providerColors] || providerColors.default;

  return (
    <div className="min-w-[300px]">
      <Handle type="target" position={Position.Top} />
      
      <Card className="border-2 border-orange-500/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Rocket className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                Deployment
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Environment:</span>
              <Badge className={`text-xs mt-1 ${envColorClass}`}>
                {environment.charAt(0).toUpperCase() + environment.slice(1)}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Provider:</span>
              <Badge className={`text-xs mt-1 ${providerColorClass}`}>
                {provider.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Region:</span>
              <div className="font-medium">{config.region || 'us-east-1'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Strategy:</span>
              <div className="font-medium">{config.deployment_strategy || 'rolling'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Scaling:</span>
              <div className="font-medium">{config.scaling_policy || 'auto'}</div>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {config.health_check_enabled !== false ? 'Health Check' : 'No Health Check'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Cloud className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cloud Native</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {config.auto_rollback !== false ? 'Auto Rollback' : 'Manual Rollback'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

