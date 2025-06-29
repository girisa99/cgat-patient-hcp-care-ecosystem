
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Eye, Clock } from 'lucide-react';
import { UserWithRoles } from '@/types/userManagement';

interface UserAccessSummaryProps {
  user: UserWithRoles;
}

const UserAccessSummary: React.FC<UserAccessSummaryProps> = ({ user }) => {
  const getUserRoles = () => {
    if (!user.user_roles || user.user_roles.length === 0) {
      return [];
    }
    return user.user_roles.map(ur => ur.roles.name);
  };

  const roles = getUserRoles();

  return (
    <div className="space-y-2">
      {/* Roles Display */}
      <div className="flex items-center gap-2">
        <Users className="h-3 w-3 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">Roles:</span>
        <div className="flex flex-wrap gap-1">
          {roles.length > 0 ? (
            roles.map((role, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs text-gray-500">
              No Role
            </Badge>
          )}
        </div>
      </div>

      {/* Facility Access */}
      <div className="flex items-center gap-2">
        <Shield className="h-3 w-3 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">Facility:</span>
        {user.facilities ? (
          <Badge variant="outline" className="text-xs">
            {user.facilities.name}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-gray-400">
            No Facility
          </Badge>
        )}
      </div>

      {/* Account Status */}
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">Status:</span>
        <div className="flex items-center gap-1">
          {user.email_confirmed_at ? (
            <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-300">
              Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
              Pending
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccessSummary;
