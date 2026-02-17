import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, Eye, Edit, MoreHorizontal, Shield, UserX, Package, Building2, Mail, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserWithRoles } from '@/types/userManagement';

interface UserRowProps {
  user: UserWithRoles;
  isSelected: boolean;
  onSelectUser: (userId: string, checked: boolean) => void;
  onViewUser: (user: UserWithRoles) => void;
  onEditUser: (user: UserWithRoles) => void;
  onAssignRole: (user: UserWithRoles) => void;
  onRemoveRole: (user: UserWithRoles) => void;
  onAssignModule: (user: UserWithRoles) => void;
  onAssignFacility: (user: UserWithRoles) => void;
  onResendEmail: (user: UserWithRoles) => void;
  onDeactivateUser: (user: UserWithRoles) => void;
  onDeleteUser: (user: UserWithRoles) => void;
}

export const UserRow: React.FC<UserRowProps> = React.memo(({
  user,
  isSelected,
  onSelectUser,
  onViewUser,
  onEditUser,
  onAssignRole,
  onRemoveRole,
  onAssignModule,
  onAssignFacility,
  onResendEmail,
  onDeactivateUser,
  onDeleteUser
}) => {
  const roles = user.user_roles?.map((ur) => ur.role?.name).filter(Boolean) || [];
  const verified = Boolean(user.email_confirmed_at);

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelectUser(user.id, !!checked)}
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
          <Button variant="ghost" size="sm" onClick={() => onViewUser(user)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEditUser(user)}>
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onAssignRole(user)}>
                <Shield className="h-4 w-4 mr-2" />
                Assign Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRemoveRole(user)}>
                <UserX className="h-4 w-4 mr-2" />
                Remove Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignModule(user)}>
                <Package className="h-4 w-4 mr-2" />
                Assign Module
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignFacility(user)}>
                <Building2 className="h-4 w-4 mr-2" />
                Assign Facility
              </DropdownMenuItem>
              {!verified && (
                <DropdownMenuItem onClick={() => onResendEmail(user)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDeactivateUser(user)} className="text-orange-600">
                <UserX className="h-4 w-4 mr-2" />
                Deactivate User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteUser(user)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

UserRow.displayName = 'UserRow';