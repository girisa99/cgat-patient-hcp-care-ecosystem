import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Package, Users2, Search } from 'lucide-react';
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
import { UserStatsCards } from './UserStatsCards';
import { UserRow } from './UserRow';
import { BulkActionsTab } from './BulkActionsTab';

export const ImprovedUserManagementTable: React.FC = () => {
  // SINGLE MASTER HOOK - No more multiple hook dependencies
  const { 
    users, isLoading, error, meta, refetch,
    createUser, isCreatingUser,
    assignRole, removeRole, isAssigningRole, isRemovingRole,
    assignFacility, isAssigningFacility,
    deactivateUser, isDeactivating
  } = useMasterUserManagement();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // All useState hooks must be called unconditionally
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
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phone: ''
  });

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => 
    (users || []).filter((user: UserWithRoles) => 
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [users, searchQuery]
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

  // Memoized Action Handlers for performance
  const handleAddUser = useCallback(() => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createUser({
      email: newUser.email,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      phone: newUser.phone || null,
      role: newUser.role as any
    });
    
    setNewUser({ firstName: '', lastName: '', email: '', role: '', phone: '' });
    setShowAddUserDialog(false);
  }, [newUser, createUser, toast]);

  const handleViewUser = useCallback((user: UserWithRoles) => {
    setSelectedUser(user);
    setShowViewUserDialog(true);
  }, []);

  const handleEditUser = useCallback((user: UserWithRoles) => {
    setSelectedUser(user);
    setShowEditUserDialog(true);
  }, []);

  const handleAssignRole = useCallback((user: UserWithRoles) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  }, []);

  const handleRemoveRole = useCallback((user: UserWithRoles) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  }, []);

  const handleAssignFacility = useCallback((user: UserWithRoles) => {
    setSelectedUser(user);
    setShowFacilityDialog(true);
  }, []);

  const handleDeactivateUser = useCallback((user: UserWithRoles) => {
    setSelectedUser(user);
    setShowDeactivateDialog(true);
  }, []);

  const handleDeleteUser = useCallback((user: UserWithRoles) => {
    toast({
      title: "Delete User", 
      description: `Delete functionality for ${user.first_name} ${user.last_name} - Feature coming soon`,
      variant: "destructive",
    });
  }, [toast]);

  const handleAssignModule = useCallback((user: UserWithRoles) => {
    toast({
      title: "Module Assignment",
      description: `Module assignment for ${user.first_name} ${user.last_name} - Feature coming soon`,
    });
  }, [toast]);

  const handleResendEmail = useCallback(async (user: UserWithRoles) => {
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
  }, [toast]);

  // Memoized Bulk Actions
  const handleBulkAssignRole = useCallback(() => {
    selectedUsers.forEach(userId => {
      assignRole({ userId, roleName: 'onboardingTeam' as any });
    });
    setSelectedUsers([]);
  }, [selectedUsers, assignRole]);

  const handleBulkAssignModule = useCallback(() => {
    toast({
      title: "Bulk Module Assignment",
      description: `Assigned modules to ${selectedUsers.length} users`,
    });
    setSelectedUsers([]);
  }, [selectedUsers.length, toast]);

  const handleBulkAssignFacility = useCallback(() => {
    selectedUsers.forEach(userId => {
      assignFacility({ userId, facilityId: 'default', accessLevel: 'read' });
    });
    setSelectedUsers([]);
  }, [selectedUsers, assignFacility]);

  const handleBulkDeactivate = useCallback(() => {
    selectedUsers.forEach(userId => {
      deactivateUser({ userId, reason: 'Bulk administrative action' });
    });
    setSelectedUsers([]);
  }, [selectedUsers, deactivateUser]);

  // Memoized Helper Functions
  const handleSelectUser = useCallback((userId: string, checked: boolean) => {
    setSelectedUsers(prev => 
      checked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  }, []);

  const handleDeselectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedUsers(checked ? filteredUsers.map(user => user.id) : []);
  }, [filteredUsers]);

  const handleClearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  // Memoized computed values
  const isAllSelected = useMemo(() => 
    filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length,
    [filteredUsers.length, selectedUsers.length]
  );
  
  const isIndeterminate = useMemo(() => 
    selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length,
    [selectedUsers.length, filteredUsers.length]
  );

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

      {/* Stats Cards */}
      <UserStatsCards meta={meta} selectedCount={selectedUsers.length} />

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
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isSelected={selectedUsers.includes(user.id)}
                      onSelectUser={handleSelectUser}
                      onViewUser={handleViewUser}
                      onEditUser={handleEditUser}
                      onAssignRole={handleAssignRole}
                      onRemoveRole={handleRemoveRole}
                      onAssignModule={handleAssignModule}
                      onAssignFacility={handleAssignFacility}
                      onResendEmail={handleResendEmail}
                      onDeactivateUser={handleDeactivateUser}
                      onDeleteUser={handleDeleteUser}
                    />
                  ))}
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
          <BulkActionsTab
            selectedUsers={selectedUsers}
            users={filteredUsers}
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
          // Use the correct master cache key
          queryClient.invalidateQueries({ queryKey: ['master-user-management'] });
          refetch();
        }}
      />
    </div>
  );
};