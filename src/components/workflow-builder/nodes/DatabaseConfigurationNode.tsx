import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Table, Key, Shield } from 'lucide-react';

interface DatabaseConfigurationNodeProps {
  data: {
    label: string;
    config?: {
      database_type?: string;
      connection_pool_size?: number;
      timeout_seconds?: number;
      ssl_enabled?: boolean;
      read_replicas?: number;
      backup_enabled?: boolean;
      encryption_at_rest?: boolean;
    };
  };
}

export const DatabaseConfigurationNode: React.FC<DatabaseConfigurationNodeProps> = ({ data }) => {
  const config = data.config || {};

  const dbTypeColors = {
    postgresql: 'bg-blue-500/10 text-blue-600',
    mysql: 'bg-orange-500/10 text-orange-600',
    mongodb: 'bg-green-500/10 text-green-600',
    supabase: 'bg-emerald-500/10 text-emerald-600',
    default: 'bg-gray-500/10 text-gray-600'
  };

  const dbType = config.database_type || 'supabase';
  const colorClass = dbTypeColors[dbType as keyof typeof dbTypeColors] || dbTypeColors.default;

  return (
    <div className="min-w-[280px]">
      <Handle type="target" position={Position.Top} />
      
      <Card className="border-2 border-emerald-500/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Database className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                Database
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Database Type:</span>
            <Badge className={`text-xs ${colorClass}`}>
              {dbType.charAt(0).toUpperCase() + dbType.slice(1)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Pool Size:</span>
              <div className="font-medium">{config.connection_pool_size || 10}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Timeout:</span>
              <div className="font-medium">{config.timeout_seconds || 30}s</div>
            </div>
            <div>
              <span className="text-muted-foreground">Replicas:</span>
              <div className="font-medium">{config.read_replicas || 0}</div>
            </div>
            <div className="flex items-center gap-1">
              <Table className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Structured</span>
            </div>
          </div>
          
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">SSL:</span>
              </div>
              <Badge variant={config.ssl_enabled !== false ? "default" : "secondary"} className="text-xs">
                {config.ssl_enabled !== false ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Key className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Encryption:</span>
              </div>
              <Badge variant={config.encryption_at_rest !== false ? "default" : "secondary"} className="text-xs">
                {config.encryption_at_rest !== false ? 'At Rest' : 'None'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

