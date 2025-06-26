
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, UserPlus, Building, Minus, Key, Shield } from 'lucide-react';

interface UserActionsProps {
  user: any;
  onEditUser: (user: any) => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onManagePermissions: (userId: string, userName: string) => void;
  onAssignModule?: (userId: string, userName: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEditUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onManagePermissions,
  onAssignModule
}) => {
  const userName = user.first_name || user.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.email;

  const handleManagePermissions = () => {
    console.log('Opening permission management for user:', user.id, userName);
    onManagePermissions(user.id, userName);
  };

  const handleAssignModule = () => {
    if (onAssignModule) {
      console.log('Opening module assignment for user:', user.id, userName);
      onAssignModule(user.id, userName);
    }
  };

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
        onClick={handleManagePermissions}
        title="Manage Permissions"
        className="bg-blue-50 hover:bg-blue-100 border-blue-200"
      >
        <Key className="h-3 w-3" />
      </Button>

      {onAssignModule && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAssignModule}
          title="Assign Modules"
          className="bg-purple-50 hover:bg-purple-100 border-purple-200"
        >
          <Shield className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default UserActions;
