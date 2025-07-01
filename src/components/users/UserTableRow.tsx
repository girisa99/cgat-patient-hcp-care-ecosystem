
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserEmailStatus } from './UserEmailStatus';
import type { UserWithRoles } from '@/types/userManagement';

interface UserTableRowProps {
  user: UserWithRoles;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({ user }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          {user.phone && (
            <p className="text-sm text-gray-500">{user.phone}</p>
          )}
        </div>
        <UserEmailStatus user={user} />
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Roles:</span>
        {user.user_roles.length > 0 ? (
          user.user_roles.map((userRole, index) => (
            <Badge key={index} variant="outline">
              {userRole.roles.name}
            </Badge>
          ))
        ) : (
          <Badge variant="secondary">No roles assigned</Badge>
        )}
      </div>

      {user.facilities && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Facility:</span>
          <Badge variant="outline">
            {user.facilities.name} ({user.facilities.facility_type})
          </Badge>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Created: {new Date(user.created_at).toLocaleDateString()}
        {user.last_sign_in_at && (
          <span className="ml-4">
            Last sign in: {new Date(user.last_sign_in_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};
