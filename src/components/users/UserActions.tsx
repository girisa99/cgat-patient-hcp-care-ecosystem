
/**
 * PRIMARY COMPONENT: UserActions
 * 
 * ⚠️  CANONICAL SOURCE OF TRUTH - DO NOT DUPLICATE ⚠️
 * 
 * This is the primary user actions component used for all user-related operations.
 * Provides consistent action buttons and handlers across the application.
 * 
 * USAGE LOCATIONS:
 * - src/components/users/UsersList.tsx (primary usage)
 * - Any component that needs user action buttons
 * 
 * FEATURES:
 * - Edit user functionality
 * - Role assignment/removal
 * - Facility assignment
 * - Permission management
 * - Module assignment
 * - Consistent styling and icons
 * 
 * MODIFICATIONS:
 * - Always update this file for user action changes
 * - Do not create alternative user action components
 * - Keep button styles consistent across all actions
 * 
 * LAST UPDATED: 2025-06-29
 * MAINTAINER: System Architecture Team
 */

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

  const handleEditUser = () => {
    console.log('✏️ Opening edit dialog for user:', user.id, userName);
    onEditUser(user);
  };

  const handleAssignRole = () => {
    console.log('👤 Opening role assignment for user:', user.id, userName);
    onAssignRole(user.id);
  };

  const handleRemoveRole = () => {
    if (onRemoveRole) {
      console.log('➖ Opening role removal for user:', user.id, userName);
      onRemoveRole(user.id);
    }
  };

  const handleAssignFacility = () => {
    console.log('🏢 Opening facility assignment for user:', user.id, userName);
    onAssignFacility(user.id);
  };

  const handleManagePermissions = () => {
    console.log('🔒 Opening permission management for user:', user.id, userName);
    onManagePermissions(user.id, userName);
  };

  const handleAssignModule = () => {
    if (onAssignModule) {
      console.log('📦 Opening module assignment for user:', user.id, userName);
      onAssignModule(user.id, userName);
    }
  };

  return (
    <div className="flex gap-1 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEditUser}
        title="Edit User"
        className="h-8 px-2"
      >
        <Edit className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleAssignRole}
        title="Assign Role"
        className="h-8 px-2"
      >
        <UserPlus className="h-3 w-3" />
      </Button>

      {onRemoveRole && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveRole}
          title="Remove Role"
          className="h-8 px-2"
        >
          <Minus className="h-3 w-3" />
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleAssignFacility}
        title="Assign Facility"
        className="h-8 px-2"
      >
        <Building className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleManagePermissions}
        title="Manage Permissions"
        className="h-8 px-2"
      >
        <Key className="h-3 w-3" />
      </Button>

      {onAssignModule && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAssignModule}
          title="Assign Module"
          className="h-8 px-2"
        >
          <Shield className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default UserActions;
