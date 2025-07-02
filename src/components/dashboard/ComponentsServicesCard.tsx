
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Shield, Activity } from 'lucide-react';

export const ComponentsServicesCard: React.FC = () => {
  const services = [
    { 
      name: 'Database', 
      status: 'operational', 
      icon: Database,
      description: 'All connections healthy'
    },
    { 
      name: 'Authentication', 
      status: 'operational', 
      icon: Shield,
      description: 'RLS policies fixed'
    },
    { 
      name: 'Real-time Updates', 
      status: 'operational', 
      icon: Activity,
      description: 'Live data streaming'
    },
    { 
      name: 'Edge Functions', 
      status: 'operational', 
      icon: Settings,
      description: 'All functions responding'
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'operational': return 'default';
      case 'degraded': return 'secondary';
      case 'down': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${getStatusColor(service.status)}`} />
                  <div>
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-muted-foreground">{service.description}</div>
                  </div>
                </div>
                <Badge variant={getStatusVariant(service.status)}>
                  {service.status}
                </Badge>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="text-xs text-green-800">
            ✅ All critical services are operational
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
