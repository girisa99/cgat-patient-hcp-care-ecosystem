
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, UserPlus, Building, Minus, Key, Shield, Mail, UserX, Eye, CheckCircle } from 'lucide-react';
import { isVerifiedEmail } from '@/config/userManagement';

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

  // Use centralized verification check
  const isEmailVerified = Boolean(user.email_confirmed_at) || 
    (user.email ? isVerifiedEmail(user.email) : false);

  const hasRoles = user.user_roles && user.user_roles.length > 0;

  return (
    <div className="flex items-center gap-1">
      {/* Core actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEditUser(user)}
        title="Edit User"
        className="h-8 w-8 p-0 hover:bg-blue-50 border-blue-200"
      >
        <Edit className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAssignRole(user.id)}
        title="Assign Role"
        className="h-8 w-8 p-0 hover:bg-green-50 border-green-200"
      >
        <UserPlus className="h-3 w-3" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onAssignFacility(user.id)}
        title="Assign Facility"
        className="h-8 w-8 p-0 hover:bg-purple-50 border-purple-200"
      >
        <Building className="h-3 w-3" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onManagePermissions(user.id, userName)}
        title="Manage Permissions"
        className="h-8 w-8 p-0 text-blue-600 border-blue-300 hover:bg-blue-50"
      >
        <Key className="h-3 w-3" />
      </Button>

      {/* Conditional actions */}
      {onViewModules && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewModules(user.id, userName)}
          title="View Module Access"
          className="h-8 w-8 p-0 text-purple-600 border-purple-300 hover:bg-purple-50"
        >
          <Eye className="h-3 w-3" />
        </Button>
      )}

      {onAssignModule && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAssignModule(user.id, userName)}
          title="Assign Module"
          className="h-8 w-8 p-0 text-purple-600 border-purple-300 hover:bg-purple-50"
        >
          <Shield className="h-3 w-3" />
        </Button>
      )}

      {hasRoles && onRemoveRole && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveRole(user.id)}
          title="Remove Role"
          className="h-8 w-8 p-0 text-orange-600 border-orange-300 hover:bg-orange-50"
        >
          <Minus className="h-3 w-3" />
        </Button>
      )}

      {/* Email verification actions */}
      {!isEmailVerified && onResendVerification && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResendVerification(user.email, userName)}
          title="Resend Verification Email"
          className="h-8 w-8 p-0 text-amber-600 border-amber-300 hover:bg-amber-50"
        >
          <Mail className="h-3 w-3" />
        </Button>
      )}

      {isEmailVerified && (
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Email Verified"
          className="h-8 w-8 p-0 text-green-600 border-green-300 bg-green-50 cursor-default"
        >
          <CheckCircle className="h-3 w-3" />
        </Button>
      )}

      {onDeactivateUser && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeactivateUser(user.id, userName, user.email)}
          title="Deactivate User"
          className="h-8 w-8 p-0 text-red-600 border-red-300 hover:bg-red-50"
        >
          <UserX className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default UserActions;
