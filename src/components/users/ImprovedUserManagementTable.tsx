
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMasterUserManagement, type MasterUser } from '@/hooks/useMasterUserManagement';
import { UserPlus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MasterUserFormState } from '@/types/masterFormState';
import { createCompleteFormState, updateFormState } from '@/utils/formStateUtils';

export const ImprovedUserManagementTable: React.FC = () => {
  const { 
    users, isLoading, error, meta, refetch,
    createUser, isCreatingUser,
    assignRole, removeRole, isAssigningRole, isRemovingRole,
    assignFacility, isAssigningFacility,
    deactivateUser, isDeactivating
  } = useMasterUserManagement();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState<MasterUserFormState>(createCompleteFormState());

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => 
    (users || []).filter((user: MasterUser) => 
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

  const handleAddUser = useCallback(() => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createUser(newUser);
    setNewUser(createCompleteFormState());
    setShowAddUserDialog(false);
  }, [newUser, createUser, toast]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions across your organization</p>
        </div>
        <Button 
          onClick={() => setShowAddUserDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{meta.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patients</p>
                <p className="text-2xl font-bold">{meta.patientCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff</p>
                <p className="text-2xl font-bold">{meta.staffCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{meta.adminCount}</p>
              </div>
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

      {/* Add User Form */}
      {showAddUserDialog && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name *</label>
                  <Input 
                    placeholder="Enter first name"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => updateFormState(prev, { firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input 
                    placeholder="Enter last name"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => updateFormState(prev, { lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <Input 
                  placeholder="Enter email address"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => updateFormState(prev, { email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input 
                  placeholder="Enter phone number"
                  value={newUser.phone || ''}
                  onChange={(e) => setNewUser(prev => updateFormState(prev, { phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <Input 
                  placeholder="Enter role"
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => updateFormState(prev, { role: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddUserDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="flex-1" disabled={isCreatingUser}>
                {isCreatingUser ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">User Directory</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {filteredUsers.length} users found
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* User List */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-muted-foreground">No users found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first user'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
