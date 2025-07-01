
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';
import { useModules } from '@/hooks/useModules';

const RoutingPreferences = () => {
  const {
    userPreferences,
    updateUserPreferences,
    canAccessUnifiedDashboard,
    hasMultipleModules,
    getAccessibleModules,
    moduleProgress
  } = useIntelligentRouting();
  
  const { userModules } = useModules();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p>Unified Dashboard Access: {canAccessUnifiedDashboard ? 'Yes' : 'No'}</p>
            <p>Has Multiple Modules: {hasMultipleModules ? 'Yes' : 'No'}</p>
            <p>Module Progress Items: {moduleProgress?.length || 0}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Accessible Modules:</h4>
            {userModules?.map((module) => (
              <div key={module.module_id} className="flex items-center justify-between p-2 border rounded">
                <span>{module.module_name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoutingPreferences;
