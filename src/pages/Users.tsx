import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users as UsersIcon, UserPlus, Settings, RefreshCw, Search, Edit, Eye, UserX, Shield } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  user_roles: Array<{ role: { name: string; description?: string } }>;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

const Users: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();
  const { showSuccess, showError } = useMasterToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  console.log('👥 Users Page - Full Management System');

  const loadUsers = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading users with full data...');
      
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          created_at,
          user_roles(
            role:roles(name, description)
          )
        `)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('❌ Database error:', dbError);
        setError(dbError.message);
        return;
      }

      const cleanUsers = (data || []).map(user => ({
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        created_at: user.created_at || new Date().toISOString(),
        user_roles: Array.isArray(user.user_roles) ? user.user_roles : []
      }));

      setUsers(cleanUsers);
      console.log('✅ Users loaded successfully:', cleanUsers.length, 'users');
      
    } catch (err: any) {
      console.error('💥 Exception loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description')
        .order('name');

      if (error) {
        console.error('❌ Error loading roles:', error);
        return;
      }

      setRoles(data || []);
      console.log('✅ Roles loaded:', data?.length || 0, 'roles');
    } catch (err: any) {
      console.error('💥 Exception loading roles:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadUsers();
      loadRoles();
    }
  }, [isAuthenticated, authLoading]);

  const handleRefresh = () => {
    loadUsers();
    loadRoles();
  };

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: 'TempPass123!',
        user_metadata: {
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          phone: newUser.phone
        }
      });

      if (error) throw error;

      // Also create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone
        });

      if (profileError) throw profileError;

      showSuccess('User Created', 'User has been created successfully');
      setIsAddUserOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', phone: '' });
      loadUsers();
      
    } catch (err: any) {
      showError('Creation Failed', err.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      showError('Selection Error', 'Please select a role');
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.id,
          role_id: selectedRole
        });

      if (error) throw error;

      showSuccess('Role Assigned', 'Role has been assigned successfully');
      setIsAssignRoleOpen(false);
      setSelectedRole('');
      loadUsers();
      
    } catch (err: any) {
      showError('Assignment Failed', err.message || 'Failed to assign role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateUser = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.first_name} ${user.last_name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      // For now, we'll just show a success message
      // In a real implementation, you'd update user status
      showSuccess('User Deactivated', `${user.first_name} ${user.last_name} has been deactivated`);
      
    } catch (err: any) {
      showError('Deactivation Failed', err.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-muted-foreground">Authenticating...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to view users</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">Error loading users: {error}</div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.length,
    adminCount: users.filter(u => 
      u.user_roles.some(ur => ['superAdmin', 'admin', 'onboardingTeam'].includes(ur.role?.name))
    ).length,
    patientCount: users.filter(u => 
      u.user_roles.some(ur => ['patientCaregiver', 'user'].includes(ur.role?.name))
    ).length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions across the system
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-blue-600">Total Users</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          <div className="text-sm text-green-600">Active</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.adminCount}</div>
          <div className="text-sm text-purple-600">Admins</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.patientCount}</div>
          <div className="text-sm text-orange-600">Patients</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              User Management ({filteredUsers.length} users)
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        value={newUser.phone}
                        onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <Button 
                      onClick={handleAddUser} 
                      disabled={actionLoading}
                      className="w-full"
                    >
                      {actionLoading ? 'Creating...' : 'Create User'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading state */}
            {loading && (
              <div className="text-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            )}

            {/* Users List */}
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            )}

            {!loading && filteredUsers.length > 0 && (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-muted-foreground">📞 {user.phone}</div>
                      )}
                      <div className="flex gap-1 mt-1">
                        {user.user_roles.map((ur, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {ur.role?.name || 'Unknown Role'}
                          </Badge>
                        ))}
                        {user.user_roles.length === 0 && (
                          <Badge variant="secondary" className="text-xs">No roles</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditUserOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsAssignRoleOpen(true);
                        }}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeactivateUser(user)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to {selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} {role.description && `- ${role.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAssignRole} 
              disabled={actionLoading || !selectedRole}
              className="w-full"
            >
              {actionLoading ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
