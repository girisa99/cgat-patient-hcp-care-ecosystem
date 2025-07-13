/**
 * Create User Form Component
 * Handles user creation with proper validation and role assignment
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';

interface CreateUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: ''
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const { facilities } = useMasterData();
  const { createUser, isCreatingUser } = useMasterUserManagement();

  // Mock roles - in real app, fetch from database
  const availableRoles = [
    { id: 'patient', name: 'Patient' },
    { id: 'staff', name: 'Staff' },
    { id: 'admin', name: 'Admin' },
    { id: 'onboardingTeam', name: 'Onboarding Team' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.first_name || !formData.last_name) {
      return;
    }

    await createUser({
      ...formData,
      roles: selectedRoles,
      facilities: selectedFacilities
    });

    // Reset form
    setFormData({ email: '', first_name: '', last_name: '', password: '' });
    setSelectedRoles([]);
    setSelectedFacilities([]);
    onOpenChange(false);
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleFacilityToggle = (facilityId: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facilityId) 
        ? prev.filter(id => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Temporary Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Auto-generated if empty"
            />
          </div>

          <div>
            <Label>Assign Roles</Label>
            <div className="space-y-2 mt-2">
              {availableRoles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.id}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Label htmlFor={role.id} className="text-sm">{role.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Assign Facilities</Label>
            <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
              {facilities.map((facility) => (
                <div key={facility.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={facility.id}
                    checked={selectedFacilities.includes(facility.id)}
                    onCheckedChange={() => handleFacilityToggle(facility.id)}
                  />
                  <Label htmlFor={facility.id} className="text-sm">{facility.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingUser}>
              {isCreatingUser ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};