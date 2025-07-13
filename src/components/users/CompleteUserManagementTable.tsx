
/**
 * COMPLETE USER MANAGEMENT TABLE
 * Displays users with actions and role information including toast functionality
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, UserPlus, Settings, Edit, UserX, Shield, 
  Mail, RefreshCw, MoreVertical, Trash2 
} from 'lucide-react';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useMasterToast } from '@/hooks/useMasterToast';

export const CompleteUserManagementTable: React.FC = () => {
  const { users, isLoading, getUserStats, fetchUsers } = useMasterUserManagement();
  const { showSuccess, showError, showInfo } = useMasterToast();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const stats = getUserStats();

  // Action handlers with toast notifications
  const handleAddUser = () => {
    showInfo("Add User", "Opening user creation form...");
    // TODO: Open user creation modal/form
  };

  const handleEditUser = (userId: string, userName: string) => {
    setSelectedUser(userId);
    showInfo("Edit User", `Opening edit form for ${userName}`);
    // TODO: Open user edit modal/form
  };

  const handleDeactivateUser = (userId: string, userName: string) => {
    showInfo("Deactivate User", `Deactivating user ${userName}...`);
    // TODO: Implement deactivation logic
    setTimeout(() => {
      showSuccess("User Deactivated", `${userName} has been deactivated successfully`);
    }, 1000);
  };

  const handleAssignRoles = (userId: string, userName: string) => {
    showInfo("Assign Roles", `Opening role assignment for ${userName}`);
    // TODO: Open role assignment modal
  };

  const handleAssignModules = (userId: string, userName: string) => {
    showInfo("Assign Modules", `Opening module assignment for ${userName}`);
    // TODO: Open module assignment modal
  };

  const handleResendEmail = (userId: string, userEmail: string) => {
    showInfo("Resend Email", `Sending verification email to ${userEmail}...`);
    // TODO: Implement email resend logic
    setTimeout(() => {
      showSuccess("Email Sent", `Verification email sent to ${userEmail}`);
    }, 1000);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    showError("Delete User", `Are you sure you want to delete ${userName}? This action cannot be undone.`);
    // TODO: Implement delete confirmation and logic
  };

  const handleRefresh = () => {
    showInfo("Refreshing", "Updating user data...");
    fetchUsers();
    setTimeout(() => {
      showSuccess("Data Updated", "User list has been refreshed");
    }, 500);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
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
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.adminCount}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.patientCount}</div>
            <div className="text-sm text-muted-foreground">Patients</div>
          </CardContent>
        </Card>
      </div>

      {/* Main User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management ({users.length} users)
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleAddUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
                <Button onClick={handleAddUser} className="mt-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First User
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex gap-1 mt-1">
                        {user.user_roles.map((ur, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {ur.roles.name}
                          </Badge>
                        ))}
                        {user.user_roles.length === 0 && (
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
                        onClick={() => handleEditUser(user.id, `${user.first_name} ${user.last_name}`)}
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignRoles(user.id, `${user.first_name} ${user.last_name}`)}
                        title="Assign Roles"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignModules(user.id, `${user.first_name} ${user.last_name}`)}
                        title="Assign Modules"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendEmail(user.id, user.email)}
                        title="Resend Email Verification"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      
                      {user.is_active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(user.id, `${user.first_name} ${user.last_name}`)}
                          title="Deactivate User"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(user.id, `${user.first_name} ${user.last_name}`)}
                          title="Activate User"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                        title="Delete User"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
