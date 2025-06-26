
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, UserPlus, Building, Minus, Key } from 'lucide-react';

interface UserActionsProps {
  user: any;
  onEditUser: (user: any) => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onManagePermissions: (userId: string, userName: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEditUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onManagePermissions
}) => {
  const userName = user.first_name || user.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.email;

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEditUser(user)}
        title="Edit User"
      >
        <Edit className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAssignRole(user.id)}
        title="Assign Role"
      >
        <UserPlus className="h-3 w-3" />
      </Button>
      
      {onRemoveRole && user.user_roles && user.user_roles.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveRole(user.id)}
          title="Remove Role"
        >
          <Minus className="h-3 w-3" />
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAssignFacility(user.id)}
        title="Assign Facility"
      >
        <Building className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onManagePermissions(user.id, userName)}
        title="Manage Permissions"
      >
        <Key className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default UserActions;
