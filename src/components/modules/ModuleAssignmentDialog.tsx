
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useModules } from '@/hooks/useModules';
import { CalendarIcon, Shield } from 'lucide-react';

interface ModuleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModule?: any;
  userId?: string;
  userName?: string;
}

// Mock users data - in a real app, this would come from a useUsers hook
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
];

const ModuleAssignmentDialog: React.FC<ModuleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  selectedModule,
  userId,
  userName
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  
  const { modules, assignModule, isAssigning } = useModules();

  // Determine if we're in "user-first" mode (coming from Users page) or "module-first" mode (coming from Modules page)
  const isUserFirstMode = !!userId;
  const isModuleFirstMode = !!selectedModule;

  // Reset form when dialog opens/closes or props change
  useEffect(() => {
    if (!open) {
      setSelectedUserId('');
      setSelectedModuleId('');
      setExpiresAt('');
    } else {
      // Pre-populate fields based on props
      if (userId) {
        setSelectedUserId(userId);
      }
      if (selectedModule) {
        setSelectedModuleId(selectedModule.id);
      }
    }
  }, [open, userId, selectedModule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalUserId = isUserFirstMode ? userId : selectedUserId;
    const finalModuleId = isModuleFirstMode ? selectedModule?.id : selectedModuleId;
    
    if (!finalUserId || !finalModuleId) return;
    
    await assignModule({
      userId: finalUserId,
      moduleId: finalModuleId,
      expiresAt: expiresAt || null
    });
    
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    if (isUserFirstMode) {
      return `Assign Module to ${userName}`;
    }
    return 'Assign Module Access';
  };

  const getDialogDescription = () => {
    if (isUserFirstMode) {
      return `Select a module to assign to ${userName}`;
    }
    return `Grant access to module: ${selectedModule?.name || 'Selected Module'}`;
  };

  const canSubmit = () => {
    const hasUser = isUserFirstMode ? !!userId : !!selectedUserId;
    const hasModule = isModuleFirstMode ? !!selectedModule : !!selectedModuleId;
    return hasUser && hasModule && !isAssigning;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection - only show if not in user-first mode */}
          {!isUserFirstMode && (
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Module Selection - only show if not in module-first mode */}
          {!isModuleFirstMode && (
            <div className="space-y-2">
              <Label htmlFor="module">Select Module</Label>
              <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules?.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{module.name}</span>
                        <span className="text-xs text-gray-500">{module.description || 'No description'}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show selected module info in user-first mode */}
          {isUserFirstMode && selectedModuleId && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium">
                {modules?.find(m => m.id === selectedModuleId)?.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {modules?.find(m => m.id === selectedModuleId)?.description || 'No description available'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expires">Expires At (Optional)</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit()}
              className="flex-1"
            >
              {isAssigning ? 'Assigning...' : 'Assign Module'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleAssignmentDialog;
