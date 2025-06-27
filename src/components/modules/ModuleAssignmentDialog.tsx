
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Package, Clock } from 'lucide-react';
import { useModules } from '@/hooks/useModules';

interface ModuleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const ModuleAssignmentDialog: React.FC<ModuleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { modules, isLoadingModules } = useModules();
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({});
  const [accessLevels, setAccessLevels] = useState<Record<string, 'read' | 'write' | 'admin'>>({});

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    setSelectedModules(prev => ({
      ...prev,
      [moduleId]: enabled
    }));

    if (enabled && !accessLevels[moduleId]) {
      setAccessLevels(prev => ({
        ...prev,
        [moduleId]: 'read'
      }));
    }
  };

  const handleAccessLevelChange = (moduleId: string, level: 'read' | 'write' | 'admin') => {
    setAccessLevels(prev => ({
      ...prev,
      [moduleId]: level
    }));
  };

  const handleSave = () => {
    const assignments = Object.entries(selectedModules)
      .filter(([_, enabled]) => enabled)
      .map(([moduleId]) => ({
        moduleId,
        accessLevel: accessLevels[moduleId] || 'read'
      }));

    console.log('Saving module assignments for user:', userId, assignments);
    // TODO: Implement module assignment logic
    onOpenChange(false);
  };

  if (isLoadingModules) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Modules to {userName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Package className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-800">
              Grant access to specific modules and set appropriate access levels
            </span>
          </div>

          {modules && modules.length > 0 ? (
            <div className="space-y-3">
              {modules.map((module) => (
                <Card key={module.id} className={selectedModules[module.id] ? 'border-blue-200 bg-blue-50/30' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch
                          id={`module-${module.id}`}
                          checked={selectedModules[module.id] || false}
                          onCheckedChange={(checked) => handleModuleToggle(module.id, checked)}
                        />
                        <div>
                          <CardTitle className="text-base">{module.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.description || 'No description available'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={module.is_active ? "default" : "secondary"}>
                          {module.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {selectedModules[module.id] && (
                          <Badge variant="outline" className="text-green-700 border-green-200">
                            Assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {selectedModules[module.id] && (
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                        <Label className="text-sm font-medium">Access Level:</Label>
                        <div className="flex gap-2">
                          {['read', 'write', 'admin'].map((level) => (
                            <Button
                              key={level}
                              variant={accessLevels[module.id] === level ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleAccessLevelChange(module.id, level as 'read' | 'write' | 'admin')}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No modules available for assignment</p>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {Object.values(selectedModules).filter(Boolean).length} modules selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Assignments
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleAssignmentDialog;
