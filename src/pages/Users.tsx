
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users as UsersIcon, UserPlus, Settings, RefreshCw, Search, Shield, Building2 } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';

const Users: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, userRoles } = useMasterAuth();
  const { 
    users, 
    isLoading, 
    error, 
    refreshData, 
    searchUsers,
    stats,
    createUser,
    isCreatingUser
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  console.log('👥 Users Page - Master Data Integration');

  const handleRefresh = () => {
    refreshData();
  };

  const handleCreateUser = () => {
    createUser({
      firstName: `Test User ${Date.now()}`,
      lastName: 'Generated',
      email: `test${Date.now()}@example.com`,
      phone: '555-0123'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600">Error loading users: {error.message}</div>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = searchUsers(searchQuery);

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
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleCreateUser}
                size="sm"
                disabled={isCreatingUser}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {isCreatingUser ? 'Creating...' : 'Add User'}
              </Button>
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

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        {user.facilities && (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex gap-1 mt-1">
                        {user.user_roles.map((ur, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {ur.role.name}
                          </Badge>
                        ))}
                        {user.user_roles.length === 0 && (
                          <Badge variant="secondary" className="text-xs">No roles</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Status */}
            {isCreatingUser && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Creating user...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
