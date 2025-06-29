
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
    isLoadingModules,
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
    
    // Reset form and close dialog
    setSelectedModuleId('');
    setExpiresAt('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedModuleId('');
    setExpiresAt('');
    onOpenChange(false);
  };

  // Get user's currently assigned modules
  const assignedModuleIds = userModules?.map(m => m.module_id) || [];
  
  // Filter out already assigned modules
  const availableModules = modules?.filter(m => !assignedModuleIds.includes(m.id)) || [];

  if (isLoadingModules || isLoadingUserModules) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Module Access
          </DialogTitle>
          <DialogDescription>
            Grant {userName} access to specific modules. Module access can be temporary or permanent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading modules: {error.message}</span>
            </div>
          )}

          {/* Current Module Assignments */}
          {userModules && userModules.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Current Module Access
                </h4>
                <div className="flex flex-wrap gap-2">
                  {userModules.map((module) => (
                    <Badge key={module.module_id} variant="secondary">
                      {module.module_name}
                      {module.expires_at && (
                        <span className="ml-1 text-xs opacity-75">
                          (expires {new Date(module.expires_at).toLocaleDateString()})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-select">Select Module</Label>
              <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a module to assign..." />
                </SelectTrigger>
                <SelectContent>
                  {availableModules.length === 0 ? (
                    <SelectItem value="no-modules" disabled>
                      No additional modules available
                    </SelectItem>
                  ) : (
                    availableModules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        <div>
                          <div className="font-medium">{module.name}</div>
                          {module.description && (
                            <div className="text-sm text-gray-500">{module.description}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Expiration Date (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="expires-at" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Access Expiration (Optional)
              </Label>
              <input
                id="expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-sm text-gray-600">
                Leave empty for permanent access. Set a date/time for temporary access.
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignModule}
              disabled={!selectedModuleId || isAssigning || availableModules.length === 0}
            >
              {isAssigning ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Assigning...</span>
                </div>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Assign Module
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignModuleDialog;
