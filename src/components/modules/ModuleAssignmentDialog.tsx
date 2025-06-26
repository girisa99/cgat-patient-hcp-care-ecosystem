
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
  selectedModule
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  
  const { assignModule, isAssigning } = useModules();

  // Reset form when dialog opens/closes or module changes
  useEffect(() => {
    if (!open) {
      setSelectedUserId('');
      setExpiresAt('');
    }
  }, [open, selectedModule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !selectedModule) return;
    
    await assignModule({
      userId: selectedUserId,
      moduleId: selectedModule.id,
      expiresAt: expiresAt || null
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Module Access
          </DialogTitle>
          <DialogDescription>
            Grant access to module: <strong>{selectedModule?.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={!selectedUserId || !selectedModule || isAssigning}
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
