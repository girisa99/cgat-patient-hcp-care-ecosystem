
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Settings, RefreshCw } from 'lucide-react';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';

export const MasterUserTable: React.FC = () => {
  const { 
    users, 
    isLoading, 
    getUserStats,
    fetchUsers
  } = useMasterUserManagement();
  
  const stats = getUserStats();

  console.log('👑 Master User Table - Authority Source');

  const handleRefresh = () => {
    fetchUsers();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Master User Table ({users.length} users)
          </div>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.adminCount}</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.patientCount}</div>
              <div className="text-sm text-muted-foreground">Patients</div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
              <Button className="mt-4">
                <UserPlus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex gap-1 mt-1">
                      {user.user_roles.map((ur, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ur.role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
