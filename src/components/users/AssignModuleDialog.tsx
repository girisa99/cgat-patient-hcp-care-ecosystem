
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AssignModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const AssignModuleDialog: React.FC<AssignModuleDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  
  const {
    modules,
    userModules,
    assignModule,
    isLoading: isLoadingModules,
    isLoadingUserModules,
    isAssigning,
    error
  } = useModules();

  const handleAssignModule = () => {
    if (!selectedModuleId) return;
    
    console.log('📦 Assigning module:', selectedModuleId, 'to user:', userId, userName);
    assignModule({
      userId,
      moduleId: selectedModuleId,
      expiresAt: expiresAt || null
    });
    
    onOpenChange(false);
  };

  if (isLoadingModules || isLoadingUserModules) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Loading...
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Loading Modules
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            {error.message || 'Failed to load modules'}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Module to {userName}
          </DialogTitle>
          <DialogDescription>
            Grant access to a specific module for this user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module">Select Module</Label>
            <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a module to assign" />
              </SelectTrigger>
              <SelectContent>
                {modules?.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{module.name}</span>
                      {module.is_active && (
                        <Badge variant="outline" className="ml-2">Active</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiration Date (Optional)
            </Label>
            <input
              type="datetime-local"
              id="expiration"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {selectedModuleId && (
            <Card>
              <CardContent className="pt-4">
                {(() => {
                  const selectedModule = modules?.find(m => m.id === selectedModuleId);
                  return selectedModule ? (
                    <div>
                      <h4 className="font-medium">{selectedModule.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedModule.description || 'No description available'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={selectedModule.is_active ? "default" : "secondary"}>
                          {selectedModule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignModule}
              disabled={!selectedModuleId || isAssigning}
              className="flex-1"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                'Assign Module'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignModuleDialog;
