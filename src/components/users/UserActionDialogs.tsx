import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Building, 
  Package,
  Activity
} from 'lucide-react';
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
  onUserUpdated,
}) => {
  const getUserRoles = () => {
    if (!selectedUser?.user_roles) return [];
    return selectedUser.user_roles.map(ur => ur.roles.name);
  };

  const isPatient = () => getUserRoles().includes('patientCaregiver');
  const isStaff = () => getUserRoles().some(role => 
    ['healthcareProvider', 'caseManager', 'nurse'].includes(role)
  );
  const isAdmin = () => getUserRoles().some(role => 
    ['superAdmin', 'onboardingTeam'].includes(role)
  );

  return (
    <>
      {/* Enhanced View User Dialog with Cross-Module Information */}
      <Dialog open={showViewDialog} onOpenChange={onCloseView}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile - {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogTitle>
            <DialogDescription>
              Complete user information across all system modules
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="roles">Roles & Access</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <User className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-semibold">{selectedUser.first_name} {selectedUser.last_name}</p>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-semibold">{selectedUser.email}</p>
                            <p className="text-sm text-muted-foreground">Email Address</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {selectedUser.phone && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Phone className="h-8 w-8 text-purple-600" />
                            <div>
                              <p className="font-semibold">{selectedUser.phone}</p>
                              <p className="text-sm text-muted-foreground">Phone Number</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-8 w-8 text-orange-600" />
                          <div>
                            <p className="font-semibold">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">Member Since</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant={selectedUser.email_confirmed_at ? "default" : "secondary"}>
                      {selectedUser.email_confirmed_at ? "Verified" : "Not Verified"}
                    </Badge>
                    {isPatient() && <Badge variant="outline">Patient</Badge>}
                    {isStaff() && <Badge variant="outline">Staff Member</Badge>}
                    {isAdmin() && <Badge variant="outline">Administrator</Badge>}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="roles">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Assigned Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {getUserRoles().map((role) => (
                        <Badge key={role} variant="secondary" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Access Level</h4>
                    <p className="text-sm text-muted-foreground">
                      {isAdmin() ? 'Full administrative access across all modules' :
                       isStaff() ? 'Staff access to clinical and operational modules' :
                       isPatient() ? 'Patient portal access with limited permissions' :
                       'Basic user access'}
                    </p>
                  </div>
                  
                  {selectedUser.facilities && (
                    <div>
                      <h4 className="font-semibold mb-2">Facility Access</h4>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span className="text-sm">Assigned to facility</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="modules">
                <div className="space-y-4">
                  <h4 className="font-semibold">Module Access</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">User Management</span>
                          <Badge variant={isAdmin() ? "default" : "secondary"} className="ml-auto">
                            {isAdmin() ? "Full" : "Limited"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Patient Management</span>
                          <Badge variant={isPatient() || isStaff() || isAdmin() ? "default" : "secondary"} className="ml-auto">
                            {isAdmin() ? "Full" : isStaff() ? "Clinical" : isPatient() ? "Self" : "None"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Facility Management</span>
                          <Badge variant={isAdmin() || isStaff() ? "default" : "secondary"} className="ml-auto">
                            {isAdmin() ? "Full" : isStaff() ? "View" : "None"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">Module Management</span>
                          <Badge variant={isAdmin() ? "default" : "secondary"} className="ml-auto">
                            {isAdmin() ? "Full" : "None"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="p-3 border rounded">
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedUser.email_confirmed_at && (
                      <div className="p-3 border rounded">
                        <p className="text-sm font-medium">Email Verified</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedUser.email_confirmed_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedUser.updated_at && (
                      <div className="p-3 border rounded">
                        <p className="text-sm font-medium">Profile Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedUser.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCloseView} className="flex-1">
              Close
            </Button>
            <Button onClick={() => {
              onCloseView();
              // Could trigger edit dialog here if needed
            }} className="flex-1">
              Edit User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={onCloseEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Edit functionality will be implemented here
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCloseEdit} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={onCloseRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Assign or remove roles for this user
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Role management functionality will be implemented here
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCloseRole} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Facility Assignment Dialog */}
      <Dialog open={showFacilityDialog} onOpenChange={onCloseFacility}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Facility</DialogTitle>
            <DialogDescription>
              Assign this user to a facility
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Facility assignment functionality will be implemented here
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCloseFacility} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              Assign Facility
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate User Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={onCloseDeactivate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this user account?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will prevent the user from accessing the system. You can reactivate the account later if needed.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCloseDeactivate} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1">
              Deactivate User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
