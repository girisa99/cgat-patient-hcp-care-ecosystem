
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface UserActionDialogsProps {
  // User data with proper role structure
  selectedUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: {
      name: string;
      description?: string;
    } | string;
    roles?: Array<{ name: string; description?: string; }>;
  } | null;
  
  // Dialog states
  assignRoleOpen: boolean;
  removeRoleOpen: boolean;
  assignFacilityOpen: boolean;
  
  // Dialog controls
  setAssignRoleOpen: (open: boolean) => void;
  setRemoveRoleOpen: (open: boolean) => void;
  setAssignFacilityOpen: (open: boolean) => void;
  
  // Actions
  onAssignRole: (userId: string, roleName: string) => void;
  onRemoveRole: (userId: string, roleName: string) => void;
  onAssignFacility: (userId: string, facilityId: string) => void;
  
  // Available options
  availableRoles: Array<{ id: string; name: string; description?: string; }>;
  availableFacilities: Array<{ id: string; name: string; }>;
}

export const UserActionDialogs: React.FC<UserActionDialogsProps> = ({
  selectedUser,
  assignRoleOpen,
  removeRoleOpen,
  assignFacilityOpen,
  setAssignRoleOpen,
  setRemoveRoleOpen,  
  setAssignFacilityOpen,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  availableRoles = [],
  availableFacilities = []
}) => {
  const [selectedRoleName, setSelectedRoleName] = React.useState<string>('');
  const [selectedFacilityId, setSelectedFacilityId] = React.useState<string>('');

  // Normalize user roles - handle both string and object formats
  const getUserRoles = () => {
    if (!selectedUser) return [];
    
    // If user has roles array, use it
    if (selectedUser.roles && Array.isArray(selectedUser.roles)) {
      return selectedUser.roles;
    }
    
    // If user has single role object, convert to array
    if (selectedUser.role && typeof selectedUser.role === 'object') {
      return [selectedUser.role];
    }
    
    // If user has string role, convert to object format
    if (selectedUser.role && typeof selectedUser.role === 'string') {
      return [{ name: selectedUser.role }];
    }
    
    return [];
  };

  const userRoles = getUserRoles();

  const handleAssignRole = () => {
    if (selectedUser && selectedRoleName) {
      onAssignRole(selectedUser.id, selectedRoleName);
      setSelectedRoleName('');
      setAssignRoleOpen(false);
    }
  };

  const handleRemoveRole = (roleName: string) => {
    if (selectedUser) {
      onRemoveRole(selectedUser.id, roleName);
      setRemoveRoleOpen(false);
    }
  };

  const handleAssignFacility = () => {
    if (selectedUser && selectedFacilityId) {
      onAssignFacility(selectedUser.id, selectedFacilityId);
      setSelectedFacilityId('');
      setAssignFacilityOpen(false);
    }
  };

  return (
    <>
      {/* Assign Role Dialog */}
      <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <Input 
                value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''} 
                disabled 
              />
            </div>
            <div>
              <Label>Select Role</Label>
              <Select value={selectedRoleName} onValueChange={setSelectedRoleName}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                      {role.description && (
                        <span className="text-xs text-gray-500 ml-2">{role.description}</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAssignRole} disabled={!selectedRoleName}>
                Assign Role
              </Button>
              <Button variant="outline" onClick={() => setAssignRoleOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Role Dialog */}
      <Dialog open={removeRoleOpen} onOpenChange={setRemoveRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <Input 
                value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''} 
                disabled 
              />
            </div>
            <div>
              <Label>Current Roles</Label>
              <div className="space-y-2">
                {userRoles.length > 0 ? (
                  userRoles.map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <Badge variant="outline">{role.name}</Badge>
                        {role.description && (
                          <span className="text-xs text-gray-500 ml-2">{role.description}</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveRole(role.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No roles assigned</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRemoveRoleOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Facility Dialog */}
      <Dialog open={assignFacilityOpen} onOpenChange={setAssignFacilityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Facility</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <Input 
                value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''} 
                disabled 
              />
            </div>
            <div>
              <Label>Select Facility</Label>
              <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a facility" />
                </SelectTrigger>
                <SelectContent>
                  {availableFacilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAssignFacility} disabled={!selectedFacilityId}>
                Assign Facility
              </Button>
              <Button variant="outline" onClick={() => setAssignFacilityOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
