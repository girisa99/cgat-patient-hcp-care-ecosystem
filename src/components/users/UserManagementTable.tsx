import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { UserPlus, Edit, Trash2, Shield, Building2, Check, X } from 'lucide-react';
import type { UserWithRoles } from '@/types/userManagement';

export const UserManagementTable: React.FC = () => {
  const { users, isLoading, error, meta } = useUnifiedUserManagement();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Error loading users: {String(error)}</p>
        </CardContent>
      </Card>
    );
  }

  const handleAddUser = () => {
    console.log('Add user clicked');
    // TODO: Open add user dialog
  };

  const handleEditUser = (user: UserWithRoles) => {
    console.log('Edit user:', user.id);
    // TODO: Open edit user dialog
  };

  const handleDeleteUser = (user: UserWithRoles) => {
    console.log('Delete user:', user.id);
    // TODO: Open delete confirmation dialog
  };

  const handleManageRoles = (user: UserWithRoles) => {
    console.log('Manage roles for user:', user.id);
    // TODO: Open role management dialog
  };

  const handleAssignFacility = (user: UserWithRoles) => {
    console.log('Assign facility for user:', user.id);
    // TODO: Open facility assignment dialog
  };

  const getUserRoles = (user: UserWithRoles): string[] => {
    return user.user_roles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
  };

  const isUserVerified = (user: UserWithRoles): boolean => {
    return Boolean(user.email_confirmed_at);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add User Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{meta.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{meta.adminCount}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{meta.staffCount}</div>
            <div className="text-sm text-muted-foreground">Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{meta.patientCount}</div>
            <div className="text-sm text-muted-foreground">Patients</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Users
            <Badge variant="outline">{users.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Roles</th>
                  <th className="text-left p-4 font-medium">Facility</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Verified</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roles = getUserRoles(user);
                  const verified = isUserVerified(user);
                  
                  return (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {roles.length > 0 ? (
                            roles.map((role) => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              No Role
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {user.facilities ? (
                            <Badge variant="outline" className="text-xs">
                              {user.facilities.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No Facility</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.created_at ? 'default' : 'secondary'}>
                          {user.created_at ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {verified ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageRoles(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignFacility(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Building2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};