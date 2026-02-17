
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
  created_at?: string;
}

interface UserStats {
  total: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  recent: number;
}

export const useUserStatistics = (users: User[] | undefined): UserStats => {
  const userStats = useMemo(() => {
    if (!users) return { 
      total: 0, 
      byRole: {}, 
      byStatus: { active: 0, inactive: 0 }, 
      recent: 0 
    };
    
    const total = users.length;
    
    // Calculate role distribution
    const byRole: Record<string, number> = {};
    const usersWithRoles = users.filter(user => user.user_roles && user.user_roles.length > 0);
    
    usersWithRoles.forEach(user => {
      user.user_roles?.forEach(userRole => {
        const roleName = userRole.roles.name;
        byRole[roleName] = (byRole[roleName] || 0) + 1;
      });
    });
    
    // Add users without roles
    const usersWithoutRoles = total - usersWithRoles.length;
    if (usersWithoutRoles > 0) {
      byRole['no_role'] = usersWithoutRoles;
    }
    
    // Calculate status distribution (simplified)
    const byStatus = {
      active: total, // Assuming all users are active for now
      inactive: 0
    };
    
    // Calculate recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recent = users.filter(user => {
      if (!user.created_at) return false;
      const userCreatedAt = new Date(user.created_at);
      return userCreatedAt >= sevenDaysAgo;
    }).length;
    
    return { 
      total, 
      byRole, 
      byStatus, 
      recent 
    };
  }, [users]);

  return userStats;
};
