import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { UserWithRoles } from '@/types/userManagement';

export const EnhancedUserManagementTable: React.FC = () => {
  console.log('🎨 Enhanced UserManagementTable rendering');
  const { users, isLoading, error, meta } = useUnifiedUserManagement();
  console.log('🎨 Enhanced Debug - users:', users?.length || 0, 'isLoading:', isLoading, 'error:', error);
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users || [];
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((user: UserWithRoles) => 
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter((user: UserWithRoles) => {
        const userRoles = user.user_roles?.map((ur: any) => ur.roles?.name) || [];
        return userRoles.includes(filterRole);
      });
    }
    
    return filtered;
  }, [users, searchQuery, filterRole]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading users...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">Error loading user data</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-red-600 mb-2">⚠️ Error loading users</div>
              <p className="text-muted-foreground">{String(error)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
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
      setSelectedUsers(filteredUsers.map(user => user.id));
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

  const isAllSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;

  return (
    <div className="space-y-6">
      {/* Header with Enhanced Styling */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, roles, modules, and permissions across your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddUser} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{meta.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <Users2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{meta.adminCount}</div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{meta.staffCount}</div>
                <div className="text-sm text-muted-foreground">Staff</div>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{meta.patientCount}</div>
                <div className="text-sm text-muted-foreground">Patients</div>
              </div>
              <Building2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by Role
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterRole('all')}>
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole('superAdmin')}>
                  Super Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole('onboardingTeam')}>
                  Onboarding Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole('healthcareProvider')}>
                  Healthcare Provider
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole('patientCaregiver')}>
                  Patient Caregiver
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs for Users and Bulk Operations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger 
            value="bulk" 
            disabled={selectedUsers.length === 0}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Bulk Actions {selectedUsers.length > 0 && `(${selectedUsers.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Enhanced Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users2 className="h-5 w-5" />
                  Users
                  <Badge variant="outline">{filteredUsers.length} found</Badge>
                </div>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedUsers.length} selected</Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('bulk')}
                    >
                      View Bulk Actions
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium w-12">
                        <Checkbox
                          checked={isAllSelected}
                          indeterminate={isIndeterminate}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Roles</th>
                      <th className="text-left p-4 font-medium">Facility</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const roles = getUserRoles(user);
                      const verified = isUserVerified(user);
                      const isSelected = selectedUsers.includes(user.id);
                      
                      return (
                        <tr key={user.id} className="border-b hover:bg-muted/25 transition-colors">
                          <td className="p-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {user.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="text-sm font-medium">{user.email}</div>
                              {user.phone && (
                                <div className="text-sm text-muted-foreground">{user.phone}</div>
                              )}
                            </div>
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
                            <div className="flex items-center gap-2">
                              {verified ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <X className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              {/* Primary Actions */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                                className="h-8 w-8 p-0"
                                title="View User"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
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
                                    variant="ghost"
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
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">No users found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery || filterRole !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Get started by adding your first user'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          {/* Enhanced Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bulk Actions
                <Badge variant="secondary">{selectedUsers.length} users selected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={handleBulkAssignRole}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-2 h-20 flex-col border-2 hover:border-primary"
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Assign Role</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkAssignModule}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-2 h-20 flex-col border-2 hover:border-primary"
                >
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Assign Module</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkAssignFacility}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-2 h-20 flex-col border-2 hover:border-primary"
                >
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Assign Facility</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkDeactivate}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-2 h-20 flex-col border-2 hover:border-destructive text-destructive"
                >
                  <UserX className="h-6 w-6" />
                  <span className="text-sm">Deactivate</span>
                </Button>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3">Selected Users:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedUsers.map(userId => {
                      const user = filteredUsers.find(u => u.id === userId);
                      return user ? (
                        <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                          {user.first_name} {user.last_name}
                          <button
                            onClick={() => handleSelectUser(userId, false)}
                            className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
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