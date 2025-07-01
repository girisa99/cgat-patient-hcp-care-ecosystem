
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AssignModuleToRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: any;
}

const AssignModuleToRoleDialog: React.FC<AssignModuleToRoleDialogProps> = ({ 
  open, 
  onOpenChange, 
  module 
}) => {
  const { toast } = useToast();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock roles data - replace with actual data from your roles API
  const availableRoles = [
    { id: '1', name: 'superAdmin', description: 'Full system access' },
    { id: '2', name: 'moderator', description: 'Content moderation and user management' },
    { id: '3', name: 'user', description: 'Standard user access' },
    { id: '4', name: 'patientCaregiver', description: 'Patient care and management' }
  ];

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module || selectedRoles.length === 0) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual role assignment logic
      console.log('Assigning module:', module.name, 'to roles:', selectedRoles);
      
      toast({
        title: "Module Assigned to Roles",
        description: `${module.name} has been assigned to ${selectedRoles.length} role${selectedRoles.length !== 1 ? 's' : ''}`,
      });
      
      onOpenChange(false);
      setSelectedRoles([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign module to roles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!module) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Module to Roles</DialogTitle>
          <DialogDescription>
            Assign "{module.name}" to specific user roles
          </DialogDescription>
        </DialogHeader>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Module Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{module.name}</Badge>
                <Badge variant={module.is_active !== false ? "default" : "secondary"}>
                  {module.is_active !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {module.description && (
                <p className="text-sm text-gray-600">{module.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableRoles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={role.id}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={role.id} className="font-medium cursor-pointer">
                        {role.name}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Assignment Effects</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Users with selected roles will gain access to this module</li>
              <li>• Module permissions will be inherited by role members</li>
              <li>• Changes take effect immediately for all users</li>
              <li>• You can modify assignments at any time</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || selectedRoles.length === 0}
            >
              {isLoading ? 'Assigning...' : `Assign to ${selectedRoles.length} Role${selectedRoles.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignModuleToRoleDialog;
