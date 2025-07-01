
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, UserPlus, Building, Minus, Key, Shield, Mail, UserX, Eye } from 'lucide-react';

interface UserActionsProps {
  user: any;
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

const UserActions: React.FC<UserActionsProps> = ({
  user,
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
  const userName = user.first_name || user.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.email;

  const handleEditUser = () => {
    console.log('✏️ Edit button clicked for user:', user.id, userName);
    console.log('👤 User data being passed to edit dialog:', user);
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

  const handleResendVerification = () => {
    if (onResendVerification) {
      console.log('📧 Resending verification email for user:', user.email, userName);
      onResendVerification(user.email, userName);
    }
  };

  const handleDeactivateUser = () => {
    if (onDeactivateUser) {
      console.log('🚫 Opening deactivation dialog for user:', user.id, userName);
      onDeactivateUser(user.id, userName, user.email);
    }
  };

  const handleViewModules = () => {
    if (onViewModules) {
      console.log('👁️ Opening module access view for user:', user.id, userName);
      onViewModules(user.id, userName);
    }
  };

  // Check if user needs email verification (not confirmed)
  const needsEmailVerification = !user.email_confirmed_at && user.email;
  const hasRoles = user.user_roles && user.user_roles.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Primary Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditUser}
          title="Edit User"
          className="h-8 px-3 text-xs hover:bg-blue-50 border-blue-200"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleAssignRole}
          title="Assign Role"
          className="h-8 px-3 text-xs hover:bg-green-50 border-green-200"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Role
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAssignFacility}
          title="Assign Facility"
          className="h-8 px-3 text-xs hover:bg-purple-50 border-purple-200"
        >
          <Building className="h-3 w-3 mr-1" />
          Facility
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleManagePermissions}
          title="Manage Permissions"
          className="h-8 px-3 text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          <Key className="h-3 w-3 mr-1" />
          Permissions
        </Button>

        {onViewModules && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewModules}
            title="View Module Access"
            className="h-8 px-3 text-xs text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <Eye className="h-3 w-3 mr-1" />
            Modules
          </Button>
        )}

        {onAssignModule && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssignModule}
            title="Assign Module"
            className="h-8 px-3 text-xs text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <Shield className="h-3 w-3 mr-1" />
            Assign Module
          </Button>
        )}
      </div>

      {/* Conditional Actions */}
      <div className="flex items-center gap-1">
        {hasRoles && onRemoveRole && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveRole}
            title="Remove Role"
            className="h-8 px-3 text-xs text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <Minus className="h-3 w-3 mr-1" />
            Remove Role
          </Button>
        )}

        {needsEmailVerification && onResendVerification && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            title="Resend Verification Email"
            className="h-8 px-3 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            <Mail className="h-3 w-3 mr-1" />
            Resend Email
          </Button>
        )}

        {onDeactivateUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeactivateUser}
            title="Deactivate User"
            className="h-8 px-3 text-xs text-red-600 border-red-300 hover:bg-red-50"
          >
            <UserX className="h-3 w-3 mr-1" />
            Deactivate
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserActions;
