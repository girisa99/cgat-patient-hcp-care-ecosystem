
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Users, Settings } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

interface ModulesListProps {
  modules: Module[];
  onEditModule: (module: Module) => void;
  onAssignToRole: (module: Module) => void;
}

const ModulesList: React.FC<ModulesListProps> = ({ modules, onEditModule, onAssignToRole }) => {
  if (modules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No modules found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-lg">{module.name}</h3>
                {module.is_active !== false && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              
              {module.description && (
                <div className="mt-2 text-sm text-gray-600">
                  {module.description}
                </div>
              )}
              
              {module.created_at && (
                <div className="mt-2 text-xs text-gray-500">
                  Created: {new Date(module.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssignToRole(module)}
              >
                <Users className="h-4 w-4 mr-1" />
                Assign to Role
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditModule(module)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModulesList;
