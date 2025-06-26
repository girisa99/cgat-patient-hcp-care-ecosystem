
import React, { useState } from 'react';
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
import { CalendarIcon, UserIcon, Shield } from 'lucide-react';

interface ModuleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  userName?: string;
}

const ModuleAssignmentDialog: React.FC<ModuleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  
  const { modules, assignModule, isAssigning } = useModules();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedModuleId) return;
    
    assignModule({
      userId,
      moduleId: selectedModuleId,
      expiresAt: expiresAt || null
    });
    
    onOpenChange(false);
    setSelectedModuleId('');
    setExpiresAt('');
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
            Grant module access to <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                {modules?.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{module.name}</span>
                      <span className="text-xs text-gray-500">
                        {module.description}
                      </span>
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
              disabled={!selectedModuleId || isAssigning}
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
