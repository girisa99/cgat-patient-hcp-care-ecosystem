import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMasterData } from '@/hooks/useMasterData';

interface ModuleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  onAssignModule: (userId: string, moduleId: string) => void;
}

export const ModuleAssignmentDialog: React.FC<ModuleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  selectedUser,
  onAssignModule
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const { modules } = useMasterData();

  const handleAssignModule = () => {
    if (selectedUser && selectedModuleId) {
      onAssignModule(selectedUser.id, selectedModuleId);
      setSelectedModuleId('');
      onOpenChange(false);
    }
  };

  const activeModules = modules.filter(m => m.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign Module to {selectedUser?.firstName} {selectedUser?.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>User Information</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">{selectedUser?.firstName} {selectedUser?.lastName}</div>
              <div className="text-sm text-muted-foreground">{selectedUser?.email}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-select">Select Module</Label>
            <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a module to assign" />
              </SelectTrigger>
              <SelectContent>
                {activeModules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{module.name}</span>
                      {module.description && (
                        <span className="text-sm text-muted-foreground">{module.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Available Modules</Label>
            <div className="flex flex-wrap gap-2">
              {activeModules.map((module) => (
                <Badge key={module.id} variant="outline" className="text-xs">
                  {module.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            onClick={handleAssignModule} 
            disabled={!selectedModuleId}
          >
            Assign Module
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};