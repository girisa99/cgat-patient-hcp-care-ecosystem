/**
 * Module Assignment Dialog Component
 * Handles module assignment/removal for users with proper RBAC integration
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Users, AlertTriangle } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useMasterToast } from '@/hooks/useMasterToast';
import type { UserWithRoles } from '@/types/userManagement';

interface ModuleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRoles | null;
}

export const ModuleAssignmentDialog: React.FC<ModuleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const { modules } = useMasterData();
  const { assignModule, removeModule, isAssigningModule } = useMasterUserManagement();
  const { showSuccess, showError } = useMasterToast();
  
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock current user modules (in real app, this would come from user data)
  const currentModuleIds: string[] = []; // user?.user_modules?.map(um => um.module_id) || [];

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleAssignModules = async () => {
    if (!user || selectedModules.length === 0) {
      showError('Module Assignment', 'Please select at least one module');
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const moduleId of selectedModules) {
        if (!currentModuleIds.includes(moduleId)) {
          await assignModule(user.id, moduleId);
        }
      }
      
      showSuccess('Modules Assigned', `Successfully assigned ${selectedModules.length} module(s) to ${user.first_name} ${user.last_name}`);
      onOpenChange(false);
      setSelectedModules([]);
    } catch (error) {
      showError('Assignment Failed', 'Failed to assign modules');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveModule = async (moduleId: string) => {
    if (!user) return;

    try {
      await removeModule(user.id, moduleId);
      showSuccess('Module Removed', `Successfully removed module from ${user.first_name} ${user.last_name}`);
    } catch (error) {
      showError('Removal Failed', 'Failed to remove module');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Manage Modules - {user.first_name} {user.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Modules */}
          <div>
            <Label className="text-sm font-medium">Current Modules</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentModuleIds.length > 0 ? (
                currentModuleIds.map((moduleId) => {
                  const module = modules.find(m => m.id === moduleId);
                  return (
                    <Badge key={moduleId} variant="default" className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {module?.name || 'Unknown Module'}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveModule(moduleId)}
                        disabled={isProcessing}
                      >
                        ×
                      </Button>
                    </Badge>
                  );
                })
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">No modules assigned</span>
                </div>
              )}
            </div>
          </div>

          {/* Available Modules */}
          <div>
            <Label className="text-sm font-medium">Available Modules</Label>
            <ScrollArea className="h-48 w-full border rounded-md p-4 mt-2">
              <div className="space-y-3">
                {modules.map((module) => {
                  const isCurrentModule = currentModuleIds.includes(module.id);
                  const isSelected = selectedModules.includes(module.id);
                  
                  return (
                    <div 
                      key={module.id} 
                      className={`flex items-center space-x-3 p-2 rounded-lg border ${
                        isCurrentModule ? 'bg-green-50 border-green-200' : 'bg-background'
                      }`}
                    >
                      <Checkbox
                        id={module.id}
                        checked={isSelected}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                        disabled={isCurrentModule || !module.is_active}
                      />
                      <div className="flex-1">
                        <Label htmlFor={module.id} className="text-sm font-medium cursor-pointer">
                          {module.name}
                        </Label>
                        {module.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isCurrentModule && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        <Badge variant={module.is_active ? "default" : "secondary"} className="text-xs">
                          {module.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignModules}
              disabled={selectedModules.length === 0 || isProcessing || isAssigningModule}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              {isProcessing ? 'Assigning...' : `Assign ${selectedModules.length} Module(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};