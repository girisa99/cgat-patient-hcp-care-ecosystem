
/**
 * User Management Page - Comprehensive user management with onboarding workflow
 * Combines user management with onboarding dashboard, workflow tabs, and status tracking
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Shield,
  Mail,
  Settings
} from "lucide-react";
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useMasterData } from '@/hooks/useMasterData';
import AppLayout from '@/components/layout/AppLayout';
import { CreateUserForm } from '@/components/forms/CreateUserForm';
import { MasterApplicationTable } from '@/components/master/MasterApplicationTable';
import { UserActionDialogs } from '@/components/users/UserActionDialogs';
import { BulkActionsTab } from '@/components/users/BulkActionsTab';
import { useUserManagementDialogs } from '@/hooks/useUserManagementDialogs';
import { getErrorMessage } from '@/utils/errorHandling';

const UserManagement = () => {
  const { isAuthenticated, user } = useMasterAuth();
  const { 
    users, 
    isLoading, 
    error, 
    assignRole, 
    removeRole,
    assignFacility,
    deactivateUser,
    refreshData,
    isAssigningRole,
    isAssigningFacility,
    isDeactivating
  } = useMasterUserManagement();
  const { facilities, roles } = useMasterData();
  
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('management');
  
  // Use existing dialog management hook
  const {
    assignRoleOpen,
    setAssignRoleOpen,
    removeRoleOpen,
    setRemoveRoleOpen,
    assignFacilityOpen,
    setAssignFacilityOpen,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    setSelectedUser
  } = useUserManagementDialogs();

  // Categorize users by onboarding status
  const pendingUsers = users.filter(u => u.user_roles.length === 0);
  const completeUsers = users.filter(u => u.user_roles.length > 0);

  const handleCreateUser = () => {
    setShowCreateUser(true);
  };

  // Use existing functionality
  const handleAssignRole = (userId: string, roleName: string) => {
    assignRole(userId, roleName);
  };

  const handleRemoveRole = (userId: string, roleName: string) => {
    removeRole(userId, roleName);
  };

  const handleAssignFacility = (userId: string, facilityId: string) => {
    console.log('Assign facility:', facilityId, 'to user:', userId);
    // assignFacility(); // Will implement proper facility assignment
  };

  const handleBulkAssignRole = () => {
    // Implementation for bulk role assignment
    console.log('Bulk assign role to:', selectedUsers);
  };

  const handleBulkAssignModule = () => {
    // Implementation for bulk module assignment
    console.log('Bulk assign module to:', selectedUsers);
  };

  const handleBulkAssignFacility = () => {
    // Implementation for bulk facility assignment
    console.log('Bulk assign facility to:', selectedUsers);
  };

  const handleBulkDeactivate = () => {
    selectedUsers.forEach(userId => deactivateUser(userId));
    setSelectedUsers([]);
  };

  const handleDeselectUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const handleRefresh = () => {
    refreshData();
  };

  const userStats = {
    totalUsers: users.length,
    pendingRoles: pendingUsers.length,
    completed: completeUsers.length,
    facilities: facilities.length
  };

  return (
    <AppLayout title="User Management">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage users, roles, and onboarding workflow</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateUser} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create New User
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{getErrorMessage(error)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Management Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{userStats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{userStats.pendingRoles}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{userStats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{userStats.facilities}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Management
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Roles ({userStats.pendingRoles})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({userStats.completed})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Users ({userStats.totalUsers})
            </TabsTrigger>
          </TabsList>

          {/* User Management Table */}
          <TabsContent value="management">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MasterApplicationTable />
                </CardContent>
              </Card>
              
              {/* Bulk Actions Tab - Existing Component */}
              <BulkActionsTab
                selectedUsers={selectedUsers}
                users={users as any}
                onBulkAssignRole={handleBulkAssignRole}
                onBulkAssignModule={handleBulkAssignModule}
                onBulkAssignFacility={handleBulkAssignFacility}
                onBulkDeactivate={handleBulkDeactivate}
                onDeselectUser={handleDeselectUser}
                onClearSelection={handleClearSelection}
                isAssigningRole={isAssigningRole}
                isAssigningFacility={isAssigningFacility}
                isDeactivating={isDeactivating}
              />
            </div>
          </TabsContent>

          {/* Pending Role Assignment */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Users Pending Role Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-semibold mb-2">All users have roles assigned</h3>
                    <p>No users are pending role assignment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <Badge variant="secondary" className="mt-1">
                              No roles assigned
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser({
                                id: user.id,
                                firstName: user.first_name,
                                lastName: user.last_name,
                                email: user.email,
                                role: 'none'
                              });
                              setAssignRoleOpen(true);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Assign Role
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('Send email to:', user.email)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Users */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Successfully Onboarded Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completeUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">No completed onboarding yet</h3>
                    <p>Users with roles assigned will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completeUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-1">
                                {user.user_roles.map((ur, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {ur.roles.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge variant="default" className="text-green-700 bg-green-200">
                          Onboarded
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Users */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => {
                    const hasRoles = user.user_roles.length > 0;
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-1">
                                {user.user_roles.length > 0 ? (
                                  user.user_roles.map((ur, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {ur.roles.name}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    No roles
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasRoles ? (
                            <Badge variant="default" className="text-green-700 bg-green-200">
                              Has Roles
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Needs Roles
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create User Dialog */}
        <CreateUserForm 
          open={showCreateUser} 
          onOpenChange={setShowCreateUser}
        />
        
        {/* User Action Dialogs - Existing Component */}
        <UserActionDialogs
          selectedUser={selectedUser}
          assignRoleOpen={assignRoleOpen}
          removeRoleOpen={removeRoleOpen}
          assignFacilityOpen={assignFacilityOpen}
          setAssignRoleOpen={setAssignRoleOpen}
          setRemoveRoleOpen={setRemoveRoleOpen}
          setAssignFacilityOpen={setAssignFacilityOpen}
          onAssignRole={handleAssignRole}
          onRemoveRole={handleRemoveRole}
          onAssignFacility={handleAssignFacility}
          availableRoles={roles}
          availableFacilities={facilities}
        />
      </div>
    </AppLayout>
  );
};

export default UserManagement;
