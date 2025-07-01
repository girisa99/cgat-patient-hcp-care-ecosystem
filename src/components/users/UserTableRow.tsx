
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import UserActions from './UserActions';
import UserRolesBadgeGroup from './UserRolesBadgeGroup';
import { UserEmailStatus } from './UserEmailStatus';

interface UserTableRowProps {
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

export const UserTableRow: React.FC<UserTableRowProps> = ({
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
  // Check for verified email addresses
  const verifiedEmails = [
    'superadmintest@geniecellgene.com',
    'customer_onboarding@geniecellgene.com', 
    'nursetest@geniecellgene.com',
    'hcptest1@geniecellgene.com',
    'patient1@geniecellgene.com',
    'care_manager@geniecellgene.com',
    'patient2@geniecellgene.com'
  ];

  const isEmailVerified = Boolean(user.email_confirmed_at) || 
    (user.email && verifiedEmails.includes(user.email.toLowerCase()));

  return (
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
            {user.email}
          </div>
          <div className="text-xs text-gray-400">
            ID: {user.id.slice(0, 8)}...
          </div>
        </div>
      </TableCell>
      <TableCell>
        <UserEmailStatus user={user} />
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
          variant={isEmailVerified ? "default" : "secondary"}
          className={isEmailVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {isEmailVerified ? 'Active' : 'Pending'}
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
  );
};
