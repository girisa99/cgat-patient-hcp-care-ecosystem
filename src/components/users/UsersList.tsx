
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Filter } from 'lucide-react';
import { useConsolidatedUsers } from '@/hooks/useConsolidatedUsers';
import UserActions from './UserActions';
import UserRolesBadgeGroup from './UserRolesBadgeGroup';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UsersListProps {
  onEditUser: (user: any) => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void; 
  onAssignFacility: (userId: string) => void;
  onManagePermissions: (userId: string, userName: string) => void;
  onAssignModule?: (userId: string, userName: string) => void;
  onResendVerification?: (userEmail: string, userName: string) => void;
  onDeactivateUser?: (userId: string, userName: string, userEmail: string) => void;
  onViewModules?: (userId: string, userName: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  onEditUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onManagePermissions,
  onAssignModule,
  onResendVerification,
  onDeactivateUser,
  onViewModules
}) => {
  const { users, isLoading, searchUsers } = useConsolidatedUsers();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = searchUsers(searchQuery);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : 'No name'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      {!user.email_confirmed_at && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 w-fit">
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserRolesBadgeGroup user={user} />
                  </TableCell>
                  <TableCell>
                    {user.facilities ? (
                      <Badge variant="outline" className="text-xs">
                        {user.facilities.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">No facility</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.email_confirmed_at ? "default" : "secondary"}
                      className={user.email_confirmed_at ? "bg-green-100 text-green-800" : ""}
                    >
                      {user.email_confirmed_at ? 'Active' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions
                      user={user}
                      onEditUser={onEditUser}
                      onAssignRole={onAssignRole}
                      onRemoveRole={onRemoveRole}
                      onAssignFacility={onAssignFacility}
                      onManagePermissions={onManagePermissions}
                      onAssignModule={onAssignModule}
                      onResendVerification={onResendVerification}
                      onDeactivateUser={onDeactivateUser}
                      onViewModules={onViewModules}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
