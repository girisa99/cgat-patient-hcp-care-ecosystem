
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, UserPlus, RefreshCw, Settings, Plus, Users2, Building2, Blocks,
  AlertCircle, CheckCircle, Users, Edit, Trash2
} from "lucide-react";
import { useMasterRoleManagement } from '@/hooks/useMasterRoleManagement';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';

// Extended interface for roles with is_active
interface ExtendedRole {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
}

const RoleManagement = () => {
  const { user: authUser, userRoles, isAuthenticated } = useMasterAuth();
  const { roles, users, modules, facilities, isLoading } = useMasterRoleManagement();
  const { showSuccess, showError } = useMasterToast();
  
  // Dialog states
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [assignUserRoleOpen, setAssignUserRoleOpen] = useState(false);
  const [assignModuleRoleOpen, setAssignModuleRoleOpen] = useState(false);
  const [assignFacilityRoleOpen, setAssignFacilityRoleOpen] = useState(false);
  
  // Form states
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<any>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState('');

  console.log('🔐 Role Management Debug:', {
    rolesCount: roles.length,
    usersCount: users.length,
    modulesCount: modules.length,
    facilitiesCount: facilities.length,
    isLoading
  });

  // Role management functions
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      showError('Role name is required');
      return;
    }

    try {
      // Note: Role creation is currently limited to predefined roles in the enum
      // For now, we'll show a message about available roles
      const existingRoleNames = roles.map(r => r.name);
      if (existingRoleNames.includes(newRoleName.trim() as any)) {
        showError('Role already exists');
        return;
      }
      
      showError('Role creation is currently limited to predefined roles. Available roles: ' + existingRoleNames.join(', '));
      setCreateRoleOpen(false);
    } catch (err: any) {
      showError('Failed to create role: ' + err.message);
    }
  };

  const handleEditRole = async () => {
    if (!editRoleName.trim() || !selectedRoleForEdit) {
      showError('Role name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('roles')
        .update({ 
          description: editRoleDescription.trim() 
        })
        .eq('id', selectedRoleForEdit.id);

      if (error) throw error;
      
      showSuccess('Role updated successfully');
      setEditRoleOpen(false);
      setSelectedRoleForEdit(null);
      setEditRoleName('');
      setEditRoleDescription('');
    } catch (err: any) {
      showError('Failed to update role: ' + err.message);
    }
  };

  const handleAssignUserRole = async () => {
    if (!selectedUser || !selectedRoleForAssignment) {
      showError('Please select both user and role');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('secure_assign_user_role', {
        target_user_id: selectedUser,
        target_role_name: selectedRoleForAssignment as any
      });

      if (error) throw error;
      
      // Check if the function returned an error
      const response = data as any;
      if (response && !response.success) {
        throw new Error(response.error || 'Role assignment failed');
      }
      
      showSuccess('Role assigned to user successfully');
      setSelectedUser('');
      setSelectedRoleForAssignment('');
      setAssignUserRoleOpen(false);
    } catch (err: any) {
      showError('Failed to assign role: ' + err.message);
    }
  };

  const handleAssignModuleRole = async () => {
    if (!selectedModule || !selectedRoleForAssignment) {
      showError('Please select both module and role');
      return;
    }

    try {
      // This would need a corresponding RPC function in the database
      showSuccess('Module role assignment functionality coming soon');
      setSelectedModule('');
      setSelectedRoleForAssignment('');
      setAssignModuleRoleOpen(false);
    } catch (err: any) {
      showError('Failed to assign module role: ' + err.message);
    }
  };

  const handleAssignFacilityRole = async () => {
    if (!selectedFacility || !selectedRoleForAssignment) {
      showError('Please select both facility and role');
      return;
    }

    try {
      // This would need a corresponding RPC function in the database
      showSuccess('Facility role assignment functionality coming soon');
      setSelectedFacility('');
      setSelectedRoleForAssignment('');
      setAssignFacilityRoleOpen(false);
    } catch (err: any) {
      showError('Failed to assign facility role: ' + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout title="Role Management">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Authentication Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                You need to be logged in to manage roles.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Role Management">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
           </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Role Management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Role Management
              </h1>
              <p className="text-lg text-gray-600">
                Manage roles, assign to users, modules, and facilities
              </p>
            </div>
            <Button
              onClick={() => setCreateRoleOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            <Badge variant="outline" className="text-sm">
              Total Roles: {roles.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Users: {users.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Modules: {modules.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Facilities: {facilities.length}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Blocks className="h-4 w-4" />
              Module Roles
            </TabsTrigger>
            <TabsTrigger value="facilities" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Facility Roles
            </TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <Card key={role.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>{role.name}</span>
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRoleForEdit(role);
                          setEditRoleName(role.name);
                          setEditRoleDescription(role.description || '');
                          setEditRoleOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        {role.description || 'No description available'}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <span>Created: {new Date(role.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {roles.length === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                  <h3 className="font-semibold mb-2 text-gray-700">No Roles Found</h3>
                  <p className="text-sm mb-4 text-gray-500">
                    No roles have been configured yet.
                  </p>
                  <Button onClick={() => setCreateRoleOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Role
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* User Roles Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Role Assignments</h3>
              <Button onClick={() => setAssignUserRoleOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign User Role
              </Button>
            </div>
            
            <div className="space-y-4">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <Card key={user.id} className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{user.first_name} {user.last_name}</h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      <div className="flex gap-2">
                        {user.user_roles.map((userRole, index) => (
                          <Badge key={index} variant="outline">
                            {userRole.roles.name}
                          </Badge>
                        ))}
                        {user.user_roles.length === 0 && (
                          <Badge variant="secondary">No roles assigned</Badge>
                        )}
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                    <h3 className="font-semibold mb-2 text-gray-700">No Users Found</h3>
                    <p className="text-sm mb-4 text-gray-500">
                      No users have been loaded from the database.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Module Roles Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Module Role Assignments</h3>
              <Button onClick={() => setAssignModuleRoleOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Module Role
              </Button>
            </div>
            
            <div className="space-y-4">
              {modules && modules.length > 0 ? (
                modules.map((module) => (
                  <Card key={module.id} className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      <Badge variant={module.is_active ? "default" : "secondary"}>
                        {module.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="text-center py-12">
                    <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                    <h3 className="font-semibold mb-2 text-gray-700">No Modules Found</h3>
                    <p className="text-sm mb-4 text-gray-500">
                      No modules have been loaded from the database.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Facility Roles Tab */}
          <TabsContent value="facilities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Facility Role Assignments</h3>
              <Button onClick={() => setAssignFacilityRoleOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Facility Role
              </Button>
            </div>
            
            <div className="space-y-4">
              {facilities && facilities.length > 0 ? (
                facilities.map((facility) => (
                  <Card key={facility.id} className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{facility.name}</h4>
                          <p className="text-sm text-gray-500">{facility.facility_type}</p>
                          {facility.address && (
                            <p className="text-xs text-gray-400">{facility.address}</p>
                          )}
                        </div>
                      <Badge variant={facility.is_active ? "default" : "secondary"}>
                        {facility.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                    <h3 className="font-semibold mb-2 text-gray-700">No Facilities Found</h3>
                    <p className="text-sm mb-4 text-gray-500">
                      No facilities have been loaded from the database.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Role Dialog */}
        <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Enter role description"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateRole} disabled={!newRoleName.trim()}>
                  Create Role
                </Button>
                <Button variant="outline" onClick={() => setCreateRoleOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editRoleName">Role Name</Label>
                <Input
                  id="editRoleName"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  placeholder="Enter role name"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Role name cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="editRoleDescription">Description</Label>
                <Textarea
                  id="editRoleDescription"
                  value={editRoleDescription}
                  onChange={(e) => setEditRoleDescription(e.target.value)}
                  placeholder="Enter role description"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditRole}>
                  Update Role
                </Button>
                <Button variant="outline" onClick={() => setEditRoleOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign User Role Dialog */}
        <Dialog open={assignUserRoleOpen} onOpenChange={setAssignUserRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Role</Label>
                <Select value={selectedRoleForAssignment} onValueChange={setSelectedRoleForAssignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAssignUserRole} disabled={!selectedUser || !selectedRoleForAssignment}>
                  Assign Role
                </Button>
                <Button variant="outline" onClick={() => setAssignUserRoleOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Module Role Dialog */}
        <Dialog open={assignModuleRoleOpen} onOpenChange={setAssignModuleRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Module</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Role</Label>
                <Select value={selectedRoleForAssignment} onValueChange={setSelectedRoleForAssignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAssignModuleRole} disabled={!selectedModule || !selectedRoleForAssignment}>
                  Assign Role
                </Button>
                <Button variant="outline" onClick={() => setAssignModuleRoleOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Facility Role Dialog */}
        <Dialog open={assignFacilityRoleOpen} onOpenChange={setAssignFacilityRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to Facility</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Facility</Label>
                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Role</Label>
                <Select value={selectedRoleForAssignment} onValueChange={setSelectedRoleForAssignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAssignFacilityRole} disabled={!selectedFacility || !selectedRoleForAssignment}>
                  Assign Role
                </Button>
                <Button variant="outline" onClick={() => setAssignFacilityRoleOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default RoleManagement;
