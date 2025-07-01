
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, UserPlus, Building, Shield, Mail, UserX } from 'lucide-react';
import { UserWithRoles } from '@/types/userManagement';

interface UsersListProps {
  users: any[];
  onEditUser: (user: any) => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onManagePermissions: (userId: string, userName: string) => void;
  onAssignModule: (userId: string, userName: string) => void;
  onResendVerification?: (userEmail: string, userName: string) => void;
  onDeactivateUser?: (userId: string, userName: string, userEmail: string) => void;
  onViewModules?: (userId: string, userName: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
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
  if (!users || users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No users found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
        const userRoles = user.user_roles || [];
        const userFacilities = user.facilities || null;
        
        return (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{userName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {userRoles.length > 0 ? (
                      userRoles.map((userRole: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {userRole.roles?.name || 'Unknown Role'}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">No roles assigned</Badge>
                    )}
                    
                    {userFacilities && (
                      <Badge variant="outline" className="text-blue-600">
                        {userFacilities.name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditUser(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => onAssignRole(user.id)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Role
                    </DropdownMenuItem>
                    
                    {onRemoveRole && userRoles.length > 0 && (
                      <DropdownMenuItem onClick={() => onRemoveRole(user.id)}>
                        <UserX className="h-4 w-4 mr-2" />
                        Remove Role
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={() => onAssignFacility(user.id)}>
                      <Building className="h-4 w-4 mr-2" />
                      Assign Facility
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => onManagePermissions(user.id, userName)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Permissions
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => onAssignModule(user.id, userName)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Assign Module
                    </DropdownMenuItem>
                    
                    {onViewModules && (
                      <DropdownMenuItem onClick={() => onViewModules(user.id, userName)}>
                        <Shield className="h-4 w-4 mr-2" />
                        View Modules
                      </DropdownMenuItem>
                    )}
                    
                    {onResendVerification && (
                      <DropdownMenuItem onClick={() => onResendVerification(user.email, userName)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Verification
                      </DropdownMenuItem>
                    )}
                    
                    {onDeactivateUser && (
                      <DropdownMenuItem onClick={() => onDeactivateUser(user.id, userName, user.email)}>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UsersList;
