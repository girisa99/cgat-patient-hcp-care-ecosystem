
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Component, 
  Settings, 
  Zap, 
  Shield, 
  Unlock, 
  Eye,
  List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { moduleRegistry } from '@/utils/moduleRegistry';

export const ComponentsServicesCard: React.FC = () => {
  const navigate = useNavigate();
  const registryStats = moduleRegistry.getStats();
  const allComponents = moduleRegistry.getAllComponents();
  
  // Group components by type
  const componentsByType = allComponents.reduce((acc, { component }) => {
    if (!acc[component.type]) {
      acc[component.type] = [];
    }
    acc[component.type].push(component);
    return acc;
  }, {} as Record<string, any[]>);

  // Get recent components
  const recentComponents = allComponents
    .sort((a, b) => new Date(b.component.lastModified).getTime() - new Date(a.component.lastModified).getTime())
    .slice(0, 4);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'component': return <Component className="h-4 w-4 text-blue-500" />;
      case 'service': return <Settings className="h-4 w-4 text-green-500" />;
      case 'hook': return <Zap className="h-4 w-4 text-purple-500" />;
      default: return <Component className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Component className="h-5 w-5 mr-2" />
            Components & Services
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/modules')}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Component Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{registryStats.totalComponents}</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{registryStats.totalServices}</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{registryStats.totalHooks}</div>
              <div className="text-sm text-muted-foreground">Hooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{registryStats.protectedComponents}</div>
              <div className="text-sm text-muted-foreground">Protected</div>
            </div>
          </div>

          {/* Components by Type */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <List className="h-4 w-4 mr-2" />
              Component Distribution
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(componentsByType).map(([type, components]) => (
                <div key={type} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(type)}
                      <span className="font-medium capitalize">{type}s</span>
                    </div>
                    <Badge variant="outline">{components.length}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {components.filter(c => c.isProtected).length} protected
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Components */}
          {recentComponents.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Recent Components</h4>
              <div className="space-y-2">
                {recentComponents.map(({ moduleName, component }) => (
                  <div key={`${moduleName}-${component.name}`} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(component.type)}
                      <div>
                        <div className="font-medium">{component.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Module: {moduleName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {component.isProtected ? (
                        <Shield className="h-4 w-4 text-red-500" />
                      ) : (
                        <Unlock className="h-4 w-4 text-green-500" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {component.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
