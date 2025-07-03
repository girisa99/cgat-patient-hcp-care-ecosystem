import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Building2, 
  Check, 
  X, 
  Eye,
  Mail,
  UserX,
  Package,
  Users2,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserWithRoles } from '@/types/userManagement';

export const UserManagementTable: React.FC = () => {
  console.log('📊 UserManagementTable rendering');
  const { users, isLoading, error, meta } = useUnifiedUserManagement();
  console.log('📊 Debug - users:', users.length, 'isLoading:', isLoading, 'error:', error);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('users');

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

  // Action Handlers
  const handleAddUser = () => {
    console.log('🆕 Add user clicked');
    // TODO: Open add user dialog
  };

  const handleViewUser = (user: UserWithRoles) => {
    console.log('👁️ View user:', user.id);
    // TODO: Open user details dialog
  };

  const handleEditUser = (user: UserWithRoles) => {
    console.log('✏️ Edit user:', user.id);
    // TODO: Open edit user dialog
  };

  const handleDeactivateUser = (user: UserWithRoles) => {
    console.log('🚫 Deactivate user:', user.id);
    // TODO: Open deactivation confirmation dialog
  };

  const handleDeleteUser = (user: UserWithRoles) => {
    console.log('🗑️ Delete user:', user.id);
    // TODO: Open delete confirmation dialog
  };

  const handleAssignRole = (user: UserWithRoles) => {
    console.log('👤 Assign role to user:', user.id);
    // TODO: Open role assignment dialog
  };

  const handleRemoveRole = (user: UserWithRoles) => {
    console.log('➖ Remove role from user:', user.id);
    // TODO: Open role removal dialog
  };

  const handleAssignModule = (user: UserWithRoles) => {
    console.log('📦 Assign module to user:', user.id);
    // TODO: Open module assignment dialog
  };

  const handleAssignFacility = (user: UserWithRoles) => {
    console.log('🏢 Assign facility to user:', user.id);
    // TODO: Open facility assignment dialog
  };

  const handleResendEmail = (user: UserWithRoles) => {
    console.log('📧 Resend verification email to user:', user.id);
    // TODO: Resend verification email
  };

  // Bulk Operations
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAssignRole = () => {
    console.log('👥 Bulk assign role to users:', selectedUsers);
    // TODO: Open bulk role assignment dialog
  };

  const handleBulkAssignModule = () => {
    console.log('📦 Bulk assign module to users:', selectedUsers);
    // TODO: Open bulk module assignment dialog
  };

  const handleBulkAssignFacility = () => {
    console.log('🏢 Bulk assign facility to users:', selectedUsers);
    // TODO: Open bulk facility assignment dialog
  };

  const handleBulkDeactivate = () => {
    console.log('🚫 Bulk deactivate users:', selectedUsers);
    // TODO: Open bulk deactivation confirmation dialog
  };

  // Helper Functions
  const getUserRoles = (user: UserWithRoles): string[] => {
    return user.user_roles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
  };

  const isUserVerified = (user: UserWithRoles): boolean => {
    return Boolean(user.email_confirmed_at);
  };

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <div className="space-y-6">
      {/* Header with Add User Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage users, roles, modules, and permissions</p>
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

      {/* Tabs for Users and Bulk Operations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="bulk" disabled={selectedUsers.length === 0}>
            Bulk Actions {selectedUsers.length > 0 && `(${selectedUsers.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Users
                  <Badge variant="outline">{users.length} total</Badge>
                </div>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedUsers.length} selected</Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('bulk')}
                    >
                      Bulk Actions
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium w-12">
                        <Checkbox
                          checked={isAllSelected}
                          indeterminate={isIndeterminate}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
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
                      const isSelected = selectedUsers.includes(user.id);
                      
                      return (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                            />
                          </td>
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
                            <div className="flex items-center gap-1">
                              {/* Primary Actions */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                                className="h-8 w-8 p-0"
                                title="View User"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="h-8 w-8 p-0"
                                title="Edit User"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>

                              {/* More Actions Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleAssignRole(user)}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Assign Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRemoveRole(user)}>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Remove Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAssignModule(user)}>
                                    <Package className="h-4 w-4 mr-2" />
                                    Assign Module
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAssignFacility(user)}>
                                    <Building2 className="h-4 w-4 mr-2" />
                                    Assign Facility
                                  </DropdownMenuItem>
                                  {!verified && (
                                    <DropdownMenuItem onClick={() => handleResendEmail(user)}>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Resend Email
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleDeactivateUser(user)}
                                    className="text-orange-600"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          {/* Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5" />
                Bulk Actions
                <Badge variant="secondary">{selectedUsers.length} users selected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={handleBulkAssignRole}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-2 h-20 flex-col"
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Assign Role</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkAssignModule}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-2 h-20 flex-col"
                >
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Assign Module</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkAssignFacility}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-2 h-20 flex-col"
                >
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Assign Facility</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkDeactivate}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-2 h-20 flex-col text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <UserX className="h-6 w-6" />
                  <span className="text-sm">Deactivate</span>
                </Button>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Selected Users:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(userId => {
                      const user = users.find(u => u.id === userId);
                      return user ? (
                        <Badge key={userId} variant="secondary">
                          {user.first_name} {user.last_name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                    className="mt-2"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};