
import { useMemo } from 'react';

interface User {
  id: string;
  email: string;
  user_roles?: Array<{
    roles: {
      name: string;
      description: string | null;
    };
  }>;
}

export const useUserStatistics = (users: User[] | undefined) => {
  const userStats = useMemo(() => {
    if (!users) return { totalUsers: 0, usersWithRoles: 0, usersWithoutRoles: 0 };
    
    const totalUsers = users.length;
    const usersWithRoles = users.filter(user => user.user_roles && user.user_roles.length > 0).length;
    const usersWithoutRoles = totalUsers - usersWithRoles;
    
    return { totalUsers, usersWithRoles, usersWithoutRoles };
  }, [users]);

  return userStats;
};
