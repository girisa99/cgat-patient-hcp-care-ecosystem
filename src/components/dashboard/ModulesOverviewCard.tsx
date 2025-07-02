
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';

export const ModulesOverviewCard: React.FC = () => {
  // Mock data for modules - this would come from a modules hook in a real implementation
  const modules = [
    { name: 'Patient Management', status: 'active', version: '1.2.0' },
    { name: 'User Management', status: 'active', version: '1.1.0' },
    { name: 'Facilities', status: 'active', version: '1.0.0' },
    { name: 'Onboarding', status: 'active', version: '1.3.0' },
    { name: 'API Integration', status: 'maintenance', version: '0.9.0' }
  ];

  const activeModules = modules.filter(m => m.status === 'active').length;
  const totalModules = modules.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Modules Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Modules</span>
            <Badge variant="default">{activeModules}/{totalModules}</Badge>
          </div>
          
          <div className="space-y-2">
            {modules.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  {module.status === 'active' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium">{module.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{module.version}</Badge>
                  <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                    {module.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
