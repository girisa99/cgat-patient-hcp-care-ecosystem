
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModules } from '@/hooks/useModules';
import { useToast } from '@/hooks/use-toast';

interface AssignModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const AssignModuleDialog: React.FC<AssignModuleDialogProps> = ({ 
  open, 
  onOpenChange, 
  userId, 
  userName 
}) => {
  const { modules } = useModules();
  const { toast } = useToast();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<'read' | 'write' | 'admin'>('read');
  const [isLoading, setIsLoading] = useState(false);

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
    } else {
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || selectedModules.length === 0) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual module assignment logic
      console.log('Assigning modules:', selectedModules, 'to user:', userId, 'with access level:', accessLevel);
      
      toast({
        title: "Modules Assigned",
        description: `${selectedModules.length} modules have been assigned to ${userName}`,
      });
      
      onOpenChange(false);
      setSelectedModules([]);
      setAccessLevel('read');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign modules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Modules</DialogTitle>
          <DialogDescription>
            Assign modules to {userName} with specific access levels
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Access Level</Label>
            <Select value={accessLevel} onValueChange={(value: 'read' | 'write' | 'admin') => setAccessLevel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="write">Read & Write</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={module.id}
                      checked={selectedModules.includes(module.id)}
                      onCheckedChange={(checked) => handleModuleToggle(module.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={module.id} className="font-medium cursor-pointer">
                        {module.name}
                      </Label>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {modules.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No modules available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || selectedModules.length === 0}
            >
              {isLoading ? 'Assigning...' : `Assign ${selectedModules.length} Module${selectedModules.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignModuleDialog;
