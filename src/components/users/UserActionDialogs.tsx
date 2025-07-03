import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRoleMutations } from '@/hooks/mutations/useRoleMutations';
import { useFacilityMutations } from '@/hooks/mutations/useFacilityMutations';
import { useUserDeactivation } from '@/hooks/mutations/useUserDeactivation';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Shield, Building2, UserX, Trash2, Mail } from 'lucide-react';
import type { UserWithRoles } from '@/types/userManagement';

interface UserActionDialogsProps {
  selectedUser: UserWithRoles | null;
  showViewDialog: boolean;
  showEditDialog: boolean;
  showRoleDialog: boolean;
  showFacilityDialog: boolean;
  showDeactivateDialog: boolean;
  onCloseView: () => void;
  onCloseEdit: () => void;
  onCloseRole: () => void;
  onCloseFacility: () => void;
  onCloseDeactivate: () => void;
  onUserUpdated: () => void;
}

export const UserActionDialogs: React.FC<UserActionDialogsProps> = ({
  selectedUser,
  showViewDialog,
  showEditDialog,
  showRoleDialog,
  showFacilityDialog,
  showDeactivateDialog,
  onCloseView,
  onCloseEdit,
  onCloseRole,
  onCloseFacility,
  onCloseDeactivate,
  onUserUpdated
}) => {
  const { toast } = useToast();
  const { assignRole, removeRole, isAssigningRole, isRemovingRole } = useRoleMutations();
  const { assignFacility, isAssigningFacility } = useFacilityMutations();
  const { deactivateUser, isDeactivating } = useUserDeactivation();

  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Role assignment state
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleAction, setRoleAction] = useState<'assign' | 'remove'>('assign');

  // Available roles
  const availableRoles = [
    'superAdmin',
    'onboardingTeam', 
    'healthcareProvider',
    'caseManager',
    'nurse',
    'patientCaregiver',
    'financeTeam',
    'contractTeam'
  ];

  // Update edit form when user changes
  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        first_name: selectedUser.first_name || '',
        last_name: selectedUser.last_name || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || ''
      });
    }
  }, [selectedUser]);

  const getUserRoles = (user: UserWithRoles): string[] => {
    return user.user_roles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
  };

  const isUserVerified = (user: UserWithRoles): boolean => {
    return Boolean(user.email_confirmed_at);
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;

    try {
      const { data, error } = await supabase.functions.invoke('manage-user-profiles', {
        body: {
          action: 'update',
          user_id: selectedUser.id,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          email: editForm.email,
          phone: editForm.phone
        }
      });

      if (error) throw error;

      toast({
        title: "User Updated",
        description: `${editForm.first_name} ${editForm.last_name} has been updated successfully.`,
      });

      onUserUpdated();
      onCloseEdit();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleRoleAction = () => {
    if (!selectedUser || !selectedRole) return;

    if (roleAction === 'assign') {
      assignRole({ 
        userId: selectedUser.id, 
        roleName: selectedRole as any 
      });
    } else {
      removeRole({ 
        userId: selectedUser.id, 
        roleName: selectedRole as any 
      });
    }

    setTimeout(() => {
      onUserUpdated();
      onCloseRole();
    }, 1000);
  };

  const handleFacilityAssign = () => {
    if (!selectedUser) return;

    assignFacility({ 
      userId: selectedUser.id, 
      facilityId: 'default', 
      accessLevel: 'read' 
    });

    setTimeout(() => {
      onUserUpdated();
      onCloseFacility();
    }, 1000);
  };

  const handleDeactivate = () => {
    if (!selectedUser) return;

    deactivateUser({ 
      userId: selectedUser.id, 
      reason: 'Administrative action via user management' 
    });

    setTimeout(() => {
      onUserUpdated();
      onCloseDeactivate();
    }, 1000);
  };

  const handleResendEmail = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: selectedUser.email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification Email Sent",
        description: `Verification email sent to ${selectedUser.email}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Send Email",
        description: "There was an error sending the verification email",
        variant: "destructive",
      });
    }
  };

  if (!selectedUser) return null;

  return (
    <>
      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={onCloseView}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
            <DialogDescription>
              View detailed information for {selectedUser.first_name || selectedUser.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Personal Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Name:</span>
                    <p className="text-sm">{selectedUser.first_name || 'Not set'} {selectedUser.last_name || ''}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Email:</span>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <span className="text-sm font-medium">Phone:</span>
                      <p className="text-sm">{selectedUser.phone}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Account Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Status:</span>
                    <div className="mt-1">
                      {isUserVerified(selectedUser) ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <X className="h-3 w-3 mr-1" />
                          Pending Verification
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">User ID:</span>
                    <p className="text-xs font-mono text-muted-foreground">{selectedUser.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Created:</span>
                    <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Roles & Permissions</h4>
              <div className="flex gap-2 flex-wrap">
                {getUserRoles(selectedUser).length > 0 ? (
                  getUserRoles(selectedUser).map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">No roles assigned</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleResendEmail} variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Resend Verification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={onCloseEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Update information for {selectedUser.first_name || selectedUser.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input 
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input 
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="Enter email address"
                type="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input 
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCloseEdit} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleEditSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={onCloseRole}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Assign or remove roles for {selectedUser.first_name || selectedUser.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Current Roles</label>
              <div className="flex gap-2 flex-wrap p-3 bg-muted/30 rounded-md min-h-[40px] mt-2">
                {getUserRoles(selectedUser).length > 0 ? (
                  getUserRoles(selectedUser).map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={roleAction} onValueChange={(value: 'assign' | 'remove') => setRoleAction(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign">Assign Role</SelectItem>
                  <SelectItem value="remove">Remove Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Select Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCloseRole} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleRoleAction} 
              className="flex-1"
              disabled={!selectedRole || isAssigningRole || isRemovingRole}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isAssigningRole || isRemovingRole ? 'Processing...' : `${roleAction === 'assign' ? 'Assign' : 'Remove'} Role`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Facility Assignment Dialog */}
      <Dialog open={showFacilityDialog} onOpenChange={onCloseFacility}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Facility Access</DialogTitle>
            <DialogDescription>
              Grant facility access to {selectedUser.first_name || selectedUser.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will assign default facility access to the user.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCloseFacility} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleFacilityAssign} 
              className="flex-1"
              disabled={isAssigningFacility}
            >
              <Building2 className="h-4 w-4 mr-2" />
              {isAssigningFacility ? 'Assigning...' : 'Assign Access'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate User Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={onCloseDeactivate}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Deactivate User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {selectedUser.first_name || selectedUser.email}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will prevent the user from accessing the system. This action can be reversed.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCloseDeactivate} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleDeactivate} 
              variant="destructive" 
              className="flex-1"
              disabled={isDeactivating}
            >
              <UserX className="h-4 w-4 mr-2" />
              {isDeactivating ? 'Deactivating...' : 'Deactivate User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};