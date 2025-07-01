
/**
 * Enhanced Module List Component with Component/Service Display for RBAC
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, Component, Settings, Lock, Unlock } from 'lucide-react';
import { moduleRegistry, type ComponentServiceInfo } from '@/utils/moduleRegistry';

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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getModuleComponents = (moduleName: string): ComponentServiceInfo[] => {
    console.log(`🔍 Looking for components for module: ${moduleName}`);
    
    // Try exact match first
    let components = moduleRegistry.getModuleComponentsForRBAC(moduleName);
    
    // If no exact match, try variations
    if (!components || components.length === 0) {
      // Try plural form
      const pluralName = moduleName.endsWith('s') ? moduleName : `${moduleName}s`;
      components = moduleRegistry.getModuleComponentsForRBAC(pluralName);
      
      // Try without 's' if original had 's'
      if ((!components || components.length === 0) && moduleName.endsWith('s')) {
        const singularName = moduleName.slice(0, -1);
        components = moduleRegistry.getModuleComponentsForRBAC(singularName);
      }
    }
    
    console.log(`📊 Found ${components?.length || 0} components for ${moduleName}`);
    return components || [];
  };

  const getComponentIcon = (type: 'component' | 'service' | 'hook') => {
    switch (type) {
      case 'component':
        return <Component className="h-3 w-3" />;
      case 'service':
        return <Settings className="h-3 w-3" />;
      case 'hook':
        return <div className="h-3 w-3 rounded-full bg-blue-500" />;
      default:
        return <Component className="h-3 w-3" />;
    }
  };

  const ComponentServiceItem: React.FC<{ item: ComponentServiceInfo; moduleName: string }> = ({ item, moduleName }) => (
    <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
      <div className="flex items-center space-x-2">
        {getComponentIcon(item.type)}
        <div>
          <div className="text-sm font-medium">{item.name}</div>
          <div className="text-xs text-gray-500">
            {item.path || item.filePath || 'Path not specified'}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {item.isProtected ? (
                <Lock className="h-3 w-3 text-red-500" />
              ) : (
                <Unlock className="h-3 w-3 text-green-500" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.isProtected ? 'Protected' : 'Public'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex flex-wrap gap-1">
          {(item.permissions || ['read']).slice(0, 2).map((permission) => (
            <Badge key={permission} variant="outline" className="text-xs">
              {permission}
            </Badge>
          ))}
          {(item.permissions || []).length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(item.permissions || []).length - 2}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  // Debug: Log all registered modules
  React.useEffect(() => {
    const registeredModules = moduleRegistry.getAll();
    console.log('📋 All registered modules:', registeredModules.map(m => ({
      name: m.moduleName,
      components: m.components?.length || 0,
      services: m.services?.length || 0,
      hooks: m.hooks?.length || 0
    })));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Modules with Components & Services</CardTitle>
        <p className="text-sm text-gray-600">
          Manage modules and their associated components for granular RBAC permissions
        </p>
      </CardHeader>
      <CardContent>
        {modules && modules.length > 0 ? (
          <div className="space-y-4">
            {modules.map((module) => {
              const components = getModuleComponents(module.name);
              const isExpanded = expandedModules.has(module.id);
              
              return (
                <Collapsible key={module.id} open={isExpanded} onOpenChange={() => toggleModuleExpansion(module.id)}>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center space-x-2 text-left hover:bg-gray-50 p-2 rounded -m-2 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">{module.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                            {components.length > 0 && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {components.filter(c => c.type === 'component').length} Components
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {components.filter(c => c.type === 'service').length} Services
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {components.filter(c => c.type === 'hook').length} Hooks
                                </Badge>
                              </div>
                            )}
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <div className="flex items-center space-x-2 ml-4">
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
                    
                    <CollapsibleContent>
                      <div className="mt-4 space-y-3">
                        {components.length > 0 ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <Component className="h-4 w-4" />
                              <h4 className="font-medium">Components & Services</h4>
                              <Badge variant="outline" className="text-xs">
                                {components.length} items
                              </Badge>
                            </div>
                            <div className="grid gap-2">
                              {components.map((component) => (
                                <ComponentServiceItem
                                  key={component.name}
                                  item={component}
                                  moduleName={module.name}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              💡 Each component/service can be assigned specific permissions for granular access control
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <Component className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No components or services detected for this module</p>
                            <p className="text-xs mt-1">Use "Auto Detection" tab to scan and register components</p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
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
