
/**
 * Module List Component
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Module {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface ModuleListProps {
  modules: Module[];
  onAssignUsers: (module: Module) => void;
  onAssignRoles: (module: Module) => void;
  onDeleteModule: (moduleId: string) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  onAssignUsers,
  onAssignRoles,
  onDeleteModule
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Modules</CardTitle>
      </CardHeader>
      <CardContent>
        {modules && modules.length > 0 ? (
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{module.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={module.is_active ? "default" : "secondary"}>
                      {module.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssignUsers(module)}
                    >
                      Assign Users
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssignRoles(module)}
                    >
                      Assign Roles
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteModule(module.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No modules found. Create your first module to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
