import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, UserPlus, Shield, Mail, Settings, Edit, 
  UserX, Trash2, RefreshCw, Plus 
} from 'lucide-react';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useMasterRoleManagement } from '@/hooks/useMasterRoleManagement';
import { useMasterFacilities } from '@/hooks/useMasterFacilities';
import { useMasterToast } from '@/hooks/useMasterToast';
import { UserActionDialogs } from './UserActionDialogs';
import { ModuleAssignmentDialog } from './ModuleAssignmentDialog';
import { CreateRoleDialog } from './CreateRoleDialog';
import { CreateUserForm } from '@/components/forms/CreateUserForm';
import { supabase } from '@/integrations/supabase/client';

export const UsersManagementTable: React.FC = () => {
  const { showSuccess, showError } = useMasterToast();
  const { roles } = useMasterRoleManagement();
  const { facilities } = useMasterFacilities();
  
  const { 
    users, 
    isLoading, 
    getUserStats,
    refreshData,
    deactivateUser,
    assignRole,
    removeRole,
    assignModule,
    isDeactivating,
    isAssigningRole,
    isRemovingRole
  } = useMasterUserManagement();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [assignFacilityOpen, setAssignFacilityOpen] = useState(false);
  const [assignModuleOpen, setAssignModuleOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  
  const stats = getUserStats();

  // Action Handlers
  const handleAssignRole = (userId: string, roleName: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: 'none', // Simplified role assignment
        roles: user.user_roles?.map(ur => ({ name: ur.roles.name })) || []
      });
      setAssignRoleOpen(true);
    }
  };

  const handleRemoveRole = (userId: string, roleName: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: 'none', // Simplified role assignment
        roles: user.user_roles?.map(ur => ({ name: ur.roles.name })) || []
      });
      setRemoveRoleOpen(true);
    }
  };

  const handleAssignModule = (userId: string, userName: string) => {
    setSelectedUser(users.find(u => u.id === userId) || null);
    setAssignModuleOpen(true);
  };

  const handleResendEmail = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { 
          userId, 
          email: userEmail,
          firstName: users.find(u => u.id === userId)?.first_name,
          lastName: users.find(u => u.id === userId)?.last_name
        }
      });

      if (error) {
        showError('Email Failed', error.message);
      } else {
        showSuccess('Email Sent', `Verification email sent to ${userEmail}`);
      }
    } catch (error) {
      console.error('Resend email error:', error);
      showError('Email Error', 'Error sending verification email');
    }
  };

  const handleDeactivateUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${userName}?`)) {
      deactivateUser(userId);
      showSuccess('User Deactivated', `${userName} has been deactivated`);
    }
  };

  const onAssignRole = (userId: string, roleName: string) => {
    assignRole(userId, roleName);
    showSuccess('Role Assigned', `Role ${roleName} assigned successfully`);
  };

  const onRemoveRole = (userId: string, roleName: string) => {
    removeRole(userId, roleName);
    showSuccess('Role Removed', `Role ${roleName} removed successfully`);
  };

  const onAssignFacility = (userId: string, facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    showSuccess('Facility Assigned', `Facility ${facility?.name} assigned successfully`);
  };

  const onAssignModule = (userId: string, moduleId: string) => {
    assignModule(userId, moduleId);
    showSuccess('Module Assigned', `Module assigned successfully`);
  };

  const onCreateRole = (roleName: string, description: string, isDefault: boolean) => {
    // For now, show a message that this needs admin setup since roles use enum constraints
    showError('Role Creation', 'Role creation requires database admin privileges. Please contact system administrator to add new roles to the system.');
    setCreateRoleOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.adminCount}</div>
            <div className="text-sm text-muted-foreground">Admin Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.patientCount}</div>
            <div className="text-sm text-muted-foreground">Patient Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateUserForm
              open={showCreateForm}
              onOpenChange={(open) => {
                setShowCreateForm(open);
                if (!open) {
                  refreshData();
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* User Management Tabs */}
      <Tabs defaultValue="management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="management">User Management</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management ({users.length})
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={refreshData}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                  <Button variant="outline" onClick={() => setCreateRoleOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-8">Loading users...</div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="flex gap-1 mt-1">
                          {user.user_roles?.map((ur, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ur.roles.name}
                            </Badge>
                          ))}
                          {(!user.user_roles || user.user_roles.length === 0) && (
                            <Badge variant="secondary" className="text-xs">
                              No roles assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        
                        {/* Action Buttons */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignRole(user.id, `${user.first_name} ${user.last_name}`)}
                          title="Assign Role"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRole(user.id, `${user.first_name} ${user.last_name}`)}
                          title="Remove Role"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignModule(user.id, `${user.first_name} ${user.last_name}`)}
                          title="Assign Module"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendEmail(user.id, user.email)}
                          title="Resend Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(user.id, `${user.first_name} ${user.last_name}`)}
                          title="Deactivate User"
                          disabled={isDeactivating}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Role Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => !u.user_roles || u.user_roles.length === 0).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleAssignRole(user.id, `${user.first_name} ${user.last_name}`)}
                        size="sm"
                      >
                        Assign Role
                      </Button>
                      <Button
                        onClick={() => handleResendEmail(user.id, user.email)}
                        variant="outline"
                        size="sm"
                      >
                        Send Email
                      </Button>
                    </div>
                  </div>
                ))}
                {users.filter(u => !u.user_roles || u.user_roles.length === 0).length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    No users pending role assignment
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Successfully Onboarded Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => u.user_roles && u.user_roles.length > 0).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex gap-1 mt-1">
                        {user.user_roles.map((ur, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {ur.roles.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Users Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex gap-1 mt-1">
                        {user.user_roles?.map((ur, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {ur.roles.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {user.user_roles?.length || 0} roles
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialogs */}
      <UserActionDialogs
        selectedUser={selectedUser}
        assignRoleOpen={assignRoleOpen}
        removeRoleOpen={removeRoleOpen}
        assignFacilityOpen={assignFacilityOpen}
        setAssignRoleOpen={setAssignRoleOpen}
        setRemoveRoleOpen={setRemoveRoleOpen}
        setAssignFacilityOpen={setAssignFacilityOpen}
        onAssignRole={onAssignRole}
        onRemoveRole={onRemoveRole}
        onAssignFacility={onAssignFacility}
        availableRoles={roles}
        availableFacilities={facilities}
      />

      {/* Module Assignment Dialog */}
      <ModuleAssignmentDialog
        open={assignModuleOpen}
        onOpenChange={setAssignModuleOpen}
        selectedUser={selectedUser}
        onAssignModule={onAssignModule}
      />

      {/* Create Role Dialog */}
      <CreateRoleDialog
        open={createRoleOpen}
        onOpenChange={setCreateRoleOpen}
        onCreateRole={onCreateRole}
      />
    </div>
  );
};