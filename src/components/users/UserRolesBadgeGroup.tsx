
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserWithRoles } from '@/types/userManagement';

interface UserRolesBadgeGroupProps {
  user: UserWithRoles;
  variant?: 'default' | 'compact';
}

const UserRolesBadgeGroup: React.FC<UserRolesBadgeGroupProps> = ({ 
  user, 
  variant = 'default' 
}) => {
  const getUserRoles = () => {
    if (!user.user_roles || user.user_roles.length === 0) {
      return [];
    }
    return user.user_roles.map(ur => ({
      name: ur.roles.name,
      description: ur.roles.description
    }));
  };

  const roles = getUserRoles();

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {roles.length > 0 ? (
          <>
            <Badge variant="secondary" className="text-xs">
              {roles[0].name}
            </Badge>
            {roles.length > 1 && (
              <Badge variant="outline" className="text-xs">
                +{roles.length - 1} more
              </Badge>
            )}
          </>
        ) : (
          <Badge variant="outline" className="text-xs text-gray-500">
            No Role
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.length > 0 ? (
        roles.map((role, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="text-xs"
            title={role.description || `${role.name} role`}
          >
            {role.name}
          </Badge>
        ))
      ) : (
        <Badge variant="outline" className="text-xs text-gray-500">
          No Role
        </Badge>
      )}
    </div>
  );
};

export default UserRolesBadgeGroup;
