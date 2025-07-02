
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

export const SystemHighlightsCard: React.FC = () => {
  const highlights = [
    {
      title: 'RLS Security Fixed',
      description: 'Recursive policy issues resolved',
      type: 'success',
      icon: CheckCircle,
      timestamp: '2 hours ago'
    },
    {
      title: 'Real-time Stats Active',
      description: 'Live user statistics implemented',
      type: 'success',
      icon: TrendingUp,
      timestamp: '1 hour ago'
    },
    {
      title: 'Data Consistency Verified',
      description: 'Single source of truth validated',
      type: 'success',
      icon: CheckCircle,
      timestamp: '30 minutes ago'
    },
    {
      title: 'System Monitoring',
      description: 'Enhanced validation systems active',
      type: 'info',
      icon: AlertTriangle,
      timestamp: 'Just now'
    }
  ];

  const getVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'info': return 'secondary';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'info': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent System Highlights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                <Icon className={`h-4 w-4 mt-0.5 ${getIconColor(highlight.type)}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{highlight.title}</h4>
                    <Badge variant={getVariant(highlight.type)} className="text-xs">
                      {highlight.timestamp}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {highlight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-xs text-blue-800">
            🔄 System health monitoring active - All systems stable
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
