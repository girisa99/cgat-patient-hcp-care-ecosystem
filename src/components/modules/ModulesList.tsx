
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Shield, Users, Settings } from 'lucide-react';

interface ModulesListProps {
  modules: any[];
  onEditModule: (module: any) => void;
  onAssignToRole: (module: any) => void;
}

const ModulesList: React.FC<ModulesListProps> = ({ modules, onEditModule, onAssignToRole }) => {
  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No modules found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <Card key={module.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{module.name}</h3>
                    <Badge 
                      variant={module.is_active !== false ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {module.is_active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                {module.description && (
                  <p className="text-gray-600 mb-3">{module.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Created: {new Date(module.created_at).toLocaleDateString()}</span>
                  {module.updated_at !== module.created_at && (
                    <span>Updated: {new Date(module.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditModule(module)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Module
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAssignToRole(module)}>
                    <Users className="h-4 w-4 mr-2" />
                    Assign to Role
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Module Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModulesList;
