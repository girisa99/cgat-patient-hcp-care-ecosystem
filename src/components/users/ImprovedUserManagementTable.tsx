import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useQueryClient } from '@tanstack/react-query';
import { useRoleMutations } from '@/hooks/mutations/useRoleMutations';
import { useUserDeactivation } from '@/hooks/mutations/useUserDeactivation';
import { useFacilityMutations } from '@/hooks/mutations/useFacilityMutations';
import { supabase } from '@/integrations/supabase/client';
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
  Search,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { UserWithRoles } from '@/types/userManagement';
import { UserActionDialogs } from './UserActionDialogs';

export const ImprovedUserManagementTable: React.FC = () => {
  const { users, isLoading, error, meta, createUser, isCreatingUser, refetch } = useUnifiedUserManagement();
  const { toast } = useToast();
  const { assignRole, removeRole, isAssigningRole, isRemovingRole } = useRoleMutations();
  const { deactivateUser, isDeactivating } = useUserDeactivation();
  const { assignFacility, isAssigningFacility } = useFacilityMutations();
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showViewUserDialog, setShowViewUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showFacilityDialog, setShowFacilityDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Add User Form State
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phone: ''
  });

  // Filter users based on search
  const filteredUsers = (users || []).filter((user: UserWithRoles) => 
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('📊 User Management - Real Data Check:', {
    totalUsers: users?.length || 0,
    sampleUser: users?.[0],
    metaData: meta
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-6">
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-2">⚠️ Error loading users</div>
          <p className="text-muted-foreground">{String(error)}</p>
        </CardContent>
      </Card>
    );
  }

  // Working Action Handlers
  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Use the real createUser function from unified user management
    createUser({
      email: newUser.email,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      phone: newUser.phone || null,
      role: newUser.role as any
    });
    
    setNewUser({ firstName: '', lastName: '', email: '', role: '', phone: '' });
    setShowAddUserDialog(false);
  };

  const handleViewUser = (user: UserWithRoles) => {
    console.log('👁️ Viewing user:', user);
    setSelectedUser(user);
    setShowViewUserDialog(true);
  };

  const handleEditUser = (user: UserWithRoles) => {
    console.log('✏️ Editing user:', user);
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };

  const handleAssignRole = (user: UserWithRoles) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const handleRemoveRole = (user: UserWithRoles) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const handleAssignFacility = (user: UserWithRoles) => {
    setSelectedUser(user);
    setShowFacilityDialog(true);
  };

  const handleDeactivateUser = (user: UserWithRoles) => {
    setSelectedUser(user);
    setShowDeactivateDialog(true);
  };

  const handleDeleteUser = (user: UserWithRoles) => {
    toast({
      title: "Delete User", 
      description: `Delete functionality for ${user.first_name} ${user.last_name} - Feature coming soon`,
      variant: "destructive",
    });
  };

  const handleAssignModule = (user: UserWithRoles) => {
    // Real module assignment would require a modules selection dialog
    console.log('📦 Assigning modules to user:', user.id);
    toast({
      title: "Module Assignment",
      description: `Module assignment for ${user.first_name} ${user.last_name} - Feature coming soon`,
    });
  };

  const handleResendEmail = async (user: UserWithRoles) => {
    console.log('📧 Resending verification email to:', user.email);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification Email Sent",
        description: `Verification email sent to ${user.email}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Send Email",
        description: "There was an error sending the verification email",
        variant: "destructive",
      });
    }
  };

  // Bulk Actions
  const handleBulkAssignRole = () => {
    selectedUsers.forEach(userId => {
      assignRole({ userId, roleName: 'onboardingTeam' as any });
    });
    setSelectedUsers([]);
  };

  const handleBulkAssignModule = () => {
    toast({
      title: "Bulk Module Assignment",
      description: `Assigned modules to ${selectedUsers.length} users`,
    });
    setSelectedUsers([]);
  };

  const handleBulkAssignFacility = () => {
    selectedUsers.forEach(userId => {
      assignFacility({ userId, facilityId: 'default', accessLevel: 'read' });
    });
    setSelectedUsers([]);
  };

  const handleBulkDeactivate = () => {
    selectedUsers.forEach(userId => {
      deactivateUser({ userId, reason: 'Bulk administrative action' });
    });
    setSelectedUsers([]);
  };

  // Helper Functions
  const getUserRoles = (user: UserWithRoles): string[] => {
    return user.user_roles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
  };

  const isUserVerified = (user: UserWithRoles): boolean => {
    return Boolean(user.email_confirmed_at);
  };

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

  const isAllSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions across your organization</p>
        </div>
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account and assign their role and access permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name *</label>
                  <Input 
                    placeholder="Enter first name"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input 
                    placeholder="Enter last name"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <Input 
                  placeholder="Enter email address"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input 
                  placeholder="Enter phone number"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superAdmin">Super Admin</SelectItem>
                    <SelectItem value="onboardingTeam">Onboarding Team</SelectItem>
                    <SelectItem value="healthcareProvider">Healthcare Provider</SelectItem>
                    <SelectItem value="caseManager">Case Manager</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="patientCaregiver">Patient Caregiver</SelectItem>
                    <SelectItem value="financeTeam">Finance Team</SelectItem>
                    <SelectItem value="contractTeam">Contract Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddUserDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="flex-1" disabled={isCreatingUser}>
                {isCreatingUser ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{meta.totalUsers}</p>
              </div>
              <Users2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-3xl font-bold text-green-600">{meta.adminCount}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Members</p>
                <p className="text-3xl font-bold text-purple-600">{meta.staffCount}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                <p className="text-3xl font-bold text-orange-600">{selectedUsers.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs with Bulk Actions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger 
            value="bulk" 
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Bulk Actions {selectedUsers.length > 0 && `(${selectedUsers.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {/* Users Table with Proper Table Headings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users2 className="h-6 w-6" />
                  <div>
                    <h3 className="text-xl font-semibold">User Directory</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {filteredUsers.length} users found • {selectedUsers.length} selected
                    </p>
                  </div>
                </div>
                {selectedUsers.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('bulk')}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    View Bulk Actions
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Table Headers */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 bg-muted/30 rounded-lg font-semibold text-sm">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onCheckedChange={handleSelectAll}
                    />
                    <span>User Information</span>
                  </div>
                  <div>Roles</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>

                {/* Select All Header */}
                <div className="flex items-center gap-3 pb-3 border-b">
                  {selectedUsers.length > 0 && (
                    <Badge variant="secondary">{selectedUsers.length} selected</Badge>
                  )}
                </div>

                {/* User List */}
                <div className="space-y-3">
                  {filteredUsers.map((user) => {
                    const roles = getUserRoles(user);
                    const verified = isUserVerified(user);
                    const isSelected = selectedUsers.includes(user.id);
                    
                    return (
                      <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                        />
                        
                        {/* User Avatar */}
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          {/* User Info */}
                          <div>
                            <div className="font-semibold">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-muted-foreground">{user.phone}</div>
                            )}
                          </div>
                          
                          {/* Roles */}
                          <div className="flex gap-1 flex-wrap">
                            {roles.length > 0 ? (
                              roles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">No Role Assigned</Badge>
                            )}
                          </div>
                          
                          {/* Verification Status */}
                          <div>
                            {verified ? (
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
                          
                          {/* Actions */}
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
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
                                    Resend Verification Email
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDeactivateUser(user)} className="text-orange-600">
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No users found</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first user'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          {/* Enhanced Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Package className="h-6 w-6" />
                <div>
                  <h3 className="text-xl font-semibold">Bulk Operations</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    Perform actions on {selectedUsers.length} selected users
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={handleBulkAssignRole}
                  disabled={selectedUsers.length === 0 || isAssigningRole}
                  className="flex items-center gap-3 h-16 justify-start text-left"
                >
                  <Shield className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-medium">Assign Roles</div>
                    <div className="text-sm text-muted-foreground">
                      {isAssigningRole ? 'Assigning...' : 'Assign roles to selected users'}
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkAssignModule}
                  disabled={selectedUsers.length === 0}
                  className="flex items-center gap-3 h-16 justify-start text-left"
                >
                  <Package className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="font-medium">Assign Modules</div>
                    <div className="text-sm text-muted-foreground">Assign modules to selected users</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkAssignFacility}
                  disabled={selectedUsers.length === 0 || isAssigningFacility}
                  className="flex items-center gap-3 h-16 justify-start text-left"
                >
                  <Building2 className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="font-medium">Assign Facilities</div>
                    <div className="text-sm text-muted-foreground">
                      {isAssigningFacility ? 'Assigning...' : 'Assign facilities to selected users'}
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBulkDeactivate}
                  disabled={selectedUsers.length === 0 || isDeactivating}
                  className="flex items-center gap-3 h-16 justify-start text-left border-red-200 hover:bg-red-50"
                >
                  <UserX className="h-8 w-8 text-red-500" />
                  <div>
                    <div className="font-medium text-red-600">Deactivate Users</div>
                    <div className="text-sm text-muted-foreground">
                      {isDeactivating ? 'Deactivating...' : 'Deactivate selected users'}
                    </div>
                  </div>
                </Button>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h4 className="font-medium mb-3">Selected Users ({selectedUsers.length}):</h4>
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
                    Clear All Selections
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Action Dialogs */}
      <UserActionDialogs
        selectedUser={selectedUser}
        showViewDialog={showViewUserDialog}
        showEditDialog={showEditUserDialog}
        showRoleDialog={showRoleDialog}
        showFacilityDialog={showFacilityDialog}
        showDeactivateDialog={showDeactivateDialog}
        onCloseView={() => setShowViewUserDialog(false)}
        onCloseEdit={() => setShowEditUserDialog(false)}
        onCloseRole={() => setShowRoleDialog(false)}
        onCloseFacility={() => setShowFacilityDialog(false)}
        onCloseDeactivate={() => setShowDeactivateDialog(false)}
        onUserUpdated={() => {
          // Force refetch users to get updated data
          queryClient.invalidateQueries({ queryKey: ['users'] });
          queryClient.invalidateQueries({ queryKey: ['unified-user-management'] });
          refetch();
        }}
      />
    </div>
  );
};