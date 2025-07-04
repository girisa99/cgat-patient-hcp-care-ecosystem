
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, UserCheck, UserX, Trash2 } from 'lucide-react';
import { useMasterUserManagement, type MasterUser } from '@/hooks/useMasterUserManagement';
import { useMasterToast } from '@/hooks/useMasterToast';
import type { UserManagementFormState } from '@/types/formState';
import { normalizeMasterFormState } from '@/types/formState';

export const MasterUserManagementTable: React.FC = () => {
  console.log('🔧 MasterUserManagementTable - Master Consolidation Pattern Active');
  
  const userManagement = useMasterUserManagement();
  const { showSuccess, showError } = useMasterToast();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [newUserForm, setNewUserForm] = useState<UserManagementFormState>({
    firstName: '',
    lastName: '',
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    phone: ''
  });

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return userManagement.users;
    
    return userManagement.users.filter((user: MasterUser) =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userManagement.users, searchTerm]);

  const handleAddUser = useCallback(async () => {
    if (!newUserForm.firstName || !newUserForm.lastName || !newUserForm.email || !newUserForm.role) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const normalizedForm = normalizeMasterFormState(newUserForm);
      await userManagement.createUser(normalizedForm);
      showSuccess('User Created', `Successfully created user ${newUserForm.firstName} ${newUserForm.lastName}`);
      
      setNewUserForm({
        firstName: '',
        lastName: '',
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        phone: ''
      });
      setIsAddingUser(false);
    } catch (error) {
      showError('Creation Failed', 'Failed to create user');
    }
  }, [newUserForm, userManagement, showSuccess, showError]);

  const handleUpdateUser = useCallback(async (userId: string, updates: Partial<UserManagementFormState>) => {
    try {
      const normalizedUpdates = normalizeMasterFormState(updates);
      await userManagement.updateUser(userId, normalizedUpdates);
      showSuccess('User Updated', 'User information updated successfully');
      setEditingUserId(null);
    } catch (error) {
      showError('Update Failed', 'Failed to update user');
    }
  }, [userManagement, showSuccess, showError]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userManagement.deleteUser(userId);
      showSuccess('User Deleted', 'User deleted successfully');
    } catch (error) {
      showError('Deletion Failed', 'Failed to delete user');
    }
  }, [userManagement, showSuccess, showError]);

  const handleToggleUserStatus = useCallback(async (userId: string, currentStatus: boolean) => {
    try {
      await userManagement.updateUser(userId, { isActive: !currentStatus });
      showSuccess('Status Updated', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      showError('Status Update Failed', 'Failed to update user status');
    }
  }, [userManagement, showSuccess, showError]);

  const resetForm = () => {
    setNewUserForm({
      firstName: '',
      lastName: '',
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      phone: ''
    });
  };

  if (userManagement.isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div>Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Master User Management</span>
            <Button 
              onClick={() => setIsAddingUser(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Add User Form */}
            {isAddingUser && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={newUserForm.firstName}
                        onChange={(e) => setNewUserForm(prev => normalizeMasterFormState({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={newUserForm.lastName}
                        onChange={(e) => setNewUserForm(prev => normalizeMasterFormState({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Input
                        id="role"
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Enter role"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddUser} disabled={userManagement.isLoading}>
                      Create User
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingUser(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Phone</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                        {searchTerm ? 'No users found matching your search' : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user: MasterUser) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">{user.email}</td>
                        <td className="border border-gray-200 px-4 py-2">{user.role}</td>
                        <td className="border border-gray-200 px-4 py-2">{user.phone || 'N/A'}</td>
                        <td className="border border-gray-200 px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
