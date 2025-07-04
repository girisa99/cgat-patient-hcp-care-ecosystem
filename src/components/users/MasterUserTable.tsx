
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { useMasterUserManagement, type MasterUser } from '@/hooks/useMasterUserManagement';
import { MasterUserForm } from './MasterUserForm';
import type { MasterUserFormState } from '@/types/masterFormState';

export const MasterUserTable: React.FC = () => {
  const userManagement = useMasterUserManagement();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return userManagement.users;
    return userManagement.searchUsers(searchTerm);
  }, [userManagement.users, searchTerm, userManagement.searchUsers]);

  const handleAddUser = async (userData: MasterUserFormState) => {
    await userManagement.createUser(userData);
    setIsAddingUser(false);
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await userManagement.updateUser(userId, { isActive: !currentStatus });
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await userManagement.deleteUser(userId);
    }
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
              <MasterUserForm
                onSubmit={handleAddUser}
                onCancel={() => setIsAddingUser(false)}
                isSubmitting={userManagement.isCreatingUser}
              />
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

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userManagement.totalUsers}
                  </div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userManagement.activeUsers}
                  </div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {userManagement.inactiveUsers}
                  </div>
                  <div className="text-sm text-gray-600">Inactive Users</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
